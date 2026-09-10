import { TailscaleNetworkDetails } from '../types';

// Fallback initial data when running in web preview
const FALLBACK_TAILSCALE_DETAILS: TailscaleNetworkDetails = {
  backendState: 'Stopped',
  selfNode: {
    hostName: 'po',
    dnsName: 'po.taildf505d.ts.net',
    tailscaleIps: ['100.81.151.110', 'fd7a:115c:a1e0::9837:976f'],
    isExitNode: false,
    advertisedExitNode: false,
    activeExitNode: undefined,
    exitNodeAllowLan: true,
  },
  peers: [
    {
      id: 'node-us-lax-703',
      hostName: 'us-lax-wg-703',
      dnsName: 'us-lax-wg-703.mullvad.ts.net',
      os: 'linux',
      tailscaleIps: ['100.101.125.125'],
      online: true,
      isExitNode: false,
      isActiveExitNode: false,
      exitNodeOption: true,
      country: 'USA',
      city: 'Los Angeles, CA',
      tags: ['tag:mullvad-exit-node'],
    },
    {
      id: 'node-ch-zrh-001',
      hostName: 'ch-zrh-wg-001',
      dnsName: 'ch-zrh-wg-001.mullvad.ts.net',
      os: 'linux',
      tailscaleIps: ['100.90.55.121'],
      online: true,
      isExitNode: false,
      isActiveExitNode: false,
      exitNodeOption: true,
      country: 'Switzerland',
      city: 'Zurich',
      tags: ['tag:mullvad-exit-node'],
    },
    {
      id: 'node-ie-dub-103',
      hostName: 'ie-dub-wg-103',
      dnsName: 'ie-dub-wg-103.mullvad.ts.net',
      os: 'linux',
      tailscaleIps: ['100.114.13.51'],
      online: true,
      isExitNode: false,
      isActiveExitNode: false,
      exitNodeOption: true,
      country: 'Ireland',
      city: 'Dublin',
      tags: ['tag:mullvad-exit-node'],
    },
    {
      id: 'node-macbook-pro',
      hostName: 'hideo-mbp',
      dnsName: 'hideo-mbp.taildf505d.ts.net',
      os: 'macOS',
      tailscaleIps: ['100.94.20.12'],
      online: true,
      isExitNode: false,
      isActiveExitNode: false,
      exitNodeOption: false,
      lastSeen: 'Just now',
    },
    {
      id: 'node-pixel-phone',
      hostName: 'pixel-9-pro',
      dnsName: 'pixel-9-pro.taildf505d.ts.net',
      os: 'android',
      tailscaleIps: ['100.112.44.88'],
      online: true,
      isExitNode: false,
      isActiveExitNode: false,
      exitNodeOption: false,
      lastSeen: '12m ago',
    },
  ],
  activeExitNode: undefined,
  exitNodeAllowLan: true,
};

class TailscaleService {
  private inMemoryDetails: TailscaleNetworkDetails = { ...FALLBACK_TAILSCALE_DETAILS };

  async getNetworkDetails(): Promise<TailscaleNetworkDetails> {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const res = await invoke<TailscaleNetworkDetails>('get_tailscale_network_details');
        if (res) {
          this.inMemoryDetails = res;
          return res;
        }
      }
    } catch (err) {
      console.warn('Tauri get_tailscale_network_details fallback:', err);
    }
    return this.inMemoryDetails;
  }

  async connect(authKey?: string): Promise<{ success: boolean; message: string; authUrl?: string }> {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const msg = await invoke<string>('tailscale_connect', { authKey: authKey || null });
        const hasUrl = msg.includes('https://login.tailscale.com');
        const authUrl = hasUrl
          ? msg.match(/https:\/\/login\.tailscale\.com[^\s]*/)?.[0]
          : undefined;

        this.inMemoryDetails.backendState = 'Running';
        return { success: true, message: msg, authUrl };
      }
    } catch (err: any) {
      return { success: false, message: err?.toString() || 'Connection failed' };
    }

    // Fallback simulation
    this.inMemoryDetails.backendState = 'Running';
    return {
      success: true,
      message: authKey ? 'Connected with provided Auth Key!' : 'Connected to Tailscale mesh!',
    };
  }

  async disconnect(): Promise<{ success: boolean; message: string }> {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const msg = await invoke<string>('tailscale_disconnect');
        this.inMemoryDetails.backendState = 'Stopped';
        return { success: true, message: msg };
      }
    } catch (err: any) {
      return { success: false, message: err?.toString() || 'Disconnection failed' };
    }

    this.inMemoryDetails.backendState = 'Stopped';
    return { success: true, message: 'Tailscale disconnected.' };
  }

  async setExitNode(
    exitNode: string | null,
    allowLan: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const msg = await invoke<string>('tailscale_set_exit_node', {
          exitNode: exitNode || null,
          allowLan,
        });

        this.inMemoryDetails.activeExitNode = exitNode || undefined;
        this.inMemoryDetails.exitNodeAllowLan = allowLan;
        return { success: true, message: msg };
      }
    } catch (err: any) {
      return { success: false, message: err?.toString() || 'Failed to set exit node' };
    }

    this.inMemoryDetails.activeExitNode = exitNode || undefined;
    this.inMemoryDetails.exitNodeAllowLan = allowLan;
    return {
      success: true,
      message: exitNode
        ? `Active exit node set to: ${exitNode}`
        : 'Cleared active exit node. Direct routing restored.',
    };
  }

  async setAdvertiseExitNode(enable: boolean): Promise<{ success: boolean; message: string }> {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        const msg = await invoke<string>('tailscale_set_advertise_exit_node', { enable });
        this.inMemoryDetails.selfNode.advertisedExitNode = enable;
        return { success: true, message: msg };
      }
    } catch (err: any) {
      return { success: false, message: err?.toString() || 'Failed to update exit node advertisement' };
    }

    this.inMemoryDetails.selfNode.advertisedExitNode = enable;
    return {
      success: true,
      message: enable
        ? 'Host is now advertising as an Exit Node to the mesh.'
        : 'Host exit node advertisement disabled.',
    };
  }
}

export const tailscaleService = new TailscaleService();
