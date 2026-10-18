import React from "react";
import { Card } from "../ui/Card";
import { SearchInput } from "../ui/SearchInput";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export const DiscoveryFilters = ({ filters, onChange, onReset }) => {
  const handleInputChange = (field, value) => {
    onChange({ ...filters, [field]: value, page: 1 });
  };

  return (
    <Card style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.6rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>
          <Filter size={16} color="var(--primary)" />
          <span>Filters & Discovery</span>
        </div>

        <button
          type="button"
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
          Keyword / Title / Tech
        </label>
        <Input
          placeholder="e.g. React, Node.js, Fintech"
          value={filters.keyword || ""}
          onChange={(e) => handleInputChange("keyword", e.target.value)}
        />
      </div>

      {/* Location */}
      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
          Location / City
        </label>
        <Input
          placeholder="e.g. Bangalore, Pune, Mumbai"
          value={filters.location || ""}
          onChange={(e) => handleInputChange("location", e.target.value)}
        />
      </div>

      {/* Work Mode */}
      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
          Work Mode
        </label>
        <Select
          value={filters.workMode || ""}
          onChange={(e) => handleInputChange("workMode", e.target.value)}
          options={[
            { value: "", label: "All Work Modes" },
            { value: "Remote", label: "Remote" },
            { value: "Hybrid", label: "Hybrid" },
            { value: "On-site", label: "On-site" },
          ]}
        />
      </div>

      {/* Experience Range */}
      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
          Experience Level
        </label>
        <Select
          value={filters.experience || ""}
          onChange={(e) => handleInputChange("experience", e.target.value)}
          options={[
            { value: "", label: "All Experience Levels" },
            { value: "Fresher", label: "Fresher / Entry Level" },
            { value: "1-3 years", label: "1-3 years" },
            { value: "3-5 years", label: "3-5 years" },
            { value: "5+ years", label: "5+ years (Senior)" },
          ]}
        />
      </div>

      {/* Career Category */}
      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
          Role Category
        </label>
        <Select
          value={filters.category || ""}
          onChange={(e) => handleInputChange("category", e.target.value)}
          options={[
            { value: "", label: "All Categories" },
            { value: "Software Development", label: "Software Development" },
            { value: "Data Analytics", label: "Data Analytics" },
            { value: "Data Science", label: "Data Science & AI" },
            { value: "DevOps", label: "DevOps & Cloud" },
            { value: "Product UI/UX Design", label: "Product UI/UX Design" },
            { value: "Quality Assurance", label: "Quality Assurance" },
          ]}
        />
      </div>

      {/* Sort Option */}
      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
          Sort Alignment By
        </label>
        <Select
          value={filters.sort || "RELEVANCE"}
          onChange={(e) => handleInputChange("sort", e.target.value)}
          options={[
            { value: "RELEVANCE", label: "Skill Alignment (Default)" },
            { value: "NEWEST", label: "Newest Postings" },
            { value: "SALARY_HIGH", label: "Salary: High to Low" },
            { value: "SALARY_LOW", label: "Salary: Low to High" },
          ]}
        />
      </div>
    </Card>
  );
};
