# ADR 0007: Petri Server & Petri SmartShield Container Management Architecture

## Status
Accepted

## Context
Self-hosted cloud orchestration and container management within Petri Zero requires a robust, zero-trust infrastructure plane inspired by modern self-hosted servers. The platform needed:
1. Native Docker container orchestration (start, stop, restart, inspect logs, remove, prune unused containers and volumes) interacting directly with the local Docker daemon socket (`/var/run/docker.sock`).
2. An integrated zero-trust security suite (**Petri SmartShield**) offering dynamic rate limiting, anti-bot protection, anti-DDoS mitigations, 2FA/Passkey enforcement, automated SSL termination, and real-time IP reputation protection.
3. Dynamic reverse proxy and routing (**Petri Proxy**) capable of managing routes (`/`, `/api`, `/preview`, `/devcontainer`) to container targets with optional SmartShield zero-trust gating.
4. A curated 1-click application marketplace (**Petri Market**) to launch popular AI infrastructure, databases, and microservices (e.g. Ollama LLM Host, PostgreSQL 16, Redis 7, ChromaDB Vector DB, MinIO S3 Object Storage, Nginx).
5. Strict complete rebranding: all occurrences of external server names are completely replaced by **Petri** (Petri Server, Petri SmartShield, Petri Market, Petri Proxy, Petri Cloud), adhering strictly to the user requirement with zero occurrences of the previous name anywhere in the codebase.

## Decision
We implemented the **Petri Server & Petri SmartShield** ecosystem across both native Rust and frontend layers:

1. **Strict Rebranding to Petri**:
   - Every surface, component, type, command, and UI element is branded **Petri**.
   - Verified 0 occurrences of previous server name across the repository.

2. **Native Rust IPC Bridge (`openengine-mesh/src-tauri/src/petri_server.rs`)**:
   - `get_petri_server_status`: Returns host system metrics (RAM, CPU, container count, uptime, version).
   - `list_petri_containers`: Queries `/var/run/docker.sock` via `docker ps -a --format {{json .}}` to return real Docker container states, falling back gracefully to mock containers if Docker is absent.
   - `manage_petri_container`: Executes atomic Docker control actions (`start`, `stop`, `restart`, `rm`).
   - `get_petri_container_logs`: Streams stdout/stderr logs from containers with tail limits.
   - `get_petri_routes` & `save_petri_route`: Manages Petri Proxy route entries and target mappings.
   - `toggle_petri_smartshield`: Toggles and saves SmartShield security flags.
   - `get_petri_market_apps` & `install_petri_market_app`: Handles catalog retrieval and 1-click Docker run deployment of marketplace services.

3. **Petri Server Reactive Service (`openengine-mesh/src/services/petriServerService.ts`)**:
   - Exposes reactive observables and async actions with desktop Tauri IPC dispatch and browser mock fallbacks.
   - Integrates with `tierService.ts`, ensuring only `superadmin` and `control` tiers hold `canManageServer` authority.

4. **Petri Server Control Center (`PetriServerView.tsx`)**:
   - 5 dedicated operational tabs:
     - **Overview & SmartShield**: Live health gauges and 6 toggleable zero-trust defenses (Anti-Bot, Anti-DDOS, Rate Limiting, 2FA, SSL, Geo/IP Block).
     - **Containers**: Container grid with state indicators, image tags, port mappings, action buttons, and live log inspection drawer.
     - **Reverse Proxy & Routes**: Petri Proxy rules table with dynamic route creation modal.
     - **Petri Market**: 1-click deployment store for Ollama, PostgreSQL, Redis, ChromaDB, MinIO, and Nginx.
     - **Storage & Volumes**: Volume inspection and disk reclamation pruning.

5. **Container Orchestration Manifest (`docker-compose.yml`)**:
   - Defined `petri-server` service mounting `/var/run/docker.sock` and exposing ports 80, 443, and 4040 with persistent volume configurations.

## Consequences
- **Self-Hosted Autonomy**: Petri Zero is now a complete self-hosted cloud platform capable of managing its own microservices, sandboxes, and AI host containers.
- **Enterprise Zero-Trust Defense**: Petri SmartShield protects against malicious traffic, abuse, and unauthenticated ingress out-of-the-box.
- **Cohesive Identity**: The application maintains 100% unified naming under **Petri Zero**.
