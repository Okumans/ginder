---
description: Deep review focused on code performance, logic correctness, and design patterns — from git diff, implementation log, or Windsurf code map
arguments:
  send: true
---

# Performance, Logic & Design Pattern Review (Step 21.1)

Use this workflow as a focused sub-review after Step 20 (or as part of Step 21) to evaluate **code performance, logic correctness, and design pattern usage**. It goes deeper than a general review on these three dimensions, producing a targeted improvement plan with concrete refactor suggestions.

> **Companion to:** `/aspec-21-changed-review` — run this workflow when that review flags Performance or Architecture findings, or proactively on any refactor/optimisation task.

## Usage

```text
/aspec-21.1-changed-review-pattern [source] [optional_flags]
```

- **`source`** — (Optional) One of:
  - A task ID (e.g., `P1-T004`) — resolves branch and diffs against `main`
  - A file path ending in `.md` — treated as an `implementation-log.md`
  - A git ref range (e.g., `main..feature/my-branch` or `HEAD~3..HEAD`)
  - `--codemap [path]` — analyse workspace symbol graph instead of a diff
  - Omitted — defaults to `git diff main..HEAD`

- **`optional_flags`**:
  - `--scope <module|layer>` — focus on a specific module or layer (e.g., `--scope services`, `--scope api`, `--scope frontend`)
  - `--depth <quick|standard|deep>` — default is `deep` (this workflow is inherently thorough)
  - `--output <file_path>` — report output path (default: `docs/21.1-pattern-review.md`)
  - `--append` — append to an existing report

**Examples:**

- `/aspec-21.1-changed-review-pattern` — full performance/logic/pattern review of current branch
- `/aspec-21.1-changed-review-pattern P2-T003` — review a specific task
- `/aspec-21.1-changed-review-pattern --codemap src/services` — pattern review of services layer via code map
- `/aspec-21.1-changed-review-pattern HEAD~3..HEAD --scope api --depth deep`

## Input

```text
$ARGUMENTS
```

**Argument parsing:**

1. If `--codemap` is present, use code map mode (Step 1b). Optional value is the directory path to scope.
2. If argument matches a task ID pattern (`P1-T001`), resolve branch from `docs/task-allocation.md` and compute diff.
3. If argument is a file path (contains `/` or ends `.md`), treat as `implementation-log.md`.
4. If argument contains `..`, use as git ref range directly.
5. If no argument, use `git diff main..HEAD`.
6. Parse `--scope`, `--depth`, `--output`, `--append` independently.

**Default context files** (load if present):

- `AGENTS.md`
- `docs/12-architecture-summary.md`
- `docs/13-module-design.md`
- `docs/14-api-design.md`

## Workflow Steps

### 1. Change Source Resolution

#### 1a. Git Diff Mode (default)

- Run `git diff <range> --stat` — summary of changed files.
- Run `git diff <range>` — full diff content.
- Run `git log <range> --oneline` — commit list.
- If diff is empty, report and stop.

#### 1b. Code Map Mode (`--codemap`)

- Load the Windsurf code map for the scoped directory (or full workspace).
- Extract:
  - **Module inventory** — top-level modules, file counts, and language breakdown.
  - **Dependency graph** — inter-module imports; flag circular dependencies and unexpected couplings.
  - **Hotspots** — files with highest fan-in (most depended on) and fan-out (most coupled); these are highest-risk for pattern issues.
  - **Orphans** — files with no inbound or outbound dependencies (dead code candidates).
  - **Public surface** — exported symbols per module; flag over-exposed internals.
- Build review plan from structural findings (no diff required).

#### 1c. Implementation Log Mode

- Read `implementation-log.md`.
- Extract completed task IDs, changed files, known issues, and next steps.
- Resolve git diff range from task IDs if possible.

### 2. File Classification

Classify each changed file into review focus areas:

| Focus Area | File Patterns |
| ---------- | ------------- |
| **Service / Business Logic** | `**/services/**`, `**/use-cases/**`, `**/domain/**` |
| **API / Handler** | `**/controllers/**`, `**/routes/**`, `**/handlers/**`, `**/resolvers/**` |
| **Data Access** | `**/repositories/**`, `**/models/**`, `**/migrations/**`, `**/queries/**` |
| **UI / Component** | `**/components/**`, `**/pages/**`, `**/views/**`, `*.tsx`, `*.vue` |
| **Utility / Shared** | `**/utils/**`, `**/helpers/**`, `**/lib/**` |
| **Configuration** | `**/config/**`, `*.env.*`, feature flag files |

Apply `--scope` filter if provided.

### 3. Review Plan Generation

Build a focused review plan. Each item targets one file or cohesive group.

```text
PATTERN REVIEW PLAN
===================
Source : <git range | codemap path | log path>
Depth  : <quick | standard | deep>
Scope  : <all | specified scope>
Items  : <N>

[RP-001] <Title>
  Files        : <file1>, <file2>
  Focus Area   : <Service | API | Data | UI | Utility>
  Perf Risk    : High | Medium | Low
  Logic Risk   : High | Medium | Low
  Pattern Risk : High | Medium | Low

[RP-002] ...
```

- Default depth for this workflow is `deep`.
- Always create a dedicated `[RP-PERF]` item for any data access files (N+1, query cost).
- Always create a dedicated `[RP-LOGIC]` item for any business logic / service files.
- Present the plan to the user and confirm before executing.

### 4. Review Execution

Execute each review plan item. For each item apply the three review lenses:

#### 4.1 Performance Review

**Backend / General:**

- [ ] No N+1 query patterns — loops that trigger per-item DB calls must be replaced with batch queries or eager loading
- [ ] No synchronous blocking I/O on async paths (e.g., sync file read inside async handler)
- [ ] No unnecessary repeated computation inside loops — hoist invariants outside loop bodies
- [ ] Database query time target met (`<100ms`); flag queries without indexes on filtered/sorted columns
- [ ] API response time target met (`<200ms`); flag slow middleware chains or missing early returns
- [ ] Caching applied for expensive reads that are called frequently with the same inputs
- [ ] Pagination or streaming used for large result sets — no unbounded `findAll()` / `SELECT *`
- [ ] Connection pooling in use; no per-request DB/HTTP client instantiation
- [ ] Memory allocation patterns reviewed — avoid creating large intermediate collections unnecessarily
- [ ] Async/await used correctly — no `await` inside `Array.map()` without `Promise.all()`

**Frontend:**

- [ ] No unnecessary re-renders — components only re-render when their own state/props change
- [ ] Expensive computations wrapped in `useMemo` / `computed` / equivalent
- [ ] Callbacks and handlers stabilised with `useCallback` / equivalent to prevent child re-renders
- [ ] Large components lazy-loaded (`React.lazy`, dynamic imports, route-level code splitting)
- [ ] Images and assets optimised (compressed, correct format, responsive `srcset`)
- [ ] List rendering uses stable, unique keys — not array indices for dynamic lists
- [ ] No layout thrash — DOM reads and writes not interleaved in loops
- [ ] Bundle size impact considered for new dependencies; prefer tree-shakeable libraries

**Data Layer — Query Optimization:**

- [ ] Queries select only needed columns — no `SELECT *` in production code
- [ ] Joins are necessary and indexed; cross-table queries have execution plan reviewed (`EXPLAIN` / `EXPLAIN ANALYZE`)
- [ ] Bulk insert/update used instead of per-record loops where applicable (`INSERT ... VALUES (…),(…)`, `UPDATE … WHERE id IN (…)`)
- [ ] Indexes exist for all columns used in `WHERE`, `ORDER BY`, `GROUP BY`, and `JOIN ON` clauses
- [ ] Composite indexes ordered correctly — most selective / most frequently filtered column first
- [ ] Covering indexes considered for hot read paths — query served entirely from index without heap access
- [ ] Index bloat assessed — unused or redundant indexes identified and flagged for removal (write overhead, storage cost)
- [ ] Transactions scoped correctly — not too broad (locks too long) or too narrow (partial writes possible)
- [ ] Query result sets are paginated or streamed — no unbounded `findAll()` / `OFFSET 0 LIMIT 999999` on large tables
- [ ] Slow query log / `pg_stat_statements` / equivalent checked — no new queries appearing in top-N slow queries after the change
- [ ] ORM-generated queries reviewed — lazy loading not triggered inside loops; eager loading (`include`, `JOIN FETCH`) used where multiple related records are needed
- [ ] Full-text search uses dedicated index (`GIN`, `GiST`, Elasticsearch) — no `LIKE '%keyword%'` on large text columns
- [ ] Aggregation queries (`COUNT`, `SUM`, `GROUP BY`) use indexes or materialised views for large tables; not run inline on every request

**Data Layer — Schema Upgrade Safety:**

- [ ] Migration is **backward compatible** — old application version can still run against the new schema during rolling deploy (no column rename or type change that breaks existing queries)
- [ ] **Expand-contract pattern** followed for breaking changes — new column added first (expand), code deployed to use it, old column removed later (contract) in a separate migration
- [ ] Migration is **reversible** — a `down` migration exists and has been tested; can roll back without data loss
- [ ] **Non-blocking DDL** used on large tables — `ADD COLUMN ... DEFAULT NULL` (not `DEFAULT <value>`) to avoid full table rewrite; index created with `CREATE INDEX CONCURRENTLY` to avoid exclusive lock
- [ ] **Column deletions deferred** — columns are first made nullable / ignored by code before being physically dropped in a later release cycle
- [ ] **Data migrations separated from schema migrations** — large data backfills run as background jobs, not inside the DDL migration script, to avoid long-running locks
- [ ] Migration script is **idempotent** — safe to re-run if it fails partway through (use `IF NOT EXISTS`, `IF EXISTS`, or explicit checks)
- [ ] **Foreign key constraints** added with `NOT VALID` first on existing tables, then validated separately with `VALIDATE CONSTRAINT` to avoid full-table scan lock
- [ ] Sequence / auto-increment range assessed — no risk of `int` overflow for ID columns on high-volume tables; `bigint` / `uuid` used where growth is expected

**Data Layer — Graph Data Structure (apply when code uses a graph DB or in-memory graph):**

- [ ] **Vertex (node) access by ID is O(1)** — vertices looked up via hash map or primary index, not by iterating all vertices; no `findAll().filter(v => v.id === x)` patterns
- [ ] **Edge access is directional and indexed** — outgoing and incoming edges stored and retrieved separately; adjacency list or edge index used per vertex so traversal is `O(degree)` not `O(|E|)`
- [ ] **Graph index used for label/type queries** — queries filtering vertices or edges by label, type, or property use a dedicated graph index (e.g., Neo4j label index, TinkerPop `graph.createIndex()`, or equivalent); no full graph scan for typed lookups
- [ ] **Property indexes defined for frequent filter predicates** — vertex/edge properties used in `WHERE`, `HAS`, or filter steps have a property index; composite property indexes used for multi-property filters
- [ ] **Traversal depth is bounded** — any recursive or iterative graph traversal specifies a maximum depth or hop limit to prevent infinite loops on cyclic graphs and to cap execution time on dense graphs
- [ ] **Cycle detection in place where required** — algorithms operating on graphs that may contain cycles (e.g., dependency graphs, org hierarchies) explicitly detect or handle cycles; no unbounded DFS/BFS on potentially cyclic input
- [ ] **Traversal direction is intentional** — outgoing (`OUT`), incoming (`IN`), or both (`BOTH`) edge directions explicitly specified in every traversal step; implicit bidirectional traversal not used where direction carries semantic meaning
- [ ] **Shortest path / reachability queries use graph-native algorithms** — not emulated with repeated BFS in application code; graph DB built-in `shortestPath`, `allPaths`, or `dijkstra` used where available
- [ ] **Graph mutations are transactional** — adding/removing vertices and edges together (e.g., creating a relationship with both endpoint vertices) wrapped in a single transaction to prevent dangling edges or orphan vertices
- [ ] **Dangling edge prevention enforced** — deleting a vertex also removes or handles all its incident edges; no edges reference non-existent vertices (referential integrity at graph level)
- [ ] **Batch graph writes used for bulk loads** — vertex/edge creation in bulk uses batch import API or `UNWIND` (Cypher) / bulk loader rather than individual per-element transactions
- [ ] **Graph query complexity assessed** — multi-hop traversals (`*1..N`) have their worst-case cost evaluated against graph density; `N` is bounded and justified; unbounded `*` patterns flagged
- [ ] **In-memory graph structures use appropriate representation** — adjacency list preferred over adjacency matrix for sparse graphs; adjacency matrix acceptable only for dense graphs where `O(1)` edge existence check outweighs `O(V²)` space cost
- [ ] **Concurrent graph access protected** — in-memory graph structures shared across goroutines/threads use read/write locks or copy-on-write; graph DB transactions provide isolation for concurrent writers

**Data Layer — Parallel Database Access:**

- [ ] **Connection pool sized correctly** — max pool size set to a safe multiple of DB `max_connections`; per-service pool size documented; total across all replicas does not exceed DB server limit
- [ ] **Parallel queries use separate connections** — concurrent DB calls in a single request (e.g., `Promise.all([db.query(…), db.query(…)])`) each use a connection from the pool, not the same connection object
- [ ] **Read replicas used for read-heavy parallel paths** — reporting queries, analytics, and non-transactional reads routed to read replicas; writes always go to primary
- [ ] **No connection leaks on parallel paths** — connections acquired from the pool are released in `finally` blocks or via connection manager; errors in one parallel branch do not orphan connections from other branches
- [ ] **Parallel writes to the same row serialised** — concurrent `UPDATE` or `INSERT` targeting the same record use optimistic locking, `SELECT FOR UPDATE`, or a queue to prevent lost updates
- [ ] **Batch parallelism bounded** — fan-out to DB across N items in parallel (e.g., `Promise.all(items.map(…))`) is chunked into batches (e.g., 10–50 at a time) to avoid pool exhaustion and DB overload
- [ ] **Cross-shard / cross-database parallelism handled** — queries spanning multiple shards or DB instances run concurrently but results are merged correctly; partial failures handled gracefully (not silently ignored)

#### 4.2 Logic Correctness Review

**Correctness & Invariants:**

- [ ] All conditional branches are explicitly handled — no implicit fall-through or unhandled `else`
- [ ] Null / undefined / empty values handled at every input boundary; no unchecked property access on potentially null objects
- [ ] Off-by-one errors checked in loops, slices, pagination offsets, and date ranges
- [ ] Floating-point arithmetic not used for money or precision-critical values — use integer cents or a decimal library
- [ ] Integer overflow risk assessed for counters, IDs, and aggregations on large datasets
- [ ] Boolean logic reviewed for De Morgan violations and accidental short-circuit side effects
- [ ] Mutable state mutations are intentional and isolated — shared state not mutated across concurrent paths
- [ ] Async race conditions assessed — concurrent requests cannot produce inconsistent state
- [ ] Retry / idempotency logic correct — repeated calls produce the same result; no duplicate records created
- [ ] Error propagation is consistent — errors are either handled locally or re-thrown, never swallowed silently

**Concurrency, Thread Safety & Race Conditions:**

- [ ] **Shared mutable state protected** — any state accessed by multiple goroutines / threads / async tasks is guarded by a mutex, lock, atomic, or channel; no unprotected concurrent reads + writes
- [ ] **No race conditions on counters or accumulators** — increment/decrement operations on shared numeric state use atomic operations or serialised access, not plain read-modify-write
- [ ] **Async race conditions eliminated** — concurrent HTTP handlers, event listeners, or background jobs that share in-process state cannot interleave to produce corrupt state (check for read-modify-write sequences without locking)
- [ ] **No TOCTOU (Time-of-Check-Time-of-Use) vulnerabilities** — the state checked before an action (e.g., "balance > 0") cannot change between the check and the action; use DB-level transactions or optimistic locking
- [ ] **Database-level concurrency handled** — operations that must be atomic use transactions with correct isolation level (`READ COMMITTED`, `SERIALIZABLE`, etc.); no phantom reads or lost updates possible
- [ ] **Optimistic locking / versioning** used for high-contention records (e.g., inventory, wallet balance) — version field or `updated_at` check on UPDATE prevents silent overwrites
- [ ] **Idempotency keys** enforced for any operation that must not be duplicated (payments, order creation, email send) — retried requests produce the same result and no duplicate records
- [ ] **Distributed locks** used where needed for operations spanning multiple service instances (e.g., Redis-based distributed lock for scheduled job leader election)
- [ ] **Event / message ordering** considered — consumers that process events out of order do not corrupt state; events carry sequence numbers or timestamps where ordering matters
- [ ] **Deadlock conditions assessed** — any code acquiring multiple locks acquires them in a consistent global order; no circular lock dependency chains
- [ ] **Read/write lock used where appropriate** — `sync.RWMutex` (Go) / `ReadWriteLock` (Java) / `shared_mutex` (C++) / equivalent used instead of an exclusive mutex when the guarded data is read far more often than written; pure readers acquire a read lock (`RLock`) so they do not block each other
- [ ] **Read lock not upgraded to write lock unsafely** — code never promotes a held read lock to a write lock without first releasing the read lock; unsafe promotion causes deadlock or data races
- [ ] **Write lock scope is minimal** — write locks are held only for the duration of the mutation, not across I/O calls, network requests, or long computations; read-only work before/after the mutation is done outside the write lock
- [ ] **Lock granularity is appropriate** — a single coarse lock protecting a large data structure is split into finer-grained locks (per-shard, per-key, per-row) when profiling shows contention; conversely, many fine-grained locks are not introduced prematurely without measured contention evidence
- [ ] **Lock-free / immutable alternatives considered** — for read-heavy, write-rarely data (e.g., config snapshots, feature flag maps), an atomic pointer swap to a new immutable copy (`sync/atomic.Value`, copy-on-write map) is preferred over a read/write lock to eliminate all blocking on readers
- [ ] **Goroutine / thread lifecycle managed** — spawned goroutines/threads have a clear owner and termination path; no goroutine leaks (channels always closed by sender; contexts respected for cancellation)
- [ ] **Context propagation correct** — `context.Context` (Go) / `AbortController` / cancellation tokens passed through all async call chains; long-running operations check for cancellation at regular intervals
- [ ] **Backpressure handled** — unbounded goroutine/thread spawning inside loops is replaced with worker pools or semaphores to cap concurrency
- [ ] **Frontend concurrent state updates safe** — React `setState` / store dispatch calls that depend on previous state use the functional updater form (`setState(prev => ...)`) to avoid stale closure bugs
- [ ] **Test coverage for concurrency** — concurrent scenarios tested with a race detector (`go test -race`, thread sanitiser, or equivalent); critical paths have stress / load tests validating correctness under concurrency
- [ ] **Lock/transaction duration does not breach performance targets** — any mutex hold time or DB transaction scope is short enough that API response time (`<200ms`) and DB query time (`<100ms`) targets (per `AGENTS.md`) are still met under concurrent load; long-running transactions are split or moved to background jobs
- [ ] **Adapter pattern concurrency overhead within target** — adapters wrapping licensed or external integrations introduce no additional lock contention or blocking; adapter performance overhead stays `<10%` under concurrent usage (per `AGENTS.md` performance targets)
- [ ] **Zero-downtime deploy safety** — concurrent requests in flight during rolling deploy or restart are handled gracefully; no shared in-memory state (e.g., local caches, singleton maps) is lost or corrupted when a new instance starts alongside old instances
- [ ] **TypeScript strict mode async correctness** — `Promise` chains and `async/await` paths use strict typing; unhandled promise rejections are not silently swallowed; `Promise<void>` not used where a return value is expected; floating promises (unawaited calls) flagged
- [ ] **Async error handling on all concurrent paths** — every `async` endpoint, background job, and event handler has a `try/catch` or `.catch()` at the boundary; unhandled rejections do not crash the process or leave resources (DB connections, locks, file handles) unreleased

**Business Rule Alignment:**

- [ ] Logic matches use case specification (from `docs/03-use-case.md`) — main flow, alternate flows, and exception flows all implemented
- [ ] Acceptance criteria from `docs/19-test-plan.md` are verifiably satisfied by the code
- [ ] Domain invariants preserved (e.g., balance never goes negative, state machine transitions are valid)
- [ ] Access control enforced at the service layer, not only at the API boundary

**Type Safety (TypeScript / typed languages):**

- [ ] No `any` types used without justification; `unknown` preferred over `any` for external inputs
- [ ] Type assertions (`as X`) justified and safe — runtime shape matches assumed type
- [ ] Strict null checks satisfied — no non-null assertions (`!`) on values that could legitimately be null
- [ ] Discriminated unions / pattern matching used for exhaustive state handling

#### 4.3 Design Pattern Review

**Structural Patterns:**

- [ ] **Clean Architecture layers respected** — API layer calls Service layer only; Service calls Repository only; no layer-skipping
- [ ] **Dependency Inversion** — high-level modules depend on abstractions (interfaces), not concrete implementations
- [ ] **Interface-First** — all cross-boundary dependencies (external services, licensed libs) accessed via interface + adapter, not directly
- [ ] **Single Responsibility** — each class/module/function has one reason to change; god objects and god functions flagged
- [ ] **Open/Closed** — new behaviour added by extension (new class/strategy), not by modifying existing stable code
- [ ] **Repository Pattern** — data access logic in repository layer; no raw queries in service or API layers
- [ ] **Factory / Builder** used for complex object construction with many optional fields or conditional logic

**Behavioural Patterns:**

- [ ] **Strategy Pattern** used where algorithm selection varies by context — avoid long `if/else` or `switch` chains selecting behaviour
- [ ] **Command Pattern** considered for operations that need undo, retry, or queuing
- [ ] **Observer / Event-Driven** used for decoupled side effects (e.g., send email after order placed) — not inline coupling
- [ ] **Chain of Responsibility** used for middleware/pipeline steps — each step has a single concern

**Creational & Anti-Pattern Detection:**

- [ ] No **Singleton abuse** — singletons only for truly global stateless utilities; never for mutable shared state
- [ ] No **Service Locator** pattern — dependencies injected, not fetched from a global registry
- [ ] No **Anemic Domain Model** — domain objects contain behaviour, not just data fields with external manipulators
- [ ] No **Primitive Obsession** — meaningful domain concepts wrapped in value objects, not passed as raw strings/ints
- [ ] No **Magic Numbers / Strings** — constants named and centralised
- [ ] No **Shotgun Surgery** — a single change should not require edits in many unrelated files; flag if detected

**Frontend-Specific Patterns:**

- [ ] **Container / Presenter split** — data-fetching logic separated from rendering logic
- [ ] **Custom hooks** used to extract and reuse stateful logic; not duplicated across components
- [ ] **Compound Components** or **Render Props** used for flexible UI composition where appropriate
- [ ] **Prop drilling** eliminated beyond 2 levels — Context, store, or composition used instead
- [ ] **Feature-based folder structure** followed — files co-located by feature, not by file type

#### 4.4 Record Findings

For each finding, record:

```text
[FIND-NNN] <Severity>
  Item     : <RP-NNN>
  Lens     : Performance | Logic | Pattern
  File     : <file path>:<line range>
  Finding  : <what was found>
  Evidence : <code snippet or diff line, max 5 lines>
  Suggest  : <recommended fix, refactor, or pattern to apply>
  Effort   : Low | Medium | High
```

Severity levels:

| Severity | Meaning |
| -------- | ------- |
| **Critical** | Logic bug causing data corruption, incorrect state, or security bypass |
| **High** | Significant performance regression or pattern violation that will cause maintainability debt |
| **Medium** | Correctness risk in edge case, sub-optimal pattern, missed optimisation |
| **Low** | Minor inefficiency, style-level pattern improvement |
| **Info** | Observation or suggestion, no action required |

### 5. Refactor Opportunity Summary

After all review items, produce a prioritised refactor backlog:

```text
REFACTOR OPPORTUNITIES
======================
[REF-001] <Title>
  Lens     : Performance | Logic | Pattern
  Files    : <files>
  Effort   : Low | Medium | High
  Impact   : Low | Medium | High
  Priority : (Impact / Effort — High impact + Low effort = do first)
  Action   : <what to refactor and how>
```

- Sort by Priority (High impact / Low effort first).
- Flag any refactors that are **prerequisites** for a planned feature (block on this sprint).
- Flag any refactors safe to defer to tech-debt sprint (Monday cadence).

### 6. Report Generation

**Report file:** `--output` path if specified, otherwise `docs/21.1-pattern-review.md`. If exists and `--append` not set, ask to overwrite.

```markdown
---
classification: Internal
version: 1.0
last_updated: {YYYY-MM-DD}
reviewer: Cascade (Pattern Review Agent)
---

# Performance, Logic & Design Pattern Review

## Review Metadata

| Field | Value |
| ----- | ----- |
| Source | {git range / codemap / log path} |
| Reviewed At | {YYYY-MM-DD HH:MM} |
| Depth | {quick / standard / deep} |
| Scope | {all / specified scope} |
| Files Reviewed | {N} |

---

## Findings by Lens

### Performance Findings

| ID | Severity | File | Finding | Suggest | Effort |
|----|----------|------|---------|---------|--------|
| FIND-001 | High | {file}:{lines} | {description} | {action} | Medium |

### Logic Findings

| ID | Severity | File | Finding | Suggest | Effort |
|----|----------|------|---------|---------|--------|
| ... | ... | ... | ... | ... | ... |

### Pattern Findings

| ID | Severity | File | Finding | Suggest | Effort |
|----|----------|------|---------|---------|--------|
| ... | ... | ... | ... | ... | ... |

---

## Refactor Backlog

| ID | Title | Lens | Effort | Impact | Priority | Sprint |
|----|-------|------|--------|--------|----------|--------|
| REF-001 | {title} | Pattern | Low | High | 🔴 High | Current |
| REF-002 | {title} | Performance | Medium | Medium | 🟡 Medium | Tech-debt |

---

## Review Verdict

| Criterion | Result |
| --------- | ------ |
| Critical findings | {N} |
| High findings | {N} |
| Refactor items (current sprint) | {N} |
| Refactor items (deferred) | {N} |
| **Overall verdict** | ✅ No blockers / ⚠️ Refactors recommended / ❌ Blocking issues found |

---

## Next Steps

{Numbered list of recommended actions, ordered by priority}
```

### 7. Agent Handoff

If **Critical** or **High** findings exist:

- Flag to the Review Agent in `/aspec-21-changed-review` as unresolved items.
- Coordinate via `/agent-01-coordination` using `collab:` if fixes span multiple files or agents.
- Update `docs/task-allocation.md` — set status to `🔴 Pattern Review Required`.

If all findings are **Medium** or below:

- Add **High-priority refactors** to `docs/phase-task-list.md` as `refactor/*` tasks for the current sprint.
- Add **deferred refactors** to tech-debt backlog for Monday sprint cadence.
- Update `docs/task-allocation.md` — set status to `✅ Pattern Review Passed`.

## Output

- Review report at `docs/21.1-pattern-review.md` (or `--output` path).
- Refactor backlog entries added to `docs/phase-task-list.md` for current-sprint items.
- Status update in `docs/task-allocation.md`.

## Next Steps

- **If blocking issues:** fix before merge, then re-run with `--append` to verify.
- **If refactors recommended:** schedule in current or tech-debt sprint before feature grows further.
- **If passed:** proceed to `/aspec-21-changed-review` for full review, or `/aspec-15.1-deployment` if all reviews complete.
