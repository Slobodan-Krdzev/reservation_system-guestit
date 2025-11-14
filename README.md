# Reservation System (React + Express + MongoDB)

Full-stack, multi-language reservation experience with JWT auth, email verification, subscription stubs, and a floorplan-first booking UI.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Swiper, react-hook-form, react-i18next, Zustand.
- **Backend:** Node.js, Express, Mongoose, JWT, bcrypt, multer, Nodemailer.
- **Database:** MongoDB (local; connect via `MONGO_URI`).

## Features

- Register/Login with email or phone, optional profile image upload, OAuth (mocked) for Google/Facebook/Apple.
- Email verification tokens (printed in terminal + optional SMTP delivery).
- JWT access token (returned + HttpOnly cookie) and refresh-token-ready helpers.
- Protected REST API: account info, avatar upload, subscription activation stub, reservations CRUD.
- Mocked third-party floorplans exposed via `/api/floorplans` + availability endpoint.
- Responsive UI that always targets `100vh`, language switcher (10 locales), swiper-based floorplan view with clickable tables + modal reservation flow.
- Account dashboard highlights subscription tier/status and active reservations with cancellation.
- Seed script with verified/unverified users + sample floorplans/reservation.
- Jest + Supertest coverage for auth and reservation endpoints.
- cURL examples in `docs/curl-examples.md`.

## Getting Started

```bash
git clone <repo>
cd "Reservation System"
```

### 1. Environment files

Due to platform restrictions `.env` files cannot live in the repo root, so copy the templates located inside each package:

```bash
cd server && cp env.example .env
cd ../client && cp env.example .env
```

Update the variables (Mongo connection, JWT secrets, SMTP credentials, API URLs, etc.).

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Seed database (optional but recommended)

```bash
cd server
npm run seed
```

Seeds:
- `verified@example.com / Password123` (already verified, free tier).
- `pending@example.com / Password123` (requires email verification token `seed-token`).

### 4. Run in development

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Backend defaults to `http://localhost:5026`, frontend to `http://localhost:5173` (proxy forwards `/api` to the server).

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `server` | `npm run dev` | ts-node-dev watcher |
|          | `npm run build` | Compile TypeScript to `dist` |
|          | `npm start` | Run compiled server |
|          | `npm run test` | Jest + Supertest integration suite |
|          | `npm run seed` | Populate Mongo with sample data |
| `client` | `npm run dev` | Vite dev server |
|          | `npm run build` | Type-check + production bundle |
|          | `npm run preview` | Preview production build |

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Multipart registration with optional avatar; triggers verification email/log |
| GET | `/api/auth/verify?token=` | Confirms email token |
| POST | `/api/auth/login` | Email **or** phone with password |
| POST | `/api/auth/oauth` | Mock OAuth entry (UI buttons call this) |
| GET | `/api/me` | Current user profile |
| PUT | `/api/me` | Update name/phone/avatar |
| POST | `/api/subscription/activate` | Mock subscription upgrade (replace with Stripe) |
| GET | `/api/floorplans` | Proxy/mock of external floorplans |
| GET | `/api/floorplans/:id/availability` | Randomized table availability sample |
| GET | `/api/reservations` | List user reservations |
| POST | `/api/reservations` | Create reservation with conflict validation |
| DELETE | `/api/reservations/:id` | Cancel reservation |

See `docs/curl-examples.md` for a sample flow.

## Replacing the floorplan mock

1. Set `EXTERNAL_FLOORPLAN_API_URL` in `server/.env`.
2. Update `src/services/floorplan.service.ts` to call the real API (keep the current mock as a fallback for local dev).
3. Ensure the external payload conforms to `{ id, name, sections[], tables[] }` or adapt the mapper.

## OAuth integration notes

- UI buttons call `/api/auth/oauth` with mock payloads.
- Replace the stub by verifying real provider tokens (Google, Facebook, Apple) inside `oauthController`.
- Store provider IDs in the User model (e.g., `socialAccounts.googleId`) and enforce trust rules.
- For native mobile/web flows, issue short-lived JWTs + refresh tokens (refresh helpers already exist).

## Subscription / Stripe handoff

- `/api/subscription/activate` currently simulates a successful activation for 30 days.
- To add Stripe:
  1. Create customers + checkout session server-side.
  2. Listen to `checkout.session.completed` + `invoice.payment_failed` webhooks.
  3. Update `User.subscription` accordingly.
- Documented approach in `README` plus inline comments; see `user.controller.ts`.

## Avatar storage

- Files land in `uploads/avatars` (configurable via `UPLOADS_DIR`).
- Express serves `/uploads` statically; production deployments should use a CDN or S3-style bucket.

## Testing

```bash
cd server
npm run test
```

Tests spin up an in-memory Mongo instance via `mongodb-memory-server`. Add more specs under `server/tests/`.

## Developer Notes & Future Work

- **Refresh tokens:** `utils/jwt` already exposes generators; wire up `/api/auth/refresh` for full rotation.
- **Real-time updates:** Introduce websockets or SSE to broadcast table availability changes.
- **Floorplan scaling:** For hundreds of tables, virtualize the canvas or integrate a SVG/Canvas renderer.
- **Monitoring:** Add request logging to external services + health checks for PM2/systemd deployments.

## Troubleshooting

- Missing `.env` values log warnings on boot.
- Verification URLs always print to the server console for easy copy/paste.
- Ensure MongoDB is running locally or update `MONGO_URI`.
- For CORS/cookie issues, confirm `FRONTEND_URL` matches the actual host and that you launch both apps via HTTPS in production.

