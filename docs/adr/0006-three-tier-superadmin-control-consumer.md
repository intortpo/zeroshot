# ADR 0006: 3-Tier Enterprise Operating Model (SuperAdmin, Control, Consumer)

## Status
Accepted

## Context
Petri Zero provides advanced autonomous and human-in-the-loop agentic capabilities, spanning Node Studio DAG editing, Docker DevContainers, live agent cognition steering, SAIF governance policies, and raw TUI shells. However, different stakeholders require radically different interfaces and security boundaries:
1. **Platform Administrators & Security Auditors** require root access to governance rules, SAIF compliance scans, API keys, and production release approvals.
2. **Core Engineers & Pipeline Operators** require access to Node Studio DAG pipelines, DevContainer sandboxes, cognition steering, and verification gates without having the ability to weaken platform-wide security policies.
3. **Non-Technical Stakeholders & Product Consumers** need to experience the live web application (Agentation-style previews), review plain-English roadmaps and release changelogs, and submit feedback or feature requests without exposure to raw code ASTs, DAG wiring, terminal shells, or security configurations.

## Decision
We implemented a first-class 3-tier operating system architecture:
1. **Tier 1: SuperAdmin (`superadmin`)**:
   - Platform, Security & Governance authority.
   - Unrestricted access to all views (`governance`, `settings`, `stats`, `node`, `graph`, `board`, `chat`, `modules`, `tui`, `consumer`).
   - Can toggle SAIF compliance policies, manage API provider keys, invite/promote user tiers, and approve Stage 6 production releases.
2. **Tier 2: Control (`control`)**:
   - Engineering & DAG orchestration plane.
   - Access to `chat`, `board`, `graph`, `node` (Node Studio), `modules` (Zero Game, Skills, Memory), `stats`, `tui`.
   - Access to `governance` is read-only: policy switches are disabled with explicit notifications indicating SuperAdmin root privileges are required.
   - Can run DevContainers, steer agent deliberation, create and edit pipeline nodes, and approve Stage 1-5 verification gates.
3. **Tier 3: Consumer (`consumer`)**:
   - Product Consumer & Stakeholder Portal (`ConsumerPortalView.tsx`).
   - Simplified top navigation showing only the Consumer Portal.
   - Three dedicated sub-tabs:
     - **Live Application Preview**: Responsive device frames (Desktop, Tablet, Mobile) with URL bar and Agentation click-to-pin visual feedback notes.
     - **Consumer Assistant & Request Desk**: Friendly conversational interface to submit feature requests, bug reports, and project inquiries, directly logging cards to the project board.
     - **Roadmap & Release Changelog**: Plain-English milestone progress, recent shipped deliverables, and uptime statistics.
   - **Tier Boundary Guard (`TierBoundaryGuard.tsx`)**: Intercepts any attempt by consumer personas to access protected developer surfaces, explaining the least-privilege boundary fail-closed.

## Consequences
- **Security & Least Privilege**: Protects sensitive environment variables, provider keys, and governance policies from unauthorized mutation.
- **Consumer Usability**: Stakeholders get an intuitive, executive-ready preview and feedback portal without technical intimidation.
- **Zero-Latency Tier Switching**: Header switcher allows immediate evaluation across all three tiers using pre-configured personas (`Hideo` - SuperAdmin, `Elena Rostova` - Control, `Alex Chen` - Consumer).
