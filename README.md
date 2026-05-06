# PROMPTVAULT

**Team prompt library with AI-efficiency analytics.**

Departments save, tag, rate, and copy their best prompts. The library tracks reuse so leaders can see how efficiently each team is leveraging AI.

---

## What it does

- **Save prompts** with title, body, category, tags, author, and department
- **Rate quality** — 1–5 ★ ratings on every prompt
- **One-click copy** logs every use against the user + department
- **Search & filter** — across title, body, tags, scoped to your team or all teams
- **Add departments** on the fly — no admin setup
- **AI Efficiency Dashboard** — per-department reuse rate, avg quality, recent activity, composite efficiency score
- **Import / Export JSON** — bulk migration

---

## Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node 20 + Express
- **Database:** MongoDB (via Mongoose)
- **Deployment:** Railway (single service serves API + built frontend)

---

## Local development

```bash
cp .env.example .env
# edit .env: set MONGODB_URI to a local Mongo or Atlas connection string

npm install
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:8080` (the dev server proxies `/api/*` to it)

`npm run dev` runs both Vite and the API server with auto-reload.

---

## Deploy to Railway

1. **Push this repo to GitHub.**
2. In Railway: **New Project → Deploy from GitHub repo** → pick this repo.
3. **Add MongoDB:** click `+ New → Database → Add MongoDB`. Railway provisions one.
4. **Wire the env var:** open your service → **Variables → New Variable Reference** → select the MongoDB plugin's `MONGO_URL` and name it `MONGODB_URI`. (Or paste a MongoDB Atlas URI directly.)
5. Railway uses `railway.json` automatically:
   - Build: `npm ci && npm run build`
   - Start: `npm start`
   - Health check: `/api/health`
6. **Generate a public domain** under **Settings → Networking → Generate Domain**.

That's it. The Express server serves the built React app and the `/api/*` routes from one URL.

### Required env vars

| Var | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | Mongo connection string. Use a Variable Reference to the Railway MongoDB plugin or paste an Atlas URI. |
| `MONGODB_DB` | no | Database name. Defaults to `promptvault`. |
| `PORT` | no | Railway sets this automatically. |

---

## API surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness probe |
| `GET` | `/api/departments` | List departments + prompt counts |
| `POST` | `/api/departments` | Create a new department |
| `DELETE` | `/api/departments/:id` | Delete (only if empty) |
| `GET` | `/api/prompts?department=&category=&tag=&q=&author=` | List/filter prompts |
| `POST` | `/api/prompts` | Create prompt |
| `PATCH` | `/api/prompts/:id` | Update fields |
| `DELETE` | `/api/prompts/:id` | Delete |
| `POST` | `/api/prompts/:id/use` | Log a use (for analytics) |
| `POST` | `/api/prompts/:id/score` | Submit a 1–5 quality rating |
| `POST` | `/api/prompts/import` | Bulk import |
| `GET` | `/api/analytics` | Totals, per-department efficiency, top prompts |

---

## Efficiency score

Each department gets a 0–100 score:

- **50% reuse rate** — total uses ÷ total prompts (capped at 10×)
- **30% quality** — avg of 1–5 ★ ratings
- **20% recency** — uses in the last 7 days, normalised against prompt count

> A team that writes few but well-rated prompts and keeps reusing them scores higher than a team that writes many one-shot prompts that no one ever looks at again.
