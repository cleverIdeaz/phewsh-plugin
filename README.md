# Phewsh — one project truth across Claude Code, Codex, and every AI tool

Keep one project truth across every AI tool. Phewsh is the continuity layer above
Claude Code, Codex, Cursor, Gemini, and more; **this package is its Claude Code
adapter.** It connects Claude Code to your Phewsh record so a session can
**resume cold, plan from real context, and record what it learned** — and the
next tool (Codex, the CLI, Ion) inherits it from the same record.

**Will the next AI know what the last one learned?** This adapter is how the
answer becomes yes when the tool is Claude Code; the matching adapters do it for
Codex and the rest.

## Install

See **[SETUP.md](./SETUP.md)**. Short version: get an API key at
[phewsh.com/api](https://phewsh.com/api), install the plugin, enable it, paste the
key when prompted, approve the `phewsh` MCP server. Every connection door
(CLI, Claude Code, Claude.ai custom connector, ChatGPT, Codex) is documented at
**[phewsh.com/connect](https://phewsh.com/connect)**.

## OpenAI Build Week 2026 — what was extended, and by whom

**The problem.** Every AI vendor is building a walled workspace. Your project's
truth fragments across tools that can't read each other, and every new session
starts with re-explaining the project.

**Pre-existing work (before Build Week).** Phewsh already existed as a local
continuity system: the open-source [phewsh CLI](https://github.com/cleverIdeaz/phewsh-cli)
(MIT, on npm since June 2026), the project-owned `.intent/` file format, native
context projections (`CLAUDE.md`, `AGENTS.md`, …), skills/hooks for terminal
harnesses, and the Intent web app. That layer worked, but only locally.

**The Build Week extension (July 14–21, 2026).** Real cross-environment
interoperability: the five-tool remote MCP contract deployed at
`https://mcp.phewsh.com` (revision-guarded writes, provenance labels,
membership-scoped reads), scoped MCP-only credentials, the OAuth 2.1 stack
(discovery, dynamic client registration, hosted consent), **Ion** — the live
workspace at [phewsh.com/ion](https://phewsh.com/ion) that renders the shared
record with per-vendor attribution in realtime — and this plugin itself, so
Claude Code, ChatGPT, Codex, and the CLI all read and write one record.

**How Codex was used (concrete, dated).** Codex worked as a genuine
co-implementer through Phewsh's own handoff loop: it authored the
`codex/unified-auth` glue series (~35 commits, merged to `main` July 17) —
unified auth, the adapter contract, handoff verification, and readiness
doctoring; it connected to the deployed MCP contract as a live client and its
proposed decisions/handoffs are in the production ledger with `openai`/Codex
attribution (July 19 — visible in Ion's Record view today); and the Codex CLI
is configured against `mcp.phewsh.com` as an MCP server. When Codex hit a usage
limit mid-build, the work continued in another harness *from the Phewsh record
itself* — the product's thesis, exercised on its own development.

**How GPT-5.6 was used.** GPT-5.6 in ChatGPT served as the standing product
architect and verifier: it designed the three-gate release split, wrote the
demo-integrity contract (nothing simulated, nothing staged), set the
submission-hardening requirements this repository follows, and repeatedly
narrowed the implementation against overclaiming. It is also in the runtime
loop: ChatGPT connecting through this MCP contract (OAuth + consent + live
`phewsh_list_projects` / `phewsh_record_decision` tool calls, proven on screen
July 21) is GPT-5.6 reading and writing the shared record.

**Test it without rebuilding (judges).**
1. **Zero install:** open [phewsh.com/ion](https://phewsh.com/ion) and sign in —
   the live record with cross-vendor attribution. Reviewer credentials are
   provided in the submission form.
2. **ChatGPT:** add `https://mcp.phewsh.com` as a developer connector (OAuth is
   auto-discovered), then prompt *"Use the Phewsh plugin to list my Phewsh
   projects."*
3. **Claude Code:** the three install commands above with a free key from
   [phewsh.com/api](https://phewsh.com/api).

**Platforms & limitations.** Developed and tested on macOS; the CLI runs where
Node 18+ runs. The ChatGPT public listing and the Anthropic Plugin Directory
listing are both **submitted and pending review** — until then, use the
developer-connector and self-hosted-marketplace paths above, which are live.
Claude.ai/Desktop connect via a custom connector (a Claude plan feature, not
available on every tier).

## Components

| Skill | Fires when | Uses |
|---|---|---|
| `resume-project` | start of session, "where were we" | list_projects → get_active_context → get_changes_since |
| `plan-with-context` | before proposing a plan | get_active_context |
| `finish-session` | wrapping up, before `/exit` | record_decision + create_handoff |
| `create-handoff` | "write a handoff", switching tools | create_handoff |
| `reconcile` | cloud disagrees with the repo | get_active_context + record_decision (supersedes) |

The MCP server exposes five tools: `phewsh_list_projects`,
`phewsh_get_active_context`, `phewsh_get_changes_since`, `phewsh_record_decision`,
`phewsh_create_handoff`.

## Safety model

- **Opt-in.** Ships `defaultEnabled: false` — connects to an external service only
  after you enable it.
- **Project boundary.** Reads and writes only projects you own or are a member of.
- **Honest writes.** AI-authored records are `proposed`/`observed` — never
  `human_approved` or `repo_verified`. Claimed provider/client/session signals are recorded
  as origin hints, not proof of model identity or authorship.
- **Host-controlled key handling.** Claude Code marks the value sensitive and normally
  uses the OS keychain; on hosts without one it may fall back to
  `~/.claude/.credentials.json`. The plugin never puts it in project settings or Git.
- **Scoped connector credential.** The public 0.1.1 release adds MCP-only, independently
  revocable keys with labels, optional expiry, and last-use metadata. An MCP key is rejected
  by the paid generation gateway, and no new broad key can be minted. The migration,
  gateway/MCP enforcement, `/api` issuer, expiry, revocation, and last-use behavior are
  live-proven. Pre-migration account-wide keys remain compatible until their owner replaces
  or revokes them; new plugin installs should create an MCP-only key.

## Auth roadmap

Bearer (API key / JWT) today. Production OAuth 2.1 browser sign-in is the prerequisite for
the ChatGPT and Claude connector-directory surfaces. A manually registered public Inspector
client and its exact browser Origin exist, while the authorize/consent/PKCE/token,
audience/refresh/revoke, and provider-runtime proofs remain open. DCR is off.

## Status

**Public self-hosted developer preview**, bearer auth. Installable from the Phewsh
Git marketplace and **submitted to Anthropic's Plugin Directory (pending review)**.
Not yet submitted to the Connectors Directory, which requires production OAuth.
`claude plugin validate --strict` passes.

## More

- **[SETUP.md](./SETUP.md)** — install & connect
- **[PRIVACY.md](./PRIVACY.md)** — what moves, what's stored, what never leaves your machine
- **[CHANGELOG.md](./CHANGELOG.md)** — versioning & update process
- **[submission/README.md](./submission/README.md)** — official-directory packet and
  explicit provider/human gates
- **[LICENSE](./LICENSE)** — MIT

---

_This repository is a thin distribution package. It is synced from the private
[phewsh](https://phewsh.com) monorepo (`plugin/`); all backend logic lives in Phewsh
Cloud and the [phewsh CLI](https://github.com/cleverIdeaz/phewsh-cli). Open issues here;
code changes land upstream and sync down. **Developer preview** — self-hosted distribution,
not an official provider-directory listing._
