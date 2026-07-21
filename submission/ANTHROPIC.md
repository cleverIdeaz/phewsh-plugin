# Anthropic submission copy

Phewsh has two independent Anthropic submissions: the open-source Claude Code plugin can
be submitted to the Plugin Directory, while the remote MCP service can be submitted to the
Connectors Directory. Do not describe one approval as approval of the other.

## Plugin Directory

- **Repository:** `https://github.com/cleverIdeaz/phewsh-plugin`
- **Plugin name:** Phewsh
- **Description:** Keep one user-owned project truth across Claude Code and other AI tools.
  Resume from bounded context, plan from the durable record, and leave proposed decisions
  and handoffs for the next tool without claiming shared model memory.
- **License:** MIT
- **Validation:** run `claude plugin validate --strict plugin` on the final synced tree,
  then install from the public repository and exercise all five skills/tools.
- **External gate:** the public 0.1.1 package is synced. Confirm the eligible Claude
  organization/Console role, complete current security/attestation requirements, and
  submit the immutable public release through the provider portal.

## Connectors Directory listing

- **Server name (≤100):** Phewsh
- **Tagline (≤55):** Carry project truth and handoffs across AI tools.
- **Suggested slug:** `phewsh` (permanent; Neal confirms availability before submission)
- **Description (≤2,000):** Phewsh is a user-owned continuity layer for AI-assisted work.
  It lets a signed-in user load a bounded Project · Next · Work · Record snapshot, inspect
  the append-only change ledger, and record proposed decisions or handoffs so the next
  human or AI tool can continue from the same durable record. Reads and writes are scoped
  to projects the user owns or was invited to. Phewsh does not transfer private Claude
  memory, execute code, control a desktop, publish content, or label an AI-authored record
  as human-approved or repository-verified.
- **Primary use cases:** resume a project cold; plan from recorded intent; inspect changes
  since a revision; leave a decision; create a bounded handoff.
- **Prerequisites:** Phewsh account, membership in at least one project, browser OAuth.
- **Read/write class:** three read tools, one non-destructive private handoff write, and one
  private decision write marked destructive because its optional supersede mode changes a
  prior decision's durable status.
- **Target URL / transport:** `https://mcp.phewsh.com`, Streamable HTTP — production DNS/TLS
  and bearer-mode Inspector every-tool acceptance passed; submit only after browser OAuth,
  provider-Origin, and Claude every-tool acceptance pass.
- **Authentication:** OAuth 2.1 — select the real deployed registration method after the
  browser proof (DCR, CIMD, or coordinated static client); do not claim one in advance.
- **Documentation:** `https://phewsh.com/platform`
- **Privacy:** `https://phewsh.com/privacy.html`
- **Support:** `hello@phewsh.com`
- **Company:** Phewsh — `https://phewsh.com`
- **Icon source:** `assets/PhewshYinYang.png`
- **Suggested categories:** Developer Tools and Productivity, subject to the portal's live
  category list and Neal's final choice.

The five-tool behavior and annotation justifications are in [OPENAI.md](./OPENAI.md); the
same factual matrix applies to Anthropic's synchronized tool review. All tool names are
under 64 characters and all five local definitions now include titles. Verify the deployed
`tools/list` scan reports those titles and annotations before submitting.

## Reviewer instructions

1. Use the no-MFA reviewer account entered in the provider portal; do not use credentials
   from this repository.
2. Add `https://mcp.phewsh.com` as a Claude custom connector and complete browser OAuth.
3. Ask Claude to list projects and select **Phewsh Reviewer Demo**.
4. Load active context and confirm vision, plan, next, verification labels, and revision.
5. Read changes after revision 0 and confirm ordered events.
6. Record one unique proposed decision, then retry with the same idempotency key and
   confirm no duplicate.
7. Create one proposed handoff with two next steps.
8. Attempt a non-member project read, a `human_approved` AI write, and a stale-revision
   write; confirm the three safe failures documented in [OPENAI.md](./OPENAI.md).

Bearer-mode every-tool acceptance in MCP Inspector 1.0.0 is recorded. Before the directory
form is submitted, personally repeat the flow with browser OAuth and run every tool through
Claude's custom-connector runtime. Record the dated results in the durable handoff; do not
replace this with static unit-test evidence.

## Data-handling declarations

- Phewsh reads and writes its own first-party Supabase-backed service; it is not a generic
  proxy for unrelated third-party APIs.
- It handles project names, intent artifacts, decisions, handoffs, task counts, event
  revisions/timestamps, membership, and claimed connector provenance as disclosed in the
  public privacy policy.
- It does not require health data and does not contain sponsored content.
- It does not collect Claude conversation history or hidden memory. Only explicit MCP tool
  arguments reach the service.

## Human portal gates

- Team/Enterprise organization and directory-management permission;
- browser OAuth, provider-Origin/audience acceptance, Claude custom-connector proof, and a
  populated reviewer account;
- final slug, categories, review contact, owned-domain/API declarations, and all current
  policy acknowledgments;
- portal submission and response to provider review.
