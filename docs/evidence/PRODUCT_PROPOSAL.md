# Product / Idea proposal — WhisperBox

**Chosen idea (from provided list):** Anonymous Feedback / Survey — verifiable participation, private responses  
**Product name:** WhisperBox  
**Author:** nikkunjtayal  
**Challenge period:** September Challenge (Active)  
**Network:** Midnight Preprod  
**Track category for form:** **Consumer focus**

---

## Copy-paste for Idea Submission form

### Question 1 — What is your idea?

```
WhisperBox — Anonymous Feedback / Survey on Midnight.

I am building (and already ship on Preprod) a privacy-first survey box: a participant proves a response was cast without revealing the private rating/comment claim on the public ledger.

How it works:
• Private: 32-byte witness claim (LE u64 rating + domain tag "WhisperB") + private circuit parameter `rating`
• Public (selective disclosure): submitted boolean, responseCount, latestCommitment = persistentHash(claim)
• Demo rule: submitted = (rating >= 1 && rating <= 5); under-demo ratings still allowed with submitted=false
• Level 2 does NOT publish per-option tallies (that would weaken anonymity)
• Wallet: 1AM on Preprod; proving prefers dapp-connector proof provider
• Live dApp: https://whisper-box-kappa.vercel.app
• Repo: https://github.com/nikkunjtayal/whisper-box
• Contract: see docs/evidence/DEPLOYMENT.md (Preprod 64-hex)
• Demo video: (Drive/YouTube — paste when recorded)

For Level 4–6 I will harden WhisperBox into a production-grade anonymous feedback product: multi-question private payloads, richer survey UX, monitoring, and clearer selective-disclosure flows aligned with Midnight’s consumer / privacy track — without ever putting ratings or per-option tallies on the public ledger.
```

### Question 2 — Choose a category

**Consumer focus**

(Maps to **Anonymous Feedback / Survey** on the Provided Idea List. Identity/credentials is the wrong fit here — we are not gating eligibility or allowlists.)

### Submission period

**September Challenge** — Active

---

## Problem

Surveys and feedback forms either leak answers on-chain or are not verifiable. Teams need “someone participated” plus integrity (a commitment) without publishing the private response.

## Solution (ships today)

- Compact circuit `submitFeedback(rating)` + getters  
- 1AM browser UI: Connect / Deploy / Join / Call  
- CI + Vitest (14 tests) + Vercel live demo  
- Privacy model documented in README (observer can / cannot)

### Data model

| Layer | Fields | Visibility |
|---|---|---|
| PRIVATE | `privateClaim` (32 bytes), circuit `rating` | Witness only — never cleartext on ledger |
| PUBLIC | `submitted`, `responseCount`, `latestCommitment` | After `disclose()` / Counter |

## Why Midnight

Midnight’s selective disclosure is the right primitive for anonymous surveys: prove participation with a private witness while the public ledger only learns validity + a commitment. That is stronger than publishing ratings on a transparent chain, and different from eligibility gates or private allowlists.

## Level 4–6 direction (after idea approval)

| Phase | Focus |
|---|---|
| Level 4 | Richer survey UX, multi-question private payloads (still anonymous feedback, not eligibility/allowlist) |
| Level 5 | Monitoring, hardened ops, clearer observer guarantees |
| Level 6 | Supermoon polish toward a reusable private-feedback SDK / product |

## Links

| Resource | URL |
|---|---|
| Repo | https://github.com/nikkunjtayal/whisper-box |
| Live demo | https://whisper-box-kappa.vercel.app |
| Demo video | See `docs/evidence/DEMO_VIDEO.md` |
| Contract | `docs/evidence/DEPLOYMENT.md` |
| Midnight RFS | https://midnight.network/request-for-start-ups |

## Approval ask

Please approve **Anonymous Feedback / Survey — WhisperBox** under **Consumer focus** for the September challenge Idea Submission (Level 4–6 scope).
