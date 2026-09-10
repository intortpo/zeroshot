import {
  PetriServerStatus,
  PetriContainerInfo,
  PetriProxyRoute,
  PetriSmartShieldState,
  PetriMarketApp,
} from '../types';

export const DEFAULT_SERVER_STATUS: PetriServerStatus = {
  isRunning: true,
  version: '8.5.0-petri',
  engine: 'docker (Docker version 29.7.2)',
  dockerSocketConnected: true,
  hostIp: '127.0.0.1',
  uptimeSeconds: 86420,
  activeContainersCount: 6,
  smartShieldActive: true,
  sslActive: true,
  totalMemoryMb: 32768,
  usedMemoryMb: 8420,
  cpuPercent: 4.2,
};

export const DEFAULT_SMARTSHIELD_STATE: PetriSmartShieldState = {
  antiBotEnabled: true,
  antiDdosEnabled: true,
  rateLimitPerMinute: 100,
  blockedIpsCount: 14,
  geoFenceEnabled: true,
  requirePasskeyOr2Fa: true,
  autoSslCertificates: true,
  totalThreatsMitigated: 142,
  lastMitigationTimestamp: Date.now() - 15000,
};

export const DEFAULT_ROUTES: PetriProxyRoute[] = [
  {
    id: 'rt-root',
    path: '/',
    target: 'http://localhost:5173',
    smartShieldEnabled: true,
    rateLimitPerMinute: 200,
    requireAuth: false,
    sslEnabled: true,
    corsEnabled: true,
    description: 'Petri Zero Primary Web Interface & SPA',
  },
  {
    id: 'rt-api',
    path: '/api',
    target: 'http://localhost:8080',
    smartShieldEnabled: true,
    rateLimitPerMinute: 100,
    requireAuth: true,
    sslEnabled: true,
    corsEnabled: true,
    description: 'Petri Zero RPC & Native IPC Controller',
  },
  {
    id: 'rt-preview',
    path: '/preview',
    target: 'http://localhost:5173',
    smartShieldEnabled: false,
    rateLimitPerMinute: 500,
    requireAuth: false,
    sslEnabled: true,
    corsEnabled: true,
    description: 'Live Web Preview & Visual Agentation Frame',
  },
  {
    id: 'rt-devcontainer',
    path: '/devcontainer',
    target: 'http://localhost:3000',
    smartShieldEnabled: true,
    rateLimitPerMinute: 60,
    requireAuth: true,
    sslEnabled: true,
    corsEnabled: false,
    description: 'Isolated Docker DevContainer Execution Port',
  },
];

export const DEFAULT_MARKET_APPS: PetriMarketApp[] = [
  {
    id: 'app-ollama',
    name: 'Ollama LLM Host',
    category: 'ai_ml',
    description: 'Run Llama 3.3, DeepSeek-R1, and Mistral models locally with zero data egress.',
    image: 'ollama/ollama:latest',
    defaultPorts: ['11434:11434'],
    installed: false,
    icon: 'cpu',
    docsUrl: 'https://ollama.com',
  },
  {
    id: 'app-postgres',
    name: 'PostgreSQL 16',
    category: 'database',
    description: 'Rock-solid relational database with JSONB support and ACID transactions.',
    image: 'postgres:16-alpine',
    defaultPorts: ['5432:5432'],
    installed: false,
    icon: 'database',
    docsUrl: 'https://hub.docker.com/_/postgres',
  },
  {
    id: 'app-redis',
    name: 'Redis 7 Cache',
    category: 'database',
    description: 'High-performance in-memory key-value data store, cache, and message broker.',
    image: 'redis:7-alpine',
    defaultPorts: ['6379:6379'],
    installed: false,
    icon: 'zap',
    docsUrl: 'https://redis.io',
  },
  {
    id: 'app-chroma',
    name: 'ChromaDB Vector Store',
    category: 'storage',
    description: 'Embedding database designed for agentic episodic memory and semantic code search.',
    image: 'chromadb/chroma:latest',
    defaultPorts: ['8000:8000'],
    installed: false,
    icon: 'brain',
    docsUrl: 'https://trychroma.com',
  },
  {
    id: 'app-minio',
    name: 'MinIO Object Storage',
    category: 'storage',
    description: 'High performance, S3-compatible object storage for model weights and datasets.',
    image: 'minio/minio:latest',
    defaultPorts: ['9000:9000', '9001:9001'],
    installed: false,
    icon: 'hard-drive',
    docsUrl: 'https://min.io',
  },
  {
    id: 'app-nginx',
    name: 'Nginx Gateway',
    category: 'gateway',
    description: 'High-performance reverse proxy and static asset server for live testing.',
    image: 'nginx:alpine',
    defaultPorts: ['8080:80'],
    installed: false,
    icon: 'network',
    docsUrl: 'https://nginx.org',
  },
];

class PetriServerServiceStore {
  private status: PetriServerStatus = DEFAULT_SERVER_STATUS;
  private smartShield: PetriSmartShieldState = DEFAULT_SMARTSHIELD_STATE;
  private routes: PetriProxyRoute[] = DEFAULT_ROUTES;
  private containers: PetriContainerInfo[] = [];
  private marketApps: PetriMarketApp[] = DEFAULT_MARKET_APPS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.refreshAll();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getStatus(): PetriServerStatus {
    return this.status;
  }

  getSmartShield(): PetriSmartShieldState {
    return this.smartShield;
  }

  getRoutes(): PetriProxyRoute[] {
    return this.routes;
  }

  getContainers(): PetriContainerInfo[] {
    return this.containers;
  }

  getMarketApps(): PetriMarketApp[] {
    return this.marketApps;
  }

  private isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  async refreshAll(): Promise<void> {
    if (this.isTauri()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const [rawStatus, rawContainers, rawRoutes, rawApps] = await Promise.all([
          invoke<Record<string, unknown>>('get_petri_server_status'),
          invoke<PetriContainerInfo[]>('list_petri_containers'),
          invoke<PetriProxyRoute[]>('get_petri_routes'),
          invoke<PetriMarketApp[]>('get_petri_market_apps'),
        ]);

        if (rawStatus) {
          this.status = {
            isRunning: Boolean(rawStatus.is_running),
            version: String(rawStatus.version || '8.5.0-petri'),
            engine: String(rawStatus.engine || 'docker'),
            dockerSocketConnected: Boolean(rawStatus.docker_socket_connected),
            hostIp: String(rawStatus.host_ip || '127.0.0.1'),
            uptimeSeconds: Number(rawStatus.uptime_seconds || 86400),
            activeContainersCount: Number(rawStatus.active_containers_count || 0),
            smartShieldActive: Boolean(rawStatus.smart_shield_active),
            sslActive: Boolean(rawStatus.ssl_active),
            totalMemoryMb: Number(rawStatus.total_memory_mb || 32768),
            usedMemoryMb: Number(rawStatus.used_memory_mb || 8420),
            cpuPercent: Number(rawStatus.cpu_percent || 4.2),
          };
        }

        if (Array.isArray(rawContainers)) {
          this.containers = rawContainers;
        }

        if (Array.isArray(rawRoutes)) {
          this.routes = rawRoutes;
        }

        if (Array.isArray(rawApps)) {
          this.marketApps = rawApps;
        }

        this.notify();
      } catch (err) {
        console.warn('PetriServerService: Tauri IPC failed, using mock data:', err);
      }
    } else {
      // Mock containers for web preview
      this.containers = [
        {
          id: 'c-petri-target-8080',
          names: ['/petri-zero-target'],
          image: 'ghcr.io/the-open-engine/zeroshot-target:latest',
          status: 'Up 14 hours',
          state: 'running',
          created: Date.now() - 50400000,
          ports: ['0.0.0.0:8080->8080/tcp'],
          command: '/usr/local/bin/zeroshot-target --port 8080',
        },
        {
          id: 'c-petri-devcontainer-3000',
          names: ['/petri-devcontainer-py311'],
          image: 'mcr.microsoft.com/devcontainers/python:3.11',
          status: 'Up 4 hours',
          state: 'running',
          created: Date.now() - 14400000,
          ports: ['0.0.0.0:3000->3000/tcp'],
          command: 'sleep infinity',
        },
        {
          id: 'c-petri-chroma-8000',
          names: ['/petri-memory-chroma'],
          image: 'chromadb/chroma:latest',
          status: 'Up 2 days',
          state: 'running',
          created: Date.now() - 172800000,
          ports: ['0.0.0.0:8000->8000/tcp'],
          command: 'uvicorn chromadb.app:app --host 0.0.0.0',
        },
      ];
      this.notify();
    }
  }

  async manageContainer(containerId: string, action: 'start' | 'stop' | 'restart' | 'rm'): Promise<string> {
    if (this.isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke<string>('manage_petri_container', { containerId, action });
      await this.refreshAll();
      return result;
    } else {
      this.containers = this.containers.map((c) => {
        if (c.id === containerId) {
          if (action === 'stop') return { ...c, state: 'exited', status: 'Exited (0) Just now' };
          if (action === 'start') return { ...c, state: 'running', status: 'Up 1 second' };
          if (action === 'restart') return { ...c, state: 'running', status: 'Up 2 seconds' };
        }
        return c;
      });
      if (action === 'rm') {
        this.containers = this.containers.filter((c) => c.id !== containerId);
      }
      this.notify();
      return `Container ${containerId} ${action}ed successfully (simulated)`;
    }
  }

  async getContainerLogs(containerId: string, tail = 100): Promise<string> {
    if (this.isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<string>('get_petri_container_logs', { containerId, tail });
    } else {
      return `[petri-server] Logs for container ${containerId}:\n[info] Socket /var/run/docker.sock connected.\n[info] Process started with PID 1.\n[info] SmartShield proxy inspection active.\n[ready] Listening on port 8080.\n`;
    }
  }

  async saveRoute(route: PetriProxyRoute): Promise<string> {
    if (this.isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<string>('save_petri_route', { route });
      await this.refreshAll();
      return res;
    } else {
      const exists = this.routes.some((r) => r.id === route.id);
      if (exists) {
        this.routes = this.routes.map((r) => (r.id === route.id ? route : r));
      } else {
        this.routes = [...this.routes, route];
      }
      this.notify();
      return `Route '${route.path}' saved successfully in Petri Reverse Proxy`;
    }
  }

  async toggleSmartShield(feature: string, enabled: boolean): Promise<PetriSmartShieldState> {
    if (this.isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<PetriSmartShieldState>('toggle_petri_smartshield', { feature, enabled });
      this.smartShield = res;
      this.notify();
      return res;
    } else {
      this.smartShield = {
        ...this.smartShield,
        antiBotEnabled: feature === 'anti_bot' ? enabled : this.smartShield.antiBotEnabled,
        antiDdosEnabled: feature === 'anti_ddos' ? enabled : this.smartShield.antiDdosEnabled,
        geoFenceEnabled: feature === 'geo_fence' ? enabled : this.smartShield.geoFenceEnabled,
        requirePasskeyOr2Fa: feature === '2fa' ? enabled : this.smartShield.requirePasskeyOr2Fa,
      };
      this.notify();
      return this.smartShield;
    }
  }

  async installMarketApp(appId: string): Promise<string> {
    if (this.isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<string>('install_petri_market_app', { appId });
      await this.refreshAll();
      return res;
    } else {
      this.marketApps = this.marketApps.map((a) =>
        a.id === appId ? { ...a, installed: true, containerId: `c-petri-${appId}` } : a
      );
      this.notify();
      return `Successfully installed app '${appId}' from Petri Market!`;
    }
  }
}

export const petriServerService = new PetriServerServiceStore();
