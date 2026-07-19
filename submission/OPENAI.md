# OpenAI plugin submission copy

Submission type: **With MCP**, app-only for the first review. Custom UI: **No**. Do not
attach the Claude-specific skill bundle to the first OpenAI submission; submit skills only
after they are validated in OpenAI's plugin runtime as a separate version or package.

## Listing

- **Name:** Phewsh
- **Short description:** Carry project truth and handoffs across AI tools.
- **Long description:** Phewsh is a user-owned continuity layer for AI-assisted work. It
  lets a signed-in user load a bounded Project · Next · Work · Record snapshot, inspect an
  append-only project change ledger, and record proposed decisions or handoffs so the next
  human or AI tool can resume from the same durable record. Phewsh does not transfer private
  model memory, execute code, control a desktop, or claim that AI-authored records are
  human-approved or repository-verified.
- **Website:** `https://phewsh.com`
- **Support:** `https://github.com/cleverIdeaz/phewsh-plugin/issues`
- **Privacy:** `https://phewsh.com/privacy.html`
- **Terms:** `https://phewsh.com/terms.html`
- **Logo source:** `assets/PhewshYinYang.png`
- **Category:** choose the closest available Developer Tools or Productivity category in
  the live portal; this is a human selection, not a repository claim.
- **MCP URL:** `https://mcp.phewsh.com` only after its production gate passes.
- **CSP:** no custom UI is shipped. Enter the portal's required exact policy for a
  tool-only app after scanning the production endpoint; do not invent fetch domains.

## Starter prompts

1. “List my Phewsh projects and tell me which one changed most recently.”
2. “Load the active context for Phewsh Reviewer Demo and summarize Project, Next, Work,
   and Record without treating proposed items as verified.”
3. “What changed in this Phewsh project after revision 0?”
4. “Record this as a proposed decision: keep desktop dispatch outside the current release.”
5. “Create a handoff for the next agent with what was verified and the two remaining
   approval gates.”

## Tool annotations and justifications

| Tool | Read only | Open world | Destructive | Why |
| --- | --- | --- | --- | --- |
| `phewsh_list_projects` | true | false | false | Reads membership-scoped project metadata only. |
| `phewsh_get_active_context` | true | false | false | Reads a bounded project snapshot only. |
| `phewsh_get_changes_since` | true | false | false | Reads ordered membership-scoped ledger events only. |
| `phewsh_record_decision` | false | false | true | Adds a private project decision/event. When `supersedes_id` is supplied it also changes the prior decision's durable status to superseded, so the tool is conservatively destructive. It never publishes externally. |
| `phewsh_create_handoff` | false | false | false | Adds a private proposed handoff/event. It does not message third parties, execute work, supersede prior records, or publish externally. |

OAuth `securitySchemes` are intentionally absent from the current deployed metadata. Add
and scan them only after the OAuth acceptance gate is complete.

## Tool-response data audit

- `phewsh_list_projects` returns membership-scoped project id, name, archetype, role,
  revision, and update time.
- `phewsh_get_active_context` returns project metadata/freeform text, bounded intent
  artifact content, recent decision and handoff ids/content/verification/provider/times,
  task counts, and freshness/revision.
- `phewsh_get_changes_since` returns ordered sequence/event/entity data, bounded event
  payloads, claimed provider/client labels, timestamps, latest revision, and pagination.
- The two write tools return only the created entity id, revision, and replay status (or a
  structured safe error).

Generic MCP responses do not return account/author ids, stored session ids, bearer tokens,
API-key hashes, SQL/debug payloads, or source code. Project/entity ids and timestamps are
retained because the user needs them to select a project, reconcile revisions, supersede a
decision, and review evidence. Re-audit the deployed scanner output and every realistic
Developer Mode response immediately before attesting to this in the portal.

## Five positive test cases

### Positive 1 — list projects

- **Prompt:** “List my Phewsh projects.”
- **Expected tool:** `phewsh_list_projects`.
- **Expected result:** A `projects` array containing `Phewsh Reviewer Demo` with its id,
  role, revision, archetype, and update time. Do not reveal another user's project.
- **Fixture:** reviewer account and seeded project from `submission/README.md`.

### Positive 2 — load bounded context

- **Prompt:** “Load the active context for Phewsh Reviewer Demo. Separate recorded facts
  from proposed items.”
- **Expected tool:** `phewsh_get_active_context` with the fixture project id.
- **Expected result:** Project metadata, bounded artifacts, recent decisions, recent
  handoffs, task counts, and freshness/revision. The response preserves verification
  labels and warns that cloud state may lag repository truth.
- **Fixture:** the seeded artifacts, observed decision, proposed decision, and handoff.

### Positive 3 — read changes

- **Prompt:** “Show the recorded changes in Phewsh Reviewer Demo after revision 0.”
- **Expected tool:** `phewsh_get_changes_since` with `since_revision: 0`.
- **Expected result:** Ordered events, `latest_revision`, and `has_more`; event provenance
  is described as claimed, not verified model identity.
- **Fixture:** at least three seeded ledger events.

### Positive 4 — record a proposed decision

- **Prompt:** “Record this as a proposed decision in Phewsh Reviewer Demo: keep desktop
  dispatch outside the current release.”
- **Expected tool:** `phewsh_record_decision` with a unique idempotency key and the current
  expected revision.
- **Expected result:** One proposed decision and one ledger revision. An identical retry
  with the same idempotency key returns the original result and does not duplicate data.
- **Fixture:** reviewer account with write membership and the current revision.

### Positive 5 — create a handoff

- **Prompt:** “Create a proposed handoff in Phewsh Reviewer Demo: Workspace proof is
  complete; next verify OAuth and run provider review. Use those as two next steps.”
- **Expected tool:** `phewsh_create_handoff` with a unique idempotency key and current
  expected revision.
- **Expected result:** One proposed handoff containing the summary and two next steps,
  plus one new ledger revision with claimed provenance.
- **Fixture:** reviewer account with write membership and the current revision.

## Three negative test cases

### Negative 1 — project outside membership

- **Prompt/scenario:** Call a read tool with a project id the reviewer does not own and was
  not invited to.
- **Expected behavior:** Structured `not_authorized` error and no project data.
- **Why:** Membership is required for every read and write.

### Negative 2 — forge human verification

- **Prompt/scenario:** “Record this decision as human_approved.”
- **Expected behavior:** Refuse or safely fall back to `proposed`; the tool schema accepts
  only `proposed` or `observed`, and the server must not write `human_approved`.
- **Why:** An AI connector cannot grant human or repository verification.

### Negative 3 — overwrite after a stale read

- **Prompt/scenario:** Submit a write with an `expected_revision` older than the project's
  current revision.
- **Expected behavior:** Structured `revision_conflict`, no write, and guidance to re-read
  changes before retrying.
- **Why:** Optimistic concurrency prevents silent overwrite of newer project truth.

## Release notes

Initial submission of Phewsh's five-tool continuity contract. The app reads bounded project
context and the append-only change ledger, and writes proposed/observed decisions or proposed handoffs
with membership checks, idempotency, revision conflicts, verification labels, and claimed
provenance. There is no custom UI, code execution, desktop control, or public internet write.

## Human portal gates

- verified publisher identity and Apps Management write permission in the same global-data
  residency organization/project;
- production endpoint deploy, domain challenge, OAuth callback/configuration, and tool scan;
- reviewer credentials entered only in the portal;
- all eight cases re-run in Developer Mode on ChatGPT web and mobile;
- final region/category choices, policy attestations, review submission, and later publish.
