import { describe, expect, it } from "vitest";
import {
  bytesToHex,
  createPrivateState,
  decodeRating,
  DOMAIN_TAG,
  encodeClaim,
  hexToBytes,
  witnesses,
} from "../src/witnesses.js";

describe("WhisperBox witness encoding", () => {
  it("encodes LE u64 rating in the first 8 bytes", () => {
    const claim = encodeClaim(0x0102030405060708n);
    expect(claim.length).toBe(32);
    expect(claim[0]).toBe(0x08);
    expect(claim[1]).toBe(0x07);
    expect(claim[2]).toBe(0x06);
    expect(claim[3]).toBe(0x05);
    expect(claim[4]).toBe(0x04);
    expect(claim[5]).toBe(0x03);
    expect(claim[6]).toBe(0x02);
    expect(claim[7]).toBe(0x01);
    expect(decodeRating(claim)).toBe(0x0102030405060708n);
  });

  it("stamps domain tag WhisperB at bytes 24..31", () => {
    const claim = encodeClaim(1n);
    expect(new TextDecoder().decode(claim.subarray(24, 32))).toBe(DOMAIN_TAG);
    expect(DOMAIN_TAG.length).toBe(8);
  });

  it("round-trips claim bytes through hex helpers", () => {
    const claim = encodeClaim(5n);
    const hex = bytesToHex(claim);
    expect(hex).toHaveLength(64);
    expect(bytesToHex(hexToBytes(hex))).toBe(hex);
    expect(decodeRating(hexToBytes(hex))).toBe(5n);
  });

  it("rejects malformed privateClaim lengths", () => {
    expect(() =>
      witnesses.privateClaim({
        privateState: { claim: new Uint8Array(16) },
      }),
    ).toThrow(/32-byte/);
    expect(() => decodeRating(new Uint8Array(8))).toThrow(/32 bytes/);
    expect(() => hexToBytes("abc")).toThrow(/invalid hex/);
  });

  it("createPrivateState wraps encodeClaim for session storage", () => {
    const state = createPrivateState(4n);
    expect(state.claim).toEqual(encodeClaim(4n));
    const [next, out] = witnesses.privateClaim({ privateState: state });
    expect(next).toBe(state);
    expect(out).toBe(state.claim);
  });
});
