# PROMPTVAULT

**Personal prompt library for people who build with AI daily.**

Save, tag, search, and copy your best prompts. The more you use it, the more valuable it gets.

---

## What it does

- **Save prompts** with a title, full body, category, and custom tags
- **Search instantly** across title, body, and tags
- **Filter by category** — Writing, Code, Strategy, Analysis
- **One-click copy** to clipboard with use tracking
- **Import / Export JSON** — full library backup and restore
- **Persists locally** — no account, no server, no sync

---

## Stack

- React 18
- Vite
- localStorage (no backend)
- Raw CSS — Matrix terminal aesthetic

---

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

---

## Data

Everything lives in `localStorage` under the key `promptvault_prompts`.

Export your vault anytime: `[ EXPORT JSON ]` downloads a dated `.json` file you can reimport on any machine.
