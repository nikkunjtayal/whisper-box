# Code quality audit — WhisperBox Level 3

Date: 2026-09-30  
Scope: contract, witnesses, tests, providers, wallet bridge, UI, CI  
Product: Anonymous Feedback / Survey (not eligibility gate, not allowlist membership)

## Deep audit findings

| Area | Finding | Severity | Action |
|---|---|---|---|
| Provider session | Fresh Level store per click drops `setContractAddress` | High | Session-cached `getProviders()` in `web/src/lib/providers.ts` |
| Join hang | `watchForDeployTxData` waits forever after later ContractCalls | High | HTTP `queryContractState` / `queryDeployContractState` join |
| Getter txs | UI reads via `callTx` getters burn wallet proves | High | Indexer + managed `ledger()` for public view |
| Ledger WASM dupes | Multiple `ledger-v8` copies break types | High | Vite dedupe/alias + npm overrides |
| Node builtins in browser | `events` / `assert` externalized → runtime blank | High | Polyfill aliases in `web/vite.config.ts` |
| Proving path | HTTP proof URL fragile vs 1AM | Med | Prefer `dappConnectorProofProvider`; HTTP fallback only |
| Mobile layout | Grid cramped &lt;720px | Med | `@media (max-width: 720px)` full-width buttons |
| Witness coverage | Encoding must be explicit | Med | `tests/witnesses.test.ts` (LE rating, WhisperB, hex, malformed) |
| Secrets | Seeds / `.env` must never land in git | High | `.gitignore` + never commit identity files |
| CI | Need gate on every `main` push | High | `.github/workflows/ci.yml` |
| Privacy UX | Rating must never appear on public panel | High | Cleared after successful `submitFeedback`; public panel shows only submitted / count / commitment |
| Tallies | Per-option tallies would deanonymize | High | Level 2/3 intentionally omit public per-rating counters |

## Standards followed

- No secrets in repo
- Privacy UX: private rating cleared after successful `submitFeedback`
- Single provider instance per wallet session
- Official Midnight stack (`network-id`, indexer, level, fetch zk, dapp proving)
- Product stays anonymous survey / feedback — no NightGate eligibility or ShadePass allowlist copy
- Meaningful commits on `main` as `nikkunjtayal`

## Verification

```bash
npm test
npm run web:sync-zk
npm --prefix web ci
npm --prefix web run build
```

CI runs the same on every push to `main`.
