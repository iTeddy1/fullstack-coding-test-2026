# Features and Conversation Flow

## Core Product Features

### 1. Multiline Chat Input

- The message composer is a multiline textarea.
- Enter sends a message.
- Shift + Enter inserts a newline.
- Empty input is rejected.

### 2. Generate Free Action

- The submit CTA is labeled Generate Free.
- Send is blocked while a generation request is pending.
- User message is optimistically inserted before mutation settles.

### 3. Plus Button Upload Flow

- Plus button opens upload options.
- Frontend enforces:
  - Maximum 5 files.
  - Maximum 5 MB per file.
- Submit behavior is upload-first:
  1. Files are uploaded with multipart/form-data.
  2. Backend returns attachment references.
  3. Generate request sends prompt plus attachment references.

### 4. Scrollable Conversation and History Loading

- Message list is scrollable.
- Top sentinel triggers cursor-based pagination for older messages.
- Scroll compensation preserves viewport position after loading older pages.
- A scroll-to-bottom helper button appears when user is far from bottom.

### 5. AI Response Rendering

- AI response is currently simulated on backend.
- New assistant messages can animate with a typewriter effect.
- Typewriter implementation uses ref-based text updates to reduce render overhead.

### 6. Persistent MongoDB Storage

- User messages and AI messages are saved as separate chat records.
- Attachments are stored as metadata references in message payloads.
- Upload files have separate metadata collection with attachment lifecycle fields.
- Clear chat removes both message history and session upload artifacts.

## End-to-End Conversation Flow

1. User types a prompt and optionally selects files.
2. Frontend validates prompt and attachment constraints.
3. Frontend uploads each selected file to POST /api/chat/upload.
4. Backend stores upload metadata and returns attachment references.
5. Frontend sends POST /api/chat/generate with text, model/tool, and attachment references.
6. Backend validates payload via Zod.
7. Backend persists user chat message.
8. Backend marks referenced uploads as attached.
9. Backend builds bounded recent-message context.
10. Backend creates simulated AI response and persists AI message.
11. Frontend invalidates history query and renders updated conversation.
12. Backend cleanup job removes expired orphan uploads in background.

## Technical Notes 

- Current frontend session id is static for coding-test simplicity.
- Upload lifecycle ownership is backend-centric to reduce frontend failure-path complexity.
