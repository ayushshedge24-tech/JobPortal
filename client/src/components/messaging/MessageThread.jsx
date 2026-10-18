import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageEmptyState } from "./MessageEmptyState";
import { MessageSkeleton } from "./MessageSkeleton";

export const MessageThread = ({ messages = [], currentUserId, loading = false }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (loading) {
    return <MessageSkeleton />;
  }

  if (!messages || messages.length === 0) {
    return (
      <MessageEmptyState
        title="Start the conversation"
        description="Send a message below to begin communicating directly regarding this application."
      />
    );
  }

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem 0.5rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.map((msg) => {
        const senderId = msg.sender?._id || msg.sender;
        const isOwn = senderId?.toString() === currentUserId?.toString();
        return <MessageBubble key={msg._id || msg.createdAt} message={msg} isOwn={isOwn} />;
      })}
    </div>
  );
};
