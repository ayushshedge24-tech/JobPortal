import React from "react";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";

export const BuilderWorkspace = ({
  resume = {},
  content = {},
  activeSection = "PERSONAL",
  onSelectSection,
  onContentChange,
  onTemplateChange,
  zoom = 1,
  onChangeZoom,
  activeMobileTab = "editor",
  className = "",
}) => {
  return (
    <div
      className={`builder-workspace ${className}`}
      style={{
        display: "grid",
        height: "calc(100vh - 61px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Desktop & Tablet Split Grid */}
      <div
        className="builder-grid-container"
        style={{
          display: "grid",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Editor Column */}
        <div
          className={`builder-col-editor ${activeMobileTab === "editor" ? "block" : "hidden md:block"}`}
          style={{
            height: "100%",
            overflowY: "auto",
          }}
        >
          <EditorPanel
            activeSection={activeSection}
            onSelectSection={onSelectSection}
            content={content}
            resume={resume}
            onContentChange={onContentChange}
            onTemplateChange={onTemplateChange}
          />
        </div>

        {/* Live Preview Column */}
        <div
          className={`builder-col-preview ${activeMobileTab === "preview" ? "block" : "hidden md:block"}`}
          style={{
            height: "100%",
            overflowY: "hidden",
          }}
        >
          <PreviewPanel
            resume={resume}
            content={content}
            zoom={zoom}
            onChangeZoom={onChangeZoom}
          />
        </div>
      </div>

      <style>{`
        .builder-grid-container {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .builder-grid-container {
            grid-template-columns: 50% 50%;
          }
        }
        @media (min-width: 1024px) {
          .builder-grid-container {
            grid-template-columns: 42% 58%;
          }
        }
        @media (min-width: 1440px) {
          .builder-grid-container {
            grid-template-columns: 38% 62%;
          }
        }
      `}</style>
    </div>
  );
};

export default BuilderWorkspace;
