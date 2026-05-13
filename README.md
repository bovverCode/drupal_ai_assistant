#### The app requires node.js 20.17.0 or higher.
### Dev installation:
1. Clone repository
2. Run `npm install`
3. Run `npm run build`
#### After that you can run `druppy <command>` in the terminal everywhere.

### Remaining tasks:
- [x] Do standalone cli application
- [X] Question - answer (AI)
- [x] Create a service in the closest module by name
- [ ] Writing update (analyze yesterday work) commits by my name, ask additional info (use pattern)
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

### Commands:
- `druppy chat <message>` - send a message to the AI
- `druppy service <description>` - create a Drupal service, feel free to put any description
  - `-p` - option to specify the path to the module (by default, it's looking for closest module directory)

### API configuration:
- JIRA OK list:
  - read:issue-adjustments:jira
  - read:issue-details:jira
  - read:issue-event:jira
  - read:issue-field-values:jira
  - read:issue-link-type:jira
  - read:issue-link:jira
  - read:issue-meta:jira
  - read:issue-security-level:jira
  - read:issue-security-scheme:jira
  - read:issue-status:jira
  - read:issue-type-hierarchy:jira
  - read:issue-type-scheme:jira
  - read:issue-type-screen-scheme:jira
  - read:issue-type-transition:jira
  - read:issue-type:jira
  - read:issue-type.property:jira
  - read:issue-worklog:jira
  - read:issue-worklog.property:jira
  - read:issue:jira-software
  - read:issue:jira
  - read:issue.changelog:jira
  - read:issue.property:jira
  - read:issue.remote-link:jira
  - read:issue.time-tracking:jira
  - read:issue.transition:jira
  - read:issue.vote:jira
  - read:issue.votes:jira
  - read:issue.watcher:jira
  - read:board-scope:jira-software