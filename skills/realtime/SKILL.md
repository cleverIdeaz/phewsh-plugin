---
name: realtime
description: Use when the user wants the project's live room — the shared present moment — while they keep working. Fires on "realtime", "open the room", "start the jam", "tune the room", "who's here", "put music on while I code", or when someone asks what the room is currently set to. Joins the room for a project without interrupting the work in progress.
---

# Realtime

The project's live room. It runs *alongside* whatever the person is doing — coding, chatting, reviewing — and never takes over the session.

**A room is a project.** The cloud project id is the room id. There is no separate room to create, name, or keep in sync.

## What the room is

Two layers, and the order matters:

- **The messenger** is the everyday surface. People and agents talking.
- **The present moment** is one quiet ring above it: who is actually here, and
  what the room is tuned to — root, mode, tempo, in KeyLink.

Keep that proportion. The moment is meant to be felt, not stared at.

## The boundary, which is not negotiable

Nothing in a live room is project truth.

- Presence and tuning are **ephemeral transport**. They write no rows.
- Messages **do not survive the room**. Say so if someone assumes otherwise.
- A moment enters the Record **only** when a person explicitly keeps it. Never
  keep one on their behalf, and never call a kept moment a decision unless the
  person framed it as one.

If you are asked to make the room persistent, that is a real design decision
about the truth boundary — surface it, do not just start writing rows.

## Steps

1. **Identify the project.** Reuse the `project_id` from this session, or
   `phewsh_list_projects`. The room URL is
   `https://phewsh.com/intent/live?project=<project_id>` (locally,
   `http://localhost:3000/intent/live?project=<project_id>`).
2. **Report the present moment honestly.** Who is present, and the current
   tuning. If you cannot observe the channel, say that — never describe a room
   you are not in, and never invent participants. "I can't see the room from
   here" is a correct answer.
3. **Tune only when asked, and say what you read.** Tuning speaks KeyLink, so
   any notation resolves: `Bb`, `La#`, `Sib`, `Ais`, `Do`, `10`. Always echo the
   canonical reading back — "read as A# minor" — because the point of the
   protocol is that everyone knows they landed on the same note.
4. **Fail closed on an unresolvable tuning.** Do not guess a key. Broadcasting a
   wrong tonal centre to a room is worse than changing nothing. Ask.
5. **Stay out of the way.** Return to what the person was doing. The room does
   not need narrating; a one-line status is usually the whole report.

## KeyLink readings worth knowing

The protocol has three documented ambiguities. If one comes up, say which
reading you took:

- bare **`B`** is B natural, *not* the German B-flat alias.
- **`M`** is major, **`m`** is minor — case matters for these two only.
- **`6`** / **`VI`** mean minor *and* aeolian; they resolve to minor, and the
  alternative reading is reported rather than dropped.

## Never

- Never fabricate presence, a tuning, or a listener count.
- Never promote room chatter into `.intent/` without the person asking.
- Never start audio or a stream on someone's behalf.
