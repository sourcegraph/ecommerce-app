# Dev Container Setup

The dev container provides a zero-setup development environment with all dependencies pre-installed. This is the recommended way to get started with the project.

## What's Included

The dev container comes pre-configured with:

- **Languages & Runtimes:** Python 3.13, Node.js 22 LTS
- **Package Managers:** uv (Python), npm (Node.js)
- **Build Tools:** just, git, build-essential, sqlite3
- **CLI Tools:** GitHub CLI (gh), Amp CLI
- **Python Dependencies:** All backend dependencies from pyproject.toml
- **Node Dependencies:** All frontend dependencies pre-installed
- **Playwright:** Chromium browser pre-installed for E2E testing
- **Shell:** zsh with oh-my-zsh and spaceship theme
- **VS Code Extensions:** Python, ESLint, Prettier, Playwright, Amp, and more

## Quick Start

1. **Prerequisites:**
   - Install [Podman Desktop](https://podman-desktop.io/) (or Podman CLI: `brew install podman`)
   - Install [VS Code](https://code.visualstudio.com/)
   - Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Configure VS Code for Podman:**
   Set `docker.dockerPath` in VS Code settings to `podman`:
   ```json
   {
     "dev.containers.dockerPath": "podman"
   }
   ```

3. **Open in Container:**
   ```bash
   git clone https://github.com/sourcegraph/ecommerce-app.git
   cd ecommerce-app
   code .
   ```
   Click "Reopen in Container" when prompted (or run: `Dev Containers: Reopen in Container` from command palette)

4. **Wait for Initial Build:**
   First time takes ~3-5 minutes to build the container. Subsequent starts are instant.

5. **Start Developing:**
   ```bash
   just dev    # Start both frontend and backend
   just seed   # Add sample data (optional)
   ```

## How It Works

### Pre-baked Dependencies
All dependencies are installed during the container build process:
- Python packages installed to `/opt/venvs/backend` (outside workspace)
- Node packages installed to a Docker volume at `/workspaces/app/node_modules`
- Playwright browsers installed to `/ms-playwright` volume

### Workspace Structure
Your local code is bind-mounted into the container at `/workspaces/app`, so any changes you make are immediately reflected. Dependencies are preserved in volumes to ensure correct platform binaries.

### Port Forwarding
The container automatically forwards ports to your host:
- **3001:** Frontend (Vite dev server)
- **8001:** Backend (FastAPI)

Access the app at http://localhost:3001 from your host browser.

### Shared Authentication
Amp authentication is shared from your host machine (`~/.config/amp`) so you don't need to re-authenticate inside the container.

## Troubleshooting

### `Cannot find module @rollup/rollup-linux-arm64-gnu` Error

This occurs when node_modules contains binaries for the wrong architecture (e.g., if you previously ran `npm install` on macOS, then opened the container on Linux).

**Solution:**
1. Delete the volume: `podman volume rm linea-supply-node-modules`
2. Rebuild container: Run `Dev Containers: Rebuild Container` from VS Code command palette
3. Wait for rebuild to complete

### Container Build is Slow

First build takes 3-5 minutes due to installing all dependencies. Subsequent rebuilds use layer caching and are much faster. If rebuilds are still slow:
- Check your Podman resource allocation
- Ensure you're using Podman 4.0+ which has improved build performance

### Python Virtual Environment Not Activated

The container automatically activates the Python virtual environment via environment variables in `devcontainer.json`. If you see issues:
- Open a new terminal in VS Code
- Verify `which python` shows `/opt/venvs/backend/bin/python`

### GitHub CLI Not Authenticated

GitHub CLI authentication must be done inside the container (host auth cannot be shared due to permission issues with bind mounts):
```bash
gh auth login
```

## Development Workflow

Once the container is running:

```bash
# Start services
just dev              # Interactive mode
just dev-headless     # Background mode (useful for testing)

# Add sample data
just seed

# Run tests
just test-all-local   # All tests
just test             # Backend only
just test-e2e         # E2E only

# Code quality
just check            # Backend lint + type check
just lint             # Frontend lint

# CI validation
just ci               # Run full CI pipeline locally

# View logs (for headless mode)
just logs             # Last 100 lines
just logs-follow      # Follow live logs

# Stop services (for headless mode)
just stop
```

## Container Configuration

### Volumes
- `linea-supply-node-modules`: Preserves Node.js dependencies with correct platform binaries
- `linea-supply-uv-cache`: Speeds up Python package installations
- `linea-supply-npm-cache`: Speeds up npm operations
- `/ms-playwright`: Playwright browsers

### Environment Variables
- `VIRTUAL_ENV=/opt/venvs/backend`: Python virtual environment path
- `PATH`: Includes virtual environment bin directory
- `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`: Playwright browser location

## Customization

### Adding VS Code Extensions
Edit `.devcontainer/devcontainer.json` and add extensions to the `customizations.vscode.extensions` array.

### Adding System Dependencies
Edit `.devcontainer/Dockerfile` and add packages to the `apt-get install` commands.

### Modifying Python/Node Versions
Edit the `FROM` line in `.devcontainer/Dockerfile` for Python version, and the NodeSource setup script for Node.js version.

## Why Dev Containers?

**Pros:**
- Zero local installation (just Podman + VS Code)
- Consistent environment across all platforms (Mac, Linux, Windows)
- No conflicts with other projects or system packages
- Pre-installed dependencies for instant startup
- Isolated from host system
- Rootless container support with Podman

**Cons:**
- Requires Podman Desktop or Podman CLI
- First build takes a few minutes
- ~2-3 GB disk space for image + volumes
- May have file watching performance differences on some systems

## Alternative: Local Installation

If you prefer to install dependencies directly on your host machine, see the [Local Installation section in the main README](../README.md#option-2-local-installation).
