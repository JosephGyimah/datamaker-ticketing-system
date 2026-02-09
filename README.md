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

### Office Server Laptop Requirements

Install these on the laptop that will host the app locally:

- Node.js 18+ (includes npm and npx)
- MongoDB Community Server (local instance)
- Windows Defender Firewall access for ports 3000 and 5000 (Private network)

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

For production, set VITE_API_URL to your deployed backend base URL.

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

## Office LAN Hosting (Single Laptop)

Use this when hosting on one office laptop so other devices on the same Wi-Fi
or LAN can access the app in a browser.

### Backend (LAN)

1. Ensure MongoDB is running locally on the server laptop.
2. Set backend/.env:

```
MONGO_URI=mongodb://127.0.0.1:27017/datamaker_ticketing
JWT_SECRET=your_secure_jwt_secret
PORT=5000
```

3. Start the backend:

```
cd backend
npm start
```

Backend listens on all interfaces and should be reachable at:

http://<server-ip>:5000

### Frontend (Production Build)

1. Set frontend/.env to point at the server laptop IP:

```
VITE_API_URL=http://<server-ip>:5000
```

2. Build and serve the static files on port 3000:

```
cd frontend
npm run build
npx serve -s dist -l 3000
```

Frontend should be reachable at:

http://<server-ip>:3000

### One-Command Startup (Windows)

Use the helper script to start backend, build frontend, and serve the static
site on port 3000:

```
./scripts/start-office.ps1
```

### Firewall Notes (Windows)

If other laptops cannot connect, allow inbound TCP on ports 3000 and 5000:

- Windows Defender Firewall -> Advanced Settings -> Inbound Rules -> New Rule
- Port -> TCP -> 3000 and 5000 -> Allow the connection -> Private

### Offline Behavior

If the server laptop is offline or asleep, the app is not reachable. Keep the
server laptop powered on and connected to the office network.

### Troubleshooting

- “Failed to fetch” typically means the backend is not running on port 5000.
- MongoDB connection strings must start with mongodb:// or mongodb+srv://
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

## Deployment (Render + Vercel)

### Backend on Render

- Root Directory: backend
- Build Command: npm install
- Start Command: npm start
- Environment Variables:
  - MONGO_URI
  - JWT_SECRET
  - PORT (optional; Render supplies one)

### Frontend on Vercel

- Root Directory: frontend
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Environment Variables:
  - VITE_API_URL = https://<your-backend>.onrender.com

Optional (SPA routing on Vercel): add a vercel.json rewrite to route all
requests to index.html when using client-side routes.

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
