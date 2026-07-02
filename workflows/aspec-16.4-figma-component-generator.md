---
description: Generate target UI component code by reading UX specs (Steps 16.1/16.2/16.3) and the currently focused Figma frame via MCP interface (Step 16.4)
arguments:
  send: true
---

# Figma-Driven UI Component Generator (Step 16.4)

Use this workflow after completing Steps 16.1–16.3. It reads the UX flow specs,
wireframe flow requirements, and state machine diagrams to understand the component's
design intent, then fetches the **currently focused Figma frame** via the Figma MCP
interface to extract exact design tokens, layout, and component structure — and generates
production-ready UI component code calibrated to **any project stack** detected from
`AGENTS.md` (React, Vue, Svelte, Angular, Flutter, or plain HTML/CSS).

## Usage

```text
/aspec-16.4-figma-component-generator [component_name] [figma_file_id] [--out=<dir>] [spec_files...]
```

**Flags:**

| Flag | Description | Default |
| ---- | ----------- | ------- |
| `--out=<dir>` | Target directory to write generated files into | Stack-default from AGENTS.md |
| `--stack=<name>` | Force a specific stack (`react`, `flutter`, `vue`, `svelte`, `angular`, `html`) | Auto-detect from AGENTS.md |
| `--no-test` | Skip test file generation (not recommended) | Tests always generated |
| `--storybook` | Force Storybook story generation | Auto-detect from AGENTS.md |

**Examples:**

- `/aspec-16.4-figma-component-generator` — prompts for component name, auto-discovers specs and active Figma frame
- `/aspec-16.4-figma-component-generator RagPanel` — named component, auto Figma focus
- `/aspec-16.4-figma-component-generator OpenAIShimPanel figma:abc123` — explicit Figma file ID
- `/aspec-16.4-figma-component-generator LoginScreen --out=lib/features/auth/presentation/widgets` — Flutter widget to custom path
- `/aspec-16.4-figma-component-generator CartSummary --stack=vue --out=src/components/cart` — force Vue stack
- `/aspec-16.4-figma-component-generator CategoryPanel docs/ux-flows/SCR-category.md docs/ux-flow-reqs/SCR-category-req.md`

## Input

```text
$ARGUMENTS
```

**Argument parsing (in order):**

1. First non-flag token in PascalCase or kebab-case → `component_name`
2. Token matching `figma:*` or a UUID-format Figma file ID → `figma_file_id`
3. `--out=<path>` → `output_dir` (overrides stack default)
4. `--stack=<name>` → `stack_override`
5. Any remaining `.md` file paths → extra spec files loaded alongside auto-discovered ones
6. If `component_name` is empty → read all screen IDs from `docs/ux-flow-reqs/` and ask the user to select one
7. If `figma_file_id` is empty → use `figma-mcp list-designs` to discover available files, then ask the user to confirm the target

---

## Prerequisites

Ensure you have completed:

- UX Wireframe Flow & UI Design (Step 16 — `/aspec-16-ux-design`)
- Per-Page UX Sub-Flow (Step 16.1 — `/aspec-16.1-ux-page-flow`)
- Wireframe Flow Requirements (Step 16.2 — `/aspec-16.2-ux-wireframe-flow-req`)
- State Diagrams (Step 16.3 — `/aspec-16.3-state-diagram`) — optional; used for state machine mapping
- **Figma MCP server** running and env vars set:

  ```bash
  npm install -g figma-mcp-server
  export FIGMA_TOKEN=your_figma_access_token
  export FIGMA_TEAM_ID=your_team_id
  # Restart Windsurf to load the MCP server
  ```

- `AGENTS.md` present in project root — used to calibrate generated code to project stack

**Reference skills** (auto-invoked based on detected stack):

| Skill | Invoked when |
| ----- | ------------ |
| `figma-mcp` | Always — Figma MCP commands and token extraction |
| `laws-of-ux` | Always — validate interaction patterns match UX spec intent |
| `react-best-practices` | Stack = React / Next.js |
| `flutter-dev` | Stack = Flutter |

---

## Workflow Steps

### Step 1 — Read AGENTS.md and Detect Stack

Read `AGENTS.md` and extract the following. If `--stack` flag is set, that overrides auto-detection.

| Property | What to look for | Examples |
| -------- | ---------------- | -------- |
| **UI framework** | Framework name + version | React 19, Flutter 3.x, Vue 3, Svelte 5, Angular 17 |
| **Language** | TypeScript / Dart / JavaScript | `.tsx`, `.dart`, `.vue` files |
| **Styling system** | How styles are applied | CSS Modules, Tailwind, styled-components, Flutter ThemeData |
| **Component conventions** | File naming and folder co-location | `ComponentName/ComponentName.tsx`, `feature/widgets/` |
| **State management** | Pattern used | useState/hooks, Riverpod, Bloc, Pinia, Zustand |
| **API client pattern** | How components call the backend | `client.ts`, Dio, Retrofit, fetch, SWR |
| **Test framework** | Testing tool + runner | Vitest+RTL, flutter_test, Jest, Cypress |
| **Design token system** | How design values are stored | CSS variables, ThemeData, design-tokens.ts, theme.dart |
| **Icon library** | Icons used | Lucide, Heroicons, Material Icons, Ionicons |

Produce a **Stack Summary** before proceeding:

```text
Stack detected: [framework] [version]
Language      : [language]
Styling       : [styling system]
State mgmt    : [pattern]
Test framework: [framework]
Token system  : [system]
Output dir    : [resolved output directory]
```

If `--out` is provided, use it. Otherwise resolve the default from the table below:

| Stack | Default output dir |
| ----- | ------------------ |
| React / Next.js | `src/components/[ComponentName]/` |
| Vue | `src/components/[component-name]/` |
| Svelte | `src/lib/components/[ComponentName]/` |
| Angular | `src/app/[component-name]/` |
| Flutter | `lib/features/[feature]/presentation/widgets/` |
| Plain HTML | `src/components/[component-name]/` |

### Step 2 — Load UX Spec Files

Auto-discover and read the following files, filtered to the target `component_name`. Actual paths may vary by project — check `AGENTS.md` or `docs/` for the canonical locations.

| Priority | Typical File Pattern | Content Used |
| -------- | -------------------- | ------------ |
| 1 | `docs/ux-flow-reqs/*<name>*.md` (Step 16.2) | Screen ID, component IDs (CMP-*), state IDs (ST-*), wireflow steps (WF-*), acceptance criteria |
| 2 | `docs/ux-flows/*<name>*.md` (Step 16.1) | Laws of UX applied, interaction patterns, animation hints |
| 3 | `docs/state-diagrams/*<name>*.md` (Step 16.3) | UI state machine — all states, transitions, guard conditions |
| 4 | UX wireframes doc (Step 16 output) | Overall Information Architecture, global navigation, shared layout |
| 5 | API design doc (Step 14 output) | API endpoints the component calls, request/response schemas |
| 6 | Data structure doc (Step 5 output) | DTOs, enums, validation rules for form fields |

If a file is not found, skip it and note the gap in the final report.

### Step 3 — Fetch Figma Design via MCP

Invoke the Figma MCP interface calls in sequence (these are MCP tool calls, not shell commands — invoke via the Figma MCP server loaded in Windsurf):

```text
# 3a. List available designs to confirm file access (use if figma_file_id is unknown)
figma-mcp list-designs

# 3b. Get full design details for the target file
figma-mcp get-design --file-id="<figma_file_id>"

# 3c. Extract design tokens from the file
figma-mcp extract-tokens --file-id="<figma_file_id>"

# 3d. Export all component instances inside the target frame
figma-mcp export-components --file-id="<figma_file_id>"
```

> If `figma_file_id` was not provided as an argument, use `list-designs` to discover
> available files, then ask the user to confirm the target file before proceeding.

From the MCP response, extract and normalise to **stack-agnostic token names**:

**Design tokens:**

- Colors — name each as `color/<role>` (e.g., `color/surface`, `color/primary`)
- Typography — `type/<element>/<property>` (e.g., `type/body/size=16px`, `type/label/weight=500`)
- Spacing — snap to 4px grid; name as `space/<n>` (e.g., `space/4=4px`, `space/16=16px`)
- Radii — `radius/<size>` (e.g., `radius/md=8px`)
- Shadows — `shadow/<level>`
- Transitions — duration + easing per interactive state

**Component structure:**

- Layer hierarchy → widget/component tree
- Auto-layout direction → vertical / horizontal (maps to `Column`/`Row` in Flutter; `flex-direction` in web)
- Alignment — main axis + cross axis
- Fill mode — expand / hug / fixed
- Variants — each Figma variant becomes a named prop/parameter

**Interactive states from Figma prototyping:**

- Default / Hover / Pressed / Focused / Disabled / Loading / Error / Empty
- Map each to a `ST-*` state ID from Step 16.2 where available

**Accessibility annotations (if present in Figma):**

- Semantic role / label / description
- Keyboard / gesture interaction notes
- Focus order (tab index or Flutter focus traversal order)

### Step 4 — Map Spec → Figma → Code

Build a **component mapping table** before writing any code. Every row must resolve.

| Spec ID | Figma Layer Name | Component Prop / State | Code Element (stack-specific) |
| ------- | ---------------- | ---------------------- | ----------------------------- |
| CMP-001 | `Panel/Header` | `title: String` | `Text(title)` / `<h2>{title}</h2>` |
| ST-001 | `State=Loading` | `loading: bool` | `CircularProgressIndicator()` / spinner |
| WF-001-SUBMIT | `Button/Primary` | `onSubmit: VoidCallback` | `ElevatedButton(onPressed: onSubmit)` |
| CMP-002 | `Input/Text` | `controller: TextEditingController` | `TextField(controller: controller)` |

Flag any Figma layer with no matching spec ID → mark as presentational.
Flag any spec ID with no matching Figma layer → add placeholder with TODO comment.

### Step 5 — Generate Component Code

Generate all files into `output_dir` (resolved in Step 1). Adapt every template to
the detected stack. Do **not** mix patterns from different stacks.

---

#### Stack: React / Next.js

**Mandatory files:**

- `[ComponentName].tsx` — component implementation
- `[ComponentName].module.css` — CSS module using project token variables
- `[ComponentName].test.tsx` — Vitest + RTL tests

**Optional files:**

- `[ComponentName].types.ts` — prop interfaces (if large)
- `[ComponentName].stories.tsx` — Storybook (if project uses it)

**Template:**

```tsx
// [ComponentName].tsx
// Generated by /aspec-16.4-figma-component-generator
// Figma: [frame name] in [file name] — [date]
// Spec: [SCR-ID], [WF-IDs], [CMP-IDs]

import { useState, useCallback } from 'react'
import type { [ComponentName]Props } from './[ComponentName].types'
import { [apiFunction] } from '../../api/client'
import styles from './[ComponentName].module.css'

export default function [ComponentName]({ [props] }: [ComponentName]Props) {
  const [loading, setLoading] = useState(false)          // ST-LOADING
  const [error, setError] = useState<string | null>(null) // ST-ERROR

  // Handlers — mapped from WF-* IDs

  return (
    <div className={styles.root} role="[role]" aria-label="[label]">
      {/* CMP-* elements */}
    </div>
  )
}
```

**CSS Module template:**

```css
/* [ComponentName].module.css */
/* Figma: [frame name] — [date] */
.root {
  display: flex;
  flex-direction: column;          /* Figma: vertical auto-layout */
  gap: var(--space-16);            /* Figma: item-spacing=16px    */
  background: var(--color-surface);/* Figma: fill=#1e1e2e         */
  border-radius: var(--radius-md); /* Figma: corner-radius=8px    */
}
```

**Rules:**

- CSS variables only — never hardcode hex or px values
- Map Figma token values to CSS custom properties via a `design-tokens.css` or equivalent token file; reference as `var(--token-name)` in component styles
- Every interactive element: `aria-label`, `role`, keyboard handler
- All API calls via the project's API client, not raw `fetch` in JSX
- Loading + error + empty states required for data-fetching components

---

#### Stack: Flutter

**Reference skill:** `flutter-dev` (read `.windsurf/skills/flutter-dev/` for full API)

**Mandatory files:**

- `[component_name]_widget.dart` — StatelessWidget or StatefulWidget
- `[component_name]_widget_test.dart` — flutter_test widget tests

**Optional files:**

- `[component_name]_state.dart` — Riverpod/Bloc state class (if stateful)
- `[component_name]_controller.dart` — controller/notifier (if using Riverpod)

**Template (StatefulWidget, Riverpod):**

```dart
// [component_name]_widget.dart
// Generated by /aspec-16.4-figma-component-generator
// Figma: [frame name] in [file name] — [date]
// Spec: [SCR-ID], [WF-IDs], [CMP-IDs]

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '[component_name]_controller.dart';

class [ComponentName]Widget extends ConsumerWidget {
  const [ComponentName]Widget({super.key, [required params]});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch([componentName]Provider);
    final theme = Theme.of(context).colorScheme;

    return state.when(
      loading: () => const CircularProgressIndicator(),  // ST-LOADING
      error: (e, _) => Text('Error: $e',                 // ST-ERROR
          style: TextStyle(color: theme.error)),
      data: (data) => _buildContent(context, data),
    );
  }

  Widget _buildContent(BuildContext context, [DataType] data) {
    // CMP-* elements
    return Column(
      // Figma: vertical auto-layout, item-spacing=16px → mainAxisSize + spacing
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // WF-* interactions mapped here
      ],
    );
  }
}
```

**Design token mapping (Flutter ThemeData):**

```dart
// Map Figma tokens → Flutter theme properties
// color/surface        → colorScheme.surface
// color/primary        → colorScheme.primary
// color/error          → colorScheme.error
// type/body/size=16px  → textTheme.bodyMedium
// type/label/size=12px → textTheme.labelSmall
// space/16             → const SizedBox(height: 16) or EdgeInsets.all(16)
// radius/md=8px        → BorderRadius.circular(8)
```

**Flutter-specific rules:**

- Use `const` constructors on all leaf widgets with static content
- Use `ListView.builder` (never `ListView(children:[])`) for lists with unknown length
- Wrap root content in `SafeArea` if screen-level widget
- Call `dispose()` on every `AnimationController` and `TextEditingController`
- Use `go_router` for navigation if multiple screens
- State management must match what AGENTS.md specifies (Provider / Riverpod / Bloc)
- All async calls go through the repository/service layer — never call HTTP directly from widget
- `Semantics` widget required on all interactive elements for accessibility
- Use `flutter analyze` compliance (zero issues) — no `dynamic`, no suppressed lints

**Widget test template:**

```dart
// [component_name]_widget_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  group('[ComponentName]Widget', () {
    testWidgets('renders without crashing', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: [ComponentName]Widget())),
      );
      expect(find.byType([ComponentName]Widget), findsOneWidget);
    });

    testWidgets('shows loading state', (tester) async {
      // override provider with loading state
      await tester.pumpWidget(
        ProviderScope(
          overrides: [[componentName]Provider.overrideWith((_) => const AsyncLoading())],
          child: const MaterialApp(home: [ComponentName]Widget()),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows error state', (tester) async { /* ... */ });
    testWidgets('shows data state', (tester) async { /* ... */ });
    // One testWidgets per WF-* interaction
  });
}
```

---

#### Stack: Vue 3

**Mandatory files:**

- `[ComponentName].vue` — Single File Component (`<script setup lang="ts">`)
- `[ComponentName].test.ts` — Vitest + Vue Test Utils tests
- `[ComponentName].module.css` or scoped styles inside `.vue`

**Template:**

```vue
<!-- [ComponentName].vue -->
<!-- Generated by /aspec-16.4-figma-component-generator -->
<!-- Figma: [frame name] — [date] | Spec: [SCR-ID] -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { [ComponentName]Props } from './[ComponentName].types'

const props = defineProps<[ComponentName]Props>()
const emit = defineEmits<{ close: [] }>()

const loading = ref(false)          // ST-LOADING
const error = ref<string | null>(null) // ST-ERROR
</script>

<template>
  <div class="root" role="[role]" :aria-label="[label]">
    <!-- CMP-* elements -->
  </div>
</template>

<style module>
.root {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}
</style>
```

---

#### Stack: Svelte 5

**Mandatory files:**

- `[ComponentName].svelte` — Svelte component with `$state` runes
- `[ComponentName].test.ts` — Vitest + @testing-library/svelte tests

---

#### Stack: Angular

**Mandatory files:**

- `[component-name].component.ts` — `@Component` class
- `[component-name].component.html` — template
- `[component-name].component.css` — scoped styles
- `[component-name].component.spec.ts` — Jasmine / Jest tests

---

#### Stack: Plain HTML / CSS

**Mandatory files:**

- `[component-name].html` — semantic HTML with ARIA
- `[component-name].css` — custom properties from Figma tokens
- `[component-name].js` — vanilla JS interactions (if any)

---

### Step 6 — Generate Tests

Minimum test checklist per stack (adapt tool names to the detected framework):

- [ ] Component renders without crashing (smoke test)
- [ ] Each Figma variant renders the correct output
- [ ] Each `ST-*` state is reachable and renders the expected UI
- [ ] Each `WF-*` interaction fires the correct callback or triggers the correct state change
- [ ] API / service calls are mocked (no real network in tests)
- [ ] Loading, error, and empty states each render distinct UI
- [ ] Key interactive elements are accessible (aria-label / Semantics)
- [ ] Callback props / emit events are triggered as expected

**Test runner per stack:**

| Stack | Test runner | Mock approach |
| ----- | ----------- | ------------- |
| React | `pnpm test:run` (Vitest + RTL) | `vi.spyOn(globalThis, 'fetch')` |
| Flutter | `flutter test` | `mockito` / provider overrides |
| Vue | `pnpm test:run` (Vitest + VTU) | `vi.fn()` + component stubs |
| Svelte | `pnpm test:run` (Vitest + STL) | `vi.fn()` |
| Angular | `ng test` (Jasmine) | `HttpClientTestingModule` |

### Step 7 — Validate Against Figma

After generating code, run Figma MCP validation:

```bash
figma-mcp validate --component="[ComponentName]" --design="<figma_file_id>"
```

Report discrepancies in a table:

| Property | Figma Value | Generated Value | Match |
| -------- | ----------- | --------------- | ----- |
| Background | `[extracted fill]` | `colorScheme.surface` / `var(--color-surface)` | ✅/⚠️ |
| Item spacing | `[extracted spacing]` | `SizedBox(height:N)` / `var(--space-N)` | ✅/⚠️ |
| Font size | `[extracted size]` | `textTheme.[scale]` / `var(--type-body-size)` | ✅/⚠️ |

Accept discrepancies ≤ 2px layout / ≤ 5% color delta. Flag anything larger for review.

### Step 8 — Output Report

```text
✅ Component generated: [ComponentName]
   Stack   : [framework] [version]
   Out dir : [output_dir]

📁 Files written:
   [output_dir]/[ComponentName].[ext]         (X lines)
   [output_dir]/[ComponentName].[style-ext]   (X lines)
   [output_dir]/[ComponentName].[test-ext]    (X lines)

🎨 Figma source:
   Frame    : [frame name]
   File     : [file name] ([figma_file_id])
   Tokens   : X colors, X spacing, X typography extracted
   Variants : X mapped to props/parameters

📐 Spec traceability:
   SCR IDs  : [list]
   CMP IDs  : X mapped  /  Y unmapped from Figma (presentational)
   ST  IDs  : X mapped  /  Y unmapped (placeholder added)
   WF  IDs  : X mapped

⚠️  Gaps found:
   - [Figma layer] has no matching spec ID → treated as presentational
   - [Spec ID] has no matching Figma layer → placeholder added with TODO

🧪 Tests:
   X test cases generated
   Run: [test command for detected stack]

🔍 Figma validation:
   X/Y properties match exactly
   Z within acceptable tolerance
   W flagged for review (see table above)

📋 Next actions:
   1. Review flagged Figma discrepancies and adjust styles
   2. Fill in any TODO placeholders
   3. Run coverage — target ≥80% on new component
   4. Run: [lint command for detected stack] — must pass zero issues
   5. Commit: feat([component-name]): generate from Figma [frame-name]
```

---

## Prompt

```text
You are a UI component generation specialist. Your job is to read UX specs from
the ASPEC pipeline (Steps 16.1–16.3) and extract live design data from a Figma
frame via the Figma MCP interface, then generate production-ready UI component
code calibrated to the project's tech stack detected from AGENTS.md.

This workflow is STACK-AGNOSTIC. It must produce correct idiomatic code for
React, Flutter, Vue, Svelte, Angular, or plain HTML/CSS depending on what
AGENTS.md declares. Never assume a stack — always detect first.

**Reference skills (invoke before generating code):**
- figma-mcp         — for all Figma MCP commands and token extraction (always)
- laws-of-ux        — to validate interaction patterns match UX spec intent (always)
- react-best-practices — when stack = React or Next.js
- flutter-dev       — when stack = Flutter (read the full skill before generating any Dart code)

**Input sources (read in this order):**
1. AGENTS.md — tech stack, file conventions, API/service client pattern, design token system
2. Wireframe flow requirements doc matching component name (Step 16.2 output)
3. Per-page UX sub-flow doc matching component name (Step 16.1 output)
4. State diagram doc matching component name (Step 16.3 output)
5. API design doc (Step 14 output) — endpoints the component will call
6. Data structure doc (Step 5 output) — DTOs, models, validation rules for form fields
7. Figma MCP — list-designs → get-design → extract-tokens → export-components

**Generation requirements:**

1. DETECT STACK FIRST. Read AGENTS.md before writing a single line of code.
   If AGENTS.md says Flutter + Riverpod → generate Dart with ConsumerWidget.
   If AGENTS.md says React 19 + CSS Modules → generate TSX with CSS Modules.
   Never mix idioms from different stacks.

2. RESOLVE OUTPUT DIRECTORY:
   - If --out=<dir> was provided, use it exactly.
   - Otherwise use the stack default from the output dir table in Step 1.
   - Print the resolved output_dir in the Stack Summary before generating.

3. BUILD THE MAPPING TABLE (Step 4) before writing any code.
   Every Figma layer → spec ID or documented gap. Every spec ID → Figma layer or placeholder.

4. APPLY DESIGN TOKENS correctly per stack:
   - Web stacks: map Figma fills → CSS custom properties (var(--token-name))
   - Flutter: map Figma fills → ThemeData properties (colorScheme.*, textTheme.*)
   - Web stacks without a CSS variable system: use a `designTokens` import from a generated `design-tokens.ts` file
   - Never hardcode hex colors, pixel sizes, or magic numbers in component code

5. ENFORCE STATE COMPLETENESS:
   - Every ST-* state from Step 16.2 → corresponding render branch
   - Every data-fetching component → loading + error + empty states
   - Every form field → validation error state

6. ENFORCE ACCESSIBILITY per stack:
   - Web: aria-label/aria-labelledby, keyboard handlers, WCAG 2.1 AA contrast
   - Flutter: Semantics widget on all interactive elements, focus traversal order
   - Do not suppress focus rings or outline styles

7. FOLLOW CO-LOCATION CONVENTIONS from AGENTS.md.
   Write all files to output_dir. Never scatter files across unrelated directories.

8. GENERATE TESTS using the framework appropriate to the detected stack.
   Minimum: smoke test + each Figma variant + each ST-* state + each WF-* interaction.
   Mock all I/O — no real network, filesystem, or platform calls in tests.

9. RUN figma-mcp validate after generating all files.
   Accept ≤2px layout deviation, ≤5% color delta.
   Flag larger discrepancies in the validation table.

10. OUTPUT THE REPORT from Step 8 as the final message.
```

---

## Output

All files written to `output_dir` (resolved in Step 1):

```text
<output_dir>/
  [ComponentName].[stack-ext]          ← always
  [ComponentName].[style-ext]          ← always (omitted for Flutter; uses ThemeData)
  [ComponentName].[test-ext]           ← always
  [ComponentName].types.[ext]          ← optional: large prop surface
  [ComponentName].stories.[ext]        ← optional: Storybook detected
  [component_name]_controller.dart     ← optional: Flutter Riverpod notifier
```

**Stack file extension reference:**

| Stack | Component | Style | Test |
| ----- | --------- | ----- | ---- |
| React | `.tsx` | `.module.css` | `.test.tsx` |
| Flutter | `_widget.dart` | *(ThemeData)* | `_widget_test.dart` |
| Vue | `.vue` | *(scoped in .vue)* | `.test.ts` |
| Svelte | `.svelte` | *(scoped in .svelte)* | `.test.ts` |
| Angular | `.component.ts` + `.html` | `.component.css` | `.component.spec.ts` |
| HTML | `.html` | `.css` | `.test.js` |

## Next Steps

After completing this step:

- Review flagged Figma discrepancies and update styles
- Run the stack-appropriate test command (from the report) to verify all tests pass
- Run the stack-appropriate coverage command to confirm ≥80% on the new component
- Run the stack-appropriate lint command — must pass zero issues
- Proceed to `/aspec-20-implement` to wire the component into the app shell
