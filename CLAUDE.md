# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillsSwap is a full-stack skill-swapping marketplace where users can trade courses with each other. Built with React + Vite (frontend) and Express + MongoDB (backend).

## Commands

### Frontend (`/frontend`)
```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Backend (`/backend`)
```bash
npm run dev   # Start with nodemon (watch mode)
npm start     # Production server
```

### Prerequisites
- MongoDB must be running on `mongodb://127.0.0.1:27017/skillsswap`
- Backend `.env` requires `PORT`, `MONGO_URI`, and `JWT_SECRET`
- Frontend runs on Vite default (port 5173), backend on port 5000

## Architecture

### Frontend (React SPA)
- **`src/api/userApi.js`** — all Axios HTTP calls, single source of truth for API endpoints
- **`src/services/userService.js`** — thin wrapper over the API layer
- **`src/routes/AppRoutes.jsx`** — centralized route definitions
- **`src/pages/`** — page-level components (LoginPage, RegisterPage, ProfilePage, RequestsPage, NotificationsPage, AllUsers, UserProfile)
- **`src/components/`** — reusable UI pieces

JWT token is stored client-side and attached as the `Authorization` header by `userApi.js` for all authenticated requests.

### Backend (Express REST API)
Layer order: `routes → middlewares → controllers → services → models`

- **`middlewares/userMiddleware.js`** — JWT validation; attaches authenticated user to `req.user`
- **`controllers/`** — business logic (user, swap, notification)
- **`services/userService.js`** — data-access layer for user queries
- **`models/`** — four Mongoose schemas: `User`, `SwapRequest`, `SwapDeal`, `Notification`
- **`utils/`** — `token.js` (JWT), `hash.js` (bcrypt), `response.js` (standard response format)
- **`/uploads`** served as static — profile images, cover images, course videos (via Multer)

### Core Data Flow (Skill Swap Lifecycle)
1. User A sends a swap request → `SwapRequest` document created (status: pending)
2. User B accepts → `SwapDeal` document created; notification sent to User A
3. Both users can now select courses from each other's course arrays
4. `GET /swaps/can-access/:ownerId/:courseIndex` gates course content access

### Key API Routes
| Prefix | File |
|--------|------|
| `/users` | `routes/userRoutes.js` |
| `/swaps` | `routes/swapRoutes.js` |
| `/notifications` | `routes/notificationRoutes.js` |

Courses are stored as an embedded array inside the `User` document (not a separate collection). A course is referenced by its owner's userId + array index.

## Strict Development Rules
- NEVER assume file contents — always read the actual file first
- ALWAYS provide full updated files, never partial snippets
- NEVER remove existing features when adding new ones
- One change at a time only
- Ask for clarification before coding if unsure
- No ES module, React, or Node syntax mistakes
- Do not change architecture unless explicitly approved
- Preserve existing UI completely unless explicitly told to change it

## Completed Phases
- Phase 1: Auth — register, login, JWT, protected routes
- Phase 2: Profile — get/update, bio/phone/city, profile & cover image upload
- Phase 3: Skills — skillsOffered, skillsRequired, update skills
- Phase 4: User Browsing — view all users, visit any user profile
- Phase 5: Courses — add course (title, price, video), stored as embedded array in User document
- Phase 6: Swap Requests — send, view incoming, accept/reject, notifications, history preserved
- Phase 7: Swap Relationships & Course Selection — SwapDeal created on accept, both users select one course, stored as index, notifications sent
- Phase 8: Course Access Control — videos locked by default, unlocked only if owner OR swap fully completed with correct course index granted. Backend: GET /swaps/can-access/:ownerId/:courseIndex

- Phase 9: Admin Panel & Profile Deletion — `role` field on User (`"user"` | `"admin"`), `requireAdmin` middleware, self-delete (`DELETE /users/profile`), admin-delete any user (`DELETE /users/:id`), both cascade SwapRequests/SwapDeals/Notifications. "Delete My Account" on Profile page, "Delete User" on AllUsers for admins. First admin set manually in DB: `db.users.updateOne({ email: "..." }, { $set: { role: "admin" } })`, then re-login.

## Current Status
Phase 9 is complete and stable. No bugs. No UI breakage.
