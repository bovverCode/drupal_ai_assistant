# Druppy — Drupal AI Helper

### Remaining tasks:
- [x] Do standalone cli application
- [X] Question - answer (AI)
- [x] Create a service in the closest module by name
- [x] Writing update (analyze yesterday work) commits by my name, ask additional info (use pattern)
- [ ] Analysis of changes in the current branch or specified one
- [ ] Analysis of the module
- [ ] Generate a .po file content by branch diff, check for duplicates
- [ ] Do PR review (compare the branch with the master)
- [ ] Analysis of a new task and recommendations
- [ ] Add files to gitignore (.git directory)
- [ ] Find module/file related to some phrase, file name etc
- [ ] Do Drupal update script, send a message to the AI in case of error
- [ ] Do git commit and push feature (get branch, do commit and push by pattern)
- [ ] Create a new branch from live using JIRA API, do update script (start a new task)

### Additional:
- [ ] Analyze and fix container problems (ddev)
- [ ] Introspection of functionality by keywords (agent)?
  - [ ] Give pointer links to IDE in the response to files (PHPstorm plugin?)

---

## Installation

> Requires **Node.js 20.17.0** or higher.

```bash
git clone <repo-url>
cd drupal_ai_helper
npm install
npm run build
```

After that, `druppy <command>` is available globally in your terminal.

### Python requirement

The clipboard integration uses a Python script with **PyQt5** to write both plain text and HTML to the clipboard simultaneously (native clipboard APIs in Node.js do not support rich MIME types).

> Requires **Python 3** and the `PyQt5` package.

```bash
pip install PyQt5
```

On Linux you may also need the Qt platform plugin:

```bash
sudo apt install python3-pyqt5
```

### Environment configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key |
| `GEMINI_MODEL` | Model name, e.g. `gemini-2.0-flash` |
| `JIRA_EMAIL` | Your Atlassian account email |
| `JIRA_API_TOKEN` | Your Jira API token |
| `JIRA_CLOUD_ID` | Your Jira cloud instance ID |
| `JIRA_SUBDOMAIN` | Your Jira subdomain (e.g. `mycompany` from `mycompany.atlassian.net`) |
| `BITBUCKET_EMAIL` | Your Bitbucket account email |
| `BITBUCKET_API_TOKEN` | Your Bitbucket API token |
| `BITBUCKET_WORKSPACE` | Your Bitbucket workspace slug |
| `BITBUCKET_REPOSITORY_SLUG` | Your Bitbucket repository slug |
| `DOTENV_CONFIG_QUIET` | Set to `1` to suppress dotenv loading messages |

**`GEMINI_API_KEY`** — Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey). Gemini has a generous free tier, no credit card needed.

**`JIRA_API_TOKEN`** — Generate a token at [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
> **Important:** the token must have the **classic `read:jira-work` scope** to work correctly.

**`JIRA_CLOUD_ID`** — Find it by opening this URL in your browser (replace `<my-site-name>` with your Jira subdomain):
```
https://<my-site-name>.atlassian.net/_edge/tenant_info
```
The `cloudId` field in the response is your value.

**`BITBUCKET_EMAIL`** — The email address associated with your Bitbucket account.

**`BITBUCKET_API_TOKEN`** — Generate an App Password at [Bitbucket App Passwords](https://bitbucket.org/account/settings/app-passwords/).
> **Important:** the token must have the **`read:pullrequest:bitbucket` (Pull requests: Read)** scope to work correctly.

**`BITBUCKET_WORKSPACE`** — Your workspace slug, visible in the URL when browsing your workspace:
```
https://bitbucket.org/<workspace>/
```

**`BITBUCKET_REPOSITORY_SLUG`** — Your repository slug, visible in the URL of your repository:
```
https://bitbucket.org/<workspace>/<repository-slug>/
```

---

## Commands

- `druppy chat <message>` — send a message to the AI
- `druppy service <description>` — create a Drupal service (describe what it should do)
  - `-p` — specify the path to the module (default: searches for the closest module directory)
- `druppy morning` — generate a morning Slack standup update and copy it to clipboard
  - Fetches your active Jira tasks and recent comments, then uses AI to generate a formatted HTML update ready to paste into Slack
  - Prompts for optional additional info (e.g. "will review teammates' PRs")
  - Shows a preview and asks for confirmation before copying; re-generates if rejected
  - > **Important:** run this command from your project directory — it uses `git` to retrieve recent commits, so it must be executed inside a git repository.
