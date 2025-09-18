## Requirements 

### Issue to PR
#### Fixing Github Issue Bug
**Purpose**
Demonstrate how you can use Amp to fix a bug from Issue to PR in one prompt
**Steps:**
- The filtering on the landing page doesn't work, show this in the UI by going to localhost:7001 and tell the a audience that you will now ask Amp to fix this Github issue.
- In VS Code or Terminal type ```Fix bug https://github.com/sourcegraph/amp-demo/issues/5 in a new branch, test and validate changes. Then create a pull request```
- While Amp is executing you can optionally show a previous [thread](https://ampcode.com/threads/T-3eaabc98-69dd-4896-8616-13b51c5f8320) that was run to fix this issue. Or you can switch to _fix-sort-filters_ branch locally and run this branch, which has the fix in case something goes wrong. 
- One its fixed the dropdown for category, shipping and sort by will be populated. And the the product list will change based on what is selected.
<img width="364" height="194" alt="Screenshot 2025-09-18 at 12 18 34" src="https://github.com/user-attachments/assets/c85c7734-3454-452f-9ee7-91229f4bc143" />

#### Implementing a new feature
**Purpose**
Demonstrate how you can Amp to Issue implement a new feature from issue to PR in one prompt
**Steps:**
- The landing page is pretty barebones. We want to create a carousel to highlight products and make it more interactive
- In VS Code or Terminal type ```Implement feature https://github.com/sourcegraph/amp-demo/issues/4 in a new branch, test and validate changes. Then create a pull request```
- While Amp is executing you can optionally show a previous [thread](https://ampcode.com/threads/T-38dc99a9-55cf-412a-a21d-e9df22a3f49d) that was run to for the feature
  
#### PR review bot
**Purpose**
Demostrate Amp Github code review feature. 
**Steps:**
- No manual action is required to execute the PR Review bot. The bot automatically runs whenever a pull request is created.
- In your issue to PR flow, create a pull request after pushing the branch to the main repo and show the Github PR bot working automatically.
- Example PR https://github.com/sourcegraph/amp-demo/pull/7 (Note, this isn't working atm. working on getting it fixed).

#### Sub agents

### Oracle planning (human in the loop)

To demonstrate Oracle using this repo, run any of the provided prompts for the given use case.
Architecture Review:
```
Review the current API architecture in the backend and suggest improvements for scalability. Focus on the database models, endpoint design, and error handling patterns.
```
Security Analysis:
```
Analyze the authentication and authorization patterns in this e-commerce platform. Identify potential security vulnerabilities and recommend best practices for handling user data and payment processing.
```
Performance Planning:
```
Plan an optimization strategy for this e-commerce platform to handle 10,000+ concurrent users. Consider database indexing, caching layers, and frontend performance.
```
Feature Planning:
```
Plan the implementation of a real-time inventory management system that updates stock levels across the platform instantly when purchases are made.
```
Code Quality Review:
```
Review the current testing strategy across backend and frontend. Analyze test coverage gaps and suggest improvements for better reliability.
```
Debugging Complex Issue:
```
There are intermittent race conditions in the order processing workflow when multiple users try to purchase the same item simultaneously. Help debug and plan a solution.
```

### IDE diagnostics
Amp will automatically read IDE diagnostics while implementing a feature or fixing a bug, you don't need to do any configuration here. Just tell the user that Amp reads IDE diagnostics and fixes issues/autocorrects any problems as they appear

<img width="648" height="529" alt="Screenshot 2025-09-18 at 11 56 52" src="https://github.com/user-attachments/assets/793c1008-41ac-43c4-a734-8124e565c153" />

- Testing
- MCP

### AGENTS.md / Multiple AGENTS.md
  
- Security/remediation

### Terminal specific

- CLI -x and piping -> Git history, analyse files
- Custom slash commands
- Agent shell
- Thread management
