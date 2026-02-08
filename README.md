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

### Backend .env

Create backend/.env with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
```

### Frontend .env

Create frontend/.env (optional) with:

```
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Backend

```
cd backend
npm install
npm start
```

Backend runs on http://localhost:5000

### Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### Troubleshooting

- “Failed to fetch” typically means the backend is not running on port 5000.
- If CSV export fails, confirm the user is an Admin and the token is valid.
- Check backend logs for any “Create ticket error” stack traces.

## Authentication Flow

- Users register via Sign Up, then sign in with username + password.
- JWT is stored in localStorage and attached to API requests.
- Admin users are restricted to admin routes and actions.
- Password reset uses username validation and a short‑lived reset token.

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

## Deployment Readiness

### Environment Variables Checklist

- MONGO_URI
- JWT_SECRET
- PORT
- VITE_API_URL (frontend)

### Build Steps

```
cd frontend
npm run build
```

Serve the frontend build with a static host and point it to the API URL.

## QA Verification Summary

This repository includes UI and API validations for:

- Auth flows (Sign Up, Sign In, Admin Sign In, Password Reset)
- Ticket creation and status updates
- Notifications and alerts
- Admin‑only routes and actions

Recommended final checks before production:

- Run the UI and confirm each page loads without console errors.
- Verify socket updates for new/updated tickets.
- Confirm CSV export downloads properly for admin users.

## Known Limitations

- Password reset is username‑based and does not send email.
- CSV export currently does not include attachments.

## Future Improvements

- Email/SMS reset flows
- Audit log for admin actions
- Attachment support for tickets
