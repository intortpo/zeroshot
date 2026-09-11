import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, AlertTriangle, ArrowRight, Shield, User, Clock, CheckCircle2 } from 'lucide-react';
import { zitadelAuthService } from '../../services/zitadelAuthService';

interface PetriAuthGuardProps {
  children: React.ReactNode;
}

export const STORAGE_AUTH_KEY = 'petri_authenticated_session';
export const STORAGE_PASS_HASH_KEY = 'petri_system_pass_hash';
export const STORAGE_OPERATOR_USER_KEY = 'petri_operator_username';

// Lightweight fast SHA-256 helper for client-side cryptographic verification
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function lockPetriSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_AUTH_KEY);
    sessionStorage.removeItem('petri_current_operator');
    zitadelAuthService.logout();
    window.location.reload();
  }
}

export async function verifyPetriPassword(password: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const storedHash = localStorage.getItem(STORAGE_PASS_HASH_KEY);
  const testHash = await sha256(password);
  if (storedHash) {
    return testHash === storedHash;
  }
  // Default password fallback: "petri"
  const defaultHash = await sha256('petri');
  return testHash === defaultHash;
}

export async function updatePetriPassword(newPassword: string): Promise<void> {
  if (typeof window !== 'undefined') {
    const hash = await sha256(newPassword);
    localStorage.setItem(STORAGE_PASS_HASH_KEY, hash);
  }
}

export function getPetriOperatorUsername(): string {
  if (typeof window === 'undefined') return 'Hideo';
  return localStorage.getItem(STORAGE_OPERATOR_USER_KEY) || 'Hideo';
}

export function updatePetriOperatorUsername(username: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_OPERATOR_USER_KEY, username.trim());
  }
}

export const PetriAuthGuard: React.FC<PetriAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [impersonateTarget, setImpersonateTarget] = useState('j.sadol@bbs.ac.th');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [configuredHash, setConfiguredHash] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Rate-limiting brute-force defense (3 attempts -> 30 second cooldown)
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Setup / Load Password Hash and Operator identity
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHash = localStorage.getItem(STORAGE_PASS_HASH_KEY);
      if (storedHash) {
        setConfiguredHash(storedHash);
        setIsInitializing(false);
      } else {
        // Default root password "petri" if no custom password has been initialized
        sha256('petri').then((hash) => {
          setConfiguredHash(hash);
          setIsInitializing(false);
        });
      }
    }
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutRemaining > 0) {
      setErrorMsg(`SECURITY LOCKOUT ACTIVE · WAIT ${lockoutRemaining}s BEFORE RETRYING`);
      return;
    }

    const trimmedUser = usernameInput.trim();
    if (!trimmedUser) {
      setErrorMsg('OPERATOR CALLSIGN / USERNAME IS MANDATORY');
      return;
    }

    if (!passwordInput) {
      setErrorMsg('MASTER ACCESS PASSWORD IS MANDATORY');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      // 1. Verify Operator Username
      const storedOperator = getPetriOperatorUsername().toLowerCase();
      const inputUserLower = trimmedUser.toLowerCase();
      const isOwnerAlias =
        inputUserLower === 'hideo' ||
        inputUserLower === 'intortpo@gmail.com' ||
        inputUserLower === storedOperator;

      if (!isOwnerAlias) {
        registerFailure('OPERATOR CALLSIGN NOT RECOGNIZED');
        return;
      }

      // 2. Verify Cryptographic Password
      const inputHash = await sha256(passwordInput);
      const expectedHash = configuredHash || (await sha256('petri'));

      if (inputHash !== expectedHash) {
        registerFailure('INVALID ACCESS PASSWORD');
        return;
      }

      // 3. Both credentials verified successfully
      setFailedAttempts(0);
      sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
      sessionStorage.setItem('petri_current_operator', trimmedUser);

      // Bind Zitadel IAM and impersonation session (clean API-level exchange, zero URL mutation)
      await zitadelAuthService.authenticate(
        trimmedUser,
        undefined,
        impersonateTarget.trim() || 'j.sadol@bbs.ac.th'
      );

      setIsAuthenticated(true);
    } catch {
      setErrorMsg('CRYPTOGRAPHIC AUTHENTICATION SUBSYSTEM ERROR');
    } finally {
      setIsVerifying(false);
    }
  };

  const registerFailure = (reason: string) => {
    const nextFailures = failedAttempts + 1;
    setFailedAttempts(nextFailures);

    if (nextFailures >= 3) {
      setLockoutRemaining(30);
      setFailedAttempts(0);
      setErrorMsg(`CRITICAL: 3 CONSECUTIVE AUTH FAULTS · 30s LOCKOUT ENGAGED`);
    } else {
      setErrorMsg(`${reason} · ATTEMPT ${nextFailures} OF 3 REJECTED`);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F6F3EC] text-[#1A1D1A] font-mono">
        <div className="text-xs uppercase tracking-widest animate-pulse flex items-center gap-2">
          <Shield className="w-4 h-4 animate-spin" />
          <span>ARMING CRYPTO-AUTH SECURITY BARRIER...</span>
        </div>
      </div>
    );
  }

  // Strict Fail-Closed DOM Isolation: if not authenticated, children are NEVER rendered in the DOM
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

      {/* 1960s Technical Manual Gate Plaque */}
      <div className="relative z-10 w-full max-w-md border-2 border-[#1A1D1A] bg-[#FAF8F3] p-7 shadow-[6px_6px_0px_#1A1D1A]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1D1A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#1A1D1A]" strokeWidth={2} />
            <div>
              <span className="text-xs font-bold tracking-widest uppercase block">
                ZERO-PETRI // GATEWAY
              </span>
              <span className="text-[9px] text-[#1A1D1A]/60 tracking-wider">
                MANDATORY DUAL-CREDENTIAL ACCESS
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold border border-[#1A1D1A] px-2 py-0.5 tracking-widest bg-[#EDE8DC]">
            SEC-LEVEL: HIGHEST
          </span>
        </div>

        {/* Wireframe Dual-Lock Circuit Diagram */}
        <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 mb-4 text-center">
          <svg viewBox="0 0 240 50" className="w-full h-12 mx-auto stroke-[#1A1D1A] fill-none" strokeWidth="1.2">
            {/* Input Bus */}
            <line x1="10" y1="25" x2="35" y2="25" />
            
            {/* Gate A: Callsign Verification */}
            <rect x="35" y="12" width="45" height="26" strokeDasharray="3,2" />
            <text x="40" y="27" fontSize="7" fill="#1A1D1A" fontFamily="monospace" fontWeight="bold">USER // ID</text>
            
            {/* Connection A to B */}
            <line x1="80" y1="25" x2="105" y2="25" />
            
            {/* Gate B: Cryptographic Password */}
            <rect x="105" y="12" width="48" height="26" strokeDasharray="3,2" />
            <text x="109" y="27" fontSize="7" fill="#1A1D1A" fontFamily="monospace" fontWeight="bold">PASS // HASH</text>
            
            {/* Connection B to Core */}
            <line x1="153" y1="25" x2="180" y2="25" />
            
            {/* Core Box */}
            <rect x="180" y="10" width="50" height="30" strokeWidth="1.75" />
            <text x="186" y="27" fontSize="7" fill="#1A1D1A" fontFamily="monospace" fontWeight="bold">PETRI CORE</text>
            
            {/* Circuit Joint Indicators */}
            <circle cx="35" cy="25" r="2.5" fill="#1A1D1A" />
            <circle cx="80" cy="25" r="2.5" fill="#1A1D1A" />
            <circle cx="105" cy="25" r="2.5" fill="#1A1D1A" />
            <circle cx="153" cy="25" r="2.5" fill="#1A1D1A" />
          </svg>
          <div className="text-[9px] tracking-widest text-[#1A1D1A]/80 uppercase mt-1 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#1A1D1A] rounded-full" />
            <span>DUAL-SERIES VERIFICATION CIRCUIT ENGAGED</span>
          </div>
        </div>

        {/* Security Invariant Notice */}
        <div className="border border-dashed border-[#1A1D1A]/50 bg-[#EDE8DC]/50 p-2.5 mb-4 text-[10px] text-[#1A1D1A]/90 leading-relaxed">
          <strong>STRICT ACCESS POLICY:</strong> View and modification of this workspace requires simultaneous verification of Operator Callsign and Master Password. Zero bypass channels permitted.
        </div>

        {/* Form: Dual-Credential Challenge */}
        <form onSubmit={handleAuthenticate} className="space-y-3.5">
          {/* 1. Operator Username / Callsign */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#1A1D1A] mb-1 flex items-center justify-between">
              <span>Operator Callsign / Username</span>
              <span className="text-[9px] text-[#1A1D1A]/60 font-normal">Primary: Hideo</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-[#1A1D1A]/60" />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Hideo (or intortpo@gmail.com)"
                autoFocus
                disabled={lockoutRemaining > 0 || isVerifying}
                className="w-full bg-white border border-[#1A1D1A] pl-9 pr-3 py-2 text-xs text-[#1A1D1A] placeholder:text-[#1A1D1A]/30 focus:outline-none focus:ring-1 focus:ring-[#1A1D1A] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.06)] disabled:bg-stone-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* 2. Master Password */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#1A1D1A] mb-1 flex items-center justify-between">
              <span>Master Access Password</span>
              <span className="text-[9px] text-[#1A1D1A]/60 font-normal">Default: petri</span>
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 w-4 h-4 text-[#1A1D1A]/60" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                disabled={lockoutRemaining > 0 || isVerifying}
                className="w-full bg-white border border-[#1A1D1A] pl-9 pr-3 py-2 text-xs text-[#1A1D1A] placeholder:text-[#1A1D1A]/30 focus:outline-none focus:ring-1 focus:ring-[#1A1D1A] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.06)] disabled:bg-stone-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Advanced Work Impersonation Option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[9px] font-mono text-[#1A1D1A]/70 hover:text-[#1A1D1A] underline cursor-pointer"
            >
              {showAdvanced ? '[-] Hide Execution Binding' : '[+] DWD Execution Impersonation Target'}
            </button>
            {showAdvanced && (
              <div className="mt-2 p-2.5 bg-white border border-[#1A1D1A] space-y-1">
                <label className="block text-[9px] uppercase font-bold tracking-wider text-[#1A1D1A]">
                  Google DWD Impersonate Target
                </label>
                <input
                  type="email"
                  value={impersonateTarget}
                  onChange={(e) => setImpersonateTarget(e.target.value)}
                  placeholder="j.sadol@bbs.ac.th"
                  className="w-full bg-[#FAF8F3] border border-[#1A1D1A]/60 px-2 py-1 text-xs text-[#1A1D1A] focus:outline-none"
                />
                <p className="text-[8px] text-[#1A1D1A]/60 mt-0.5">
                  Authenticated session executes with Google DWD delegation as this identity.
                </p>
              </div>
            )}
          </div>

          {/* Lockout Warning Banner */}
          {lockoutRemaining > 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-[#FEF3C7] border border-[#D97706] text-[#92400E] text-[10px] font-bold tracking-wider">
              <Clock className="w-4 h-4 shrink-0 animate-spin" />
              <span>DEFENSIVE LOCKOUT ENGAGED · COOLDOWN: {lockoutRemaining}s</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && lockoutRemaining === 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-[#FEE2E2] border border-[#DC2626] text-[#991B1B] text-[10px] font-bold tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Verification CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isVerifying || lockoutRemaining > 0}
              className="w-full py-2.5 px-4 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1A1D1A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Shield className="w-4 h-4 animate-spin" />
                  <span>VERIFYING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE & UNLOCK</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Specifications Footer */}
        <div className="mt-5 pt-3 border-t border-[#1A1D1A]/30 flex flex-col gap-1 text-[9px] text-[#1A1D1A]/70 font-mono">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              FAIL-CLOSED DOM CONTAINMENT
            </span>
            <span>VOLATILE SESSION</span>
          </div>
          <div className="flex items-center justify-between">
            <span>DIRECT CRYPTO BUS</span>
            <span>ZERO URL REDIRECT LEAK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
