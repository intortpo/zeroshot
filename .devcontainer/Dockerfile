FROM mcr.microsoft.com/devcontainers/python:1-3.11-bookworm

# Install base utilities, build-essential, curl, pkg-config, libssl-dev, git
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        build-essential \
        curl \
        git \
        libssl-dev \
        pkg-config \
        ca-certificates \
        sqlite3 \
        libsqlite3-dev \
        ripgrep \
        fd-find \
        jq \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Rust toolchain
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable \
    && rustup component add clippy rustfmt \
    && chmod -R a+w $RUSTUP_HOME $CARGO_HOME

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install Python packages for PySpur agent workflows
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    requests \
    httpx \
    numpy \
    pytest \
    pydantic \
    rich \
    python-dotenv

WORKDIR /workspace

# Set default command
CMD ["bash"]
