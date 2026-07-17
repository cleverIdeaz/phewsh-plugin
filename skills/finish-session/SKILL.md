---
name: finish-session
description: Use when wrapping up a work session, before /exit, when the user says "let's stop here", "wrap up", "call it", "save where we are", or after finishing a meaningful chunk of work on a Phewsh project. Records what was decided and hands off what remains.
---

# Finish session

Close the loop so the next session — or the next tool — doesn't start cold. Two writes: the decisions you made, and the handoff for what's left.

## Steps

1. **Confirm the project.** Reuse the `project_id` from this session, or call `phewsh_list_projects` to find it.
2. **Record real decisions.** For each genuine decision made this session — a chosen approach, a dropped option, a ruling — call `phewsh_record_decision` with a plain-words `body` that captures *what* and *why*.
   - Leave `verification_status` at its default `proposed`, or use `observed` for something you saw happen. **Never claim `human_approved` or `repo_verified`** — the server rejects those from an AI writer by design, and it would be a lie about who verified it.
   - Pass an `idempotency_key` (e.g. a short slug for the decision) so a retry doesn't double-write.
   - Don't record trivia. One session usually has zero to three real decisions. Routine edits are not decisions.
3. **Write one handoff.** Call `phewsh_create_handoff` with:
   - `title` — a one-line "where we are".
   - `summary` — what happened, **what you verified** (with the evidence), and what remains unknown or unfinished. Be honest about failures and skipped steps.
   - `next_steps` — an ordered list the next session can act on.
   - an `idempotency_key` so re-running finish-session updates rather than duplicates.
4. **Tell the user, plainly.** Report what you recorded and handed off in one or two sentences, so they can see the continuity layer working.

## Why this exists

*Will the next AI know what the last one learned?* This skill is how you make the answer yes: the decision record and the handoff are the memory that survives the session boundary and travels across tools.
