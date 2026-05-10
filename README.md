#### The app requires node.js 20.17.0 or higher.
### Dev installation:
1. Clone repository
2. Run `npm install`
3. Run `npm run build`
#### After that you can run `druppy <command>` in the terminal everywhere.

### Remaining tasks:
- [x] Do standalone cli application
- [X] Question - answer (AI)
- [ ] Create a service in the closest module by name
- [ ] Writing update (analyze yesterday work) commits by my name, ask additional info (use pattern)
- [ ] Analysis of changes in the current branch or specified one
- [ ] Analysis of the module
- [ ] Translate nl to eng
- [ ] Do PR review (compare the branch with the master)
- [ ] Analysis of a new task and recommendations
- [ ] Add files to gitignore (.git directory)
- [ ] Find module/file related to some phrase, file name etc
- [ ] Do Drupal update script, send a message to the AI in case of error
- [ ] Do git commit and push feature (get branch, do commit and push by pattern)

### Additional:
- [ ] Analyze and fix container problems (ddev)
- [ ] Introspection of functionality by keywords (agent)?
  - [ ] Give pointer links to IDE in the response to files (PHPstorm plugin?)

### Commands:
- `druppy chat <message>` - send a message to the AI
- `druppy service <description>` - create a Drupal service, feel free to put any description
  - `-p` - option to specify the path to the module (by default, it's looking for closest module directory)