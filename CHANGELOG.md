# Changelog

All notable changes to the Phewsh plugin — the Claude Code adapter to Phewsh's
provider-neutral continuity layer. This project uses
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
- OAuth 2.1 browser sign-in (replaces the pasted API key with a revocable grant). The
  compatible registration method remains open until the real browser proof. Tracked in the
  main repo's OAuth slice.

## [0.1.1] — 2026-07-19 — truthful submission packet
### Changed
- Corrected public/self-hosted marketplace status and claimed-provenance wording.
- Added the copy-ready OpenAI and Anthropic submission packet with explicit production
  and human gates.
- Added exact tool annotation justifications, five positive tests, three negative tests,
  reviewer-fixture instructions, and a local submission validator.
- Aligned plugin privacy language with the public Phewsh policy.
- Added the deployment candidate for labeled, optionally expiring, independently revocable
  MCP-only credentials. The production migration, gateway/MCP enforcement, expiry,
  revocation, last-use tracking, and legacy-key preservation were live-probed before tag.
- Published the signed-in `/intent/app` Workspace as the visible Project · Next · Work ·
  Record proof, backed by the real coordination ledger rather than sample activity.
- Hardened rejected MCP browser Origins so 403 responses do not reflect an
  `Access-Control-Allow-Origin` value.

## [0.1.0] — 2026-07-17 — developer preview
### Added
- Five continuity skills: `resume-project`, `plan-with-context`,
  `finish-session`, `create-handoff`, `reconcile`.
- Remote MCP server (`phewsh`) with the five-tool continuity contract.
- Bearer auth via a `sensitive` `userConfig.api_key` → `Authorization` header.
- `defaultEnabled: false` — connects to an external service only after you opt in.
- SETUP.md, README.md, PRIVACY.md, LICENSE (MIT).

### Status
Developer preview on bearer auth. The package is distributed from Phewsh's self-hosted
public Git marketplace; no official provider directory approval is implied.
