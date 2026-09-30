# Task Marketplace Frontend

Vue 3 + TypeScript single-page app for the task marketplace API. Users browse tasks, propose, get assigned, submit work, and review, with live updates pushed over server-sent events.

The API lives in `task-api` and documents itself at `GET /openapi` (Scalar UI) and `GET /openapi.json`.

## Routes

- `/` is the landing page.
- `/auth/login` and `/auth/signup` are guest-only; signed-in users are sent to the app.
- `/feed` is the open-task feed with sort, search, and reward filters plus infinite scroll.
- `/tasks/:id` is the detail view: owner and tasker profiles, review, proposal count, your own bid, and proposal management for owners.
- `/my-tasks` is everything you posted, with filters and per-status actions (edit, cancel, delete, unassign, confirm + review).
- `/assigned` is work assigned to you, with the submit flow.
- `/profile` shows your stats, rating, and session controls including logout everywhere.

Route guards revalidate the session and remember where you were going, so a login redirect lands back on the original page.

## Authentication

Sessions are cookie based and managed by a shared `useAuth` composable. Login accepts a username or an email. Google sign-in uses Google Identity Services: a linked account signs straight in, a new Google email creates an account, and an email that already belongs to a password account asks for the password once to link the two.

## Data layer

There is no store library and no query library, by choice. Three hand-rolled pieces cover it:

- `src/services/api.ts` is the typed transport. It returns the envelope's `data`, throws `ApiError` with machine codes and Zod issues, and retries once after a transparent cookie refresh.
- `src/services/resources/` has one typed module per API area (auth, tasks, proposals, users), including Decimal-string reward and ISO-date normalization.
- `src/composables/` holds `useAuth`, `useForm` (Zod validation with server-issue mapping), `usePaginatedFeed` (opaque keyset cursors, id dedupe), and `useEventSource` (backoff reconnect, health tracking).

## Realtime

A renderless host opens the `/events` stream when signed in. Notification events (proposals, assignment, submission, confirmation, reviews) raise toasts that link into the affected task. New tasks raise a refresh pill on the feed instead of being prepended, and the detail view reloads when its own task changes. If the stream stays unhealthy, views poll every 45 seconds until it recovers.

## UI

Tailwind CSS v4 with shadcn-vue components on Reka UI primitives, in a dark theme with a mint accent. The component set lives in `src/components/ui/` and is owned by this repo (copied, not installed). Icons are Lucide, toasts are Sonner.

## Setup

You need Node 22+. The API must be running first (see `task-api`, default `http://localhost:8000`).

```bash
npm install
npm run dev
```

Environment (`.env`, gitignored):

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=   # optional; hides the Google button when unset
```

Other scripts: `npm test` runs the Vitest suite, `npm run build` typechecks and builds for Vercel (`vercel.json` included).

## Seed logins

Against a seeded API, every account uses `Password123!`. Known fixtures: `seed.password@example.com` for the link-required path, `seed.both@example.com` for a linked account, `seed.google@example.com` for a Google-only account.

## Demos and screenshots

The `screenshots/` references from the first build no longer exist; the landing page inside the app is the current tour.

## License

MIT
