# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
yarn dev          # Start Vite frontend dev server (port 5173)
yarn server       # Start Express API server (port 3000)
yarn build        # Type-check + production build
yarn test:unit    # Run Vitest unit tests
yarn type-check   # Run vue-tsc type check only
```

Run both servers simultaneously during development — the Vite dev server proxies `/api/*` and `/auth/google*` to `localhost:3000`.

To run a single test file:
```sh
yarn test:unit src/stores/__tests__/someTest.spec.ts
```

## Architecture

This is a full-stack recipe app with two distinct layers:

**Frontend** (`src/`) — Vue 3 + TypeScript SPA built with Vite.
- `src/router/index.ts` — Vue Router; `CalendarView` is the home route (`/`)
- `src/stores/` — Pinia stores (composition API style). `recipes.ts` owns all recipe CRUD and scheduling state; `dateSelection.ts` tracks the currently selected calendar date
- `src/composables/` — Reusable logic (`useRecipeForm.ts`, `useImageUpload.ts`)
- `src/utils/imageUtils.ts` — Cloudinary upload helpers
- `src/components/` — Shared UI components (Calendar, Sidebar, RecipeCard, modals, etc.)
- `src/views/` — Page-level components matched by router

**Backend** (`api/`) — Express 5 server deployed as a Vercel serverless function.
- `api/app.js` — Main entry point; defines all REST endpoints, MongoDB connection, session middleware, and Cloudinary config
- `api/auth.js` — Email/password signup and login (bcrypt)
- `api/googleAuth.js` — Passport.js Google OAuth2 strategy and `/auth/google` routes
- `api/user.js` — MongoDB users collection helper

**Auth** uses `express-session` backed by `connect-mongo` (MongoDB session store). Passport serializes users by `_id`. Google OAuth and email/password both produce the same session. The `ensureAuth` middleware guards protected API routes.

**Recipes** are stored in MongoDB with a `handle` (URL-safe slug) as the primary lookup key. Scheduling is a separate `scheduledRecipes` collection linking `handle` + `date` (ISO string).

**Image uploads** use a signed Cloudinary upload flow: the frontend fetches a signature from `/api/cloudinary-signature`, then uploads directly to Cloudinary.

**Deployment** — Vercel; `vercel.json` rewrites `/api/*` and `/auth/*` to `api/app.js`.

## Required Environment Variables

```
MONGODB_URI          # MongoDB connection string
MONGO_DB             # Database name (default: recipeApp)
SESSION_SECRET       # Express session secret
GOOGLE_CLIENT_ID     # Google OAuth client ID
GOOGLE_CLIENT_SECRET # Google OAuth client secret
GOOGLE_CALLBACK_URL  # OAuth callback (e.g. http://localhost:3000/auth/google/callback)
FRONTEND_URL         # Frontend origin for OAuth redirect (e.g. http://localhost:5173)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
VITE_API_URL         # (optional) Frontend API base URL; empty string in dev uses Vite proxy
```

## Code Style

- Vue components use `<script setup lang="ts">` (Composition API only)
- No comments in code
- `@` alias resolves to `src/`
- Package manager is Yarn 4 (PnP) — use `yarn`, not `npm`
