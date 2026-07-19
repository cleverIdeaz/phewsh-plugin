import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(pluginDir, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const json = (path) => JSON.parse(read(path));

const manifest = json("plugin/.claude-plugin/plugin.json");
const marketplace = json("plugin/.claude-plugin/marketplace.json");
const readiness = json("plugin/submission/readiness.json");
const toolsSource = read("intent/app/supabase/functions/mcp/tools.ts");
const keyPolicy = read("intent/app/supabase/functions/_shared/api-key-policy.ts");
const keyMigration = read("intent/app/supabase/migrations/20260719010000_scoped_api_keys.sql");
const mcpAuth = read("intent/app/supabase/functions/mcp/db.ts");
const gatewayAuth = read("intent/app/supabase/functions/chat-completions/index.ts");
const apiPage = read("api/index.html");
const scopedLiveCheck = read("intent/app/supabase/tests/scoped-api-key-live-check.mjs");
const migrationSetup = read("intent/app/supabase/tests/scoped-api-key-migration-setup.sql");
const migrationAssertions = read("intent/app/supabase/tests/scoped-api-key-migration-assert.sql");
const openai = read("plugin/submission/OPENAI.md");
const pluginDocs = ["plugin/README.md", "plugin/SETUP.md", "plugin/PRIVACY.md", "plugin/CHANGELOG.md"]
  .map(read)
  .join("\n");
const privacy = read("privacy.html");
const terms = read("terms.html");

assert.equal(manifest.name, "phewsh");
assert.equal(manifest.version, marketplace.version);
assert.equal(manifest.version, marketplace.plugins[0].version);
assert.equal(manifest.defaultEnabled, false);
assert.equal(manifest.userConfig.api_key.sensitive, true);
assert.equal(marketplace.plugins.length, 1);
assert.equal(marketplace.plugins[0].name, "phewsh");

const skills = ["resume-project", "plan-with-context", "finish-session", "create-handoff", "reconcile"];
for (const skill of skills) read(`plugin/skills/${skill}/SKILL.md`);
assert.deepEqual(
  readdirSync(resolve(root, "plugin/skills"), { withFileTypes: true })
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
assert.deepEqual(
  [...toolsSource.matchAll(/^\s{2}(phewsh_[a-z_]+): \{/gm)].map((match) => match[1]),
  expectedTools,
  "submission packet must enumerate the exact tool set",
);
for (const tool of expectedTools) {
  assert.match(toolsSource, new RegExp(`\\b${tool}\\b`), `missing MCP tool ${tool}`);
  assert.ok(openai.includes(`\`${tool}\``), `missing submission copy for ${tool}`);
}
const toolBlock = (name, next) => {
  const start = toolsSource.indexOf(`  ${name}: {`);
  const end = next ? toolsSource.indexOf(`  ${next}: {`, start) : toolsSource.indexOf("\n};", start);
  assert.ok(start >= 0 && end > start, `could not isolate ${name}`);
  return toolsSource.slice(start, end);
};
const expectedAnnotations = {
  phewsh_list_projects: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  phewsh_get_active_context: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  phewsh_get_changes_since: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  phewsh_record_decision: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  phewsh_create_handoff: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
};
for (const [index, tool] of expectedTools.entries()) {
  const block = toolBlock(tool, expectedTools[index + 1]);
  assert.match(block, /\btitle: "/, `${tool} is missing a title`);
  for (const [hint, value] of Object.entries(expectedAnnotations[tool])) {
    assert.match(block, new RegExp(`\\b${hint}: ${value}\\b`), `${tool} has wrong ${hint}`);
  }
  assert.doesNotMatch(block, /\bidempotentHint\b/, `${tool} must not promise idempotency when the key is optional`);
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
}
assert.doesNotMatch(
  toolsSource.match(/phewsh_get_changes_since:[\s\S]*?phewsh_record_decision:/)?.[0] || "",
  /\.select\([^\n]*source_session_id/,
  "generic change-ledger reads must not return stored session identifiers",
);
assert.equal((openai.match(/^### Positive \d/gm) || []).length, 5);
assert.equal((openai.match(/^### Negative \d/gm) || []).length, 3);
assert.equal(readiness.local_packet.status, "ready");
assert.equal(readiness.local_packet.custom_mcp_ui, false);
assert.equal(readiness.local_packet.mcp_scoped_credential_built_and_tested, true);
assert.equal(readiness.local_packet.visible_product_proof_deployed, true);
for (const gate of [
  "direct_mcp_tool_metadata_deployed_and_probed",
  "origin_rejection_deployed_and_probed",
  "mcp_scoped_credential_enforced",
  "legacy_bearer_key_preserved",
  "corrected_policy_pages_deployed",
  "workspace_signed_in_live_proof",
  "public_plugin_repo_synced_to_0_1_1",
]) {
  assert.equal(readiness.production[gate], true, `proven production gate ${gate} must remain recorded`);
}
for (const gate of [
  "mcp_url_deployed_and_resolving",
  "browser_origin_allowlist_deployed_and_probed",
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

for (const [name, url] of Object.entries(readiness.public_urls)) {
  assert.match(url, /^https:\/\//, `${name} must be HTTPS`);
}
assert.doesNotMatch(privacy, /hello@recipeflower\.com/);
assert.doesNotMatch(terms, /hello@recipeflower\.com/);
assert.match(privacy, /claimed provenance/);
assert.match(terms, /does not grant remote desktop control/);
assert.match(pluginDocs, /account-wide/i);
assert.match(pluginDocs, /generation gateway/i);
assert.match(keyPolicy, /purpose === "legacy_all" \|\| purpose === required/);
assert.match(keyMigration, /CHECK \(purpose IN \('legacy_all', 'gateway', 'mcp'\)\)/);
assert.match(keyMigration, /ALTER COLUMN purpose SET DEFAULT 'gateway'/);
assert.match(keyMigration, /CREATE TRIGGER api_keys_guard_legacy_purpose/);
assert.match(keyMigration, /CREATE OR REPLACE FUNCTION rotate_scoped_api_key/);
assert.match(keyMigration, /SECURITY DEFINER/);
assert.match(mcpAuth, /apiKeyAllows\(keyRow, "mcp"\)/);
assert.match(gatewayAuth, /apiKeyAllows\(keyRow, "gateway"\)/);
assert.match(apiPage, /Phewsh MCP Connector Key/);
assert.match(apiPage, /purpose: 'mcp'/);
assert.match(apiPage, /rpc\/rotate_scoped_api_key/);
assert.match(scopedLiveCheck, /MCP-only key is rejected before paid generation parsing/);
assert.match(migrationSetup, /Represents a real key that predates scoped credentials/);
assert.match(migrationAssertions, /PASS scoped API-key migration SQL/);
assert.doesNotMatch(pluginDocs, /which tool\/model/i);
assert.doesNotMatch(pluginDocs, /OAuth 2\.1 \+ dynamic client registration is next/i);

console.log("PASS plugin submission packet");
console.log(`PASS ${skills.length} skills · ${expectedTools.length} tools · 5 positive + 3 negative tests`);
console.log("PASS unresolved production and human gates remain explicit");
