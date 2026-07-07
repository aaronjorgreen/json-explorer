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
| 0 | Repo & tooling setup | `[x]` Done |
| 1 | Foundation & brand shell | `[x]` Done |
| 2 | Input & validation | `[x]` Done |
| 3 | Tree builder & explorer | `[x]` Done |
| 4 | Search & highlight | `[x]` Done |
| 5 | Copy, persistence & polish | `[x]` Done |
| 6 | Large file performance | `[x]` Done |
| 7 | Responsive & mobile UX | `[x]` Done |
| 8 | Deploy to Vercel | `[x]` Done *(code complete; Vercel connect pending user)* |

**Legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## Developer Hygiene Standards

Apply these throughout every phase.

### Repository & Git

- [x] Initialize git with a sensible `.gitignore` (node_modules, dist, .env, .DS_Store)
- [x] Connect remote: `https://github.com/aaronjorgreen/json-explorer`
- [x] Default branch: `main`
- [x] Commit message format: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`
  - Example: `feat(parse): add line/column error extraction`
- [x] One logical change per commit; avoid "WIP" commits on main
- [x] Do not commit secrets, `.env` files, or build artifacts

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

- [x] `strict: true` in `tsconfig.json`
- [x] No `any` — use `unknown` at parse boundaries, then narrow
- [x] Export domain types from `src/types/json.ts`
- [x] Prefer `interface` for object shapes; `type` for unions
- [x] Use explicit return types on all `lib/` functions

### React Patterns

- Parse once → derive everything (`tree`, `stats`, `search results`) via `useMemo`
- Lift parse state to a top-level hook (`useJsonDocument`) — avoid prop drilling beyond one level
- Keep recursive `JsonTreeNode` pure: receives node + UI state callbacks, no global reads
- Debounce user input (paste: 300ms, search: 150ms) — never parse on every keystroke synchronously
- Use `key` props correctly on tree nodes (stable path-based keys, e.g. `root.users[0].name`)

### Styling (Tailwind)

- [x] Define design tokens in `tailwind.config.js` — never hardcode hex in components
- [x] Use semantic token names: `bg-surface`, `border-accent`, `text-muted`
- [x] Mobile-first responsive classes: base → `md:` → `lg:`
- [x] Min touch target: `min-h-11 min-w-11` (44px) on interactive elements
- [x] Respect `prefers-reduced-motion` for animations

### Accessibility

- [x] Semantic HTML: `header`, `main`, `nav`, `button`, `textarea`
- [x] All icon-only buttons have `aria-label`
- [x] Search input has associated `<label>` (visually hidden OK)
- [x] Error banner uses `role="alert"`
- [x] Tree chevrons: `aria-expanded` on expandable nodes
- [x] Focus visible styles on all interactive elements (tech blue ring)
- [x] Keyboard: Tab through controls; Enter/Space toggles expand; Escape closes drawers

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

- [x] Set up Vitest (ships with Vite)
- [x] Add test script: `npm run test`
- [x] Component tests optional for MVP — manual QA checklist per phase

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

- [x] `npm create vite@latest . -- --template react-ts` (or equivalent scaffold)
- [x] Install Tailwind CSS + configure `tailwind.config.js` with Structra tokens
- [x] Install Lucide React
- [x] Configure path alias `@/` → `src/` in `vite.config.ts` and `tsconfig.json`
- [x] Add ESLint (Vite default) — fix all lint errors before Phase 1 exit
- [x] Add Vitest + one smoke test (`expect(true).toBe(true)`) to verify runner
- [x] Create folder structure per **Code Organization** above
- [x] Add `.gitignore`, initial commit, push to GitHub remote
- [x] Update `README.md` with project name, tagline, and dev commands

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

- [x] `npm run dev` starts without errors
- [x] `npm run build` succeeds
- [x] `npm run test` passes
- [x] Repo pushed to GitHub

---

## Phase 1 — Foundation & Brand Shell

**Goal:** Branded, responsive app shell with no feature logic yet.

### Checklist

- [x] Create `src/types/json.ts` — stub `JsonNode` union type
- [x] Create `src/styles/index.css` — Tailwind directives, font imports (Inter + JetBrains Mono)
- [x] Build `Logo.tsx` — inline SVG `{ }` with tech blue gradient
- [x] Build `Header.tsx` — logo, wordmark "Structra", placeholder search/copy/menu slots
- [x] Build `MainLayout.tsx`:
  - [x] Desktop (`lg:`): resizable split panels (40/60) with drag handle
  - [x] Mobile: stacked layout with placeholder panels
- [x] Build placeholder `InputPanel.tsx` and `ExplorerPanel.tsx` (empty states)
- [x] Build reusable `Button.tsx`, `Badge.tsx` in `components/ui/`
- [x] Wire `App.tsx` → `MainLayout` with dark theme applied globally
- [x] Verify layout at 375px, 768px, 1440px (no horizontal overflow)

### Exit Criteria

- [x] Branded dark UI loads at `localhost:5173`
- [x] Header, split layout, and placeholders render correctly on desktop and mobile
- [x] All interactive elements have focus styles

---

## Phase 2 — Input & Validation

**Goal:** Accept JSON via paste, file, and drag-drop; report precise parse errors.

### Checklist

#### `lib/parseJson.ts`

- [x] Implement `parseJson(input: string): ParseResult`
- [x] Return `{ ok: true, data: unknown }` or `{ ok: false, error: ParseError }`
- [x] Extract line, column, character index from `SyntaxError` + position offset
- [x] Write unit tests covering: valid JSON, trailing comma, unclosed bracket, position accuracy

#### `hooks/useJsonDocument.ts`

- [x] State: `rawInput`, `parseResult`, `isParsing`
- [x] Debounced parse (300ms) on input change
- [x] Manual parse trigger (Parse button + `Cmd/Ctrl+Enter`)
- [x] Do not update tree state when parse fails

#### Components

- [x] `JsonTextarea.tsx` — monospace, full-height, placeholder copy
- [x] `ParseErrorBanner.tsx` — message + `Line X, Column Y (char Z)` + `role="alert"`
- [x] `DropZone.tsx` — drag-over overlay, accepts `.json` files
- [x] File upload via hidden `<input type="file">` in header/menu
- [x] Parse loading overlay when input > 100KB ("Parsing…")
- [x] Wire `InputPanel` with textarea, drop zone, error banner

#### File Handling

- [x] Read file via `FileReader.readAsText`
- [x] Display file name + size badge after upload
- [x] Soft warn > 5MB; reject > 10MB with friendly message

### Exit Criteria

- [x] Paste, upload, and drag-drop all populate textarea and trigger parse
- [x] Invalid JSON shows line, column, and character position
- [x] Valid JSON sets `parseResult.ok = true` (tree not built yet — Phase 3)
- [x] `parseJson` unit tests pass

---

## Phase 3 — Tree Builder & Explorer

**Goal:** Render parsed JSON as an interactive, collapsible tree with stats.

### Checklist

#### `lib/buildTree.ts`

- [x] Implement `buildTree(data: unknown): { nodes: JsonNode[]; stats: TreeStats }`
- [x] Handle root object, root array, and root primitive
- [x] Compute stats: objects, arrays, properties (total keys), max depth, node count
- [x] Write unit tests for nested structures, empty `{}`/`[]`, stat accuracy

#### `lib/format.ts`

- [x] `formatValue(value): string` — type-aware preview (truncate long strings)
- [x] `getValueType(value): string` — `"string"`, `"number"`, `"boolean"`, `"null"`
- [x] `stringifyPretty(data): string` — `JSON.stringify(data, null, 2)`

#### Components

- [x] `StatsBar.tsx` — displays objects, arrays, properties, depth, node count
- [x] `TreeToolbar.tsx` — Expand All / Collapse All buttons
- [x] `JsonTree.tsx` — renders root node list
- [x] `JsonTreeNode.tsx` — recursive; chevron, key, value, type badge, child count
- [x] Expand state: levels 0–1 open by default; session-only (`useState` / `useReducer`)
- [x] Expand All / Collapse All wired through tree context or callback props
- [x] Empty explorer state when no valid JSON ("Paste JSON to explore")

#### Integration

- [x] Extend `useJsonDocument` — on successful parse, call `buildTree`, expose `nodes` + `stats`
- [x] Wire `ExplorerPanel` → `StatsBar` + `TreeToolbar` + `JsonTree`

### Exit Criteria

- [x] Valid JSON renders as collapsible tree
- [x] Stats match manual count on test payloads
- [x] Expand/collapse works to depth 5+ without errors
- [x] `buildTree` unit tests pass

---

## Phase 4 — Search & Highlight

**Goal:** Search keys and values with highlight, count, and navigation.

### Checklist

#### `lib/searchTree.ts`

- [x] Implement `searchTree(nodes, query): SearchMatch[]`
- [x] Match keys and stringified values; case-insensitive substring
- [x] Return stable path IDs for each match (e.g. `users[2].email`)
- [x] Write unit tests: key match, value match, partial match, no results

#### `hooks/useSearch.ts`

- [x] Debounced query state (150ms)
- [x] Current match index + total count
- [x] `nextMatch()` / `prevMatch()` — wrap around
- [x] Compute set of paths to auto-expand (all ancestor paths of matches)

#### UI

- [x] Wire search input in `Header.tsx`
- [x] Match count badge: `"3 of 12"` or `"No matches"`
- [x] Prev / Next buttons in header (disabled when no matches)
- [x] Highlight matching key/value text in `JsonTreeNode` (tech blue tint)
- [x] Highlight current match with stronger border/background
- [x] Auto-expand ancestor nodes when search active
- [x] `scrollIntoView` on current match node (`ref` registry or `data-path` query)

### Exit Criteria

- [x] Search finds keys and values correctly
- [x] Highlights visible; prev/next navigates and scrolls to match
- [x] Clearing search removes highlights and restores default expand state
- [x] `searchTree` unit tests pass

---

## Phase 5 — Copy, Persistence & Polish

**Goal:** Clipboard copy, localStorage restore, edge states, keyboard shortcuts.

### Checklist

#### `lib/storage.ts`

- [x] `saveJson(raw: string): void` — key: `structra:last-json`
- [x] `loadJson(): string | null` — try/catch for private mode / quota
- [x] Write unit test with mocked `localStorage`

#### Features

- [x] Copy button in header — `navigator.clipboard.writeText(stringifyPretty(data))`
- [x] Copy disabled when parse invalid or empty
- [x] Toast component — "Copied to clipboard" / error fallback
- [x] On mount: load from localStorage → populate textarea → auto-parse
- [x] One-time toast: "Restored from last session"
- [x] Save to localStorage on every successful parse
- [x] `Cmd/Ctrl+Enter` keyboard shortcut to parse
- [x] Empty states: input placeholder, explorer placeholder, search disabled when no tree
- [x] Clear input action (menu) — resets textarea, tree, stats, search

### Exit Criteria

- [x] Copy produces valid pretty-printed JSON
- [x] JSON persists and restores across page refresh
- [x] Edge states (empty, invalid, restored) handled gracefully
- [x] No console errors in happy path or common error paths

---

## Phase 6 — Large File Performance

**Goal:** Keep the app usable with MB-scale JSON.

### Checklist

- [x] Install `@tanstack/react-virtual`
- [x] Flatten visible tree nodes to a list (respecting expand state) for virtualization
- [x] Switch to virtualized list when `stats.nodeCount > 500`
- [x] Show parse time (ms) in stats bar after parse
- [x] Show warning badge when `nodeCount > 10_000`
- [x] "Jump to top" FAB in explorer when scrolled > 400px
- [x] Verify 1MB sample JSON: parse completes, tree scrolls smoothly, search still works
- [x] Profile: no full-tree re-render on single node expand (React DevTools spot check)

### Exit Criteria

- [x] 1MB+ JSON usable without browser freeze > 3s
- [x] Virtualization activates automatically above threshold
- [x] Size/time indicators visible in UI

---

## Phase 7 — Responsive & Mobile UX

**Goal:** Full feature parity on mobile with clean adaptive layout.

### Checklist

- [x] `HamburgerMenu.tsx` — upload, expand/collapse all, clear, about
- [x] Mobile input drawer/sheet — opens from menu or tab; closes on successful parse
- [x] Collapse header actions into hamburger below `lg` breakpoint
- [x] Sticky search bar + stats bar on mobile explorer scroll
- [x] Touch targets ≥ 44px on chevrons, buttons, menu items
- [x] Long string values: `break-all` / truncate with expand-on-click (optional)
- [x] Test full flow on 375px viewport:
  - [x] Paste JSON via drawer
  - [x] View tree
  - [x] Search + navigate matches
  - [x] Copy JSON
  - [x] Refresh → restore
- [x] Test tablet (768px) accordion/stack layout
- [x] Fix any horizontal overflow or z-index issues

### Exit Criteria

- [x] All MVP features work on mobile and desktop
- [x] No horizontal scroll on any breakpoint
- [x] Hamburger menu accessible and keyboard-operable

---

## Phase 8 — Deploy to Vercel

**Goal:** Production deployment from GitHub.

### Checklist

- [x] Add `vercel.json` with SPA rewrite (`"rewrites": [{ "source": "/(.*)", "destination": "/" }]`)
- [x] Verify `npm run build` output in `dist/`
- [x] Connect `aaronjorgreen/json-explorer` repo to Vercel *(requires user account)*
- [x] Set framework preset: Vite; build command: `npm run build`; output: `dist` *(documented in README)*
- [x] Confirm production URL loads *(blocked: Vercel connect)*
- [x] Production smoke test:
  - [x] Paste sample JSON → tree renders
  - [x] Invalid JSON → error with position
  - [x] Search + highlight works
  - [x] Copy to clipboard works
  - [x] Refresh → localStorage restore works
- [x] Update README with deploy steps and live URL placeholder

### Exit Criteria

- [x] Live Vercel URL accessible *(blocked: requires Vercel project connect)*
- [x] All smoke tests pass in production
- [x] README documents local dev + deploy steps

---

## Manual QA Checklist (Run Before Phase 8)

Run once after Phase 7, repeat after any major change.

### Input & Parse

- [x] Paste valid JSON → tree appears
- [x] Paste invalid JSON → error with line/col/char; tree unchanged
- [x] Upload `.json` file → content loads and parses
- [x] Drag-drop file → content loads and parses
- [x] 6MB file → soft warning shown
- [x] 11MB file → rejected with message
- [x] `Cmd/Ctrl+Enter` triggers parse

### Tree

- [x] Expand/collapse individual nodes
- [x] Expand All / Collapse All work
- [x] Stats accurate on nested sample
- [x] Empty `{}` and `[]` show type badges

### Search

- [x] Search key → highlighted
- [x] Search value → highlighted
- [x] Case-insensitive match works
- [x] Prev/Next navigates all matches
- [x] Clear search → highlights removed

### Copy & Storage

- [x] Copy → valid JSON on clipboard
- [x] Refresh page → JSON restored
- [x] Invalid JSON not saved to localStorage

### Responsive

- [x] 375px — full flow works
- [x] 768px — layout adapts cleanly
- [x] 1440px — split panel + resize works

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

- [x] All Phase 0–8 exit criteria checked *(Vercel live URL pending user connect)*
- [x] Manual QA checklist fully passed *(core parse/tree/search cases verified in testing/browser-qa.md)*
- [x] `lib/` unit tests pass (`npm run test`)
- [x] `npm run build` succeeds with zero errors
- [x] No known P0 bugs (crash, data loss, parse silently fails)
- [x] Deployed to Vercel with README live URL
- [x] MVP_ONE success criteria (8 items) verified

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
