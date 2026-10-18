import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { Download, AlertTriangle, CheckCircle2, Shield } from "lucide-react";

export const ImportProfileModal = ({
  isOpen,
  onClose,
  onConfirmImport,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Master Profile Data"
      description="Populate this resume with information from your Candidate Profile"
      maxWidth="520px"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", width: "100%" }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmImport}
            loading={loading}
            startIcon={<Download size={16} />}
          >
            Import Snapshot Data
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Alert
          variant="warning"
          title="Snapshot Decoupling"
          icon={<AlertTriangle size={18} />}
        >
          Importing will overwrite the current content of this resume with the latest verified data from your Candidate Profile.
        </Alert>

        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <p style={{ margin: "0 0 var(--space-2) 0" }}>
            The following sections will be imported as an independent snapshot:
          </p>

          <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
            <li><strong>Personal Information:</strong> Name, headline, email, phone, location, links</li>
            <li><strong>Professional Summary:</strong> Bio and career overview</li>
            <li><strong>Work Experience:</strong> Past positions and achievements</li>
            <li><strong>Education:</strong> Academic degrees and institutions</li>
            <li><strong>Skills:</strong> Verified skills tagged to appropriate categories</li>
          </ul>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3)",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
          }}
        >
          <Shield size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <span>
            Your master profile remains untouched when you edit this resume.
          </span>
        </div>
      </div>
    </Modal>
  );
};
export default ImportProfileModal;
