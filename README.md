# Korea Link Router

A geo-based link shortener: every short link redirects visitors **from Korea** to the
Korean destination and **everyone else** to the English one.

## How it works

- `POST /api/create` — body `{ "englishUrl": "https://...", "koreanUrl": "https://..." }`
  creates a short mapping and returns `{ id, link, ... }`.
- `GET /api/list` — returns all mappings (newest first) for the dashboard.
- `DELETE /api/delete` — body `{ "id": "..." }` removes a mapping.
- `GET /{id}` — redirects based on the visitor's country:
  - `x-vercel-ip-country: KR` (Vercel) or `cf-ipcountry: KR` (Cloudflare) → Korean URL
  - anything else → English URL
  - query strings are preserved across the redirect.

## Storage

Set these environment variables to persist data in Vercel KV (Redis):

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Optional: `APP_DOMAIN` (e.g. `go.example.com`) — used to build absolute short links.

Without KV variables the app falls back to an in-memory store so it still runs in
development; in-memory data is lost when the server restarts.

## Development

```bash
npm install
npm run dev   # http://localhost:3000
```

## Deploying to Vercel

Push to GitHub and import the repo in Vercel, then attach the **Vercel KV**
integration (or set `KV_REST_API_URL` / `KV_REST_API_TOKEN` manually).
