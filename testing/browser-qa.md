# Structra Browser QA — Manual Test Cases

> **Purpose:** Run each case against `http://localhost:5173`, compare actual vs expected behavior, document findings, then implement fixes.

**How to run:** Start dev server (`npm run dev`), open app, paste each **Input** into the JSON textarea, wait for debounced parse (~300ms), then verify **Expected output**.

**Agent workflow:**
1. Enter test input → observe output
2. Compare actual vs expected
3. Record pass/fail + notes in **Agent notes** section
4. After all cases: implement refinements, re-run failed cases

**Last run:** 2026-07-06 · Agent: Cursor · Viewport: 1440×900 desktop

---

## Test 1 — Valid flat object

### Input
```json
{
  "name": "Alice",
  "age": 30,
  "active": true
}
```

### Expected output
| Check | Expected |
|-------|----------|
| Parse result | Success — no error banner |
| Explorer badge | `Ready` |
| Stats | Objects: 1, Arrays: 0, Properties: 3, Depth: 1, Nodes: 4 |
| Tree | Root object expanded; keys `name`, `age`, `active` visible with primitive values |
| Search | Enabled (not disabled) |
| Copy | Enabled |

### Agent notes

| Field | Value |
|-------|-------|
| **Status** | ✅ Pass |
| **Actual output** | No error. Explorer `Ready`. Stats: Objects 1, Arrays 0, Properties 3, Depth 1, Nodes 4, Parse 0ms. Tree shows `object · 3 items` with `name: "Alice"`, `age: 30`, `active: true`. Search enabled. Copy enabled. |
| **Pass/Fail** | **Pass** |
| **Improvements needed** | None |

---

## Test 2 — Valid nested object with array

### Input
```json
{
  "users": [
    { "id": 1, "email": "alice@example.com" },
    { "id": 2, "email": "bob@example.com" }
  ],
  "meta": { "version": 2, "tags": ["api", "v2"] }
}
```

### Expected output
| Check | Expected |
|-------|----------|
| Parse result | Success |
| Stats | Objects: 4, Arrays: 2, Properties: 8, Depth: 3, Nodes: 13 |
| Tree | `users` array shows child count; nested objects expand correctly |
| Search "alice" | 1+ match; highlight on `alice@example.com` |
| Expand All | All nodes expand without error |

### Agent notes

| Field | Value |
|-------|-------|
| **Status** | ✅ Pass |
| **Actual output** | Stats: Objects 4, Arrays 2, Properties 8, Depth 3, Nodes 13. Tree shows `users` array with `2 items`, nested user objects, `meta` with `version` and `tags`. Search "alice" → `1 of 1` match. |
| **Pass/Fail** | **Pass** |
| **Improvements needed** | None. *(Original expected stats were wrong — Properties is 8 and Nodes is 13, not 5/12.)* |

---

## Test 3 — Invalid JSON (trailing comma)

### Input
```json
{
  "items": [1, 2, 3,],
  "ok": true
}
```

### Expected output
| Check | Expected |
|-------|----------|
| Parse result | Failure — error banner visible |
| Error message | Human-readable, e.g. `Unexpected token ']'` |
| Error position | Line, Column, and char index pointing near the trailing comma (not `Line 1, Column 1`) |
| Explorer | Stays empty — badge `No data`, placeholder "Paste JSON to explore" |
| Tree | No tree rendered |
| Search | Disabled |
| Copy | Disabled |

### Agent notes

| Field | Value |
|-------|-------|
| **Status** | ⚠️ Fail → ✅ Fixed |
| **Actual output (before fix)** | Error shown but position was `Line 1, Column 1 (char 0)`. Explorer empty, search/copy disabled — correct. Message was noisy V8 snippet. |
| **Actual output (after fix)** | `Unexpected token ']'` · `Line 2, Column 20 (char 21)`. Explorer empty, search/copy disabled. |
| **Pass/Fail** | **Pass** (after fix) |
| **Improvements needed** | **Fixed in `src/lib/parseJson.ts`:** improved snippet regex for `... is not valid JSON` messages, longest-match snippet indexing, trailing-comma fallback, cleaner error messages via `formatParseErrorMessage()`. |

---

## Test 4 — Invalid JSON (unclosed bracket)

### Input
```json
{
  "items": [1, 2, 3,
  "name": "broken"
```

### Expected output
| Check | Expected |
|-------|----------|
| Parse result | Failure — error banner with position |
| Error position | Line number ≥ 2 (error in multi-line input) |
| Explorer | Empty — no tree rendered |
| Stats bar | Not visible |

### Agent notes

| Field | Value |
|-------|-------|
| **Status** | ✅ Pass |
| **Actual output** | `Expected ',' or ']' after array element` · `Line 3, Column 9 (char 31)`. Explorer placeholder shown, no stats bar, no tree. |
| **Pass/Fail** | **Pass** |
| **Improvements needed** | None |

---

## Test 5 — Empty structures and null primitive

### Input
```json
{
  "emptyObject": {},
  "emptyArray": [],
  "nothing": null
}
```

### Expected output
| Check | Expected |
|-------|----------|
| Parse result | Success |
| Stats | Objects: 2, Arrays: 1, Properties: 3, Depth: 1, Nodes: 4 |
| Tree | `emptyObject` and `emptyArray` show type badges with zero-item counts |
| `nothing` | Renders `null` |
| Child counts | `object · 0 items`, `array · 0 items` |

### Agent notes

| Field | Value |
|-------|-------|
| **Status** | ✅ Pass |
| **Actual output** | Stats: Objects 2, Arrays 1, Properties 3, Depth 1, Nodes 4. Tree shows `emptyObject: object · 0 items`, `emptyArray: array · 0 items`, `nothing: null`. |
| **Pass/Fail** | **Pass** |
| **Improvements needed** | Minor: MVP spec mentions `{0}` / `[0]` badges; UI uses `0 items` text instead. Acceptable — no code change needed unless branding requires `{0}` format. |

---

## Summary — Agent findings (after all tests)

| Test | Result | Action taken |
|------|--------|--------------|
| 1 | ✅ Pass | — |
| 2 | ✅ Pass | Corrected expected stats in this doc |
| 3 | ✅ Pass (after fix) | Fixed `parseJson` error position + message cleanup |
| 4 | ✅ Pass | — |
| 5 | ✅ Pass | Updated expected depth; noted `{0}` vs `0 items` wording |

### Cross-cutting improvements implemented

1. **`src/lib/parseJson.ts`**
   - Support V8 error format ending in `... is not valid JSON` (not just `" is not valid JSON`)
   - Prefer longest snippet match to avoid false single-character matches
   - Fallback: detect trailing commas before `]`/`}` for `Unexpected token ']'` errors
   - Added `formatParseErrorMessage()` for cleaner user-facing messages

2. **`src/lib/parseJson.test.ts`**
   - Trailing comma test now asserts line > 1 and char > 0

### Re-test results

- Test 3 re-run in browser after fix: **Pass** — `Line 2, Column 20 (char 21)`
- `npm run test`: **33/33 passing**

### Optional follow-ups (not blocking deploy)

- [ ] Consider `{0}` / `[0]` badge format for empty containers (cosmetic)
- [ ] Add automated Playwright script mirroring these 5 cases in CI
