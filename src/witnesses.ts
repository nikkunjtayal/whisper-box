/**
 * Shared WhisperBox private claim helpers (browser + Node).
 * Encoding: first 8 bytes LE u64 rating; trailing tag "WhisperB".
 * Anonymous survey / feedback semantics only — no eligibility or allowlist.
 */

export type WhisperBoxPrivateState = {
  claim: Uint8Array;
};

export const PRIVATE_STATE_ID = "whisperBoxPrivateState";
export const DOMAIN_TAG = "WhisperB";

export function encodeClaim(rating: bigint): Uint8Array {
  const claim = new Uint8Array(32);
  const view = new DataView(claim.buffer);
  view.setBigUint64(0, rating, true);
  claim.set(new TextEncoder().encode(DOMAIN_TAG), 24);
  return claim;
}

export function createPrivateState(rating: bigint): WhisperBoxPrivateState {
  return { claim: encodeClaim(rating) };
}

export const witnesses = {
  privateClaim(context: {
    privateState: WhisperBoxPrivateState;
  }): [WhisperBoxPrivateState, Uint8Array] {
    const { claim } = context.privateState;
    if (!(claim instanceof Uint8Array) || claim.length !== 32) {
      throw new Error("privateClaim requires a 32-byte claim");
    }
    return [context.privateState, claim];
  },
};

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/^0x/, "");
  if (cleaned.length % 2 !== 0) throw new Error("invalid hex");
  const out = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function decodeRating(claim: Uint8Array): bigint {
  if (claim.length !== 32) throw new Error("claim must be 32 bytes");
  return new DataView(claim.buffer, claim.byteOffset, claim.byteLength).getBigUint64(
    0,
    true,
  );
}
