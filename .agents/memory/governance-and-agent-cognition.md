# Memory: Governance Tab & Live Agent Cognition HUD

## Key Concepts
- **Full Governance Tab**: Located at `currentView === 'governance'`, provides Google SAIF 6-pillar posture scoring, fail-closed model boundaries, HITL gate policies, and durable event ledgers.
- **Agent Cognition HUD**: An ambient, persistent component (`AgentCognitionHUD.tsx`) accessible via the "Thinking" button in the top navigation bar and embedded in the Governance tab.
- **Working Concept**: Defined by `AgentWorkingConcept` in `types.ts`, tracks the agent's active domain concept, working hypothesis, target files, active invariants, and domain terms.
- **Interactive Concept Updating & Steering**: Operators can click the edit icon on the concept card to modify the hypothesis, target files, or invariants, and use the "Steer Agent Deliberation" input to guide the agent's chain-of-thought in real time.
- **Canonical Petri Orchestration Pipeline**: Integrated into `NodeStudioView` with tabs for `Workflow Canvas`, `Petri Stages`, `Split Dual`, `Evals`, and `DevContainer`.
