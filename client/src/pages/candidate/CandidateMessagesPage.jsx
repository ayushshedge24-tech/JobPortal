import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";
import { ConversationList } from "../../components/messaging/ConversationList";
import { ConversationHeader } from "../../components/messaging/ConversationHeader";
import { MessageThread } from "../../components/messaging/MessageThread";
import { MessageComposer } from "../../components/messaging/MessageComposer";
import { MessageEmptyState } from "../../components/messaging/MessageEmptyState";

export const CandidateMessagesPage = () => {
  const { id: routeConvId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(routeConvId || null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Load candidate conversations
  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.getConversations({ search: searchTerm, unreadOnly }, token);
      if (res?.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingList(false);
    }
  }, [token, searchTerm, unreadOnly]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load single conversation details & messages when activeConvId changes
  useEffect(() => {
    if (!activeConvId || !token) return;

    let isMounted = true;
    setLoadingMessages(true);

    const loadThread = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          api.getConversationById(activeConvId, token),
          api.getMessages(activeConvId, { limit: 50 }, token),
        ]);

        if (!isMounted) return;

        if (convRes?.data) {
          setActiveConversation(convRes.data);
        }
        if (msgRes?.data) {
          setMessages(msgRes.data);
        }

        // Mark as read
        await api.markConversationRead(activeConvId, token);
        // Refresh unread counts in list
        setConversations((prev) =>
          prev.map((c) => (c._id === activeConvId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error("Failed to load thread:", err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [activeConvId, token]);

  const handleSelectConversation = (id) => {
    setActiveConvId(id);
    navigate(`/candidate/messages/${id}`);
  };

  const handleSendMessage = async (text) => {
    if (!activeConvId || !token) return false;
    setSending(true);
    try {
      const res = await api.sendMessage(activeConvId, text, token);
      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);
        // Update list snippet
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConvId
              ? {
                  ...c,
                  lastMessage: { text, sender: user?._id, createdAt: new Date() },
                  lastMessageAt: new Date(),
                }
              : c
          )
        );
        return true;
      }
    } catch (err) {
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
    return false;
  };

  return (
    <div className="container" style={{ paddingTop: "1.5rem", paddingBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 140px)",
          minHeight: "550px",
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Left Column: Conversation List */}
        <div
          style={{
            width: activeConvId ? "350px" : "100%",
            maxWidth: "380px",
            minWidth: "280px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <ConversationList
            conversations={conversations}
            selectedId={activeConvId}
            isCandidate={true}
            onSelectConversation={handleSelectConversation}
            loading={loadingList}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            unreadOnly={unreadOnly}
            onToggleUnreadOnly={setUnreadOnly}
          />
        </div>

        {/* Right Column: Active Thread */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "var(--background)",
          }}
        >
          {activeConvId && activeConversation ? (
            <>
              <ConversationHeader
                conversation={activeConversation}
                isCandidate={true}
                onBack={() => {
                  setActiveConvId(null);
                  navigate("/candidate/messages");
                }}
              />
              <MessageThread
                messages={messages}
                currentUserId={user?._id}
                loading={loadingMessages}
              />
              <MessageComposer
                onSendMessage={handleSendMessage}
                sending={sending}
              />
            </>
          ) : (
            <MessageEmptyState
              title="No Conversation Selected"
              description="Select a conversation from the left sidebar to inspect messages and reply to recruiters."
            />
          )}
        </div>
      </div>
    </div>
  );
};
