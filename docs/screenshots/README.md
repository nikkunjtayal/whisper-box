# Screenshots

| File | Purpose |
|---|---|
| `desktop-live.png` | Live demo desktop viewport |
| `mobile-live.png` | Live demo ~390×844 |
| `test-results.png` | Vitest evidence (≥10 / 15 passing) |

Regenerate:

```bash
npm install -D playwright
npx playwright install chromium
node scripts/capture-screens.mjs
```
