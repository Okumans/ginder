---
description: Generate test scenarios from user stories and use cases for QA
arguments:
  send: true
---

# QA Test Scenario Generator

Use this workflow to generate structured test scenarios for QA from project specification documents. Scenarios are high-level descriptions of *what* to test (not step-by-step scripts). They feed into downstream test case and manual test script generation.

## Definition

A **test scenario** is a short, high-level description of a situation to verify.

It explains:
- The **context** (who/what/when, such as role, system state, inputs)
- The **behavior to check** (what the system should allow, block, or enforce)
- The **expected result** (at a high level, such as a status change, user message, or permission outcome)

A test scenario is **not** a test case. It does **not** include detailed steps, concrete test data, or step-by-step expected results.

## Global Rules

These rules apply to **all** scenario generation steps in this workflow:

1. Derive scenarios strictly from the User Story and its intent.
2. Focus on **WHAT** to test, not **HOW** to test.
3. Do **NOT** write test cases, steps, or expected results.
4. Cover Happy Path, Negative, Edge, and System/Integration scenarios.
5. Think through realistic, real-world situations that are likely to occur in production.
6. Identify multiple meaningful scenarios per flow where applicable.
7. Avoid duplicate or overlapping scenarios.
8. Use clear, testable, and unambiguous wording.
9. Write all scenario content in **plain English** — use simple, everyday vocabulary that non-native speakers can understand while preserving technical accuracy. Avoid jargon, idioms, and complex sentence structures. Prefer short, direct sentences (subject-verb-object). Technical terms (e.g., field names, API endpoints, HTTP status codes) must remain exact; only simplify the surrounding prose.

## Usage

```
/aspec-e2e-ann <spec_folder> [optional_flags]
```

**`spec_folder`** (required) — relative path to the feature spec folder containing numbered documents (e.g., `docs/DC02-ST-020_001_creator-attachment-on-creation`).

**`optional_flags`**:
- `--category <name>` — generate scenarios for a single category only (e.g., `--category security`).
- `--use-case <UC-ID>` — limit scenarios to a specific use case (e.g., `--use-case UC-CR-01`).
- `--append` — append new scenarios to an existing `19.1-test-scenario.md` instead of overwriting.

**Examples:**
- `/aspec-e2e-ann docs/DC02-ST-020_001_creator-attachment-on-creation` — full scenario generation
- `/aspec-e2e-ann docs/DC02-ST-020_001_creator-attachment-on-creation --category security` — security scenarios only
- `/aspec-e2e-ann docs/DC02-ST-020_001_creator-attachment-on-creation --use-case UC-AUTH-01` — scenarios for one use case

## Input

```text
$ARGUMENTS
```

**Argument parsing:**
1. First non-flag argument is the **spec folder path**.
2. `--category` filters output to one scenario category.
3. `--use-case` filters output to scenarios mapped to a specific use case ID.
4. `--append` preserves existing scenarios and adds new ones with sequential IDs.

**Required spec documents** (must exist in the spec folder):
- `01-project_specification.md` — project goals, scope, business rules
- `02-user-story.md` — user stories with acceptance criteria
- `03-use-case.md` — use case flows (main, alternate, exception)
- `04-data-model.md` — entity relationships
- `05-data-structure.md` — schemas, validation rules, enums, limits
- `06-actor-list.md` — actors and roles
- `07-function-list.md` — system functions
- `08-action-function-table.md` — actor-action-function mapping
- `09-access-control.md` — RBAC, permissions, tenant isolation

**Optional enrichment documents:**
- `10-object-lifecycle.md` — state machines and transitions
- `11-persistence-design.md` — storage strategy
- `12-architecture-summary.md` — system architecture
- `13-module-design.md` — module interfaces
- `14-api-design.md` — API endpoints and contracts
- `16-ux-wireframes.md` — UI screens and flows

## Workflow Steps

### 1. Spec Ingestion & Validation
- Verify the spec folder exists and contains the 9 required documents.
- Read all required documents. Read optional documents if present.
- Extract:
  - **Business rules** — prefixed with `BR-*`, scope, constraints, NFRs (from `01-project_specification.md`)
  - **User stories** with acceptance criteria (from `02-user-story.md`)
  - **Use cases** with main/alternate/exception flows (from `03-use-case.md`)
  - **Entity relationships** — keys, cardinality, business rules per entity (from `04-data-model.md`)
  - **Data validation rules** — field lengths, enums, min/max, required flags, schemas (from `05-data-structure.md`)
  - **Actors & roles** — human and system actors, goals, actor-use-case matrix (from `06-actor-list.md`)
  - **System functions** — function catalog, inputs/outputs, dependencies (from `07-function-list.md`)
  - **Action-function mapping** — user actions → system functions, action sequences, error actions (from `08-action-function-table.md`)
  - **Access control matrix** — roles, permissions, tenant rules, security constraints (from `09-access-control.md`)
  - **State transitions** (from `10-object-lifecycle.md` if present)

- If any required document is missing, list the missing files and ask the user whether to proceed with partial coverage or abort.

### 2. Use Case Mapping
- Build a mapping of Use Case ID → related User Stories → Acceptance Criteria.
- Identify all actors involved per use case from `06-actor-list.md`.
- Map functions from `07-function-list.md` and `08-action-function-table.md` to each use case.
- This mapping drives traceability in the output.

### 3. Scenario Design by Category

Generate scenarios across **6 categories** using standard QA test design techniques:

#### 3.1 Happy Path Scenarios
- One scenario per use case main flow success path.
- One scenario per acceptance criterion that describes a positive outcome.
- **Techniques**: Equivalence Partitioning, Decision Table.

#### 3.2 Validation Scenarios
- Derive from `05-data-structure.md` field constraints (type, length, format, enum, range).
- Derive from business rules (`BR-*`) that enforce data integrity.
- **Techniques**: Boundary Value Analysis, Equivalence Partitioning, Negative Testing.

#### 3.3 Failure Scenarios
- Derive from use case exception flows.
- Cover: network failures, service outages, timeouts, retry exhaustion, concurrent edits.
- **Techniques**: State Transition Testing, Error Guessing.

#### 3.4 System/Integration Scenarios
- Derive from `12-architecture-summary.md` and `13-module-design.md` interfaces.
- Cover: API contract compliance, cross-service data flow, event propagation, snapshot consistency.
- **Techniques**: Pairwise Testing, Interface Testing.

#### 3.5 Security Scenarios
- Derive from `09-access-control.md` role matrix and permission rules.
- Cover: unauthorized access (HTTP 403), session expiry, CSRF, MIME spoofing, tenant isolation, IP restrictions.
- **Techniques**: Role-Based Testing, Decision Table, Negative Testing.

#### 3.6 Data Scenarios
- Derive from `04-data-model.md` entities and `05-data-structure.md` schemas.
- Cover: persistence correctness, audit trail completeness, tenant isolation at data layer, state machine transitions.
- **Techniques**: State Transition Testing, Data Variation Testing.

### 4. Scenario ID Assignment
- IDs follow the pattern `TS-{sequential_number}` starting from `TS-001`.
- If `--append` flag is set, read existing `19.1-test-scenario.md` and continue numbering from the last ID.
- Each scenario must have a unique ID.

### 5. Deduplication & Gap Analysis
- Remove duplicate scenarios that test the same condition from different source documents.
- Cross-check: every acceptance criterion from `02-user-story.md` must be covered by at least one scenario.
- Cross-check: every use case exception flow from `03-use-case.md` must have a corresponding failure or security scenario.
- Flag any gaps and ask the user whether to generate additional scenarios.

### 6. Output Generation
- Write to `{spec_folder}/19.1-test-scenario.md`.
- If the file exists and `--append` is not set, ask the user whether to overwrite.

### 7. Review & Confirmation
- Present a summary: total scenario count per category, use case coverage percentage, and any flagged gaps.
- If `--category` or `--use-case` was used, note which areas were excluded.

## Output Format

The output file must follow this structure:

```markdown
---
classification: Internal
version: 1.0
last_updated: {DD-MM-YYYY}
owner: QA Engineering Team
---

# Test Scenarios – {Feature Name}

## Changelog
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| {date} | 1.0 | Initial test scenarios derived from spec documents 01–09 | Lead QA Engineer |

---

## Test Scenario Summary

| Category | Count |
|----------|-------|
| Happy Path | {n} |
| Validation | {n} |
| Failure | {n} |
| System/Integration | {n} |
| Security | {n} |
| Data | {n} |
| **Total** | **{N}** |

---

## Use Case Coverage Mapping

| Use Case | Related User Stories | Primary Actors / Systems | Key Functions |
|----------|---------------------|--------------------------|---------------|
| UC-XXX-01 – {Use case name} | US-XXX-01, US-YYY-01 | A-XXX {Actor}; S-XXX {System} | F-XXX, F-YYY |

---

## Basic Test Scenarios (Smoke)

Basic scenarios are a **baseline subset** used for quick smoke/regression checks.

Selection rules:
- Pick the **most representative** flows that indicate the feature is working end-to-end.
- Prefer the **shortest success path** with **standard valid data**.
- Include only a small number of **high-signal negative** checks that catch common production failures.
- Avoid duplicates; this is a subset of the full `TS-###` set.

### Basic Scenarios by Category

| Category | Included Scenario IDs | Rationale |
|----------|------------------------|-----------|
| Happy Path | TS-001<br>TS-002 | {Why these are the baseline happy-path checks} |
| Validation | TS-010<br>TS-011 | {Why these are the baseline validation checks} |
| Failure | TS-020 | {Why these are the baseline failure checks} |
| System/Integration | (none) | {Leave as (none) if no scenarios are marked `Basic=Yes`} |
| Security | TS-030 | {Why these are the baseline security checks} |
| Data | (none) | {Leave as (none) if no scenarios are marked `Basic=Yes`} |

---

## Happy Path Scenarios

| ID | Use Case ID | Basic | Scenario Title | Scenario Description |
|----|-------------|-------|----------------|---------------------|
| TS-001 | UC-XXX-01 | Yes | {Short title} | {Description referencing source docs} |

---

## Validation Scenarios

| ID | Use Case ID | Basic | Scenario Title | Scenario Description |
|----|-------------|-------|----------------|---------------------|
| ... | ... | ... | ... | ... |

---

## Failure Scenarios
{same table format (includes `Basic` column)}

---

## System/Integration Scenarios
{same table format (includes `Basic` column)}

---

## Security Scenarios
{same table format (includes `Basic` column)}

---

## Data Scenarios
{same table format (includes `Basic` column)}

---

## Traceability Matrix

| Test Scenario ID | Related Use Case(s) | Related User Story / Spec Source |
|------------------|---------------------|----------------------------------|
| TS-001 – TS-00N | UC-XXX-01, UC-YYY-01 | US-XXX-01, 01-project_spec, 03-use-case |

---

## Acceptance Criteria Coverage

| User Story | Acceptance Criterion | Covered by Scenario(s) |
|------------|---------------------|------------------------|
| US-XXX-01 | AC: {Acceptance criterion text} | TS-001, TS-010 |

---

Prepared by Lead QA Engineer for the Product Development Team.

### Scenario Table Column Rules

- **ID**: `TS-{NNN}` sequential, zero-padded to 3 digits.
- **Use Case ID**: Primary use case from `03-use-case.md`. If a scenario spans multiple use cases, list all (comma-separated).
- **Basic**: `Yes` if the scenario is part of the smoke/regression baseline subset, otherwise `No`.
- **Scenario Title**: Concise imperative phrase (e.g., "Reject duplicate policy names in workflow configuration").
- **Scenario Description**: 1–2 sentences explaining *what* is validated and *why*, with parenthetical references to source documents (e.g., `(Docs 02,03,05,07)`).

## Next Steps

After scenario generation:
1. **Generate test cases** — use the test scenarios as input to produce detailed test cases with test data, steps, and expected results (output: `19.2-test case.md`).
2. **Generate manual test scripts** — use `/aspec-e2e-manual-test` to produce step-by-step QA execution scripts per user story.
3. **Generate automated tests** — use scenarios tagged with Automation=A as input for test automation scripts.
