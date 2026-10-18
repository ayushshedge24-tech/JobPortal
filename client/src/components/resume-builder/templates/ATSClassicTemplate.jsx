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

export const ATSClassicTemplate = ({
  content = {},
  styling = {},
}) => {
  const personal = content.personal || {};
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
      className="resume-template ats-classic-template"
      style={{
        width: "100%",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: baseFontSize,
        lineHeight: lineHeight,
        color: "#0f172a",
      }}
    >
      {/* Header */}
      <header
        className="resume-print-section"
        style={{
          textAlign: "center",
          borderBottom: "1.5px solid #0f172a",
          paddingBottom: "10px",
          marginBottom: "14px",
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        <h1
          style={{
            fontSize: "20pt",
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 4px 0",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            pageBreakAfter: "avoid",
            breakAfter: "avoid",
          }}
        >
          {personal.fullName || "Your Full Name"}
        </h1>

        {personal.headline && (
          <div style={{ fontSize: "11pt", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
            {personal.headline}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "9pt",
            color: "#475569",
          }}
        >
          {personal.email && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <Mail size={11} />
              <a href={`mailto:${personal.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                {personal.email}
              </a>
            </span>
          )}

          {personal.phone && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <Phone size={11} />
              <a href={`tel:${personal.phone.replace(/\s+/g, "")}`} style={{ color: "inherit", textDecoration: "none" }}>
                {personal.phone}
              </a>
            </span>
          )}

          {(personal.city || personal.state) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <MapPin size={11} /> {[personal.city, personal.state, personal.country].filter(Boolean).join(", ")}
            </span>
          )}

          {personal.linkedin && isSafeUrl(personal.linkedin) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <Link2 size={11} />
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
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <Code2 size={11} />
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
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <Globe size={11} />
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

      {/* Sections in canonical order */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 5px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Professional Summary
                  </h2>
                  <p style={{ margin: 0, color: "#334155", textAlign: "justify" }}>{content.summary}</p>
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 6px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Experience
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {experiences.map((exp, idx) => (
                      <div
                        key={exp._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div>
                            <strong style={{ fontSize: "10pt", color: "#0f172a" }}>{exp.role || "Role"}</strong>
                            {exp.company && <span style={{ color: "#334155" }}> — {exp.company}</span>}
                            {exp.location && <span style={{ color: "#64748b", fontSize: "8.5pt" }}> ({exp.location})</span>}
                          </div>
                          <span style={{ fontSize: "8.5pt", color: "#64748b", fontWeight: 500 }}>
                            {[exp.startDate, exp.isCurrent ? "Present" : exp.endDate].filter(Boolean).join(" - ")}
                          </span>
                        </div>
                        {exp.description && <p style={{ margin: "2px 0 3px 0", color: "#334155" }}>{exp.description}</p>}
                        {Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0 && (
                          <ul style={{ margin: "2px 0 0 0", paddingLeft: "16px", color: "#334155" }}>
                            {exp.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx} style={{ marginBottom: "1px" }}>{bp}</li>
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 6px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Education
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {educations.map((edu, idx) => (
                      <div
                        key={edu._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
                      >
                        <div>
                          <strong style={{ fontSize: "9.5pt", color: "#0f172a" }}>
                            {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ")}
                          </strong>
                          <div style={{ color: "#475569", fontSize: "9pt" }}>
                            {edu.institution}{edu.location ? `, ${edu.location}` : ""}{edu.grade ? ` | GPA/Grade: ${edu.grade}` : ""}
                          </div>
                        </div>
                        <span style={{ fontSize: "8.5pt", color: "#64748b", fontWeight: 500 }}>
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 5px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Skills
                  </h2>
                  <div style={{ color: "#334155", fontSize: "9pt" }}>
                    {skills.map((sk, idx) => (
                      <span key={sk._id || idx}>
                        <strong>{sk.name}</strong>{sk.level ? ` (${sk.level.toLowerCase()})` : ""}{idx < skills.length - 1 ? ", " : ""}
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 6px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Projects
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {projects.map((proj, idx) => (
                      <div
                        key={proj._id || idx}
                        className="resume-print-item"
                        style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div>
                            <strong style={{ fontSize: "9.5pt", color: "#0f172a" }}>{proj.title}</strong>
                            {proj.subtitle && <span style={{ color: "#475569" }}> — {proj.subtitle}</span>}
                            {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                              <span style={{ fontSize: "8.5pt", color: "#64748b" }}> ({proj.technologies.join(", ")})</span>
                            )}
                          </div>
                          {proj.url && isSafeUrl(proj.url) && (
                            <a
                              href={formatSafeHref(proj.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "8.5pt", color: "#2563eb", textDecoration: "none" }}
                            >
                              {proj.url.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                        {proj.description && <p style={{ margin: "2px 0", color: "#334155" }}>{proj.description}</p>}
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 5px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Certifications
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 5px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Honors & Achievements
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
                        {ach.description && <p style={{ margin: "1px 0 0 0", color: "#334155" }}>{ach.description}</p>}
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
                      fontSize: "10.5pt",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "2px",
                      margin: "0 0 5px 0",
                      color: "#0f172a",
                      pageBreakAfter: "avoid",
                      breakAfter: "avoid",
                    }}
                  >
                    Languages
                  </h2>
                  <div style={{ color: "#334155", fontSize: "9pt" }}>
                    {languages.map((lang, idx) => (
                      <span key={lang._id || idx}>
                        <strong>{lang.name}</strong> ({lang.proficiency}){idx < languages.length - 1 ? ", " : ""}
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
                            fontSize: "10.5pt",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "1px solid #cbd5e1",
                            paddingBottom: "2px",
                            margin: "0 0 6px 0",
                            color: "#0f172a",
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
export default ATSClassicTemplate;
