const CompanyProfile = require("../../models/CompanyProfile");

/**
 * Get or initialize company profile for recruiter
 */
async function getCompanyProfile(userId) {
  let profile = await CompanyProfile.findOne({ user: userId }).lean();
  if (!profile) {
    return {
      user: userId,
      companyName: "",
      tagline: "",
      description: "",
      website: "",
      industry: "Information Technology",
      companySize: "51-200",
      location: "Bengaluru, India",
      logo: "",
      socialLinks: { linkedin: "", twitter: "", github: "", website: "" },
      isNew: true,
    };
  }
  return profile;
}

/**
 * Upsert company profile with strict ownership
 */
async function upsertCompanyProfile(userId, data) {
  const {
    companyName,
    tagline = "",
    description = "",
    website = "",
    industry = "Information Technology",
    companySize = "51-200",
    location = "Bengaluru, India",
    logo = "",
    socialLinks = {},
  } = data;

  if (!companyName || !String(companyName).trim()) {
    const error = new Error("Company name is required");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const payload = {
    companyName: String(companyName).trim(),
    tagline: String(tagline).trim(),
    description: String(description).trim(),
    website: String(website).trim(),
    industry: String(industry).trim(),
    companySize,
    location: String(location).trim(),
    logo: String(logo).trim(),
    socialLinks: {
      linkedin: socialLinks?.linkedin ? String(socialLinks.linkedin).trim() : "",
      twitter: socialLinks?.twitter ? String(socialLinks.twitter).trim() : "",
      github: socialLinks?.github ? String(socialLinks.github).trim() : "",
      website: socialLinks?.website ? String(socialLinks.website).trim() : "",
    },
  };

  const profile = await CompanyProfile.findOneAndUpdate(
    { user: userId },
    { $set: payload },
    { new: true, upsert: true, runValidators: true }
  );

  return profile;
}

module.exports = {
  getCompanyProfile,
  upsertCompanyProfile,
};
