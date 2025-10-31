# syntax=docker/dockerfile:1.7
# 
# Optimized Dev Container for Linea Supply E-commerce Demo
# Pre-bakes all Python and Node.js dependencies for instant startup
#
FROM python:3.13-slim

ARG DEBIAN_FRONTEND=noninteractive

# ─────────────────────────────────────────────────────────────────
# Install base OS dependencies and CLI tools
# ─────────────────────────────────────────────────────────────────
# - git, curl, build tools: Required for building native Node/Python packages
# - sqlite3: Database CLI for inspecting store.db
# - just: Task automation (available in Debian repos)
# - procps: Provides pkill command used by 'just stop'
# - bash-completion, unzip: Developer convenience
# - zsh: Default shell with oh-my-zsh
# - jq: JSON processor for command-line
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    git \
    build-essential \
    sqlite3 \
    just \
    procps \
    bash-completion \
    unzip \
    zsh \
    jq \
 && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────────────────────────────────
# Install GitHub CLI
# ─────────────────────────────────────────────────────────────────
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
 && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
 && apt-get update \
 && apt-get install -y gh \
 && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────────────────────────────────
# Install Amp CLI
# ─────────────────────────────────────────────────────────────────
RUN curl -fsSL https://ampcode.com/install.sh | bash

# ─────────────────────────────────────────────────────────────────
# Install Sourcegraph CLI
# ─────────────────────────────────────────────────────────────────
RUN set -eux; \
    ARCH=$(dpkg --print-architecture); \
    if [ "$ARCH" = "arm64" ]; then ARCH="arm64"; \
    elif [ "$ARCH" = "amd64" ]; then ARCH="amd64"; \
    else echo "Unsupported architecture: $ARCH" && exit 1; fi; \
    curl -L "https://sourcegraph.com/.api/src-cli/src_linux_${ARCH}" -o /usr/local/bin/src \
 && chmod +x /usr/local/bin/src

# ─────────────────────────────────────────────────────────────────
# Configure git safe.directory for bind-mounted workspace
# ─────────────────────────────────────────────────────────────────
RUN git config --global --add safe.directory /workspaces/app

# ─────────────────────────────────────────────────────────────────
# Install Node.js 22 LTS via NodeSource
# ─────────────────────────────────────────────────────────────────
# Using NodeSource for official, up-to-date Node packages
RUN set -eux; \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -; \
    apt-get update && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/* \
 && npm --version && node --version

# ─────────────────────────────────────────────────────────────────
# Install uv (fast Python package manager)
# ─────────────────────────────────────────────────────────────────
# Installing to /usr/local/bin to be globally available
RUN set -eux; \
    curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local/bin sh; \
    uv --version

# ─────────────────────────────────────────────────────────────────
# Install Bun (JavaScript runtime for Amp toolbox)
# ─────────────────────────────────────────────────────────────────
RUN curl -fsSL https://bun.sh/install | bash \
 && ln -sf /root/.bun/bin/bun /usr/local/bin/bun \
 && bun --version

# ─────────────────────────────────────────────────────────────────
# Configure Python virtual environment path
# ─────────────────────────────────────────────────────────────────
# Install to /opt/venvs/backend (outside workspace) to prevent conflicts
# when workspace is bind-mounted at runtime
ENV VENV_PATH=/opt/venvs/backend
ENV PATH="${VENV_PATH}/bin:${PATH}"
ENV VIRTUAL_ENV="${VENV_PATH}"
# Use copy mode to avoid hardlink issues on bind mounts
ENV UV_LINK_MODE=copy

# ─────────────────────────────────────────────────────────────────
# Pre-bake Python dependencies
# ─────────────────────────────────────────────────────────────────
# Copy only dependency manifests to leverage Docker layer caching
# (changes to source code won't invalidate this layer)
WORKDIR /tmp/backend
COPY backend/pyproject.toml ./pyproject.toml

# Create venv and install all dependencies from pyproject.toml
# Use uv sync for project-based dependency installation
# Use BuildKit cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.cache/uv \
    set -eux; \
    uv venv "${VENV_PATH}"; \
    uv sync --python "${VENV_PATH}/bin/python" --no-install-project

# ─────────────────────────────────────────────────────────────────
# Pre-install Node.js dependencies
# ─────────────────────────────────────────────────────────────────
# Install to workspace path where volume will mount
WORKDIR /workspaces/app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ─────────────────────────────────────────────────────────────────
# Install Playwright browsers to volume path
# ─────────────────────────────────────────────────────────────────
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN mkdir -p /ms-playwright && \
    npx playwright install --with-deps chromium

# Mark node_modules as volume so it persists with correct platform binaries
VOLUME ["/workspaces/app/node_modules"]

# ─────────────────────────────────────────────────────────────────
# Install oh-my-zsh and spaceship theme
# ─────────────────────────────────────────────────────────────────
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install spaceship theme
RUN git clone https://github.com/spaceship-prompt/spaceship-prompt.git /root/.oh-my-zsh/custom/themes/spaceship-prompt --depth=1 \
 && ln -s /root/.oh-my-zsh/custom/themes/spaceship-prompt/spaceship.zsh-theme /root/.oh-my-zsh/custom/themes/spaceship.zsh-theme

# Install zsh plugins
RUN git clone https://github.com/zsh-users/zsh-autosuggestions /root/.oh-my-zsh/custom/plugins/zsh-autosuggestions --depth=1 \
 && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git /root/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting --depth=1

# Copy custom .zshrc with spaceship configuration
COPY .devcontainer/.zshrc /root/.zshrc

# ─────────────────────────────────────────────────────────────────
# Set default working directory
# ─────────────────────────────────────────────────────────────────
# Matches devcontainer.json workspaceFolder setting
WORKDIR /workspaces/app

# ─────────────────────────────────────────────────────────────────
# Keep container running for dev container
# ─────────────────────────────────────────────────────────────────
CMD ["sleep", "infinity"]
