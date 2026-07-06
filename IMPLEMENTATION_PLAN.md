# IMPLEMENTATION_PLAN — Structra JSON Explorer

> **Purpose:** Step-by-step build guide for MVP_ONE. Use this document to track progress, follow conventions, and ship with consistent developer hygiene.

**Related docs:** [MVP_ONE.md](./MVP_ONE.md)

**How to use this doc:**
1. Work phases in order — each phase builds on the last.
2. Check off items as you complete them (`[ ]` → `[x]`).
3. Do not start the next phase until **Exit criteria** for the current phase pass.
4. Keep commits small and scoped to one checklist section where possible.

---

## Progress Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Repo & tooling setup | `[ ]` Not started |
| 1 | Foundation & brand shell | `[ ]` Not started |
| 2 | Input & validation | `[ ]` Not started |
| 3 | Tree builder & explorer | `[ ]` Not started |
| 4 | Search & highlight | `[ ]` Not started |
| 5 | Copy, persistence & polish | `[ ]` Not started |
| 6 | Large file performance | `[ ]` Not started |
| 7 | Responsive & mobile UX | `[ ]` Not started |
| 8 | Deploy to Vercel | `[ ]` Not started |

**Legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## Developer Hygiene Standards

Apply these throughout every phase.

### Repository & Git

- [ ] Initialize git with a sensible `.gitignore` (node_modules, dist, .env, .DS_Store)
- [ ] Connect remote: `https://github.com/aaronjorgreen/json-explorer`
- [ ] Default branch: `main`
- [ ] Commit message format: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`
  - Example: `feat(parse): add line/column error extraction`
- [ ] One logical change per commit; avoid "WIP" commits on main
- [ ] Do not commit secrets, `.env` files, or build artifacts

### Code Organization

```
src/
├── app/                    # App shell, layout, routing (if any)
│   ├── App.tsx
│   └── MainLayout.tsx
├── components/
│   ├── header/
│   ├── input/
│   ├── explorer/
│   ├── ui/                 # Reusable primitives (Button, Toast, Badge)
│   └── brand/              # Logo, wordmark
├── hooks/                  # Custom React hooks
├── lib/                    # Pure utilities (no React)
│   ├── parseJson.ts
│   ├── buildTree.ts
│   ├── searchTree.ts
│   ├── format.ts
│   └── storage.ts
├── types/                  # Shared TypeScript types
│   └── json.ts
├── styles/
│   └── index.css           # Tailwind directives + CSS variables
└── main.tsx
```

**Rules:**
- **`lib/`** — pure functions only; no React imports; unit-testable
- **`components/`** — UI only; delegate logic to hooks and `lib/`
- **`hooks/`** — stateful orchestration (parse flow, search, persistence)
- **`types/`** — single source of truth for domain types
- One component per file; co-locate tiny sub-components only when tightly coupled
- Max ~200 lines per component file — extract when larger

### TypeScript

- [ ] `strict: true` in `tsconfig.json`
- [ ] No `any` — use `unknown` at parse boundaries, then narrow
- [ ] Export domain types from `src/types/json.ts`
- [ ] Prefer `interface` for object shapes; `type` for unions
- [ ] Use explicit return types on all `lib/` functions

### React Patterns

- Parse once → derive everything (`tree`, `stats`, `search results`) via `useMemo`
- Lift parse state to a top-level hook (`useJsonDocument`) — avoid prop drilling beyond one level
- Keep recursive `JsonTreeNode` pure: receives node + UI state callbacks, no global reads
- Debounce user input (paste: 300ms, search: 150ms) — never parse on every keystroke synchronously
- Use `key` props correctly on tree nodes (stable path-based keys, e.g. `root.users[0].name`)

### Styling (Tailwind)

- [ ] Define design tokens in `tailwind.config.js` — never hardcode hex in components
- [ ] Use semantic token names: `bg-surface`, `border-accent`, `text-muted`
- [ ] Mobile-first responsive classes: base → `md:` → `lg:`
- [ ] Min touch target: `min-h-11 min-w-11` (44px) on interactive elements
- [ ] Respect `prefers-reduced-motion` for animations

### Accessibility

- [ ] Semantic HTML: `header`, `main`, `nav`, `button`, `textarea`
- [ ] All icon-only buttons have `aria-label`
- [ ] Search input has associated `<label>` (visually hidden OK)
- [ ] Error banner uses `role="alert"`
- [ ] Tree chevrons: `aria-expanded` on expandable nodes
- [ ] Focus visible styles on all interactive elements (tech blue ring)
- [ ] Keyboard: Tab through controls; Enter/Space toggles expand; Escape closes drawers

### Error Handling

- Invalid JSON never mutates tree, stats, or localStorage
- File read errors → user-facing toast, not console-only
- localStorage failures (quota, private mode) → fail silently with console warn; app still works
- Clipboard API failure → fallback toast with error message

### Performance Guardrails

- Do not re-parse on expand/collapse or search — operate on existing tree model
- Memoize expensive derivations (`buildTree`, `searchTree`, flattened node list)
- Virtualize tree when node count > 500 (Phase 6)
- Avoid inline object/array literals in props to recursive tree components

### Testing Strategy (MVP)

Priority: **`lib/` unit tests** — highest ROI, no DOM needed.

| Module | Min tests |
|--------|-----------|
| `parseJson.ts` | Valid JSON, invalid JSON, line/col/char position |
| `buildTree.ts` | Objects, arrays, nested, empty, stats accuracy |
| `searchTree.ts` | Key match, value match, case-insensitive, no match |
| `format.ts` | Stringify, value preview, type labels |

- [ ] Set up Vitest (ships with Vite)
- [ ] Add test script: `npm run test`
- [ ] Component tests optional for MVP — manual QA checklist per phase

### Dependencies

Keep the dependency tree minimal.

| Package | Purpose | Phase |
|---------|---------|-------|
| `react`, `react-dom` | UI | 1 |
| `typescript`, `vite` | Tooling | 1 |
| `tailwindcss`, `postcss`, `autoprefixer` | Styling | 1 |
| `lucide-react` | Icons | 1 |
| `@tanstack/react-virtual` | Tree virtualization | 6 |

**Do not add** unless justified: Redux, lodash, moment, axios, UI kits (shadcn optional later).

---

## Phase 0 — Repo & Tooling Setup

**Goal:** Clean project foundation before feature work.

### Checklist

- [ ] `npm create vite@latest . -- --template react-ts` (or equivalent scaffold)
- [ ] Install Tailwind CSS + configure `tailwind.config.js` with Structra tokens
- [ ] Install Lucide React
- [ ] Configure path alias `@/` → `src/` in `vite.config.ts` and `tsconfig.json`
- [ ] Add ESLint (Vite default) — fix all lint errors before Phase 1 exit
- [ ] Add Vitest + one smoke test (`expect(true).toBe(true)`) to verify runner
- [ ] Create folder structure per **Code Organization** above
- [ ] Add `.gitignore`, initial commit, push to GitHub remote
- [ ] Update `README.md` with project name, tagline, and dev commands

### Design Tokens (`tailwind.config.js`)

```js
colors: {
  base: '#0B1120',
  surface: '#111827',
  border: { DEFAULT: '#1E3A5F', accent: '#3B82F6' },
  accent: { DEFAULT: '#3B82F6', dark: '#2563EB', light: '#60A5FA' },
  text: { primary: '#F1F5F9', secondary: '#94A3B8', muted: '#64748B' },
}
```

### Exit Criteria

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Repo pushed to GitHub

---

## Phase 1 — Foundation & Brand Shell

**Goal:** Branded, responsive app shell with no feature logic yet.

### Checklist

- [ ] Create `src/types/json.ts` — stub `JsonNode` union type
- [ ] Create `src/styles/index.css` — Tailwind directives, font imports (Inter + JetBrains Mono)
- [ ] Build `Logo.tsx` — inline SVG `{ }` with tech blue gradient
- [ ] Build `Header.tsx` — logo, wordmark "Structra", placeholder search/copy/menu slots
- [ ] Build `MainLayout.tsx`:
  - [ ] Desktop (`lg:`): resizable split panels (40/60) with drag handle
  - [ ] Mobile: stacked layout with placeholder panels
- [ ] Build placeholder `InputPanel.tsx` and `ExplorerPanel.tsx` (empty states)
- [ ] Build reusable `Button.tsx`, `Badge.tsx` in `components/ui/`
- [ ] Wire `App.tsx` → `MainLayout` with dark theme applied globally
- [ ] Verify layout at 375px, 768px, 1440px (no horizontal overflow)

### Exit Criteria

- [ ] Branded dark UI loads at `localhost:5173`
- [ ] Header, split layout, and placeholders render correctly on desktop and mobile
- [ ] All interactive elements have focus styles

---

## Phase 2 — Input & Validation

**Goal:** Accept JSON via paste, file, and drag-drop; report precise parse errors.

### Checklist

#### `lib/parseJson.ts`

- [ ] Implement `parseJson(input: string): ParseResult`
- [ ] Return `{ ok: true, data: unknown }` or `{ ok: false, error: ParseError }`
- [ ] Extract line, column, character index from `SyntaxError` + position offset
- [ ] Write unit tests covering: valid JSON, trailing comma, unclosed bracket, position accuracy

#### `hooks/useJsonDocument.ts`

- [ ] State: `rawInput`, `parseResult`, `isParsing`
- [ ] Debounced parse (300ms) on input change
- [ ] Manual parse trigger (Parse button + `Cmd/Ctrl+Enter`)
- [ ] Do not update tree state when parse fails

#### Components

- [ ] `JsonTextarea.tsx` — monospace, full-height, placeholder copy
- [ ] `ParseErrorBanner.tsx` — message + `Line X, Column Y (char Z)` + `role="alert"`
- [ ] `DropZone.tsx` — drag-over overlay, accepts `.json` files
- [ ] File upload via hidden `<input type="file">` in header/menu
- [ ] Parse loading overlay when input > 100KB ("Parsing…")
- [ ] Wire `InputPanel` with textarea, drop zone, error banner

#### File Handling

- [ ] Read file via `FileReader.readAsText`
- [ ] Display file name + size badge after upload
- [ ] Soft warn > 5MB; reject > 10MB with friendly message

### Exit Criteria

- [ ] Paste, upload, and drag-drop all populate textarea and trigger parse
- [ ] Invalid JSON shows line, column, and character position
- [ ] Valid JSON sets `parseResult.ok = true` (tree not built yet — Phase 3)
- [ ] `parseJson` unit tests pass

---

## Phase 3 — Tree Builder & Explorer

**Goal:** Render parsed JSON as an interactive, collapsible tree with stats.

### Checklist

#### `lib/buildTree.ts`

- [ ] Implement `buildTree(data: unknown): { nodes: JsonNode[]; stats: TreeStats }`
- [ ] Handle root object, root array, and root primitive
- [ ] Compute stats: objects, arrays, properties (total keys), max depth, node count
- [ ] Write unit tests for nested structures, empty `{}`/`[]`, stat accuracy

#### `lib/format.ts`

- [ ] `formatValue(value): string` — type-aware preview (truncate long strings)
- [ ] `getValueType(value): string` — `"string"`, `"number"`, `"boolean"`, `"null"`
- [ ] `stringifyPretty(data): string` — `JSON.stringify(data, null, 2)`

#### Components

- [ ] `StatsBar.tsx` — displays objects, arrays, properties, depth, node count
- [ ] `TreeToolbar.tsx` — Expand All / Collapse All buttons
- [ ] `JsonTree.tsx` — renders root node list
- [ ] `JsonTreeNode.tsx` — recursive; chevron, key, value, type badge, child count
- [ ] Expand state: levels 0–1 open by default; session-only (`useState` / `useReducer`)
- [ ] Expand All / Collapse All wired through tree context or callback props
- [ ] Empty explorer state when no valid JSON ("Paste JSON to explore")

#### Integration

- [ ] Extend `useJsonDocument` — on successful parse, call `buildTree`, expose `nodes` + `stats`
- [ ] Wire `ExplorerPanel` → `StatsBar` + `TreeToolbar` + `JsonTree`

### Exit Criteria

- [ ] Valid JSON renders as collapsible tree
- [ ] Stats match manual count on test payloads
- [ ] Expand/collapse works to depth 5+ without errors
- [ ] `buildTree` unit tests pass

---

## Phase 4 — Search & Highlight

**Goal:** Search keys and values with highlight, count, and navigation.

### Checklist

#### `lib/searchTree.ts`

- [ ] Implement `searchTree(nodes, query): SearchMatch[]`
- [ ] Match keys and stringified values; case-insensitive substring
- [ ] Return stable path IDs for each match (e.g. `users[2].email`)
- [ ] Write unit tests: key match, value match, partial match, no results

#### `hooks/useSearch.ts`

- [ ] Debounced query state (150ms)
- [ ] Current match index + total count
- [ ] `nextMatch()` / `prevMatch()` — wrap around
- [ ] Compute set of paths to auto-expand (all ancestor paths of matches)

#### UI

- [ ] Wire search input in `Header.tsx`
- [ ] Match count badge: `"3 of 12"` or `"No matches"`
- [ ] Prev / Next buttons in header (disabled when no matches)
- [ ] Highlight matching key/value text in `JsonTreeNode` (tech blue tint)
- [ ] Highlight current match with stronger border/background
- [ ] Auto-expand ancestor nodes when search active
- [ ] `scrollIntoView` on current match node (`ref` registry or `data-path` query)

### Exit Criteria

- [ ] Search finds keys and values correctly
- [ ] Highlights visible; prev/next navigates and scrolls to match
- [ ] Clearing search removes highlights and restores default expand state
- [ ] `searchTree` unit tests pass

---

## Phase 5 — Copy, Persistence & Polish

**Goal:** Clipboard copy, localStorage restore, edge states, keyboard shortcuts.

### Checklist

#### `lib/storage.ts`

- [ ] `saveJson(raw: string): void` — key: `structra:last-json`
- [ ] `loadJson(): string | null` — try/catch for private mode / quota
- [ ] Write unit test with mocked `localStorage`

#### Features

- [ ] Copy button in header — `navigator.clipboard.writeText(stringifyPretty(data))`
- [ ] Copy disabled when parse invalid or empty
- [ ] Toast component — "Copied to clipboard" / error fallback
- [ ] On mount: load from localStorage → populate textarea → auto-parse
- [ ] One-time toast: "Restored from last session"
- [ ] Save to localStorage on every successful parse
- [ ] `Cmd/Ctrl+Enter` keyboard shortcut to parse
- [ ] Empty states: input placeholder, explorer placeholder, search disabled when no tree
- [ ] Clear input action (menu) — resets textarea, tree, stats, search

### Exit Criteria

- [ ] Copy produces valid pretty-printed JSON
- [ ] JSON persists and restores across page refresh
- [ ] Edge states (empty, invalid, restored) handled gracefully
- [ ] No console errors in happy path or common error paths

---

## Phase 6 — Large File Performance

**Goal:** Keep the app usable with MB-scale JSON.

### Checklist

- [ ] Install `@tanstack/react-virtual`
- [ ] Flatten visible tree nodes to a list (respecting expand state) for virtualization
- [ ] Switch to virtualized list when `stats.nodeCount > 500`
- [ ] Show parse time (ms) in stats bar after parse
- [ ] Show warning badge when `nodeCount > 10_000`
- [ ] "Jump to top" FAB in explorer when scrolled > 400px
- [ ] Verify 1MB sample JSON: parse completes, tree scrolls smoothly, search still works
- [ ] Profile: no full-tree re-render on single node expand (React DevTools spot check)

### Exit Criteria

- [ ] 1MB+ JSON usable without browser freeze > 3s
- [ ] Virtualization activates automatically above threshold
- [ ] Size/time indicators visible in UI

---

## Phase 7 — Responsive & Mobile UX

**Goal:** Full feature parity on mobile with clean adaptive layout.

### Checklist

- [ ] `HamburgerMenu.tsx` — upload, expand/collapse all, clear, about
- [ ] Mobile input drawer/sheet — opens from menu or tab; closes on successful parse
- [ ] Collapse header actions into hamburger below `lg` breakpoint
- [ ] Sticky search bar + stats bar on mobile explorer scroll
- [ ] Touch targets ≥ 44px on chevrons, buttons, menu items
- [ ] Long string values: `break-all` / truncate with expand-on-click (optional)
- [ ] Test full flow on 375px viewport:
  - [ ] Paste JSON via drawer
  - [ ] View tree
  - [ ] Search + navigate matches
  - [ ] Copy JSON
  - [ ] Refresh → restore
- [ ] Test tablet (768px) accordion/stack layout
- [ ] Fix any horizontal overflow or z-index issues

### Exit Criteria

- [ ] All MVP features work on mobile and desktop
- [ ] No horizontal scroll on any breakpoint
- [ ] Hamburger menu accessible and keyboard-operable

---

## Phase 8 — Deploy to Vercel

**Goal:** Production deployment from GitHub.

### Checklist

- [ ] Add `vercel.json` with SPA rewrite (`"rewrites": [{ "source": "/(.*)", "destination": "/" }]`)
- [ ] Verify `npm run build` output in `dist/`
- [ ] Connect `aaronjorgreen/json-explorer` repo to Vercel
- [ ] Set framework preset: Vite; build command: `npm run build`; output: `dist`
- [ ] Confirm production URL loads
- [ ] Production smoke test:
  - [ ] Paste sample JSON → tree renders
  - [ ] Invalid JSON → error with position
  - [ ] Search + highlight works
  - [ ] Copy to clipboard works
  - [ ] Refresh → localStorage restore works
- [ ] Update README with live URL

### Exit Criteria

- [ ] Live Vercel URL accessible
- [ ] All smoke tests pass in production
- [ ] README documents local dev + deploy URL

---

## Manual QA Checklist (Run Before Phase 8)

Run once after Phase 7, repeat after any major change.

### Input & Parse

- [ ] Paste valid JSON → tree appears
- [ ] Paste invalid JSON → error with line/col/char; tree unchanged
- [ ] Upload `.json` file → content loads and parses
- [ ] Drag-drop file → content loads and parses
- [ ] 6MB file → soft warning shown
- [ ] 11MB file → rejected with message
- [ ] `Cmd/Ctrl+Enter` triggers parse

### Tree

- [ ] Expand/collapse individual nodes
- [ ] Expand All / Collapse All work
- [ ] Stats accurate on nested sample
- [ ] Empty `{}` and `[]` show type badges

### Search

- [ ] Search key → highlighted
- [ ] Search value → highlighted
- [ ] Case-insensitive match works
- [ ] Prev/Next navigates all matches
- [ ] Clear search → highlights removed

### Copy & Storage

- [ ] Copy → valid JSON on clipboard
- [ ] Refresh page → JSON restored
- [ ] Invalid JSON not saved to localStorage

### Responsive

- [ ] 375px — full flow works
- [ ] 768px — layout adapts cleanly
- [ ] 1440px — split panel + resize works

---

## Sample Test Payloads

Keep these in `src/lib/__fixtures__/` for tests and manual QA.

| File | Purpose |
|------|---------|
| `valid-simple.json` | Flat object, few keys |
| `valid-nested.json` | 4+ levels deep, arrays + objects |
| `valid-large.json` | Generated 1000+ nodes (for perf) |
| `invalid-trailing-comma.json` | Parse error with known position |
| `invalid-unclosed.json` | Unclosed `{` or `[` |

---

## Definition of Done (MVP)

MVP is complete when **all** of the following are true:

- [ ] All Phase 0–8 exit criteria checked
- [ ] Manual QA checklist fully passed
- [ ] `lib/` unit tests pass (`npm run test`)
- [ ] `npm run build` succeeds with zero errors
- [ ] No known P0 bugs (crash, data loss, parse silently fails)
- [ ] Deployed to Vercel with README live URL
- [ ] MVP_ONE success criteria (8 items) verified

---

## Suggested Commit Flow

| Order | Commit scope |
|-------|--------------|
| 1 | `chore: scaffold vite react-ts tailwind project` |
| 2 | `feat(ui): add structra brand shell and layout` |
| 3 | `feat(parse): add parseJson with line col errors` |
| 4 | `feat(input): add paste file and drag-drop input panel` |
| 5 | `feat(tree): add buildTree and recursive json tree` |
| 6 | `feat(stats): add stats bar and tree toolbar` |
| 7 | `feat(search): add search highlight and navigation` |
| 8 | `feat(copy): add clipboard copy and toast` |
| 9 | `feat(storage): persist last json in localStorage` |
| 10 | `perf(tree): virtualize large tree rendering` |
| 11 | `feat(mobile): add hamburger menu and responsive layout` |
| 12 | `chore: add vercel config and deploy` |

---

*Document version: IMPLEMENTATION_PLAN v1.0 — Structra JSON Explorer*
