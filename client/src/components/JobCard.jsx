import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  IndianRupee,
  Clock,
  ArrowRight,
} from "lucide-react";

export const JobCard = ({ job }) => {
  if (!job) return null;

  const {
    _id,
    title = "Software Engineer",
    company = "Tech Company",
    location = "Bangalore, India",
    salary = "₹12 - ₹18 LPA",
    jobType = "Full-time",
    skills = [],
    createdAt,
  } = job;

  // Format salary to guarantee ₹ prefix if missing
  const formattedSalary = salary?.startsWith("₹") ? salary : `₹${salary}`;

  // Colors for different job types
  const getJobTypeBadgeClass = (type) => {
    switch (type) {
      case "Full-time":
        return "badge-blue";
      case "Part-time":
        return "badge-purple";
      case "Internship":
        return "badge-green";
      case "Contract":
        return "badge-amber";
      default:
        return "badge-blue";
    }
  };

  const companyInitial = company ? company.charAt(0).toUpperCase() : "C";

  // Format date in Indian context
  const timeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      const diffDays = Math.floor(
        (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      return `${diffDays} days ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="job-card">
      <div>
        {/* Card Header: Avatar, Title, Company & Job Type */}
        <div className="job-card-header">
          <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", flex: 1 }}>
            <div className="job-company-avatar">{companyInitial}</div>
            <div>
              <Link to={`/jobs/${_id}`}>
                <h3 className="job-card-title">{title}</h3>
              </Link>
              <div className="job-card-company">{company}</div>
            </div>
          </div>
          <span className={`badge ${getJobTypeBadgeClass(jobType)}`}>
            {jobType}
          </span>
        </div>

        {/* Meta Info: Location & LPA Salary */}
        <div className="job-meta-list">
          <div className="job-meta-item">
            <MapPin size={15} color="var(--primary)" />
            <span>{location}</span>
          </div>
          {salary && (
            <div className="job-meta-item">
              <span className="badge-rupee" style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                <IndianRupee size={13} strokeWidth={2.5} />
                <span>{formattedSalary.replace("₹", "")}</span>
              </span>
            </div>
          )}
          <div className="job-meta-item">
            <Clock size={14} color="var(--text-light)" />
            <span>{timeAgo(createdAt)}</span>
          </div>
        </div>

        {/* Skills Tags */}
        {skills && skills.length > 0 && (
          <div className="job-skills">
            {skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="skill-tag">+{skills.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: View Details & Apply Buttons */}
      <div className="job-card-footer">
        <Link
          to={`/jobs/${_id}`}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "0.85rem" }}
        >
          View Details
        </Link>
        <Link
          to={`/jobs/${_id}/apply`}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          <span>Apply Now</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
