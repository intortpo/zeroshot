import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { zitadelAuthService } from '../../services/zitadelAuthService';

interface PetriAuthGuardProps {
  children: React.ReactNode;
}

const STORAGE_AUTH_KEY = 'petri_authenticated_session';
const STORAGE_PASS_HASH_KEY = 'petri_system_pass_hash';

// Lightweight fast SHA-256 helper for client-side credential verification
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const PetriAuthGuard: React.FC<PetriAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true' || zitadelAuthService.isAuthenticated();
      } catch {
        return false;
      }
    }
    return false;
  });

  const [authMode, setAuthMode] = useState<'passcode' | 'zitadel'>('zitadel');
  const [passwordInput, setPasswordInput] = useState('');
  const [operatorEmail, setOperatorEmail] = useState('intortpo@gmail.com');
  const [impersonateTarget, setImpersonateTarget] = useState('j.sadol@bbs.ac.th');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [configuredHash, setConfiguredHash] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Setup / Load Password Hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_PASS_HASH_KEY);
      if (stored) {
        setConfiguredHash(stored);
        setIsInitializing(false);
      } else {
        // Default root password "petri" if no custom password has been set yet
        sha256('petri').then((hash) => {
          setConfiguredHash(hash);
          setIsInitializing(false);
        });
      }
    }
  }, []);

  const handleUnlockPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setErrorMsg('ENTER ACCESS CODE');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const inputHash = await sha256(passwordInput);
      if (configuredHash && inputHash === configuredHash) {
        // Successful unlock
        sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
        // Ensure Zitadel service knows of default operator identity
        await zitadelAuthService.authenticate('intortpo@gmail.com', undefined, 'j.sadol@bbs.ac.th');
        setIsAuthenticated(true);
      } else {
        setErrorMsg('INVALID ACCESS CODE · VERIFICATION REJECTED');
      }
    } catch {
      setErrorMsg('CRYPTOGRAPHIC VERIFICATION FAULT');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleZitadelLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      await zitadelAuthService.authenticate(
        operatorEmail.trim() || 'intortpo@gmail.com',
        undefined,
        impersonateTarget.trim() || 'j.sadol@bbs.ac.th'
      );
      sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
      setIsAuthenticated(true);
    } catch (err) {
      setErrorMsg('ZITADEL AUTHENTICATION REJECTED');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F6F3EC] text-[#1A1D1A] font-mono">
        <div className="text-xs uppercase tracking-widest animate-pulse">
          INITIALIZING CRYPTO-AUTH BUS...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F6F3EC] text-[#1A1D1A] font-mono relative flex items-center justify-center p-4 selection:bg-[#1A1D1A] selection:text-[#FAF8F3]">
      {/* 24mm Inked Drafting Parchment Grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(26,29,26,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,29,26,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 1960s Technical Manual Lock Screen Plaque */}
      <div className="relative z-10 w-full max-w-md border-2 border-[#1A1D1A] bg-[#FAF8F3] p-7 shadow-[6px_6px_0px_#1A1D1A]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1D1A] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#1A1D1A]" strokeWidth={1.75} />
            <span className="text-xs font-bold tracking-widest uppercase">
              PETRI // RESTRICTED ACCESS
            </span>
          </div>
          <span className="text-[9px] font-bold border border-[#1A1D1A] px-2 py-0.5 tracking-widest bg-[#EDE8DC]">
            SEC-LEVEL: ROOT
          </span>
        </div>

        {/* Wireframe Diagram of Security Gate */}
        <div className="border border-dashed border-[#1A1D1A]/50 bg-[#F2EFE9] p-3 mb-5 text-center">
          <svg viewBox="0 0 200 45" className="w-full h-11 mx-auto stroke-[#1A1D1A] fill-none" strokeWidth="1">
            <line x1="10" y1="22" x2="60" y2="22" />
            <rect x="60" y="10" width="30" height="25" strokeDasharray="3,2" />
            <line x1="90" y1="22" x2="115" y2="8" strokeWidth="1.5" />
            <circle cx="90" cy="22" r="2.5" fill="#1A1D1A" />
            <circle cx="120" cy="22" r="2.5" fill="#1A1D1A" />
            <line x1="120" y1="22" x2="185" y2="22" />
            <rect x="155" y="10" width="30" height="25" />
            <text x="63" y="26" fontSize="6.5" fill="#1A1D1A" fontFamily="monospace">IAM</text>
            <text x="158" y="26" fontSize="6.5" fill="#1A1D1A" fontFamily="monospace">CORE</text>
          </svg>
          <div className="text-[9px] tracking-widest text-[#1A1D1A]/80 uppercase mt-1">
            ZITADEL IAM · ZERO-LEAK URL PROXY BUS ACTIVE
          </div>
        </div>

        {/* Mode Toggle Bar */}
        <div className="flex border border-[#1A1D1A] mb-5 bg-[#EDE8DC]">
          <button
            type="button"
            onClick={() => setAuthMode('zitadel')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              authMode === 'zitadel'
                ? 'bg-[#1A1D1A] text-[#FAF8F3]'
                : 'text-[#1A1D1A] hover:bg-[#FAF8F3]'
            }`}
          >
            Zitadel IAM Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('passcode')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              authMode === 'passcode'
                ? 'bg-[#1A1D1A] text-[#FAF8F3]'
                : 'text-[#1A1D1A] hover:bg-[#FAF8F3]'
            }`}
          >
            Passcode Unlock
          </button>
        </div>

        {/* Mode 1: Zitadel IAM Direct Login & Impersonation */}
        {authMode === 'zitadel' ? (
          <form onSubmit={handleZitadelLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#1A1D1A] mb-1 flex items-center justify-between">
                <span>Operator Account (Zitadel Sub)</span>
                <span className="text-[9px] text-[#1A1D1A]/50">Hideo</span>
              </label>
              <input
                type="email"
                value={operatorEmail}
                onChange={(e) => setOperatorEmail(e.target.value)}
                className="w-full bg-white border border-[#1A1D1A] px-3 py-2 text-xs text-[#1A1D1A] focus:outline-none focus:ring-1 focus:ring-[#1A1D1A] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.06)]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#1A1D1A] mb-1 flex items-center justify-between">
                <span>Work Impersonation Target</span>
                <span className="text-[9px] font-semibold text-emerald-800">DWD / BBS</span>
              </label>
              <input
                type="email"
                value={impersonateTarget}
                onChange={(e) => setImpersonateTarget(e.target.value)}
                className="w-full bg-white border border-[#1A1D1A] px-3 py-2 text-xs text-[#1A1D1A] focus:outline-none focus:ring-1 focus:ring-[#1A1D1A] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.06)]"
              />
            </div>

            <div className="p-2.5 bg-[#F2EFE9] border border-dashed border-[#1A1D1A]/40 text-[10px] text-[#1A1D1A]/80 leading-relaxed">
              <strong>URL Privacy Note:</strong> Direct API token resolution engaged. The browser URL remains strictly on local origin with zero Zitadel paths or OAuth redirect parameters.
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2 bg-[#FEE2E2] border border-[#DC2626] text-[#991B1B] text-[10px] font-bold tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 px-4 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1A1D1A] disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isVerifying ? 'AUTHENTICATING...' : 'AUTHORIZE AS HIDEO'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: Master Security Passcode */
          <form onSubmit={handleUnlockPasscode} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#1A1D1A] mb-1.5 flex items-center justify-between">
                <span>Security Passcode:</span>
                <span className="text-[9px] text-[#1A1D1A]/50 font-normal">Default: petri</span>
              </label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3 w-4 h-4 text-[#1A1D1A]/60" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#1A1D1A] pl-9 pr-3 py-2 text-xs text-[#1A1D1A] placeholder:text-[#1A1D1A]/30 focus:outline-none focus:ring-1 focus:ring-[#1A1D1A] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.06)]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2 bg-[#FEE2E2] border border-[#DC2626] text-[#991B1B] text-[10px] font-bold tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 px-4 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1A1D1A] disabled:opacity-50"
              >
                <span>{isVerifying ? 'VERIFYING...' : 'UNLOCK WORKSPACE'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Footer Technical Stamp */}
        <div className="mt-6 pt-3 border-t border-[#1A1D1A]/30 flex items-center justify-between text-[9px] text-[#1A1D1A]/60">
          <span>PETRI AUTH PROTOCOL // V8</span>
          <span>SYSTEM TIER: ROOT SECURITY</span>
        </div>
      </div>
    </div>
  );
};

export function lockPetriSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_AUTH_KEY);
    zitadelAuthService.logout();
    window.location.reload();
  }
}

export async function updatePetriPassword(newPassword: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const hash = await sha256(newPassword);
    localStorage.setItem(STORAGE_PASS_HASH_KEY, hash);
  }
}
