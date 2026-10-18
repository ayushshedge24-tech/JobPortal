import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/api";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Award,
  Globe,
  Languages,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Progress } from "../../components/ui/Progress";
import { Alert } from "../../components/ui/Alert";
import { Skeleton } from "../../components/ui/Skeleton";

// Helper to compute completion on the client for live feedback
function computeClientCompletion(profile) {
  if (!profile) return 0;
  let score = 0;

  const hasName = (profile.firstName && profile.firstName.trim().length > 0);
  const hasPhone = profile.phone && profile.phone.trim().length >= 7;
  const hasCity = profile.city && profile.city.trim().length > 0;

  if (hasName && hasPhone && hasCity) score += 15;
  else if (hasName && (hasPhone || hasCity)) score += 10;
  else if (hasName || hasPhone || hasCity) score += 5;

  if (profile.headline && profile.headline.trim().length >= 5) score += 10;
  else if (profile.headline && profile.headline.trim().length > 0) score += 5;

  const summary = profile.professionalSummary || "";
  if (summary.trim().length >= 50) score += 10;
  else if (summary.trim().length > 0) score += 5;

  if (Array.isArray(profile.experience) && profile.experience.length >= 1) score += 20;
  if (Array.isArray(profile.education) && profile.education.length >= 1) score += 15;

  if (Array.isArray(profile.skills)) {
    if (profile.skills.length >= 5) score += 15;
    else if (profile.skills.length >= 1) score += Math.round((profile.skills.length / 5) * 15);
  }

  if (Array.isArray(profile.projects) && profile.projects.length >= 1) score += 5;
  if (Array.isArray(profile.certifications) && profile.certifications.length >= 1) score += 5;

  const links = profile.socialLinks || {};
  const linkCount = [links.linkedin, links.github, links.portfolio, links.website].filter(
    (l) => l && typeof l === "string" && l.trim().length > 0
  ).length;
  if (linkCount >= 2) score += 3;
  else if (linkCount === 1) score += 2;

  const hasPref = (profile.preferredLocations?.length > 0) ||
                  (profile.preferredWorkModes?.length > 0) ||
                  (profile.preferredJobTypes?.length > 0);
  if (hasPref) score += 2;

  return Math.min(100, Math.max(0, score));
}

const TABS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "summary", label: "Headline & Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "social", label: "Links & Social", icon: Globe },
  { id: "preferences", label: "Preferences", icon: Sliders },
];

export const CandidateProfile = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newAchievementInput, setNewAchievementInput] = useState("");

  const [initialProfile, setInitialProfile] = useState(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    professionalSummary: "",
    phone: "",
    location: "",
    city: "",
    state: "",
    currentRole: "",
    experienceYears: 0,
    preferredLocations: [],
    preferredWorkModes: [],
    preferredJobTypes: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    skills: [],
    socialLinks: {
      linkedin: "",
      github: "",
      portfolio: "",
      website: "",
    },
    completionPercentage: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await api.getCandidateProfile(token);
        if (data) {
          // If fresh profile, populate defaults from user object if available
          const nameParts = (user?.name || "").trim().split(" ");
          const populated = {
            ...profile,
            ...data,
            firstName: data.firstName || nameParts[0] || "",
            lastName: data.lastName || nameParts.slice(1).join(" ") || "",
            phone: data.phone || user?.phone || "",
            city: data.city || (user?.location ? user.location.split(",")[0].trim() : ""),
            socialLinks: {
              ...profile.socialLinks,
              ...(data.socialLinks || {}),
            },
          };
          setProfile(populated);
          setInitialProfile(JSON.parse(JSON.stringify(populated)));
        }
      } catch (err) {
        console.error("Failed to load candidate profile:", err);
        addToast("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, token]);

  const updateField = (field, value) => {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const updateNestedField = (parent, field, value) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [field]: value,
        },
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateCandidateProfile(profile, token);
      if (res.profile) {
        setProfile(res.profile);
        setInitialProfile(JSON.parse(JSON.stringify(res.profile)));
      } else {
        setInitialProfile(JSON.parse(JSON.stringify(profile)));
      }
      setHasUnsavedChanges(false);
      addToast("Profile saved successfully! 🎉", "success");
    } catch (err) {
      console.error("Save failed:", err);
      addToast(err.message || "Failed to save profile. Please check your inputs.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (initialProfile) {
      setProfile(JSON.parse(JSON.stringify(initialProfile)));
      setHasUnsavedChanges(false);
      addToast("Unsaved changes discarded.", "info");
    }
  };

  // Skill management
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (profile.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      addToast("Skill already added.", "warning");
      return;
    }
    updateField("skills", [...profile.skills, trimmed]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    updateField("skills", profile.skills.filter((s) => s !== skillToRemove));
  };

  // Experience management
  const handleAddExperience = () => {
    const newEntry = {
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    };
    updateField("experience", [newEntry, ...profile.experience]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: value };
    updateField("experience", updated);
  };

  const handleRemoveExperience = (index) => {
    const updated = profile.experience.filter((_, i) => i !== index);
    updateField("experience", updated);
  };

  // Education management
  const handleAddEducation = () => {
    const newEntry = {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
    };
    updateField("education", [newEntry, ...profile.education]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    updateField("education", updated);
  };

  const handleRemoveEducation = (index) => {
    const updated = profile.education.filter((_, i) => i !== index);
    updateField("education", updated);
  };

  // Project management
  const handleAddProject = () => {
    const newEntry = {
      title: "",
      description: "",
      technologies: [],
      url: "",
    };
    updateField("projects", [newEntry, ...profile.projects]);
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: value };
    updateField("projects", updated);
  };

  const handleRemoveProject = (index) => {
    const updated = profile.projects.filter((_, i) => i !== index);
    updateField("projects", updated);
  };

  // Certification management
  const handleAddCertification = () => {
    const newEntry = {
      name: "",
      issuer: "",
      issueDate: "",
      credentialUrl: "",
    };
    updateField("certifications", [newEntry, ...profile.certifications]);
  };

  const handleUpdateCertification = (index, field, value) => {
    const updated = [...profile.certifications];
    updated[index] = { ...updated[index], [field]: value };
    updateField("certifications", updated);
  };

  const handleRemoveCertification = (index) => {
    const updated = profile.certifications.filter((_, i) => i !== index);
    updateField("certifications", updated);
  };

  // Achievement management
  const handleAddAchievement = (e) => {
    if (e) e.preventDefault();
    const trimmed = newAchievementInput.trim();
    if (!trimmed) return;
    updateField("achievements", [...(profile.achievements || []), trimmed]);
    setNewAchievementInput("");
  };

  const handleRemoveAchievement = (index) => {
    const updated = (profile.achievements || []).filter((_, i) => i !== index);
    updateField("achievements", updated);
  };

  const currentCompletion = computeClientCompletion(profile);

  const getCompletionBadge = (pct) => {
    if (pct >= 85) return <Badge variant="success">All-Star Profile ({pct}%)</Badge>;
    if (pct >= 60) return <Badge variant="warning">Intermediate Profile ({pct}%)</Badge>;
    return <Badge variant="neutral">Starter Profile ({pct}%)</Badge>;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "3rem 1rem", maxWidth: "1050px" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Skeleton height="36px" width="300px" style={{ marginBottom: "0.5rem" }} />
          <Skeleton height="20px" width="500px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "2rem" }}>
          <Skeleton height="350px" />
          <Skeleton height="500px" />
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-profile-page" style={{ paddingBottom: "5rem" }}>
      {/* Top Banner & Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "2.5rem 0 2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1150px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <Link
                to="/candidate-dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.8rem",
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Candidate Dashboard</span>
              </Link>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                Candidate Profile Workspace
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px" }}>
                Build your complete, verified career profile. This data directly powers your applications and resume generation.
              </p>
            </div>

            {/* Profile Strength Widget */}
            <div
              className="card"
              style={{
                padding: "1.25rem 1.5rem",
                minWidth: "280px",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Profile Strength
                </span>
                {getCompletionBadge(currentCompletion)}
              </div>
              <Progress value={currentCompletion} max={100} size="md" variant={currentCompletion >= 80 ? "success" : "primary"} />
              <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                {currentCompletion >= 85
                  ? "✓ Your profile is highly visible to top Indian tech recruiters."
                  : `Fill in the remaining sections to reach 100% profile strength.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div
          style={{
            position: "sticky",
            top: "65px",
            zIndex: 40,
            background: "var(--primary-subtle)",
            borderBottom: "1px solid var(--primary-light)",
            padding: "0.75rem 0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div className="container" style={{ maxWidth: "1150px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
              <AlertCircle size={18} />
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>You have unsaved changes in your profile.</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button variant="ghost" size="sm" onClick={handleDiscard} disabled={saving}>
                <RotateCcw size={14} />
                <span>Discard</span>
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                <Save size={14} />
                <span>Save Profile</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="container" style={{ maxWidth: "1150px", marginTop: "2rem" }}>
        <div className="profile-layout-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem" }}>
          {/* Left Vertical Section Navigator */}
          <div className="profile-nav-sidebar">
            <div
              className="card"
              style={{
                padding: "0.5rem",
                position: "sticky",
                top: hasUnsavedChanges ? "130px" : "85px",
              }}
            >
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-md)",
                        border: "none",
                        background: isActive ? "var(--primary-subtle)" : "transparent",
                        color: isActive ? "var(--primary)" : "var(--text-main)",
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.9rem",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={18} color={isActive ? "var(--primary)" : "var(--text-muted)"} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div style={{ padding: "1rem 0.5rem 0.5rem 0.5rem", borderTop: "1px solid var(--border)", marginTop: "0.5rem" }}>
                <Button variant="primary" fullWidth onClick={handleSave} loading={saving}>
                  <Save size={16} />
                  <span>Save Profile</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Section Content Area */}
          <div className="profile-content-area">
            {/* 1. BASIC INFO TAB */}
            {activeTab === "basic" && (
              <Card style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Basic Personal & Contact Information
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                  Your basic contact identity used for recruitment communication.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                  <Input
                    label="First Name *"
                    placeholder="e.g. Rahul"
                    value={profile.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                  />
                  <Input
                    label="Last Name *"
                    placeholder="e.g. Sharma"
                    value={profile.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                  <Input
                    label="Phone Number *"
                    placeholder="e.g. +91 98765 43210"
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    helperText="Used for interview notifications & SMS updates"
                  />
                  <Input
                    label="Email Address"
                    value={user?.email || ""}
                    disabled
                    helperText="Derived from your authenticated account"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                  <Input
                    label="Primary City *"
                    placeholder="e.g. Bengaluru, Pune, Mumbai"
                    value={profile.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                  <Input
                    label="State / Region"
                    placeholder="e.g. Karnataka, Maharashtra"
                    value={profile.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  <Input
                    label="Current Role / Title"
                    placeholder="e.g. SDE-1 / Associate Engineer"
                    value={profile.currentRole}
                    onChange={(e) => updateField("currentRole", e.target.value)}
                  />
                  <Input
                    label="Total Experience (Years)"
                    type="number"
                    min="0"
                    max="50"
                    value={profile.experienceYears}
                    onChange={(e) => updateField("experienceYears", Number(e.target.value))}
                  />
                </div>
              </Card>
            )}

            {/* 2. HEADLINE & SUMMARY TAB */}
            {activeTab === "summary" && (
              <Card style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Professional Headline & Summary
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                  This acts as your elevator pitch to prospective recruiters and hiring managers.
                </p>

                <div style={{ marginBottom: "1.5rem" }}>
                  <Input
                    label="Professional Headline *"
                    placeholder="e.g. Senior Full-Stack Engineer | React, Node.js, Cloud Architect"
                    value={profile.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    helperText="A concise summary of your specialty (approx. 50-100 characters)"
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <Textarea
                    label="Professional Summary / Bio *"
                    rows={6}
                    placeholder="Provide a comprehensive summary of your engineering background, core competencies, architectural achievements, and what makes you unique..."
                    value={profile.professionalSummary}
                    onChange={(e) => updateField("professionalSummary", e.target.value)}
                    helperText={`${(profile.professionalSummary || "").length}/3000 characters (Recommended: at least 50 characters for full profile score)`}
                  />
                </div>
              </Card>
            )}

            {/* 3. EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <Card style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Work Experience</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      List your professional employment history in reverse chronological order.
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAddExperience}>
                    <Plus size={16} />
                    <span>Add Experience</span>
                  </Button>
                </div>

                {profile.experience.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)" }}>
                    <Briefcase size={36} color="var(--text-light)" style={{ margin: "0 auto 0.75rem auto" }} />
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>No Experience Entries Added Yet</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                      Adding your past roles adds +20% to your profile strength.
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleAddExperience}>
                      <Plus size={16} />
                      <span>Add First Role</span>
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {profile.experience.map((exp, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          padding: "1.5rem",
                          background: "var(--surface-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Role #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--danger)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                          <Input
                            label="Company Name *"
                            placeholder="e.g. Razorpay / Swiggy / Infosys"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                          />
                          <Input
                            label="Role Title *"
                            placeholder="e.g. SDE-2 / Frontend Lead"
                            value={exp.role}
                            onChange={(e) => handleUpdateExperience(index, "role", e.target.value)}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                          <Input
                            label="Location"
                            placeholder="e.g. Bangalore, India"
                            value={exp.location}
                            onChange={(e) => handleUpdateExperience(index, "location", e.target.value)}
                          />
                          <Input
                            label="Start Date *"
                            placeholder="e.g. Jun 2022"
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(index, "startDate", e.target.value)}
                          />
                          <Input
                            label="End Date"
                            placeholder={exp.currentlyWorking ? "Present" : "e.g. May 2024"}
                            disabled={exp.currentlyWorking}
                            value={exp.currentlyWorking ? "Present" : exp.endDate}
                            onChange={(e) => handleUpdateExperience(index, "endDate", e.target.value)}
                          />
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={exp.currentlyWorking}
                              onChange={(e) => handleUpdateExperience(index, "currentlyWorking", e.target.checked)}
                            />
                            <span>I am currently working in this role</span>
                          </label>
                        </div>

                        <Textarea
                          label="Role Description & Key Accomplishments"
                          rows={3}
                          placeholder="Describe the systems you built, technologies utilized, and measurable outcomes achieved (e.g. 'Optimized Redis caching, reducing query latency by 40%')..."
                          value={exp.description}
                          onChange={(e) => handleUpdateExperience(index, "description", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* 4. EDUCATION TAB */}
            {activeTab === "education" && (
              <Card style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Education & Academics</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      Add your university degrees, diplomas, and relevant qualifications.
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAddEducation}>
                    <Plus size={16} />
                    <span>Add Education</span>
                  </Button>
                </div>

                {profile.education.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)" }}>
                    <GraduationCap size={36} color="var(--text-light)" style={{ margin: "0 auto 0.75rem auto" }} />
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>No Education Entries Added Yet</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                      Add your degree or university qualifications (+15% to profile score).
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleAddEducation}>
                      <Plus size={16} />
                      <span>Add Degree</span>
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {profile.education.map((edu, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          padding: "1.5rem",
                          background: "var(--surface-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Education #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(index)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--danger)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                          <Input
                            label="Institution / University *"
                            placeholder="e.g. IIT Bombay / Pune University"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(index, "institution", e.target.value)}
                          />
                          <Input
                            label="Degree *"
                            placeholder="e.g. B.Tech / B.E. / BCA / MCA"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                          <Input
                            label="Field of Study"
                            placeholder="e.g. Computer Science & Engineering"
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleUpdateEducation(index, "fieldOfStudy", e.target.value)}
                          />
                          <Input
                            label="Start Year / Date"
                            placeholder="e.g. 2018"
                            value={edu.startDate}
                            onChange={(e) => handleUpdateEducation(index, "startDate", e.target.value)}
                          />
                          <Input
                            label="End Year / Date"
                            placeholder="e.g. 2022"
                            value={edu.endDate}
                            onChange={(e) => handleUpdateEducation(index, "endDate", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* 5. SKILLS TAB */}
            {activeTab === "skills" && (
              <Card style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>Technical & Soft Skills</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                  Add your core technical competencies, tools, frameworks, and programming languages. (Add 5+ for full +15% score)
                </p>

                {/* Add Skill Form */}
                <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      placeholder="Type a skill (e.g. React, Node.js, MongoDB, Docker, Python) and press Enter"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="primary">
                    <Plus size={16} />
                    <span>Add Skill</span>
                  </Button>
                </form>

                {/* Skills Chips Grid */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                    padding: "1.25rem",
                    background: "var(--surface-subtle)",
                    borderRadius: "var(--radius-md)",
                    minHeight: "120px",
                    alignItems: "flex-start",
                  }}
                >
                  {profile.skills.length === 0 ? (
                    <span style={{ color: "var(--text-light)", fontSize: "0.875rem" }}>
                      No skills added yet. Add skills to increase your visibility to Indian hiring teams.
                    </span>
                  ) : (
                    profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="badge badge-blue"
                        style={{
                          padding: "0.45rem 0.85rem",
                          fontSize: "0.875rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "inherit",
                            cursor: "pointer",
                            padding: "0 0 0 2px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Remove skill"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* 6. PROJECTS TAB */}
            {activeTab === "projects" && (
              <Card style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Featured Projects & Portfolio</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      Showcase applications, open-source work, and technical projects you built.
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAddProject}>
                    <Plus size={16} />
                    <span>Add Project</span>
                  </Button>
                </div>

                {profile.projects.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)" }}>
                    <FolderGit2 size={36} color="var(--text-light)" style={{ margin: "0 auto 0.75rem auto" }} />
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>No Projects Added Yet</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                      Projects validate your practical engineering skills to recruiters (+5%).
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleAddProject}>
                      <Plus size={16} />
                      <span>Add Project</span>
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {profile.projects.map((proj, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          padding: "1.5rem",
                          background: "var(--surface-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Project #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(index)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--danger)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                          <Input
                            label="Project Title *"
                            placeholder="e.g. High-Concurrency Payment Gateway"
                            value={proj.title}
                            onChange={(e) => handleUpdateProject(index, "title", e.target.value)}
                          />
                          <Input
                            label="Project / Live Demo URL"
                            placeholder="e.g. https://github.com/user/project"
                            value={proj.url}
                            onChange={(e) => handleUpdateProject(index, "url", e.target.value)}
                          />
                        </div>

                        <Textarea
                          label="Project Description & Architecture"
                          rows={3}
                          placeholder="Explain what the project does, technologies used, architecture decisions, and performance outcomes..."
                          value={proj.description}
                          onChange={(e) => handleUpdateProject(index, "description", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* 7. CERTIFICATIONS TAB */}
            {activeTab === "certifications" && (
              <Card style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Certifications & Licenses</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      List verified industry credentials (AWS, GCP, CKA, Cisco, Microsoft, etc.).
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAddCertification}>
                    <Plus size={16} />
                    <span>Add Certification</span>
                  </Button>
                </div>

                {profile.certifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", border: "2px dashed var(--border)", borderRadius: "var(--radius-lg)" }}>
                    <Award size={36} color="var(--text-light)" style={{ margin: "0 auto 0.75rem auto" }} />
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>No Certifications Added</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                      Professional certifications strengthen your credibility (+5%).
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleAddCertification}>
                      <Plus size={16} />
                      <span>Add Credential</span>
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {profile.certifications.map((cert, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          padding: "1.5rem",
                          background: "var(--surface-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Certification #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertification(index)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--danger)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                          <Input
                            label="Certification Name *"
                            placeholder="e.g. AWS Certified Solutions Architect"
                            value={cert.name}
                            onChange={(e) => handleUpdateCertification(index, "name", e.target.value)}
                          />
                          <Input
                            label="Issuing Organization *"
                            placeholder="e.g. Amazon Web Services"
                            value={cert.issuer}
                            onChange={(e) => handleUpdateCertification(index, "issuer", e.target.value)}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <Input
                            label="Issue Date"
                            placeholder="e.g. Aug 2023"
                            value={cert.issueDate}
                            onChange={(e) => handleUpdateCertification(index, "issueDate", e.target.value)}
                          />
                          <Input
                            label="Credential Verification URL"
                            placeholder="e.g. https://www.credly.com/badges/..."
                            value={cert.credentialUrl}
                            onChange={(e) => handleUpdateCertification(index, "credentialUrl", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* 8. LINKS & SOCIAL TAB */}
            {activeTab === "social" && (
              <Card style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Professional Links & Social Presence
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                  Links to your GitHub repositories, LinkedIn profile, portfolio, and engineering blog.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <Input
                    label="LinkedIn Profile URL"
                    placeholder="https://linkedin.com/in/username"
                    value={profile.socialLinks?.linkedin || ""}
                    onChange={(e) => updateNestedField("socialLinks", "linkedin", e.target.value)}
                  />
                  <Input
                    label="GitHub Profile URL"
                    placeholder="https://github.com/username"
                    value={profile.socialLinks?.github || ""}
                    onChange={(e) => updateNestedField("socialLinks", "github", e.target.value)}
                  />
                  <Input
                    label="Personal Portfolio Website"
                    placeholder="https://username.dev"
                    value={profile.socialLinks?.portfolio || ""}
                    onChange={(e) => updateNestedField("socialLinks", "portfolio", e.target.value)}
                  />
                  <Input
                    label="Tech Blog / Other Website"
                    placeholder="https://medium.com/@username"
                    value={profile.socialLinks?.website || ""}
                    onChange={(e) => updateNestedField("socialLinks", "website", e.target.value)}
                  />
                </div>
              </Card>
            )}

            {/* 9. JOB PREFERENCES TAB */}
            {activeTab === "preferences" && (
              <Card style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Career & Job Preferences
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                  Help Indian recruiters match you with opportunities aligned with your work preferences.
                </p>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    Preferred Work Modes
                  </label>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {["Remote", "Hybrid", "On-site"].map((mode) => {
                      const isSelected = profile.preferredWorkModes?.includes(mode);
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            const current = profile.preferredWorkModes || [];
                            const next = isSelected ? current.filter((m) => m !== mode) : [...current, mode];
                            updateField("preferredWorkModes", next);
                          }}
                          className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    Preferred Job Types
                  </label>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {["Full-time", "Part-time", "Internship", "Contract"].map((type) => {
                      const isSelected = profile.preferredJobTypes?.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            const current = profile.preferredJobTypes || [];
                            const next = isSelected ? current.filter((t) => t !== type) : [...current, type];
                            updateField("preferredJobTypes", next);
                          }}
                          className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CandidateProfile;
