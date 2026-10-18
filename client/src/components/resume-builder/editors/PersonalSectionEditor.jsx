import React from "react";
import { Input } from "../../ui/Input";
import { Mail, Phone, MapPin, Globe, Link2, Code2, User, Briefcase } from "lucide-react";

export const PersonalSectionEditor = ({ data = {}, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const isSafeUrl = (urlStr) => {
    if (!urlStr || typeof urlStr !== "string") return true;
    const trimmed = urlStr.trim();
    if (trimmed.length === 0) return true;
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

  return (
    <div className="personal-section-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
        <Input
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={data.fullName || ""}
          onChange={(e) => handleChange("fullName", e.target.value)}
          maxLength={100}
          startIcon={<User size={16} />}
          required
        />

        <Input
          label="Professional Headline"
          placeholder="e.g. Senior Full Stack Engineer"
          value={data.headline || ""}
          onChange={(e) => handleChange("headline", e.target.value)}
          maxLength={150}
          startIcon={<Briefcase size={16} />}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. rahul@example.com"
          value={data.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          maxLength={100}
          startIcon={<Mail size={16} />}
        />

        <Input
          label="Phone Number"
          placeholder="e.g. +91 98765 43210"
          value={data.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          maxLength={30}
          startIcon={<Phone size={16} />}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-4)" }}>
        <Input
          label="City"
          placeholder="e.g. Bengaluru"
          value={data.city || ""}
          onChange={(e) => handleChange("city", e.target.value)}
          maxLength={80}
          startIcon={<MapPin size={16} />}
        />

        <Input
          label="State"
          placeholder="e.g. Karnataka"
          value={data.state || ""}
          onChange={(e) => handleChange("state", e.target.value)}
          maxLength={80}
        />

        <Input
          label="Country"
          placeholder="e.g. India"
          value={data.country || "India"}
          onChange={(e) => handleChange("country", e.target.value)}
          maxLength={80}
        />
      </div>

      <div style={{ marginTop: "var(--space-2)" }}>
        <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
          Online Links & Profiles
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          <Input
            label="LinkedIn Profile"
            placeholder="https://linkedin.com/in/username"
            value={data.linkedin || ""}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            maxLength={250}
            startIcon={<Link2 size={16} />}
            error={!isSafeUrl(data.linkedin) ? "Invalid URL protocol (only http/https allowed)" : undefined}
          />

          <Input
            label="GitHub Profile"
            placeholder="https://github.com/username"
            value={data.github || ""}
            onChange={(e) => handleChange("github", e.target.value)}
            maxLength={250}
            startIcon={<Code2 size={16} />}
            error={!isSafeUrl(data.github) ? "Invalid URL protocol (only http/https allowed)" : undefined}
          />

          <Input
            label="Portfolio / Website"
            placeholder="https://yourportfolio.com"
            value={data.portfolio || data.website || ""}
            onChange={(e) => {
              handleChange("portfolio", e.target.value);
              handleChange("website", e.target.value);
            }}
            maxLength={250}
            startIcon={<Globe size={16} />}
            error={!isSafeUrl(data.portfolio || data.website) ? "Invalid URL protocol (only http/https allowed)" : undefined}
          />
        </div>
      </div>
    </div>
  );
};
export default PersonalSectionEditor;
