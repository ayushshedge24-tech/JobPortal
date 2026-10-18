import React from "react";
import { AlertCircle, X } from "lucide-react";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      startIcon = null,
      endIcon = null,
      clearable = false,
      onClear,
      value,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasStartIcon = Boolean(startIcon);
    const hasEndIcon = Boolean(endIcon || (clearable && value));

    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            <span>{label}</span>
            {required && <span className="form-label-required" aria-hidden="true">*</span>}
          </label>
        )}

        <div
          className={`input-container ${hasStartIcon ? "input-has-icon-start" : ""} ${
            hasEndIcon ? "input-has-icon-end" : ""
          }`}
        >
          {startIcon && <div className="input-icon-start">{startIcon}</div>}

          <input
            ref={ref}
            id={inputId}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`input-field ${error ? "border-danger" : ""}`}
            style={error ? { borderColor: "var(--danger)" } : {}}
            {...props}
          />

          {clearable && value && (
            <button
              type="button"
              onClick={onClear}
              className="input-icon-end"
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px" }}
              aria-label="Clear input"
            >
              <X size={16} />
            </button>
          )}

          {!clearable && endIcon && <div className="input-icon-end">{endIcon}</div>}
        </div>

        {error && (
          <div id={`${inputId}-error`} className="form-error-msg" role="alert">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {!error && helperText && (
          <div id={`${inputId}-helper`} className="form-helper-msg">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
