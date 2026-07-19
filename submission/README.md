# Phewsh submission packet

This directory is the factual, copy-ready packet for provider submission forms. It does
not claim that a provider has reviewed Phewsh, that OAuth works, or that
`mcp.phewsh.com` is deployed.

## Distribution lanes

| Lane | Local package | External state |
| --- | --- | --- |
| Self-hosted Claude Code plugin | Public 0.1.0 works today; the 0.1.1 release candidate adds the truthful packet and live-proven MCP-only credential path. | Sync/tag 0.1.1. No provider review is required for self-hosting. |
| Anthropic Plugin Directory | The open-source package, listing materials, deployed scoped credential path, and reviewer instructions are prepared. | Sync 0.1.1, confirm eligible Claude organization/role, complete security/attestation gates, then submit. |
| Claude.ai custom connector | The five-tool remote MCP contract and durable-origin proxy are built. | Deploy `mcp.phewsh.com`, finish OAuth, and test every tool in Claude. |
| Anthropic Connectors Directory | Copy, tool matrix, fixture, and review instructions are locally prepared in [ANTHROPIC.md](./ANTHROPIC.md). | Production MCP/OAuth, reviewer account, provider attestations, and portal submission remain. |
| OpenAI plugin with MCP | Copy, prompts, exactly five positive and three negative tests, and annotation justifications are prepared in [OPENAI.md](./OPENAI.md). | Production MCP/OAuth, domain challenge, Developer Mode web/mobile tests, verified identity, reviewer account, and portal submission remain. |

The machine-readable state is [readiness.json](./readiness.json). Run
`node plugin/validate-submission.mjs` from the monorepo root before syncing or
submitting.

## Shared production facts

- Product: **Phewsh**
- Publisher: **Phewsh** (must match the provider-verified identity)
- Website: `https://phewsh.com`
- Documentation: `https://phewsh.com/platform`
- Visible product proof: `https://phewsh.com/intent/app` — deployed and live-proven signed
  in at desktop and mobile widths against the real Phewsh ledger.
- Privacy: `https://phewsh.com/privacy.html`
- Terms: `https://phewsh.com/terms.html`
- Support: `https://github.com/cleverIdeaz/phewsh-plugin/issues`
- Support email: `hello@phewsh.com`
- Suggested square icon source: `assets/PhewshYinYang.png` (1234 × 1234 PNG)
- Target production MCP origin: `https://mcp.phewsh.com` — **not deployed or proven yet**
- App UI: none in the provider MCP package. `/intent/app` is the separate public
  Workspace proof; do not upload it as an MCP App screenshot or claim a ChatGPT widget.

## Shared connector promise

Phewsh carries user-owned project truth across AI tools. A connected client can load a
bounded Project · Next · Work · Record snapshot, inspect the append-only change ledger,
and record a proposed or observed decision, or a proposed handoff, with claimed provenance. It cannot execute code,
control a desktop, access projects outside the signed-in user's membership, or mark an
AI-authored write as human-approved or repository-verified.

## Shared reviewer fixture

Create one dedicated review account outside this repository. It must work without MFA,
SMS, email confirmation, a private network, or additional setup. Seed exactly one project
named **Phewsh Reviewer Demo** with:

- vision, plan, and next artifacts that each contain short, non-sensitive demo text;
- one `observed` agent decision and one `proposed` agent decision seeded through the MCP
  write tool with non-sensitive demo text;
- one proposed handoff with two next steps;
- at least three ordered ledger events and a non-zero revision;
- no source code, credentials, personal data, or customer content.

The account credential and real project id belong only in provider secret fields, never in
Git. Re-run all cases after seeding and immediately before submission.

## Non-negotiable external gates

1. Preserve the deployed direct-Supabase MCP endpoint for bearer-plugin compatibility;
   corrected titles/annotations, scoped auth, and rejected-Origin behavior were probed
   before 0.1.1. Future endpoint changes require the same live regression matrix.
2. Deploy and verify DNS/TLS for `mcp.phewsh.com`; a local proxy test is not production.
3. Complete OAuth 2.1 browser proof: discovery, PKCE S256, exact resource/audience,
   issuer/signature/expiry/scope validation, refresh/rotation, revocation, and rejection.
4. Configure and probe the exact browser Origins observed from each provider client
   (`PHEWSH_MCP_ALLOWED_ORIGINS`). Native absent-Origin clients work and unknown/null
   Origins already fail closed without CORS reflection; no provider Origin is guessed.
5. Add per-tool OAuth `securitySchemes` and runtime `mcp/www_authenticate` only after that
   OAuth contract is real; do not advertise a future flow to provider scanners.
6. Finalize and deploy a retention/deletion schedule covering primary storage, backups,
   usage records, claimed provenance, and inactive key-hash rows.
7. Re-run two-user isolation with ordinary OAuth credentials.
8. Test every tool in MCP Inspector and Claude custom connectors; test all OpenAI cases in
   ChatGPT Developer Mode on web and mobile.
9. Create the reviewer account, finish provider identity/role/domain gates, choose regions
   and categories, make legal attestations, then submit each directory separately.

The fresh second-provider continuity challenge and Codex proof remain valuable product
evidence, but are tracked separately from whether the MCP server meets a provider's
technical submission contract.
