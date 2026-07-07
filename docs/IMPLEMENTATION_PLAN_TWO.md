# IMPLEMENTATION_PLAN_TWO — Structra JSON Fixer Dashboard

> **Purpose:** Step-by-step build guide for MVP_TWO. Use this document to track progress, follow conventions, and ship the Fixer tab with consistent developer hygiene.

**Related docs:** [MVP_TWO.md](./MVP_TWO.md) · [MVP_ONE.md](./MVP_ONE.md) · [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

**How to use this doc:**
1. Work phases in order — each phase builds on the last.
2. Check off items as you complete them (`[ ]` → `[x]`).
3. Do not start the next phase until **Exit criteria** for the current phase pass.
4. Keep commits small and scoped to one checklist section where possible.
5. Link every PR to a GitHub Issue per [GITHUB_ISSUES_GUIDE.md](../GITHUB_ISSUES_GUIDE.md).

---

## Progress Overview

| Phase | Name | Status |
|-------|------|--------|
| A | Sidebar nav + Fixer shell | `[x]` Done |
| B | Validation + diagnostics | `[x]` Done |
| C | Repair engine (core rules) | `[x]` Done |
| D | Output, copy + repair summary | `[x]` Done |
| E | Repair history persistence | `[x]` Done |
| F | QA, polish + Explorer regression | `[x]` Done |

**Legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## UX Design Principles (MVP_TWO)

Apply these across every Fixer phase.

| Principle | Implementation |
|-----------|----------------|
| **Transparent repair** | Never mutate input silently; always show summary of applied rules |
| **Progressive disclosure** | Desktop: 3-panel layout; mobile: stacked steps with sticky actions |
| **Fast feedback** | Validate on debounce (300ms); show status badge immediately |
| **Developer trust** | Confidence labels on each repair (`high` / `medium` / `low`) |
| **Recoverability** | Undo last fix; reopen from history; clear-all with confirm |
| **Cross-tool flow** | "Open in Explorer" after successful repair |

### Visual Language (extends MVP_ONE)

- Reuse Structra tokens: `bg-base`, `bg-surface`, `border-accent`, `text-muted`
- **Explorer** nav icon: tree/braces motif
- **Fixer** nav icon: wrench/sparkle motif
- Status colors:
  - Valid → green tint badge (`emerald-500/20` border)
  - Invalid → amber/red tint badge
  - Repaired → tech blue accent border on output panel
- Monospace panels: `JetBrains Mono` for all JSON input/output
- Panel headers: compact label + optional action (copy, clear, sample)

---

## Updated Code Organization

Extend existing structure — do not break Explorer modules.

```
src/
├── app/
│   ├── App.tsx                    # tab state: Explorer | Fixer
│   └── MainLayout.tsx             # sidebar + content area
├── components/
│   ├── sidebar/
│   │   ├── SidebarNav.tsx
│   │   └── SidebarNavItem.tsx
│   ├── fixer/
│   │   ├── FixerPanel.tsx
│   │   ├── FixerInput.tsx
│   │   ├── FixerStatusBar.tsx
│   │   ├── FixerErrorPanel.tsx
│   │   ├── FixerActionBar.tsx
│   │   ├── FixerOutput.tsx
│   │   ├── FixerSummary.tsx
│   │   ├── FixerHistory.tsx
│   │   └── FixerEmptyState.tsx
│   ├── header/                    # unchanged for Explorer
│   ├── input/                     # unchanged
│   ├── explorer/                  # unchanged
│   └── ui/                        # reuse Button, Badge, Toast
├── hooks/
│   ├── useFixer.ts
│   ├── useFixerHistory.ts
│   └── useAppTab.ts               # Explorer | Fixer + localStorage persist
├── lib/
│   └── fixer/
│       ├── validateJson.ts
│       ├── repairJson.ts
│       ├── repairRules.ts
│       ├── repairSummary.ts
│       └── storageFixHistory.ts
├── types/
│   ├── json.ts                    # existing
│   └── fixer.ts                   # FixAttempt, RepairChange, etc.
└── lib/__fixtures__/fixer/        # malformed JSON test payloads
```

---

## Phase A — Sidebar Nav + Fixer Shell

**Goal:** Introduce two-tab app navigation and an empty Fixer workspace without changing Explorer behavior.

**GitHub Issue:** #28 — `[Phase A] Add sidebar navigation and Fixer shell`

### Checklist

#### Types & state

- [x] Create `src/types/fixer.ts` — stub `FixAttempt`, `FixDiagnostic`, `RepairChange`, `FixerStatus`
- [x] Create `src/hooks/useAppTab.ts` — `Explorer | Fixer` state; persist last tab in `structra:active-tab`
- [x] Default tab: `Explorer` (preserve existing user expectation)

#### Sidebar navigation

- [x] Create `SidebarNav.tsx` — vertical nav, desktop (`lg:`) persistent left rail (~56px collapsed icons / ~200px expanded)
- [x] Create `SidebarNavItem.tsx` — icon + label, `aria-current="page"` on active tab
- [x] Nav items: **Explorer** (braces/tree icon), **Fixer** (wrench icon)
- [x] Active item: tech blue left border + subtle `bg-surface` highlight
- [x] Keyboard: arrow keys cycle tabs when sidebar focused

#### Layout integration

- [x] Refactor `App.tsx` — render `SidebarNav` + active tab content
- [x] Refactor `MainLayout.tsx` — accept children; Explorer layout unchanged inside Explorer branch
- [x] Mobile (`< lg`): sidebar becomes bottom tab bar OR slide-in drawer (choose bottom bar for thumb reach)
- [x] Fixer tab renders `FixerPanel` placeholder shell

#### Fixer shell (empty state)

- [x] Create `FixerPanel.tsx` — responsive grid scaffold
- [x] Create `FixerEmptyState.tsx` — headline, short description, "Load sample broken JSON" button
- [x] Desktop layout: input (left 40%) | diagnostics column (center 25%) | output (right 35%)
- [x] Mobile layout: stacked Input → Status/Actions → Output with sticky `FixerActionBar`

#### UX polish (Phase A)

- [x] Tab switch preserves Explorer state (no reset of parse/tree/search)
- [x] Smooth 150ms cross-fade between tab panels (`prefers-reduced-motion` respected)
- [x] Logo/wordmark remains visible in sidebar header on desktop
- [x] Touch targets ≥ 44px on mobile tab bar

### Exit Criteria

- [x] User can switch between Explorer and Fixer on desktop and mobile
- [x] Explorer features work identically to pre-MVP_TWO
- [x] Fixer shows branded empty shell with sample-load CTA
- [x] Last active tab restores on page reload
- [x] No horizontal overflow at 375px, 768px, 1440px

---

## Phase B — Validation + Diagnostics

**Goal:** Accept malformed JSON, validate it, and show clear syntax diagnostics.

**GitHub Issue:** #29 — `[Phase B] Add Fixer validation and error diagnostics`

### Checklist

#### `lib/fixer/validateJson.ts`

- [x] Implement `validateJson(input: string): ValidationResult`
- [x] Reuse `parseJson` error extraction (line, column, char) — do not duplicate logic
- [x] Return `{ ok: true, data }` or `{ ok: false, error: FixDiagnostic }`
- [x] Add friendly hint mapper: translate common `SyntaxError` messages to plain English
- [x] Unit tests: valid JSON, trailing comma, unquoted key, unclosed bracket

#### `hooks/useFixer.ts`

- [x] State: `rawInput`, `validationResult`, `status` (`idle` | `valid` | `invalid` | `repairing` | `repaired` | `failed`)
- [x] Debounced validate on input change (300ms)
- [x] Manual validate trigger (`Validate` button + `Cmd/Ctrl+Enter`)
- [x] `clearInput()` resets all Fixer state

#### Components

- [x] `FixerInput.tsx` — monospace textarea, line numbers gutter (CSS or lightweight overlay), placeholder copy
- [x] `FixerStatusBar.tsx` — badge: Valid / Invalid / Ready; show char count + line count
- [x] `FixerErrorPanel.tsx` — `role="alert"`; message, line/col/char, friendly hint, suggested next step
- [x] `FixerActionBar.tsx` — Validate (secondary), Fix JSON (primary, disabled when empty)
- [x] Highlight error line in input gutter when invalid (tech blue/red marker)

#### UX polish (Phase B)

- [x] Valid JSON: green status badge; Fix JSON enabled as "Normalize format" (optional label)
- [x] Invalid JSON: amber badge; error panel auto-expands; Fix JSON remains enabled
- [x] Empty input: neutral state; both actions disabled
- [x] Paste large text (>100KB): show lightweight "Validating…" indicator
- [x] Error panel includes "Jump to error line" — scrolls textarea to error offset

### Exit Criteria

- [x] Paste invalid JSON → invalid badge + error panel with line/col/char
- [x] Paste valid JSON → valid badge; no error panel
- [x] Validate button re-runs validation on demand
- [x] `validateJson` unit tests pass
- [x] Explorer tab unaffected

---

## Phase C — Repair Engine (Core Rules)

**Goal:** Auto-repair common JSON syntax issues with a safe, staged pipeline.

**GitHub Issue:** #30 — `[Phase C] Implement JSON repair engine with core rules`

### Checklist

#### `lib/fixer/repairRules.ts`

- [x] `normalizeWhitespace(input)` — trim, normalize `\r\n` → `\n`
- [x] `removeTrailingCommas(input)` — remove `,` before `}` and `]`
- [x] `quoteObjectKeys(input)` — quote unquoted keys in safe contexts
- [x] `insertMissingCommas(input)` — heuristic insert between properties/array primitives
- [x] Each rule returns `{ output, changes: RepairChange[] }`
- [x] Token-aware implementation: never modify content inside string literals
- [x] Unit tests per rule with fixtures in `src/lib/__fixtures__/fixer/`

#### `lib/fixer/repairJson.ts`

- [x] Implement `repairJson(input: string): RepairResult`
- [x] Pipeline: parse → if valid, pretty-format only → else run stages in order
- [x] Re-parse after each stage; stop on first success
- [x] Return `{ success, output, changes, errorsBefore, errorsAfter }`
- [x] Confidence threshold: halt if only `low` confidence transforms remain
- [x] Never `eval` or execute input as JavaScript

#### `lib/fixer/repairSummary.ts`

- [x] `buildRepairSummary(changes): string[]` — human-readable lines
- [x] Example: "Removed 2 trailing commas (high confidence)"
- [x] `totalEditCount(changes): number`

#### Hook integration

- [x] Extend `useFixer.ts` — `fixJson()` action, `repairResult`, `undoStack` (single-level undo)
- [x] Fix JSON sets status → `repairing` → `repaired` or `failed`
- [x] On success: populate output string; on failure: preserve input, show remaining errors

#### UX polish (Phase C)

- [x] Fix JSON button shows spinner during repair
- [x] `Cmd/Ctrl+Shift+F` keyboard shortcut for Fix JSON
- [x] Partial repair: show "Repaired with warnings" if medium-confidence rules applied
- [x] Failed repair: error panel updates with post-repair parse error (if any)

### Exit Criteria

- [x] Trailing comma payloads repair successfully
- [x] Unquoted key payloads repair successfully
- [x] Missing comma payloads repair in safe heuristic cases
- [x] Already-valid JSON normalizes without corruption
- [x] Unrecoverable input fails gracefully with clear message
- [x] All `repairJson` / rule unit tests pass

---

## Phase D — Output, Copy + Repair Summary

**Goal:** Present repaired JSON, enable copy, and show transparent change summary.

**GitHub Issue:** #31 — `[Phase D] Add Fixer output panel, copy, and repair summary`

### Checklist

#### Components

- [x] `FixerOutput.tsx` — read-only monospace panel, pretty-printed JSON, syntax-friendly wrapping
- [x] Copy button — `navigator.clipboard.writeText(output)` + toast
- [x] Copy disabled when no successful repair output
- [x] `FixerSummary.tsx` — list of applied rules with counts and confidence badges
- [x] Summary empty state: "No repairs applied" when input was already valid
- [ ] Optional: toggle "Show diff hints" — inline markers for changed regions (stretch goal)

#### Cross-tab flow

- [x] "Open in Explorer" button — copies fixed JSON to Explorer input and switches tab
- [x] Toast: "Opened in Explorer"
- [x] Explorer auto-parses the transferred JSON

#### Layout polish

- [x] Desktop: output panel sticky header with Copy + Open in Explorer
- [x] Mobile: output in collapsible section; auto-expand on successful repair
- [x] Success state: output panel gets accent border glow
- [x] Show before/after stats: char count, line count delta in summary header

#### Undo

- [x] "Undo fix" restores pre-repair input (single-level)
- [x] Undo disabled after tab switch or new input edit

### Exit Criteria

- [x] Successful repair renders formatted output
- [x] Copy produces valid parseable JSON
- [x] Repair summary lists each applied rule with count
- [x] Open in Explorer works end-to-end
- [x] Undo restores previous input

---

## Phase E — Repair History Persistence

**Goal:** Save, reopen, and delete recent repair attempts in localStorage.

**GitHub Issue:** #32 — `[Phase E] Add Fixer repair history with localStorage`

### Checklist

#### `lib/fixer/storageFixHistory.ts`

- [x] `saveFixAttempt(attempt: FixAttempt): void` — key: `structra:fixer-history:v1`
- [x] `loadFixHistory(): FixAttempt[]`
- [x] `deleteFixAttempt(id: string): void`
- [x] `clearFixHistory(): void`
- [x] Cap at 20 entries; prune oldest on save
- [x] try/catch for quota/private mode — fail silently, app still works
- [x] Unit tests with mocked `localStorage`

#### `hooks/useFixerHistory.ts`

- [x] Load history on mount
- [x] Auto-save on each fix attempt (success or failure)
- [x] `reopenAttempt(id)` — populate input, output, summary from record
- [x] `deleteAttempt(id)`, `clearAll()`

#### `FixerHistory.tsx`

- [x] Sidebar panel or bottom drawer listing recent repairs
- [x] Each row: relative timestamp, success/fail icon, preview snippet (first 60 chars)
- [x] Click row → reopen; delete icon per row with confirm
- [x] "Clear all history" with confirm dialog
- [x] Empty state: "No repairs yet"

#### UX polish (Phase E)

- [x] History badge on Fixer nav item showing count (optional, max "9+")
- [x] Reopened attempt highlights in history list
- [x] Failed attempts saved with error summary for debugging
- [x] History stored separately from Explorer `structra:last-json`

### Exit Criteria

- [x] Successful repairs appear in history after fix
- [x] History survives page refresh
- [x] Reopen populates input/output correctly
- [x] Delete and clear-all work
- [x] Storage unit tests pass

---

## Phase F — QA, Polish + Explorer Regression

**Goal:** Harden Fixer, add test coverage, and confirm Explorer has zero regressions.

**GitHub Issue:** #33 — `[Phase F] Fixer QA, polish, and Explorer regression testing`

### Checklist

#### Test fixtures (`src/lib/__fixtures__/fixer/`)

- [x] `trailing-comma-object.json`
- [x] `trailing-comma-array.json`
- [x] `unquoted-keys.json`
- [x] `unquoted-keys-nested.json`
- [x] `missing-comma-object.json`
- [x] `missing-comma-array.json`
- [x] `mixed-errors.json`
- [x] `already-valid.json`
- [x] `unrecoverable.json`

#### Unit test coverage

- [x] `validateJson.test.ts` — all fixture cases
- [x] `repairRules.test.ts` — per-rule isolation tests
- [x] `repairJson.test.ts` — end-to-end pipeline tests
- [x] `repairSummary.test.ts` — summary formatting
- [x] `storageFixHistory.test.ts` — save/load/prune/delete

#### Manual QA (desktop + mobile)

- [x] Paste broken JSON → validate → fix → copy → open in Explorer
- [x] Invalid JSON error panel accurate at multiple error positions
- [x] History reopen and delete flows
- [x] Tab switch preserves Explorer parse/tree/search state
- [x] 375px full Fixer flow (no horizontal scroll)
- [x] 768px tablet layout
- [x] 1440px desktop 3-panel layout
- [x] Keyboard shortcuts: Validate, Fix JSON
- [x] `prefers-reduced-motion` — no jarring animations

#### Explorer regression

- [x] Paste, parse, tree, search, copy, localStorage restore — all unchanged
- [x] Mobile Explorer drawer and hamburger — unchanged
- [x] Large file virtualization — unchanged

#### Final polish

- [x] README updated with Fixer tab description
- [x] `docs/MVP_TWO.md` acceptance criteria verified
- [x] No console errors on happy path or common error paths
- [x] `npm run test` and `npm run build` pass

### Exit Criteria

- [x] All Phase A–E exit criteria still pass
- [x] Full manual QA checklist signed off
- [x] Explorer regression checklist signed off
- [x] All Fixer unit tests pass
- [x] Build succeeds with zero errors

---

## Manual QA Checklist (Run After Phase F)

### Fixer Core Flow

- [ ] Load sample broken JSON → invalid status shown
- [ ] Fix JSON → valid output rendered
- [ ] Repair summary lists changes
- [ ] Copy → valid JSON on clipboard
- [ ] Open in Explorer → tree renders

### Validation

- [ ] Valid JSON → green badge, no error panel
- [ ] Invalid JSON → error with line/col/char
- [ ] Jump to error line works
- [ ] Empty input → neutral state

### Repair Edge Cases

- [ ] Trailing comma (object and array)
- [ ] Unquoted keys (flat and nested)
- [ ] Missing commas (safe cases)
- [ ] Already valid JSON → format-only normalization
- [ ] Unrecoverable JSON → clear failure message, input preserved

### History

- [ ] Repair saved to history
- [ ] Reopen restores input + output
- [ ] Delete single item works
- [ ] Clear all works
- [ ] History survives refresh

### Navigation & Responsive

- [ ] Tab switch Explorer ↔ Fixer preserves state
- [ ] 375px — full flow, no horizontal scroll
- [ ] 768px — layout adapts
- [ ] 1440px — 3-panel layout

### Explorer Regression

- [ ] Paste → tree → search → copy → refresh restore

---

## Definition of Done (MVP_TWO)

MVP_TWO is complete when **all** of the following are true:

- [x] All Phase A–F exit criteria checked
- [x] Manual QA checklist fully passed
- [x] `lib/fixer/` unit tests pass (`npm run test`)
- [x] `npm run build` succeeds with zero errors
- [x] No known P0 bugs (crash, data loss, silent corruption of JSON)
- [x] MVP_TWO acceptance criteria (11 items) verified
- [x] Explorer tab has zero functional regressions

---

## Suggested Commit Flow

| Order | Commit scope | Phase |
|-------|--------------|-------|
| 1 | `feat(nav): add sidebar with Explorer and Fixer tabs` | A |
| 2 | `feat(fixer): add Fixer panel shell and empty state` | A |
| 3 | `feat(fixer): add validation and error diagnostics` | B |
| 4 | `feat(fixer): add repair rules and staged pipeline` | C |
| 5 | `feat(fixer): add output panel, copy, and repair summary` | D |
| 6 | `feat(fixer): add open in Explorer cross-tab flow` | D |
| 7 | `feat(fixer): persist repair history in localStorage` | E |
| 8 | `test(fixer): add repair fixtures and unit tests` | F |
| 9 | `docs: update README with Fixer tab` | F |

---

## Dependencies

No new npm packages required for MVP_TWO.

| Module | Reused from MVP_ONE |
|--------|---------------------|
| `parseJson.ts` | Error extraction for validation |
| `format.ts` | `stringifyPretty` for output |
| `Button`, `Badge`, `Toast` | UI primitives |
| `storage.ts` patterns | localStorage fail-safe handling |

---

*Document version: IMPLEMENTATION_PLAN_TWO v1.0 — Structra JSON Fixer Dashboard*
