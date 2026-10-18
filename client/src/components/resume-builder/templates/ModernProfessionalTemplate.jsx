import React from "react";
import { Mail, Phone, MapPin, Globe, Link2, Code2 } from "lucide-react";

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

export const ModernProfessionalTemplate = ({
  content = {},
  styling = {},
}) => {
  const personal = content.personal || {};
  const primaryColor = styling.primaryColor || "#2563eb";
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

  const baseFontSize = styling.fontSize === "SM" ? "9.5pt" : styling.fontSize === "LG" ? "11pt" : "10pt";
  const lineHeight = styling.lineSpacing === "COMPACT" ? "1.25" : styling.lineSpacing === "RELAXED" ? "1.5" : "1.35";

  return (
    <div
      className="resume-template modern-professional-template"
      style={{
        width: "100%",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: baseFontSize,
        lineHeight: lineHeight,
        color: "#1e293b",
      }}
    >
      {/* Header */}
      <header
        className="resume-print-section"
        style={{
          borderBottom: `2.5px solid ${primaryColor}`,
          paddingBottom: "12px",
          marginBottom: "16px",
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h1
              style={{
                fontSize: "22pt",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 4px 0",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                pageBreakAfter: "avoid",
                breakAfter: "avoid",
              }}
            >
              {personal.fullName || "Your Full Name"}
            </h1>

            {personal.headline && (
              <div
                style={{
                  fontSize: "11.5pt",
                  fontWeight: 600,
                  color: primaryColor,
                  marginBottom: "6px",
                }}
              >
                {personal.headline}
              </div>
            )}
          </div>

          {(personal.city || personal.state || personal.country) && (
            <div
              style={{
                fontSize: "9pt",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <MapPin size={13} style={{ color: primaryColor }} />
              {[personal.city, personal.state, personal.country].filter(Boolean).join(", ")}
            </div>
          )}
        </div>

        {/* Contact info bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "9pt",
            color: "#475569",
            marginTop: "6px",
          }}
        >
          {personal.email && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Mail size={12} style={{ color: primaryColor }} />
              <a href={`mailto:${personal.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                {personal.email}
              </a>
            </span>
          )}

          {personal.phone && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Phone size={12} style={{ color: primaryColor }} />
              <a href={`tel:${personal.phone.replace(/\s+/g, "")}`} style={{ color: "inherit", textDecoration: "none" }}>
                {personal.phone}
              </a>
            </span>
          )}

          {personal.linkedin && isSafeUrl(personal.linkedin) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Link2 size={12} style={{ color: primaryColor }} />
              <a
                href={formatSafeHref(personal.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {personal.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </span>
          )}

          {personal.github && isSafeUrl(personal.github) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Code2 size={12} style={{ color: primaryColor }} />
              <a
                href={formatSafeHref(personal.github)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {personal.github.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </span>
          )}

          {personal.portfolio && isSafeUrl(personal.portfolio) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Globe size={12} style={{ color: primaryColor }} />
              <a
                href={formatSafeHref(personal.portfolio)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {personal.portfolio.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Sections List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {sectionOrder.map((sectionId) => {
          if (sectionVisibility[sectionId] === false) return null;

          switch (sectionId) {
            case "SUMMARY":
              if (!content.summary) return null;
              return (
                <section
                  key="SUMMARY"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 6px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Professional Summary
                  </h2>
                  <p style={{ margin: 0, color: "#334155", textAlign: "justify" }}>
                    {content.summary}
                  </p>
                </section>
              );

            case "EXPERIENCE":
              if (experiences.length === 0) return null;
              return (
                <section
                  key="EXPERIENCE"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 8px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Work Experience
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {experiences.map((exp, idx) => (
                      <div
                        key={exp._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div>
                            <strong style={{ fontSize: "10.5pt", color: "#0f172a" }}>{exp.role || "Role"}</strong>
                            {exp.company && <span style={{ color: "#475569", fontWeight: 600 }}> — {exp.company}</span>}
                          </div>
                          <span style={{ fontSize: "9pt", color: "#64748b", fontWeight: 600 }}>
                            {[exp.startDate, exp.isCurrent ? "Present" : exp.endDate].filter(Boolean).join(" - ")}
                          </span>
                        </div>

                        {exp.location && (
                          <div style={{ fontSize: "8.5pt", color: "#64748b", margin: "1px 0 3px 0" }}>
                            {exp.location}
                          </div>
                        )}

                        {exp.description && (
                          <p style={{ margin: "2px 0 4px 0", color: "#334155" }}>{exp.description}</p>
                        )}

                        {Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0 && (
                          <ul style={{ margin: "3px 0 0 0", paddingLeft: "16px", color: "#334155" }}>
                            {exp.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx} style={{ marginBottom: "2px" }}>
                                {bp}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "EDUCATION":
              if (educations.length === 0) return null;
              return (
                <section
                  key="EDUCATION"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 8px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Education
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {educations.map((edu, idx) => (
                      <div
                        key={edu._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
                      >
                        <div>
                          <strong style={{ fontSize: "10pt", color: "#0f172a" }}>
                            {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ")}
                          </strong>
                          <div style={{ color: "#475569", fontSize: "9pt" }}>
                            {edu.institution}{edu.location ? `, ${edu.location}` : ""}
                          </div>
                          {edu.grade && <div style={{ fontSize: "8.5pt", color: "#64748b" }}>Grade / CGPA: {edu.grade}</div>}
                        </div>
                        <span style={{ fontSize: "9pt", color: "#64748b", fontWeight: 600 }}>
                          {[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "SKILLS":
              if (skills.length === 0) return null;
              return (
                <section
                  key="SKILLS"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 6px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Technical & Core Skills
                  </h2>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {skills.map((sk, idx) => (
                      <span
                        key={sk._id || idx}
                        style={{
                          fontSize: "8.5pt",
                          padding: "2px 8px",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "4px",
                          border: "1px solid #e2e8f0",
                          color: "#1e293b",
                          fontWeight: 500,
                        }}
                      >
                        {sk.name}
                        {sk.level ? ` (${sk.level.toLowerCase()})` : ""}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case "PROJECTS":
              if (projects.length === 0) return null;
              return (
                <section
                  key="PROJECTS"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 8px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Key Projects
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {projects.map((proj, idx) => (
                      <div
                        key={proj._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div>
                            <strong style={{ fontSize: "10pt", color: "#0f172a" }}>{proj.title}</strong>
                            {proj.subtitle && <span style={{ color: "#475569" }}> — {proj.subtitle}</span>}
                            {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                              <span style={{ fontSize: "8.5pt", color: primaryColor, marginLeft: "6px" }}>
                                [{proj.technologies.join(", ")}]
                              </span>
                            )}
                          </div>
                          {proj.url && isSafeUrl(proj.url) && (
                            <a
                              href={formatSafeHref(proj.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "8.5pt", color: primaryColor, fontWeight: 500, textDecoration: "none" }}
                            >
                              {proj.url.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                        {proj.description && <p style={{ margin: "2px 0 4px 0", color: "#334155" }}>{proj.description}</p>}
                        {Array.isArray(proj.bulletPoints) && proj.bulletPoints.length > 0 && (
                          <ul style={{ margin: "2px 0 0 0", paddingLeft: "16px", color: "#334155" }}>
                            {proj.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx} style={{ marginBottom: "1px" }}>{bp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "CERTIFICATIONS":
              if (certifications.length === 0) return null;
              return (
                <section
                  key="CERTIFICATIONS"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 6px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Certifications & Licenses
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {certifications.map((cert, idx) => (
                      <div
                        key={cert._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
                      >
                        <div>
                          <strong style={{ fontSize: "9.5pt", color: "#0f172a" }}>{cert.name}</strong>
                          {cert.issuer && <span style={{ color: "#475569" }}> — {cert.issuer}</span>}
                        </div>
                        <span style={{ fontSize: "8.5pt", color: "#64748b" }}>
                          {[cert.issueDate, cert.expiryDate].filter(Boolean).join(" - ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "ACHIEVEMENTS":
              if (achievements.length === 0) return null;
              return (
                <section
                  key="ACHIEVEMENTS"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 6px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Honors & Achievements
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {achievements.map((ach, idx) => (
                      <div
                        key={ach._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <strong style={{ fontSize: "9.5pt", color: "#0f172a" }}>{ach.title}</strong>
                          {ach.date && <span style={{ fontSize: "8.5pt", color: "#64748b" }}>{ach.date}</span>}
                        </div>
                        {ach.description && <p style={{ margin: "2px 0 0 0", color: "#334155" }}>{ach.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "LANGUAGES":
              if (languages.length === 0) return null;
              return (
                <section
                  key="LANGUAGES"
                  className="resume-print-section"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: primaryColor,
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "3px",
                      margin: "0 0 6px 0",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Languages
                  </h2>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "#334155", fontSize: "9pt" }}>
                    {languages.map((lang, idx) => (
                      <span key={lang._id || idx} style={{ display: "inline-flex", gap: "4px" }}>
                        <strong style={{ color: "#0f172a" }}>{lang.name}:</strong>
                        <span style={{ color: "#64748b" }}>{lang.proficiency}</span>
                      </span>
                    ))}
                  </div>
                </section>
              );

            case "CUSTOM":
              if (customSections.length === 0) return null;
              return (
                <div key="CUSTOM" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {customSections.map((sec, sIdx) => {
                    const items = Array.isArray(sec.items) ? sec.items : [];
                    if (items.length === 0) return null;
                    return (
                      <section
                        key={sec.id || sIdx}
                        className="resume-print-section"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                      >
                        <h2
                          style={{
                            fontSize: "11pt",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            color: primaryColor,
                            borderBottom: "1px solid #e2e8f0",
                            paddingBottom: "3px",
                            margin: "0 0 6px 0",
                            pageBreakAfter: "avoid",
                            breakAfter: "avoid",
                          }}
                        >
                          {sec.title}
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {items.map((item, iIdx) => (
                            <div
                              key={item._id || iIdx}
                              className="resume-print-item"
                              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <div>
                                  <strong style={{ fontSize: "9.5pt", color: "#0f172a" }}>{item.title}</strong>
                                  {item.subtitle && <span style={{ color: "#475569" }}> — {item.subtitle}</span>}
                                </div>
                                {item.date && <span style={{ fontSize: "8.5pt", color: "#64748b" }}>{item.date}</span>}
                              </div>
                              {item.description && <p style={{ margin: "2px 0", color: "#334155" }}>{item.description}</p>}
                              {Array.isArray(item.bulletPoints) && item.bulletPoints.length > 0 && (
                                <ul style={{ margin: "2px 0 0 0", paddingLeft: "16px", color: "#334155" }}>
                                  {item.bulletPoints.map((bp, bIdx) => (
                                    <li key={bIdx} style={{ marginBottom: "1px" }}>{bp}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
export default ModernProfessionalTemplate;
