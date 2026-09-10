# ADR 0005: Full Governance Tab & Live Agent Cognition HUD

## Status
Accepted

## Context
Petri Zero requires strict enterprise-level security, observable invariants, and real-time transparency into autonomous agent operations. Operators needed:
1. A centralized **Governance Tab** enforcing Google SAIF (Secure AI Framework) compliance, fail-closed model boundaries, Human-in-the-Loop review gate policies, secret sanitization, and immutable event ledgers with positive JS-safe epoch timestamps.
2. A transparent, universally accessible place to inspect and interactively update the agent's **Current Working Concept** (domain ontology, working hypothesis, active invariants, target symbols) and **Live Deliberation Stream** (Chain-of-Thought reasoning turns, token consumption, cognitive phase).

## Decision
1. **Canonical Petri Orchestration Pipeline**: Unified the 6-stage software-change lifecycle (`Input Ingestion` → `Worker Synthesis in DevContainer` → `Acceptance Matrix Grader` → `Operator Review Gate` → `Self-Healing Repair Loop` → `Git CAS Squash Merge`) into the primary runnable template in Node Studio with synchronized timeline playback.
2. **Full Governance Tab (`GovernanceView.tsx`)**:
   - SAIF 6-pillar posture audit with interactive verification scanner.
   - Fail-closed model tier boundaries (Gemini 3.8 Flash High, Claude Sonnet/Opus 4.6 Thinking, Docker DevContainer).
   - Human-in-the-Loop (HITL) gate policies with dual-verifier requirements on native Rust/Tauri changes.
   - Durable audit ledger exporting verifiable receipts.
3. **Live Agent Cognition & Concept HUD (`AgentCognitionHUD.tsx` & `agentCognitionService.ts`)**:
   - Ambient header pill in `NodeMeshStatus.tsx` that pulses during active deliberation and opens a global slide-out HUD accessible across all views.
   - Active Working Concept card featuring in-place editing: operators can update the concept title, working hypothesis, active invariants, and target files.
   - Steer Agent Deliberation input allowing operators to inject thoughts directly into the agent's reasoning stream.

## Consequences
- Full cognitive transparency: operators always see what the agent is conceptualizing and deliberating.
- Interactive steering: operators can update the agent's premise, target files, and invariants at any moment.
- Enterprise-grade compliance: SAIF 6-pillar posture verified and recorded in durable receipts.
