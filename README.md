# Structra

**See your JSON clearly.**

A sleek, dark-first JSON explorer that treats JSON as structured data. Parse first, render from the tree — never manipulate raw strings for display.

Structra includes two tabs:

- **Explorer** — paste valid or invalid JSON, browse an interactive tree, search, copy, and restore sessions from localStorage.
- **Fixer** — paste malformed JSON, validate syntax, auto-repair common issues (trailing commas, unquoted keys, missing commas), review a transparent repair summary, copy clean output, reopen repair history, and open fixed JSON in Explorer.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run test
npm run lint
```

## Deploy to Vercel

Structra is a Vite SPA. Production deploy uses `vercel.json` for client-side routing rewrites.

### One-time setup

1. Push the repo to GitHub: [aaronjorgreen/json-explorer](https://github.com/aaronjorgreen/json-explorer)
2. Sign in at [vercel.com](https://vercel.com) and **Add New Project**
3. Import `aaronjorgreen/json-explorer`
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy

No environment variables are required for the MVP.

### Live URL

> **Note:** Connecting the GitHub repo to Vercel requires account access. After you complete the steps above, add your production URL here:
>
> `https://your-project.vercel.app`

### Production smoke test

After deploy, verify:

**Explorer**
- Paste sample JSON → tree renders
- Invalid JSON → error with line/column/character position
- Search + highlight + prev/next navigation
- Copy to clipboard
- Refresh → localStorage restore

**Fixer**
- Load sample broken JSON → invalid status shown
- Fix JSON → formatted output + repair summary
- Copy repaired JSON → valid parseable clipboard content
- Open in Explorer → tree renders from fixed JSON
- Repair history persists across refresh

## Tech Stack

- React 19 / TypeScript
- Vite
- Tailwind CSS
- Lucide React
- @tanstack/react-virtual
- Vitest

## Documentation

- [MVP_ONE.md](./docs/MVP_ONE.md) — Explorer product scope
- [MVP_TWO.md](./docs/MVP_TWO.md) — Fixer tab product scope
- [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) — MVP_ONE build phases
- [IMPLEMENTATION_PLAN_TWO.md](./docs/IMPLEMENTATION_PLAN_TWO.md) — MVP_TWO build phases
- [GITHUB_ISSUES_GUIDE.md](./GITHUB_ISSUES_GUIDE.md) — contribution workflow

## License

Private — all rights reserved.
