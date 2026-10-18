import React, { useState, useEffect } from "react";
import { Building2, Globe, MapPin, Users, Check, AlertCircle } from "lucide-react";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export const CompanyProfileForm = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({
    companyName: "",
    tagline: "",
    description: "",
    website: "",
    industry: "Information Technology",
    companySize: "51-200",
    location: "Bengaluru, India",
    logo: "",
    socialLinks: { linkedin: "", twitter: "", github: "", website: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await api.getCompanyProfile(token);
        if (!ignore && res?.profile) {
          setProfile(res.profile);
        }
      } catch (err) {
        console.warn("Failed to load company profile:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (token) load();
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network, value) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [network]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!profile.companyName || !profile.companyName.trim()) {
      setError("Company Name is required.");
      return;
    }

    setSaving(true);
    try {
      await api.updateCompanyProfile(profile, token);
      setSuccess("Company branding & profile saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update company profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading company profile...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: "750px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Company Profile & Branding</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Information shown to candidates on job openings and company showcase pages.
          </p>
        </div>
      </div>

      {error && <div className="badge badge-red" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="badge badge-green" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{success}</div>}

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
          Company Legal / Operating Name *
        </label>
        <input
          type="text"
          value={profile.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
          placeholder="e.g. Razorpay Technologies Pvt. Ltd."
          className="input-field"
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
          Tagline
        </label>
        <input
          type="text"
          value={profile.tagline || ""}
          onChange={(e) => handleChange("tagline", e.target.value)}
          placeholder="e.g. The modern payment gateway powering digital India."
          className="input-field"
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Industry
          </label>
          <input
            type="text"
            value={profile.industry || "Information Technology"}
            onChange={(e) => handleChange("industry", e.target.value)}
            className="input-field"
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Company Size
          </label>
          <select
            value={profile.companySize || "51-200"}
            onChange={(e) => handleChange("companySize", e.target.value)}
            className="input-field"
            style={{ width: "100%" }}
          >
            <option value="1-10">1-10 Employees (Seed / Startup)</option>
            <option value="11-50">11-50 Employees</option>
            <option value="51-200">51-200 Employees (Growth)</option>
            <option value="201-500">201-500 Employees</option>
            <option value="500-1000">500-1000 Employees</option>
            <option value="1000+">1000+ Employees (Enterprise)</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Headquarters Location
          </label>
          <input
            type="text"
            value={profile.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="e.g. Koramangala, Bengaluru"
            className="input-field"
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Official Website
          </label>
          <input
            type="text"
            value={profile.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://company.com"
            className="input-field"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
          Company Overview & Culture
        </label>
        <textarea
          value={profile.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={5}
          placeholder="Share your company vision, mission, engineering culture, and work environment..."
          className="input-field"
          style={{ width: "100%", lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? "Saving Changes..." : "Save Company Profile"}
        </button>
      </div>
    </form>
  );
};
