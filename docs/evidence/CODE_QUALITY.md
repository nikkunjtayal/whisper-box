# Code quality — WhisperBox

Engineering fixes matched to approved Midnight Level 2 repos:

- Session-cache providers; always `setContractAddress` before private state / `callTx`
- Join via indexer HTTP `queryContractState` — do **not** hang on `watchForDeployTxData`
- Read public state via managed `ledger()` + indexer — do **not** use getter `callTx` for UI reads
- Vite dedupe single `ledger-v8` / `onchain-runtime`; polyfill `events` + `assert`
- Sync ZK keys/zkir to `web/public/zk/whisper-box/`
- Auto-join `DEFAULT_CONTRACT_ADDRESS` after Connect when set
- Local/browser proving preferred (`getProvingProvider`); HTTP proof-server fallback only
