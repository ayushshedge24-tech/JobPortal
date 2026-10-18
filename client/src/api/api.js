const API_BASE_URL = "http://localhost:5000/api";

/**
 * Centralized Authentication & API Header Utility
 * Constructs request headers including Content-Type and Authorization Bearer token.
 * Falls back to stored localStorage access token if not explicitly supplied.
 */
export const getAuthHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };
  const resolvedToken =
    token ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("jobportal_access_token")
      : null);
  if (resolvedToken) {
    headers["Authorization"] = `Bearer ${resolvedToken}`;
  }
  return headers;
};

/**
 * Centralized HTTP Response Handler
 * Parses JSON or text response and unwraps error messages gracefully.
 */
export const handleResponse = async (response) => {
  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === "object" && (data.error?.message || data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    error.isNetworkError = false;
    throw error;
  }

  return data;
};

/**
 * Centralized Authenticated Fetch Utility
 * Injects Authorization headers and credentials: "include".
 * Handles 401 Unauthorized via transparent refresh attempt,
 * retrying the request if refreshed or purging client state on failure.
 */
export const apiFetch = async (url, options = {}, explicitToken) => {
  const token =
    explicitToken ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("jobportal_access_token")
      : null);

  const headers = {
    ...getAuthHeaders(token),
    ...(options.headers || {}),
  };

  const reqOptions = {
    ...options,
    headers,
    credentials: "include",
  };

  let res;
  try {
    res = await fetch(url, reqOptions);
  } catch (netErr) {
    const error = new Error(netErr.message || "Network error. Please verify server connectivity.");
    error.isNetworkError = true;
    throw error;
  }

  // Intercept 401 on protected resources (not login, register, or refresh itself)
  if (
    res.status === 401 &&
    !url.includes("/auth/login") &&
    !url.includes("/auth/register") &&
    !url.includes("/auth/refresh")
  ) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData.accessToken;
        if (newToken) {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("jobportal_access_token", newToken);
            if (refreshData.user) {
              localStorage.setItem("jobportal_auth_user", JSON.stringify(refreshData.user));
            }
          }
          reqOptions.headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(url, reqOptions);
          return await handleResponse(res);
        }
      }
    } catch {
      // Refresh failed
    }

    // Refresh was rejected or failed: clear stale client authentication
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("jobportal_access_token");
      localStorage.removeItem("jobportal_auth_user");
      localStorage.removeItem("jobportal_candidate_profile_in");
      localStorage.removeItem("jobportal_local_resumes_in");
      localStorage.removeItem("jobportal_local_apps_in");
      localStorage.removeItem("jobportal_saved_jobs");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("jobportal_auth_expired"));
    }
  }

  return await handleResponse(res);
};

export const api = {
  // Alias for getCandidateResume
  getResumeById: async (id, token) => {
    return api.getCandidateResume(id, token);
  },

  // 1. Auth: User Registration
  async registerUser(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    return await handleResponse(res);
  },

  // 2. Auth: User Login
  async loginUser(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });
    return await handleResponse(res);
  },

  // 3. Auth: Get Current Profile
  async getMe(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(token),
        credentials: "include",
      });
      const data = await handleResponse(res);
      return data?.user || data;
    } catch {
      return null;
    }
  },

  // 4. Auth: Refresh Token
  async refreshSession() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return await handleResponse(res);
    } catch {
      return null;
    }
  },

  // 5. Auth: Logout
  async logoutUser() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      return await handleResponse(res);
    } catch {
      return null;
    }
  },

  // 6. Get all jobs from MongoDB
  async getJobs(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "All") {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/jobs${queryString}`, {
      credentials: "include",
    });
    return await handleResponse(res);
  },

  // 7. Get single job by ID
  async getJobById(id) {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      credentials: "include",
    });
    return await handleResponse(res);
  },

  // 8. Post a new job
  async createJob(jobData, token) {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: getAuthHeaders(token),
      credentials: "include",
      body: JSON.stringify(jobData),
    });
    return await handleResponse(res);
  },

  // 9. Get all applications
  async getApplications(token) {
    return await apiFetch(`${API_BASE_URL}/applications`, {}, token);
  },

  // 10. Submit an application
  async applyJob(applicationData, token) {
    return await apiFetch(
      `${API_BASE_URL}/applications`,
      {
        method: "POST",
        body: JSON.stringify(applicationData),
      },
      token
    );
  },

  // 11. Get candidate profile
  async getCandidateProfile(token) {
    const data = await apiFetch(`${API_BASE_URL}/candidate/profile`, {}, token);
    return data?.profile || data;
  },

  // 12. Update candidate profile
  async updateCandidateProfile(profileData, token) {
    return await apiFetch(
      `${API_BASE_URL}/candidate/profile`,
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      },
      token
    );
  },

  // 13. Get candidate resumes
  async getCandidateResumes(token) {
    const data = await apiFetch(`${API_BASE_URL}/candidate/resumes`, {}, token);
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  },

  // 14. Get single candidate resume by ID
  async getCandidateResume(id, token) {
    const data = await apiFetch(`${API_BASE_URL}/candidate/resumes/${id}`, {}, token);
    return data?.data || data;
  },

  // 15. Create candidate resume
  async createCandidateResume(resumeData, token) {
    return await apiFetch(
      `${API_BASE_URL}/candidate/resumes`,
      {
        method: "POST",
        body: JSON.stringify(resumeData),
      },
      token
    );
  },

  // 16. Update candidate resume metadata
  async updateCandidateResume(id, resumeData, token) {
    return await apiFetch(
      `${API_BASE_URL}/candidate/resumes/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(resumeData),
      },
      token
    );
  },

  // 17. Delete candidate resume
  async deleteCandidateResume(id, token) {
    return await apiFetch(
      `${API_BASE_URL}/candidate/resumes/${id}`,
      {
        method: "DELETE",
      },
      token
    );
  },

  // 18. Duplicate candidate resume
  async duplicateCandidateResume(id, token) {
    const res = await fetch(`${API_BASE_URL}/candidate/resumes/${id}/duplicate`, {
      method: "POST",
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    return await handleResponse(res);
  },

  // 19. Set primary candidate resume
  async setPrimaryCandidateResume(id, token) {
    const res = await fetch(`${API_BASE_URL}/candidate/resumes/${id}/primary`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    return await handleResponse(res);
  },

  // 20. Update candidate resume content
  async updateCandidateResumeContent(id, content, token) {
    const res = await fetch(`${API_BASE_URL}/candidate/resumes/${id}/content`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    return await handleResponse(res);
  },

  // 21. Update candidate resume template
  async updateCandidateResumeTemplate(id, template, token) {
    const res = await fetch(`${API_BASE_URL}/candidate/resumes/${id}/template`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      credentials: "include",
      body: JSON.stringify({ template }),
    });
    return await handleResponse(res);
  },

  // 22. Import candidate profile snapshot into resume
  async importCandidateProfileIntoResume(id, token) {
    const res = await fetch(`${API_BASE_URL}/candidate/resumes/${id}/import-profile`, {
      method: "POST",
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    return await handleResponse(res);
  },

  // 23. Analyze Resume
  async analyzeResume(id, token) {
    const res = await fetch(`${API_BASE_URL}/candidate/resumes/${id}/analyze`, {
      method: "GET",
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    return await handleResponse(res);
  },

  // ==========================================
  // Phase 4F: Skill Intelligence APIs
  // ==========================================
  getCandidateSkills: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidate/skills`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      if (err.isNetworkError || err.status === 404 || err.status === 500) {
        try {
          const resumesCached = localStorage.getItem("jobportal_local_resumes_in");
          if (resumesCached) {
            const list = JSON.parse(resumesCached);
            const primary = list.find((r) => r.isPrimary) || list[0];
            if (primary) {
              return await api.getResumeSkills(primary._id, token);
            }
          }
        } catch {}
      }
      throw err;
    }
  },

  getResumeSkills: async (resumeId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidate/resumes/${resumeId}/skills`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      if (err.isNetworkError || err.status === 404 || err.status === 500) {
        try {
          const resumesCached = localStorage.getItem("jobportal_local_resumes_in");
          if (resumesCached) {
            const list = JSON.parse(resumesCached);
            const found = list.find((r) => r._id === resumeId);
            if (found) {
              const rawSkills = Array.isArray(found.content?.skills) ? found.content.skills : [];
              const skills = rawSkills.map((s, idx) => ({
                key: (s.name || `skill-${idx}`).toLowerCase().replace(/\s+/g, "-"),
                name: s.name || `Skill ${idx + 1}`,
                category: s.category || "OTHER",
                level: s.level || "NOT_SPECIFIED",
                sources: ["EXPLICIT_SKILL"],
                evidenceCount: 1,
                isExplicit: true,
                normalized: true,
                aliasMatched: false,
                originalNames: [s.name],
                evidence: [{ source: "EXPLICIT_SKILL", text: `Declared: "${s.name}"` }],
                relatedSkills: [],
              }));

              const categories = {};
              skills.forEach((sk) => {
                if (!categories[sk.category]) categories[sk.category] = [];
                categories[sk.category].push(sk);
              });

              return {
                success: true,
                message: "Skills retrieved (Local Mode)",
                data: {
                  version: "1.0.0",
                  candidateId: null,
                  resumeId: found._id,
                  resumeTitle: found.title || "Resume",
                  generatedAt: new Date().toISOString(),
                  skills,
                  explicitSkills: skills,
                  mentionedSkills: [],
                  categories,
                  aliasesDetected: [],
                  metrics: {
                    totalSkills: skills.length,
                    explicitSkillsCount: skills.length,
                    mentionedSkillsCount: 0,
                    declaredLevelsCount: skills.filter((s) => s.level && s.level !== "NOT_SPECIFIED").length,
                    unspecifiedLevelsCount: skills.filter((s) => !s.level || s.level === "NOT_SPECIFIED").length,
                    categoriesRepresented: Object.keys(categories).length,
                  },
                },
              };
            }
          }
        } catch {}
      }
      throw err;
    }
  },

  getResumeSkillGap: async (resumeId, jobId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidate/resumes/${resumeId}/skills/gap/${jobId}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  // ==========================================
  // Phase 4G: Explainable Job Matching API
  // ==========================================
  getJobMatch: async (jobId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidate/jobs/${jobId}/match`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  // ==========================================
  // Phase 4H: Candidate Career Intelligence API
  // ==========================================
  getCareerIntelligence: async (token) => {
    return await apiFetch(`${API_BASE_URL}/candidate/career-intelligence`, {}, token);
  },

  // ==========================================
  // Phase 4I: Deterministic Job Discovery API
  // ==========================================
  getRecommendedJobs: async (params = {}, token) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await apiFetch(`${API_BASE_URL}/candidate/jobs/recommended${queryString}`, {}, token);
  },

  // ==========================================
  // Phase 4J: Saved Jobs & Pipeline API
  // ==========================================
  saveJob: async (jobId, token) => {
    return await apiFetch(`${API_BASE_URL}/candidate/saved-jobs/${jobId}`, { method: "POST" }, token);
  },

  unsaveJob: async (jobId, token) => {
    return await apiFetch(`${API_BASE_URL}/candidate/saved-jobs/${jobId}`, { method: "DELETE" }, token);
  },

  getSavedJobs: async (params = {}, token) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await apiFetch(`${API_BASE_URL}/candidate/saved-jobs${queryString}`, {}, token);
  },

  getSavedJobStatus: async (jobId, token) => {
    return await apiFetch(`${API_BASE_URL}/candidate/saved-jobs/${jobId}/status`, {}, token);
  },

  getCandidateApplications: async (params = {}, token) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await apiFetch(`${API_BASE_URL}/candidate/applications${queryString}`, {}, token);
  },

  getCandidateApplicationById: async (id, token) => {
    return await apiFetch(`${API_BASE_URL}/candidate/applications/${id}`, {}, token);
  },

  withdrawApplication: async (id, token) => {
    return await apiFetch(`${API_BASE_URL}/candidate/applications/${id}/withdraw`, { method: "PATCH" }, token);
  },

  // ==========================================
  // Phase 4K: Candidate Notifications API
  // ==========================================
  getNotifications: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/candidate/notifications${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getUnreadNotificationCount: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidate/notifications/unread-count`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  markNotificationAsRead: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidate/notifications/${id}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  markAllNotificationsAsRead: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidate/notifications/read-all`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  // ==========================================
  // PHASE 4L: RECRUITER WORKSPACE & ATS APIS
  // ==========================================

  getRecruiterDashboard: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/dashboard`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getRecruiterJobs: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getRecruiterJobById: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${id}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  createRecruiterJob: async (data, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  updateRecruiterJob: async (id, data, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  updateRecruiterJobStatus: async (id, status, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  deleteRecruiterJob: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getJobApplications: async (jobId, params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${jobId}/applications${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAllRecruiterApplications: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/recruiter/applications${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getRecruiterApplicationById: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/applications/${id}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  updateRecruiterApplicationStatus: async (id, status, note, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/applications/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status, note }),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getCompanyProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/company`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  updateCompanyProfile: async (data, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter/company`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  // ==========================================
  // PHASE 4M: ADMIN SAAS CONSOLE APIS
  // ==========================================

  getAdminDashboard: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminUsers: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/admin/users${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminUserById: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  updateAdminUserRole: async (id, role, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ role }),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  updateAdminUserStatus: async (id, isActive, reason, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ isActive, reason }),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminJobs: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/admin/jobs${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminJobById: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  moderateAdminJobStatus: async (id, status, note, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status, note }),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminApplications: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/admin/applications${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminApplicationById: async (id, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/${id}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  moderateAdminApplicationStatus: async (id, status, note, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status, note }),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminReports: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getAdminAuditLogs: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/admin/audit-logs${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },
  // ==========================================
  // Phase 4N: Platform Messaging Methods
  // ==========================================
  getConversations: async (params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/conversations${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getOrCreateConversation: async (payload, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getConversationById: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getMessages: async (conversationId, params = {}, token) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages${queryString}`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  sendMessage: async (conversationId, body, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ body }),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  markConversationRead: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },

  getUnreadMessageCount: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/unread-count`, {
        headers: getAuthHeaders(token),
      });
      return await handleResponse(response);
    } catch (err) {
      throw err;
    }
  },
};
