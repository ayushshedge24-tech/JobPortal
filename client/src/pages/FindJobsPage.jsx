import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Drawer } from "../components/ui/Drawer";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonJobCard } from "../components/ui/Skeleton";
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  RotateCcw,
  IndianRupee,
  Bookmark,
  ArrowRight,
  Building,
  Clock,
  CheckCircle2,
  ExternalLink,
  Laptop,
  GraduationCap,
} from "lucide-react";

export const FindJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Saved / Bookmarked jobs
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jobportal_saved_jobs") || "[]");
    } catch {
      return [];
    }
  });

  // Filter States initialized from URL params
  const [keyword, setKeyword] = useState(() => searchParams.get("q") || "");
  const [location, setLocation] = useState(() => searchParams.get("location") || "");
  const [selectedCity, setSelectedCity] = useState(() => searchParams.get("city") || "All");
  const [selectedType, setSelectedType] = useState(() => searchParams.get("type") || "All");
  const [selectedWorkMode, setSelectedWorkMode] = useState(() => searchParams.get("workMode") || "All");
  const [selectedExperience, setSelectedExperience] = useState(() => searchParams.get("experience") || "All");
  const [selectedSalaryMin, setSelectedSalaryMin] = useState(() => searchParams.get("salaryMin") || "All");
  const [sortBy, setSortBy] = useState(() => searchParams.get("sort") || "newest");

  // Fetch Jobs from backend API
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const data = await api.getJobs();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Sync state changes with URL query parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    if (selectedCity !== "All") params.set("city", selectedCity);
    if (selectedType !== "All") params.set("type", selectedType);
    if (selectedWorkMode !== "All") params.set("workMode", selectedWorkMode);
    if (selectedExperience !== "All") params.set("experience", selectedExperience);
    if (selectedSalaryMin !== "All") params.set("salaryMin", selectedSalaryMin);
    if (sortBy !== "newest") params.set("sort", sortBy);
    setSearchParams(params, { replace: true });
  }, [keyword, location, selectedCity, selectedType, selectedWorkMode, selectedExperience, selectedSalaryMin, sortBy, setSearchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrlParams();
    }, 250);
    return () => clearTimeout(handler);
  }, [updateUrlParams]);

  // Toggle Bookmark
  const toggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    let updated;
    if (savedJobs.includes(jobId)) {
      updated = savedJobs.filter((id) => id !== jobId);
    } else {
      updated = [...savedJobs, jobId];
    }
    setSavedJobs(updated);
    try {
      localStorage.setItem("jobportal_saved_jobs", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setKeyword("");
    setLocation("");
    setSelectedCity("All");
    setSelectedType("All");
    setSelectedWorkMode("All");
    setSelectedExperience("All");
    setSelectedSalaryMin("All");
    setSortBy("newest");
    setSearchParams({}, { replace: true });
  };

  // Filter & Sort jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Keyword search
      const titleMatch =
        !keyword ||
        job.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        job.company?.toLowerCase().includes(keyword.toLowerCase()) ||
        job.skills?.some((s) => s.toLowerCase().includes(keyword.toLowerCase())) ||
        job.description?.toLowerCase().includes(keyword.toLowerCase());

      // 2. Location & City search
      const locationMatch =
        !location ||
        job.location?.toLowerCase().includes(location.toLowerCase());

      const cityMatch =
        selectedCity === "All" ||
        job.location?.toLowerCase().includes(selectedCity.toLowerCase());

      // 3. Job Type
      const typeMatch =
        selectedType === "All" ||
        job.jobType?.toLowerCase() === selectedType.toLowerCase();

      // 4. Work Mode
      const workModeMatch =
        selectedWorkMode === "All" ||
        (selectedWorkMode === "Remote" && (job.location?.toLowerCase().includes("remote") || job.workMode === "Remote")) ||
        (selectedWorkMode === "Hybrid" && (job.location?.toLowerCase().includes("hybrid") || job.workMode === "Hybrid")) ||
        (selectedWorkMode === "On-site" && (job.workMode === "On-site" || (!job.location?.toLowerCase().includes("remote") && !job.location?.toLowerCase().includes("hybrid"))));

      // 5. Experience
      const expMatch =
        selectedExperience === "All" ||
        (job.experience && job.experience.toLowerCase().includes(selectedExperience.toLowerCase())) ||
        (selectedExperience === "Fresher" && (job.title?.toLowerCase().includes("intern") || job.title?.toLowerCase().includes("junior")));

      // 6. Salary minimum (LPA)
      let salaryMatch = true;
      if (selectedSalaryMin !== "All") {
        const minVal = parseInt(selectedSalaryMin, 10);
        // Extract numbers from salary string (e.g. ₹22 - ₹30 LPA -> 22)
        const matches = (job.salary || "").match(/\d+/g);
        if (matches && matches.length > 0) {
          const jobLpa = parseInt(matches[0], 10);
          salaryMatch = jobLpa >= minVal;
        }
      }

      return titleMatch && locationMatch && cityMatch && typeMatch && workModeMatch && expMatch && salaryMatch;
    });
  }, [jobs, keyword, location, selectedCity, selectedType, selectedWorkMode, selectedExperience, selectedSalaryMin]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [filteredJobs, sortBy]);

  // Set default selected job
  useEffect(() => {
    if (sortedJobs.length > 0 && (!selectedJob || !sortedJobs.some((j) => j._id === selectedJob._id))) {
      setSelectedJob(sortedJobs[0]);
    }
  }, [sortedJobs, selectedJob]);

  const cities = ["All", "Bangalore", "Pune", "Mumbai", "Hyderabad", "Delhi NCR", "Nashik", "Remote"];
  const jobTypes = ["All", "Full-time", "Part-time", "Internship", "Contract"];
  const workModes = ["All", "Remote", "Hybrid", "On-site"];
  const experienceLevels = ["All", "Fresher", "1-3 years", "3-5 years", "5+ years"];
  const salaryBrackets = [
    { label: "All Packages", value: "All" },
    { label: "₹6+ LPA", value: "6" },
    { label: "₹12+ LPA", value: "12" },
    { label: "₹20+ LPA", value: "20" },
    { label: "₹30+ LPA", value: "30" },
  ];

  return (
    <div className="section" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }}>
      <div className="container">
        {/* Top Header */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-1)" }}>
            Explore Verified Tech Jobs in India
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            Discover openings across top startups and MNCs with transparent LPA compensation.
          </p>
        </div>

        {/* Search Bar Bar */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-3)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            gap: "var(--space-3)",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "var(--space-6)",
          }}
        >
          <div style={{ flex: 1, minWidth: "240px" }}>
            <Input
              placeholder="Search by job title, skill (e.g. React, Node, Java), or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              startIcon={<Search size={18} />}
              clearable
              onClear={() => setKeyword("")}
              style={{ height: "44px" }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <Input
              placeholder="City (e.g. Bangalore, Pune, Mumbai, Remote)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              startIcon={<MapPin size={18} />}
              clearable
              onClear={() => setLocation("")}
              style={{ height: "44px" }}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-md hidden-desktop"
            onClick={() => setMobileFilterOpen(true)}
            style={{ display: "none" }}
            id="mobile-filter-btn"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>

        {/* 3-COLUMN DISCOVERY LAYOUT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr 380px",
            gap: "var(--space-6)",
            alignItems: "flex-start",
          }}
          className="discovery-layout"
        >
          {/* COLUMN 1: LEFT FILTERS SIDEBAR */}
          <div
            className="card discovery-sidebar"
            style={{
              position: "sticky",
              top: "86px",
              padding: "var(--space-5)",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontWeight: 700, fontSize: "var(--text-sm)" }}>
                <SlidersHorizontal size={16} color="var(--primary)" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", padding: "2px 6px" }}
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* City Filter */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
                Top Cities & Hubs
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {cities.map((city) => (
                  <label
                    key={city}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      fontSize: "var(--text-xs)",
                      cursor: "pointer",
                      color: selectedCity === city ? "var(--primary)" : "var(--text-primary)",
                      fontWeight: selectedCity === city ? 700 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="cityFilter"
                      checked={selectedCity === city}
                      onChange={() => setSelectedCity(city)}
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode Filter */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
                Work Mode
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {workModes.map((mode) => (
                  <label
                    key={mode}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      fontSize: "var(--text-xs)",
                      cursor: "pointer",
                      color: selectedWorkMode === mode ? "var(--primary)" : "var(--text-primary)",
                      fontWeight: selectedWorkMode === mode ? 700 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="workModeFilter"
                      checked={selectedWorkMode === mode}
                      onChange={() => setSelectedWorkMode(mode)}
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
                Job Type
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {jobTypes.map((type) => (
                  <label
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      fontSize: "var(--text-xs)",
                      cursor: "pointer",
                      color: selectedType === type ? "var(--primary)" : "var(--text-primary)",
                      fontWeight: selectedType === type ? 700 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="jobTypeFilter"
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Compensation (LPA) */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <label className="form-label" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
                Minimum Package (LPA)
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {salaryBrackets.map((sb) => (
                  <label
                    key={sb.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      fontSize: "var(--text-xs)",
                      cursor: "pointer",
                      color: selectedSalaryMin === sb.value ? "var(--primary)" : "var(--text-primary)",
                      fontWeight: selectedSalaryMin === sb.value ? 700 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="salaryMinFilter"
                      checked={selectedSalaryMin === sb.value}
                      onChange={() => setSelectedSalaryMin(sb.value)}
                    />
                    <span>{sb.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="form-label" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
                Experience
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {experienceLevels.map((exp) => (
                  <label
                    key={exp}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      fontSize: "var(--text-xs)",
                      cursor: "pointer",
                      color: selectedExperience === exp ? "var(--primary)" : "var(--text-primary)",
                      fontWeight: selectedExperience === exp ? 700 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="expFilter"
                      checked={selectedExperience === exp}
                      onChange={() => setSelectedExperience(exp)}
                    />
                    <span>{exp}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: CENTER JOB RESULTS LIST */}
          <div>
            {/* Header / Results counter */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 600 }}>
                Showing <strong style={{ color: "var(--text-primary)" }}>{sortedJobs.length}</strong> opportunities
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    fontSize: "var(--text-xs)",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Job Title (A-Z)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <SkeletonJobCard />
                <SkeletonJobCard />
                <SkeletonJobCard />
              </div>
            ) : sortedJobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase size={44} />}
                title="No matching opportunities found"
                description="We couldn't find any openings matching your exact filters. Try broadening your keywords or removing location restrictions."
                action={
                  <Button variant="primary" startIcon={<RotateCcw size={16} />} onClick={handleResetFilters}>
                    Reset All Filters
                  </Button>
                }
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {sortedJobs.map((job) => {
                  const isSelected = selectedJob?._id === job._id;
                  const isSaved = savedJobs.includes(job._id);

                  return (
                    <div
                      key={job._id}
                      className="job-card"
                      onClick={() => {
                        setSelectedJob(job);
                        if (window.innerWidth < 1024) {
                          setMobileDrawerOpen(true);
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        borderWidth: isSelected ? "2px" : "1px",
                        borderColor: isSelected ? "var(--primary)" : "var(--border-subtle)",
                        boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-xs)",
                        padding: "var(--space-5)",
                      }}
                    >
                      <div className="job-card-header">
                        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", flex: 1 }}>
                          <div className="job-company-avatar">
                            {job.company ? job.company.charAt(0).toUpperCase() : "C"}
                          </div>
                          <div>
                            <h3 className="job-card-title">{job.title}</h3>
                            <div className="job-card-company">{job.company}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <button
                            type="button"
                            onClick={(e) => toggleSaveJob(e, job._id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              color: isSaved ? "var(--primary)" : "var(--text-muted)",
                            }}
                            title={isSaved ? "Remove from saved" : "Save job"}
                            aria-label="Save job"
                          >
                            <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                          </button>
                          <Badge variant="primary">{job.jobType || "Full-time"}</Badge>
                        </div>
                      </div>

                      <div className="job-meta-list" style={{ marginBottom: "var(--space-3)" }}>
                        <div className="job-meta-item">
                          <MapPin size={14} color="var(--primary)" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="job-meta-item">
                            <span className="badge-rupee" style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                              <IndianRupee size={12} strokeWidth={2.5} />
                              <span>{job.salary.replace("₹", "")}</span>
                            </span>
                          </div>
                        )}
                        <div className="job-meta-item">
                          <Clock size={14} color="var(--text-muted)" />
                          <span>Recent</span>
                        </div>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="job-skills" style={{ marginBottom: 0 }}>
                          {job.skills.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="skill-tag">
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="skill-tag">+{job.skills.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMN 3: RIGHT STICKY JOB PREVIEW PANE (DESKTOP) */}
          <div
            className="card discovery-preview"
            style={{
              position: "sticky",
              top: "86px",
              padding: "var(--space-6)",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
            }}
          >
            {selectedJob ? (
              <div>
                <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-4)" }}>
                  <div className="job-company-avatar" style={{ width: "52px", height: "52px", fontSize: "1.4rem" }}>
                    {selectedJob.company ? selectedJob.company.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "2px" }}>
                      {selectedJob.title}
                    </h2>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 600 }}>
                      {selectedJob.company}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
                  <Badge variant="primary">{selectedJob.jobType || "Full-time"}</Badge>
                  {selectedJob.salary && <Badge variant="rupee">{selectedJob.salary}</Badge>}
                  <Badge variant="neutral">{selectedJob.location}</Badge>
                </div>

                <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
                  <Link to={`/jobs/${selectedJob._id}/apply`} style={{ flex: 1 }}>
                    <Button variant="primary" className="btn-block">
                      Apply Now
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={(e) => toggleSaveJob(e, selectedJob._id)}
                    title="Save Job"
                  >
                    <Bookmark
                      size={18}
                      fill={savedJobs.includes(selectedJob._id) ? "currentColor" : "none"}
                    />
                  </Button>
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)" }}>
                  <h3 style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-2)" }}>
                    Role Overview
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                      whiteSpace: "pre-line",
                      marginBottom: "var(--space-4)",
                    }}
                  >
                    {selectedJob.description}
                  </p>

                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div style={{ marginBottom: "var(--space-6)" }}>
                      <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "var(--space-2)" }}>
                        Required Tech Stack
                      </h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
                        {selectedJob.skills.map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "var(--primary-subtle)",
                              color: "var(--primary)",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/jobs/${selectedJob._id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                      fontSize: "var(--text-xs)",
                      color: "var(--primary)",
                      fontWeight: 700,
                    }}
                  >
                    <span>View Full Job Details & Responsibilities</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "var(--space-10) 0", color: "var(--text-muted)" }}>
                <Briefcase size={36} style={{ margin: "0 auto var(--space-2) auto" }} />
                <p style={{ fontSize: "var(--text-sm)" }}>Select an opening to view quick details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE QUICK PREVIEW DRAWER */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title={selectedJob?.title}
        description={selectedJob?.company}
        footer={
          selectedJob && (
            <div style={{ display: "flex", gap: "var(--space-3)", width: "100%" }}>
              <Link to={`/jobs/${selectedJob._id}/apply`} style={{ flex: 1 }}>
                <Button variant="primary" className="btn-block">
                  Apply for Position
                </Button>
              </Link>
              <Link to={`/jobs/${selectedJob._id}`}>
                <Button variant="secondary">Full Details</Button>
              </Link>
            </div>
          )
        }
      >
        {selectedJob && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
              <Badge variant="primary">{selectedJob.jobType}</Badge>
              {selectedJob.salary && <Badge variant="rupee">{selectedJob.salary}</Badge>}
              <Badge variant="neutral">{selectedJob.location}</Badge>
            </div>
            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
              {selectedJob.description}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
};
