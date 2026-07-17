# Phewsh plugin — setup

The Phewsh continuity layer for Claude Code. It connects Claude Code to your
Phewsh project record so you can **resume cold, plan from real context, and hand
off what you learned** — and so the next tool (Codex, the CLI, Ion) starts from
the same page.

> One question drives all of it: *will the next AI know what the last one learned?*

## What you get

- A remote MCP server (`phewsh`) with five continuity tools: list projects, load
  active context, read the change ledger, record a decision, create a handoff.
- Five skills that drive those tools at the right moments: **resume-project**,
  **plan-with-context**, **finish-session**, **create-handoff**, **reconcile**.

## 1. Get your key

You need a Phewsh API key as the bearer credential.

- **Recommended — API key (durable):** create one at **[phewsh.com/api](https://phewsh.com/api)**.
  It's long-lived and survives a static plugin config. No CLI required.
- **Alternative — CLI (phewsh ≥ 0.15.83):** if you already use the phewsh CLI and
  are logged in, `phewsh mcp token` prints a ready-to-paste token. Note: minted
  tokens are short-lived (~1 hour) — fine for a quick test, not for a permanent
  connection. Use an API key for the plugin.

## 2. Install and enable

This plugin ships **disabled by default** because it connects to an external
service — you opt in.

```bash
# from a marketplace (once published):
claude plugin install phewsh@<marketplace>
claude plugin enable phewsh
```

On enable, Claude Code prompts for your **Phewsh API key**. Paste the key from
step 1. It's stored in your OS keychain (never written to a settings file) and
injected as the `Authorization: Bearer …` header for the MCP server.

## 3. Approve the server

MCP servers require per-server approval. Start Claude Code, and when prompted to
trust the `phewsh` server, approve it. Confirm it's connected:

```bash
claude mcp list          # phewsh should show as connected
```

## 4. Use it

Just work. The skills fire on natural phrasing:

- *"where were we on this project?"* → **resume-project** (loads your context)
- *"how should we approach X?"* → **plan-with-context** (plans from the record)
- *"let's wrap up"* → **finish-session** (records decisions + a handoff)
- *"write a handoff"* → **create-handoff**
- *"the record's out of date"* → **reconcile**

## What this plugin does and doesn't do

- **Does:** read your project truth and record *proposed* decisions and handoffs
  with provenance (which tool/model wrote each one).
- **Doesn't:** claim human approval or repo-verification on your behalf — AI
  writes are always `proposed`/`observed`. Doesn't execute code on the server.
  Doesn't touch a project you're not a member of.

## Auth status

Bearer auth (API key or Supabase JWT) is the current mechanism. **OAuth 2.1 with
dynamic client registration is on the roadmap** and is what the ChatGPT / Claude
Connectors Directory surfaces will use. This plugin will move to OAuth when that
ships; your API key keeps working in the meantime.

Questions: **hello@phewsh.com** · docs: **[phewsh.com](https://phewsh.com)**
