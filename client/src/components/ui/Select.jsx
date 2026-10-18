import React from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

export const Select = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      options = [],
      children,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={selectId} className="form-label">
            <span>{label}</span>
            {required && <span className="form-label-required" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="input-container input-has-icon-end">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            className={`select-field ${error ? "border-danger" : ""}`}
            style={{ appearance: "none", paddingRight: "2.5rem", cursor: "pointer" }}
            {...props}
          >
            {options && options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value ?? opt} value={opt.value ?? opt}>
                    {opt.label ?? opt}
                  </option>
                ))
              : children}
          </select>

          <div className="input-icon-end" style={{ pointerEvents: "none" }}>
            <ChevronDown size={18} color="var(--text-muted)" />
          </div>
        </div>

        {error && (
          <div id={`${selectId}-error`} className="form-error-msg" role="alert">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {!error && helperText && (
          <div id={`${selectId}-helper`} className="form-helper-msg">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
