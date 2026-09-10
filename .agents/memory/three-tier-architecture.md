# Memory: 3-Tier Architecture (SuperAdmin, Control, Consumer)

## Core Capabilities
- **SuperAdmin Tier**:
  - Full root authority.
  - Full read/write over Google SAIF 6-pillar compliance matrix and HITL gate toggles in `GovernanceView.tsx`.
  - Full provider credentials and system settings in `PetriSettings.tsx`.
- **Control Tier**:
  - Primary engineering plane.
  - Full access to Node Studio DAG pipelines, DevContainer sandboxes, live agent cognition steering, and verification gates.
  - Read-only access to SAIF governance: policy switches are blocked and logged as boundary checks.
- **Consumer Tier**:
  - Dedicated `ConsumerPortalView.tsx`:
    - Responsive device viewport preview (Desktop, Tablet, Mobile) with URL bar and visual pin feedback.
    - Consumer Assistant & Request Desk: logs consumer requests directly to the board as `kind: 'feat' | 'bug'` in stage `backlog`.
    - Plain-English product roadmap and changelog.
  - Segregated from developer plumbing via `TierBoundaryGuard.tsx`.
- **Preconfigured Personas**:
  - `usr-hideo`: Hideo (intortpo) · `superadmin`
  - `usr-elena`: Elena Rostova · `control`
  - `usr-alex`: Alex Chen · `consumer`
