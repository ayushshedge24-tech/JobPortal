# JobPortal 2.0 — Phase 4N: Platform Messaging & Communication Center

## 1. Overview
Phase 4N introduces a secure, production-grade **Candidate ↔ Recruiter Messaging & Communication Center** for JobPortal 2.0.

It enables authenticated candidates and recruiters to engage in context-aware, 1-on-1 messaging directly anchored to job applications:
1. **Candidate Message Center (`/candidate/messages`, `/candidate/messages/:id`):** Real-time dual-pane workspace for candidates to view active recruiter conversations, search by job/recruiter name, filter by unread status, inspect application contexts, and send plain-text replies.
2. **Recruiter Message Center (`/recruiter/messages`, `/recruiter/messages/:id`):** Unified communication hub for recruiters to manage applicant inquiries, launch direct conversations from the ATS Pipeline and Application Details review pages, and maintain factual audit trails.
3. **Context-Aware Bounded Messaging:** Conversations are logically unique and strictly bound to a valid `{ candidate, recruiter, application, job }` relationship. Unsolicited cold spamming across unapplied candidates or unrelated jobs is strictly prohibited.
4. **Deterministic Deduplication:** Repeated conversation initialization requests for the same application/job return the existing single thread.
5. **Phase 4K Notification Integration:** Real-time system notifications of type `MESSAGE_RECEIVED` are dispatched to the recipient with idempotent `eventKey: MESSAGE_RECEIVED_<messageId>`. Private message bodies are omitted from notification payloads to preserve user confidentiality.
6. **Immutable Message Audit Trail:** Sent messages are immutable and persistent (no client editing or hard deletion in v1).

> **Core Platform Invariant:**  
> "Messaging is strictly context-aware and bound to valid candidate-application-job relationships. Identities are derived exclusively server-side from JWT `req.user._id`, and message counts remain 100% factual with zero synthetic engagement or AI response scores."

---

## 2. Core Architectural & Security Principles

1. **Strict Context-Aware Bounding & Anti-IDOR:**
   - A candidate may only message the recruiter who posted the job they applied to.
   - A recruiter may only message candidates who submitted an application to their posted position.
   - Arbitrary cold sourcing or cross-job candidate snooping is blocked server-side (403 Forbidden).

2. **Server-Side Identity Binding & Anti-Spoofing:**
   - `sender` is strictly derived from authenticated JWT `req.user._id`.
   - `recipient` is computed server-side from conversation participants.
   - Injected `sender`, `recipient`, `candidate`, or `recruiter` fields in request payloads are completely ignored.

3. **Message Immutability & Plain-Text Security:**
   - Message bodies are plain text with a strict limit of 1 to 4000 characters.
   - All HTML tags and scripts are stripped during server-side sanitization.
   - Client components render message text directly without `dangerouslySetInnerHTML`.
   - Messages cannot be edited or deleted by clients.

4. **Admin Privacy Safeguard:**
   - Platform administrators do not automatically receive access to private candidate/recruiter message threads.
   - Non-participant admins receive 403 Forbidden when attempting to read private conversation messages.

5. **Phase 4K Notification Integration & Privacy:**
   - Sending a message triggers `createNotification` for the recipient with `type: "MESSAGE_RECEIVED"`, `title: "New message"`, and a non-sensitive summary: `"You have a new message from [Name] regarding [Job Title]."`.
   - Deduplication is guaranteed via unique `eventKey: MESSAGE_RECEIVED_<messageId>`.

6. **Dedicated Rate Limiting:**
   - Message sending is protected by a dedicated in-memory rate limiter configured for 30 messages per 5-minute window per authenticated user.

---

## 3. Data Models

### Conversation Model (`server/models/Conversation.js`)
```javascript
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lastMessage: {
      text: { type: String, trim: true, maxlength: 4000, default: "" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    candidateUnreadCount: { type: Number, default: 0, min: 0 },
    recruiterUnreadCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["ACTIVE", "ARCHIVED", "BLOCKED"], default: "ACTIVE", index: true },
  },
  { timestamps: true }
);

// Logical Uniqueness & Efficient Lookups
conversationSchema.index({ candidate: 1, recruiter: 1, application: 1 }, { unique: true });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ candidate: 1, lastMessageAt: -1 });
conversationSchema.index({ recruiter: 1, lastMessageAt: -1 });
```

### Message Model (`server/models/Message.js`)
```javascript
const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    messageType: { type: String, enum: ["TEXT"], default: "TEXT" },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });
```

---

## 4. REST API Endpoints (`/api/conversations` & `/api/messages`)

All endpoints require authentication (`requireAuth`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/conversations` | Returns paginated conversation summaries with search & unread filters |
| `POST` | `/api/conversations` | Retrieves or initializes unique conversation thread for an application |
| `GET` | `/api/conversations/:id` | Returns detailed conversation context and participant information |
| `GET` | `/api/conversations/:id/messages` | Returns paginated chronological message history (max 50 / page) |
| `POST` | `/api/conversations/:id/messages` | Sends a new plain-text message (rate-limited: 30 msgs / 5 min) |
| `PATCH` | `/api/conversations/:id/read` | Marks all unread messages received by user as read and resets unread count |
| `GET` | `/api/conversations/unread-count` | Returns factual total unread message count for authenticated user |
| `GET` | `/api/candidate/conversations` | Candidate convenience alias route |
| `GET` | `/api/candidate/messages/unread-count` | Candidate unread count alias route |
| `GET` | `/api/recruiter/conversations` | Recruiter convenience alias route |
| `GET` | `/api/recruiter/messages/unread-count` | Recruiter unread count alias route |

---

## 5. Frontend Architecture & Components

### UI Components (`client/src/components/messaging/`)
- `ConversationList.jsx`: Searchable sidebar stream of user conversations with "All" and "Unread" filter toggles.
- `ConversationListItem.jsx`: Conversation card with participant avatar, job title, company badge, message preview, timestamp, and unread pill.
- `ConversationHeader.jsx`: Top bar featuring participant profile, job position link, application status badge, and direct application navigation button.
- `MessageThread.jsx`: Chronological chat stream with sender-based left/right alignments, delivery/read checkmarks, and auto-scrolling.
- `MessageBubble.jsx`: High-contrast, theme-aware plain-text message bubble.
- `MessageComposer.jsx`: Textarea with live character counter (0/4000), Send button, disabled states, and Enter key handler.
- `MessageEmptyState.jsx`: Clean zero-state placeholder for unselected or empty conversations.
- `MessageSkeleton.jsx`: Accessible loading skeleton.

### Pages & Integration
- `CandidateMessagesPage.jsx`: Candidate workspace mounted at `/candidate/messages` and `/candidate/messages/:id`.
- `RecruiterMessagesPage.jsx`: Recruiter workspace mounted at `/recruiter/messages` and `/recruiter/messages/:id`.
- `ApplicationDetailsPage.jsx`: Integrated "Message Recruiter" action button.
- `RecruiterApplicationDetailsPage.jsx`: Integrated "Message Candidate" action button.
- `CandidateSummaryDrawer.jsx`: Integrated "Message Candidate" action button in candidate review drawer.
- `Navbar.jsx`: Direct desktop and mobile navigation links with role-specific views.

---

## 6. Automated Verification & Regression Suite

The Phase 4N implementation is verified by a dedicated 74-test unit and contract test suite (`test_phase_4n_messaging.js`), as well as full platform regression covering all 15 phases.

### Phase 4N Test Matrix (74/74 Tests Passing)
1. **Constants & System Config (4 tests):** Version 1.0.0, TEXT message type, ACTIVE/ARCHIVED/BLOCKED statuses, bounds configuration.
2. **Text Sanitization & Security (6 tests):** HTML stripping, CRLF normalization, whitespace trimming, non-string safety, XSS mitigation.
3. **Conversation Context & Boundaries (6 tests):** Valid ID verification, applicant/recruiter ownership validation, applicant mismatch rejection, job poster mismatch rejection, participant array structure, default ACTIVE status.
4. **Deterministic Deduplication (5 tests):** Unique compound index validation, inverted participant collision prevention, separate application thread isolation, initial unread counters (0).
5. **Candidate Authorization & Privacy (6 tests):** Candidate ownership check, cross-candidate blockage, role query filtering, sender spoofing prevention, server-side recipient derivation, arbitrary recipient forgery prevention.
6. **Recruiter Authorization & Privacy (6 tests):** Recruiter ownership check, cross-recruiter blockage, role query filtering, server-side recipient derivation, unapplied candidate messaging prevention, sender spoofing prevention.
7. **Admin Privacy Safeguard (3 tests):** Non-participant admin rejection (403), private message body protection, confidentiality boundary.
8. **Message Sending & Validation (8 tests):** Empty body rejection, whitespace rejection, 4000-char length cap, valid body acceptance, TEXT default, BLOCKED/ARCHIVED state checks, ACTIVE state approval.
9. **Message Immutability & Safe Serialization (4 tests):** Immutability check, no hard delete in v1, password/hash stripping, sender profile preservation.
10. **Conversation Stream & Pagination (6 tests):** Deterministic sorting (lastMessageAt DESC), bounded page size (max 50), bounded page numbers, search filtering, message history pagination limit, chronological message ordering (createdAt ASC).
11. **Read State & Factual Unread Counts (6 tests):** Recruiter unread increment, Candidate unread increment, sender unread invariance, read reset on mark read, read timestamp attachment, zero fake scores.
12. **Phase 4K Notification Integration (6 tests):** MESSAGE_RECEIVED type, idempotent eventKey (MESSAGE_RECEIVED_<messageId>), metadata attachment, notification privacy (no private message body leaked), CONVERSATION entity type, duplicate notification prevention.
13. **Rate Limiting & Anti-Spam (4 tests):** 5-minute window, 30-message limit, user-bound keying, RATE_LIMIT_EXCEEDED error structure.
14. **Cross-Phase Regression Contracts (4 tests):** Phase 4K notification compatibility, Phase 4L recruiter ATS compatibility, Phase 4M admin dashboard compatibility, application status history invariance.

### Platform Regression Summary (15/15 Suites Passing)
- Suite 1: `test_controller_logic.js` (Passed)
- Suite 2: `test_profile_completion.js` (Passed)
- Suite 3: `test_resume_controller_logic.js` (Passed)
- Suite 4: `test_phase_4c_controller_suite.js` (24/24 Passed)
- Suite 5: `test_phase_4d_pdf_export.js` (14/14 Passed)
- Suite 6: `test_phase_4e_analyzer.js` (29/29 Passed)
- Suite 7: `test_phase_4f_skill_intelligence.js` (30/30 Passed)
- Suite 8: `test_phase_4g_job_matching.js` (37/37 Passed)
- Suite 9: `test_phase_4h_career_intelligence.js` (30/30 Passed)
- Suite 10: `test_phase_4i_job_discovery.js` (40/40 Passed)
- Suite 11: `test_phase_4j_job_pipeline.js` (45/45 Passed)
- Suite 12: `test_phase_4k_notifications.js` (40/40 Passed)
- Suite 13: `test_phase_4l_recruiter_workspace.js` (50/50 Passed)
- Suite 14: `test_phase_4m_admin_console.js` (60/60 Passed)
- Suite 15: `test_phase_4n_messaging.js` (74/74 Passed)
