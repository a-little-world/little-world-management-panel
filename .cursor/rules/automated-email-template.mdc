## Cursor Agent Rules: Automated Email Data Updates

### Scope
- Apply these rules inside this frontend repository when adding or updating automated-email data that powers the React email builder.
- Work is limited to adjusting `src/emails/data/automated.ts` and `src/emails/data/text/automated.json` so new backend templates (for example `automatic-emails-u084`) render correctly.

### Primary TODOs
1. Append the provided translation entries to `src/emails/data/text/automated.json` using two-space indentation.
2. Register the matching template object in `src/emails/data/automated.ts`, placing it near related automated templates (e.g. after `new-messages`).
3. Reference every string via `automatedText['<slug>.<section>']` and keep all `ContentTypes` assignments consistent with the requested blocks.
4. If a button URL is supplied, add it directly to the `href` field; otherwise reuse an existing `BackendVars` constant.
5. Run a formatting/self-check pass (lint/tests optional if time is constrained) to ensure the builder can serialize the new entry.

### Guardrails
- Do not create or modify files outside `src/emails/data/automated.ts` and `src/emails/data/text/automated.json` for this workflow.
- Keep the slug identical across both files; never rename categories or introduce new enums.
- Preserve the surrounding code style: single quotes in TypeScript, trailing commas where present, and sorted JSON keys where practical.
- Avoid hard-coding copy inside `automated.ts`; all text must live in the JSON file.

### Completion Checklist
- [ ] `automated.json` contains every key referenced by the new template (`preview`, `subject`, and `block-*`).
- [ ] `automated.ts` registers the new map entry with the correct slug, category, and content structure.
- [ ] The final assistant message includes two JSON payloads describing the exact edits (one for the TypeScript object insertion, one for the JSON copy additions) so a sibling agent can apply them verbatim.
