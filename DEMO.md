# Amp Demo Guide

Below is a menu of "demo blocks" to show off different aspects of Amp in action. Pick and choose from this menu to build the proper demo for each customer based on their interests/objectives and meeting time constraints.

Demo blocks are organized by estimated demo time, ranging from 5 to 30 minutes per block.

## Table of Contents

- [Prerequisites](#prerequisites)
- [IDEs and CLI](#ides-and-cli)
  - [IDE diagnostics](#ide-diagnostics)
- [5 Minute Quick Demos](#5-minute-quick-demos)
  - [Quick Visual Change](#quick-visual-change)
  - [Codebase Understanding](#codebase-understanding)
  - [PR Review Bot](#pr-review-bot)
  - [Non-Interactive Mode](#non-interactive-mode)
  - [Thread management](#thread-management)
    - [VS Code thread management](#vs-code-thread-management)
    - [CLI thread management](#cli-thread-management)
- [10 Minute Demos](#10-minute-demos)
  - [Bug Fix - Issue to PR](#bug-fix---issue-to-pr)
  - [Oracle Deep Analysis Questions](#oracle-deep-analysis-questions)
    - [Architecture Review](#architecture-review)
    - [Security Analysis](#security-analysis)
    - [Performance Planning](#performance-planning)
    - [Testing Strategy](#testing-strategy)
    - [Complex Debugging](#complex-debugging)
  - [AGENTS.md Structure](#agentsmd-structure)
  - [Custom Slash Commands](#custom-slash-commands)
    - [Codebase Cleanup](#codebase-cleanup)
  - [Pre-Commit Review](#pre-commit-review)
  - [Debugging with Amp Shell **CLI only**](#debugging-with-amp-shell-cli-only)
- [15 Minute Demos](#15-minute-demos)
  - [New Feature Implementation](#new-feature-implementation)
  - [Sourcegraph MCP](#sourcegraph-mcp)
- [30 Minute Demos](#30-minute-demos)
  - [Complex Multi-Currency Feature with Subagents](#complex-multi-currency-feature-with-subagents)
  - [Error Handling Modernization](#error-handling-modernization)


## Prerequisites

Follow the [README Quick Start Guide](README.md#quick-start) (we recommend you follow option 1, using dev containers)

## IDEs and CLI

You can use each demo block in either the Amp VS Code extension or with the Amp CLI in any terminal application or IDE terminal pane. Blocks tagged **VS Code Only** or **CLI Only** denote that the feature is specific to that Amp method.

The Amp CLI can run in any terminal application or within IDE terminal panes, such as VS Code, IntelliJ IDEA, and Neovim (these are the IDEs with which we have integrations). If running the CLI in VS Code or Neovim, use the `amp --ide` flag on the first launch to make Amp IDE aware, meaning it will:

- View current file and selected code — Amp can see which files are open and what code you have selected
- Direct file editing — Reading and writing files through your IDE with full undo support
- Diagnostics integration — Access to build errors and IDE insights

### IDE diagnostics

Amp will automatically read IDE diagnostics while implementing a feature or fixing a bug, you don't need to do any configuration here. Just point this out to the user: Amp reads IDE diagnostics, fixes issues/autocorrect problems as they appear.

Amp will use diagnostics when using the VS Code extension or using the Amp CLI in a supported IDE's terminal pane.

<img width="648" height="529" alt="Screenshot 2025-09-18 at 11 56 52" src="https://github.com/user-attachments/assets/793c1008-41ac-43c4-a734-8124e565c153" />

---

## 5 Minute Quick Demos

### Quick Visual Change

This is a minimal viable demo used to introduce Amp and begin building an understanding of Agentic tools. This is not a realistic scenario where a developer would reach for Amp. It is helpful to start here with developers who are new to Agentic tools and then move to more advanced demos. It is also helpful if you are severely time-constrained.

1. Amp prompt: `start the frontend and backend in the background`
2. Show [localhost:3001](http://localhost:3001) white background
3. Amp prompt: `Make the background light blue instead of white`
4. Reload [localhost:3001](http://localhost:3001) light blue background

---

### Codebase Understanding

This is a quick way to show off how developers use Amp to get up to speed on a new codebase or relearn a section of the codebase they haven't worked in for a while. This example requires Amp to understand across the front end, back end and database.

Amp prompt:

```
Explain how the image processing is done for this project. Provide a summary, single diagram, detailed explanation so I can see the full lifecycle from ingestion to serving up in the frontend.
```

**[Thread](https://ampcode.com/threads/T-ade7f12c-3283-4e01-b4f0-eabe75765774)**

---

### PR Review Bot

Reviewing code is a common outer loop task that almost every team has to grapple with, but is often seen as toil. Amp is useful as a code review agent that automatically takes a first pass to reduce the amount of work a human needs to do, and it often flags potential issues that humans may have otherwise missed.

Show an existing PR: [PR #36](https://github.com/sourcegraph/ecommerce-app/pull/36)

This code review agent runs automatically on PR creation.

---

### Non-Interactive Mode

This is a quick way to show how to use Amp non-interactively, when you don't need to see the thread/intermediate results, just the result.

Make sure you have the CLI installed and are in the root of the `ecommerce-app` directory.

Execute the following commands to show the audience that you can invoke Amp to run programmatically or in a script.

```bash
cat package.json | amp -x "What dependencies need updating and why?"
```

**[Thread](https://ampcode.com/threads/T-5198c420-d00c-416a-98fa-477ad0609de6)**

---

### Thread management

#### VS Code thread management

Show how easy a developer can manage multiple threads in VS Code. Make sure you are on a thread in VS Code that already has some messages and active the command palette with `CMD + Shift + A`.

Most of the "general commands" shown in the screenshot in red are used to create and move between threads.

The "custom / commands" shown in the screenshot in blue are the custom commands saved within this project under `.agents/commands/`, you can also put them in a user directory for use across projects in `~/.config/amp/commands/`. More information in the [Custom slash commands demo block](#custom-slash-commands).


#### CLI thread management

Show how easy a developer can manage multiple threads via CLI. Type `amp threads` to show all threads, then type `amp threads --help` to show the different thread subcommands:

```
  threads      [alias: t] Manage threads
    new        [alias: n] Create a new thread
    continue   [alias: c] Continue an existing thread
    fork       [alias: f] Fork an existing thread
    list       [alias: l] List all threads
    share      [alias: s] Share a thread
    compact    [alias: co] Compact a thread
    markdown   [alias: md] Render a thead as markdown
```

Also show from instead an existing thread you can use `/` commands to do a lot of these same actions.

Explain the different options, talk about:

- How you can continue an old thread `amp t c <thread_ID>`
- Fork an existing thread, and this will let you try out different approaches with Amp
- Compact a really large thread
- Set thread visibility. All threads are visible within a workspace by default.

It is also worth continuing and old thread and discussing how you use `tab` and `shift+tab` to navigate through previous prompts, and then `e` or `r` to edit that message, or restore to that point in the thread.

---

## 10 Minute Demos

### Bug Fix - Issue to PR

**Problem:** Duplicate items appearing in the "Fastest Delivery" sort

**Solution:** Ask Amp to investigate the issue, find a solution, verify tests pass and push a PR

1. Amp prompt: `start frontend and backend in the background`
2. Show the bug (sorting by "Fastest Delivery", duplicate items show up) at [localhost:3001](http://localhost:3001)
3. Amp prompt:

```
Fix bug https://github.com/sourcegraph/amp-demo/issues/35 in a new branch, test and validate changes, ci checks must all pass. Then create a pull request
```

4. Show the fix (no duplicates show up) at [localhost:3001](http://localhost:3001)

**[Thread](https://ampcode.com/threads/T-d3e778f1-914d-46e3-a8a8-a9f077946010) | [Branch](https://github.com/sourcegraph/amp-demo/tree/fix/duplicate-items-fastest-delivery)**

<img width="1446" height="627" alt="image" src="https://github.com/user-attachments/assets/e31d03ff-35d5-4017-8468-87e547da8e28" />

---

### Oracle Deep Analysis Questions

Each of these prompts demonstrates how beneficial using the Oracle (high reasoning model) can be to accomplish certain common tasks around architecture, security, performance, etc. Enter one of the prompts below into Amp or open one of the pre-linked threads.

#### Architecture Review

```
Consult the oracle to review the current API architecture in the backend and suggest improvements for scalability. Focus on the database models, endpoint design, and error handling patterns.
```

**[Thread](https://ampcode.com/threads/T-f6a3a19d-1766-4173-94fd-06895e4a8b20)**

---

#### Security Analysis

```
Consult the oracle to analyze and identify potential security vulnerability issues. Recommend best practices for addressing each of the identified issues.
```

**[Thread](https://ampcode.com/threads/T-f9e4b068-cccc-40b3-82fb-26d82674f837)**

---

#### Performance Planning

```
Consult the oracle to plan an optimization strategy for this e-commerce platform to handle 10,000+ concurrent users. Consider database indexing, caching layers, and frontend performance.
```

**[Thread](https://ampcode.com/threads/T-921c6d31-1e8b-4596-894f-4b72cad2fb85)**

---

#### Testing Strategy

```
Consult the oracle to review the current testing strategy across backend and frontend. Analyze test coverage gaps and suggest improvements for better reliability.
```

**[Thread](https://ampcode.com/threads/T-2f1d1605-1d84-415d-a44c-f3f2b624ed52)**

---

#### Complex Debugging

```
There are intermittent race conditions in the order processing workflow when multiple users try to purchase the same item simultaneously. Consult the oracle to debug and plan a solution.
```

**[Thread](https://ampcode.com/threads/T-19e1a15b-27af-46ec-aadd-fe463a256f1d)**

---

### AGENTS.md Structure

- [Root AGENTS.md](AGENTS.md)
- [backend/AGENTS.md](backend/AGENTS.md)
- [frontend/AGENTS.md](frontend/AGENTS.md)

**[Best practices](https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/agent-file/Best_Practices.md) | [Sourcegraph example](https://github.com/sourcegraph/sourcegraph)**

---

### Custom Slash Commands

In VS Code: open the Amp command palette `CMD + Shift + A` to see all of the built in + custom commands.
In the CLI: start `amp`, type `/` to see all of the built in + custom commands.

The two custom slash commands in the project are stored in `.agents/commands/`.

- `/clean` - Codebase cleanup
- `/code-review-local` - Local review

#### Codebase Cleanup

1. Show the [contents of the custom command](https://github.com/sourcegraph/ecommerce-app/blob/main/.agents/commands/clean.md)
2. Execute the `/clean` command
3. Show the results of Amp's work

Updates deprecated code, removes dead code, improves quality.

**[Thread](https://ampcode.com/threads/T-55c288eb-319d-44dd-ab89-400e79a0bce4)**

---

### Pre-Commit Review

1. Checkout a branch with a new feature implemented `feature/featured-carousel`

```
git checkout feature/featured-carousel
```

2. Show the [contents of the custom command](https://github.com/sourcegraph/ecommerce-app/blob/main/.agents/commands/code-review-local.md)
3. Execute the `/code-review-local` command
4. Show the results of Amp's work

**[Thread](https://ampcode.com/threads/T-e6546b2c-a8ae-489d-9132-3a7982fd4784)**

---

### Debugging with Amp Shell **CLI only**

The CLI has a `$` mode which allows for shell commands to be run with the output put in the context window so Amp can address errors there directly (versus needing to copy and paste). It is good to point out that `$$` runs commands also but does NOT put the output in the context window.

1. Run `amp` in the terminal
2. Run local backend tests `$just test-local`
3. Amp prompt: `Fix these failures so the tests pass`
4. Point out Amp fixed and verified the fix by running the test suite

**[Thread](https://ampcode.com/threads/T-ee9a2da8-0048-479d-8ecb-19edd94739cf)**

---

## 15 Minute Demos

### New Feature Implementation

This demo illustrates a common multi-step plan and execution paradigm when working on a substantive change. First, we consult the oracle to generate a detailed plan, then the human reviews/tweaks it, and finally, Amp executes the changes with a feedback loop.

**Problem:** The current featured product banner is not engaging and doesn't cycle through products.  
**Solution:** We want Amp to create a carousel to highlight products, making it more interactive and responsive, based on a feature spec written in a [GitHub issue](https://github.com/sourcegraph/amp-demo/issues/38).

1. Amp prompt: `start frontend and backend in the background`
2. Show the current state of the product carousel at [localhost:3001](http://localhost:3001)
3. Amp prompt:

```
Implement feature https://github.com/sourcegraph/amp-demo/issues/38 in a new branch. Consult the oracle to create a step by step implementation plan with code references, code snippets and explanations. Save this plan as NEW_FEATURE.md
```

4. Show reviewing the markdown and making human tweaks
5. Amp prompt:

```
Execute the @NEW_FEATURE.md plan, test and validate. CI checks must all pass. Then create a pull request.
```

6. Show the new feature at [localhost:3001](http://localhost:3001)
7. Show the new PR on GitHub (click the direct PR link in the `gh` command run or go to the [PR list here](https://github.com/sourcegraph/ecommerce-app/pulls)). Note the code review bot automatically runs and makes suggestions.

**[Thread](https://ampcode.com/threads/T-fee44ba4-ea71-48af-8144-e84de8063b8c) | [Branch](https://github.com/sourcegraph/ecommerce-app/tree/feature/featured-carousel)**

---

### Sourcegraph MCP

The [Sourcegraph MCP server](https://sourcegraph.com/docs/api/mcp) is an excellent way for existing Code Search to leverage their investment there and efficiently search across repos from Amp. It supports token and OAuth-based authentication, but Amp only supports token-based at this time.

This example doesn't specifically involve code in this repo; it's more about Amp using Sourcegraph MCP to search across multiple repos and identify cross-repo issues.

1. Show the MCP server registered in Amp in the VS Code extension settings or `/settings` in the CLI.

```json
"sourcegraph": {
    "url": "https://demo.sourcegraph.com/.api/mcp/v1",
    "headers": {"Authorization": "token sgp_your-token-here"},
    "transport": "http"
}
```

2. Amp prompt

```
Use the Sourcegraph MCP to find everywhere log4j is used across our repos and identify ones susceptible to this vulnerability: https://logging.apache.org/security.html#CVE-2021-45105

Once found, do not code but come up with a plan to remediate the issues.
```

**[Thread](https://ampcode.com/threads/T-70ef55e4-d390-42b5-b611-ff2d298e5272)**

---

## 30 Minute Demos

### Complex Multi-Currency Feature with Subagents

This advanced demo show implementing a large feature with a plan and execute phase, where the execution is done with several subagents concurrently.

**Problem:** This site only supports USD but we have international customers  
**Solution:** Have Amp add support for the most popular currencies to expand our potential customer base

**Planning Step**

Amp prompt:

```
Use Oracle to evaluate how to add the following feature and generate a step by step implementation plan with code references and snippets for:

Add currency localization for international customers, the current default is USD $.

Add GBP, EURO, AUD, Mexican Peso, Japanese Yen, and auto-populate the correct currency conversion based on the latest FX rates.

Save this plan in MULTI_CURRENCY_PLAN.md
```

**Execution Step**

Amp prompt:

```
Implement multi-currency support using Oracle's plan in @MULTI_CURRENCY_PLAN.md, using sub-agents
```

**[Thread](https://ampcode.com/threads/T-bcaec5de-87d9-4fc9-a498-bf4bfed807bc) | [Branch](https://github.com/sourcegraph/ecommerce-app/tree/feature/multi-currency-support)**

**Highlights:**

- Plan first, tweak/steer, then execute with feedback loops
- Subagents work in parallel (backend + frontend + caching)
- Independent context windows for each subagent

<img width="346" height="317" alt="image" src="https://github.com/user-attachments/assets/fcd4dd7b-5303-47c2-b8af-8883a685b1ad" />

---

### Error Handling Modernization

**Problem:** Front and back ends have inconsistent errors without the ability to trace requests
**Solution:** Use Amp to refactor the error handling and logging used throughout the project according to corporate standards.

1. Show the [company error spec](specs/ERROR_HANDLING_AND_LOGGING_STANDARDS.md)
2. Amp prompt:

```
Our production logs are really hard to debug, we can't trace requests from frontend to backend, and error handling is inconsistent across the app.

We have specs/ERROR_HANDLING_AND_LOGGING_STANDARDS.md that defines our company standards. Consult the oracle to plan how to modernize this repos codebase to comply with these standards. Make sure to augment the existing tests and add new tests as needed (backend and e2e).

Once you have a plan, implement the changes, ensure all tests pass, and make sure CI checks pass (linting, type checking, etc.) Then make a concise commit summarizing the changes.

Lastly, summarize the changes made an consistency improvements.
```

**[Thread](https://ampcode.com/threads/T-0156f467-52ed-47cb-a1fc-59b8d26b5beb) | [Branch](https://github.com/sourcegraph/ecommerce-app/tree/error-logging-modernization)**

---
