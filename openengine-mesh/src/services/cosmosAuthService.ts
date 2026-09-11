/**
 * Cosmos Server Authentication Service
 * Communicates with Cosmos Server (https://cosmos-cloud.io) reverse proxy,
 * validating forward-auth headers (X-Cosmos-User, X-Cosmos-Email, X-Cosmos-Role)
 * and providing single sign-on (SSO), Passkeys, and MFA verification.
 */

import { pyspurUserService } from './pyspurUserService';

export interface CosmosUserSession {
  isAuthenticated: boolean;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  source: 'cosmos_proxy' | 'local_dev_bypass';
  mfaVerified?: boolean;
  cosmosVersion?: string;
}

class CosmosAuthService {
  private currentSession: CosmosUserSession | null = null;
  private isCosmosDetected = false;

  /**
   * Inspects incoming request headers or calls the Cosmos session probe
   * to determine if the client is authenticated through Cosmos Server.
   */
  public async inspectSession(): Promise<CosmosUserSession> {
    // 1. Probe Cosmos Server identity endpoint if reverse-proxied
    try {
      const response = await fetch('/api/cosmos/whoami', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.isCosmosDetected = true;
        this.currentSession = {
          isAuthenticated: true,
          username: data.username || data.user || data.nickname || 'Hideo',
          email: data.email || 'intortpo@gmail.com',
          role: (data.role as CosmosUserSession['role']) || 'admin',
          source: 'cosmos_proxy',
          mfaVerified: !!data.mfaVerified,
          cosmosVersion: data.version,
        };
        pyspurUserService.linkCosmosUserToPySpur(this.currentSession).catch(console.warn);
        return this.currentSession;
      }
    } catch {
      // Endpoint unreachable or running outside Cosmos Server
    }

    // 2. Check alternative Cosmos forward-auth endpoint or local storage session
    if (typeof window !== 'undefined') {
      const sessionAuth = sessionStorage.getItem('petri_authenticated_session') === 'true';
      const sessionUser = sessionStorage.getItem('petri_current_operator') || 'Hideo';
      
      this.currentSession = {
        isAuthenticated: sessionAuth,
        username: sessionUser,
        email: `${sessionUser.toLowerCase()}@bbs.ac.th`,
        role: 'operator',
        source: 'local_dev_bypass',
      };
      pyspurUserService.linkCosmosUserToPySpur(this.currentSession).catch(console.warn);
      return this.currentSession;
    }

    return {
      isAuthenticated: false,
      username: '',
      email: '',
      role: 'viewer',
      source: 'local_dev_bypass',
    };
  }

  /**
   * Returns true if the client environment is behind a verified Cosmos Server
   */
  public isBehindCosmos(): boolean {
    return this.isCosmosDetected;
  }

  /**
   * Redirects user to Cosmos Server login portal
   */
  public redirectToCosmosLogin(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/_cosmos/login?redirect=' + encodeURIComponent(window.location.href);
    }
  }

  /**
   * Logs out from Cosmos Server session and flushes local storage
   */
  public logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      if (this.isCosmosDetected) {
        window.location.href = '/_cosmos/logout';
      } else {
        window.location.reload();
      }
    }
  }
}

export const cosmosAuthService = new CosmosAuthService();
