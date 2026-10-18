import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { JobCard } from "../components/JobCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { SkeletonJobCard } from "../components/ui/Skeleton";
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Code2,
  BarChart3,
  Cloud,
  Palette,
  Layers,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  Check,
  IndianRupee,
} from "lucide-react";

export const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const data = await api.getJobs();
        setJobs(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (err) {
        console.error("Failed to load featured jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    if (isRemoteOnly) params.set("workMode", "Remote");
    navigate(`/jobs?${params.toString()}`);
  };

  const topCities = [
    "Bangalore",
    "Pune",
    "Mumbai",
    "Hyderabad",
    "Delhi NCR",
    "Remote",
  ];

  const categories = [
    { name: "Software Development", icon: <Code2 size={24} />, count: "Engineering & Architecture", query: "Software" },
    { name: "Data & Analytics", icon: <BarChart3 size={24} />, count: "Data, BI & Pipelines", query: "Data" },
    { name: "AI & Machine Learning", icon: <Sparkles size={24} />, count: "LLMs, ML & Algorithms", query: "AI" },
    { name: "Cloud & DevOps", icon: <Cloud size={24} />, count: "AWS, Docker & K8s", query: "DevOps" },
    { name: "Product UI/UX Design", icon: <Palette size={24} />, count: "Design Systems & Figma", query: "Designer" },
    { name: "Product Management", icon: <Layers size={24} />, count: "Roadmaps & Strategy", query: "Product" },
    { name: "FinTech & Banking", icon: <ShieldCheck size={24} />, count: "Payments & Security", query: "FinTech" },
    { name: "Full Stack MERN", icon: <Zap size={24} />, count: "React, Node & Mongo", query: "MERN" },
  ];

  const featuredCompanies = [
    { name: "Razorpay", tier: "FinTech Unicorn" },
    { name: "Swiggy", tier: "Consumer Tech" },
    { name: "PhonePe", tier: "Payments Leader" },
    { name: "CRED", tier: "FinTech" },
    { name: "Zomato", tier: "FoodTech" },
    { name: "Flipkart", tier: "E-Commerce" },
    { name: "Infosys", tier: "Enterprise IT" },
    { name: "TCS", tier: "Tata Enterprise" },
  ];

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="section-badge">
            <Sparkles size={14} />
            <span>JobPortal 2.0 • India's Modern Career Platform</span>
          </div>

          <h1 className="hero-title">
            Find work that moves your <br className="hidden-mobile" />
            <span className="hero-gradient-text">career forward.</span>
          </h1>

          <p className="hero-description">
            Discover verified tech opportunities matched to your skills, experience, and compensation goals. Transparent LPA packages with direct recruiter contact.
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleSearchSubmit} className="hero-search-box">
            <div className="search-input-group">
              <Search size={18} />
              <input
                type="text"
                placeholder="Job title, skill (e.g. React, MERN, Java), or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="search-input-group">
              <MapPin size={18} />
              <input
                type="text"
                placeholder="City (e.g. Bangalore, Pune, Mumbai)..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" size="lg" startIcon={<Search size={18} />}>
              Find Jobs
            </Button>
          </form>

          {/* Quick Hub Filter Pills & Remote Toggle */}
          <div
            style={{
              marginTop: "var(--space-5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
          >
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600 }}>
              Popular Hubs:
            </span>
            {topCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => navigate(`/jobs?location=${encodeURIComponent(city)}`)}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.25rem 0.75rem",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {city}
              </button>
            ))}
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                marginLeft: "var(--space-3)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={isRemoteOnly}
                onChange={(e) => setIsRemoteOnly(e.target.checked)}
              />
              <span>Remote Only</span>
            </label>
          </div>

          {/* Product UI Composition / Mockup Preview */}
          <div
            style={{
              marginTop: "var(--space-12)",
              maxWidth: "840px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-xl)",
                padding: "var(--space-6)",
                textAlign: "left",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
                    jobportal.in/jobs/preview
                  </span>
                </div>
                <Badge variant="neutral">
                  Role Preview
                </Badge>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-4)", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--text-primary)" }}>
                      Senior Full Stack Engineer
                    </span>
                    <Badge variant="primary">Full-time</Badge>
                    <Badge variant="rupee">₹22 - ₹30 LPA</Badge>
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", display: "flex", gap: "var(--space-3)" }}>
                    <span>Razorpay Technologies</span>
                    <span>•</span>
                    <span>Bangalore (Hybrid)</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--primary)", fontWeight: 700, marginBottom: "4px" }}>
                    Smart Match • Preview
                  </div>
                  <Link to="/jobs">
                    <Button variant="primary" size="sm">
                      View Position
                    </Button>
                  </Link>
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                <span className="skill-tag">React 19</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">MongoDB</span>
                <span className="skill-tag">TypeScript</span>
                <span className="skill-tag">Kafka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED COMPANIES MARQUEE */}
      <section style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", padding: "var(--space-6) 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--space-3)" }}>
            Explore opportunities across India's tech ecosystem
          </div>
          <div className="company-marquee">
            {featuredCompanies.map((c) => (
              <div
                key={c.name}
                className="company-pill"
                onClick={() => navigate(`/jobs?q=${encodeURIComponent(c.name)}`)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "var(--primary-subtle)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>
                  {c.name.charAt(0)}
                </div>
                <span>{c.name}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  ({c.tier})
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CAREER CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <Badge variant="primary" style={{ marginBottom: "var(--space-2)" }}>
              Explore Disciplines
            </Badge>
            <h2 className="section-title">Browse Top Tech Categories</h2>
            <p className="section-subtitle">
              Explore high-growth career tracks with transparent market compensation.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "var(--space-4)" }}>
            {categories.map((cat) => (
              <Card
                key={cat.name}
                variant="interactive"
                onClick={() => navigate(`/jobs?q=${encodeURIComponent(cat.query)}`)}
                style={{ padding: "var(--space-5)" }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", backgroundColor: "var(--primary-subtle)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--space-3)" }}>
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "4px" }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {cat.count}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED JOBS SECTION */}
      <section className="section" style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div className="section-header">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
              <TrendingUp size={16} color="var(--primary)" />
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                Active Opportunities
              </span>
            </div>
            <h2 className="section-title" style={{ marginTop: "var(--space-2)" }}>
              Featured Openings Across India
            </h2>
            <p className="section-subtitle">
              Verified job openings with transparent LPA compensation and direct recruiter contact.
            </p>
          </div>

          {loading ? (
            <div className="jobs-grid">
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "var(--space-10)" }}>
            <Link to="/jobs">
              <Button variant="secondary" size="lg" endIcon={<ArrowRight size={18} />}>
                Explore All Open Positions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (DUAL FLOW) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How JobPortal Works</h2>
            <p className="section-subtitle">
              A frictionless workflow designed for serious candidates and ambitious hiring teams.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }} className="footer-grid">
            {/* Candidate Flow */}
            <Card style={{ padding: "var(--space-8)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "var(--primary-subtle)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--text-lg)" }}>For Job Seekers</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Land your dream tech role</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--primary)", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", marginBottom: "2px" }}>Create your profile</h4>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Set your target tech stack, CTC expectations in LPA, and preferred cities.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--primary)", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", marginBottom: "2px" }}>Discover verified roles</h4>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Filter by salary brackets, remote/hybrid mode, and specific framework requirements.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--primary)", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", marginBottom: "2px" }}>1-Click Apply & Track</h4>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Transmit your profile directly to hiring managers and monitor application status stages.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recruiter Flow */}
            <Card style={{ padding: "var(--space-8)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-md)", background: "var(--success-subtle)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--text-lg)" }}>For Recruiters & Founders</h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hire top engineering talent</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--success)", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", marginBottom: "2px" }}>Post positions in minutes</h4>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Define skills, LPA packages, and work modes using our streamlined job wizard.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--success)", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", marginBottom: "2px" }}>Screen pre-vetted applicants</h4>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Receive qualified candidate profiles with skill compatibility indicators.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-subtle)", color: "var(--success)", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", marginBottom: "2px" }}>Manage recruitment pipeline</h4>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Progress candidates through screening, technical interview, and offer stages.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. AI MATCHING PREVIEW */}
      <section className="section" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container" style={{ maxWidth: "920px" }}>
          <div
            style={{
              padding: "var(--space-10) var(--space-8)",
              background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-subtle) 100%)",
              border: "1px solid var(--primary-border)",
              borderRadius: "var(--radius-xl)",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "var(--space-8)",
              alignItems: "center",
            }}
            className="footer-grid"
          >
            <div>
              <Badge variant="primary" style={{ marginBottom: "var(--space-3)" }}>
                <Sparkles size={13} />
                <span>Smart Match • Coming Soon</span>
              </Badge>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-3)" }}>
                Your next opportunity, aligned to your tech stack.
              </h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--space-6)" }}>
                Our upcoming matching feature helps candidates evaluate profile alignment by comparing tech stacks, years of experience, and notice periods against job requirements.
              </p>
              <Link to="/jobs">
                <Button variant="primary" startIcon={<Search size={16} />}>
                  Explore Verified Roles
                </Button>
              </Link>
            </div>

            <Card style={{ padding: "var(--space-6)", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>Skill Alignment Preview</span>
                <Badge variant="neutral" style={{ fontSize: "0.7rem" }}>Coming Soon</Badge>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-xs)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--success)" }}>
                  <Check size={14} strokeWidth={3} />
                  <span>React.js & TypeScript (Required)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--success)" }}>
                  <Check size={14} strokeWidth={3} />
                  <span>Node.js / Express Architecture (Required)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--success)" }}>
                  <Check size={14} strokeWidth={3} />
                  <span>Experience Requirement: 1-3 years</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--text-muted)" }}>
                  <span style={{ width: "14px", textAlign: "center" }}>○</span>
                  <span>Kafka & Distributed Queues (Preferred)</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. DUAL FINAL CTA */}
      <section className="section" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", color: "#ffffff" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: "var(--space-3)" }}>
            Ready to accelerate your career?
          </h2>
          <p style={{ color: "#cbd5e1", maxWidth: "600px", margin: "0 auto var(--space-8) auto", fontSize: "var(--text-base)" }}>
            Join thousands of software engineers, designers, and managers finding high-growth roles in India.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <Link to="/jobs">
              <Button variant="primary" size="lg" style={{ background: "var(--primary)" }}>
                Browse Open Jobs
              </Button>
            </Link>
            <Link to="/employer-dashboard">
              <Button variant="secondary" size="lg">
                Post a Job Opening
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
