---
name: plan-with-context
description: Use before proposing a plan, roadmap, or approach for a project tracked in Phewsh — when the user says "plan", "how should we approach X", "what's next", or asks you to design work. Grounds the plan in current project truth and recent decisions instead of guessing.
---

# Plan with context

A plan is only as good as the context under it. Pull the project's real state before you propose one.

## Steps

1. **Find the project.** If you don't already have the `project_id` from this session, call `phewsh_list_projects` and match the current repo.
2. **Load context.** Call `phewsh_get_active_context`. Read three things closely:
   - **Next** — the `next` artifact and any open next-steps in the latest handoffs. Your plan should advance these, not reinvent them.
   - **Record** — `recent_decisions`. A decision already made is a constraint, not an open question. Don't re-litigate what the record settled.
   - **Vision / plan** — so your proposal fits what the project is actually for.
3. **Reconcile map vs territory.** Cloud context can lag local `.intent/` and the working tree (see the `freshness.note`). Where they disagree, trust the repository and say so. Prefer verified state over the summary.
4. **Propose, tied to the record.** Present the plan and, for each step, name the decision or next-item it serves. Flag anything that would contradict an existing decision — that's a change to surface, not to make silently.
5. **Offer to record the direction.** If planning produces a real decision (a chosen approach, a dropped option), offer to write it with `phewsh_record_decision` so the next session inherits it. See the `finish-session` and `create-handoff` skills.

## Why this exists

Planning from stale assumptions is how two AI tools take a project in two directions. Planning from the shared record keeps them aligned.
