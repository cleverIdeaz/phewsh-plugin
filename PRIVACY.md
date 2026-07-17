# Privacy & data handling — Phewsh plugin

Developer preview. This explains exactly what the plugin sends, stores, and never touches.

## What the plugin is
A thin client. All logic lives in Phewsh Cloud (a Supabase-backed remote MCP server) and
the [phewsh CLI](https://github.com/cleverIdeaz/phewsh-cli). This package contains only:
markdown skills, an MCP server URL, and a place to hold your API key. No business logic,
no analytics, no telemetry of its own.

## Your credential
- On enable, Claude Code prompts for your **Phewsh API key** (from phewsh.com/api).
- It is stored by Claude Code in your **OS keychain** (or `~/.claude/.credentials.json`
  where no keychain exists) as a `sensitive` value — **never** written to a settings file,
  never committed, never printed by the plugin.
- It is sent only to the Phewsh MCP endpoint, only as an `Authorization: Bearer` header,
  only over HTTPS.

## What data moves, and where
When a skill calls an MCP tool, the request goes to
`https://<project>.supabase.co/functions/v1/mcp` and may include:
- the **project id** you're working in,
- **decision text** and **handoff summaries** you (or the AI, on your instruction) choose
  to record,
- a **revision cursor** and **idempotency key**.

The server records **provenance** (which tool/model/session made the call) with each write.
It does **not** receive your source code, your terminal transcript, your editor buffers, or
files you didn't pass into a tool call.

## What the server stores
Your project record: intent artifacts, decisions, handoffs, and an append-only event ledger
— the same data visible at phewsh.com when you sign in. Reads and writes are scoped by
membership (row-level security): the plugin can only reach projects you own or were invited
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
- **Delete** project data from phewsh.com.
- Removing the plugin removes the key from Claude Code's secure storage.

## Auth roadmap
The preview uses bearer auth (your API key). OAuth 2.1 + dynamic client registration is next
and will replace the pasted key with a browser sign-in + revocable grant.

Questions or data requests: **hello@phewsh.com**.
