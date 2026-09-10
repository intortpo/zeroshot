# ADR 0004: Node Studio Refinement, DevContainer Integration & Petri Zero Identity

## Status
Accepted

## Context
The visual DAG workflow engine previously surfaced prototype labels ("PySpur Studio") and toy sample workflows rather than production-grade developer management pipelines. Furthermore:
1. Workflow template switching was unresponsive due to component instance reuse and rigid execution handlers.
2. Nodes could not be edited or deleted interactively on the canvas or inspector.
3. The codebase required branding unification under **Petri Zero**, removing outdated references to "The Open Engine Co." and legacy namespace markers.

## Decision
1. **Rebranding**: Rebranded visual surface to **Node Studio** and updated repository product identity to **Petri Zero**.
2. **Interactive Node Editing & Cascade Deletion**:
   - Added in-place editing for title, sublabel/directive, role, node type, model engine, prompt templates, python scripts, and evaluator assertions.
   - Added instant node deletion on both canvas cards and inspector with automatic cascade cleanup of all connected Bezier edges.
3. **Template Switching & Dynamic Execution**:
   - Keyed `PySpurNodeCanvas` by `workflow.id` to guarantee clean viewport remount and re-centering on pipeline template swap.
   - Replaced hardcoded prompt execution with a polymorphic pipeline runner (`handleExecutePipeline`) that runs topological DAG execution for all pipelines while preserving MoE gating synthesis for the architectural planner.
4. **Dev Management "Happy Middle Ground"**:
   - Replaced toy samples with 5 production developer management pipelines:
     - Full-Stack Dev Loop (MoE)
     - Agentic Coder & Test Grader Loop
     - DevContainer Python Coder Loop
     - Evaluator & Benchmark Suite
     - RAG Knowledge Retrieval Pipeline
     - Human-in-the-Loop Release Gate
   - Integrated "Sync Goal" bridge to load active objectives directly from the Goal Orchestration Graph.

## Consequences
- Clean separation between Macro Goal Orchestration (Graph) and Micro DAG Execution (Node Studio).
- Operators can author, edit, test, and delete nodes dynamically within isolated DevContainers.
- All builds verified cleanly via `npm run build` and `cargo check`.
