/**
 * Deterministic Profile Completion Calculation
 * Evaluates populated fields and computes an exact percentage (0-100%)
 */
function calculateProfileCompletion(profile) {
  if (!profile) return 0;

  let score = 0;

  // 1. Basic Information (15%) - firstName/lastName, phone, city/location
  const hasName = (profile.firstName && profile.firstName.trim().length > 0) ||
                  (profile.name && profile.name.trim().length > 0);
  const hasPhone = profile.phone && profile.phone.trim().length >= 7;
  const hasLocation = (profile.city && profile.city.trim().length > 0) ||
                      (profile.location && typeof profile.location === "string" && profile.location.trim().length > 0) ||
                      (profile.location && typeof profile.location === "object" && (profile.location.city || profile.location.state));

  if (hasName && hasPhone && hasLocation) {
    score += 15;
  } else if (hasName && (hasPhone || hasLocation)) {
    score += 10;
  } else if (hasName || hasPhone || hasLocation) {
    score += 5;
  }

  // 2. Headline (10%)
  if (profile.headline && profile.headline.trim().length >= 5) {
    score += 10;
  } else if (profile.headline && profile.headline.trim().length > 0) {
    score += 5;
  }

  // 3. Professional Summary (10%)
  const summaryText = profile.professionalSummary || profile.bio || "";
  if (summaryText && summaryText.trim().length >= 50) {
    score += 10;
  } else if (summaryText && summaryText.trim().length > 0) {
    score += 5;
  }

  // 4. Experience (20%)
  if (Array.isArray(profile.experience) && profile.experience.length >= 1) {
    score += 20;
  }

  // 5. Education (15%)
  if (Array.isArray(profile.education) && profile.education.length >= 1) {
    score += 15;
  }

  // 6. Skills (15%)
  if (Array.isArray(profile.skills)) {
    if (profile.skills.length >= 5) {
      score += 15;
    } else if (profile.skills.length >= 1) {
      score += Math.round((profile.skills.length / 5) * 15);
    }
  }

  // 7. Projects (5%)
  if (Array.isArray(profile.projects) && profile.projects.length >= 1) {
    score += 5;
  }

  // 8. Certifications (5%)
  if (Array.isArray(profile.certifications) && profile.certifications.length >= 1) {
    score += 5;
  }

  // 9. Social Links (3%)
  const links = profile.socialLinks || {};
  const linkCount = [links.linkedin, links.github, links.portfolio, links.website].filter(
    (l) => l && typeof l === "string" && l.trim().length > 0
  ).length;
  if (linkCount >= 2) {
    score += 3;
  } else if (linkCount === 1) {
    score += 2;
  }

  // 10. Job Preferences (2%)
  const hasPrefLoc = Array.isArray(profile.preferredLocations) && profile.preferredLocations.length > 0;
  const hasPrefMode = Array.isArray(profile.preferredWorkModes) && profile.preferredWorkModes.length > 0;
  const hasPrefType = Array.isArray(profile.preferredJobTypes) && profile.preferredJobTypes.length > 0;
  if (hasPrefLoc || hasPrefMode || hasPrefType) {
    score += 2;
  }

  return Math.min(100, Math.max(0, score));
}

module.exports = {
  calculateProfileCompletion,
};
