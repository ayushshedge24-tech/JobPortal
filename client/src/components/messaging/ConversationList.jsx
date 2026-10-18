import React, { useState } from "react";
import { Search, MessageSquare, Filter } from "lucide-react";
import { ConversationListItem } from "./ConversationListItem";
import { MessageEmptyState } from "./MessageEmptyState";

export const ConversationList = ({
  conversations = [],
  selectedId,
  isCandidate,
  onSelectConversation,
  loading = false,
  searchTerm = "",
  onSearchChange,
  unreadOnly = false,
  onToggleUnreadOnly,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      {/* Search & Filter Header */}
      <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ position: "relative", marginBottom: "0.6rem" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem 0.55rem 2.2rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--surface-subtle)",
              color: "var(--text)",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            onClick={() => onToggleUnreadOnly(false)}
            className={`btn btn-sm ${!unreadOnly ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
          >
            All
          </button>
          <button
            onClick={() => onToggleUnreadOnly(true)}
            className={`btn btn-sm ${unreadOnly ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Conversation Cards Scroll List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <MessageEmptyState
            title={searchTerm ? "No results found" : "No conversations"}
            description={
              searchTerm
                ? "Try searching for a different keyword or name."
                : "Your communication history will appear here once started."
            }
          />
        ) : (
          conversations.map((conv) => (
            <ConversationListItem
              key={conv._id || conv.conversationId}
              conversation={conv}
              isSelected={selectedId === (conv._id || conv.conversationId)}
              isCandidate={isCandidate}
              onClick={() => onSelectConversation(conv._id || conv.conversationId)}
            />
          ))
        )}
      </div>
    </div>
  );
};
