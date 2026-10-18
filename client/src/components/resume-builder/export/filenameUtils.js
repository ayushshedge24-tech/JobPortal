/**
 * Filename Sanitization and Generation Utility for Resume PDF Export
 * Strict multi-tenant security: strips path traversal, illegal filesystem characters, and limits length.
 */

export const sanitizeFilenamePart = (inputStr) => {
  if (!inputStr || typeof inputStr !== "string") return "";

  return inputStr
    .trim()
    // Remove control characters and null bytes
    .replace(/[\x00-\x1f\x7f-\x9f]/g, "")
    // Remove path traversal and dangerous characters: < > : " / \ | ? * .
    .replace(/[<>:"/\\|?*.]/g, "")
    // Replace whitespace sequences with single underscore
    .replace(/\s+/g, "_")
    // Remove consecutive underscores
    .replace(/_+/g, "_")
    // Trim leading/trailing underscores
    .replace(/^_+|_+$/g, "");
};

export const generateResumePdfFilename = (personal = {}, resumeTitle = "") => {
  const sanitizedName = sanitizeFilenamePart(personal.fullName || "");
  const sanitizedTitle = sanitizeFilenamePart(resumeTitle || "");

  let baseName = "";

  if (sanitizedName && sanitizedTitle && sanitizedTitle.toLowerCase() !== "untitled_resume") {
    baseName = `${sanitizedName}_${sanitizedTitle}_Resume`;
  } else if (sanitizedName) {
    baseName = `${sanitizedName}_Resume`;
  } else if (sanitizedTitle && sanitizedTitle.toLowerCase() !== "untitled_resume") {
    baseName = `${sanitizedTitle}_Resume`;
  } else {
    baseName = "JobPortal_Resume";
  }

  // Enforce maximum length limit (max 80 chars before extension)
  if (baseName.length > 80) {
    baseName = baseName.substring(0, 80).replace(/_+$/, "");
  }

  return `${baseName}.pdf`;
};

export default {
  sanitizeFilenamePart,
  generateResumePdfFilename,
};
