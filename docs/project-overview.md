# Project Overview

## Project Title

Template Coding Test 2026

## What This Project Delivers

This project is a fullstack chat application built with React on the frontend and Node.js/Express on the backend, with MongoDB for persistence.

The current implementation includes:

- Multiline chat input with keyboard send behavior.
- Dedicated plus-button upload flow for file attachments.
- Generate flow that stores user and AI messages in MongoDB.
- Scrollable conversation history with cursor pagination.
- Backend-managed orphan upload cleanup.
- Baseline automated tests on both backend and frontend.


## Tech Stack

### Frontend

- React 19 + TypeScript + Vite
- TanStack React Query for server state and optimistic updates
- Axios for API communication
- Vitest + Testing Library for frontend tests
- shadcn + TailwindCSS for styling

### Backend

- Node.js + Express + TypeScript
- Zod request validation
- Multer for multipart uploads
- Vitest + Supertest for API integration tests

### Database

- MongoDB + Mongoose
