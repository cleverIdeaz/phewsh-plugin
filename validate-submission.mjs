import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// This validator runs in two homes: the phewsh monorepo (plugin/ subdir) and
// the public cleverIdeaz/phewsh-plugin mirror (repo root). Plugin-packet checks
// always run; checks that read monorepo server source / site pages / handoffs
// run only when those files exist (i.e. in the monorepo).
const pluginDir = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(pluginDir, "..");
const inMonorepo = existsSync(resolve(monorepoRoot, "intent/app/supabase/functions/mcp/tools.ts"));
const read = (path) =>
  path.startsWith("plugin/")
    ? readFileSync(resolve(pluginDir, path.slice("plugin/".length)), "utf8")
    : readFileSync(resolve(monorepoRoot, path), "utf8");
const json = (path) => JSON.parse(read(path));

const manifest = json("plugin/.claude-plugin/plugin.json");
const marketplace = json("plugin/.claude-plugin/marketplace.json");
const readiness = json("plugin/submission/readiness.json");
const chatgptSubmission = json("plugin/submission/chatgpt-app-submission.json");
const openai = read("plugin/submission/OPENAI.md");
const pluginDocs = ["plugin/README.md", "plugin/SETUP.md", "plugin/PRIVACY.md", "plugin/CHANGELOG.md"]
  .map(read)
  .join("\n");

assert.equal(manifest.name, "phewsh");
assert.equal(manifest.version, marketplace.version);
assert.equal(manifest.version, marketplace.plugins[0].version);
assert.equal(manifest.defaultEnabled, false);
assert.equal(manifest.userConfig.api_key.sensitive, true);
assert.equal(marketplace.plugins.length, 1);
assert.equal(marketplace.plugins[0].name, "phewsh");

const skills = ["resume-project", "plan-with-context", "finish-session", "create-handoff", "reconcile", "realtime"];
for (const skill of skills) read(`plugin/skills/${skill}/SKILL.md`);
assert.deepEqual(
  readdirSync(resolve(pluginDir, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(),
  [...skills].sort(),
  "submission packet must enumerate the exact skill set",
);

const expectedTools = [
  "phewsh_list_projects",
  "phewsh_get_active_context",
  "phewsh_get_changes_since",
  "phewsh_record_decision",
  "phewsh_create_handoff",
];
for (const tool of expectedTools) {
  assert.ok(openai.includes(`\`${tool}\``), `missing submission copy for ${tool}`);
}
const expectedAnnotations = {
  phewsh_list_projects: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  phewsh_get_active_context: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  phewsh_get_changes_since: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  phewsh_record_decision: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  phewsh_create_handoff: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
};
assert.equal(
  chatgptSubmission.$schema,
  "https://developers.openai.com/apps-sdk/schemas/chatgpt-app-submission.v1.json",
);
assert.equal(chatgptSubmission.schema_version, 1);
assert.equal(chatgptSubmission.app_info.display_name, "Phewsh");
assert.ok(chatgptSubmission.app_info.subtitle.length <= 30, "ChatGPT subtitle must be at most 30 characters");
assert.equal(chatgptSubmission.app_info.category, "DEVELOPER_TOOLS");
assert.deepEqual(Object.keys(chatgptSubmission.tools), expectedTools);
for (const tool of expectedTools) {
  const row = openai.match(new RegExp("^\\| `" + tool + "` \\| (true|false) \\| (true|false) \\| (true|false) \\|", "m"));
  assert.ok(row, `missing OpenAI annotation row for ${tool}`);
  assert.deepEqual(
    { readOnlyHint: row[1] === "true", openWorldHint: row[2] === "true", destructiveHint: row[3] === "true" },
    {
      readOnlyHint: expectedAnnotations[tool].readOnlyHint,
      openWorldHint: expectedAnnotations[tool].openWorldHint,
      destructiveHint: expectedAnnotations[tool].destructiveHint,
    },
    `OpenAI annotation row drifted for ${tool}`,
  );
  assert.deepEqual(
    chatgptSubmission.tools[tool].annotations,
    {
      readOnlyHint: expectedAnnotations[tool].readOnlyHint,
      openWorldHint: expectedAnnotations[tool].openWorldHint,
      destructiveHint: expectedAnnotations[tool].destructiveHint,
    },
    `ChatGPT import annotations drifted for ${tool}`,
  );
  assert.deepEqual(
    Object.keys(chatgptSubmission.tools[tool].justifications).sort(),
    ["destructive_justification", "open_world_justification", "read_only_justification"],
    `ChatGPT import justifications are incomplete for ${tool}`,
  );
}
assert.equal((openai.match(/^### Positive \d/gm) || []).length, 5);
assert.equal((openai.match(/^### Negative \d/gm) || []).length, 3);
assert.equal(chatgptSubmission.test_cases.length, 5);
assert.equal(chatgptSubmission.negative_test_cases.length, 3);
assert.deepEqual(
  chatgptSubmission.test_cases.map((testCase) => testCase.tools_triggered),
  expectedTools,
  "ChatGPT positive tests must cover each exact MCP tool once",
);
for (const testCase of chatgptSubmission.test_cases) {
  assert.equal(testCase.file_attachment_urls, null);
  assert.equal(testCase.expected_output_url, null);
}
for (const testCase of chatgptSubmission.negative_test_cases) {
  assert.equal(testCase.tools_triggered, null, "ChatGPT negative tests must not trigger Phewsh");
  assert.equal(testCase.file_attachment_urls, null);
  assert.equal(testCase.expected_output_url, null);
}
assert.equal(readiness.local_packet.status, "ready");
assert.equal(readiness.local_packet.chatgpt_submission_import, "plugin/submission/chatgpt-app-submission.json");
assert.equal(readiness.local_packet.chatgpt_submission_import_generated, true);
assert.equal(readiness.local_packet.custom_mcp_ui, false);
assert.equal(readiness.local_packet.mcp_scoped_credential_built_and_tested, true);
assert.equal(readiness.local_packet.visible_product_proof_deployed, true);
for (const gate of [
  "direct_mcp_tool_metadata_deployed_and_probed",
  "mcp_url_deployed_and_resolving",
  "oauth_metadata_discovery_deployed_and_probed",
  "origin_rejection_deployed_and_probed",
  "mcp_scoped_credential_enforced",
  "legacy_bearer_key_preserved",
  "corrected_policy_pages_deployed",
  "workspace_signed_in_live_proof",
  "public_plugin_repo_synced_to_0_1_1",
  "mcp_inspector_bearer_every_tool_proof",
  "inspector_browser_origin_allowlist_deployed_and_probed",
]) {
  assert.equal(readiness.production[gate], true, `proven production gate ${gate} must remain recorded`);
}
for (const gate of [
  "provider_browser_origin_allowlist_deployed_and_probed",
  "retention_policy_finalized_and_deployed",
  "oauth_browser_proof",
  "oauth_audience_scope_refresh_revoke_proof",
  "two_user_oauth_isolation",
  "claude_custom_connector_every_tool_proof",
  "openai_developer_mode_web_proof",
  "openai_developer_mode_mobile_proof",
  "fresh_second_provider_continuity_proof",
]) {
  assert.equal(readiness.production[gate], false, `unproven production gate ${gate} must remain explicit`);
}
for (const [gate, value] of Object.entries(readiness.human_gates)) {
  assert.equal(value, false, `human gate ${gate} must remain explicitly false until completed`);
}
assert.equal(readiness.production.target_mcp_url, "https://mcp.phewsh.com");
const originEvidence = readiness.production_evidence.canonical_mcp_origin;
assert.equal(originEvidence.url, readiness.production.target_mcp_url);
assert.match(originEvidence.probed_at, /^2026-07-19/);
assert.match(originEvidence.source_commit, /^[0-9a-f]{40}$/);
assert.equal(originEvidence.netlify_site_id, "ecaf343a-81ed-4e58-8941-14207fca6fc5");
assert.equal(originEvidence.netlify_deploy_id, "6a5d7ef2b4833c6e38284fab");
assert.equal(originEvidence.previous_netlify_deploy_id, "6a5d188ced3dbdcdf236a9fa");
assert.equal(originEvidence.supabase_mcp_function_version, 7);
assert.equal(originEvidence.handoff, "handoffs/MCP_ORIGIN_DEPLOY_2026-07-19.md");
assert.deepEqual(originEvidence.checks, {
  public_contract: "6/6",
  canonical_continuity: "12/12",
  scoped_key_authority: "10/10",
  inspector_bearer_every_tool: "6/6",
  inspector_origin_cors: "8/8",
});

for (const [name, url] of Object.entries(readiness.public_urls)) {
  assert.match(url, /^https:\/\//, `${name} must be HTTPS`);
}
assert.match(pluginDocs, /account-wide/i);
assert.match(pluginDocs, /generation gateway/i);
assert.match(openai, /OAuth\/JWT submission path/);
assert.doesNotMatch(pluginDocs, /which tool\/model/i);
assert.doesNotMatch(pluginDocs, /OAuth 2\.1 \+ dynamic client registration is next/i);

// ── Monorepo-backed checks: server source, site pages, deploy handoffs ──
if (inMonorepo) {
  const toolsSource = read("intent/app/supabase/functions/mcp/tools.ts");
  const keyPolicy = read("intent/app/supabase/functions/_shared/api-key-policy.ts");
  const keyMigration = read("intent/app/supabase/migrations/20260719010000_scoped_api_keys.sql");
  const mcpAuth = read("intent/app/supabase/functions/mcp/db.ts");
  const mcpToolAnnotations = read("intent/app/supabase/functions/mcp/tool-annotations.ts");
  const mcpIndex = read("intent/app/supabase/functions/mcp/index.ts");
  const gatewayAuth = read("intent/app/supabase/functions/chat-completions/index.ts");
  const apiPage = read("api/index.html");
  const scopedLiveCheck = read("intent/app/supabase/tests/scoped-api-key-live-check.mjs");
  const migrationSetup = read("intent/app/supabase/tests/scoped-api-key-migration-setup.sql");
  const migrationAssertions = read("intent/app/supabase/tests/scoped-api-key-migration-assert.sql");
  const originHandoff = read("handoffs/MCP_ORIGIN_DEPLOY_2026-07-19.md");
  const privacy = read("privacy.html");
  const terms = read("terms.html");

  assert.deepEqual(
    [...toolsSource.matchAll(/^\s{2}(phewsh_[a-z_]+): \{/gm)].map((match) => match[1]),
    expectedTools,
    "submission packet must enumerate the exact tool set",
  );
  const toolBlock = (name, next) => {
    const start = toolsSource.indexOf(`  ${name}: {`);
    const end = next ? toolsSource.indexOf(`  ${next}: {`, start) : toolsSource.indexOf("\n};", start);
    assert.ok(start >= 0 && end > start, `could not isolate ${name}`);
    return toolsSource.slice(start, end);
  };
  for (const [index, tool] of expectedTools.entries()) {
    const block = toolBlock(tool, expectedTools[index + 1]);
    assert.match(block, /\btitle: "/, `${tool} is missing a title`);
    assert.match(block, /\boutputSchema:/, `${tool} is missing an outputSchema`);
    for (const [hint, value] of Object.entries(expectedAnnotations[tool])) {
      assert.match(block, new RegExp(`\\b${hint}: ${value}\\b`), `${tool} has wrong ${hint}`);
    }
    assert.doesNotMatch(block, /\bidempotentHint\b/, `${tool} must not promise idempotency when the key is optional`);
  }
  assert.doesNotMatch(
    toolsSource.match(/phewsh_get_changes_since:[\s\S]*?phewsh_record_decision:/)?.[0] || "",
    /\.select\([^\n]*source_session_id/,
    "generic change-ledger reads must not return stored session identifiers",
  );
  for (const value of [
    originEvidence.source_commit,
    originEvidence.netlify_site_id,
    originEvidence.netlify_deploy_id,
    originEvidence.previous_netlify_deploy_id,
    originEvidence.url,
  ]) {
    assert.ok(originHandoff.includes(value), `canonical-origin handoff is missing evidence ${value}`);
  }
  assert.doesNotMatch(privacy, /hello@recipeflower\.com/);
  assert.doesNotMatch(terms, /hello@recipeflower\.com/);
  assert.match(privacy, /claimed provenance/);
  assert.match(terms, /does not grant remote desktop control/);
  assert.match(keyPolicy, /purpose === "legacy_all" \|\| purpose === required/);
  assert.match(keyMigration, /CHECK \(purpose IN \('legacy_all', 'gateway', 'mcp'\)\)/);
  assert.match(keyMigration, /ALTER COLUMN purpose SET DEFAULT 'gateway'/);
  assert.match(keyMigration, /CREATE TRIGGER api_keys_guard_legacy_purpose/);
  assert.match(keyMigration, /CREATE OR REPLACE FUNCTION rotate_scoped_api_key/);
  assert.match(keyMigration, /SECURITY DEFINER/);
  assert.match(mcpAuth, /apiKeyAllows\(keyRow, "mcp"\)/);
  assert.match(mcpAuth, /authKind: "api_key"/);
  assert.match(mcpAuth, /authKind: "supabase_jwt"/);
  assert.match(mcpToolAnnotations, /authKind === "api_key" && annotations\.readOnlyHint/);
  assert.match(mcpIndex, /toolList\(principal\.authKind\)/);
  assert.match(toolsSource, /outputSchema: def\.outputSchema/, "tools/list must expose each tool outputSchema");
  assert.match(gatewayAuth, /apiKeyAllows\(keyRow, "gateway"\)/);
  assert.match(apiPage, /Phewsh MCP Connector Key/);
  assert.match(apiPage, /purpose: 'mcp'/);
  assert.match(apiPage, /rpc\/rotate_scoped_api_key/);
  assert.match(scopedLiveCheck, /MCP-only key is rejected before paid generation parsing/);
  assert.match(migrationSetup, /Represents a real key that predates scoped credentials/);
  assert.match(migrationAssertions, /PASS scoped API-key migration SQL/);
}

console.log("PASS plugin submission packet");
console.log(`PASS ${skills.length} skills · ${expectedTools.length} tools · 5 positive + 3 negative tests`);
console.log("PASS all 5 tools declare outputSchema for successful structured results");
console.log("PASS unresolved production and human gates remain explicit");
console.log(
  inMonorepo
    ? "PASS monorepo server-source cross-checks"
    : "SKIP monorepo server-source cross-checks (standalone mirror — run from the monorepo for full validation)",
);
