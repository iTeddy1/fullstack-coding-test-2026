# Future Improvements

## 1. Real AI Provider Integration

- Replace simulated AI text generation with a real provider.
- Add timeout, retry, and provider-fallback strategy.
- Add token streaming for better response UX.

## 2. Session and Identity Architecture

- Replace static session id with generated or authenticated session ownership.
- Add user authentication and authorization boundaries.
- Support multi-user conversation isolation.

## 3. Upload Pipeline Hardening

- Move local upload storage to object storage (S3/GCS/Azure Blob).
- Add server-side content-type validation and scanning.
- Add retention and cleanup observability dashboards.

## 4. Frontend Robustness and UX

- Add explicit message states (queued/sent/failed/retry).
- Improve mobile attachment interactions and keyboard accessibility.
- Add conversation search and filter.

## 5. Test Depth Expansion

- Add backend tests for negative validation and pagination edge cases.
- Add frontend tests for retry/failure paths and complex scrolling behavior.
- Add end-to-end tests for full upload -> generate -> clear lifecycle.

## 6. Observability and Operations

- Introduce structured logging with request ids.
- Add metrics for latency, error rates, and cleanup activity.
- Add health and readiness checks beyond basic root endpoint.

## 7. Delivery Pipeline

- Add CI workflow for lint, typecheck, and tests.
- Add Docker and compose setup for reproducible local/staging environments.
- Add environment templates and secret-management guidance.
