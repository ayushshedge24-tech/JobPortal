import React, { useState, useCallback } from "react";
import { Button } from "../../ui/Button";
import { Download, Check, AlertCircle, Loader2 } from "lucide-react";
import { generateResumePdfFilename } from "./filenameUtils";
import { getResumePrintStyles } from "./pdfPrintStyles";
import { downloadResumePdf, compileResumePdfDocument } from "./pdfVectorEngine";

/**
 * Trigger browser vector A4 print stream with sanitized document title
 */
export const triggerResumePrintExport = (resume = {}, content = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const personal = content.personal || {};
      const filename = generateResumePdfFilename(personal, resume.title || "Resume");
      const cleanTitle = filename.replace(/\.pdf$/i, "");

      // Ensure print styles are injected
      const styleId = "resume-pdf-print-stylesheet";
      let styleTag = document.getElementById(styleId);
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        styleTag.innerHTML = getResumePrintStyles();
        document.head.appendChild(styleTag);
      }

      // Save original title and set to sanitized filename
      const originalTitle = document.title;
      document.title = cleanTitle;

      // Small tick to ensure DOM and stylesheet are active before print dialog
      setTimeout(() => {
        try {
          window.print();
          document.title = originalTitle;
          resolve({ success: true, filename });
        } catch (printErr) {
          document.title = originalTitle;
          reject(printErr);
        }
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
};

export const ResumePdfExportButton = ({
  resume = {},
  content = {},
  variant = "primary",
  size = "sm",
  className = "",
  onExportStart,
  onExportEnd,
}) => {
  const [exportState, setExportState] = useState("idle"); // 'idle' | 'exporting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  const handleExport = useCallback(async () => {
    if (exportState === "exporting") return;

    try {
      setExportState("exporting");
      setErrorMessage(null);
      if (onExportStart) onExportStart();

      // Trigger high-fidelity vector print stream
      await triggerResumePrintExport(resume, content);

      setExportState("success");
      if (onExportEnd) onExportEnd({ success: true });

      // Reset to idle after 2.5s
      setTimeout(() => {
        setExportState("idle");
      }, 2500);
    } catch (err) {
      console.error("Resume PDF export failed:", err);
      setExportState("error");
      setErrorMessage(err.message || "Failed to generate PDF");
      if (onExportEnd) onExportEnd({ success: false, error: err });

      setTimeout(() => {
        setExportState("idle");
        setErrorMessage(null);
      }, 3500);
    }
  }, [exportState, resume, content, onExportStart, onExportEnd]);

  return (
    <Button
      type="button"
      variant={exportState === "error" ? "danger" : exportState === "success" ? "secondary" : variant}
      size={size}
      onClick={handleExport}
      disabled={exportState === "exporting"}
      className={`resume-export-pdf-btn ${className}`}
      aria-label="Export Resume to PDF"
      title="Download and export resume as a high-fidelity A4 vector PDF"
      startIcon={
        exportState === "exporting" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : exportState === "success" ? (
          <Check size={15} style={{ color: "var(--success)" }} />
        ) : exportState === "error" ? (
          <AlertCircle size={15} />
        ) : (
          <Download size={15} />
        )
      }
    >
      <span>
        {exportState === "exporting"
          ? "Exporting..."
          : exportState === "success"
          ? "PDF Ready"
          : exportState === "error"
          ? "Export Failed"
          : "Export PDF"}
      </span>
    </Button>
  );
};

export default {
  triggerResumePrintExport,
  downloadResumePdf,
  compileResumePdfDocument,
  ResumePdfExportButton,
};
