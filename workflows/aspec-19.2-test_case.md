---
description: Generate detailed test cases from test scenarios for QA team execution
arguments:
  send: true
---

# QA Test Case Generator

Use this workflow after completing test scenario generation (Step 19.1). It expands high-level test scenarios into detailed, executable test cases with preconditions, step-by-step instructions, test data, and expected results.

## Template Updates (Table Format)

This workflow generates the test case document in **table format**.

Key structure updates:
- The document includes: `Test Case Summary`, `Test Data Profiles`, per-category test case tables, `Acceptance Criteria Coverage Matrix`, `Scenario-to-Test-Case Traceability`, and `Sign-Off`.
- All category tables use the same 14 columns.
- Use **Severity** (Critical/High/Medium/Low) instead of Priority.

## Global Rules

These rules apply to **all** test case generation steps in this workflow:

1. Every test case **must** trace back to exactly one test scenario ID (`TS-NNN`).
2. One scenario may produce **multiple** test cases (positive, negative, boundary, edge).
3. Test steps must be **atomic** — one user/system action per step.
4. Use **concrete test data** values, not placeholders (e.g., `contract_photo.pdf` not "a valid file").
5. Expected results must be **observable and verifiable** — describe what the tester sees or measures.
6. Apply standard QA test design techniques: Equivalence Partitioning, Boundary Value Analysis, Decision Table, State Transition, Role-Based, Negative Testing, Data Variation.
7. Never duplicate test cases that verify the same condition with the same data class.
8. Every acceptance criterion from the source user stories must be covered by at least one test case.
9. Write all test case content in **plain English** — use simple, everyday vocabulary that non-native speakers can understand while preserving technical accuracy. Avoid jargon, idioms, and complex sentence structures. Prefer short, direct sentences (subject-verb-object). Technical terms (e.g., field names, API endpoints, HTTP status codes) must remain exact; only simplify the surrounding prose.

## Usage

```
/aspec-test_case_ann <spec_folder> [optional_flags]
```

**`spec_folder`** (required) — relative path to the feature spec folder containing the test scenario file and numbered spec documents (e.g., `docs/DC02-ST-020_001_creator-attachment-on-creation`).

**`optional_flags`**:
- `--scenario <TS-ID>` — generate test cases for a single scenario only (e.g., `--scenario TS-005`).
- `--category <name>` — generate test cases for one category only (e.g., `--category validation`).
- `--severity <level>` — filter output to a minimum severity (e.g., `--severity critical`).
- `--append` — append new test cases to an existing output file instead of overwriting.

**Examples:**
- `/aspec-test_case_ann2 docs/DC02-ST-020_001_creator-attachment-on-creation` — full test case generation
- `/aspec-test_case_ann2 docs/DC02-ST-020_001_creator-attachment-on-creation --category security` — security test cases only
- `/aspec-test_case_ann2 docs/DC02-ST-020_001_creator-attachment-on-creation --scenario TS-015` — test cases for one scenario

## Input

```text
$ARGUMENTS
```

**Argument parsing:**
1. First non-flag argument is the **spec folder path**.
2. `--scenario` filters output to test cases derived from a specific scenario ID.
3. `--category` filters output to one scenario category (happy_path, validation, failure, system_integration, security, data).
4. `--severity` filters output to test cases at or above the specified severity level.
5. `--append` preserves existing test cases and adds new ones with sequential IDs.

**Required input documents** (must exist in the spec folder):
- `19.1-test-scenario.md` or `19.1.1-test-scenario-ann.md` — test scenarios (primary input)
- `02-user-story.md` — user stories with acceptance criteria
- `03-use-case.md` — use case flows (main, alternate, exception)
- `05-data-structure.md` — schemas, validation rules, enums, limits

**Enrichment documents** (read if present):
- `01-project_specification.md` — business rules and constraints
- `04-data-model.md` — entity relationships
- `06-actor-list.md` — actors and roles
- `07-function-list.md` — system functions
- `08-action-function-table.md` — actor-action-function mapping
- `09-access-control.md` — RBAC, permissions, tenant isolation
- `10-object-lifecycle.md` — state machines and transitions
- `14-api-design.md` — API endpoints and contracts
- `16-ux-wireframes.md` — UI screens and flows

## Workflow Steps

### 1. Input Ingestion & Validation

- Verify the spec folder exists and contains the test scenario file (`19.1-test-scenario.md`).
- Read the test scenario file and parse all scenario tables by category.
- Read all required documents. Read enrichment documents if present.
- Extract:
  - **Test scenarios** — ID, use case ID, title, description, category
  - **Acceptance criteria** — from `02-user-story.md`
  - **Use case flows** — main, alternate, exception from `03-use-case.md`
  - **Data constraints** — field types, lengths, enums, min/max, required flags from `05-data-structure.md`
  - **Access control rules** — roles, permissions, tenant isolation from `09-access-control.md` (if present)
- If the test scenario file is missing, abort with an error message.
- If any required enrichment document is missing, list the missing files and ask the user whether to proceed with partial coverage.

### 2. Scenario-to-Test-Case Expansion

For each test scenario, generate one or more test cases using the following expansion rules:

#### 2.1 Happy Path Scenarios → Test Cases
- **One primary positive test case** per scenario using valid representative data.
- **One variation test case** if the scenario involves multiple valid input classes (Equivalence Partitioning).

#### 2.2 Validation Scenarios → Test Cases
- **One positive boundary test case** at the valid edge (e.g., exactly `max_files`).
- **One negative boundary test case** just beyond the valid edge (e.g., `max_files + 1`).
- **One invalid-type test case** if the scenario involves type/format validation.
- Apply Boundary Value Analysis for numeric constraints.

#### 2.3 Failure Scenarios → Test Cases
- **One test case per failure trigger** (network, timeout, service outage, etc.).
- **One recovery test case** verifying the system returns to a valid state after the failure.

#### 2.4 System/Integration Scenarios → Test Cases
- **One test case per integration point** (API call, event, data sync).
- Include request/response verification where applicable.

#### 2.5 Security Scenarios → Test Cases
- **One unauthorized access test case** per role boundary.
- **One session/token test case** per authentication flow.
- **One injection/spoofing test case** if applicable.

#### 2.6 Data Scenarios → Test Cases
- **One persistence verification test case** per data entity.
- **One audit trail test case** per auditable action.
- **One tenant isolation test case** per cross-tenant boundary.

### 3. Test Case ID Assignment

- IDs follow the pattern `TC-{scenario_id_number}-{sequential_number}` (e.g., `TC-001-01`, `TC-001-02`).
- The first segment matches the source scenario number; the second is sequential within that scenario.
- If `--append` flag is set, read existing output file and continue numbering from the last ID per scenario.

### 4. Severity Assignment

Severity means **how bad the impact is if this test fails in production** (business impact, user impact, security/data impact). It is not about how hard the test is to run.

Assign severity based on these rules:

| Severity | Covers | If this test fails … |
|----------|--------|----------------------|
| **Critical** | Core business flows, data integrity, authentication, authorization | System is unusable or data is corrupted |
| **High** | Validation rules, error handling, integration points | A major feature does not work correctly |
| **Medium** | Edge cases, UI behavior, non-critical data | System still works but some areas behave incorrectly |
| **Low** | Cosmetic behavior, optional features, informational logging | Minimal or no impact to end users |

### 5. Test Data Specification

For each test case, define concrete test data:
- **Valid data set** — realistic values within all constraints.
- **Invalid data set** — values that trigger the expected failure (for negative test cases).
- Reference field constraints from `05-data-structure.md` (type, length, enum, range).
- Use named test data profiles where multiple test cases share the same data setup.

### 6. Deduplication & Coverage Analysis

- Remove duplicate test cases that verify the same condition with the same data class.
- Cross-check: every test scenario must have at least one test case.
- Cross-check: every acceptance criterion from `02-user-story.md` must be covered.
- Flag any gaps and ask the user whether to generate additional test cases.

### 7. Output Generation

- Write to `{spec_folder}/19.2-test-cases.md`.
- If the file exists and `--append` is not set, ask the user whether to overwrite.

### 8. Review & Confirmation

- Present a summary: total test case count per category, scenario coverage percentage, acceptance criteria coverage, and any flagged gaps.
- If `--category`, `--scenario`, or `--severity` was used, note which areas were excluded.

## Output Format

The output file must follow this structure. All test cases are rendered as **table rows** (one row per test case), grouped by category. Use `<br>` for line breaks within cells.

```markdown
---
classification: Internal
version: 1.0
last_updated: {YYYY-MM-DD}
owner: QA Engineering Team
---

# Test Cases – {Feature Name}

## Changelog
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| {date} | 1.0 | Initial test cases generated from test scenarios 19.1 | QA Engineer |

---

## Test Case Summary

| Category | Scenario Count | Test Case Count |
|----------|---------------|-----------------|
| Happy Path | {n} | {n} |
| Validation | {n} | {n} |
| Failure | {n} | {n} |
| System/Integration | {n} | {n} |
| Security | {n} | {n} |
| Data | {n} | {n} |
| **Total** | **{N}** | **{M}** |

---

## Test Data Profiles

Use **Test Data Profiles (TDP-##)** to define reusable, concrete data setups that appear in many test cases.

Rules:
- Each TDP must be **specific** and **reusable** (avoid vague text like "valid data").
- Use TDP references in:
  - **Prerequisite** for required system state (session, role, existing records, external services).
  - **Test Data** for the concrete inputs used (files, payload fields, headers, limits).
- Prefer short key-value pairs so testers can copy them into tools (browser, Postman, API client).

Common TDP types:
- Session/user context (role, permissions, tenant/domain, session state)
- Files (name, MIME type, size, extension, magic bytes)
- Policy/config values (min/max, allowed types, visibility)
- API payloads/headers (request body fields, `Idempotency-Key`, correlation IDs)

| Profile ID | Description | Key Values |
|------------|-------------|------------|
| TDP-01 | Valid admin session | Role: workflow_admin, Permission: workflow.edit, Session: active |
| TDP-02 | Valid creator session | Role: contract_creator, Session: active |
| TDP-03 | Valid PDF file | Type: application/pdf, Size: 2 MB, Name: contract_photo.pdf |
| ... | ... | ... |

---

## Happy Path Test Cases

Covers: TS-001, TS-002, ...

| Test Case ID | Test Technique Type | Test Type | Severity | Automation | Basic Case | Test Case Title | Test Description | Prerequisite | Test Steps | Test Data | Expected Result | Test Result | Ref. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-001-01 | {Technique} | Positive | Critical | SA | Yes | {Title} | {Description of what is verified} | {Preconditions, separated by <br>} | 1. {Action} → {Expected}<br>2. {Action} → {Expected}<br>3. ... | {Concrete test data values} | {Final observable result} | | TS-001, UC-XXX, US-XXX |
| TC-001-02 | {Technique} | Positive | High | SA | No | {Title} | {Description} | {Preconditions} | 1. ...<br>2. ... | {Data} | {Result} | | TS-001, UC-XXX |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## Validation Test Cases

Covers: TS-017, TS-018, ...

| Test Case ID | Test Technique Type | Test Type | Severity | Automation | Basic Case | Test Case Title | Test Description | Prerequisite | Test Steps | Test Data | Expected Result | Test Result | Ref. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| {rows follow same column structure} |

---

## Failure Test Cases

Covers: TS-033, TS-034, ...

| Test Case ID | Test Technique Type | Test Type | Severity | Automation | Basic Case | Test Case Title | Test Description | Prerequisite | Test Steps | Test Data | Expected Result | Test Result | Ref. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| {rows follow same column structure} |

---

## System/Integration Test Cases

Covers: TS-047, TS-048, ...

| Test Case ID | Test Technique Type | Test Type | Severity | Automation | Basic Case | Test Case Title | Test Description | Prerequisite | Test Steps | Test Data | Expected Result | Test Result | Ref. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| {rows follow same column structure} |

---

## Security Test Cases

Covers: TS-059, TS-060, ...

| Test Case ID | Test Technique Type | Test Type | Severity | Automation | Basic Case | Test Case Title | Test Description | Prerequisite | Test Steps | Test Data | Expected Result | Test Result | Ref. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| {rows follow same column structure} |

---

## Data Test Cases

Covers: TS-071, TS-072, ...

| Test Case ID | Test Technique Type | Test Type | Severity | Automation | Basic Case | Test Case Title | Test Description | Prerequisite | Test Steps | Test Data | Expected Result | Test Result | Ref. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| {rows follow same column structure} |

---

## Acceptance Criteria Coverage Matrix

| User Story | Acceptance Criterion | Test Case ID(s) | Coverage Type |
|------------|---------------------|------------------|---------------|
| US-XXX-01 | AC-01: {description} | TC-001-01, TC-011-01 | Happy Path, Validation |
| US-XXX-01 | AC-02: {description} | TC-005-01 | Happy Path |
| ... | ... | ... | ... |

---

## Scenario-to-Test-Case Traceability

| Test Scenario ID | Category | Test Case IDs | Test Case Count |
|------------------|----------|---------------|-----------------|
| TS-001 | Happy Path | TC-001-01, TC-001-02 | 2 |
| TS-002 | Happy Path | TC-002-01 | 1 |
| ... | ... | ... | ... |

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | _______________ | _______________ | _______________ |
| PM | _______________ | _______________ | _______________ |
| PO | _______________ | _______________ | _______________ |

---

Prepared by QA Engineer for the Product Development Team.
```

### Table Column Definitions

Each category table uses the same 14 columns:

| Column | Description |
|--------|-------------|
| **Test Case ID** | `TC-{scenario_number}-{seq}` — zero-padded 3 digits for scenario, 2 digits for sequence |
| **Test Technique Type** | QA technique used: Equivalence Partitioning, Boundary Value Analysis, Decision Table, State Transition, Pairwise Testing, Negative Testing, Role-Based |
| **Test Type** | One of `Positive`, `Negative`, `Boundary`, `Edge`, `Security`, `Integration` |
| **Severity** | How bad the impact is if the test fails in production. One of `Critical`, `High`, `Medium`, `Low` |
| **Automation** | `A` (fully automatable), `SA` (semi-automatable), `M` (manual only) |
| **Basic Case** | `Yes` if the baseline, most representative success path for the scenario (shortest path, standard valid data). Only one test case per scenario should be `Yes`; all variations (alternate success, edge, boundary, negative) are `No`. |
| **Test Case Title** | Short descriptive title |
| **Test Description** | What is being verified — one or two sentences |
| **Prerequisite** | Required system state before execution; use `<br>` for multiple conditions |
| **Test Steps** | Numbered steps with action → expected result per step; use `<br>` between steps |
| **Test Data** | Concrete test data values or TDP reference; use `<br>` for multiple values |
| **Expected Result** | Final observable and verifiable outcome after all steps |
| **Test Result** | Left blank — tester fills in Pass/Fail after execution |
| **Ref.** | Source scenario ID (TS-NNN), Use Case ID, User Story ID — comma-separated |

### Cell Formatting Rules

- Use `<br>` for line breaks within table cells (not newlines).
- Test Steps format: `1. {Action} → {Expected}<br>2. {Action} → {Expected}` — each step is numbered with action and expected result separated by `→`.
- Prerequisite format: `{Condition 1}<br>{Condition 2}` — each condition on a separate line.
- Test Data format: `{Key}: {Value}<br>{Key}: {Value}` or reference a TDP profile (e.g., `TDP-01, TDP-02`).
- Keep cell content concise — aim for under 200 characters per cell where possible.
- Use concrete test data values, not placeholders.

## Next Steps

After test case generation:
1. **Execute test cases** — QA team uses the generated document for manual test execution, filling in the Execution Record for each test case.
2. **Generate manual E2E scripts** — use `/aspec-e2e-manual-test` to produce per-user-story execution scripts from these test cases.
3. **Generate automated tests** — use test cases tagged `Automation: A` as input for Playwright/Jest/k6 test scripts.
4. **Track results** — aggregate pass/fail results into the Test Summary and Sign-Off sections.
