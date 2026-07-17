# Phewsh — continuity layer for Claude Code

Keep one project truth across every AI tool. This plugin connects Claude Code to
your Phewsh record so a session can **resume cold, plan from real context, and
record what it learned** — and the next tool (Codex, the CLI, Ion) inherits it.

**Will the next AI know what the last one learned?** This plugin is how the answer
becomes yes inside Claude Code.

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
- **Least authority.** Reads and writes only projects you own or are a member of.
- **Honest writes.** AI-authored records are `proposed`/`observed` — never
  `human_approved` or `repo_verified`. Provenance (tool/model) is recorded server-side.
- **Key handling.** Your API key lives in the OS keychain, injected as a bearer
  header; it is never written to a settings file or committed.

## Auth roadmap

Bearer (API key / JWT) today. OAuth 2.1 + dynamic client registration is next, and
is the prerequisite for the ChatGPT and Claude Connectors Directory surfaces.

## Status

**Developer preview**, bearer auth. Not yet in a public marketplace. `claude plugin
validate --strict` passes.

## More

- **[SETUP.md](./SETUP.md)** — install & connect
- **[PRIVACY.md](./PRIVACY.md)** — what moves, what's stored, what never leaves your machine
- **[CHANGELOG.md](./CHANGELOG.md)** — versioning & update process
- **[LICENSE](./LICENSE)** — MIT

---

_This repository is a thin distribution package. It is synced from the private
[phewsh](https://phewsh.com) monorepo (`plugin/`); all backend logic lives in Phewsh
Cloud and the [phewsh CLI](https://github.com/cleverIdeaz/phewsh-cli). Open issues here;
code changes land upstream and sync down. **Developer preview** — not yet in a public
marketplace._
