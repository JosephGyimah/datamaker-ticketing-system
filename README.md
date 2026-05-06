# Datamaker Ticketing System

## Project Overview

Datamaker Ticketing System is a full‑stack, role‑based service desk platform for reporting, tracking, and resolving issues. It supports user ticket submissions, admin oversight, real‑time updates, and in‑app notifications.

## Core Features

- User registration and login with JWT authentication
- Admin‑only panel for system stats and user management
- Ticket creation, viewing, filtering, and status updates
- Real‑time updates via Socket.io
- In‑app toast alerts and confirmation/prompt modals
- CSV export of tickets (admin only)

## Tech Stack

**Frontend**

- React + Vite
- React Router
- Socket.io client
- Custom CSS (blue/white corporate theme)

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- Socket.io server

**Authentication & Security**

- JWT for auth/session
- bcrypt for password hashing

**Tools**

- Git / GitHub
- VS Code
- Github Copilot

## Folder Structure

```
backend/
  src/
    config/            # DB configuration
    controllers/       # Request handlers
    middleware/        # Auth/role checks
    models/            # Mongoose schemas
    routes/            # API routes
    utils/             # Notifications, CSV export
frontend/
  src/
    components/        # Reusable UI components
    context/           # Auth/Alert state
    pages/             # Route pages
    config/            # API config
```

## Environment Setup

### Requirements

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (Atlas or local)


## Authentication Flow

- Users register via Sign Up, then sign in with username + password.
- JWT is stored in localStorage and attached to API requests.

## Ticket Workflow

- Users can create and view their own tickets.
- Admins can view all tickets and update status.
- Ticket IDs are sequential and formatted like #1, #2, #3.
- Filtering, sorting, and pagination are available on All Tickets.
- CSV export is available only to admins on All Tickets.

## Security Notes

- Role‑based access is enforced in middleware and controllers.
- JWT expiration is enforced by the backend.
- Passwords are hashed with bcrypt before storage.
