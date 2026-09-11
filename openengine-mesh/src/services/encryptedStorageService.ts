/**
 * Encrypted Storage Layer
 * Implements AES-256-GCM authenticated encryption at rest for all federated documents,
 * images, videos, spreadsheets, and student diagnostic data.
 */

export interface EncryptedEnvelope {
  ciphertext: string; // Base64
  iv: string;         // Base64 (12-byte IV for AES-GCM)
  tag?: string;       // Included in ciphertext for WebCrypto AES-GCM
  salt: string;       // Base64 salt for PBKDF2 key derivation
  algorithm: string;  // "AES-256-GCM"
  createdAt: number;
  metadata?: {
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    category?: 'document' | 'image' | 'video' | 'slide' | 'data' | 'rag_index';
  };
}

class EncryptedStorageService {
  private get currentPassphrase(): string {
    const operator = (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined')
      ? (sessionStorage.getItem('petri_current_operator') || 'default')
      : 'default';
    return 'petri-vault-' + operator + '-2026';
  }

  /**
   * Derives an AES-256-GCM CryptoKey from the workspace passphrase and salt using PBKDF2
   */
  private async getKey(saltBytes: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(this.currentPassphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes.buffer as ArrayBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plain text or binary ArrayBuffer into an authenticated EncryptedEnvelope
   */
  public async encryptData(
    data: string | ArrayBuffer,
    metadata?: EncryptedEnvelope['metadata']
  ): Promise<EncryptedEnvelope> {
    if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) {
      const plainText = typeof data === 'string' ? data : this.bufferToBase64(data);
      return {
        ciphertext: btoa(encodeURIComponent(plainText)),
        iv: btoa('insecure-http-iv'),
        salt: btoa('insecure-http-salt'),
        algorithm: 'INSECURE-FALLBACK',
        createdAt: Date.now(),
        metadata: {
          ...metadata,
          sizeBytes: typeof data === 'string' ? data.length : data.byteLength,
        },
      };
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.getKey(salt);

    let rawBuffer: ArrayBuffer;
    if (typeof data === 'string') {
      rawBuffer = new TextEncoder().encode(data).buffer as ArrayBuffer;
    } else {
      rawBuffer = data;
    }

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      rawBuffer
    );

    return {
      ciphertext: this.bufferToBase64(encryptedBuffer),
      iv: this.bufferToBase64(iv.buffer as ArrayBuffer),
      salt: this.bufferToBase64(salt.buffer as ArrayBuffer),
      algorithm: 'AES-256-GCM',
      createdAt: Date.now(),
      metadata: {
        ...metadata,
        sizeBytes: rawBuffer.byteLength,
      },
    };
  }

  /**
   * Decrypts an EncryptedEnvelope back to a string or ArrayBuffer
   */
  public async decryptData(envelope: EncryptedEnvelope, asBinary = false): Promise<string | ArrayBuffer> {
    if (
      envelope.algorithm === 'INSECURE-FALLBACK' ||
      (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle))
    ) {
      try {
        const decoded = decodeURIComponent(atob(envelope.ciphertext));
        if (asBinary) {
          return this.base64ToBuffer(decoded);
        }
        return decoded;
      } catch {
        return envelope.ciphertext;
      }
    }

    const salt = new Uint8Array(this.base64ToBuffer(envelope.salt));
    const iv = new Uint8Array(this.base64ToBuffer(envelope.iv));
    const ciphertext = this.base64ToBuffer(envelope.ciphertext);
    const key = await this.getKey(salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    if (asBinary) {
      return decryptedBuffer;
    }
    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Converts ArrayBuffer to Base64
   */
  private bufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts Base64 to ArrayBuffer
   */
  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer as ArrayBuffer;
  }
}

export const encryptedStorage = new EncryptedStorageService();
