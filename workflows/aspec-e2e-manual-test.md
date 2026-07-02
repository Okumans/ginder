---
description: Generate manual E2E test scripts from user stories for QA testers
arguments:
  send: true
---

# Manual E2E Test Generator

Use this workflow to generate manual end-to-end test scripts from user stories. Tests are written as step-by-step markdown tables that QA testers execute by hand against a running NeuChat environment.

## Usage

```
/aspec-e2e-manual-test [story_selector] [optional_context_files]
```

**`story_selector`** (optional) — one of:
- A story ID (e.g., `US-001`) to generate tests for that specific story.
- Multiple story IDs (e.g., `US-001 US-003 US-010`) to generate tests for several stories, processed in order.
- A quoted description (e.g., `"video call"`) to fuzzy-match stories by title or epic.
- Omit to auto-select the next untested story from `docs/02-user-stories.md`.

**Examples:**
- `/aspec-e2e-manual-test US-001` — generate manual tests for US-001 only
- `/aspec-e2e-manual-test US-001 US-003 US-010` — generate tests for three stories
- `/aspec-e2e-manual-test "registration"` — fuzzy-match stories related to registration
- `/aspec-e2e-manual-test US-005 docs/02-user-stories.md` — generate for US-005 with explicit context
- `/aspec-e2e-manual-test` — auto-select next untested story

## Input

```text
$ARGUMENTS
```

**Argument parsing:**
1. Collect all arguments matching a story ID pattern (e.g., `US-001`, `US-015`) into a **story list**.
2. Collect all remaining arguments (file paths — contains `/` or ends in `.md`) as **context files**.
3. If a quoted string is provided, search `docs/02-user-stories.md` for matching stories and confirm with the user before proceeding.
4. If the story list is empty, scan `tests/e2e/` for existing `US-*_manual_test.md` files and pick the next untested story from `docs/02-user-stories.md`.

**Default context files** (used when no file paths are provided):
- `docs/02-user-stories.md`
- `docs/03-use-cases.md`
- `docs/09-access-control.md`

## Workflow Steps

1. **Story Selection**
   - If story IDs were provided, locate them in `docs/02-user-stories.md` and verify they exist.
   - If a description was provided, search for matching stories and confirm with the user.
   - If neither was provided, scan `tests/e2e/` for existing manual test files and select the next story that has no corresponding `US-*_manual_test.md`.
   - Read the full story including all acceptance criteria.

2. **Context Gathering**
   - Load the related use case(s) from `docs/03-use-cases.md` for detailed flow steps.
   - Load access control rules from `docs/09-access-control.md` for permission-related test cases.
   - Identify the actors involved (from `docs/06-actor-list.md`) and note any role-specific behavior.
   - Check `docs/05-data-structure.md` for validation rules (field lengths, formats, enums).

3. **Test Case Design**
   - Create one test case per acceptance criterion (happy path).
   - Add test cases for error paths and edge cases:
     - Invalid input (wrong format, empty fields, boundary values)
     - Unauthorized access (wrong role, missing permissions)
     - Duplicate/conflict scenarios
     - Timeout or expiry behavior
   - Each test case must have a unique ID following the pattern `TC-{storyNumber}-{sequenceNumber}` (e.g., `TC-001-01`).

4. **Test Script Generation**
   - Write each test case as a step-by-step table with columns: **Step | Action | Expected Result | Pass/Fail | Notes**.
   - Include:
     - **Prerequisites** at the top of the file (environment, test data, tools needed).
     - **Covers** label linking each test case to its acceptance criterion.
     - **Priority** tag (Critical, High, Medium) based on the AC priority.
     - **Tester sign-off** fields (Result checkbox, Tester name, Date) after each test case.
     - **Test Summary** table at the bottom listing all test cases with their results.
   - Keep steps atomic — one user action per step.
   - Use concrete example values (e.g., `testuser1@neuchat-test.com`, not "a valid email").

5. **Output File**
   - Save to `tests/e2e/US-{number}_manual_test.md` (e.g., `tests/e2e/US-001_manual_test.md`).
   - If the file already exists, ask the user whether to overwrite or append new test cases.

6. **Review & Confirmation**
   - Present a summary of generated test cases: count, coverage of acceptance criteria, and any gaps.
   - If any acceptance criterion is not covered, flag it and ask the user whether to add more test cases.

## Output

- A markdown file per story at `tests/e2e/US-{number}_manual_test.md`.
- Each file contains:
  - Story reference and prerequisites
  - Step-by-step test cases with pass/fail columns
  - Tester sign-off fields
  - Summary table

## Test Case Template

```markdown
## TC-{storyNum}-{seq}: {Short Description}

**Covers**: {AC-number} — {brief AC description}

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | {what the tester does} | {what should happen} | | |
| 2 | ... | ... | | |

**Result**: ☐ Pass ☐ Fail
**Tester**: _______________  **Date**: _______________
```

## Next Steps

- If **multiple story IDs** were provided, after completing one story, automatically proceed to the next. Repeat Steps 1–6 for each story.
- If a **single story ID** was provided, stop after that story and report completion.
- If **auto-selecting**, ask the user whether to continue with the next untested story or stop.
