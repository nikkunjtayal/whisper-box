# WhisperBox — deployment

| Field | Value |
|---|---|
| Network | **Preprod** (Level 2 — Waxing Crescent) |
| Contract address | `PENDING_PREPROD_DEPLOY` |
| Deployer unshielded | _(fill after 1AM UI deploy)_ |
| Timestamp (UTC) | _(fill)_ |
| Indexer | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| Node / RPC | `https://rpc.preprod.midnight.network` |
| Faucet | `https://faucet.preprod.midnight.network` |

## Notes

- Prefer **Connect 1AM → Deploy to Preprod** in the live UI, then paste the 64-hex address here.
- CLI path: `MIDNIGHT_SEED=… npm run deploy:preprod` (requires funded wallet + local proof server).
- Secrets (seeds) are never committed.
