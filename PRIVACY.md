# Privacy & data handling — Phewsh plugin

Developer preview. This explains exactly what the plugin sends, stores, and never touches.

## What the plugin is
A thin client — the **Claude Code adapter** to Phewsh's provider-neutral continuity
layer (the same record other tools reach via ChatGPT, Claude.ai connectors, Cursor, or
the [phewsh CLI](https://github.com/cleverIdeaz/phewsh-cli) for Codex, Gemini, and more).
All logic lives in Phewsh Cloud (a Supabase-backed remote MCP server) and the CLI. This
package contains only: markdown skills, an MCP server URL, and a place to hold your API
key. No business logic, no analytics, no telemetry of its own. The credential handling
described below is how Claude Code, this adapter's host, stores the key; other adapters
use their own host's credential store.

## Your credential
- On enable, Claude Code prompts for your **Phewsh API key** (from phewsh.com/api).
- It is stored by Claude Code as a `sensitive` value in its host credential store: normally
  the **OS keychain**, or `~/.claude/.credentials.json` where no keychain exists. The plugin
  never writes it to project settings or Git and never prints it.
- It is sent only to the Phewsh MCP endpoint, only as an `Authorization: Bearer` header,
  only over HTTPS.
- The 0.1.1 candidate supports an independently revocable **MCP-only** key with a label,
  optional expiry, and last-use timestamp. The continuity server accepts `mcp` keys; the
  paid generation gateway accepts `gateway` keys; existing `legacy_all` keys remain
  backward-compatible until rotated, but no new broad key can be created or promoted after
  migration. The public service still has the older account-wide
  issuer until this migration and both enforcement paths are deployed and probed. Do not
  treat the local code as production enforcement or use a broad preview key for review.

## What data moves, and where
When a skill calls an MCP tool, the request goes to
`https://mcp.phewsh.com/` — the endpoint this plugin's `.mcp.json` ships — and may include:
- the **project id** you're working in,
- **decision text** and **handoff summaries** you (or the AI, on your instruction) choose
  to record,
- a **revision cursor** and **idempotency key**.

The server records **claimed provenance** (provider/client/session signals supplied by the
transport or caller) with each write. This helps explain where a record came from, but is
not proof of model identity or authorship.
It does **not** receive your source code, your terminal transcript, your editor buffers, or
files you didn't pass into a tool call.

## What the server stores
Your project record: intent artifacts, decisions, handoffs, and an append-only event ledger
— the same data visible at phewsh.com when you sign in. The MCP service uses explicit
service-side membership checks and security-definer writes; direct user reads are also
protected by row-level security. The plugin can only reach projects you own or were invited
to. AI-authored writes are always recorded as `proposed`/`observed` — never as
`human_approved` or `repo_verified`.

## What it does not do
- No autonomous code execution on the server.
- No access to projects you're not a member of.
- No background loopback probing, no reading of local files outside explicit tool inputs.
- No third-party analytics or ad tracking.

## Your control
- **Disable** the plugin any time: `claude plugin disable phewsh` (stops all calls).
- **Rotate/revoke** your key at phewsh.com/api.
- **Request deletion** of cloud project/account data through phewsh.com or
  hello@phewsh.com.
- Remove or rotate the saved credential through Claude Code's credential controls and
  Phewsh's API-key controls. Disabling the plugin stops calls but should not be treated as
  proof that the host deleted a stored credential.

## Auth roadmap
The preview uses bearer auth (your API key). OAuth 2.1 browser sign-in is planned to replace
the pasted key with a revocable grant. The compatible client-registration method (DCR,
CIMD, or a pre-registered client) remains unchosen until the real browser proof.

## Retention status

Project records and claimed provenance are retained while the cloud project/account is
active. Account/project deletion is currently request-based. The exact operational timing
for deletion from primary storage and backups, generation-usage records, and inactive
one-way key-hash rows is not yet published; official directory submission remains gated on
finalizing and deploying that retention schedule. Raw API keys are never stored server-side.

Questions or data requests: **hello@phewsh.com**.
