# Amp Demo App

This repository is a carefully crafted demo that showcases the capabilities of Amp, centered around an example e-commerce platform featuring a FastAPI backend and a React frontend. Data is stored in SQLite, so it is self-contained and easy to run.

For more information about Amp visit the [Amp manual](https://ampcode.com/manual).

<img width="1290" height="1016" alt="Screenshot 2025-10-03 at 12 32 11 PM" src="https://github.com/user-attachments/assets/214b7e59-8168-446b-adef-bd481b586d64" />

## How to use this repo

Follow the [Quick Start](#quick-start) guide to get started. Once the front and back ends are running (with the `just dev` command), then you can open your browser on one side of the screen with Amp up on the other (in VS Code or the CLI).

See the [DEMO.md](DEMO.md) for more information about how to effectively use this repo for an array of different demo purposes ranging from issue to PR to advanced feature adds.

## Project Structure

```
.
├── .devcontainer/      # VS Code Dev Container configuration
├── .github/            # GitHub workflows and CI configuration
├── backend/            # FastAPI backend
│   ├── app/            # Application source code
│   ├── tests/          # Backend tests
│   ├── alembic/        # Database migrations
│   ├── pyproject.toml  # Python dependencies (managed by uv)
│   ├── pytest.ini      # Test configuration
│   ├── main.py         # FastAPI entry point
│   ├── AGENTS.md       # Agent documentation for backend
│   └── store.db        # SQLite database file
├── frontend/           # React frontend (TypeScript/Vite)
│   ├── src/            # React components and pages
│   │   ├── api/        # API client and types
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React Context providers
│   │   ├── hooks/      # Custom React hooks
│   │   ├── mockDB/     # Mock data for development
│   │   ├── pages/      # Page-level components
│   │   └── theme/      # Chakra UI theme configuration
│   ├── e2e/            # Playwright E2E tests
│   ├── public/         # Static assets
│   ├── package.json    # Node.js dependencies
│   ├── vite.config.ts  # Vite configuration
│   ├── eslint.config.js # ESLint configuration
│   ├── AGENTS.md       # Agent documentation for frontend
│   └── playwright.config.ts # Playwright test configuration
├── specs/              # Project specifications
├── logs/               # Service logs (dev-headless mode)
├── test-results/       # Test output and reports
├── justfile            # Development automation commands
├── package.json        # Root package.json for shared dependencies
├── settings.json       # Workspace settings
├── AGENTS.md           # Agent documentation for overall project
├── DEMO.md             # Demo usage guide
└── README.md           # README
```

## Quick Start

### Option 1: Dev Container (recommended)

The fastest way to get started! No local installation beyond Podman required. If you encounter any errors, get the logs and feed them into Amp to help resolve. If that doesn't work, please ask an SE.

**What you need:**

If you have any of these preinstalled, make sure to update them before proceeding!

- VS Code [download](https://code.visualstudio.com/download)
  
- Amp VS Code extension and/or CLI [download](https://ampcode.com/install)
  
- Podman Desktop ([download](https://podman-desktop.io/))
  - Once installed, open it up and follow through the prompts to install `podman`
  - When you get to the [virtual machine](https://podman-desktop.io/docs/podman/creating-a-podman-machine) setup, make sure you dedicate at least 4 cores and 10gb of RAM
  - Once installed and ready, you should see this in your Mac menu bar:
    <img width="233" height="124" alt="image" src="https://github.com/user-attachments/assets/bf18d324-e182-496d-91a3-696b05c3dbd7" />
    
- VS Code [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

- Change the VS Code setting: `"dev.containers.dockerPath": "docker"` to `"dev.containers.dockerPath": "podman"`
  - Access settings in VS Code: <img width="316" height="276" alt="image" src="https://github.com/user-attachments/assets/4ae8e373-3d92-45ae-a9e5-ef59c25c0aa0" />  
  - Type in the search box `dev.containers.dockerPath`
  - Change the box "Dev > Containers: Docker Path" from `docker` to `podman`: <img width="462" height="100" alt="image" src="https://github.com/user-attachments/assets/48673050-6f63-4760-bb54-4af7cc83242c" />

- Homebrew (optional if you want to install the GitHub CLI) `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- GitHub CLI `gh` (optional) if you would like to reference issues, push PRs, etc. directly from Amp `brew install gh`

**Code Setup:**

- Open VS Code
- Ensure VS Code Amp extension and/or Amp CLI are authenticated. You might need to authenticate the first time you bring up the devcontainer.
- Open the terminal:
  <img width="281" height="57" alt="image" src="https://github.com/user-attachments/assets/c8f9f2b3-36e0-42ed-915a-71321c3a42cc" />
- Enter the command below:

```bash
git clone https://github.com/sourcegraph/ecommerce-app.git
```

- From File -> Open Folder, open the `ecommerce-app` folder in VS Code: <img width="296" height="181" alt="image" src="https://github.com/user-attachments/assets/85ffef79-a913-4ed1-850f-cdffadec5d0c" />

- Authenticate to GitHub (optional)

```bash
gh auth login
```


- Click the remote window menu in the lower left corner:
  <img width="360" height="131" alt="image" src="https://github.com/user-attachments/assets/e1635d07-9162-4126-b889-6c0a40d4753a" />
- In the menu that pops up, select "Reopen in Container":
  <img width="624" height="274" alt="image" src="https://github.com/user-attachments/assets/07d17a3d-0101-4eeb-93dc-08c53ead9926" />
- Wait a few minutes, the first build takes a few minutes, then it will be cached and near instant in the future

- To start the demo app instances, either open the terminal and run `just dev` or ask Amp to `start all services in the background`

Access the application on your local browser (ports will automatically be forwarded):

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:8001](http://localhost:8001)

**Reverting Changes**

As you work with this repo, you can revert any changes made by selecting all files changed and discarding them (indicated by a number showing in the source control sidebar:

<img width="49" height="153" alt="image" src="https://github.com/user-attachments/assets/11c34995-cfca-4395-8fa5-cadacb048d6f" />

The most foolproof way to reset is to delete the entire `ecommerce-app` repo and run `git clone https://github.com/sourcegraph/ecommerce-app.git` again.

**Demo Flow**

Once your setup is working and you can see the UI on [http://localhost:3001](http://localhost:3001). Go to the [DEMO.md](DEMO.md) page to learn about the different demo modules to use.

In the future, to use this repo, just open VS Code, open the `ecommerce-app` folder, and click "Reopen in Container," and you should be ready to go.

**What's Included in the Dev Container**

Python 3.13, Node.js 22, all dependencies, Playwright browsers, GitHub CLI, Amp CLI, and all VS Code extensions pre-configured.
Amp is set to run in Autonomous mode (most non-destructive commands allowed by default) with Playwright MCP
Internal cost display is **disabled**.

See [.devcontainer/README.md](.devcontainer/README.md) for detailed documentation and troubleshooting.

### Option 2: Local Installation

For direct installation on your host machine:

1. [Install Amp](https://ampcode.com/) (VS Code extension and/or CLI)

2. Install the prerequisites and clone the project:

```bash
# Install homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install just
brew install just

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Install python
uv python install 3.13 --default

# Install node
brew install node

# Install gh CLI and authenticate
brew install gh
gh auth login

# Install direnv for toolboxes to work
brew install direnv
```

```bash
# Verify you have the required tools
source $HOME/.local/bin/env
just --version
python --version
uv --version
node --version
direnv --version
```

```bash
git clone https://github.com/sourcegraph/ecommerce-app.git
cd ecommerce-app
```

3. Install dependencies and setup testing:

```bash
just install-all      # Install all dependencies (backend, frontend, E2E browsers)
```

4. Run the application:

```bash
just dev             # Start both services with native hot-reload using concurrently
```

Access the application:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001

## Development Commands

### Lifecycle Commands

```bash
just dev              # Start both services (native hot-reload, interactive)
just dev-headless     # Start both services in background (for agentic development)
just stop             # Stop headless services
just dev-backend      # Start only backend
just dev-frontend     # Start only frontend
```

### Seed Database

```bash
just seed             # Populate database with sample data (only needed if database changes)
```

### Manual Development (individual services)

Install dependencies (if not already done):

```bash
just install-all      # All dependencies (backend, frontend, E2E browsers)
```

Run services individually (if needed):

```bash
just dev-backend      # Start only backend
just dev-frontend     # Start only frontend
```

### Testing & Quality

#### Setup E2E Testing (Required First Time)

```bash
just setup-e2e        # Install Playwright browsers
```

#### Running Tests

```bash
# Backend tests
just test-local                        # Backend tests
just test-cov-local                    # Backend tests with coverage
just test-local-single TEST            # Run single test

# E2E tests (Playwright)
just test-e2e         # E2E tests (headless)
just test-e2e-headed  # E2E tests (headed - for debugging)

# Combined test suites
just test-all-local   # All tests (backend + E2E)
```

**Note:** Frontend has no unit tests - only E2E tests with Playwright that test the full application.

#### Code Quality

```bash
# backend
just check            # Run linting (ruff) and type checking (mypy)
just format           # Format backend code

# frontend
just lint             # Lint frontend TypeScript
```

#### Pre-Push Validation (Recommended)

Before pushing to CI, ensure all checks pass locally to avoid CI failures:

```bash
# One-time setup (if not done already)
just install-all      # Install all dependencies

# Run complete CI pipeline locally
just ci               # Runs: lint, tests, build, e2e (mirrors CI exactly)
```

`just ci` runs the exact same checks as the GitHub Actions CI pipeline:

1. **Backend Quality**: Ruff linting + MyPy type checking
2. **Backend Tests**: Full test suite with coverage
3. **Frontend Quality**: ESLint + TypeScript build
4. **E2E Tests**: End-to-end Playwright tests

### Build & Deployment

```bash
just build            # Build frontend for production
cd frontend && npm run build  # Alternative frontend build
```

### Database Management

```bash
just reset-db         # Reset SQLite database
just db-shell         # Open SQLite CLI
just migrate-create "message"  # Create new migration
just migrate-up       # Apply migrations
just migrate-down     # Rollback migration
```

### Monitoring & Debugging

```bash
just health           # Check service health
just logs             # View last 100 lines from backend and frontend logs
just logs-follow      # Follow both logs live (Ctrl+C to exit)
```

**Headless Development Workflow:**  
When using `just dev-headless` for agentic development, services run in the background and log to `logs/backend.log` and `logs/frontend.log`. Use `just logs` to inspect output and `just stop` to stop the services.

### Source

Based on the [ecommerce-demo repo](https://github.com/ViaxCo/ecommerce-demo).
