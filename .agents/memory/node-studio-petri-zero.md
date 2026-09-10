# Node Studio & Petri Zero Memory

## Lessons Learned & Key Conventions

1. **Canvas Remounting Pattern**:
   When switching between visual DAG templates with different coordinate spaces and node sets, always provide a unique `key={workflow.id}` on the canvas component to guarantee that pan, zoom, and coordinate caches reset predictably.

2. **Cascade Edge Deletion Invariant**:
   Whenever a graph node is deleted, immediately filter `workflow.edges` where `edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId` to prevent dangling Bezier path rendering errors.

3. **DevContainer Isolation**:
   Container execution is strictly isolated in `.devcontainer` via non-interactive CLI commands (`docker exec`). The UI supports dual execution modes: `devcontainer` (real Docker runtime) and `sandbox` (safe in-memory browser simulation) ensuring zero broken states in non-container preview environments.

4. **Product Naming**:
   The application product name is **Petri Zero**. The visual DAG interface is **Node Studio**.
