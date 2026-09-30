import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as RT from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  ledger,
} from "../contracts/managed/whisper-box/contract/index.js";
import {
  createPrivateState,
  decodeRating,
  encodeClaim,
  DOMAIN_TAG,
  witnesses,
  type WhisperBoxPrivateState,
} from "../src/witnesses.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const managed = join(root, "contracts", "managed", "whisper-box");

const COIN = "0".repeat(64);
const ADDR = RT.sampleContractAddress();

function setup(rating: bigint) {
  const privateState: WhisperBoxPrivateState = createPrivateState(rating);
  const contract = new Contract(witnesses);
  const ctor = contract.initialState(
    RT.createConstructorContext(privateState, COIN),
  );
  const ctx = RT.createCircuitContext(
    ADDR,
    COIN,
    ctor.currentContractState,
    ctor.currentPrivateState,
  );
  return { contract, ctx, privateState };
}

describe("WhisperBox managed artifacts", () => {
  it("ships compiler, contract, keys, and zkir directories", () => {
    for (const dir of ["compiler", "contract", "keys", "zkir"]) {
      expect(existsSync(join(managed, dir)), `missing ${dir}`).toBe(true);
    }
  });

  it("lists expected circuits and witness in contract-info.json", () => {
    const infoPath = join(managed, "compiler", "contract-info.json");
    expect(existsSync(infoPath)).toBe(true);
    const info = JSON.parse(readFileSync(infoPath, "utf8")) as {
      circuits: { name: string }[];
      witnesses: { name: string }[];
      "compiler-version": string;
    };
    expect(info["compiler-version"]).toBe("0.31.1");
    const names = info.circuits.map((c) => c.name).sort();
    expect(names).toEqual(
      [
        "submitFeedback",
        "getResponseCount",
        "getSubmitted",
        "getLatestCommitment",
      ].sort(),
    );
    expect(info.witnesses.map((w) => w.name)).toContain("privateClaim");
  });

  it("has prover/verifier keys for every circuit", () => {
    const keys = readdirSync(join(managed, "keys"));
    for (const circuit of [
      "submitFeedback",
      "getResponseCount",
      "getSubmitted",
      "getLatestCommitment",
    ]) {
      expect(keys).toContain(`${circuit}.prover`);
      expect(keys).toContain(`${circuit}.verifier`);
    }
  });
});

describe("WhisperBox claim encoding", () => {
  it("encodes LE rating and WhisperB domain tag", () => {
    const claim = encodeClaim(4n);
    expect(claim.length).toBe(32);
    expect(decodeRating(claim)).toBe(4n);
    expect(new TextDecoder().decode(claim.slice(24))).toBe(DOMAIN_TAG);
  });
});

describe("WhisperBox runtime ledger", () => {
  it("starts with submitted=false, responseCount=0, empty commitment", () => {
    const { ctx } = setup(3n);
    const state = ledger(ctx.currentQueryContext.state);
    expect(state.submitted).toBe(false);
    expect(state.responseCount).toBe(0n);
    expect(state.latestCommitment.every((b) => b === 0)).toBe(true);
  });

  it("marks submitted=true and bumps count for rating in 1..5", () => {
    const { contract, ctx } = setup(4n);
    const after = contract.impureCircuits.submitFeedback(ctx, 4n);
    const state = ledger(after.context.currentQueryContext.state);
    expect(state.submitted).toBe(true);
    expect(state.responseCount).toBe(1n);
    expect(state.latestCommitment.some((b) => b !== 0)).toBe(true);

    const submitted = contract.impureCircuits.getSubmitted(after.context);
    expect(submitted.result).toBe(true);
    const count = contract.impureCircuits.getResponseCount(after.context);
    expect(count.result).toBe(1n);
  });

  it("allows under-demo rating 0 but sets submitted=false", () => {
    const { contract, ctx } = setup(0n);
    const after = contract.impureCircuits.submitFeedback(ctx, 0n);
    const state = ledger(after.context.currentQueryContext.state);
    expect(state.submitted).toBe(false);
    expect(state.responseCount).toBe(1n);
    expect(state.latestCommitment.some((b) => b !== 0)).toBe(true);
  });

  it("allows rating 9 (outside range) with submitted=false", () => {
    const { contract, ctx } = setup(9n);
    const after = contract.impureCircuits.submitFeedback(ctx, 9n);
    const state = ledger(after.context.currentQueryContext.state);
    expect(state.submitted).toBe(false);
    expect(state.responseCount).toBe(1n);
  });

  it("accepts boundary ratings 1 and 5 as submitted=true", () => {
    const low = setup(1n);
    const afterLow = low.contract.impureCircuits.submitFeedback(low.ctx, 1n);
    expect(ledger(afterLow.context.currentQueryContext.state).submitted).toBe(true);

    const high = setup(5n);
    const afterHigh = high.contract.impureCircuits.submitFeedback(high.ctx, 5n);
    expect(ledger(afterHigh.context.currentQueryContext.state).submitted).toBe(true);
  });

  it("updates commitment and count on successive submissions", () => {
    const { contract, ctx } = setup(3n);
    const first = contract.impureCircuits.submitFeedback(ctx, 3n);
    const mid = ledger(first.context.currentQueryContext.state);
    const second = contract.impureCircuits.submitFeedback(first.context, 0n);
    const end = ledger(second.context.currentQueryContext.state);
    expect(mid.responseCount).toBe(1n);
    expect(end.responseCount).toBe(2n);
    expect(end.submitted).toBe(false);
    expect(end.latestCommitment.some((b) => b !== 0)).toBe(true);
    const commitment = contract.impureCircuits.getLatestCommitment(
      second.context,
    );
    expect(commitment.result).toEqual(end.latestCommitment);
  });
});
