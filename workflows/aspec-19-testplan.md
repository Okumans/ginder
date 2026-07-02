---
description: Generate comprehensive Test Plan from all spec documents (Steps 1-18)
arguments:
  send: true
---

# Test Plan Generator

Use this workflow after completing Step 18 (Phase Task List and Dependencies). It consolidates all specification artifacts into a comprehensive test plan document that defines testing strategy, scope, resources, schedule, and traceability for the entire feature or project.

## Definition

A **Test Plan** is a formal document that describes the scope, approach, resources, and schedule of testing activities.

It explains:
- **What** will be tested (scope, features, in-scope/out-of-scope)
- **How** it will be tested (strategy, levels, techniques, tools)
- **Who** will test it (roles, responsibilities, team structure)
- **When** it will be tested (schedule, milestones, regression triggers)
- **What resources** are needed (environments, data, tools, infrastructure)

A Test Plan is **not** a test case document. It does **not** include detailed test steps, test data, or step-by-step expected results. It references downstream test scenarios (19.1), test cases (19.2), and automated test artifacts (19.3, 19.4).

## Global Rules

These rules apply to **all** test plan generation steps in this workflow:

1. Derive the test scope strictly from the Project Specification (01) and Project Scope Plan (17).
2. Align test strategy with the architecture, module design, and API contracts.
3. Reference existing test artifacts (19.1, 19.2, 19.3, 19.4) rather than duplicating them.
4. Define clear entry/exit/suspension/resumption criteria for each testing level and phase.
5. Specify test environment requirements (hardware, software, data, network, security).
6. Map test activities to the Phase Task List (18) schedule and milestones.
7. Include risk analysis with mitigation strategies for testing activities.
8. Ensure traceability from test scope items back to requirements, use cases, and user stories.
9. Document all assumptions, external dependencies, and constraints that affect the test plan.
10. Define test metrics (KPIs) and reporting schedule; include release readiness threshold.
11. Distinguish **severity** (system impact) from **priority** (business urgency) in defect management.
12. Write all test plan content in **plain English** — use simple, everyday vocabulary that non-native speakers can understand while preserving technical accuracy. Avoid jargon, idioms, and complex sentence structures. Prefer short, direct sentences (subject-verb-object). Technical terms (e.g., API endpoints, environment names, tool names) must remain exact; only simplify the surrounding prose.

## Usage

```
/aspec-19-testplan <spec_folder> [optional_flags]
```

**`spec_folder`** (required) — relative path to the feature spec folder containing numbered documents (e.g., `docs/DC02-ST-020_001_creator-attachment-on-creation`).

**`optional_flags`**:
- `--phase <phase_id>` — generate test plan for a single phase only (e.g., `--phase P1`).
- `--level <level>` — generate test plan for one testing level only (e.g., `--level e2e`, `--level performance`).
- `--append` — append new sections to an existing `19-test-plan.md` instead of overwriting.

**Examples:**
- `/aspec-19-testplan docs/DC02-ST-020_001_creator-attachment-on-creation` — full test plan generation
- `/aspec-19-testplan docs/DC02-ST-020_001_creator-attachment-on-creation --phase P1` — test plan for Phase 1 only
- `/aspec-19-testplan docs/DC02-ST-020_001_creator-attachment-on-creation --level security` — security testing plan only

## Input

```text
$ARGUMENTS
```

**Argument parsing:**
1. First non-flag argument is the **spec folder path**.
2. `--phase` filters output to test activities for a specific phase.
3. `--level` filters output to a single testing level (unit, integration, e2e, performance, security).
4. `--append` preserves existing sections and adds new ones.

**Required spec documents** (must exist in the spec folder):
- `01-project_specification.md` — project goals, scope, business rules, NFRs
- `02-user-story.md` — user stories with acceptance criteria
- `03-use-case.md` — use case flows (main, alternate, exception)
- `06-actor-list.md` — actors and roles
- `09-access-control.md` — RBAC, permissions, tenant isolation
- `17-project-scope-and-phases.md` — phase breakdown, milestones, deliverables
- `18-phase-task-list.md` — task dependencies, schedule, resource allocation

**Optional enrichment documents:**
- `04-data-model.md` — entity relationships (for data integrity test scope)
- `05-data-structure.md` — schemas, validation rules (for validation test scope)
- `07-function-list.md` — system functions (for function coverage)
- `08-action-function-table.md` — actor-action-function mapping
- `10-object-lifecycle.md` — state machines (for state transition test scope)
- `12-architecture-summary.md` — system architecture (for integration test scope)
- `13-module-design.md` — module interfaces (for unit/integration test scope)
- `14-api-design.md` — API endpoints (for API test scope)
- `19.1-test-scenario.md` — existing test scenarios (reference, do not duplicate)
- `19.2-test-cases.md` — existing test cases (reference, do not duplicate)

## Workflow Steps

### 1. Spec Ingestion & Validation
- Verify the spec folder exists and contains the 7 required documents.
- Read all required documents. Read optional documents if present.
- Extract:
  - **Project scope** — features, in-scope/out-of-scope, constraints, NFRs (from `01-project_specification.md`)
  - **User stories** with acceptance criteria (from `02-user-story.md`)
  - **Use cases** with main/alternate/exception flows (from `03-use-case.md`)
  - **Actors & roles** — human and system actors (from `06-actor-list.md`)
  - **Access control matrix** — roles, permissions (from `09-access-control.md`)
  - **Phase breakdown** — phases, milestones, deliverables (from `17-project-scope-and-phases.md`)
  - **Task schedule** — task dependencies, timeline, resources (from `18-phase-task-list.md`)
  - **Test artifacts** — existing scenarios and test cases (from `19.1`, `19.2` if present)
- If any required document is missing, list the missing files and ask the user whether to proceed with partial coverage or abort.

### 2. Test Scope Definition
- Define **in-scope** features and functionalities based on Project Specification (01) and Phase Plan (17).
- Define **out-of-scope** items explicitly (features not tested, known limitations).
- Map scope items to:
  - Use Cases (from `03-use-case.md`)
  - User Stories (from `02-user-story.md`)
  - API endpoints (from `14-api-design.md` if present)
- Identify **testing levels** required:
  - Unit Testing
  - Integration Testing
  - System/E2E Testing
  - Performance Testing
  - Security Testing
  - Accessibility Testing (if applicable)

### 3. Test Strategy Design

Define the testing approach for each level:

#### 3.1 Unit Testing Strategy
- Scope: individual functions, modules, classes
- Tools: Jest, Mocha, Pytest, etc.
- Coverage target: minimum percentage
- Responsibility: developers

#### 3.2 Integration Testing Strategy
- Scope: inter-module communication, API contracts, database interactions
- Tools: Jest, Supertest, Postman Newman
- Coverage target: API endpoint coverage
- Responsibility: developers + QA

#### 3.3 System/E2E Testing Strategy
- Scope: end-to-end user flows, UI interactions
- Tools: Robot Framework (SeleniumLibrary or Browser library)
- Coverage target: use case coverage
- Responsibility: QA

#### 3.4 Performance Testing Strategy
- Scope: load testing, stress testing, endurance testing
- Tools: k6, JMeter, Locust
- Thresholds: response time, throughput, error rate
- Responsibility: QA + DevOps

#### 3.5 Security Testing Strategy
- Scope: authentication, authorization, input validation, OWASP Top 10
- Tools: OWASP ZAP, Burp Suite, SonarQube
- Coverage target: role boundary coverage
- Responsibility: Security team + QA

### 4. Test Environment Planning
- Define required environments:
  - Development (DEV)
  - Testing/QA (QA)
  - Staging/Pre-production (STG)
  - Production (PROD) — for monitoring only
- Specify environment requirements:
  - Hardware: servers, storage, network
  - Software: OS, databases, middleware, browsers
  - Data: test data sets, seed data, PII masking
  - Security: credentials, certificates, VPN access
  - Integrations: external services, mock servers

### 5. Test Resource Planning
- Define team structure:
  - QA Lead
  - QA Engineers
  - Automation Engineers
  - Performance Engineers
  - Security Testers
- Assign responsibilities per testing level.
- Estimate effort (person-hours) per phase and per testing level.
- List tools required with license type only (no cost details).

### 6. Test Schedule & Milestones
- Align test activities with Phase Task List (18):
  - Phase start/end dates
  - Test design milestones
  - Test execution milestones
  - Regression test triggers
- Define **entry criteria** for each test phase:
  - Code complete
  - Environment ready
  - Test data prepared
  - Test cases reviewed
- Define **exit criteria** for each test phase:
  - All test cases executed
  - Defects resolved or deferred
  - Coverage targets met
  - Sign-off obtained
- Define **suspension criteria** — conditions that stop testing (e.g., critical blocker defect, environment down).
- Define **resumption criteria** — conditions required before testing can restart (e.g., blocker fixed and deployed, environment stable).

### 7. Risk Analysis
- Identify testing risks:
  - Resource availability
  - Environment instability
  - Test data quality
  - Schedule constraints
  - Tool limitations
- Assign risk level (High/Medium/Low).
- Define mitigation strategies for each risk.

### 8. Defect Management
- Define defect lifecycle:
  - New → Open → In Progress → Fixed → Verified → Closed
  - Rejected → Deferred → Duplicate
- Define **severity** levels (impact on system):
  - Critical: system unusable, data loss
  - High: major feature broken
  - Medium: feature partially broken
  - Low: cosmetic, minor issue
- Define **priority** levels (urgency of fix, business-driven):
  - P1: fix immediately, blocks release
  - P2: fix in current sprint
  - P3: fix in next sprint
  - P4: fix when time permits
- Define SLA for defect resolution per severity.

### 9. Assumptions & Dependencies
- List assumptions made during test planning (e.g., API stable before integration testing starts, test environment available on schedule).
- List external dependencies (e.g., third-party service sandbox availability, DevOps environment setup).
- Note any constraints that may affect the test plan.

### 10. Test Metrics & Reporting
- Define KPIs to track during test execution:
  - Test execution rate (% executed per day/week)
  - Test pass rate (% passing at each milestone)
  - Defect detection rate (defects found per test cycle)
  - Defect density (defects per feature/module)
  - Defect resolution rate (% resolved within SLA)
  - Blocked test cases (% blocked by open defects)
- Define reporting frequency (daily status, weekly summary, phase-end report).
- Define release readiness threshold (e.g., pass rate ≥ 95%, no open Critical/High defects).

### 11. Traceability Matrix
- Build traceability from:
  - Test scope items → Use Cases → User Stories → Requirements
  - Test levels → Test artifacts (19.1, 19.2, 19.3, 19.4)
- Ensure all in-scope items have test coverage.

### 12. Output Generation
- Write to `{spec_folder}/19-test-plan.md`.
- If the file exists and `--append` is not set, ask the user whether to overwrite.

### 13. Review & Confirmation
- Present a summary: scope items, testing levels, resource estimate, schedule alignment, risk count.
- If `--phase` or `--level` was used, note which areas were excluded.

## Output Format

The output file must follow this structure:

```markdown
---
classification: Internal
version: 1.0
last_updated: {YYYY-MM-DD}
owner: QA Engineering Team
---

# Test Plan – {Feature/Project Name}

## Changelog
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| {date} | 1.0 | Initial test plan derived from spec documents 01–18 | QA Lead |

---

## 1. Introduction

### 1.1 Purpose
{Brief description of what this test plan covers and its objectives}

### 1.2 Scope
{Summary of in-scope and out-of-scope items}

### 1.3 References
| Document ID | Document Name | Version | Location |
|-------------|---------------|---------|----------|
| 01 | Project Specification | 1.0 | {path} |
| 02 | User Stories | 1.0 | {path} |
| ... | ... | ... | ... |

---

## 2. Test Scope

### 2.1 In-Scope Features

| Scope ID | Feature/Function | Use Case(s) | User Story(ies) | Testing Level(s) |
|----------|------------------|-------------|-----------------|-------------------|
| SCOPE-001 | {Feature name} | UC-XXX-01, UC-XXX-02 | US-XXX-01 | Unit, Integration, E2E |
| SCOPE-002 | {Feature name} | UC-YYY-01 | US-YYY-01, US-YYY-02 | Unit, E2E |
| ... | ... | ... | ... | ... |

### 2.2 Out-of-Scope Items

| Item | Reason |
|------|--------|
| {Feature/function} | {Why it is excluded from testing} |

### 2.3 Non-Functional Requirements Coverage

| NFR ID | Requirement | Testing Level | Tool |
|--------|-------------|---------------|------|
| NFR-001 | Response time < 200ms (p95) | Performance | k6 |
| NFR-002 | Support 100 concurrent users | Performance | k6 |
| NFR-003 | OWASP Top 10 compliance | Security | OWASP ZAP |
| ... | ... | ... | ... |

---

## 3. Test Strategy

### 3.1 Testing Levels Overview

| Level | Scope | Responsibility | Tool(s) | Coverage Target |
|-------|-------|----------------|---------|------------------|
| Unit | Individual functions, modules | Developers | Jest | 80% code coverage |
| Integration | API contracts, database, services | Developers + QA | Jest, Postman | 100% API endpoint coverage |
| System/E2E | End-to-end user flows | QA | Robot Framework | 100% use case coverage |
| Performance | Load, stress, endurance | QA + DevOps | k6 | Meet NFR thresholds |
| Security | Auth, input validation, OWASP | Security + QA | OWASP ZAP | 100% role boundary coverage |

### 3.2 Unit Testing Strategy

| Item | Detail |
|------|--------|
| Scope | Individual functions, modules, edge cases, error handling |
| Tools | Jest (JS/TS), Pytest (Python), Go testing package |
| Coverage Target | ≥80% line coverage; 100% for critical business logic |
| Responsibility | Developers write and run on every commit (CI pipeline) |

### 3.3 Integration Testing Strategy

| Item | Detail |
|------|--------|
| Scope | API endpoint contracts, database interactions, external service integrations (mocked), event/message queues |
| Tools | Jest + Supertest, Postman Newman, Testcontainers |
| Coverage Target | 100% API endpoint coverage; all integration points tested |
| Responsibility | Developers write; QA reviews and validates |

### 3.4 System/E2E Testing Strategy

| Item | Detail |
|------|--------|
| Scope | End-to-end user journeys, UI interactions, cross-browser compatibility |
| Tools | Robot Framework + SeleniumLibrary (or Browser/Playwright library) |
| Coverage Target | 100% use case main flow; critical alternate and exception flows |
| Responsibility | QA designs and executes; Automation engineers maintain scripts |

### 3.5 Performance Testing Strategy

| Item | Detail |
|------|--------|
| Scope | Load (normal/peak), stress (beyond capacity), endurance (sustained), spike testing |
| Tools | k6 (primary), JMeter (alternative) |
| Thresholds | p50 < 100ms, p95 < 200ms, p99 < 500ms, error rate < 0.1% |
| Responsibility | QA designs scenarios; DevOps configures infrastructure; Performance engineers analyze results |

### 3.6 Security Testing Strategy

| Item | Detail |
|------|--------|
| Scope | Authentication flows, authorization/RBAC, input validation, OWASP Top 10, tenant isolation |
| Tools | OWASP ZAP (automated scanning), Burp Suite (manual pentest), SonarQube (static analysis) |
| Coverage Target | 100% role boundary coverage; all auth flows; all input validation rules |
| Responsibility | Security team performs pentest; QA validates RBAC test cases; Developers fix findings |

---

## 4. Test Environment

### 4.1 Environment Requirements

| Environment | Purpose | Hardware | Software | Data |
|-------------|---------|----------|----------|------|
| DEV | Development testing | {specs} | {specs} | Synthetic test data |
| QA | Functional testing | {specs} | {specs} | Anonymized production-like data |
| STG | Pre-production validation | Production-equivalent | Production-equivalent | Masked production data |
| PROD | Monitoring only | N/A | N/A | Production data |

### 4.2 Test Data Requirements

| Data Type | Source | Refresh Frequency | PII Handling |
|-----------|--------|-------------------|--------------|
| User accounts | Seed data | Per test run | Synthetic emails |
| Transaction records | Generated | Per test run | Masked IDs |
| Configuration data | Import | Weekly | N/A |

### 4.3 Third-Party Integrations

| Integration | Environment | Mock/Real | Notes |
|-------------|-------------|-----------|-------|
| {Service name} | QA | Mock | Mock server simulates responses |
| {Service name} | STG | Real | Sandbox credentials |

---

## 5. Test Resources

### 5.1 Team Structure

| Role | Name | Responsibility | Availability |
|------|------|----------------|--------------|
| QA Lead | _______________ | Test strategy, planning, sign-off | 100% |
| QA Engineer | _______________ | Test design, manual execution | 100% |
| Automation Engineer | _______________ | Test automation, CI/CD | 100% |
| Performance Engineer | _______________ | Performance testing | 50% |
| Security Tester | _______________ | Security testing | 25% |

### 5.2 Effort Estimation

| Phase | Testing Level | Estimated Effort (person-hours) | Assigned To |
|-------|---------------|----------------------------------|-------------|
| P1: {Phase name} | Unit, Integration | {hours} | Developer, QA |
| P2: {Phase name} | Integration, E2E | {hours} | QA, Automation |
| P3: {Phase name} | E2E, Performance | {hours} | QA, DevOps |
| P4: {Phase name} | Security, Regression | {hours} | Security, QA |
| **Total** | All levels | **{total hours}** | |

### 5.3 Tools

| Tool | Purpose | License Type |
|------|---------|-------------|
| Jest | Unit testing | Open Source |
| Robot Framework | E2E automation | Open Source |
| Postman Newman | API contract testing | Open Source |
| k6 | Performance testing | Open Source |
| OWASP ZAP | Security scanning | Open Source |
| BrowserStack | Cross-browser testing | Commercial |

---

## 6. Test Schedule

### 6.1 Phase Milestones

| Phase | Start Date | End Date | Key Milestones | Test Activities |
|-------|------------|----------|----------------|-----------------|
| P1: {Phase name} | {date} | {date} | Test design complete, Test execution complete | Unit, Integration, E2E |
| P2: {Phase name} | {date} | {date} | Test design complete, Test execution complete | Integration, E2E, Performance |
| ... | ... | ... | ... | ... |

### 6.2 Entry Criteria

| Testing Level | Entry Criteria |
|---------------|----------------|
| Unit | Code complete, unit test framework configured |
| Integration | Unit tests passing, API endpoints implemented, test environment ready |
| E2E | Integration tests passing, UI implemented, test data prepared |
| Performance | E2E tests passing, performance environment ready |
| Security | Functional testing complete, security tools configured |

### 6.3 Exit Criteria

| Testing Level | Exit Criteria |
|---------------|---------------|
| Unit | Code coverage ≥ 80%, all tests passing |
| Integration | API coverage 100%, all tests passing |
| E2E | Use case coverage 100%, no critical/high defects open |
| Performance | All NFR thresholds met |
| Security | No critical/high vulnerabilities open |

### 6.4 Suspension Criteria

| Condition | Action |
|-----------|--------|
| Critical blocker defect prevents > 30% of test cases from executing | Suspend testing; notify QA Lead and PM |
| Test environment is down or unstable for > 4 hours | Suspend testing; escalate to DevOps |
| Test data is corrupted or unavailable | Suspend affected test level; restore data |

### 6.5 Resumption Criteria

| Condition | Requirement Before Resuming |
|-----------|-----------------------------|
| Blocker defect suspended testing | Fix deployed and verified in environment |
| Environment instability suspended testing | Environment stable for ≥ 1 hour; smoke test passes |
| Test data issue suspended testing | Data restored and validated by QA |

### 6.6 Regression Triggers

| Trigger | Scope | Frequency |
|---------|-------|-----------|
| Code merge to main | Unit, Integration | Every merge |
| Release candidate | Full regression | Before each release |
| Defect fix | Affected area | After fix deployment |
| Configuration change | Affected area | After change |

---

## 7. Risk Analysis

| Risk ID | Risk Description | Probability | Impact | Risk Level | Mitigation Strategy |
|---------|-------------------|-------------|--------|------------|---------------------|
| R-001 | Test environment unavailable | Medium | High | High | Reserve backup environment, schedule maintenance windows |
| R-002 | Test data quality issues | Medium | Medium | Medium | Implement data validation scripts, prepare synthetic data |
| R-003 | Resource availability constraints | Low | High | Medium | Cross-train team members, document test procedures |
| R-004 | Schedule delays | Medium | Medium | Medium | Prioritize critical path testing, defer non-critical tests |
| R-005 | Tool limitations | Low | Medium | Low | Evaluate alternative tools, implement workarounds |

---

## 8. Defect Management

### 8.1 Defect Lifecycle

```
New → Open → In Progress → Fixed → Verified → Closed
         ↓
      Rejected / Deferred / Duplicate
```

### 8.2 Severity Levels (Impact on System)

| Severity | Definition | Resolution SLA |
|----------|------------|----------------|
| Critical | System unusable, data loss, security breach | 4 hours |
| High | Major feature broken, no workaround | 24 hours |
| Medium | Feature partially broken, workaround available | 3 days |
| Low | Cosmetic issue, minor inconvenience | 1 week |

### 8.3 Priority Levels (Business Urgency)

| Priority | Definition |
|----------|------------|
| P1 | Fix immediately — blocks release or critical user flow |
| P2 | Fix in current sprint |
| P3 | Fix in next sprint |
| P4 | Fix when time permits |

> Note: Severity and Priority are independent. A Low severity defect can be P1 if it blocks a release process.

### 8.4 Defect Tracking

| Field | Description |
|-------|-------------|
| Defect ID | Auto-generated (e.g., DEF-001) |
| Summary | Brief description of the defect |
| Severity | Critical / High / Medium / Low |
| Priority | P1 / P2 / P3 / P4 |
| Status | New / Open / In Progress / Fixed / Verified / Closed |
| Assignee | Developer responsible for fix |
| Reporter | QA who found the defect |
| Environment | DEV / QA / STG |
| Test Case ID | Reference to failing test case |
| Steps to Reproduce | Detailed reproduction steps |
| Expected Result | What should happen |
| Actual Result | What actually happened |

---

## 9. Assumptions & Dependencies

### 9.1 Assumptions

| ID | Assumption |
|----|------------|
| A-001 | {Assumption — e.g., API endpoints are stable before integration testing begins} |
| A-002 | {Assumption — e.g., test environment is provisioned by start of Phase 1} |
| A-003 | {Assumption — e.g., test data seed scripts are ready before E2E testing begins} |

### 9.2 Dependencies

| ID | Dependency | Owner | Required By |
|----|------------|-------|-------------|
| D-001 | {External dependency — e.g., third-party sandbox credentials available} | {Team} | {Phase/Date} |
| D-002 | {External dependency — e.g., DevOps environment setup complete} | DevOps | {Phase/Date} |

### 9.3 Constraints

| Constraint | Impact |
|------------|--------|
| {Constraint — e.g., testing must not use production data} | Requires synthetic data generation |

---

## 10. Test Metrics & Reporting

### 10.1 KPIs

| Metric | Definition | Target | Measured At |
|--------|------------|--------|-------------|
| Test Execution Rate | % of planned test cases executed | 100% by phase end | Daily |
| Test Pass Rate | % of executed test cases passing | ≥ 95% before release | Per milestone |
| Defect Detection Rate | Number of defects found per test cycle | Tracked, no target | Per cycle |
| Defect Density | Defects per feature/module | Tracked, no target | Per phase |
| Defect Resolution Rate | % of defects resolved within SLA | ≥ 90% | Weekly |
| Blocked Test Cases | % of test cases blocked by open defects | < 5% | Daily |

### 10.2 Reporting Schedule

| Report | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| Daily Status | Daily (during execution) | QA Lead | Executed, passed, failed, blocked counts |
| Weekly Summary | Weekly | PM, Tech Lead | KPI trends, open defects, risks |
| Phase-End Report | End of each phase | All stakeholders | Coverage %, defect summary, go/no-go recommendation |
| Test Closure Report | End of project | All stakeholders | Final coverage, defect summary, lessons learned |

### 10.3 Release Readiness Threshold

| Criterion | Threshold |
|-----------|-----------|
| Test pass rate | ≥ 95% |
| Open Critical defects | 0 |
| Open High defects | 0 |
| Use case coverage | 100% |
| NFR thresholds met | All |

---

## 11. Test Deliverables

| Deliverable | Description | Due Date | Owner |
|-------------|-------------|----------|-------|
| Test Plan | This document | {date} | QA Lead |
| Test Scenarios | 19.1-test-scenario.md | {date} | QA Engineer |
| Test Cases | 19.2-test-cases.md | {date} | QA Engineer |
| Test Scripts (API) | 19.3-postman/ | {date} | Automation Engineer |
| Test Scripts (UI) | 19.4-robot/ | {date} | Automation Engineer |
| Test Execution Report | Summary of test results | {date} | QA Lead |
| Defect Report | List of defects found | {date} | QA Engineer |
| Test Closure Report | Final test summary | {date} | QA Lead |

---

## 12. Traceability Matrix

### 12.1 Requirements to Test Coverage

| Requirement ID | Use Case | User Story | Test Scenario(s) | Test Case(s) | Coverage Status |
|----------------|----------|------------|------------------|--------------|------------------|
| REQ-001 | UC-XXX-01 | US-XXX-01 | TS-001, TS-002 | TC-001-01, TC-002-01 | ✅ Covered |
| REQ-002 | UC-XXX-02 | US-XXX-02 | TS-003 | TC-003-01 | ✅ Covered |
| ... | ... | ... | ... | ... | ... |

### 12.2 Test Level to Test Artifacts

| Test Level | Test Artifact | Location | Status |
|-----------|---------------|----------|---------|
| Unit | Jest test files | src/**/*.test.ts | 🔄 In Progress |
| Integration | Jest + Postman | tests/integration/ | 📋 Planned |
| E2E | Robot Framework | tests/robot/ | 📋 Planned |
| Performance | k6 scripts | tests/performance/ | 📋 Planned |
| Security | OWASP ZAP scans | CI pipeline | 📋 Planned |

---

## 13. Approval and Sign-Off

### 13.1 Test Plan Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | _______________ | _______________ | _______________ |
| Project Manager | _______________ | _______________ | _______________ |
| Product Owner | _______________ | _______________ | _______________ |
| Tech Lead | _______________ | _______________ | _______________ |

### 13.2 Test Completion Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | _______________ | _______________ | _______________ |
| Project Manager | _______________ | _______________ | _______________ |
| Product Owner | _______________ | _______________ | _______________ |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| E2E | End-to-End testing |
| NFR | Non-Functional Requirement |
| p50/p95/p99 | Percentile response times |
| SLA | Service Level Agreement |
| STG | Staging environment |

---

Prepared by QA Lead for the Product Development Team.
```

### Table Column Rules

#### Scope Table Columns
- **Scope ID**: `SCOPE-{NNN}` sequential, zero-padded to 3 digits.
- **Feature/Function**: Name of the feature or function being tested.
- **Use Case(s)**: Related use case IDs from `03-use-case.md`.
- **User Story(ies)**: Related user story IDs from `02-user-story.md`.
- **Testing Level(s)**: Unit, Integration, E2E, Performance, Security — comma-separated.

#### Risk Table Columns
- **Risk ID**: `R-{NNN}` sequential, zero-padded to 3 digits.
- **Probability**: Low / Medium / High.
- **Impact**: Low / Medium / High.
- **Risk Level**: Calculated from Probability × Impact matrix.

#### Traceability Matrix Columns
- **Coverage Status**: ✅ Covered, 🔄 In Progress, 📋 Planned, ❌ Not Covered.

## Next Steps

After test plan generation:
1. **Generate test scenarios** — use `/aspec-19.1-test_scenario` to produce detailed test scenarios from use cases and user stories.
2. **Generate test cases** — use `/aspec-19.2-test_case` to expand scenarios into executable test cases.
3. **Generate API test scripts** — use `/aspec-19.3-api-test-script` to produce Postman collections for API testing.
4. **Generate UI test scripts** — use `/aspec-19.4-ui-robot-framework` to produce Robot Framework scripts for E2E testing.
5. **Execute tests** — follow the test schedule and track results in the Test Execution Report.
6. **Obtain sign-off** — present test results to stakeholders for approval before release.
