# Architecture and Technical Decisions

## System Architecture

The project uses a 3-layer fullstack architecture:

1. Frontend (React + React Query)
   - Manages input state, upload flow, optimistic updates, and paginated history rendering.
   - Calls backend through an Axios API client.
   - shadcn/ui components styled with Tailwind CSS for a consistent, accessible design system. 

2. Backend (Express + TypeScript)
   - Exposes REST endpoints under /api/chat.
   - Validates payloads with Zod.
   - Executes business logic in service and repository layers.

3. Database (MongoDB + Mongoose)
   - Stores chat messages and upload metadata.
   - Supports cursor-based history pagination.

## Backend Layering

- Route layer
  - Maps endpoints to controller handlers.

- Controller layer
  - Parses and validates request data.
  - Converts service results to API response shape.

- Service layer
  - Implements generation flow, upload lifecycle, and clear-chat behavior.

- Repository layer
  - Encapsulates model operations for chat and upload collections.

## Design Decisions

### Sliding Window Context Strategy

The generation flow uses a bounded recent-history context:

1. Save the newest user message.
2. Read recent messages for the same session.
3. Build an in-memory payload in chronological order.
4. Generate a simulated AI response from that payload.
5. Save the AI message separately.

Implementation detail discovered in code audit:

- Repository default window size is configured with SLIDING_WINDOW_SIZE = 6.
- Current service call explicitly requests 7 recent messages for payload construction.

### Upload Lifecycle and Orphan Cleanup

Uploads are backend-owned with a two-phase lifecycle:

1. POST /api/chat/upload stores file metadata with isAttached = false and expiresAt.
2. POST /api/chat/generate marks referenced uploads as attached after user message persistence.

If an upload is never attached, backend cleanup handles it:

- Scheduled job scans expired unattached uploads.
- Files are deleted from disk.
- Metadata records are deleted from MongoDB.

Clear chat also performs session-level cleanup for both chat records and upload records/files.

### Frontend Rendering and UX Tradeoff

The new AI message typewriter effect is optimized to avoid per-character React state updates.
Text is written incrementally through refs, so rendering work is concentrated around start/finish boundaries rather than content-length-driven state churn.

Product impact:

- Smoother animation under load.
- Lower render overhead for longer responses.
- Better behavior when timers are throttled.

## Error Handling Strategy

- Validation failures return structured 400 responses.
- Operational errors return controlled status/message.
- Unexpected errors are normalized to 500 Internal Server Error.
