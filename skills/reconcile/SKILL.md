---
name: reconcile
description: Use when Phewsh cloud context disagrees with the repository or with what actually happened — a stale freshness note, a decision that changed direction, a "N commits behind" drift, or the user says "reconcile", "update phewsh", "the record is out of date", "sync the truth". Brings the shared record in line with verified reality.
---

# Reconcile

When the map (cloud context) and the territory (the repo, the working tree, what you just did) disagree, the record is wrong. Fix the record — carefully, and only from verified state.

## When this fires

- `phewsh_get_active_context` returns a `freshness.note` and the artifacts look older than the working tree.
- A decision was reversed or superseded this session.
- The record claims something shipped/deployed that the repo shows as uncommitted, or vice-versa.

## Steps

1. **Establish ground truth first.** Read the repository — `git status`, `git log`, the local `.intent/` files, the actual code. **Trust the territory over the map.** Do not reconcile from memory or from the cloud summary; reconcile from what you can verify right now.
2. **Load the current record.** Call `phewsh_get_active_context` and note the `revision`. Call `phewsh_get_changes_since` if you need the event history to see where cloud and repo diverged.
3. **Write corrections as decisions.** For each divergence, call `phewsh_record_decision` with a `body` that states the corrected truth and *how you verified it* (the command, the file, the commit). Use `verification_status: "observed"` for things you directly saw; stay at `proposed` otherwise — never `human_approved`/`repo_verified`.
4. **Supersede, don't delete.** If a specific prior decision is now wrong, pass its id as `supersedes_id` so the history stays intact and auditable.
5. **Guard against races.** Pass `expected_revision` (the revision you read in step 2). A `revision_conflict` means someone else wrote in between — re-read with `phewsh_get_changes_since` and retry, don't overwrite.
6. **Don't invent authority.** You can record *proposed* corrections; you cannot mark them human-approved or repo-verified. Flag anything that needs the human's ruling in your summary instead of asserting it.

## Why this exists

A continuity layer people can't trust is worse than none. Reconciling from verified state — surfacing disagreement rather than silently merging it — is what keeps the shared record honest across tools.
