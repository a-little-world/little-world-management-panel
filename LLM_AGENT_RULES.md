## Admin Panel Automated Email Playbook

### Scope
- Follow this playbook when adding or revising automated email templates in this frontend repository (`front/apps/admin_panel_frontend`).
- All tasks here cover the React email builder source only—HTML generation and backend sync happen elsewhere.

### Key Files
- `src/emails/data/automated.ts` – exports the `automatedEmails` map consumed by the builder UI; source of structure, metadata, and content blocks.
- `src/emails/data/text/automated.json` – provides localized strings for automated templates (`preview`, `subject`, and numbered `block-*` entries).

### Guardrails
- Reuse the slug provided by backend/product (for example `automatic-emails-u084`) verbatim across both files.
- Insert new entries alongside their peers: keep the `automatedEmails` object logically grouped (place the new key near related automated templates such as `new-messages`) and maintain alphabetical ordering inside `automated.json` when practical.
- Reference text via `automatedText['<slug>.<section>']`; never inline literal copy inside `automated.ts`.
- Use existing `ContentTypes`, `EmailCategories`, and `BackendVars` imports—do not introduce new enums or categories for recurring automated emails.
- Preserve file style: single quotes in TypeScript objects, trailing commas where present, and two-space indentation in JSON.

### Required Steps for a New Automated Email
1. **Populate copy** – Append the provided key/value pairs to `src/emails/data/text/automated.json`, matching the established indentation and quoting. Include every block referenced by the template (`preview`, `subject`, `block-*`, button URLs, etc.).
2. **Register the template** – In `src/emails/data/automated.ts` add a new entry to the `automatedEmails` map using the same slug. Place it near the existing automated templates (e.g. immediately after `new-messages`). Wire each `content` item to the corresponding `automatedText[...]` key and reuse existing `ContentTypes` members.
3. **Check imports** – Ensure any required assets or constants (for example `BackendVars` URLs or static links) already exist. If a new hard-coded URL is specified, include it directly in the `href` property.
4. **Quick sanity review** – Confirm there are no dangling commas, duplicated keys, or missing text entries. If time allows, run `npm test -- src/__tests__/utils.test.js` to validate serialization helpers used by the email builder.

### Final Agent Handoff
- In the completion message, summarise the updates and include two standalone JSON payloads that describe the exact modifications (one JSON object for `src/emails/data/automated.ts`, one for `src/emails/data/text/automated.json`). These payloads should mirror the structure below so a sibling agent can apply the edits directly:
  - `file`, `placement`, `object_key`, and `object_value` for the TypeScript map entry.
  - `file`, `placement`, and an `entries` object for the JSON copy block.

These steps keep the admin panel’s automated email data aligned with backend expectations so templates like `automatic-emails-u084` render correctly during the sync process.
