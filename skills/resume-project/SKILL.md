---
name: resume-project
description: Use at the start of a session, when resuming work after a reset or context loss, or when the user says "where were we", "catch up", "resume", "what's the status of this project", or switches to a project you don't have loaded. Hydrates cold from Phewsh cloud truth.
---

# Resume project

Start where the last session — or the last *tool* — left off, instead of re-deriving the project from scratch.

## Steps

1. **List projects.** Call `phewsh_list_projects`. Match the current repo (its name, or ask the user if ambiguous). Note the project's `id` and current `revision` (the event cursor).
2. **Hydrate.** Call `phewsh_get_active_context` with that `project_id`. Read the intent artifacts (vision / plan / next), the recent decisions, and the latest handoffs. This is the Project · Next · Record for this repo.
3. **Respect freshness.** The response carries a `freshness.note`: cloud state can lag the repo's local `.intent/`. Treat any code or release claim as a *claim* until you verify it against the working tree. Check `verification_status` on each record — `proposed`/`observed` is not `repo_verified`.
4. **Optional — what changed.** If you have a revision from a prior session and want only the delta, call `phewsh_get_changes_since` with that `since_revision`. Use `since_revision: 0` for full history.
5. **Orient, don't act.** Summarize for the user in plain words: what this project is, what the last handoff said to do next, and anything the record flags as unresolved. Then ask what they want to work on — don't start changing files off a cold read.

## Why this exists

Phewsh's one question is *"will the next AI know what the last one learned?"* Resuming through the shared record is how the answer becomes yes across Claude Code, Codex, the CLI, and Ion.
