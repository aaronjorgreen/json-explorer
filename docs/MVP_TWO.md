# MVP_TWO — Structra JSON Fixer Dashboard

> **Structra Fixer** — *Repair broken JSON fast.*

Build a focused developer utility inside a new `Fixer` tab. Users paste malformed JSON, validate it, repair common syntax problems, review exactly what changed, and copy clean parseable JSON.

---

## Product Direction

MVP_TWO extends Structra from "explore valid JSON" to "recover invalid JSON safely."

Two primary app tabs:

1. **Explorer** — existing MVP_ONE interface unchanged.
2. **Fixer** — new repair-focused workspace for malformed JSON.

Design intent:

- Fast feedback for debugging broken payloads.
- Deterministic repairs where possible.
- Clear confidence boundaries when automatic repair is uncertain.
- Zero hidden mutation: always show before/after + repair summary.

---

## User Outcomes

By the end of MVP_TWO, a user can:

1. Paste messy JSON and immediately see **valid/invalid** status.
2. Read a clear error panel with syntax location and message.
3. Click **Fix JSON** to auto-repair common issues.
4. Review the repaired output in formatted JSON.
5. Copy repaired JSON for reuse.
6. Inspect a human-readable repair summary.
7. Reopen or delete prior repairs stored locally.

---

## Core Principles

1. **Safety first**: Never overwrite user input silently.
2. **Transparent fixing**: Every automated fix must be logged in summary output.
3. **Best effort, not magic**: If a fix is ambiguous, stop and explain instead of guessing aggressively.
4. **Developer-grade UX**: Keyboard-friendly, clear diagnostics, minimal clutter.
5. **Local privacy**: Repair history stored in localStorage only.

---

## Scope

### In Scope

- New sidebar/tab navigation with `Explorer` and `Fixer`.
- New Fixer dashboard layout.
- Validation pipeline with valid/invalid status.
- Error panel for syntax diagnostics.
- `Fix JSON` action.
- Auto-repair for common issues:
  - trailing commas
  - missing quotes around object keys
  - missing commas between properties/array values (safe heuristic cases)
  - invalid formatting / normalization
- Repaired output panel with pretty formatting.
- Copy repaired JSON action.
- Repair summary ("what changed").
- Repair history persisted in localStorage.
- Reopen and delete history items.

### Out of Scope (MVP_TWO)

- Full JSON5 feature support.
- Arbitrary semantic correction (e.g., inferring intended values).
- Server/cloud sync of repair history.
- Collaborative repair sessions.
- Schema-aware repair suggestions.

---

## UX Specification

## 1) Navigation

- Add persistent left sidebar (desktop) and compact top/menu variant (mobile).
- Primary navigation items:
  - `Explorer`
  - `Fixer`
- Explorer behavior remains current/default.

## 2) Fixer Dashboard Layout

Desktop (recommended 3-panel):

- **Input Panel (left)**: paste/edit malformed JSON.
- **Diagnostics + Actions (center/top)**:
  - status badge (`Valid` / `Invalid`)
  - error panel
  - `Validate`
  - `Fix JSON`
  - repair summary
- **Output Panel (right)**: repaired pretty JSON + copy button.

Mobile/tablet:

- Stacked panels with sticky action bar.
- Output panel collapsible for readability.

## 3) Validation States

- **Empty**: neutral prompt.
- **Valid**: success badge, parse details, Fix button disabled by default (or optional "Normalize format").
- **Invalid**: error badge + clear diagnostics.
- **Repair Success**: output rendered + summary.
- **Repair Partial/Failed**: preserve input, show unresolved diagnostics.

## 4) Error Panel Requirements

Show:

- Primary parser message.
- Line / column / character offset.
- Short "why this fails" hint (friendly wording).
- Suggested next step if auto-fix cannot complete.

---

## Repair Engine Specification

## Pipeline

1. **Parse attempt** with strict `JSON.parse`.
2. If valid:
   - return normalized output via `JSON.stringify(data, null, 2)`.
3. If invalid:
   - run staged repair transforms.
4. Re-parse after each stage.
5. Stop on first successful parse or final failure.
6. Produce machine-readable repair log + human summary.

## Repair Stages (ordered)

1. **Trim and normalize line endings**.
2. **Remove trailing commas** before `}` / `]`.
3. **Quote unquoted object keys** in safe object-key contexts.
4. **Insert missing commas** in safe, localizable contexts:
   - between adjacent key-value pairs
   - between adjacent array primitive values
5. **Reformat** final valid object with pretty JSON.

## Safety Rules

- Never alter string literal contents when applying syntax transforms.
- Never evaluate input as JavaScript.
- Do not "repair" by deleting large arbitrary chunks.
- Mark each transform with:
  - rule name
  - count of edits
  - confidence (`high`/`medium`/`low`)

If only low-confidence transformations remain, halt and present unresolved issues.

---

## Data Model (Proposed)

```ts
interface FixAttempt {
  id: string;
  createdAt: string;
  originalInput: string;
  fixedOutput: string | null;
  wasValidInitially: boolean;
  success: boolean;
  errorsBefore: FixDiagnostic[];
  errorsAfter: FixDiagnostic[];
  changes: RepairChange[];
}

interface FixDiagnostic {
  message: string;
  line?: number;
  column?: number;
  char?: number;
}

interface RepairChange {
  rule:
    | 'normalize_whitespace'
    | 'remove_trailing_commas'
    | 'quote_object_keys'
    | 'insert_missing_commas'
    | 'pretty_format';
  count: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}
```

History storage key:

- `structra:fixer-history:v1`

Suggested cap:

- Keep most recent 20 repair attempts.

---

## Technical Architecture (MVP_TWO)

### New UI Modules

- `src/components/sidebar/SidebarNav.tsx`
- `src/components/fixer/FixerPanel.tsx`
- `src/components/fixer/FixerInput.tsx`
- `src/components/fixer/FixerStatus.tsx`
- `src/components/fixer/FixerErrorPanel.tsx`
- `src/components/fixer/FixerOutput.tsx`
- `src/components/fixer/FixerSummary.tsx`
- `src/components/fixer/FixerHistory.tsx`

### New Hooks

- `src/hooks/useFixer.ts`
- `src/hooks/useFixerHistory.ts`

### New Lib Modules

- `src/lib/fixer/validateJson.ts`
- `src/lib/fixer/repairJson.ts`
- `src/lib/fixer/repairRules.ts`
- `src/lib/fixer/repairSummary.ts`
- `src/lib/fixer/storageFixHistory.ts`

### Integration

- Existing `App` shell gains tab state (`Explorer` | `Fixer`).
- Explorer remains functionally unchanged.
- Shared UI primitives reused (`Button`, `Badge`, `Toast`).

---

## Phase Plan

## Phase A — Navigation + Fixer Shell

- Add sidebar/tab nav with `Explorer` and `Fixer`.
- Build empty Fixer dashboard scaffold.
- Wire routing/state without changing Explorer logic.

**Exit criteria:** User can switch between Explorer and Fixer; layout is responsive.

## Phase B — Validation + Diagnostics

- Implement validation path for Fixer input.
- Show valid/invalid state and error panel with location.
- Add `Validate` and `Fix JSON` action bar.

**Exit criteria:** Invalid input reliably reports clear syntax diagnostics.

## Phase C — Repair Engine (Core Rules)

- Implement staged repair pipeline and parse checks.
- Support trailing comma, missing key quotes, missing comma heuristics, formatting normalization.
- Emit structured repair log.

**Exit criteria:** Common malformed inputs auto-repair into parseable JSON.

## Phase D — Output + Copy + Summary

- Render repaired formatted JSON output.
- Add copy action.
- Display repair summary list of applied rules and edit counts.

**Exit criteria:** User can inspect and copy repaired output with transparent change summary.

## Phase E — History Persistence

- Save successful and failed attempts to localStorage history.
- Reopen previous repairs into input/output panels.
- Delete individual history items and clear-all.

**Exit criteria:** Repair history survives refresh and is manageable from UI.

## Phase F — QA + Hardening

- Add unit tests for repair rules and edge cases.
- Add manual QA scripts for mobile and desktop.
- Confirm no regressions in Explorer tab behavior.

**Exit criteria:** Build/tests pass; representative malformed JSON set repaired or clearly diagnosed.

---

## Validation and Repair Test Matrix

Must include representative fixtures for:

- trailing comma in object
- trailing comma in array
- unquoted keys (single and nested)
- missing comma between object properties
- missing comma between array primitives
- mixed errors in one payload
- already valid JSON (no-op repair except formatting)
- unrecoverable malformed input

---

## Acceptance Criteria (MVP_TWO)

1. Sidebar/tab navigation includes `Explorer` and `Fixer`.
2. Fixer accepts pasted malformed JSON.
3. Validation clearly indicates valid vs invalid.
4. Error panel shows parser diagnostics with location.
5. `Fix JSON` repairs common syntax errors in scope.
6. Repaired JSON is parseable and pretty formatted.
7. Repaired output can be copied.
8. Repair summary explains applied changes.
9. Repair history persists in localStorage.
10. Users can reopen and delete history entries.
11. Explorer tab remains fully functional without regression.

---

## Risks and Mitigations

- **Ambiguous repairs** → enforce confidence thresholds; stop with clear messaging.
- **Over-fixing valid content** → run strict parse-first path and no-op when valid.
- **Large input performance** → staged transforms with bounded passes.
- **History bloat** → cap entries and prune oldest records.
- **Regex corruption in strings** → token-aware or parser-aware transformations, avoid naive global replacements.

---

## Success Criteria

MVP_TWO is successful when:

- Users can convert common malformed JSON into valid JSON in one flow.
- Repair output is trustworthy due to transparent summaries.
- Fixer works as a practical developer utility across desktop and mobile.
- Existing Explorer workflow remains stable and unchanged in capability.

---

**Implementation plan:** [IMPLEMENTATION_PLAN_TWO.md](./IMPLEMENTATION_PLAN_TWO.md)

---

*Document version: MVP_TWO v1.0 — Structra JSON Fixer Dashboard*
