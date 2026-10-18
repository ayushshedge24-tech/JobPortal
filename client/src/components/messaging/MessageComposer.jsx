import React, { useState, useRef, useEffect } from "react";
import { Send, AlertCircle } from "lucide-react";

export const MessageComposer = ({ onSendMessage, sending = false, disabled = false }) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const MAX_CHARS = 4000;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = text.trim();
    if (!clean) return;

    if (clean.length > MAX_CHARS) {
      setError(`Message exceeds maximum length of ${MAX_CHARS} characters.`);
      return;
    }

    setError("");
    onSendMessage(clean).then((success) => {
      if (success) {
        setText("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (error) setError("");

    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
    }
  };

  return (
    <div
      style={{
        padding: "0.85rem 1rem",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--danger, #ef4444)",
            fontSize: "0.8rem",
            marginBottom: "0.5rem",
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "flex-end", gap: "0.6rem" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={sending || disabled}
            placeholder="Write a message... (Press Enter to send)"
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--surface-subtle)",
              color: "var(--text)",
              fontSize: "0.9rem",
              resize: "none",
              outline: "none",
              maxHeight: "140px",
              lineHeight: 1.4,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "0.75rem",
              bottom: "0.4rem",
              fontSize: "0.68rem",
              color: text.length > MAX_CHARS ? "var(--danger)" : "var(--text-muted)",
              pointerEvents: "none",
            }}
          >
            {text.length > 0 && `${text.length}/${MAX_CHARS}`}
          </div>
        </div>
        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          className="btn btn-primary"
          style={{
            height: "40px",
            width: "40px",
            padding: 0,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          title="Send Message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
