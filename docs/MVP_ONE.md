# MVP_ONE — Structra JSON Explorer

> **Structra** — *See your JSON clearly.*

A sleek, dark-first JSON explorer that treats JSON as structured data. Parse first, render from the tree — never manipulate raw strings for display.

---

## Brand & App Vibe

| Element | Direction |
|---------|-----------|
| **Name** | **Structra** |
| **Tagline** | See your JSON clearly |
| **Logo** | Stylized `{ }` brackets forming a node tree — inner braces glow tech blue (`#3B82F6` → `#60A5FA` gradient), outer frame sharp and minimal |
| **Personality** | Precise, calm, developer-trusted. Like a well-built dev tool — not flashy, but unmistakably polished |
| **Tone** | Short labels, clear feedback, no clutter. Data is the hero |

### Visual Language

- **Background:** Deep navy-charcoal (`#0B1120` base, `#111827` surfaces)
- **Accent:** Tech blue — borders, focus rings, active states, match highlights (`#3B82F6`, `#2563EB`, `#60A5FA`)
- **Text:** `#F1F5F9` primary, `#94A3B8` secondary, `#64748B` muted
- **Borders:** 1px solid `#1E3A5F` default; `#3B82F6` on focus/active
- **Typography:** `Inter` or `Geist` for UI; `JetBrains Mono` for JSON keys/values
- **Radius:** 8px cards, 6px inputs/buttons
- **Motion:** Subtle 150ms ease on expand/collapse, panel transitions, and highlight fade-in

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **React 18 + TypeScript** | Component model fits recursive tree UI |
| Build | **Vite** | Fast dev, simple Vercel deploy |
| Styling | **Tailwind CSS** | Responsive utilities, design tokens via config |
| Icons | **Lucide React** | Clean, consistent icon set |
| Deploy | **Vercel** | Zero-config SPA/static deploy |

No heavy state library for MVP — `useState` + `useReducer` + `useMemo` is sufficient.

---

## Core Architecture Principle

```
Raw string → JSON.parse() → typed tree model → React tree UI
                ↓ fail
         Error with line/col/position → user-facing message
```

**Never** pretty-print by string manipulation for the explorer view. Formatting is applied at render time from the parsed structure. Copy/export uses `JSON.stringify(parsed, null, 2)`.

---

## Feature Specification

### 1. Input (paste primary; file + drag-drop supported)

| Method | Behavior |
|--------|----------|
| **Paste** | Large textarea in input panel; auto-parse on debounced input (300ms) or explicit "Parse" button |
| **File upload** | Button in toolbar opens file picker; accepts `.json`, `application/json` |
| **Drag & drop** | Drop zone overlay on input panel when dragging files |

On successful parse, switch focus to explorer view (mobile: auto-collapse input drawer).

### 2. Validation & Error Reporting

- Use native `JSON.parse()` wrapped to capture position
- Map `SyntaxError` message + position to **line**, **column**, and **character index**
- Display error banner with:
  - Human-readable message
  - `Line X, Column Y (char Z)`
  - Highlight error region in input editor when possible
- Invalid JSON never updates the tree or stats

### 3. Tree Explorer (structured render)

Recursive component model:

```ts
type JsonNode =
  | { type: 'object'; key?: string; entries: JsonNode[] }
  | { type: 'array'; key?: string; items: JsonNode[] }
  | { type: 'primitive'; key?: string; value: string | number | boolean | null }
```

**Expand/collapse defaults (decided):**
- **Level 0 (root):** expanded
- **Level 1:** expanded
- **Level 2+:** collapsed
- Toolbar actions: **Expand All** / **Collapse All**
- Collapse state is **session-only** (resets on new parse) — keeps MVP simple; localStorage stores JSON only

**Node row shows:**
- Chevron (objects/arrays only)
- Key (if nested): `key:` in muted blue-gray
- Value preview for primitives
- Type badge for empty `{}` / `[]`
- Child count badge: `{4}` or `[12]`

### 4. Search (keys + values)

| Rule | Decision |
|------|----------|
| Scope | Keys and values (stringified for primitives) |
| Match | Case-insensitive substring |
| UX | Live search with 150ms debounce |
| Results | Match count badge + **Prev / Next** navigation |
| Highlight | Tech blue background tint on matching keys/values; auto-scroll to current match |
| Auto-expand | Ancestors of matches auto-expand so results are visible |

Empty search clears highlights.

### 5. Statistics Bar

Fixed strip below toolbar:

| Stat | Definition |
|------|------------|
| **Objects** | Count of every `{}` node (including root if object) |
| **Arrays** | Count of every `[]` node |
| **Properties** | Total key count across all objects (nested keys included; array indices excluded) |
| **Depth** | Max nesting depth (bonus indicator for large payloads) |
| **Size** | Approximate parsed node count; show warning badge if > 10k nodes |

### 6. Copy Formatted JSON

- **Copy** button copies pretty-printed JSON (`JSON.stringify(data, null, 2)`)
- Toast confirmation: "Copied to clipboard"
- Disabled when JSON is invalid or empty

### 7. localStorage Persistence

| Stored | Key | Notes |
|--------|-----|-------|
| Last valid JSON string | `structra:last-json` | Restored on load |
| — | — | Search query and collapse state **not** persisted (MVP scope) |

On restore: auto-parse and render. Show subtle "Restored from last session" toast once.

### 8. Large File Handling (MB+)

| Concern | Approach |
|---------|----------|
| Parse blocking | Parse in main thread for MVP; show spinner + "Parsing…" overlay for inputs > 100KB |
| Render perf | Virtualize tree when node count > 500 (`@tanstack/react-virtual` or custom flat-list + indent) |
| UX indicators | File size badge, node count, parse time ms |
| Scroll guidance | Sticky stats bar; "Jump to top" FAB on long trees; search auto-scrolls to match |
| Input limit | Soft warn at 5MB; hard reject at 10MB with friendly message |

---

## Layout & Responsive UX

### Desktop (≥ 1024px)

Split panel:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Structra          [Search]     [Copy] [≡ Menu]  │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   INPUT PANEL        │   EXPLORER PANEL                 │
│   (paste / drop)     │   (tree + stats bar)             │
│                      │                                  │
│   ~40% width         │   ~60% width                     │
│   resizable divider  │                                  │
└──────────────────────┴──────────────────────────────────┘
```

- Resizable split via drag handle
- Stats bar pinned at top of explorer panel

### Tablet (768px – 1023px)

- Stacked layout: input panel collapsible accordion at top
- Explorer takes remaining height
- Toolbar compacts: icons + hamburger for secondary actions

### Mobile (< 768px)

- **Bottom tab bar** or **hamburger drawer** for: Input | Explorer | Actions
- Input panel: full-width sheet/drawer
- Explorer: full-width with sticky search + stats
- Touch-friendly chevrons (44px min tap targets)
- Horizontal scroll prevented; tree uses indent + word-break on long strings

### Hamburger Menu Contents

- Upload file
- Expand all / Collapse all
- Clear input
- About Structra
- (Future: settings)

---

## Component Map

```
App
├── Header (logo, search, copy, hamburger)
├── MainLayout (responsive split / stack)
│   ├── InputPanel
│   │   ├── DropZone
│   │   ├── JsonTextarea
│   │   └── ParseErrorBanner
│   └── ExplorerPanel
│       ├── StatsBar
│       ├── TreeToolbar (expand/collapse all)
│       └── JsonTree
│           └── JsonTreeNode (recursive)
├── Toast
└── MobileDrawer / HamburgerMenu
```

### Utility Modules

| Module | Responsibility |
|--------|----------------|
| `parseJson.ts` | Parse + line/col/char error extraction |
| `buildTree.ts` | `unknown` → `JsonNode[]` model + stats |
| `searchTree.ts` | Flatten paths, match keys/values, return match paths |
| `storage.ts` | localStorage read/write |
| `format.ts` | Copy stringify, value preview, type labels |

---

## Phase List

### Phase 1 — Foundation & Brand Shell
- [ ] Scaffold Vite + React + TypeScript + Tailwind
- [ ] Configure design tokens (colors, fonts, borders)
- [ ] Build `Header` with Structra logo (SVG) and app shell
- [ ] Responsive `MainLayout` skeleton (desktop split, mobile stack)
- [ ] README with local dev instructions

**Exit criteria:** App loads with branded dark UI shell; responsive layout works at 375px and 1440px.

---

### Phase 2 — Input & Validation
- [ ] `InputPanel` with textarea and debounced parse trigger
- [ ] `parseJson.ts` with line, column, and character position errors
- [ ] `ParseErrorBanner` with clear messaging
- [ ] File upload button + drag-and-drop on input panel
- [ ] Parse loading state for large inputs

**Exit criteria:** User can paste, upload, or drop JSON; invalid JSON shows precise error location; valid JSON triggers parse success.

---

### Phase 3 — Tree Builder & Explorer
- [ ] `buildTree.ts` — parse result to `JsonNode` model
- [ ] `JsonTree` + recursive `JsonTreeNode` with expand/collapse
- [ ] Default expand levels 0–1; Expand All / Collapse All
- [ ] Primitive, object, and array rendering with type badges and child counts
- [ ] `StatsBar` — objects, arrays, properties, depth

**Exit criteria:** Valid JSON renders as interactive collapsible tree with accurate stats.

---

### Phase 4 — Search & Highlight
- [ ] Header search input with debounce
- [ ] `searchTree.ts` — match keys and values (case-insensitive)
- [ ] Highlight matches in tree nodes
- [ ] Match count + Prev/Next navigation with auto-scroll
- [ ] Auto-expand ancestor nodes of matches

**Exit criteria:** Search finds keys and values; highlights visible; navigation jumps between matches.

---

### Phase 5 — Copy, Persistence & Polish
- [ ] Copy formatted JSON to clipboard + toast
- [ ] `localStorage` save/restore last valid JSON
- [ ] Restore toast on session load
- [ ] Empty/invalid states (placeholder copy, disabled actions)
- [ ] Keyboard shortcut: `Cmd/Ctrl + Enter` to parse

**Exit criteria:** Copy works; JSON persists across refresh; edge states handled gracefully.

---

### Phase 6 — Large File Performance
- [ ] Node count detection after parse
- [ ] Virtualized tree rendering when nodes > 500
- [ ] File size badge + parse time indicator
- [ ] Soft warn (5MB) / hard reject (10MB) for uploads
- [ ] "Jump to top" FAB on long explorer scroll

**Exit criteria:** 1MB+ JSON remains usable; UI shows size/performance indicators; no obvious jank on medium-large payloads.

---

### Phase 7 — Responsive & Mobile UX
- [ ] Hamburger menu with secondary actions
- [ ] Mobile drawer/sheet for input panel
- [ ] Touch-friendly tap targets and collapsed toolbar
- [ ] Sticky search + stats on mobile explorer
- [ ] Test and fix at 375px, 768px, 1024px breakpoints

**Exit criteria:** Full feature set usable on mobile and desktop; no horizontal overflow; menus accessible.

---

### Phase 8 — Deploy to Vercel
- [ ] Add `vercel.json` if needed (SPA fallback)
- [ ] Environment/build verification
- [ ] Connect GitHub repo to Vercel
- [ ] Production smoke test: paste, parse, search, copy, restore

**Exit criteria:** Live URL on Vercel; all MVP features work in production.

---

## Out of Scope (Post-MVP)

- JSONPath / JMESPath query
- Edit-in-place tree mutation
- JSON Schema validation
- Light theme toggle
- URL sharing / encoded state
- Multiple tabs / compare mode
- Export to CSV
- Web Worker parsing

---

## Local Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

---

## Success Criteria for MVP_ONE

1. User pastes JSON → sees formatted, collapsible tree within 1s for typical payloads
2. Invalid JSON → error shows line, column, and character position
3. Search highlights keys and values with navigable results
4. Stats accurately reflect objects, arrays, and properties
5. Copy produces valid pretty-printed JSON
6. Last JSON restores on page reload
7. UI is usable on mobile and desktop with tech blue dark aesthetic
8. App deploys to Vercel from GitHub

---

*Document version: MVP_ONE v1.0 — Structra JSON Explorer*
