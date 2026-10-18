import React, { useState, useEffect, useTransition } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Edit3,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Layers,
  ShieldCheck,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Hash,
  Check,
} from "lucide-react";
import { api } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { downloadResumePdf } from "../../components/resume-builder/export/pdfVectorEngine";

export const ResumeAnalyzer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    recommendations: true,
    contact: true,
    summary: false,
    experience: true,
    skills: true,
    projects: false,
    education: false,
    certifications: false,
    atsStructure: true,
    formatting: false,
  });

  const [filterPriority, setFilterPriority] = useState("ALL"); // ALL, HIGH, MEDIUM, LOW

  const fetchAnalysis = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setAnalyzing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Parallel fetch of resume details (for export/edit) and analysis
      const [resData, analyzeRes] = await Promise.all([
        api.getResumeById(id, token),
        api.analyzeResume(id, token),
      ]);

      if (resData && resData.data) {
        setResumeData(resData.data);
      }
      if (analyzeRes && analyzeRes.data) {
        setAnalysisData(analyzeRes.data);
        if (isManualRefresh) {
          addToast("Analysis refreshed successfully.", "success");
        }
      }
    } catch (err) {
      console.error("Failed to load resume analysis:", err);
      setError(err.message || "Failed to analyze resume.");
      addToast(err.message || "Failed to analyze resume.", "error");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [id, token]);

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExportPdf = () => {
    if (!resumeData) return;
    try {
      downloadResumePdf(resumeData, resumeData.content);
      addToast("Resume PDF downloaded successfully.", "success");
    } catch (err) {
      addToast("Failed to generate PDF.", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "GOOD":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete
          </span>
        );
      case "NEEDS_ATTENTION":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Attention
          </span>
        );
      case "MISSING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Missing
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            High Priority
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Medium Priority
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Suggestion
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {error || "Could not retrieve resume data for analysis."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/candidate/resumes")}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Back to Resumes
            </button>
            <button
              onClick={() => fetchAnalysis()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, sections, findings, recommendations, analyzerVersion } = analysisData;
  const filteredRecs = filterPriority === "ALL"
    ? recommendations
    : recommendations.filter((r) => r.priority === filterPriority);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/candidate/resumes/${id}`)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Resume Builder"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">Resume Analyzer</h1>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  v{analyzerVersion}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span>{analysisData.resumeTitle}</span>
                <span>•</span>
                <span className="font-mono text-xs">{analysisData.template}</span>
                <span>•</span>
                <span className="text-xs">
                  Analyzed {new Date(analysisData.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchAnalysis(true)}
              disabled={analyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? "animate-spin text-blue-600" : ""}`} />
              Re-Analyze
            </button>
            <button
              onClick={() => navigate(`/candidate/resumes/${id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit in Builder
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Explainability Transparency Notice */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3 text-sm text-blue-900 dark:text-blue-200">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div>
            <span className="font-semibold">Deterministic & Explainable Analysis:</span> All observations below are derived directly from your structured resume data. We do not use arbitrary percentage scores or speculative AI predictions.
          </div>
        </div>

        {/* Category Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</span>
              <Globe className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1">{getStatusBadge(summary.categoryStatuses.contact)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {sections.contact.checks?.hasName && sections.contact.checks?.hasEmail ? "Name & email present" : "Missing key details"}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Summary</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1">{getStatusBadge(summary.categoryStatuses.summary)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {sections.summary.charCount > 0 ? `${sections.summary.charCount} characters` : "Not written yet"}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experience</span>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1">{getStatusBadge(summary.categoryStatuses.experience)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {sections.experience.totalEntries} {sections.experience.totalEntries === 1 ? "role" : "roles"} ({sections.experience.totalBullets} bullets)
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1">{getStatusBadge(summary.categoryStatuses.skills)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {sections.skills.uniqueSkills} unique skills across {sections.skills.categoriesCount || 1} cat.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ATS Structure</span>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-1">{getStatusBadge(summary.categoryStatuses.atsStructure)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {sections.atsStructure.checks?.standardSectionsUsed ? "Canonical format" : "Non-standard order"}
            </p>
          </div>
        </div>

        {/* Actionable Recommendations Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">Actionable Improvement Recommendations</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {recommendations.length}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Concrete steps to improve readability, keyword visibility, and recruiter impact.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-medium">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterPriority === p
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {p === "ALL" ? "All" : p}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredRecs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No recommendations in this filter.</p>
                <p className="text-xs mt-1">Your resume meets all checked criteria for this category.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        {getPriorityBadge(rec.priority)}
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {rec.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{rec.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{rec.message}</p>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400 pt-1 flex items-center gap-1.5">
                        <span className="font-semibold">Action:</span> {rec.action}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/candidate/resumes/${id}`)}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Fix in Builder
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deep-Dive Analysis Accordion */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Deep-Dive Section Findings</h2>

          {/* 1. Contact & Socials */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("contact")}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-base font-bold">Contact & Social Profiles</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email, phone, location, LinkedIn, and GitHub presence</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(sections.contact.status)}
                {expandedSections.contact ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedSections.contact && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Full Name</span>
                    <div className="font-medium mt-0.5">{sections.contact.checks.hasName ? "✅ Verified" : "❌ Missing"}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Email Address</span>
                    <div className="font-medium mt-0.5">{sections.contact.checks.hasEmail ? (sections.contact.checks.hasValidEmail ? "✅ Valid" : "⚠️ Invalid Format") : "❌ Missing"}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Phone Number</span>
                    <div className="font-medium mt-0.5">{sections.contact.checks.hasPhone ? "✅ Present" : "⚠️ Not Provided"}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Social Links</span>
                    <div className="font-medium mt-0.5">{sections.contact.data.socialCount} profiles linked</div>
                  </div>
                </div>

                {sections.contact.findings.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Findings & Evidence</span>
                    {sections.contact.findings.map((f) => (
                      <div key={f.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{f.title}:</span> {f.message}
                        <div className="text-slate-500 mt-0.5 font-mono text-[11px]">Evidence: {f.evidence}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Professional Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("summary")}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold">Professional Summary</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Character count, density, and wording quality</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(sections.summary.status)}
                {expandedSections.summary ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedSections.summary && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Character Count</span>
                    <div className="font-medium mt-0.5">{sections.summary.charCount} characters</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Word Count</span>
                    <div className="font-medium mt-0.5">{sections.summary.wordCount} words</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Ideal Range</span>
                    <div className="font-medium mt-0.5">150 – 800 chars</div>
                  </div>
                </div>

                {sections.summary.findings.map((f) => (
                  <div key={f.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{f.title}:</span> {f.message}
                    <div className="text-slate-500 mt-0.5 font-mono text-[11px]">Evidence: {f.evidence}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Work Experience & Bullet Quality */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("experience")}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold">Work Experience & Bullet Quality</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Action verbs, metrics detection, and bullet point structure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(sections.experience.status)}
                {expandedSections.experience ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedSections.experience && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Total Roles</span>
                    <div className="font-medium mt-0.5">{sections.experience.totalEntries} positions</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Total Bullet Points</span>
                    <div className="font-medium mt-0.5">{sections.experience.totalBullets} bullets</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Action Verbs Found</span>
                    <div className="font-medium mt-0.5">{sections.experience.bulletsWithActionVerbs} bullets</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Metrics & Numbers</span>
                    <div className="font-medium mt-0.5">{sections.experience.bulletsWithMetrics} bullets</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {sections.experience.findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{f.title}:</span> {f.message}
                      <div className="text-slate-500 mt-0.5 font-mono text-[11px]">Evidence: {f.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Skills & Competencies */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("skills")}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">Skills & Competencies</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Unique skill count, category breakdown, duplicate checks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(sections.skills.status)}
                {expandedSections.skills ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedSections.skills && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Unique Skills</span>
                    <div className="font-medium mt-0.5">{sections.skills.uniqueSkills} skills</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Categories</span>
                    <div className="font-medium mt-0.5">{sections.skills.categoriesCount} categories</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Duplicates Detected</span>
                    <div className="font-medium mt-0.5">{sections.skills.duplicateCount} duplicates</div>
                  </div>
                </div>

                {sections.skills.categoryDistribution && Object.keys(sections.skills.categoryDistribution).length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category Breakdown</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(sections.skills.categoryDistribution).map(([cat, count]) => (
                        <span key={cat} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {cat}: <strong className="ml-1">{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {sections.skills.findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{f.title}:</span> {f.message}
                      <div className="text-slate-500 mt-0.5 font-mono text-[11px]">Evidence: {f.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Projects & Practical Work */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("projects")}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold">Featured Projects</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Repositories, live links, and tech stack tags</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(sections.projects.status)}
                {expandedSections.projects ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedSections.projects && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Total Projects</span>
                    <div className="font-medium mt-0.5">{sections.projects.totalProjects} projects</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Projects with Links</span>
                    <div className="font-medium mt-0.5">{sections.projects.projectsWithLinks} linked</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">With Tech Stacks</span>
                    <div className="font-medium mt-0.5">{sections.projects.projectsWithTech} projects</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {sections.projects.findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{f.title}:</span> {f.message}
                      <div className="text-slate-500 mt-0.5 font-mono text-[11px]">Evidence: {f.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. ATS Structural Readiness */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("atsStructure")}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold">ATS Structural Integrity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Canonical section ordering, hidden section alerts, parser readiness</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(sections.atsStructure.status)}
                {expandedSections.atsStructure ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedSections.atsStructure && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Standard Section Order</span>
                    <div className="font-medium mt-0.5">{sections.atsStructure.checks.standardSectionsUsed ? "✅ Verified" : "⚠️ Non-Standard"}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Contact Parseability</span>
                    <div className="font-medium mt-0.5">{sections.atsStructure.checks.contactInfoReadable ? "✅ High" : "❌ Incomplete"}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Hidden Core Sections</span>
                    <div className="font-medium mt-0.5">{sections.atsStructure.checks.experienceVisible && sections.atsStructure.checks.skillsVisible ? "✅ None" : "⚠️ Yes"}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {sections.atsStructure.findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{f.title}:</span> {f.message}
                      <div className="text-slate-500 mt-0.5 font-mono text-[11px]">Evidence: {f.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Formatting & Content Volume */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("formatting")}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="text-base font-bold">Formatting & Content Volume</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Typography, line spacing, brand color, estimated volume profile</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(sections.formatting.status)}
                {expandedSections.formatting ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedSections.formatting && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-3 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Font Size</span>
                    <div className="font-medium mt-0.5">{sections.formatting.styling.fontSize}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Line Spacing</span>
                    <div className="font-medium mt-0.5">{sections.formatting.styling.lineSpacing}</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Brand Color</span>
                      <div className="font-mono text-xs font-semibold mt-0.5">{sections.formatting.styling.primaryColor}</div>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700"
                      style={{ backgroundColor: sections.formatting.styling.primaryColor }}
                    />
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-xs text-slate-500">Volume Profile</span>
                    <div className="font-medium mt-0.5 text-xs">{sections.formatting.volume.classification}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {sections.formatting.findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{f.title}:</span> {f.message}
                      <div className="text-slate-500 mt-0.5 font-mono text-[11px]">Evidence: {f.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
