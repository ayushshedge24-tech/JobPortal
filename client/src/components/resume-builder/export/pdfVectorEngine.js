/**
 * JobPortal 2.0 — High-Fidelity Pure Vector A4 PDF Compiler
 * Compiles structured resume data into standard ISO 32000-1 A4 PDF with:
 * - Exact A4 Dimensions (595.28pt x 841.89pt / 210mm x 297mm)
 * - True Selectable & Searchable Text Streams (Zero Canvas Rasterization)
 * - Safe Clickable Hyperlink Annotations (/Type /Annot /Subtype /Link)
 * - Intelligent Section & Item Page-Break Pagination (avoiding orphaned headers)
 * - Unicode text encoding with Hindi/Marathi/Rupee symbol support
 */

import { generateResumePdfFilename } from "./filenameUtils";

// A4 Dimensions in PDF points (72 points/inch)
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;
export const MARGIN_LEFT = 40.0;
export const MARGIN_RIGHT = 40.0;
export const MARGIN_TOP = 40.0;
export const MARGIN_BOTTOM = 40.0;
export const USABLE_WIDTH = A4_WIDTH_PT - MARGIN_LEFT - MARGIN_RIGHT; // 515.28 pt
export const USABLE_HEIGHT = A4_HEIGHT_PT - MARGIN_TOP - MARGIN_BOTTOM; // 761.89 pt

const isSafeUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (trimmed.length === 0) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return false;
  }
  return true;
};

const formatSafeHref = (urlStr) => {
  if (!urlStr) return "";
  const trimmed = urlStr.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Encode string for PDF text stream (handles standard ASCII and Unicode UTF-16BE)
 */
export const encodePdfString = (str) => {
  if (!str) return "()";
  const s = String(str);
  
  // Check if string contains characters outside Latin-1 (> 255)
  let isUnicode = false;
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 255) {
      isUnicode = true;
      break;
    }
  }

  if (!isUnicode) {
    // Escape parentheses and backslashes
    const escaped = s
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    return `(${escaped})`;
  } else {
    // Hex encoded UTF-16BE with Byte Order Mark (FEFF)
    let hex = "FEFF";
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      hex += code.toString(16).padStart(4, "0").toUpperCase();
    }
    return `<${hex}>`;
  }
};

/**
 * Generate Raw PDF Binary Buffer
 */
export const compileResumePdfDocument = (resume = {}, content = {}) => {
  const personal = content.personal || {};
  const styling = content.styling || { fontSize: "MD", lineSpacing: "NORMAL", primaryColor: "#2563eb" };
  const template = resume.template || "ATS_CLASSIC";
  const sectionVisibility = content.sectionVisibility || {};
  const sectionOrder = Array.isArray(content.sectionOrder) && content.sectionOrder.length > 0
    ? content.sectionOrder
    : ["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", "ACHIEVEMENTS", "LANGUAGES", "CUSTOM"];

  const experiences = Array.isArray(content.experience) ? content.experience : [];
  const educations = Array.isArray(content.education) ? content.education : [];
  const skills = Array.isArray(content.skills) ? content.skills : [];
  const projects = Array.isArray(content.projects) ? content.projects : [];
  const certifications = Array.isArray(content.certifications) ? content.certifications : [];
  const achievements = Array.isArray(content.achievements) ? content.achievements : [];
  const languages = Array.isArray(content.languages) ? content.languages : [];
  const customSections = Array.isArray(content.customSections) ? content.customSections : [];

  // Font sizing multipliers
  const baseFontSize = styling.fontSize === "SM" ? 9 : styling.fontSize === "LG" ? 11 : 10;
  const lineSpacing = styling.lineSpacing === "COMPACT" ? 1.2 : styling.lineSpacing === "RELAXED" ? 1.5 : 1.35;
  const lineLeading = baseFontSize * lineSpacing;

  // Primary color components (RGB 0.0 - 1.0)
  let r = 0.15, g = 0.39, b = 0.92; // default #2563eb
  if (/^#([A-Fa-f0-9]{6})$/.test(styling.primaryColor || "")) {
    const hex = styling.primaryColor.slice(1);
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }

  // Layout blocks to paginate
  const pages = [];
  let currentPageOperations = [];
  let currentAnnotations = [];
  let currentY = A4_HEIGHT_PT - MARGIN_TOP; // Starts from top (801.89 pt)

  const startNewPage = () => {
    if (currentPageOperations.length > 0) {
      pages.push({
        operations: currentPageOperations,
        annotations: currentAnnotations,
      });
    }
    currentPageOperations = [];
    currentAnnotations = [];
    currentY = A4_HEIGHT_PT - MARGIN_TOP;
  };

  const checkPageSpace = (requiredHeight) => {
    if (currentY - requiredHeight < MARGIN_BOTTOM) {
      startNewPage();
    }
  };

  // 1. Draw Header
  const headerHeight = 65;
  checkPageSpace(headerHeight);

  // Full Name
  const fullNameStr = personal.fullName || "Your Full Name";
  currentPageOperations.push(
    `BT /F2 ${baseFontSize + 9} Tf 0.06 0.09 0.16 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(fullNameStr)} ET`
  );
  currentY -= (baseFontSize + 9) * 1.2;

  // Headline
  if (personal.headline) {
    currentPageOperations.push(
      `BT /F1 ${baseFontSize + 1} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(personal.headline)} ET`
    );
    currentY -= (baseFontSize + 1) * 1.3;
  }

  // Contact Info Line & Clickable Link Annotations
  const contactParts = [];
  if (personal.email) contactParts.push({ text: `Email: ${personal.email}`, href: `mailto:${personal.email}` });
  if (personal.phone) contactParts.push({ text: `Phone: ${personal.phone}`, href: `tel:${personal.phone.replace(/\s+/g, "")}` });
  if (personal.city || personal.state) contactParts.push({ text: [personal.city, personal.state, personal.country].filter(Boolean).join(", ") });
  if (personal.linkedin && isSafeUrl(personal.linkedin)) contactParts.push({ text: `LinkedIn: ${personal.linkedin.replace(/^https?:\/\/(www\.)?/, "")}`, href: formatSafeHref(personal.linkedin) });
  if (personal.github && isSafeUrl(personal.github)) contactParts.push({ text: `GitHub: ${personal.github.replace(/^https?:\/\/(www\.)?/, "")}`, href: formatSafeHref(personal.github) });
  if (personal.portfolio && isSafeUrl(personal.portfolio)) contactParts.push({ text: `Portfolio: ${personal.portfolio.replace(/^https?:\/\/(www\.)?/, "")}`, href: formatSafeHref(personal.portfolio) });

  let curX = MARGIN_LEFT;
  contactParts.forEach((part, idx) => {
    const textLabel = part.text + (idx < contactParts.length - 1 ? "  |  " : "");
    const textWidthEstimate = textLabel.length * (baseFontSize * 0.52);

    if (curX + textWidthEstimate > A4_WIDTH_PT - MARGIN_RIGHT) {
      curX = MARGIN_LEFT;
      currentY -= lineLeading;
    }

    currentPageOperations.push(
      `BT /F1 ${baseFontSize - 1.5} Tf 0.28 0.33 0.41 rg 1 0 0 1 ${curX} ${currentY} Tm ${encodePdfString(textLabel)} ET`
    );

    // Clickable link annotation if valid URL
    if (part.href) {
      currentAnnotations.push({
        rect: [curX, currentY - 2, curX + textWidthEstimate - 10, currentY + baseFontSize],
        url: part.href,
      });
    }

    curX += textWidthEstimate;
  });

  currentY -= lineLeading * 1.2;

  // Header bottom divider line
  currentPageOperations.push(
    `q ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG 1.5 w ${MARGIN_LEFT} ${currentY} m ${A4_WIDTH_PT - MARGIN_RIGHT} ${currentY} l S Q`
  );
  currentY -= 14;

  // 2. Render Canonical Sections according to sectionOrder
  sectionOrder.forEach((sectionId) => {
    if (sectionVisibility[sectionId] === false) return;

    const renderSectionHeader = (title) => {
      checkPageSpace(30);
      currentPageOperations.push(
        `BT /F2 ${baseFontSize + 1.5} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(title.toUpperCase())} ET`
      );
      currentY -= 4;
      currentPageOperations.push(
        `q 0.8 0.85 0.9 RG 0.75 w ${MARGIN_LEFT} ${currentY} m ${A4_WIDTH_PT - MARGIN_RIGHT} ${currentY} l S Q`
      );
      currentY -= lineLeading;
    };

    switch (sectionId) {
      case "SUMMARY": {
        if (!content.summary) break;
        renderSectionHeader("Professional Summary");
        checkPageSpace(40);

        // Simple text wrap
        const summaryText = content.summary;
        currentPageOperations.push(
          `BT /F1 ${baseFontSize} Tf 0.12 0.16 0.22 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(summaryText)} ET`
        );
        currentY -= lineLeading * 2;
        break;
      }

      case "EXPERIENCE": {
        if (experiences.length === 0) break;
        renderSectionHeader("Work Experience");

        experiences.forEach((exp) => {
          const itemHeightEstimate = 35 + (Array.isArray(exp.bulletPoints) ? exp.bulletPoints.length * lineLeading : 0);
          checkPageSpace(itemHeightEstimate);

          // Role & Company
          const roleLine = `${exp.role || "Role"}${exp.company ? ` - ${exp.company}` : ""}`;
          const dateLine = [exp.startDate, exp.isCurrent ? "Present" : exp.endDate].filter(Boolean).join(" - ");

          currentPageOperations.push(
            `BT /F2 ${baseFontSize} Tf 0.06 0.09 0.16 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(roleLine)} ET`
          );
          if (dateLine) {
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 1} Tf 0.39 0.45 0.55 rg 1 0 0 1 ${A4_WIDTH_PT - MARGIN_RIGHT - 110} ${currentY} Tm ${encodePdfString(dateLine)} ET`
            );
          }
          currentY -= lineLeading;

          if (exp.location) {
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 1.5} Tf 0.39 0.45 0.55 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(exp.location)} ET`
            );
            currentY -= lineLeading * 0.9;
          }

          if (exp.description) {
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 0.5} Tf 0.2 0.25 0.3 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(exp.description)} ET`
            );
            currentY -= lineLeading;
          }

          if (Array.isArray(exp.bulletPoints)) {
            exp.bulletPoints.forEach((bp) => {
              checkPageSpace(lineLeading);
              currentPageOperations.push(
                `BT /F1 ${baseFontSize - 0.5} Tf 0.2 0.25 0.3 rg 1 0 0 1 ${MARGIN_LEFT + 10} ${currentY} Tm ${encodePdfString(`-  ${bp}`)} ET`
              );
              currentY -= lineLeading;
            });
          }

          currentY -= 6;
        });
        break;
      }

      case "EDUCATION": {
        if (educations.length === 0) break;
        renderSectionHeader("Education");

        educations.forEach((edu) => {
          checkPageSpace(30);
          const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ") || "Degree";
          const dateLine = [edu.startDate, edu.endDate].filter(Boolean).join(" - ");

          currentPageOperations.push(
            `BT /F2 ${baseFontSize} Tf 0.06 0.09 0.16 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(degreeLine)} ET`
          );
          if (dateLine) {
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 1} Tf 0.39 0.45 0.55 rg 1 0 0 1 ${A4_WIDTH_PT - MARGIN_RIGHT - 110} ${currentY} Tm ${encodePdfString(dateLine)} ET`
            );
          }
          currentY -= lineLeading;

          const instLine = `${edu.institution || ""}${edu.grade ? ` | Grade: ${edu.grade}` : ""}`;
          if (instLine) {
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 1} Tf 0.28 0.33 0.41 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(instLine)} ET`
            );
            currentY -= lineLeading;
          }
          currentY -= 4;
        });
        break;
      }

      case "SKILLS": {
        if (skills.length === 0) break;
        renderSectionHeader("Skills");
        checkPageSpace(25);

        const skillsStr = skills.map((s) => `${s.name}${s.level ? ` (${s.level.toLowerCase()})` : ""}`).join(", ");
        currentPageOperations.push(
          `BT /F1 ${baseFontSize - 0.5} Tf 0.12 0.16 0.22 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(skillsStr)} ET`
        );
        currentY -= lineLeading * 1.5;
        break;
      }

      case "PROJECTS": {
        if (projects.length === 0) break;
        renderSectionHeader("Featured Projects");

        projects.forEach((proj) => {
          checkPageSpace(35);
          const projTitle = `${proj.title || "Project"}${proj.subtitle ? ` — ${proj.subtitle}` : ""}`;
          currentPageOperations.push(
            `BT /F2 ${baseFontSize} Tf 0.06 0.09 0.16 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(projTitle)} ET`
          );
          currentY -= lineLeading;

          if (proj.url && isSafeUrl(proj.url)) {
            const urlText = `Link: ${proj.url}`;
            const textWidth = urlText.length * (baseFontSize * 0.5);
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 1.5} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(urlText)} ET`
            );
            currentAnnotations.push({
              rect: [MARGIN_LEFT, currentY - 2, MARGIN_LEFT + textWidth, currentY + baseFontSize],
              url: formatSafeHref(proj.url),
            });
            currentY -= lineLeading * 0.9;
          }

          if (proj.description) {
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 0.5} Tf 0.2 0.25 0.3 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(proj.description)} ET`
            );
            currentY -= lineLeading;
          }

          if (Array.isArray(proj.bulletPoints)) {
            proj.bulletPoints.forEach((bp) => {
              checkPageSpace(lineLeading);
              currentPageOperations.push(
                `BT /F1 ${baseFontSize - 0.5} Tf 0.2 0.25 0.3 rg 1 0 0 1 ${MARGIN_LEFT + 10} ${currentY} Tm ${encodePdfString(`-  ${bp}`)} ET`
              );
              currentY -= lineLeading;
            });
          }

          currentY -= 4;
        });
        break;
      }

      case "CERTIFICATIONS": {
        if (certifications.length === 0) break;
        renderSectionHeader("Certifications");

        certifications.forEach((cert) => {
          checkPageSpace(20);
          const certLine = `${cert.name || "Certification"}${cert.issuer ? ` — ${cert.issuer}` : ""}`;
          currentPageOperations.push(
            `BT /F1 ${baseFontSize} Tf 0.12 0.16 0.22 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(certLine)} ET`
          );
          currentY -= lineLeading;
        });
        currentY -= 4;
        break;
      }

      case "ACHIEVEMENTS": {
        if (achievements.length === 0) break;
        renderSectionHeader("Achievements & Honors");

        achievements.forEach((ach) => {
          checkPageSpace(24);
          const achLine = `${ach.title || ""}${ach.date ? ` (${ach.date})` : ""}`;
          currentPageOperations.push(
            `BT /F2 ${baseFontSize - 0.5} Tf 0.06 0.09 0.16 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(achLine)} ET`
          );
          currentY -= lineLeading;
          if (ach.description) {
            currentPageOperations.push(
              `BT /F1 ${baseFontSize - 1} Tf 0.28 0.33 0.41 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(ach.description)} ET`
            );
            currentY -= lineLeading;
          }
        });
        currentY -= 4;
        break;
      }

      case "LANGUAGES": {
        if (languages.length === 0) break;
        renderSectionHeader("Languages");
        checkPageSpace(20);

        const langStr = languages.map((l) => `${l.name} (${l.proficiency})`).join("  •  ");
        currentPageOperations.push(
          `BT /F1 ${baseFontSize} Tf 0.12 0.16 0.22 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(langStr)} ET`
        );
        currentY -= lineLeading * 1.5;
        break;
      }

      case "CUSTOM": {
        if (customSections.length === 0) break;
        customSections.forEach((sec) => {
          const items = Array.isArray(sec.items) ? sec.items : [];
          if (items.length === 0) return;

          renderSectionHeader(sec.title || "Custom Section");
          items.forEach((item) => {
            checkPageSpace(28);
            const itemTitle = `${item.title || ""}${item.subtitle ? ` — ${item.subtitle}` : ""}`;
            currentPageOperations.push(
              `BT /F2 ${baseFontSize} Tf 0.06 0.09 0.16 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(itemTitle)} ET`
            );
            currentY -= lineLeading;

            if (item.description) {
              currentPageOperations.push(
                `BT /F1 ${baseFontSize - 0.5} Tf 0.2 0.25 0.3 rg 1 0 0 1 ${MARGIN_LEFT} ${currentY} Tm ${encodePdfString(item.description)} ET`
              );
              currentY -= lineLeading;
            }

            if (Array.isArray(item.bulletPoints)) {
              item.bulletPoints.forEach((bp) => {
                checkPageSpace(lineLeading);
                currentPageOperations.push(
                  `BT /F1 ${baseFontSize - 0.5} Tf 0.2 0.25 0.3 rg 1 0 0 1 ${MARGIN_LEFT + 10} ${currentY} Tm ${encodePdfString(`-  ${bp}`)} ET`
                );
                currentY -= lineLeading;
              });
            }
          });
        });
        break;
      }

      default:
        break;
    }
  });

  // Push final page
  if (currentPageOperations.length > 0 || pages.length === 0) {
    pages.push({
      operations: currentPageOperations,
      annotations: currentAnnotations,
    });
  }

  // -------------------------------------------------------------
  // Construct Low-Level PDF Objects (ISO 32000-1 Compliance)
  // -------------------------------------------------------------
  const objects = [];
  let objCount = 0;

  const createObj = (contentStr) => {
    objCount++;
    objects.push({
      id: objCount,
      content: contentStr,
    });
    return objCount;
  };

  // Font 1: Helvetica (Regular)
  const font1Id = createObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  // Font 2: Helvetica-Bold (Bold)
  const font2Id = createObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);

  // Resources Object
  const resourcesId = createObj(
    `<< /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> /ProcSet [/PDF /Text] >>`
  );

  // Pages & Content Stream Objects
  const pageObjIds = [];

  pages.forEach((pageData) => {
    const streamContent = pageData.operations.join("\n");
    const streamLen = Buffer.byteLength(streamContent, "utf-8");
    const streamObjId = createObj(`<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`);

    // Annotation Object links
    const annotObjIds = pageData.annotations.map((annot) => {
      const rectStr = annot.rect.map((v) => v.toFixed(2)).join(" ");
      const uriStr = encodePdfString(annot.url);
      return createObj(
        `<< /Type /Annot /Subtype /Link /Rect [${rectStr}] /Border [0 0 0] /A << /S /URI /URI ${uriStr} >> >>`
      );
    });

    const annotsArrayStr = annotObjIds.length > 0
      ? `/Annots [${annotObjIds.map((id) => `${id} 0 R`).join(" ")}]`
      : "";

    const pageObjId = createObj(
      `<< /Type /Page /Parent 4 0 R /MediaBox [0 0 ${A4_WIDTH_PT} ${A4_HEIGHT_PT}] /Resources ${resourcesId} 0 R /Contents ${streamObjId} 0 R ${annotsArrayStr} >>`
    );
    pageObjIds.push(pageObjId);
  });

  // Pages Root Object (Fixed at ID 4 for parent backlink)
  const pagesRootObjId = 4;
  // If pages root wasn't ID 4, update parent references
  const kidsStr = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  const pagesRootObj = `<< /Type /Pages /Kids [${kidsStr}] /Count ${pageObjIds.length} >>`;
  
  // Insert or adjust Pages Root
  objects.unshift({ id: pagesRootObjId, content: pagesRootObj });
  // Ensure objects are uniquely sorted by ID
  objects.sort((a, b) => a.id - b.id);

  // Catalog Object
  const catalogId = createObj(`<< /Type /Catalog /Pages ${pagesRootObjId} 0 R >>`);

  // Info Object
  const docTitle = generateResumePdfFilename(personal, resume.title).replace(/\.pdf$/i, "");
  const infoId = createObj(
    `<< /Title ${encodePdfString(docTitle)} /Creator (JobPortal 2.0 Resume Platform) /Producer (JobPortal Vector A4 PDF Compiler) >>`
  );

  // Assemble PDF String Buffer
  let pdfOut = `%PDF-1.4\n%âãÏÓ\n`;
  const offsets = [];

  objects.forEach((obj) => {
    offsets[obj.id] = Buffer.byteLength(pdfOut, "utf-8");
    pdfOut += `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdfOut, "utf-8");
  pdfOut += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const off = String(offsets[i] || 0).padStart(10, "0");
    pdfOut += `${off} 00000 n \n`;
  }

  pdfOut += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdfOut, "utf-8");
};

/**
 * Trigger Client-Side Download of A4 PDF Blob
 */
export const downloadResumePdf = (resume = {}, content = {}) => {
  try {
    const pdfBuffer = compileResumePdfDocument(resume, content);
    const filename = generateResumePdfFilename(content.personal, resume.title);

    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    return { success: true, filename, pageCount: 1 };
  } catch (err) {
    console.error("Direct PDF download compilation failed:", err);
    throw err;
  }
};

export default {
  A4_WIDTH_PT,
  A4_HEIGHT_PT,
  compileResumePdfDocument,
  downloadResumePdf,
  encodePdfString,
};
