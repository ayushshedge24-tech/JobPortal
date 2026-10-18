const User = require("../../models/User");
const CandidateProfile = require("../../models/CandidateProfile");
const CompanyProfile = require("../../models/CompanyProfile");
const Job = require("../../models/Job");
const Application = require("../../models/Application");
const Resume = require("../../models/Resume");
const { logAuditEvent } = require("./adminAuditService");
const { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, SUPPORTED_ROLES } = require("./adminConstants");

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * List all users with filtering, search, pagination, deterministic sorting
 */
async function getUsers(query = {}) {
  const {
    q,
    role,
    isActive,
    sort = "newest",
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (q && q.trim()) {
    const kw = escapeRegex(q.trim());
    filter.$or = [
      { name: { $regex: kw, $options: "i" } },
      { email: { $regex: kw, $options: "i" } },
      { location: { $regex: kw, $options: "i" } },
    ];
  }

  if (role && role !== "ALL") {
    if (role === "JOB_SEEKER") {
      filter.$or = [{ role: "JOB_SEEKER" }, { role: "jobseeker" }];
    } else if (role === "RECRUITER") {
      filter.$or = [{ role: "RECRUITER" }, { role: "employer" }];
    } else {
      filter.role = role;
    }
  }

  if (isActive !== undefined && isActive !== "ALL") {
    filter.isActive = isActive === "true" || isActive === true;
  }

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };
  if (sort === "name") sortOption = { name: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash -password")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  const sanitizedUsers = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role === "jobseeker" ? "JOB_SEEKER" : u.role === "employer" ? "RECRUITER" : u.role,
    isActive: u.isActive !== false,
    phone: u.phone || "",
    location: u.location || "",
    avatar: u.avatar || "",
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  return {
    users: sanitizedUsers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Get single user details with role-specific aggregates
 */
async function getUserById(userId) {
  const user = await User.findById(userId).select("-passwordHash -password").lean();
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const role = user.role === "jobseeker" ? "JOB_SEEKER" : user.role === "employer" ? "RECRUITER" : user.role;

  let candidateData = null;
  let recruiterData = null;

  if (role === "JOB_SEEKER") {
    const [profile, applicationsCount, resumesCount] = await Promise.all([
      CandidateProfile.findOne({ user: userId }).lean(),
      Application.countDocuments({ applicant: userId }),
      Resume.countDocuments({ user: userId }),
    ]);
    candidateData = {
      profile,
      applicationsCount,
      resumesCount,
    };
  } else if (role === "RECRUITER") {
    const [companyProfile, jobsCount, applicationsReceived] = await Promise.all([
      CompanyProfile.findOne({ user: userId }).lean(),
      Job.countDocuments({ postedBy: userId }),
      (async () => {
        const jobs = await Job.find({ postedBy: userId }).select("_id").lean();
        const ids = jobs.map((j) => j._id);
        return Application.countDocuments({ job: { $in: ids } });
      })(),
    ]);
    recruiterData = {
      companyProfile,
      jobsCount,
      applicationsReceived,
    };
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role,
      isActive: user.isActive !== false,
      phone: user.phone || "",
      location: user.location || "",
      avatar: user.avatar || "",
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    candidateData,
    recruiterData,
  };
}

/**
 * Update user role with safety guard against removing the last administrator
 */
async function updateUserRole(userId, newRole, adminUser) {
  if (!SUPPORTED_ROLES.includes(newRole)) {
    const error = new Error(`Invalid role. Allowed: ${SUPPORTED_ROLES.join(", ")}`);
    error.status = 400;
    error.code = "INVALID_ROLE";
    throw error;
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    const error = new Error("User not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const oldRole = targetUser.role === "jobseeker" ? "JOB_SEEKER" : targetUser.role === "employer" ? "RECRUITER" : targetUser.role;

  // Safeguard: Do not demote if target is an ADMIN and there is only 1 admin left
  if (oldRole === "ADMIN" && newRole !== "ADMIN") {
    const adminCount = await User.countDocuments({ role: "ADMIN", isActive: true });
    if (adminCount <= 1) {
      const error = new Error("Safety constraint: Cannot demote the last active Administrator.");
      error.status = 400;
      error.code = "ADMIN_DEMOTION_FORBIDDEN";
      throw error;
    }
  }

  targetUser.role = newRole;
  await targetUser.save();

  // Audit log
  await logAuditEvent({
    actor: adminUser._id,
    actorName: adminUser.name,
    actorEmail: adminUser.email,
    actorRole: "ADMIN",
    action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: targetUser._id,
    summary: `Changed role of ${targetUser.name} (${targetUser.email}) from ${oldRole} to ${newRole}`,
    metadata: {
      userId: targetUser._id,
      userEmail: targetUser.email,
      oldRole,
      newRole,
    },
  });

  return {
    _id: targetUser._id,
    name: targetUser.name,
    email: targetUser.email,
    role: newRole,
    isActive: targetUser.isActive !== false,
  };
}

/**
 * Update user active status (deactivate / reactivate) with safety guard
 */
async function updateUserStatus(userId, isActive, reason = "", adminUser) {
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    const error = new Error("User not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const role = targetUser.role === "jobseeker" ? "JOB_SEEKER" : targetUser.role === "employer" ? "RECRUITER" : targetUser.role;

  // Safeguard: Cannot deactivate the last admin
  if (role === "ADMIN" && !isActive) {
    const adminCount = await User.countDocuments({ role: "ADMIN", isActive: true });
    if (adminCount <= 1) {
      const error = new Error("Safety constraint: Cannot deactivate the last active Administrator.");
      error.status = 400;
      error.code = "ADMIN_DEACTIVATION_FORBIDDEN";
      throw error;
    }
  }

  targetUser.isActive = Boolean(isActive);
  await targetUser.save();

  // Audit log
  await logAuditEvent({
    actor: adminUser._id,
    actorName: adminUser.name,
    actorEmail: adminUser.email,
    actorRole: "ADMIN",
    action: AUDIT_ACTIONS.USER_STATUS_CHANGED,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: targetUser._id,
    summary: `${isActive ? "Activated" : "Deactivated"} account for ${targetUser.name} (${targetUser.email})`,
    metadata: {
      userId: targetUser._id,
      userEmail: targetUser.email,
      isActive: Boolean(isActive),
      reason,
    },
  });

  return {
    _id: targetUser._id,
    name: targetUser.name,
    email: targetUser.email,
    role,
    isActive: targetUser.isActive,
  };
}

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};
