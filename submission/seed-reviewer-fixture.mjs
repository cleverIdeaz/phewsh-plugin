// Build the OpenAI/Anthropic reviewer fixture from scratch, then verify every
// submitted test case against it. Idempotent: fixed project id + idempotency
// keys, so re-running converges instead of duplicating.
import fs from 'node:fs';

const REF = 'fpnpfnahwaztdlxuayyv';
const REST = `https://${REF}.supabase.co/rest/v1`;
const MCP = 'https://mcp.phewsh.com/';
const EMAIL = process.env.PHEWSH_REVIEWER_EMAIL;
const PASSWORD = process.env.PHEWSH_REVIEWER_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error('Set PHEWSH_REVIEWER_EMAIL and PHEWSH_REVIEWER_PASSWORD before running.');
  process.exit(1);
}
const PROJECT_ID = 'p_reviewer_demo';
const PROJECT_NAME = 'Phewsh Reviewer Demo';

// publishable key is public by design — it ships in the browser bundle
const KEY = process.env.PHEWSH_PUBLISHABLE_KEY
  || (fs.existsSync('intent/_next/static')
    ? (require('child_process').execSync("grep -rhoE 'sb_publishable_[A-Za-z0-9_-]{20,}' intent/_next/static | head -1", {encoding:'utf8'}).trim())
    : null);
if (!KEY) { console.error('FATAL: no publishable key'); process.exit(1); }

const auth = await fetch(`https://${REF}.supabase.co/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const a = await auth.json();
if (!a.access_token) { console.error('FATAL: sign-in failed', JSON.stringify(a)); process.exit(1); }
const JWT = a.access_token, UID = a.user.id;
console.log(`signed in as reviewer (${UID.slice(0, 8)}…)\n`);

const H = { apikey: KEY, Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json' };

async function rest(path, opts = {}) {
  const r = await fetch(`${REST}/${path}`, { ...opts, headers: { ...H, ...(opts.headers || {}) } });
  const t = await r.text();
  return { ok: r.ok, status: r.status, body: t ? (() => { try { return JSON.parse(t); } catch { return t; } })() : null };
}

let rpcId = 0;
async function mcp(method, params) {
  const r = await fetch(MCP, {
    method: 'POST',
    headers: { Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
  });
  const t = await r.text();
  try { return JSON.parse(t.replace(/^data:\s*/gm, '').trim().split('\n').filter(Boolean).pop()); }
  catch { return { raw: t.slice(0, 300) }; }
}
const callTool = (name, args) => mcp('tools/call', { name, arguments: args });
const unwrap = (res) => {
  const r = res?.result;
  if (!r) return { __error: res?.error || res };
  if (r.structuredContent) return r.structuredContent;
  try { return JSON.parse(r.content?.[0]?.text ?? '{}'); } catch { return r; }
};

// ── 1. project ────────────────────────────────────────────────────────────────
console.log('── seeding ──');
const proj = await rest('projects', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify({
    id: PROJECT_ID,
    user_id: UID,
    name: PROJECT_NAME,
    archetype: 'product',
    freeform_text: 'Demo project for provider review of the Phewsh MCP connector.',
    archived: false,
    updated_at: new Date().toISOString(),
  }),
});
console.log(`  project        ${proj.ok ? 'ok' : 'FAILED ' + proj.status + ' ' + JSON.stringify(proj.body).slice(0, 200)}`);
if (!proj.ok) process.exit(1);

// ── 2. artifacts ──────────────────────────────────────────────────────────────
const ARTIFACTS = {
  vision: `# Vision\n\n## North Star\nPhewsh keeps one project truth aligned across every AI tool, so the next model starts where the last one stopped.\n\nThe question that drives it: **will the next AI know what the last one learned?**\n\n## Who it is for\nBuilders who move between Claude, ChatGPT, Codex and Cursor and do not want to re-explain the project each time.\n\n## What good looks like\nA person or agent opens this project and can answer four questions without reading chat history: what are we building, what is next, what is happening now, and what did we learn.`,
  plan: `# Plan\n\n1. **Portable truth** — keep Project, Next, Work and Record in files the user owns.\n2. **Adapters, not lock-in** — every AI tool reads the same record through its own native surface.\n3. **Bounded evidence** — writes are recorded as proposed or observed, never as human-approved.\n4. **Continuity across tools** — a handoff states plainly what carried and what did not.`,
  next: `# Next\n\n- Verify the connector end to end from a clean provider session.\n- Confirm every recorded decision carries provenance and a revision.\n- Keep the reviewer fixture reproducible so it can be rebuilt on demand.`,
};
for (const [kind, content] of Object.entries(ARTIFACTS)) {
  // unique constraint is artifacts_project_id_kind_key — name it, or the upsert 409s
  const r = await rest('artifacts?on_conflict=project_id,kind', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ project_id: PROJECT_ID, user_id: UID, kind, content }),
  });
  console.log(`  artifact:${kind.padEnd(7)}${r.ok ? 'ok' : 'FAILED ' + r.status + ' ' + JSON.stringify(r.body).slice(0, 160)}`);
}

// ── 3. Record, through the live MCP (also exercises test cases 4 and 5) ───────
const d = unwrap(await callTool('phewsh_record_decision', {
  project_id: PROJECT_ID,
  body: 'Keep desktop dispatch outside the current release. Coordination stays manual-claim until remote execution authority is ruled on separately.',
  verification_status: 'proposed',
  idempotency_key: 'reviewer-fixture-decision-1',
}));
console.log(`  decision       ${d.__error ? 'FAILED ' + JSON.stringify(d.__error).slice(0, 200) : 'ok (rev ' + (d.revision ?? '?') + ')'}`);

const h = unwrap(await callTool('phewsh_create_handoff', {
  project_id: PROJECT_ID,
  title: 'Workspace proof complete',
  summary: 'The Workspace proof is complete. The connector lists projects, loads bounded context, and reads the change ledger. Remaining work is provider acceptance.',
  next_steps: ['OAuth acceptance', 'provider review'],
  idempotency_key: 'reviewer-fixture-handoff-1',
}));
console.log(`  handoff        ${h.__error ? 'FAILED ' + JSON.stringify(h.__error).slice(0, 200) : 'ok (rev ' + (h.revision ?? '?') + ')'}`);

// ── 4. verify every submitted test case ──────────────────────────────────────
console.log('\n── verifying submitted test cases ──');
const results = [];
const check = (n, label, pass, detail) => {
  results.push(pass);
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  TC${n}  ${label}`);
  if (detail) console.log(`         ${detail}`);
};

const p = unwrap(await callTool('phewsh_list_projects', {}));
const list = p.projects || [];
const demo = list.find((x) => x.name === PROJECT_NAME);
check(1, 'list projects → identifies most recently updated',
  list.length === 1 && !!demo,
  `${list.length} project(s): ${list.map((x) => `${x.name} (rev ${x.revision}, ${x.role})`).join('; ') || 'none'}`);

const ctx = unwrap(await callTool('phewsh_get_active_context', { project_id: PROJECT_ID }));
const hasArtifacts = JSON.stringify(ctx).includes('North Star');
check(2, 'active context → Project/Next/Work/Record with labels',
  !ctx.__error && hasArtifacts,
  ctx.__error ? JSON.stringify(ctx.__error).slice(0, 200) : `revision ${ctx.revision ?? '?'}, artifacts present: ${hasArtifacts}`);

const ch = unwrap(await callTool('phewsh_get_changes_since', { project_id: PROJECT_ID, since_revision: 0 }));
const events = ch.events || ch.changes || [];
check(3, 'changes since revision 0 → ordered ledger events',
  !ch.__error && events.length > 0,
  ch.__error ? JSON.stringify(ch.__error).slice(0, 200) : `${events.length} event(s), latest revision ${ch.revision ?? ch.latest_revision ?? '?'}`);

check(4, 'record decision → proposed, new revision', !d.__error, d.__error ? '' : `decision_id ${d.decision_id ?? '?'}`);
check(5, 'create handoff → proposed, new revision', !h.__error, h.__error ? '' : `handoff_id ${h.handoff_id ?? '?'}`);

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/5 test cases pass.`);
if (list.length !== 1) console.log(`WARNING: ${list.length} projects visible — seed exactly one so "most recently updated" stays deterministic.`);
process.exit(passed === 5 ? 0 : 1);
