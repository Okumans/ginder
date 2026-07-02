---
description: update readme to match canonical structure and project content
---

# update-readme workflow

Use this workflow to synchronize an existing `README.md` (default: project root). If the developer provides a different README path (e.g., `services/foo/README.md`), perform all discovery within that subfolder tree only. Do not traverse above the folder containing the target README. Follow `.windsurf/skills/readme/SKILL.md` without discarding accurate content.

## Inputs
- Maintainers (name + contact). Default: `Throughwave Development Team (dev@throughwave.co.th)`
- Company name. Default: `Throughwave (Thailand) Co., Ltd.`
- License. Default: proprietary template defined by the README skill.

## Steps
1. **Reset context**
   - Work only within the current project directory (do not traverse to parent repos).
   - Load `.windsurf/skills/readme/SKILL.md` to refresh rules.

2. **Inspect existing README**
   - Read the target README (project root by default, or the developer-specified path).
   - Note which required sections exist, which are missing, and any metadata discrepancies.
   - Run pre-generation validation checklist from README skill (verify parameters, paths, scope).
   - If maintainers, company name, or license text are missing/uncertain, display the defaults and ask the developer to confirm or override before editing:
     ```
     Update README.md with standardized structure
    Target README path: <readme path>
    Folder scope: <folder>
    Maintainers: <maintainer list>
    Company name: <company>
    License: <license>
     ```

3. **Gather project context**
   - Review source files, docs, package manifests, and configs within the folder tree that contains the target README (do not move upward to parent directories).
   - Identify feature descriptions, prerequisites, installation commands, APIs, configs, architecture references, repository structure, development/testing processes, contributing workflow, maintainers, and license details.
   - Follow the README skill instructions for structure, guardrails, and metadata.

4. **Create backup**
   - Before making changes, create a backup: `README.md.bak`
   - Inform the developer of the backup location.

5. **Align structure**
   - Compare the existing README sections against the canonical outline from the README skill.
   - Reorganize sections as needed to match the standard order (add missing sections, merge duplicates, rename headers for consistency).
   - Preserve correct content; only rewrite when necessary for clarity or compliance.

6. **Preview changes**
   - Before applying edits, show the developer a summary of planned changes:
     - **Preserved** (content staying as-is)
     - **Reorganized** (content moved to different sections)
     - **Added** (new sections or content)
     - **Updated** (content being refreshed with current facts)
   - Wait for developer confirmation to proceed.

7. **Sync content**
   - Update each section with current project facts gathered in Step 3.
   - Use relative links; avoid `.windsurf/` references.
   - Apply confirmed maintainer/company/license values; ensure frontmatter fields (`classification`, `version`, `last_updated`, `owner`) and changelog are accurate.
   - Preserve documented prerequisite tooling steps (e.g., `qpdf`, Node.js, Docker installs) unless they are incorrect.
   - You may reorganize preserved specialized content (mobile/client integrations, mock services, dependency matrices, etc.) into clearer subsections, but do not delete or rewrite the underlying details unless inaccurate.

8. **Validate & review**
   - Run post-generation quality checklist from README skill.
   - Verify preserved sections are intact (tooling steps, specialized notes, config tables).
   - Check frontmatter syntax, section order, and changelog updates.
   - Reread the updated README to ensure it complies with the README skill and project requirements.
   - Summarize the edits using short bullet sentences, including any follow-up actions needed.

## Notes
- Never reference `.windsurf/` paths or `MEMORY[]` syntax inside the README content.
- Mention if any sections were intentionally omitted (with justification).
- If the developer edits the README while you are updating, re-run Steps 2–6 to avoid overwriting their changes.
