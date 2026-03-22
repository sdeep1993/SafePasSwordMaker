import CryptoJS from 'crypto-js';

export async function generateHash(text: string, algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<string> {
  if (!text) return '';

  if (algorithm === 'MD5') {
    return CryptoJS.MD5(text).toString();
  }

  // Use Web Crypto API for SHA algorithms
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  let algoName = 'SHA-256';
  if (algorithm === 'SHA-1') algoName = 'SHA-1';
  if (algorithm === 'SHA-512') algoName = 'SHA-512';

  const hashBuffer = await crypto.subtle.digest(algoName, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
