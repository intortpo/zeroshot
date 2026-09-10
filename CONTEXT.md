# Domain Model & Ubiquitous Language: Petri Zero

This document defines the ubiquitous language and domain model for **Petri Zero**.

## Product Identity
- **Petri Zero**: Autonomous agentic development mesh, orchestrator graph, and multi-tier compiler for high-assurance software engineering.
- **Node Studio**: Visual DAG execution pipeline engine integrating LLMs, in-memory AST code execution, isolated DevContainer runtimes, and rubric-based assertion graders.
- **Goal Orchestration Graph**: Macro-level lifecycle tracking development objectives (Goal Input → Autonomous Worker → Acceptance Tests → Code Review Gate → Delivery / Git Merge).
- **Plan Canvas**: Synchronized interactive planning surface reflecting synthesized task plans, Kanban state, and architecture trees.

## Core Architectural Concepts

### Node Studio & Execution DAG
- **Pipeline Node**: Discrete execution unit in Node Studio. Types include `input`, `llm`, `code`, `tool`, `evaluator`, `router`, `human_approval`, `rag_retriever`, `expert`, and `output`.
- **Topological DAG Runner**: Executes nodes in dependency order computed from graph edges, passing previous node outputs as inputs via `{{node_id.output}}` variable interpolation.
- **DevContainer Runner**: Isolated container execution environment configured via `.devcontainer/devcontainer.json` and `Dockerfile`, orchestrated via native Tauri Rust IPC (`devcontainer.rs`) using non-interactive `docker exec` commands.
- **Benchmark & Evaluator Suite**: Test dataset evaluation system providing Pass@k metrics, latency, and token efficiency measurements against ground-truth rubrics.

### Mixture of Experts (MoE) Gating
- **Softmax Gating**: Dynamic weighting across 5 specialized domains:
  1. `@architect`: Invariant preservation, deep module boundaries, and ADRs.
  2. `@speculative-coder`: AST synthesis, physics loops, and core algorithmic patching.
  3. `@security-auditor`: Fail-closed boundaries, SAIF compliance, and credential protection.
  4. `@acceptance-verifier`: Isolated reproduction tests, grader loops, and pass/fail matrices.
  5. `@token-optimizer`: Context slimming, model tier selection, and cascade efficiency.

### Bridge & Handoff Invariants
- **Goal Sync**: Bi-directional bridge enabling Node Studio to ingest active objectives from the Orchestration Graph, and hand off synthesized execution plans directly to the Plan Canvas and Kanban queue.

### 3-Tier System Architecture
- **SuperAdmin Tier**: Root governance and platform authority. Manages Google SAIF compliance checks, HITL policy toggles, API provider keys, Petri Server SmartShield settings, and final Stage 6 delivery sign-off.
- **Control Tier**: Engineering and orchestration control plane. Access to Node Studio DAGs, Docker DevContainers, Petri Server container control, live agent deliberation steering, and verification gates up to Stage 5. Read-only on platform governance.
- **Consumer Tier**: Product stakeholder and client experience. Features the Consumer Portal (`ConsumerPortalView`), responsive live app previews (Agentation-style), consumer request desk, and plain-English roadmap, fail-closed against developer plumbing via `TierBoundaryGuard`.

### Petri Server & Petri SmartShield
- **Petri Server**: Self-hosted container and infrastructure management engine integrating directly with local `/var/run/docker.sock` to orchestrate services, databases, and LLM hosts.
- **Petri SmartShield**: Zero-trust edge security suite featuring anti-bot protection, dynamic rate limiting, anti-DDoS mitigations, 2FA/Passkey authentication, and automated SSL termination.
- **Petri Proxy**: Dynamic reverse proxy routing traffic from frontend URLs to containerized backend targets.
- **Petri Market**: Curated 1-click application marketplace for microservices and AI workloads (Ollama, PostgreSQL, Redis, ChromaDB, MinIO, Nginx).

