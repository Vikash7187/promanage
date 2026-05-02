# TaskNest

TaskNest is a full-stack project management web app with enterprise SaaS UX, role-based access control, analytics dashboards, and collaboration workflows.

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod, Axios, Recharts
- Backend: Node.js, Express.js, TypeScript, Prisma ORM, MongoDB Atlas, JWT, bcrypt, RBAC
- Deployment target: Railway (frontend + backend services)

## Folder Structure

- `frontend` - Next.js application
- `backend` - Express API + Prisma schema

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Update `DATABASE_URL` and `JWT_SECRET`
3. Run:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend runs at `http://localhost:5000`.

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Core Modules Implemented

- Authentication: signup/login with JWT
- RBAC roles: `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`, `VIEWER`
- Projects: create/list/update/delete, member assignment
- Tasks: create/list/update/delete, priority, due date, status
- Dashboard analytics: totals, overdue, progress, workload
- Team management endpoints
- Activity feed endpoint
- Notifications endpoint (list + mark as read)
- Calendar endpoint
- Responsive dashboard UI with side navigation and analytics charts

## Railway Deployment

Create two Railway services:

- Frontend service root: `frontend`
  - Build command: `npm run build`
  - Start command: `npm run start`
  - Env: `NEXT_PUBLIC_API_URL=<backend-public-url>/api`
- Backend service root: `backend`
  - Build command: `npm run build && npx prisma generate`
  - Start command: `npm run start`
  - Env: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `PORT`

After deploying backend, update frontend `NEXT_PUBLIC_API_URL` with backend Railway URL.
