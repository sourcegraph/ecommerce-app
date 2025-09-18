

# Issue to PR
## Fixing Github Issue Bug
**Purpose**
Demonstrate how you can use Amp to fix a bug from Issue to PR in one prompt
**Steps:**
- The filtering on the landing page doesn't work, show this in the UI by going to [http://localhost:3001](http://localhost:3001) and tell the a audience that you will now ask Amp to fix this Github issue.
- In VS Code or Terminal type ```Fix bug https://github.com/sourcegraph/amp-demo/issues/5 in a new branch, test and validate changes. Then create a pull request```
- While Amp is executing you can optionally show a previous [thread](https://ampcode.com/threads/T-3eaabc98-69dd-4896-8616-13b51c5f8320) that was run to fix this issue. Or you can switch to [_fix-sort-filters_](https://github.com/sourcegraph/amp-demo/tree/fix-sort-filters) branch locally and run this branch, which has the fix in case something goes wrong. 
- One its fixed the dropdown for category, shipping and sort by will be populated. And the the product list will change based on what is selected.
<img width="360" height="180" alt="Screenshot 2025-09-18 at 12 18 34" src="https://github.com/user-attachments/assets/c85c7734-3454-452f-9ee7-91229f4bc143" />

## Implementing a new feature
**Purpose**
Demonstrate how you can Amp to Issue implement a new feature from issue to PR in one prompt
**Steps:**
- The landing page is pretty barebones. We want to create a carousel to highlight products and make it more interactive adn responsive
- In VS Code or Terminal type
```
Implement feature https://github.com/sourcegraph/amp-demo/issues/4 in a new branch, test and validate changes. Then create a pull request
```
- While Amp is executing you can optionally show a previous [thread](https://ampcode.com/threads/T-38dc99a9-55cf-412a-a21d-e9df22a3f49d) that was run to for the feature. Or you can switch to [landing-page-carousel](https://github.com/sourcegraph/amp-demo/tree/feature/landing-page-carousel) branch which has changes commited. 
- The end result is a new landing pag with a nice carousel as per screenshot below:
<img width="400" height="250" alt="Screenshot 2025-09-18 at 14 38 26" src="https://github.com/user-attachments/assets/fbb85ed2-f1f5-4cb7-b646-dfe9100eb1b8" />

## PR review bot
**Purpose**
Demostrate Amp Github code review feature. 
**Steps:**
- No manual action is required to execute the PR Review bot. The bot automatically runs whenever a pull request is created.
- In your issue to PR flow, create a pull request after pushing the branch to the main repo and show the Github PR bot working automatically.
- Example PR https://github.com/sourcegraph/amp-demo/pull/7 (Note, this isn't working atm. working on getting it fixed).

## Small change - Amp demo in <2 mins 
If you want to quickly demo Amp in under 2 mins, you can make a small change like changing the website background. Steps:
- Start the website using the command 'just up'. Show that website on localhost:3001 has a white background and you will change it to light blue.
- Run this prompt ```Make the backgound light blue instead of white``` and Amp will upgrade the CSS to make background light blue.
- Restart the website; execute 'just down' then 'just up'.

# Complex subagent change with Oracle
**Purpose**
Demostrate Amp's advanced capability of Amp leveraging Oracle and subagents. Right now the web app only displays one currency. We will instruct Amp to:
- Use Oracle to analyse what changes needs to be made to add support for multiple currencies
- Use subasgents to run multiple changes simultaneously; Amp will make the backend and frontend changes in parallel, in addition to adding a new currency conversion service which comnprises of a caching layers which refreshes currency in realtime (every 1 hour).
**Steps**
- Start a new thread and invoke Oracle with the following prompt:
```
Use Oracle to evaluate how to add the following feature:

Add currency localisation for international customer, the current default is USD $. 

Add GBP, EURO, AUD, Mexican Peso, Japanese Yen and auto populate the correct currency conversion based on latest FX rates.
```
- Once Amp evaluates the changes execute the following prompt
```
 Implement multi currency support using Oracle's suggestion using sub agents
```
- This execution will take a long time as its a fairly large change, key points; highlight the use of Amp using subagents to speed up execution, each subagent has its own context window and switch over to [this thread](https://ampcode.com/threads/T-e46bc945-46ab-427d-bffc-082763f201cc) where we these prompts were executed before to walk the user through the end result if you don't want to wait for 10 mins for the thread to finish executing.
- Alternatively, there is a [multiple-currency-conversion](https://github.com/sourcegraph/amp-demo/tree/multiple-currency-conversion) branch with the solution, you can switch over to this branch and show what the end result looks like. Essentially, you have option to select currency from a dropdown on the page:
<img width="1736" height="587" alt="Screenshot 2025-09-18 at 12 56 46" src="https://github.com/user-attachments/assets/9a4ee0b6-6f27-4f6d-a81f-4f7b9985bc73" />

## Oracle Planning prompts

To demonstrate Oracle using this repo, run any of the provided prompts for the given use case.
**Think hard or Think extremely hard:**  Make it clear to the end user that Amp will increase token allocation for the Oracle tool whenever this term appears in the prompt

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
# Misc demo blocks

## IDE diagnostics
Amp will automatically read IDE diagnostics while implementing a feature or fixing a bug, you don't need to do any configuration here. Just tell the user that Amp reads IDE diagnostics and fixes issues/autocorrects any problems as they appear

<img width="648" height="529" alt="Screenshot 2025-09-18 at 11 56 52" src="https://github.com/user-attachments/assets/793c1008-41ac-43c4-a734-8124e565c153" />

## AGENTS.md / Multiple AGENTS.md
Key to emphasise that Amp needs a good AGENTS.md file instructions for optimal performance. There are 3 different AGENTS.md file in this repo:
- Master [AGENTS.md file](https://github.com/sourcegraph/amp-demo/blob/main/AGENTS.md)
- [AGENTS.md](https://github.com/sourcegraph/amp-demo/blob/main/backend/AGENTS.md) file for backend
- [AGENTS.md](https://github.com/sourcegraph/amp-demo/blob/main/frontend/AGENTS.md) file for frontend

Study our guidance on how to write a [good AGENTS.md file](https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/agent-file/Best_Practices.md) and convey the key points. Also review https://agents.md

Having hierarchial AGENTS.md structure is important for large monorepos, you can also show our own [Sourcegraph](https://github.com/sourcegraph/sourcegraph) Repo to emphasise this point.

## Testing

## MCP and tool calling
Amp can integrate with various MCP servers (remote and local), and leverage tool calling to execute commands. Amp ships with Playwright which lets it take screenshots of your browser. In the Issue to PR demo block above. Amp will validate changes using playwright. 

Additionally, install the Github CLI from [here](https://cli.github.com) and set it up using your personal Github account. So that Amp can use tool calling ability to fetch Github issues, pull your code changes and create Pull Request on Github.

// TODO update this section to use with Sourcegraph MCP to demo Amp + Sourcegraph search


# Terminal demo prompt

- CLI -x and piping -> Git history, analyse files
- Custom slash commands
- Agent shell
- Thread management
