# Changelog

All notable changes to the Phewsh Claude Code plugin. This project uses
[semantic versioning](https://semver.org). The `version` in
`.claude-plugin/plugin.json` is authoritative — Claude Code delivers an update to
users only when that version is bumped (an unversioned plugin would treat every
commit as a new release).

## Versioning & update process
- **Patch** (0.1.x): copy/skill wording, doc fixes — no behavior change.
- **Minor** (0.x.0): new skills, new tools, changed MCP config or userConfig.
- **Major** (x.0.0): breaking changes to how users connect or authenticate
  (e.g. bearer → OAuth).
- Bump `version` in `plugin.json`, add an entry here, tag `phewsh--v<version>`
  (`claude plugin tag`), then publish. Users update with `claude plugin update phewsh`.

## [Unreleased]
### Planned
- OAuth 2.1 + dynamic client registration (replaces the pasted API key with a
  browser sign-in and a revocable grant). Tracked in the main repo's OAuth slice.

## [0.1.0] — 2026-07-17 — developer preview
### Added
- Five continuity skills: `resume-project`, `plan-with-context`,
  `finish-session`, `create-handoff`, `reconcile`.
- Remote MCP server (`phewsh`) with the five-tool continuity contract.
- Bearer auth via a `sensitive` `userConfig.api_key` → `Authorization` header.
- `defaultEnabled: false` — connects to an external service only after you opt in.
- SETUP.md, README.md, PRIVACY.md, LICENSE (MIT).

### Status
Developer preview on bearer auth. Not yet in a public marketplace. `claude plugin
validate --strict` passes.
