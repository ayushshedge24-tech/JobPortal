import React from "react";
import { AlertCircle } from "lucide-react";

export const Textarea = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      rows = 4,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={textareaId} className="form-label">
            <span>{label}</span>
            {required && <span className="form-label-required" aria-hidden="true">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          className={`textarea-field ${error ? "border-danger" : ""}`}
          style={error ? { borderColor: "var(--danger)" } : {}}
          {...props}
        />

        {error && (
          <div id={`${textareaId}-error`} className="form-error-msg" role="alert">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {!error && helperText && (
          <div id={`${textareaId}-helper`} className="form-helper-msg">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
