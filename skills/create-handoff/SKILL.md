---
name: create-handoff
description: Use when the user asks to "write a handoff", "hand this off", "brief the next session", "document where we are", or when switching tools/models mid-project (Claude Code → Codex, or handing to a teammate). Writes one structured handoff to the shared record.
---

# Create handoff

A focused handoff: one structured record so whoever continues — the next session, another model, or a person — starts without re-explaining.

## Steps

1. **Find the project.** Reuse the session's `project_id`, or call `phewsh_list_projects`.
2. **Optionally check the cursor.** If you want the handoff to reflect the very latest state, glance at `phewsh_get_active_context` first — but don't block on it.
3. **Call `phewsh_create_handoff`** with:
   - `title` — a scannable one-liner ("Remote MCP slice: deployed, proofs credential-gated").
   - `summary` — three beats: **what happened**, **what was verified** (name the check and its result), **what remains** (unknowns, blocked steps, the honest gaps). A handoff that only lists wins is a bad handoff.
   - `next_steps` — an ordered, actionable list. Prefer commands and file paths over vague intentions.
   - `idempotency_key` — a stable slug so re-running updates the same handoff instead of duplicating it.
   - `expected_revision` — optional; if you read the context first, pass its `revision` to catch a concurrent write (you'll get a structured `revision_conflict` instead of clobbering).
4. **Confirm.** Tell the user the handoff is recorded and where it lives (it's readable from any phewsh-connected tool and at phewsh.com).

## Handoff quality bar

- Verified over asserted: "247/247 tests pass (ran `npm test`)" beats "tests pass".
- Name what's unknown. The next reader's first question is usually "what's *not* done?"
- Provenance is automatic — the server records which tool/model wrote this. You don't set it.
