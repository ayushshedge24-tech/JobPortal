import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Plus, Trash2, ChevronUp, ChevronDown, ShieldCheck, Globe, Calendar, Award } from "lucide-react";

export const CertificationsEditor = ({ items = [], onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleAddItem = () => {
    if (items.length >= 15) return;
    const newItem = {
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    };
    const updated = [...items, newItem];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDeleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex >= updated.length) {
      setExpandedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
    setExpandedIndex(targetIndex);
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
    <div className="certifications-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>
          Add professional certifications and credentials ({items.length}/15 entries).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={items.length >= 15}
        >
          <Plus size={15} />
          <span>Add Certification</span>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card
          variant="default"
          padding="lg"
          style={{
            textAlign: "center",
            padding: "var(--space-8) var(--space-4)",
            border: "1px dashed var(--border-medium)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-3) auto",
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Certifications Added
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add AWS, Google Cloud, Microsoft, or domain certifications.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddItem}>
            <Plus size={15} />
            <span>Add First Certification</span>
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {items.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const titleDisplay = item.name || `Certification #${idx + 1}`;

            return (
              <Card
                key={item._id || idx}
                variant="default"
                padding="none"
                style={{
                  border: isExpanded ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    backgroundColor: isExpanded ? "var(--bg-secondary)" : "var(--bg-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", overflow: "hidden" }}>
                    <ShieldCheck size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {titleDisplay}
                    </span>
                    {item.issuer && (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        by {item.issuer}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Move Up"
                      aria-label="Move Up"
                      style={{ padding: "4px" }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Move Down"
                      aria-label="Move Down"
                      style={{ padding: "4px" }}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Delete Entry"
                      aria-label="Delete Entry"
                      style={{ color: "var(--danger)", padding: "4px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Certification Title"
                        placeholder="e.g. AWS Certified Solutions Architect"
                        value={item.name || ""}
                        onChange={(e) => handleUpdateItem(idx, "name", e.target.value)}
                        maxLength={150}
                        required
                      />

                      <Input
                        label="Issuing Organization"
                        placeholder="e.g. Amazon Web Services (AWS)"
                        value={item.issuer || ""}
                        onChange={(e) => handleUpdateItem(idx, "issuer", e.target.value)}
                        maxLength={150}
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Issue Date"
                        placeholder="e.g. Mar 2023"
                        value={item.issueDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "issueDate", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />

                      <Input
                        label="Expiration Date (Optional)"
                        placeholder="e.g. Mar 2026 or Never"
                        value={item.expiryDate || ""}
                        onChange={(e) => handleUpdateItem(idx, "expiryDate", e.target.value)}
                        maxLength={30}
                        startIcon={<Calendar size={16} />}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
                      <Input
                        label="Credential ID (Optional)"
                        placeholder="e.g. AWS-12345678"
                        value={item.credentialId || ""}
                        onChange={(e) => handleUpdateItem(idx, "credentialId", e.target.value)}
                        maxLength={100}
                        startIcon={<Award size={16} />}
                      />

                      <Input
                        label="Credential URL / Verification Link"
                        placeholder="https://credly.com/your-badge"
                        value={item.credentialUrl || ""}
                        onChange={(e) => handleUpdateItem(idx, "credentialUrl", e.target.value)}
                        maxLength={250}
                        startIcon={<Globe size={16} />}
                        error={!isSafeUrl(item.credentialUrl) ? "Invalid URL protocol" : undefined}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CertificationsEditor;
