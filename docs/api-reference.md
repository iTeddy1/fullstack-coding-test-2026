# API Reference

Base URL:

- Backend root: http://localhost:5000
- API root: /api

## Error Response Shapes

Validation error (400):

{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    {
      "field": "text",
      "message": "Text is required"
    }
  ]
}

Operational error:

{
  "status": "fail",
  "message": "sessionId is required."
}

Unexpected server error:

{
  "status": "error",
  "message": "Internal Server Error"
}

## 1. Upload File

- Method: POST
- Path: /api/chat/upload
- Content-Type: multipart/form-data
- Purpose: Upload one file and return an attachment reference for generate flow.

Request fields:

- file: binary, required
- sessionId: string, required

Success response (200):

{
  "success": true,
  "data": {
    "fileId": "67de1c67f3ea76f6f6ef8f50",
    "attachment": {
      "fileId": "67de1c67f3ea76f6f6ef8f50",
      "name": "sample.txt",
      "type": "text/plain",
      "url": "/uploads/1711023000000-123456789-sample.txt",
      "source": "uploaded"
    }
  }
}

Error codes:

- 400: No file uploaded, missing sessionId, or invalid request shape
- 500: Upload persistence failure

## 2. Generate Chat Response

- Method: POST
- Path: /api/chat/generate
- Purpose: Persist user message, generate simulated AI response, persist AI message.

Request body:

{
  "sessionId": "test-session-123",
  "text": "Summarize this file",
  "model": "GPT-4.1",
  "tool": "Search",
  "attachments": [
    {
      "url": "/uploads/1711023000000-123456789-sample.txt",
      "name": "sample.txt",
      "type": "text/plain",
      "fileId": "67de1c67f3ea76f6f6ef8f50",
      "source": "uploaded"
    }
  ]
}

Validation notes:

- text: 1 to 2000 characters after trim
- attachments: max 5
- attachment url: must be /uploads/... or public http/https
- attachment source: uploaded

Success response (200):

{
  "success": true,
  "data": {
    "aiMessage": {
      "_id": "67dcc4be7ff3a0f30f407e3a",
      "sessionId": "test-session-123",
      "role": "ai",
      "text": "this is. ... Summarize this file",
      "attachments": [],
      "timestamp": "2026-03-21T10:12:03.123Z"
    }
  }
}

Error codes:

- 400: Validation failed
- 500: Generation or persistence failure

## 3. Get Chat History

- Method: GET
- Path: /api/chat/:sessionId
- Purpose: Return cursor-paginated messages for a session.

Path params:

- sessionId: string, required

Query params:

- cursor: string, optional
- limit: number, optional, default 20, max 100

Success response (200):

{
  "success": true,
  "data": [
    {
      "_id": "67dcc3f57ff3a0f30f407e35",
      "sessionId": "test-session-123",
      "role": "user",
      "text": "Hello",
      "attachments": [],
      "timestamp": "2026-03-21T10:11:01.000Z"
    }
  ],
  "nextCursor": "67dcc3f57ff3a0f30f407e35",
  "hasNextPage": true
}

Error codes:

- 400: Invalid sessionId/cursor/limit
- 500: Query failure

## 4. Clear Chat Session

- Method: POST
- Path: /api/chat/:sessionId
- Purpose: Delete session chat history and session upload files/records.

Success response (200):

{
  "success": true,
  "data": {
    "chats": {
      "deletedCount": 12
    },
    "uploads": {
      "deletedCount": 2,
      "fileDeleteFailures": 0
    }
  }
}

Error codes:

- 400: Missing or invalid sessionId
- 500: Delete operation failure
