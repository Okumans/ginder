---
description: generate readme from scratch even when README.md exists
---

# generate-readme-from-scratch workflow

Use this workflow to rebuild any repository's `README.md` from scratch. This process overwrites the existing README, so confirm details before running commands.

## Inputs
- Maintainers (name + contact). Default: `Throughwave Development Team (dev@throughwave.co.th)`
- Company name. Default: `Throughwave (Thailand) Co., Ltd.`
- License. If unspecified, use proprietary template from `.windsurf/skills/readme/license-template.md`. If the project uses an open-source license, fetch its canonical text.

## Steps
1. **Reset context**
   - Clear any cached assumptions. Do **not** read `README.md.bak`.
   - Treat the repository as if no README exists.
   - Load `.windsurf/skills/readme/SKILL.md` to refresh rules.

1a. **Pre-flight validation**
   - Check if `README.md` already exists in the target location.
   - If it exists, warn the developer and suggest using `update-readme` workflow instead.
   - Wait for explicit confirmation to proceed with overwrite.

2. **Confirm parameters with developer**
   - Run pre-generation validation checklist from README skill (verify parameters, paths, scope).
   - Ask developer: "Include Marketing Pitch section? (y/n)"
   - Display the following before generating content:
     ```
     Generate README.md from scratch
     This will override existing README file
     README path: <readme path>
     Folder scope: <folder>
     Maintainers: <maintainer list>
     Company name: <company>
     License: <license>
     Marketing Pitch: <yes/no>
     ```
   - Wait for developer confirmation or updated values.

3. **Discover existing content**
   - Scan for existing documentation:
     - Architecture diagrams (`docs/architecture/`, `docs/diagrams/`)
     - API specifications (`docs/api/`, OpenAPI/Swagger files)
     - ADRs (`docs/adr/`)
     - Technical docs (`docs/technicals/`)
     - Specialized files (Docker, mock services, mobile integration)
   - Present discovered content to developer for inclusion confirmation.

4. **Gather project context**
   - Review relevant source files, docs, package manifests, server configs, etc. (project agnostic).
   - Identify features, prerequisites, installation steps, API endpoints, configuration, architecture references, repository structure, development/testing workflows, contributing process, maintainers, and license info.
   - Follow the instructions in `.windsurf/skills/readme/SKILL.md` (the skill may reference additional resources—use whatever it prescribes).

5. **Draft README content**
   - Follow the section structure mandated by the README skill.
   - Use relative links for repository files.
   - Apply the default license per the README skill unless a different license was specified.
   - Include maintainer info with provided list.
   - If Marketing Pitch requested, add one short paragraph (2-3 sentences) following the skill's examples.

6. **Generate README.md**
   - Overwrite `README.md` with the new content.
   - Ensure ISO frontmatter (`classification`, `version`, `last_updated`, `owner`) is at the top.
   - Add changelog table as final section.

7. **Validate & review**
   - Run post-generation quality checklist from README skill.
   - Verify frontmatter syntax, section order, and changelog entry.
   - Check Marketing Pitch (if included) is one short paragraph.
   - Double-check formatting, links, and compliance with the README skill.
   - Summarize the work performed using short bullet points (one concise sentence each) and highlight follow-up actions.
   - If the user requests changes or edits the README manually, pause the workflow. Address the feedback, re-validate against the README skill, and then resume from Step 5 (Draft) or Step 6 (Generate) depending on how much content changed. Always confirm with the user before overwriting the file again.

## Notes
- Never reference `.windsurf/` paths or `MEMORY[]` syntax in the README content.
- Keep instructions concise and engineer-focused.
- Mention if any sections were intentionally omitted and why.
