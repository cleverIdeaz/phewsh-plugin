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
key when prompted, approve the `phewsh` MCP server.

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
