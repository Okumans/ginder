---
description: Generate a Windsurf always-on rule that enforces 100% unit test coverage, calibrated to the project's AGENTS.md environment (Step 15.2)
arguments:
  send: true
---

# Unit Test Coverage Rule Generator (Step 15.2)

Use this workflow after completing Step 15 (AGENTS.md) to generate a Windsurf rule
file that enforces unit test coverage requirements permanently across all sessions.

## Usage

```text
/aspec-15.2-unit-test-rule [agents_file] [existing_rule_file]
```

**Examples:**

- `/aspec-15.2-unit-test-rule` — reads `AGENTS.md` from project root automatically
- `/aspec-15.2-unit-test-rule AGENTS.md` — explicit path
- `/aspec-15.2-unit-test-rule AGENTS.md .windsurf/rules/unit-test-coverage.md` — regenerate existing rule

## Input

```text
$ARGUMENTS
```

**Argument parsing:**

1. If a path matching `AGENTS.md` or `agents*.md` is provided, read it as the project context file.
2. If a path ending in `.md` inside `.windsurf/rules/` is provided, treat it as the existing rule to regenerate.
3. If no arguments are given, auto-read `AGENTS.md` from the project root.

## Prerequisites

Ensure you have completed:

- **Step 15** — `AGENTS.md` generated and up to date (`/aspec-15-agents-md`)
- Technology stack confirmed (languages, test frameworks, coverage tools)
- Project structure established (source and test directories identified)

---

## Workflow Steps

### Step 1 — Read AGENTS.md

Read `AGENTS.md` (or the provided file) and extract:

- **Languages & runtimes** in use (TypeScript/React, Rust, Python, Go, etc.)
- **Test frameworks** per layer (Vitest, cargo test, pytest, Jest, etc.)
- **Coverage tools** per layer (`@vitest/coverage-v8`, `cargo tarpaulin`, `pytest-cov`, etc.)
- **Repository structure** — where source files and test files live
- **CI pipeline** — what commands run on each commit
- **Existing thresholds** — any coverage numbers already documented

### Step 2 — Identify Test File Conventions

For each language layer found in AGENTS.md, determine:

| Layer | Source Location | Test Location | Test File Pattern |
| ----- | -------------- | ------------- | ----------------- |
| [Layer 1 — e.g. TypeScript/React] | [src path] | [co-located or separate] | [pattern] |
| [Layer 2 — e.g. Go/Rust/Python] | [src path] | [test path] | [pattern] |
| [Layer N] | [src path] | [test path] | [pattern] |

### Step 3 — Determine Coverage Thresholds

Apply the following defaults unless AGENTS.md specifies otherwise:

| Layer | Statements | Functions | Branches | Lines | Critical Paths |
| ----- | ---------- | --------- | -------- | ----- | -------------- |
| [Layer 1] | ≥ 80% | ≥ 80% | ≥ 70% | ≥ 80% | 100% |
| [Layer 2] | — | every exported fn ≥ 1 test | — | — | 100% (auth, data writes) |
| [Layer N] | — | every key endpoint ≥ 1 test | — | — | 100% |

> **Goal is 100% coverage on all new code.** Existing untested legacy code is tracked
> via a baseline table and closed incrementally, highest-ROI file first.

### Step 4 — Identify Forbidden Patterns

From AGENTS.md, derive the project-specific anti-patterns to forbid:

- Creating a new component/handler/function without a corresponding test file
- Adding an exported function without at least one test covering the happy path
- Adding a route/handler without an integration or unit test
- Lowering coverage thresholds to make CI pass
- Tests with zero assertions
- Tests that call real network or filesystem (all I/O must be mocked)
- Skipping tests with `.skip` / `xit` / `skip()` without a dated comment

### Step 5 — Draft the Rule File

Generate `.windsurf/rules/unit-test-coverage.md` with the following structure:

```markdown
---
trigger: always_on
---

# Unit Test Coverage Enforcement

## Rule: Tests Are Not Optional

[1-sentence summary from project context]

---

## Coverage Thresholds

### [Layer 1 — e.g. Frontend (Vitest + @vitest/coverage-v8)]

| Metric | Minimum |
| ------ | ------- |
| Statements | X% |
| Functions | X% |
| Branches | X% |
| Lines | X% |

[vitest.config.ts threshold snippet]

### [Layer 2 — e.g. Rust backend (cargo test)]

[Rules for pub handler/service coverage + critical path 100%]

### [Layer 3 — e.g. Python embed server]

[Key endpoint list that must each have ≥ 1 pytest]

---

## When Writing New Code

### [Language/Framework — e.g. TypeScript / React]

[Required test file naming + co-location rule]

Minimum test requirements per component:
- [ ] Renders without crashing
- [ ] Happy-path props render correctly
- [ ] Loading / error / empty states shown
- [ ] User interactions produce expected state changes
- [ ] API calls mocked with vi.spyOn
- [ ] Callback props (onClose, onSubmit, etc.) called when expected

### API client functions

[fetch-mock test requirements per exported function]

### [Rust handlers]

[axum::test / reqwest test requirements]

---

## When Modifying Existing Code

- Update existing tests before changing behaviour (Red → Green)
- Add a new test for every new `if` / `match` arm added
- Never delete or weaken tests to make coverage pass

---

## Verification Commands

[Copy-pastable commands per layer from AGENTS.md CI pipeline]

---

## Forbidden Patterns

[Derived forbidden pattern list from Step 4]

---

## Coverage Gap Triage Priority

[Ordered list of files/components with lowest coverage, highest LOC — highest ROI first]

---

## Current Baseline

| Layer | Statements | Functions | Branches | Measured |
| ----- | ---------- | --------- | -------- | -------- |
| [layer] | X% | X% | X% | [date] |

**Target: bring all layers to ≥ 80% (path to 100% for new code).**
```

### Step 6 — Validate the Rule File

Before saving, verify:

- [ ] `trigger: always_on` is in the YAML front matter
- [ ] Every language layer present in AGENTS.md has a corresponding section
- [ ] All verification commands are copy-pastable and match AGENTS.md CI steps
- [ ] Forbidden patterns list is non-empty
- [ ] Baseline table has at least one row with a measured date
- [ ] File is saved to `.windsurf/rules/unit-test-coverage.md`

### Step 7 — Update test framework config (if applicable)

If the project uses a test framework that supports threshold configuration (e.g. Vitest, Jest, pytest-cov),
and the config file does NOT already define coverage thresholds, propose adding the threshold block
using the values from Step 3.

Example for Vitest:

```ts
coverage: {
  provider: 'v8',
  thresholds: {
    statements: 80,
    functions: 80,
    branches: 70,
    lines: 80,
  },
}
```

Ask the user before writing this change if a coverage config block already exists.

### Step 8 — Report

Print a summary:

```text
✅ Rule written to: .windsurf/rules/unit-test-coverage.md
   trigger        : always_on
   layers covered : [list]
   thresholds     : statements ≥X%, functions ≥X%, branches ≥X%
   forbidden rules: N patterns
   baseline rows  : N layers

📋 Next actions to reach 100% on new code:
   1. [Highest-ROI file] — run: [coverage command]
   2. [Second file]
   3. [Third file]
```

---

## Prompt

```
You are a quality engineering specialist. Your task is to generate a Windsurf
always-on rule file that enforces unit test coverage for this project.

**Input:**
- AGENTS.md (project context, tech stack, repo structure, CI pipeline)
- Optional: existing `.windsurf/rules/unit-test-coverage.md` to regenerate

**Requirements:**

1. Read AGENTS.md thoroughly. Extract every language, test framework, and
   coverage tool mentioned.

2. For each layer (frontend, backend, services, etc.), define:
   - Minimum coverage thresholds (target 100% for new code; ≥80% overall)
   - Test file naming and co-location conventions
   - Minimum test cases required per new component/function/handler
   - How to mock external dependencies (fetch, DB, HTTP clients)

3. List forbidden patterns — concrete, actionable rules that prevent untested
   code from being merged. At minimum include:
   - "Creating a new [component/handler] without a test file"
   - "Tests with no assertions"
   - "Lowering coverage thresholds to pass CI"
   - "Tests that call real network or filesystem"

4. Include copy-pastable verification commands taken directly from the CI
   pipeline in AGENTS.md (or standard commands if not specified).

5. Add a current baseline table using any coverage numbers in AGENTS.md or
   the existing rule file. If none exist, mark all as "not yet measured".

6. Add a Coverage Gap Triage Priority section — ordered list of the
   highest-LOC, lowest-coverage files to address first.

7. Output the complete rule file content using the exact structure shown in
   Step 5 above. The first two lines MUST be:
   ---
   trigger: always_on
   ---

8. After outputting the content, also propose the test framework config threshold
   block for any layer that supports enforced thresholds (Vitest, Jest, pytest-cov, etc.).

**Style guidelines:**
- Be concrete and actionable, not vague
- Use tables for thresholds and baselines
- Use checklists for per-component requirements
- Prefer short bullet points over paragraphs
- Do not add sections not relevant to the detected tech stack
```

---

## Output

Save the generated rule as:

```text
.windsurf/rules/unit-test-coverage.md
```

Optionally update the test framework config file (e.g. `vitest.config.ts`, `jest.config.ts`, `pytest.ini`) to enforce thresholds at CI level.

## Next Steps

After completing this step:

- Run the coverage command from AGENTS.md (e.g. `pnpm coverage`, `cargo tarpaulin`, `pytest --cov`) to establish the baseline measurement
- Update the **Current Baseline** table in the rule with actual numbers
- Proceed to `/aspec-20-implement` to start closing the highest-priority coverage gaps
