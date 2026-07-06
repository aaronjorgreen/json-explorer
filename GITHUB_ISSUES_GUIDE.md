# GITHUB_ISSUES_GUIDE — Structra JSON Explorer

> **MANDATORY:** Any agent, contributor, or automated workflow **MUST** follow this guide whenever making changes to this codebase — including bug fixes, features, refactors, documentation updates, dependency changes, and deployment work.

**Repository:** [aaronjorgreen/json-explorer](https://github.com/aaronjorgreen/json-explorer)

**Related docs:**
- [MVP_ONE.md](./MVP_ONE.md) — product scope and success criteria
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — build phases and checklists

---

## 1. Non-Negotiable Rules

The following rules apply to **every** codebase change. No exceptions.

| # | Rule |
|---|------|
| 1 | **No unlinked work.** Every change MUST trace to a GitHub Issue. |
| 2 | **Issue before code.** Create or select an Issue BEFORE writing code, editing files, or opening a PR. |
| 3 | **One issue, one concern.** Each Issue covers a single logical unit of work. Split large work into multiple Issues. |
| 4 | **Label before assign.** Apply all required labels at Issue creation. Update labels when scope or status changes. |
| 5 | **Close via PR.** Issues MUST be closed by a merged PR using a closing keyword, or manually with a written reason — never silently abandoned. |
| 6 | **Sync project docs.** When an Issue completes a checklist item, update [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) in the same PR. |
| 7 | **No direct commits to `main`.** All work goes through a branch and PR linked to an Issue. |
| 8 | **Search before create.** Always search open and closed Issues before creating a duplicate. |

---

## 2. Agent Workflow (Required Sequence)

Every agent MUST execute these steps in order. **Do not skip steps.**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. SEARCH existing Issues (open + closed)                      │
│         ↓                                                       │
│  2. CREATE or SELECT an Issue                                   │
│         ↓                                                       │
│  3. APPLY required labels + fill template fields                │
│         ↓                                                       │
│  4. CREATE branch from main (named per §5)                      │
│         ↓                                                       │
│  5. IMPLEMENT change (scoped to Issue only)                     │
│         ↓                                                       │
│  6. UPDATE IMPLEMENTATION_PLAN.md checkboxes (if applicable)   │
│         ↓                                                       │
│  7. OPEN PR linked to Issue (Fixes #N)                          │
│         ↓                                                       │
│  8. VERIFY exit criteria from Issue body                        │
│         ↓                                                       │
│  9. MERGE PR → Issue auto-closes → confirm closure comment      │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1 — Search First

Before creating an Issue, search the repo for:
- Same or similar title keywords
- Same phase number (e.g. `Phase 2`)
- Same component or module name (e.g. `parseJson`, `JsonTree`)

If a matching open Issue exists → **use it**. Do not create a duplicate.

If a closed Issue covers the same fix → reopen only if the bug regressed; otherwise create a new Issue referencing the original.

### Step 2 — Create or Select

| Situation | Action |
|-----------|--------|
| Planned phase work | Select or create Issue mapped to IMPLEMENTATION_PLAN phase |
| Bug discovered during work | Create a new `bug` Issue; do not fold unrelated bugs into a feature Issue |
| Scope grows beyond Issue | Stop; create a follow-up Issue; keep current PR scoped |
| Blocked | Comment on Issue, add `status: blocked` label, state blocker explicitly |

### Step 3 — Label and Document

Apply labels per §4. Fill the Issue body using the template in §3. **An Issue without labels and exit criteria is invalid — do not start work.**

### Steps 4–9 — Implement, PR, Close

Follow §5 (branching), §6 (PR requirements), and §8 (closure) exactly.

---

## 3. Issue Body Template (Mandatory Fields)

Every Issue MUST include all sections below. Copy this structure into the Issue body.

```markdown
## Summary
One or two sentences describing what and why.

## Motivation
- Which MVP / IMPLEMENTATION_PLAN item does this address?
- Link: IMPLEMENTATION_PLAN.md → Phase N → [specific checklist item]

## Scope
### In scope
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2

### Out of scope
- Explicit exclusions to prevent scope creep

## Acceptance Criteria
- [ ] Criterion 1 (testable)
- [ ] Criterion 2 (testable)
- [ ] IMPLEMENTATION_PLAN checkbox updated (if applicable)
- [ ] No new lint / build / test failures

## Technical Notes
- Files / modules expected to change
- Dependencies or risks (optional)

## Testing
- [ ] Unit tests added/updated (lib/ modules)
- [ ] Manual QA steps performed (list them)

## References
- MVP_ONE.md section (if relevant)
- Related Issues: #N
```

**Agents MUST NOT begin implementation until Acceptance Criteria are defined.**

---

## 4. Label Taxonomy

### 4.1 Required Labels (apply at least one from each row)

Every Issue MUST have:

| Category | Label | When to use |
|----------|-------|-------------|
| **Type** | `type: feature` | New capability |
| | `type: bug` | Broken or incorrect behaviour |
| | `type: chore` | Tooling, deps, config, CI, repo setup |
| | `type: docs` | Documentation only |
| | `type: refactor` | Code restructure, no behaviour change |
| | `type: test` | Test coverage only |
| **Phase** | `phase: 0` … `phase: 8` | Maps to IMPLEMENTATION_PLAN phase |
| | `phase: post-mvp` | Out-of-scope MVP_ONE items |
| **Priority** | `priority: critical` | Blocks merge, deploy, or core flow |
| | `priority: high` | Required for current phase exit criteria |
| | `priority: medium` | Important but not blocking |
| | `priority: low` | Nice-to-have, polish |
| **Status** | `status: ready` | Fully specified; safe to start |
| | `status: in-progress` | Branch open; work underway |
| | `status: blocked` | Cannot proceed; blocker documented in comment |
| | `status: in-review` | PR open and awaiting review |
| | `status: done` | Merged and verified *(optional; closure is sufficient)* |

### 4.2 Optional Labels (add when relevant)

| Label | When to use |
|-------|-------------|
| `area: parse` | parseJson, validation, errors |
| `area: tree` | buildTree, JsonTree, expand/collapse |
| `area: search` | searchTree, highlight, navigation |
| `area: input` | textarea, file upload, drag-drop |
| `area: ui` | layout, header, branding, responsive |
| `area: perf` | virtualization, large files |
| `area: storage` | localStorage, persistence |
| `area: deploy` | Vercel, build, CI |
| `good first issue` | Small, well-defined, low risk |
| `help wanted` | Needs human input or decision |

### 4.3 Label Rules

1. **Minimum label set:** 1× `type:*` + 1× `phase:*` + 1× `priority:*` + 1× `status:*`
2. **Update `status:*` immediately** when work state changes — remove the old status label when adding the new one
3. **Never use more than one label from the same category** (one type, one phase, one priority, one status)
4. **Add `area:*` labels** when the Issue touches a specific module — aids filtering and agent routing
5. If a required label does not exist in the repo yet, **create it** before opening the Issue (see §9)

---

## 5. Branch Naming

Branch names MUST follow this pattern:

```
<type>/<issue-number>-<short-slug>
```

**Examples:**
- `feat/12-parse-json-line-column-errors`
- `chore/3-scaffold-vite-tailwind`
- `fix/28-search-highlight-mobile-scroll`

**Rules:**
- Lowercase, hyphen-separated slug
- Max ~50 characters for slug portion
- MUST include Issue number
- One branch per Issue (no multi-issue branches)

---

## 6. Pull Request Requirements

Every PR MUST:

| Requirement | Detail |
|-------------|--------|
| **Link to Issue** | PR body contains `Fixes #N` or `Closes #N` (exact Issue number) |
| **Scoped diff** | Changes only what the Issue defines; no drive-by refactors |
| **Pass checks** | `npm run build`, `npm run test`, lint — all green before merge |
| **Update docs** | IMPLEMENTATION_PLAN.md checkboxes marked `[x]` for completed items |
| **PR title** | Matches commit convention: `type(scope): description (#N)` |
| **PR description** | Summary, what changed, how to test, screenshots for UI changes |

### PR Body Template

```markdown
## Summary
Brief description of change.

## Issue
Fixes #N

## Changes
- Change 1
- Change 2

## Testing
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Manual: [steps]

## Screenshots
(if UI change)

## Checklist
- [ ] Scoped to Issue only
- [ ] IMPLEMENTATION_PLAN.md updated
- [ ] Acceptance criteria from Issue verified
```

### Merge Rules

- **Squash merge** preferred for clean history
- PR MUST be linked to an Issue — unlinked PRs MUST NOT be merged
- Do not merge with failing checks unless explicitly documented and approved in Issue comment

---

## 7. Issue Lifecycle & Management

### 7.1 States

```
OPEN (status: ready)
  → OPEN (status: in-progress)     [branch created, work started]
  → OPEN (status: in-review)         [PR opened]
  → OPEN (status: blocked)           [blocker identified — optional state]
  → CLOSED                           [PR merged or manual close with reason]
```

### 7.2 During Active Work

Agents MUST:

- [ ] Comment on the Issue when starting work: *"Starting work on branch `feat/N-slug`"*
- [ ] Comment if scope, approach, or timeline changes
- [ ] Comment if blocked — tag blocker explicitly (missing decision, dependency, external access)
- [ ] Keep Issue Acceptance Criteria in sync with reality; edit the Issue body if criteria change (with comment explaining why)

### 7.3 Issue Comments — Required Content

| Event | Required comment |
|-------|------------------|
| Work started | Branch name + brief approach |
| PR opened | PR link + testing notes |
| Blocked | What is blocked, what is needed, who can unblock |
| Scope change | What changed and why; link to spin-off Issue if created |
| Merged | Confirmation that acceptance criteria were verified |

### 7.4 What Agents MUST NOT Do

- MUST NOT commit to `main` directly
- MUST NOT open a PR without an linked Issue
- MUST NOT close an Issue without merged code (unless `type: docs` or explicit user instruction)
- MUST NOT leave `status: in-progress` on closed Issues
- MUST NOT batch unrelated changes into one Issue or PR
- MUST NOT create Issues for work already completed without retroactive documentation (if unavoidable, create Issue + immediate close with PR reference)

---

## 8. Issue Closure

### 8.1 Standard Closure (Preferred)

Issues MUST be closed automatically by merging a PR that includes:

```
Fixes #<issue-number>
```

in the PR body. GitHub will close the Issue on merge.

### 8.2 Manual Closure (Exceptions Only)

Manual closure is permitted ONLY when:

| Scenario | Requirement |
|----------|-------------|
| Duplicate Issue | Comment: `Duplicate of #N` → close |
| Won't fix / out of scope | Comment with reason + link to MVP_ONE out-of-scope section |
| Cannot reproduce | Comment documenting reproduction attempts |
| Superseded | Comment: `Superseded by #N` → close |

Manual closes MUST include a comment explaining **why**. Empty closes are forbidden.

### 8.3 Closure Verification Checklist

Before considering an Issue done, verify:

- [ ] All Acceptance Criteria in Issue body are met
- [ ] PR merged to `main`
- [ ] Issue status is closed
- [ ] IMPLEMENTATION_PLAN.md updated (if applicable)
- [ ] No related `status: blocked` comments left unresolved
- [ ] Follow-up Issues created for any deferred work (and linked in closing comment)

### 8.4 Reopening

Reopen an Issue ONLY if:
- A regression is confirmed against the original Acceptance Criteria
- The merged PR did not actually satisfy the criteria

On reopen: add `type: bug`, update priority, comment with regression details.

---

## 9. Repo Label Setup (One-Time)

If labels do not exist in the repository, the agent responsible for repo setup MUST create all labels from §4 before opening any other Issues.

### Labels to Create

**Type:** `type: feature`, `type: bug`, `type: chore`, `type: docs`, `type: refactor`, `type: test`

**Phase:** `phase: 0` through `phase: 8`, `phase: post-mvp`

**Priority:** `priority: critical`, `priority: high`, `priority: medium`, `priority: low`

**Status:** `status: ready`, `status: in-progress`, `status: blocked`, `status: in-review`, `status: done`

**Area:** `area: parse`, `area: tree`, `area: search`, `area: input`, `area: ui`, `area: perf`, `area: storage`, `area: deploy`

**Other:** `good first issue`, `help wanted`

Use GitHub MCP (`issue_write`) or `gh label create` to bootstrap. Document completion in a `type: chore` Issue.

---

## 10. Mapping Issues to IMPLEMENTATION_PLAN Phases

When creating Issues for MVP work, map one Issue per logical deliverable within a phase — not one mega-Issue per phase.

### Recommended Issue Granularity

| Phase | Suggested Issues |
|-------|------------------|
| **0** | Scaffold project; Configure Tailwind + tokens; Vitest + folder structure |
| **1** | Brand/logo; Header; MainLayout responsive shell |
| **2** | parseJson lib + tests; InputPanel + textarea; File upload + drag-drop |
| **3** | buildTree lib + tests; JsonTree + JsonTreeNode; StatsBar |
| **4** | searchTree lib + tests; Search UI + highlight; Match navigation |
| **5** | localStorage; Copy + toast; Keyboard shortcuts + empty states |
| **6** | Tree virtualization; Large file warnings + perf indicators |
| **7** | Hamburger menu; Mobile drawer; Responsive QA fixes |
| **8** | Vercel config; Deploy + smoke test; README live URL |

Each Issue title SHOULD start with the phase for clarity:

```
[Phase 2] Add parseJson with line/column error extraction
[Phase 4] Implement search match prev/next navigation
```

---

## 11. Issue Title Conventions

```
[Phase N] <Imperative verb> <what> (<module/component>)
```

**Examples:**
- `[Phase 0] Scaffold Vite React TypeScript project`
- `[Phase 2] Add parseJson with line/column errors (lib/parseJson)`
- `[Phase 3] Build recursive JsonTreeNode component`
- `[Bug] Search highlight not scrolling on mobile (area: search)`

**Rules:**
- Use imperative mood: "Add", "Fix", "Update", "Remove"
- Keep under 72 characters
- Include module hint in parentheses when helpful

---

## 12. Using GitHub MCP (Agents)

When using the GitHub MCP server, agents MUST:

1. Call `get_me` to confirm authentication before any write operation
2. Search existing Issues with `search_issues` before `issue_write` create
3. Use `issue_write` with method `create` for new Issues — include full template body and labels
4. Use `issue_write` with method `update` to add labels or change state
5. Use `create_pull_request` with `Fixes #N` in body
6. Verify Issue closed after merge via `issue_read` or `search_issues`

**Do not** use GitHub MCP to close Issues without merged code unless §8.2 exception applies.

---

## 13. Quick Reference Checklist

Copy and use for every codebase change:

```markdown
### Pre-work
- [ ] Searched existing Issues (no duplicate)
- [ ] Issue created/selected with full template
- [ ] Labels applied: type + phase + priority + status:ready
- [ ] Branch created: <type>/<issue#>-<slug>

### During work
- [ ] Commented "starting work" on Issue
- [ ] Changes scoped to Issue only
- [ ] status → in-progress

### Pre-merge
- [ ] PR opened with "Fixes #N"
- [ ] build + test pass
- [ ] IMPLEMENTATION_PLAN.md updated
- [ ] status → in-review

### Post-merge
- [ ] Issue auto-closed
- [ ] Acceptance criteria verified
- [ ] Follow-up Issues filed for deferred work
```

---

## 14. Enforcement Statement

> **This guide is binding.** Any agent working on the Structra JSON Explorer codebase MUST read and follow GITHUB_ISSUES_GUIDE.md before creating branches, editing files, or opening pull requests. Changes made outside this workflow are invalid and MUST be remediated: create a retroactive Issue, link the PR, and update documentation.

---

*Document version: GITHUB_ISSUES_GUIDE v1.0 — Structra JSON Explorer*
