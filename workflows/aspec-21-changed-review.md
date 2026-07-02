---
description: Build a review plan from git diff, implementation log, or Windsurf code map, then execute it as a structured code review
arguments:
  send: true
---

# Changed Review Workflow (Step 21)

Use this workflow after implementation (Step 20) to perform a structured review of all changes introduced in a task, feature branch, or session. It derives a targeted review plan from a `git diff` snapshot, an `implementation-log.md`, or a **Windsurf code map** (the codebase symbol graph that Cascade builds from the current workspace), then executes each review item systematically.

## Usage

```text
/aspec-21-changed-review [source] [optional_flags]
```

- **`source`** — (Optional) One of:
  - A task ID (e.g., `P1-T004`) — diffs against the base branch for that task's branch
  - A file path ending in `.md` — treated as an `implementation-log.md`
  - A git ref range (e.g., `main..feature/my-branch` or `HEAD~3..HEAD`) — used directly as diff range
  - `--codemap` flag — uses the Windsurf code map of the current workspace as the review entry (see flag below)
  - Omitted — defaults to `git diff main..HEAD` (current branch vs. `main`)

- **`optional_flags`**:
  - `--scope <area>` — limit review to a specific area (e.g., `--scope api`, `--scope ui`, `--scope security`)
  - `--depth <quick|standard|deep>` — set review depth; default is `standard`
  - `--output <file_path>` — write the review report to a specific file (default: `docs/21-changed-review.md`)
  - `--append` — append to an existing review report instead of overwriting
  - `--codemap [path]` — use the Windsurf code map as the review entry point instead of a git diff. Cascade will analyse the symbol graph of the entire workspace (or a subdirectory if `path` is provided) to identify modules, dependencies, and structural patterns as the basis for the review plan. Use this for architecture reviews, refactor safety checks, or when no meaningful git diff is available.

**Examples:**

- `/aspec-21-changed-review` — review current branch vs. `main`
- `/aspec-21-changed-review P2-T003` — review changes for task P2-T003
- `/aspec-21-changed-review main..feature/auth-flow` — review a specific git range
- `/aspec-21-changed-review docs/features/auth/implementation-log.md` — review based on log
- `/aspec-21-changed-review HEAD~5..HEAD --scope security --depth deep` — deep security review of last 5 commits
- `/aspec-21-changed-review --output docs/reviews/sprint-1-review.md` — write report to custom path
- `/aspec-21-changed-review --codemap` — architecture/structural review of the full workspace via code map
- `/aspec-21-changed-review --codemap src/api --scope api --depth deep` — deep code map review of the `src/api` subtree

## Input

```text
$ARGUMENTS
```

**Argument parsing:**

1. If `--codemap` is present, enter **code map mode** (see Step 1b below). The optional value after `--codemap` is the subdirectory path to scope the map to.
2. If the argument matches a task ID pattern (e.g., `P1-T001`), resolve the task's branch name from `docs/task-allocation.md` or `docs/18-phase-task-list.md` and compute `git diff main..<branch>`.
3. If the argument is a file path (contains `/` or ends in `.md`) and `--codemap` is not present, treat it as an `implementation-log.md` path.
4. If the argument matches a git ref range (contains `..`), use it directly as the diff range.
5. If no argument is given and `--codemap` is not present, use `git diff main..HEAD` as the diff source.
6. Parse `--scope`, `--depth`, `--output`, and `--append` flags independently from the positional argument.

**Default context files** (load if present):

- `AGENTS.md`
- `docs/19-test-plan.md`
- `docs/12-architecture-summary.md`
- `docs/14-api-design.md`
- `docs/phase-task-list.md`

## Workflow Steps

### 1. Change Source Resolution

Determine the set of changes to review using one of three modes:

#### 1a. Git Diff Mode (default)

- Run `git diff <range> --stat` to get a summary of changed files and line counts.
- Run `git diff <range>` to get the full diff content.
- Run `git log <range> --oneline` to list commits in scope.
- If the diff is empty, report "No changes found in the specified range" and stop.

#### 1b. Code Map Mode (`--codemap`)

- Use the **Windsurf code map** — the symbol dependency graph that Cascade maintains for the current workspace — as the review entry point.
- Scope the map to the directory provided after `--codemap`, or to the full workspace root if none is given.
- From the code map, extract:
  - **Module inventory**: all top-level modules/packages and their file counts.
  - **Dependency graph**: inter-module import relationships (identify circular deps, unexpected couplings).
  - **Public surface**: exported functions, classes, and types per module.
  - **Hotspots**: files with the highest number of incoming dependencies (most-depended-on) and outgoing dependencies (most-coupled).
  - **Orphans**: files with no incoming or outgoing dependencies (potentially dead code).
- There is no git diff in this mode. The review plan (Step 3) is built from the structural findings above instead of file-level diffs.
- If `--scope` is set, filter the code map to modules matching the scope area before analysis.

#### 1c. Implementation Log Mode

- Read the `implementation-log.md` file.
- Extract: task IDs completed, files mentioned as changed, known issues, and next steps.
- Use the task IDs to resolve the corresponding git diff range if possible; otherwise proceed with the log-stated file list.

### 2. Change Classification

Analyse the resolved change set and classify each changed file or module:

| Category | Examples |
| -------- | ------- |
| **API / Contract** | Route handlers, controllers, OpenAPI specs, gRPC proto files |
| **Business Logic** | Services, use case implementations, domain models |
| **Data Layer** | Database migrations, ORM models, repository layer |
| **UI / Frontend** | Components, pages, styles, Figma-linked files |
| **Infrastructure** | Docker, CI/CD, Terraform, Kubernetes configs |
| **Configuration** | `.env` templates, feature flags, app config files |
| **Tests** | Unit tests, integration tests, E2E scripts |
| **Documentation** | Markdown docs, API docs, changelogs |
| **Security-Sensitive** | Auth flows, permission checks, input validation, crypto |

- Apply `--scope` filter if specified — only include files matching the requested category.
- Flag any files that touch **Security-Sensitive** areas regardless of `--scope` for mandatory inclusion.

### 3. Review Plan Generation

Build a structured review plan from the classified changes. Each plan item covers one logical area or file group.

**Review plan format:**

```text
REVIEW PLAN
===========
Source : <git range | implementation-log path>
Depth  : <quick | standard | deep>
Scope  : <all | specified scope>
Items  : <N>

[RP-001] <Title>
  Files     : <file1>, <file2>
  Category  : <category>
  Focus     : <what to look for>
  Risk      : High | Medium | Low

[RP-002] ...
```

**Depth guidance:**

| Depth | What is checked |
| ----- | --------------- |
| `quick` | Obvious bugs, missing error handling, hardcoded secrets |
| `standard` | All of `quick` + logic correctness, spec alignment, test coverage, naming |
| `deep` | All of `standard` + performance implications, security boundaries, edge cases, dependency impact |

- Always include a security-focused item (`[RP-SEC]`) if any security-sensitive files changed, regardless of depth.
- Present the review plan to the user before executing. If `--depth quick` is used with more than 20 changed files, warn and ask to confirm proceeding.

### 4. Review Execution

Execute each review plan item in order. For each item:

#### 4.1 Read & Analyse

- Read the relevant diff sections and surrounding file context.
- Load any referenced spec documents (API design, module design, test plan) for the affected area.

#### 4.2 Apply Review Checklist

Apply the checklist appropriate to the category. Sources consolidated from: `rules/code-review-checklist.md`, `roles/full-stack-dev/workflows/self-code-review.md`, `roles/tech-lead/workflows/architecture-review.md`, `roles/backend-dev/rules/backend-standards.md`, `roles/frontend-dev/rules/frontend-standards.md`, `roles/qa-engineer/rules/qa-standards.md`.

**All categories (always):**

- [ ] No hardcoded credentials, API keys, or secrets
- [ ] No debug statements, `console.log`, or `print` statements left in production paths
- [ ] No commented-out code left in place
- [ ] Error handling is present and meaningful on all paths
- [ ] Logging is appropriate (not over- or under-logged); sensitive data not logged
- [ ] Conventional commit format used (`type(scope): description`)
- [ ] Branch named correctly per project convention (`feature/*`, `fix/*`, `docs/*`, etc.)
- [ ] License compliance: no licensed code exposed to AI; interfaces used for licensed integrations; adapters properly implemented

**Architecture:**

- [ ] Clean architecture principles followed (proper layer separation: API → Service → Repository)
- [ ] Interfaces defined at all boundaries; dependency injection used
- [ ] No circular dependencies introduced
- [ ] Change is consistent with existing architecture (per `docs/12-architecture-summary.md`)
- [ ] Interface-first pattern applied for any licensed code integrations
- [ ] Adapter pattern used correctly where present
- [ ] Scalability and maintainability impact assessed
- [ ] Architecture Decision Record (ADR) written if change is significant

**API / Contract:**

- [ ] RESTful conventions followed
- [ ] Request validation on all inputs (frontend + backend)
- [ ] Response schema matches `docs/14-api-design.md` contract
- [ ] HTTP status codes are correct and consistent
- [ ] Error responses are consistent in format
- [ ] Authentication and authorization enforced on all endpoints
- [ ] Rate limiting or abuse prevention considered
- [ ] API documentation updated to reflect changes

**Business Logic / Service Layer:**

- [ ] Business logic isolated in service layer; not leaked into API or data layer
- [ ] Logic matches specification (use cases, user stories, acceptance criteria)
- [ ] Edge cases handled (empty input, boundary values, concurrent access)
- [ ] No silent failures — errors are surfaced or logged
- [ ] Domain invariants preserved

**Data Layer:**

- [ ] Migrations are reversible (down migration present)
- [ ] No N+1 query patterns introduced
- [ ] Indexes added for new query patterns
- [ ] Transactions used appropriately
- [ ] Sensitive data fields are masked or encrypted at rest
- [ ] Database query time target met (`<100ms`)

**UI / Frontend:**

- [ ] Design tokens used (colors, spacing, typography) — not hardcoded values
- [ ] Component follows Figma design / `aspec-16.4` output
- [ ] Responsive design (mobile-first)
- [ ] Accessibility: ARIA roles, keyboard navigation, screen reader compatibility, WCAG 2.1 AA
- [ ] No raw user input rendered without sanitisation (XSS prevention)
- [ ] Loading, error, and empty states all handled
- [ ] State management: minimal global state; loading and error states present; optimistic updates where appropriate
- [ ] Performance: no unnecessary re-renders; lazy loading for large components; images optimised
- [ ] Core Web Vitals targets not regressed

**Infrastructure / Configuration:**

- [ ] No secrets in config files or CI scripts
- [ ] Infrastructure changes are backward compatible or have a documented rollback plan
- [ ] Resource limits (CPU, memory) are defined
- [ ] GitOps / IaC conventions followed

**Tests:**

- [ ] Unit tests included for all new business logic functions/methods
- [ ] Integration tests included for API endpoints and component interactions
- [ ] Component tests for new UI elements
- [ ] E2E tests added or updated for critical user flows
- [ ] Edge cases and error scenarios tested; mocks used appropriately
- [ ] Tests are maintainable and do not duplicate logic under test
- [ ] No tests deleted or weakened without justification
- [ ] Unit coverage ≥ 80%; integration coverage ≥ 60%; overall coverage does not drop below project target

**Performance:**

- [ ] API response time target met (`<200ms`)
- [ ] No blocking operations on the main thread
- [ ] Caching applied where appropriate
- [ ] Load/stress impact assessed for significant changes

**Security-Sensitive (always `deep` regardless of `--depth`):**

- [ ] Input validation present and covers injection vectors (SQL, XSS, command injection)
- [ ] SQL injection prevention in place (parameterised queries / ORM)
- [ ] CSRF protection in place for state-changing requests
- [ ] Authentication checks cannot be bypassed
- [ ] Authorization: role boundaries enforced per `docs/09-access-control.md`
- [ ] No sensitive data leaked in error messages or logs
- [ ] Audit logging present for sensitive operations
- [ ] Cryptographic operations use approved algorithms; no custom crypto
- [ ] Credentials and secrets securely handled (not hardcoded, not committed)

**Documentation:**

- [ ] API documentation updated
- [ ] README updated if setup or usage changed
- [ ] Code comments added for complex or non-obvious logic
- [ ] Architecture decisions documented (ADR if significant)

#### 4.3 Record Findings

For each finding, record:

```text
[FIND-NNN] <Severity>
  Item     : <RP-NNN>
  File     : <file path>:<line range>
  Category : <checklist category>
  Finding  : <what was found>
  Evidence : <diff line or code snippet, max 5 lines>
  Suggest  : <recommended fix or action>
```

Severity levels:

| Severity | Meaning |
| -------- | ------- |
| **Critical** | Security vulnerability, data loss risk, must fix before merge |
| **High** | Correctness bug or spec mismatch, should fix before merge |
| **Medium** | Quality issue, missing test, should fix in current sprint |
| **Low** | Style, naming, minor improvement — fix when time permits |
| **Info** | Observation or suggestion, no action required |

#### 4.4 Spec Alignment Check

For each changed area, verify alignment with relevant spec documents:

- API changes → compare against `docs/14-api-design.md`
- Data model changes → compare against `docs/04-data-model.md`
- Access control changes → compare against `docs/09-access-control.md`
- UI changes → compare against `docs/ux-flow-reqs/` and `docs/ux-flows/`
- Task completion → verify against acceptance criteria in `docs/19-test-plan.md`

Record any spec mismatches as **High** findings.

### 5. Test Coverage Assessment

- Count new/modified source files vs. new/modified test files in the diff.
- If test files are absent for new source files, raise a **Medium** finding per untested module.
- Check if the test plan (`docs/19-test-plan.md`) acceptance criteria for the task are verifiably met by the tests present.
- Summarise overall test coverage delta: `+N tests added`, `M tests modified`, `K source files without test coverage`.

### 6. Summary & Report Generation

After executing all review plan items, produce the review report.

**Report file:** write to `--output` path if specified, otherwise `docs/21-changed-review.md`. If file exists and `--append` is not set, ask the user whether to overwrite.

**Report structure:**

```markdown
---
classification: Internal
version: 1.0
last_updated: {YYYY-MM-DD}
reviewer: Cascade (AI Review Agent)
---

# Changed Review Report

## Review Metadata

| Field | Value |
|-------|-------|
| Source | {git range or log path} |
| Reviewed At | {YYYY-MM-DD HH:MM} |
| Depth | {quick / standard / deep} |
| Scope | {all / specified scope} |
| Commits | {N commits} |
| Files Changed | {N files} |
| Lines Added | +{N} |
| Lines Removed | -{N} |

## Commit Summary

| Hash | Message | Author | Date |
|------|---------|--------|------|
| {hash} | {message} | {author} | {date} |

---

## Review Plan

| ID | Title | Category | Risk | Status |
|----|-------|----------|------|--------|
| RP-001 | {title} | {category} | High | ✅ Reviewed |
| ... | ... | ... | ... | ... |

---

## Findings

### Critical

| ID | File | Finding | Suggest |
|----|------|---------|---------|
| FIND-001 | {file}:{lines} | {description} | {action} |

### High

| ID | File | Finding | Suggest |
|----|------|---------|---------|
| ... | ... | ... | ... |

### Medium

| ID | File | Finding | Suggest |
|----|------|---------|---------|
| ... | ... | ... | ... |

### Low / Info

| ID | File | Finding | Suggest |
|----|------|---------|---------|
| ... | ... | ... | ... |

---

## Spec Alignment

| Area | Spec Document | Status | Notes |
|------|--------------|--------|-------|
| API | 14-api-design.md | ✅ Aligned | |
| Data Model | 04-data-model.md | ⚠️ Partial | {note} |
| Access Control | 09-access-control.md | ✅ Aligned | |

---

## Test Coverage

| Metric | Value |
|--------|-------|
| Tests Added | +{N} |
| Tests Modified | {N} |
| Source Files Without Tests | {N} |
| Acceptance Criteria Met | {N}/{total} |

---

## Review Verdict

| Criterion | Result |
|-----------|--------|
| Critical findings | {N} |
| High findings | {N} |
| Spec mismatches | {N} |
| Test coverage adequate | Yes / No |
| **Overall verdict** | ✅ Approved / ⚠️ Approved with conditions / ❌ Requires changes |

### Conditions (if applicable)

{List any conditions that must be resolved before merge}

---

## Next Steps

{Numbered list of recommended actions, ordered by priority}
```

### 7. Agent Handoff (Optional)

If **Critical** or **High** findings exist:

- Notify the **Testing Agent** to add regression tests for the affected areas.
- Coordinate via `/agent-01-coordination` using `collab:` if the fix requires multiple agents.
- Update `docs/task-allocation.md` — set the task status to `🔴 Review Required` if findings block merge.

If all findings are **Medium** or below and verdict is **Approved**:

- Update `docs/task-allocation.md` — set the task status to `✅ Review Passed`.
- Proceed to deployment workflows (`/aspec-15.1-deployment`) or next task.

## Output

- A structured review report written to `docs/21-changed-review.md` (or `--output` path).
- Status update in `docs/task-allocation.md` for the reviewed task.
- Agent coordination log entries if handoffs were triggered.

## Next Steps

- **If Critical/High findings:** fix findings, then re-run `/aspec-21-changed-review` with `--append` to review the fix diff.
- **If Approved:** proceed to `/aspec-15.1-deployment` for deployment planning, or pick the next task via `/aspec-20-implement`.
- **If Approved with conditions:** resolve conditions within the current sprint before deployment.
