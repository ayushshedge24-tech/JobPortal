import React, { useState } from "react";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Plus, Trash2, Languages, X } from "lucide-react";

const PROFICIENCY_OPTIONS = [
  { value: "Native", label: "Native / Bilingual" },
  { value: "Fluent", label: "Fluent / Full Professional" },
  { value: "Conversational", label: "Conversational / Professional Working" },
  { value: "Basic", label: "Basic / Elementary" },
];

const SUGGESTED_LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Gujarati",
  "Spanish",
  "German",
  "French",
  "Japanese",
];

export const LanguagesEditor = ({ items = [], onChange }) => {
  const [langName, setLangName] = useState("");
  const [proficiency, setProficiency] = useState("Fluent");

  const handleAddLanguage = (customName) => {
    const name = (customName || langName).trim();
    if (!name) return;
    if (items.length >= 8) return;

    if (items.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const newLang = {
      name,
      proficiency,
    };

    onChange([...items, newLang]);
    setLangName("");
  };

  const handleDeleteLanguage = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleProficiencyChange = (index, newProficiency) => {
    const updated = [...items];
    updated[index] = { ...updated[index], proficiency: newProficiency };
    onChange(updated);
  };

  return (
    <div className="languages-editor" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <Card
        variant="default"
        padding="md"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr auto", gap: "var(--space-2)", alignItems: "flex-end" }}>
          <Input
            label="Language Name"
            placeholder="e.g. English, Hindi, German..."
            value={langName}
            onChange={(e) => setLangName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLanguage();
              }
            }}
            maxLength={60}
          />

          <Select
            label="Proficiency"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            options={PROFICIENCY_OPTIONS}
          />

          <Button
            type="button"
            variant="primary"
            onClick={() => handleAddLanguage()}
            disabled={!langName.trim() || items.length >= 8}
            style={{ height: "38px" }}
          >
            <Plus size={16} />
            <span>Add</span>
          </Button>
        </div>
      </Card>

      {/* Suggested Quick Add */}
      <div>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-2)", display: "block" }}>
          Quick suggestions:
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SUGGESTED_LANGUAGES.filter((l) => !items.some((i) => i.name.toLowerCase() === l.toLowerCase())).map((l, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddLanguage(l)}
              className="btn btn-ghost"
              style={{
                fontSize: "var(--text-xs)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-surface)",
                border: "1px dashed var(--border-medium)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              + {l}
            </button>
          ))}
        </div>
      </div>

      {/* Added Languages List */}
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
            <Languages size={22} />
          </div>
          <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            No Languages Added
          </h4>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", maxWidth: "340px", margin: "0 auto var(--space-4) auto" }}>
            Add languages you can communicate in professionally.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
          {items.map((lang, idx) => (
            <div
              key={lang._id || idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-3) var(--space-4)",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <strong style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", display: "block" }}>
                  {lang.name}
                </strong>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {lang.proficiency}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteLanguage(idx)}
                className="btn btn-ghost btn-icon btn-sm"
                title="Remove language"
                aria-label={`Remove ${lang.name}`}
                style={{ color: "var(--danger)", padding: "4px" }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default LanguagesEditor;
