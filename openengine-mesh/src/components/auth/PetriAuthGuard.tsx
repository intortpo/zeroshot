import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, AlertTriangle, ArrowRight, Shield, User, Clock } from 'lucide-react';
import { zitadelAuthService } from '../../services/zitadelAuthService';
import { cosmosAuthService } from '../../services/cosmosAuthService';

interface PetriAuthGuardProps {
  children: React.ReactNode;
}

export const STORAGE_AUTH_KEY = 'petri_authenticated_session';
export const STORAGE_PASS_HASH_KEY = 'petri_system_pass_hash';
export const STORAGE_OPERATOR_USER_KEY = 'petri_operator_username';

// Pure TypeScript implementation of SHA-256 (synchronous, zero crypto.subtle dependency)
export function pureSha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < ascii[lengthProperty]; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= code << ((3 - (i % 4)) * 8);
  }

  hash = hash.slice(0);

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash;
    hash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i] || 0
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export function sha256(message: string): string {
  return pureSha256(message);
}

export function lockPetriSession(): void {
  cosmosAuthService.logout();
}

export function verifyPetriPassword(password: string): boolean {
  if (typeof window === 'undefined') return false;
  const storedHash = localStorage.getItem(STORAGE_PASS_HASH_KEY);
  const testHash = pureSha256(password);
  if (storedHash) {
    return testHash === storedHash;
  }
  // Default password fallback: "petri"
  return testHash === pureSha256('petri');
}

export function updatePetriPassword(newPassword: string): void {
  if (typeof window !== 'undefined') {
    const hash = pureSha256(newPassword);
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
        const hasSession = sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true';
        const operator = sessionStorage.getItem('petri_current_operator');
        return hasSession && !!operator;
      } catch {
        return false;
      }
    }
    return false;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [configuredHash, setConfiguredHash] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_PASS_HASH_KEY) || pureSha256('petri');
    }
    return pureSha256('petri');
  });
  const [isInitializing] = useState(false);

  // Rate-limiting brute-force defense (3 attempts -> 30 second cooldown)
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Check Cosmos Server perimeter auth session on initial load
  useEffect(() => {
    cosmosAuthService.inspectSession().then((session) => {
      if (session.isAuthenticated && session.source === 'cosmos_proxy') {
        sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
        sessionStorage.setItem('petri_current_operator', session.username);
        setIsAuthenticated(true);
      }
    });
  }, []);

  // Sync configuredHash if localStorage changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_PASS_HASH_KEY);
      if (stored) {
        setConfiguredHash(stored);
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
      const inputHash = pureSha256(passwordInput);
      const expectedHash = configuredHash || pureSha256('petri');

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
        'j.sadol@bbs.ac.th'
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
      <div className="w-full max-w-sm bg-white border border-[#1A1D1A]/20 p-6 shadow-sm">
        <form onSubmit={handleAuthenticate} className="space-y-4">
          <div className="relative flex items-center">
            <User className="absolute left-3 w-4 h-4 text-[#1A1D1A]/60" />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Username"
              autoFocus
              disabled={lockoutRemaining > 0 || isVerifying}
              className="w-full bg-white border border-[#1A1D1A]/30 pl-9 pr-3 py-2 text-xs text-[#1A1D1A] placeholder:text-[#1A1D1A]/40 focus:outline-none focus:border-[#1A1D1A] disabled:bg-stone-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="relative flex items-center">
            <KeyRound className="absolute left-3 w-4 h-4 text-[#1A1D1A]/60" />
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              disabled={lockoutRemaining > 0 || isVerifying}
              className="w-full bg-white border border-[#1A1D1A]/30 pl-9 pr-3 py-2 text-xs text-[#1A1D1A] placeholder:text-[#1A1D1A]/40 focus:outline-none focus:border-[#1A1D1A] disabled:bg-stone-100 disabled:cursor-not-allowed"
            />
          </div>

          {lockoutRemaining > 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-[#FEF3C7] border border-[#D97706] text-[#92400E] text-[10px] font-bold">
              <Clock className="w-4 h-4 shrink-0 animate-spin" />
              <span>LOCKOUT ACTIVE ({lockoutRemaining}s)</span>
            </div>
          )}

          {errorMsg && lockoutRemaining === 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-[#FEE2E2] border border-[#DC2626] text-[#991B1B] text-[10px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || lockoutRemaining > 0}
            className="w-full py-2.5 px-4 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1A1D1A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Shield className="w-4 h-4 animate-spin" />
                <span>VERIFYING...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>AUTHENTICATE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
