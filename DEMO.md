# Demo Instructions

Below is a menu of demo blocks that you can run to show Amp in actions. Make sure you have followed [quick start instructions](README.md#quick-start) before running any of the demos.

To get setup to demo, do the following steps:

1. Download [Github Desktop](https://desktop.github.com/download/) and clone this repository locally
2. [Install](https://ampcode.com/manual#install) Amp in CLI and VS Code.
3. Copy [settings.json file](../settings.json) file to ~/.config/amp/settings.json
4. Download [Github CLI](https://cli.github.com) and [log into your Github account](https://cli.github.com/manual/gh_auth_login) by typing `gh auth login` in a terminal
5. Download latest version of Intellij IDEA Community Edition from [here](https://www.jetbrains.com/idea/download/other.html)

**Table of Contents**

Note that all blocks listed under VS Code can also be displayed in the CLI if desired.

[VS Code](#vs-code)

- [Small change: Quick Amp demo](#small-change-quick-amp-demo)
- [Issue to PR](#issue-to-pr) - [Bugfix](#fixing-github-issue-bug) and [New feature](#implementing-a-new-feature)
- [PR review bot](#pr-review-bot)
- [Understanding prompts](#understanding-prompts)
- [Oracle planning prompts](#oracle-planning-prompts)
- [Complex subagent change with Oracle](#complex-subagent-change-with-oracle)
- [IDE diagnostics and testing](#ide-diagnostics-and-testing)
- [AGENTS.md / Multiple AGENTS.md](#agentsmd--multiple-agentsmd)
- [Sourcegraph Search MCP and tool calling](#mcp-and-tool-calling)

[Amp CLI in Terminal](#amp-cli-in-terminal)

- [Amp in non-interactive mode](#amp-in-non-interactive-mode)
- [Amp in interactive mode](#amp-in-interactive-mode)
- [Thread management](#thread-management)
- [Slash commands](#slash-commands)
- [Amp shell](#amp-shell)

[Intellij IDEA](#intellij-idea)

# VS Code

## Small change Quick Amp demo

If you want to quickly demo Amp in under 2 minutes, you can make a small change, like changing the website background. Steps:

- Start the e-commerce website by entering '''start the website in the Amp command prompt'''. Show that website on [http://localhost:3001](http://localhost:3001) has a white background and you will change it to light blue.
- Run this prompt `Make the background light blue instead of white`, and Amp will upgrade the CSS to make the background light blue.
- Wait for the thread to finish executing and reload the website on [http://localhost:3001](http://localhost:3001)

## Issue to PR

### Fixing GitHub Issue Bug

**Purpose**  
Demonstrate how you can use Amp to fix a bug from Issue to PR in one prompt

**Steps:**

- There is a bug when sorting by "Fastest Delivery", duplicate items show up. Show this in the UI by going to [http://localhost:3001](http://localhost:3001) and tell the audience that you will now ask Amp to fix this GitHub issue.
- In VS Code or Terminal, type:

```
Fix bug https://github.com/sourcegraph/amp-demo/issues/35 in a new branch, test and validate changes, ci checks must all pass. Then create a pull request
```

- While Amp is executing, you can optionally show a previous [thread](https://ampcode.com/threads/T-d3e778f1-914d-46e3-a8a8-a9f077946010) that was run to fix this issue. Or you can switch to [_fix/duplicate-items-fastest-delivery_](https://github.com/sourcegraph/amp-demo/tree/fix/duplicate-items-fastest-delivery) branch locally and run this branch, which has the fix in case something goes wrong.
- Once it's fixed, only unique products will be displayed when the "Fastest Delivery" filter is chosen in the UI.

### Implementing a new feature

**Purpose**  
Demonstrate how you can use Amp to implement a new feature from issue to PR in one prompt

**Steps:**

- The current featured product banner is not engaging and doesn't cycle through products. We want to create a carousel to highlight products and make it more interactive and responsive
- In VS Code or Terminal, type:

```
Implement feature https://github.com/sourcegraph/amp-demo/issues/38 in a new branch. Consult the oracle to plan, check the plan over yourself, then once decided execute the changes, test and validate. CI checks must all pass. Then create a pull request.
```

- While Amp is executing, you can optionally show a previous [thread](https://ampcode.com/threads/T-fee44ba4-ea71-48af-8144-e84de8063b8c) that was run for the feature. Or you can switch to the [feature/featured-carousel](https://github.com/sourcegraph/ecommerce-app/tree/feature/featured-carousel) branch, which has the changes committed.
- The end result is a new carousel as per the screenshot below:
<img width="1446" height="627" alt="image" src="https://github.com/user-attachments/assets/e31d03ff-35d5-4017-8468-87e547da8e28" />



### PR review bot

**Purpose**  
Demonstrate the GitHub code review feature of Amp.

**Steps:**

- No manual action is required to execute the PR Review bot. The bot automatically runs whenever a pull request is created.
- In your issue to PR flow, create a pull request after pushing the branch to the main repo, and show the GitHub PR bot working automatically.
- Example PR <https://github.com/sourcegraph/ecommerce-app/pull/36>

## Understanding prompts

To demonstrate how Amp can be leveraged to gain codebase understanding, ask these prompts below.

For the persona of a new joiner to the team needing to get up to speed quickly. Here is an existing [thread](https://ampcode.com/threads/T-201945bc-6eda-4943-b2b2-ab954b31fa23) you can use as well.
```
I am a new software engineering member on this project team. Please create a diagram along with an explanation of the project architecture.
```

For the persona of a sophisticated software engineer who knows the code base but is rusty on a particular area. Here is an existing [thread](https://ampcode.com/threads/T-c1a00818-ada0-4789-81da-1a278677ad29) you can use as well.
```
Explain how the image processing is done for this project. Provide diagrams and detailed explanations so I can see the full lifecycle from ingestion to serving up in the frontend.
```

## Oracle planning prompts

To demonstrate Oracle using this repo, run any of the provided prompts for the given use case. Make sure to mention the oracle to ensure GPT-5 is used reliably.

Architecture Review:

```
Consult the oracle to review the current API architecture in the backend and suggest improvements for scalability. Focus on the database models, endpoint design, and error handling patterns.
```

Security Analysis:

```
Consult the oracle to analyze the authentication and authorization patterns in this e-commerce platform. Identify potential security vulnerabilities and recommend best practices for handling user data and payment processing.
```

Performance Planning:

```
Consult the oracle to plan an optimization strategy for this e-commerce platform to handle 10,000+ concurrent users. Consider database indexing, caching layers, and frontend performance.
```

Feature Planning:

```
Consult the oracle to plan the implementation of a real-time inventory management system that updates stock levels across the platform instantly when purchases are made.
```

Code Quality Review:

```
Consult the oracle to review the current testing strategy across backend and frontend. Analyze test coverage gaps and suggest improvements for better reliability.
```

Debugging Complex Issue:

```
There are intermittent race conditions in the order processing workflow when multiple users try to purchase the same item simultaneously. Consult the oracle to debug and plan a solution.
```

## Complex subagent change with Oracle

**Purpose**  
Demonstrate Amp's advanced capability of Amp leveraging Oracle and subagents. Right now, the web app only displays one currency. We will instruct Amp to:

- Use Oracle to analyze what changes need to be made to add support for multiple currencies
- Use subagents to run multiple changes simultaneously; Amp will make the backend and frontend changes in parallel, in addition to adding a new currency conversion service, which comprises a caching layer that refreshes currency in real-time (every 1 hour).

**Steps**

- Start a new thread and invoke Oracle with the following prompt:

```
Use Oracle to evaluate how to add the following feature:

Add currency localization for international customers, the current default is USD $.

Add GBP, EURO, AUD, Mexican Peso, Japanese Yen, and auto-populate the correct currency conversion based on the latest FX rates.
```

- Once Amp evaluates the changes, execute the following prompt

```
 Implement multi-currency support using Oracle's suggestion, using sub-agents
```

- This execution will take a long time as its a fairly large change, key points; highlight the use of Amp using subagents to speed up execution, each subagent has its own context window and switch over to [this thread](https://ampcode.com/threads/T-5c2a0c8d-41cf-464f-9e33-acb0040634ec) where we these prompts were executed before to walk the user through the end result if you don't want to wait for 10 mins for the thread to finish executing.
- Alternatively, there is a [multiple-currency-conversion](https://github.com/sourcegraph/ecommerce-app/tree/multiple-currency-conversion) branch with the solution, you can switch over to this branch and show what the end result looks like. Essentially, you have the option to select a currency from a dropdown on the page:
  <img width="240" height="316" alt="image" src="https://github.com/user-attachments/assets/9dbfdfcf-be5d-4133-a5e3-33f1c42556ca" />

## IDE diagnostics and testing

Amp will automatically read IDE diagnostics while implementing a feature or fixing a bug, you don't need to do any configuration here. Just tell the user that Amp reads IDE diagnostics and fixes issues/autocorrects any problems as they appear.

<img width="648" height="529" alt="Screenshot 2025-09-18 at 11 56 52" src="https://github.com/user-attachments/assets/793c1008-41ac-43c4-a734-8124e565c153" />

Similarly, Amp will do tests after making changes:

- Run local tests as part of the feature implementation/bug fix
- Do a screenshot via Playwright to validate changes and ensure that the feature has been implemented as specified

## AGENTS.md / Multiple AGENTS.md

It is key to emphasize that Amp needs a good AGENTS.md file with instructions for optimal performance. There are three different AGENTS.md file in this repo:

- Master [AGENTS.md file](https://github.com/sourcegraph/amp-demo/blob/main/AGENTS.md)
- [AGENTS.md](https://github.com/sourcegraph/amp-demo/blob/main/backend/AGENTS.md) file for backend
- [AGENTS.md](https://github.com/sourcegraph/amp-demo/blob/main/frontend/AGENTS.md) file for frontend

Study our guidance on how to write a [good AGENTS.md file](https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/agent-file/Best_Practices.md) and convey the key points. Also review <https://agents.md>

Having a hierarchical AGENTS.md structure is vital for large monorepos; you can also refer to our own [Sourcegraph](https://github.com/sourcegraph/sourcegraph) repo to emphasize this point.

### MCP and tool calling

Amp can integrate with various MCP servers (remote and local) and leverage tool calling to execute commands. Amp ships with Playwright, which lets it take screenshots of your browser. In the Issue to PR demo block above. Amp will validate changes using Playwright and use the GitHub CLI tool to create a pull request.

#### Users can add MCP servers in VS Code or the Amp CLI

- VS Code Amp plugin - to add/enable MCP servers, go to Amp settings in the IDE and enable Playwright. You can also add additional MCP servers via the settings page.
- Amp CLI - Use the example [settings.json file](../settings.json)

Additionally, install the GitHub CLI from [here](https://cli.github.com) and set it up using your personal GitHub account. So that Amp can use its tool calling ability to fetch GitHub issues, pull your code changes, and create a Pull Request on GitHub.

##### Sourcegraph MCP

Use the Sourcegraph MCP to provide Amp programmatic access to our demo.sourcegraph.com instance's code search, navigation, and analysis capabilities.

Add the block below to your VS Code/CLI settings. Ensure that you add a Sourcegraph access token to the header. In the Sourcegraph web UI, you will need to go to your profile picture -> Site Admin -> [Access tokens](https://demo.sourcegraph.com/site-admin/tokens).

```
"sourcegraph": {
    "url": "https://demo.sourcegraph.com/.api/mcp/v1",
    "headers": {
        "Authorization": "token sgp_your-token-here"
    },
    "transport": "http"
}
```

Then you can ask cross-repo questions and get code search-based answers. For example, here is a [thread searching for log4j](https://ampcode.com/threads/T-70ef55e4-d390-42b5-b611-ff2d298e5272) using this prompt:

```
Use the sourcegraph MCP to find everywhere log4j is used across our repos and identify ones susceptible to this vulnerability: https://logging.apache.org/security.html#CVE-2021-45105

Once found, do not code but come up with a plan to remediate the issues.
```

# Amp CLI in Terminal

Amp can be executed in interactive mode by typing `amp` in the terminal, or in non-interactive mode using the `-x` command flag or piping input.

## Amp in non-interactive mode

Execute the following commands to show the audience that you can invoke Amp to run programmatically or in a script.

```
# Explain that we will cat package.json file and pipe the output to Amp and Amp will figure out which packages to update
cat package.json | amp -x "What dependencies need updating and why?"
```

## Amp in interactive mode

Before you start, copy [settings.json file](../settings.json) to ~/.config/amp/settings.json

Start Amp and execute the following prompt:
`Review the authentication system and refactor it to follow better security practices, ensuring all tests still pass`

Explain that we are going to refactor the authentication system in the Amp CLI GUI.
Amp will figure out vulnerabilities, consult Oracle on how to fix and refactor code (as per screenshot).

<img width="700" height="400" alt="Screenshot 2025-09-23 at 17 00 50" src="https://github.com/user-attachments/assets/671e0bb6-3709-41aa-909c-0b2fe20346c8" />
[thread](https://ampcode.com/threads/T-47caa855-56e6-49a6-a1f6-703a5a584fd3)

This takes a while to execute, so go to this [thread](https://ampcode.com/threads/T-47caa855-56e6-49a6-a1f6-703a5a584fd3) and walk the audience through the execution.

### Thread management

While the thread is executing in the background, explain that users can manage multiple threads via CLI. Type `amp threads` to show all threads, then type `amp --help` to show the different thread subcommands:

```
  threads      [alias: t] Manage threads
    new        [alias: n] Create a new thread
    continue   [alias: c] Continue an existing thread
    fork       [alias: f] Fork an existing thread
    list       [alias: l] List all threads
    share      [alias: s] Share a thread
    compact    [alias: co] Compact a thread
```

Explain the different options, talk about:

- How you can continue an old thread `amp t c <thread_ID>`
- Fork an existing thread, and this will let you try out different approaches with Amp
- Compact a really large thread
- Set thread visibility. All threads are visible within a workspace by default.

### Slash commands

Type the `/` command and walk the audience through different slash commands, placing special emphasis on '/continue' (resuming old threads) and '/queue' (queuing messages while a thread is executing).

**Custom /slash commands**

Within the repo, there are a few custom slash commands. Execute any one of these custom commands in <repo>.agents/commands/ directory..

Hopefully, the thread we kicked off earlier has finished executing by now. You can choose to execute either one of the custom commands to show how users can configure their own custom commands. Type `amp` in the terminal to go into interactive mode and type `/` to invoke slash commands.

- `/clean`: Command will clean up the code base. Update deprecated usage, find dead code, improve code quality, etc. Explain that the command can be invoked to clean up the code base on a regular basis to avoid tech debt. See prior [thread execution here](https://ampcode.com/threads/T-55c288eb-319d-44dd-ab89-400e79a0bce4).
- `/code-review-local`: Command will do a local code review. A dev can execute this command before pushing changes upstream. See prior [thread here](https://ampcode.com/threads/T-e6546b2c-a8ae-489d-9132-3a7982fd4784).

```bash
# checkout the landing page carousel feature, ad,d and run a review on it
git checkout feature/landing-page-carousel
amp
/code-review-local
```

- `/code-review`: Example code review command that could be executed on a PR in GitHub/GitLab CI action.

### Amp shell

An amp shell is [ability](https://ampcode.com/news/through-the-agent-into-the-shell) to execute a command in an interactive TUI.

1. Type amp and execute `$just test-local`
2. There may be test failures, in which case ask Amp to fix the test failures. See this [thread for reference](https://ampcode.com/threads/T-ee9a2da8-0048-479d-8ecb-19edd94739cf).

# Intellij IDEA

Amp provides an IntelliJ plugin. When you run Amp in a terminal inside IntelliJ, it automatically installs the plugin. This allows Amp to communicate with IntelliJ via MCP, enabling it to access diagnostics data, see which files are open, and identify highlighted lines in the IDE.

Demonstrating IntelliJ is straightforward: start by running Amp in the terminal in IntelliJ, which will install the Amp plugin in IntelliJ
Then open the ecommerce-app project in IntelliJ. From there,

- You can showcase the integration; highlight how Amp interacts with the IDE—and
- Run any of the prompts on this page (bug fix or feature improvement) to demonstrate Amp’s functionality within IntelliJ.
