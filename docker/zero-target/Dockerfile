FROM rust:1.97.0-trixie AS builder

WORKDIR /src

COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY zero ./zero

RUN cargo build --locked --release --package zero --bin zero

FROM node:22-trixie-slim AS runtime

ARG CODEX_VERSION=0.148.0
ARG CLAUDE_CODE_VERSION=2.1.237
ARG ZERO_VERSION=development
ARG VCS_REF=unknown

LABEL org.opencontainers.image.source="https://github.com/foxlight/zero-petri" \
      org.opencontainers.image.title="Zero target" \
      org.opencontainers.image.version="${ZERO_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}"

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
        bash \
        ca-certificates \
        gh \
        git \
        ripgrep \
    && git_version="$(git --version)" \
    && dpkg --compare-versions "${git_version#git version }" ge 2.47 \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --global --no-audit --no-fund \
        "@openai/codex@${CODEX_VERSION}" \
        "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
    && npm cache clean --force

COPY --from=builder /src/target/release/zero /usr/local/bin/zero
COPY docker/zero-target/entrypoint.sh /usr/local/bin/zero-target-entrypoint

# The native runtime deliberately retains root so it can isolate node processes.
# Root owns target state; execute-only access lets isolated run UIDs reach their own workspaces.
RUN install -d -m 0711 /var/lib/zero/native-v2 \
    && chmod 0755 /usr/local/bin/zero-target-entrypoint

VOLUME ["/var/lib/zero"]
EXPOSE 8080

ENTRYPOINT ["zero-target-entrypoint"]
CMD ["target", "serve", "--listen", "0.0.0.0:8080", "--public-origin", "http://127.0.0.1:8080", "--storage", "/var/lib/zero/native-v2"]
