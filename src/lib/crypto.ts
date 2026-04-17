import "server-only"
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const ALGO = "aes-256-gcm"
const IV_LEN = 12 // GCM recommended 96-bit IV
const AUTH_TAG_LEN = 16

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex) {
    throw new Error("ENCRYPTION_KEY is not set")
  }
  if (hex.length !== 64) {
    throw new Error(
      `ENCRYPTION_KEY must be 32 bytes hex (64 chars), got ${hex.length}`,
    )
  }
  return Buffer.from(hex, "hex")
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url")
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url")
}

/**
 * Encrypts plaintext with AES-256-GCM. Output format: `iv.ciphertext.authTag`
 * where each segment is base64url.
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return `${b64url(iv)}.${b64url(ciphertext)}.${b64url(authTag)}`
}

/**
 * Decrypts a blob previously produced by `encrypt`. Throws on tamper or wrong key.
 */
export function decrypt(blob: string): string {
  const parts = blob.split(".")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted blob format")
  }
  const [ivB64, ctB64, tagB64] = parts
  const iv = fromB64url(ivB64)
  const ciphertext = fromB64url(ctB64)
  const authTag = fromB64url(tagB64)
  if (iv.length !== IV_LEN || authTag.length !== AUTH_TAG_LEN) {
    throw new Error("Invalid IV or auth tag length")
  }
  const key = getKey()
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(authTag)
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8")
  return plaintext
}

/** Safely decrypt; returns null on any error (missing key, tamper, bad format). */
export function tryDecrypt(blob: string | null | undefined): string | null {
  if (!blob) return null
  try {
    return decrypt(blob)
  } catch {
    return null
  }
}

/** Returns a masked preview like "AIza••••…XXXX" — never the real key. */
export function maskKey(plaintext: string): string {
  if (plaintext.length <= 8) return "••••"
  const head = plaintext.slice(0, 4)
  const tail = plaintext.slice(-4)
  return `${head}••••…${tail}`
}
