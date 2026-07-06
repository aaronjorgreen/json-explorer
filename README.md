# Structra

**See your JSON clearly.**

A sleek, dark-first JSON explorer that treats JSON as structured data. Parse first, render from the tree — never manipulate raw strings for display.

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

- Paste sample JSON → tree renders
- Invalid JSON → error with line/column/character position
- Search + highlight + prev/next navigation
- Copy to clipboard
- Refresh → localStorage restore

## Tech Stack

- React 19 / TypeScript
- Vite
- Tailwind CSS
- Lucide React
- @tanstack/react-virtual
- Vitest

## Documentation

- [MVP_ONE.md](./MVP_ONE.md) — product scope
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — build phases
- [GITHUB_ISSUES_GUIDE.md](./GITHUB_ISSUES_GUIDE.md) — contribution workflow

## License

Private — all rights reserved.
