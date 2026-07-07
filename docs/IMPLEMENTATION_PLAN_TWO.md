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
| A | Sidebar nav + Fixer shell | `[ ]` Not started |
| B | Validation + diagnostics | `[ ]` Not started |
| C | Repair engine (core rules) | `[ ]` Not started |
| D | Output, copy + repair summary | `[ ]` Not started |
| E | Repair history persistence | `[ ]` Not started |
| F | QA, polish + Explorer regression | `[ ]` Not started |

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

- [ ] Create `src/types/fixer.ts` — stub `FixAttempt`, `FixDiagnostic`, `RepairChange`, `FixerStatus`
- [ ] Create `src/hooks/useAppTab.ts` — `Explorer | Fixer` state; persist last tab in `structra:active-tab`
- [ ] Default tab: `Explorer` (preserve existing user expectation)

#### Sidebar navigation

- [ ] Create `SidebarNav.tsx` — vertical nav, desktop (`lg:`) persistent left rail (~56px collapsed icons / ~200px expanded)
- [ ] Create `SidebarNavItem.tsx` — icon + label, `aria-current="page"` on active tab
- [ ] Nav items: **Explorer** (braces/tree icon), **Fixer** (wrench icon)
- [ ] Active item: tech blue left border + subtle `bg-surface` highlight
- [ ] Keyboard: arrow keys cycle tabs when sidebar focused

#### Layout integration

- [ ] Refactor `App.tsx` — render `SidebarNav` + active tab content
- [ ] Refactor `MainLayout.tsx` — accept children; Explorer layout unchanged inside Explorer branch
- [ ] Mobile (`< lg`): sidebar becomes bottom tab bar OR slide-in drawer (choose bottom bar for thumb reach)
- [ ] Fixer tab renders `FixerPanel` placeholder shell

#### Fixer shell (empty state)

- [ ] Create `FixerPanel.tsx` — responsive grid scaffold
- [ ] Create `FixerEmptyState.tsx` — headline, short description, "Load sample broken JSON" button
- [ ] Desktop layout: input (left 40%) | diagnostics column (center 25%) | output (right 35%)
- [ ] Mobile layout: stacked Input → Status/Actions → Output with sticky `FixerActionBar`

#### UX polish (Phase A)

- [ ] Tab switch preserves Explorer state (no reset of parse/tree/search)
- [ ] Smooth 150ms cross-fade between tab panels (`prefers-reduced-motion` respected)
- [ ] Logo/wordmark remains visible in sidebar header on desktop
- [ ] Touch targets ≥ 44px on mobile tab bar

### Exit Criteria

- [ ] User can switch between Explorer and Fixer on desktop and mobile
- [ ] Explorer features work identically to pre-MVP_TWO
- [ ] Fixer shows branded empty shell with sample-load CTA
- [ ] Last active tab restores on page reload
- [ ] No horizontal overflow at 375px, 768px, 1440px

---

## Phase B — Validation + Diagnostics

**Goal:** Accept malformed JSON, validate it, and show clear syntax diagnostics.

**GitHub Issue:** #29 — `[Phase B] Add Fixer validation and error diagnostics`

### Checklist

#### `lib/fixer/validateJson.ts`

- [ ] Implement `validateJson(input: string): ValidationResult`
- [ ] Reuse `parseJson` error extraction (line, column, char) — do not duplicate logic
- [ ] Return `{ ok: true, data }` or `{ ok: false, error: FixDiagnostic }`
- [ ] Add friendly hint mapper: translate common `SyntaxError` messages to plain English
- [ ] Unit tests: valid JSON, trailing comma, unquoted key, unclosed bracket

#### `hooks/useFixer.ts`

- [ ] State: `rawInput`, `validationResult`, `status` (`idle` | `valid` | `invalid` | `repairing` | `repaired` | `failed`)
- [ ] Debounced validate on input change (300ms)
- [ ] Manual validate trigger (`Validate` button + `Cmd/Ctrl+Enter`)
- [ ] `clearInput()` resets all Fixer state

#### Components

- [ ] `FixerInput.tsx` — monospace textarea, line numbers gutter (CSS or lightweight overlay), placeholder copy
- [ ] `FixerStatusBar.tsx` — badge: Valid / Invalid / Ready; show char count + line count
- [ ] `FixerErrorPanel.tsx` — `role="alert"`; message, line/col/char, friendly hint, suggested next step
- [ ] `FixerActionBar.tsx` — Validate (secondary), Fix JSON (primary, disabled when empty)
- [ ] Highlight error line in input gutter when invalid (tech blue/red marker)

#### UX polish (Phase B)

- [ ] Valid JSON: green status badge; Fix JSON enabled as "Normalize format" (optional label)
- [ ] Invalid JSON: amber badge; error panel auto-expands; Fix JSON remains enabled
- [ ] Empty input: neutral state; both actions disabled
- [ ] Paste large text (>100KB): show lightweight "Validating…" indicator
- [ ] Error panel includes "Jump to error line" — scrolls textarea to error offset

### Exit Criteria

- [ ] Paste invalid JSON → invalid badge + error panel with line/col/char
- [ ] Paste valid JSON → valid badge; no error panel
- [ ] Validate button re-runs validation on demand
- [ ] `validateJson` unit tests pass
- [ ] Explorer tab unaffected

---

## Phase C — Repair Engine (Core Rules)

**Goal:** Auto-repair common JSON syntax issues with a safe, staged pipeline.

**GitHub Issue:** #30 — `[Phase C] Implement JSON repair engine with core rules`

### Checklist

#### `lib/fixer/repairRules.ts`

- [ ] `normalizeWhitespace(input)` — trim, normalize `\r\n` → `\n`
- [ ] `removeTrailingCommas(input)` — remove `,` before `}` and `]`
- [ ] `quoteObjectKeys(input)` — quote unquoted keys in safe contexts
- [ ] `insertMissingCommas(input)` — heuristic insert between properties/array primitives
- [ ] Each rule returns `{ output, changes: RepairChange[] }`
- [ ] Token-aware implementation: never modify content inside string literals
- [ ] Unit tests per rule with fixtures in `src/lib/__fixtures__/fixer/`

#### `lib/fixer/repairJson.ts`

- [ ] Implement `repairJson(input: string): RepairResult`
- [ ] Pipeline: parse → if valid, pretty-format only → else run stages in order
- [ ] Re-parse after each stage; stop on first success
- [ ] Return `{ success, output, changes, errorsBefore, errorsAfter }`
- [ ] Confidence threshold: halt if only `low` confidence transforms remain
- [ ] Never `eval` or execute input as JavaScript

#### `lib/fixer/repairSummary.ts`

- [ ] `buildRepairSummary(changes): string[]` — human-readable lines
- [ ] Example: "Removed 2 trailing commas (high confidence)"
- [ ] `totalEditCount(changes): number`

#### Hook integration

- [ ] Extend `useFixer.ts` — `fixJson()` action, `repairResult`, `undoStack` (single-level undo)
- [ ] Fix JSON sets status → `repairing` → `repaired` or `failed`
- [ ] On success: populate output string; on failure: preserve input, show remaining errors

#### UX polish (Phase C)

- [ ] Fix JSON button shows spinner during repair
- [ ] `Cmd/Ctrl+Shift+F` keyboard shortcut for Fix JSON
- [ ] Partial repair: show "Repaired with warnings" if medium-confidence rules applied
- [ ] Failed repair: error panel updates with post-repair parse error (if any)

### Exit Criteria

- [ ] Trailing comma payloads repair successfully
- [ ] Unquoted key payloads repair successfully
- [ ] Missing comma payloads repair in safe heuristic cases
- [ ] Already-valid JSON normalizes without corruption
- [ ] Unrecoverable input fails gracefully with clear message
- [ ] All `repairJson` / rule unit tests pass

---

## Phase D — Output, Copy + Repair Summary

**Goal:** Present repaired JSON, enable copy, and show transparent change summary.

**GitHub Issue:** #31 — `[Phase D] Add Fixer output panel, copy, and repair summary`

### Checklist

#### Components

- [ ] `FixerOutput.tsx` — read-only monospace panel, pretty-printed JSON, syntax-friendly wrapping
- [ ] Copy button — `navigator.clipboard.writeText(output)` + toast
- [ ] Copy disabled when no successful repair output
- [ ] `FixerSummary.tsx` — list of applied rules with counts and confidence badges
- [ ] Summary empty state: "No repairs applied" when input was already valid
- [ ] Optional: toggle "Show diff hints" — inline markers for changed regions (stretch goal)

#### Cross-tab flow

- [ ] "Open in Explorer" button — copies fixed JSON to Explorer input and switches tab
- [ ] Toast: "Opened in Explorer"
- [ ] Explorer auto-parses the transferred JSON

#### Layout polish

- [ ] Desktop: output panel sticky header with Copy + Open in Explorer
- [ ] Mobile: output in collapsible section; auto-expand on successful repair
- [ ] Success state: output panel gets accent border glow
- [ ] Show before/after stats: char count, line count delta in summary header

#### Undo

- [ ] "Undo fix" restores pre-repair input (single-level)
- [ ] Undo disabled after tab switch or new input edit

### Exit Criteria

- [ ] Successful repair renders formatted output
- [ ] Copy produces valid parseable JSON
- [ ] Repair summary lists each applied rule with count
- [ ] Open in Explorer works end-to-end
- [ ] Undo restores previous input

---

## Phase E — Repair History Persistence

**Goal:** Save, reopen, and delete recent repair attempts in localStorage.

**GitHub Issue:** #32 — `[Phase E] Add Fixer repair history with localStorage`

### Checklist

#### `lib/fixer/storageFixHistory.ts`

- [ ] `saveFixAttempt(attempt: FixAttempt): void` — key: `structra:fixer-history:v1`
- [ ] `loadFixHistory(): FixAttempt[]`
- [ ] `deleteFixAttempt(id: string): void`
- [ ] `clearFixHistory(): void`
- [ ] Cap at 20 entries; prune oldest on save
- [ ] try/catch for quota/private mode — fail silently, app still works
- [ ] Unit tests with mocked `localStorage`

#### `hooks/useFixerHistory.ts`

- [ ] Load history on mount
- [ ] Auto-save on each fix attempt (success or failure)
- [ ] `reopenAttempt(id)` — populate input, output, summary from record
- [ ] `deleteAttempt(id)`, `clearAll()`

#### `FixerHistory.tsx`

- [ ] Sidebar panel or bottom drawer listing recent repairs
- [ ] Each row: relative timestamp, success/fail icon, preview snippet (first 60 chars)
- [ ] Click row → reopen; delete icon per row with confirm
- [ ] "Clear all history" with confirm dialog
- [ ] Empty state: "No repairs yet"

#### UX polish (Phase E)

- [ ] History badge on Fixer nav item showing count (optional, max "9+")
- [ ] Reopened attempt highlights in history list
- [ ] Failed attempts saved with error summary for debugging
- [ ] History stored separately from Explorer `structra:last-json`

### Exit Criteria

- [ ] Successful repairs appear in history after fix
- [ ] History survives page refresh
- [ ] Reopen populates input/output correctly
- [ ] Delete and clear-all work
- [ ] Storage unit tests pass

---

## Phase F — QA, Polish + Explorer Regression

**Goal:** Harden Fixer, add test coverage, and confirm Explorer has zero regressions.

**GitHub Issue:** #33 — `[Phase F] Fixer QA, polish, and Explorer regression testing`

### Checklist

#### Test fixtures (`src/lib/__fixtures__/fixer/`)

- [ ] `trailing-comma-object.json`
- [ ] `trailing-comma-array.json`
- [ ] `unquoted-keys.json`
- [ ] `unquoted-keys-nested.json`
- [ ] `missing-comma-object.json`
- [ ] `missing-comma-array.json`
- [ ] `mixed-errors.json`
- [ ] `already-valid.json`
- [ ] `unrecoverable.json`

#### Unit test coverage

- [ ] `validateJson.test.ts` — all fixture cases
- [ ] `repairRules.test.ts` — per-rule isolation tests
- [ ] `repairJson.test.ts` — end-to-end pipeline tests
- [ ] `repairSummary.test.ts` — summary formatting
- [ ] `storageFixHistory.test.ts` — save/load/prune/delete

#### Manual QA (desktop + mobile)

- [ ] Paste broken JSON → validate → fix → copy → open in Explorer
- [ ] Invalid JSON error panel accurate at multiple error positions
- [ ] History reopen and delete flows
- [ ] Tab switch preserves Explorer parse/tree/search state
- [ ] 375px full Fixer flow (no horizontal scroll)
- [ ] 768px tablet layout
- [ ] 1440px desktop 3-panel layout
- [ ] Keyboard shortcuts: Validate, Fix JSON
- [ ] `prefers-reduced-motion` — no jarring animations

#### Explorer regression

- [ ] Paste, parse, tree, search, copy, localStorage restore — all unchanged
- [ ] Mobile Explorer drawer and hamburger — unchanged
- [ ] Large file virtualization — unchanged

#### Final polish

- [ ] README updated with Fixer tab description
- [ ] `docs/MVP_TWO.md` acceptance criteria verified
- [ ] No console errors on happy path or common error paths
- [ ] `npm run test` and `npm run build` pass

### Exit Criteria

- [ ] All Phase A–E exit criteria still pass
- [ ] Full manual QA checklist signed off
- [ ] Explorer regression checklist signed off
- [ ] All Fixer unit tests pass
- [ ] Build succeeds with zero errors

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

- [ ] All Phase A–F exit criteria checked
- [ ] Manual QA checklist fully passed
- [ ] `lib/fixer/` unit tests pass (`npm run test`)
- [ ] `npm run build` succeeds with zero errors
- [ ] No known P0 bugs (crash, data loss, silent corruption of JSON)
- [ ] MVP_TWO acceptance criteria (11 items) verified
- [ ] Explorer tab has zero functional regressions

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
