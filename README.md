# SentinelPay

**A real-time payment risk engine that explains every decision it makes.**

[Demo Video](https://youtu.be/pU54R6ApH4U) · [Backend Repo](https://github.com/priya-codesdaily/sentinelpay-backend) · [Frontend Repo](https://github.com/priya-codesdaily/sentinelpay-web)

---

## The Problem

Most payment demo projects store a transaction and show a success message. The part that actually protects people's money — deciding whether a transaction should be trusted *before* it clears — is usually skipped entirely.

SentinelPay is built around that harder problem: **evaluate every transaction in real time, score its risk against explainable rules, and justify the decision instead of acting as a black box.**

---

## What It Does

| Capability | Problem it solves | Example |
|---|---|---|
| **Explainable risk scoring** | Black-box "blocked" decisions aren't trustworthy or debuggable | A ₹15,000 transaction at 1am returns `Risk: 45, FLAGGED — "High amount (+30)", "Unusual hour (+15)"` |
| **Live attack simulation** | Fraud usually shows up as a *pattern* over time, not one isolated event | A burst of 7 rapid transactions visibly escalates: `APPROVED → APPROVED → FLAGGED → BLOCKED` in real time |
| **Device fingerprinting** | A known user suddenly transacting from an unfamiliar device is a real fraud signal | User "anshu" on a new browser adds `+20, "Transaction from unrecognized device"` |
| **Live dashboard** | Raw transaction rows aren't useful without aggregation | `137 Total · 47 Blocked · 27 Flagged · 46% Approval Rate`, computed live from stored data |
| **Permanent persistence** | A fraud system that forgets on restart isn't a real system | Transaction history survives server restarts — backed by PostgreSQL, not memory |

---

## How the Risk Engine Works

Each transaction is scored against independent rules. Points accumulate; nothing is a single point of failure.

| Rule | Trigger condition | Points | Rationale |
|---|---|---|---|
| High amount | Transaction > ₹10,000 | +30 | Unusually large transactions carry more inherent risk |
| Unusual hour | Between 11pm and 5am | +15 | Off-hours activity correlates with fraud in real payment data |
| Velocity | More than 3 transactions from the same source in 60 seconds | Escalating, up to +80 | Penalty scales with pattern severity rather than tripping once at a flat rate |
| Unrecognized device | Known payee, never-seen device fingerprint | +20 | A sudden device change on an established account is a genuine signal |

**Decision thresholds:** `0–39 → Approved` · `40–69 → Flagged` · `70+ → Blocked`

---

## Architecture

```
React (Vite)
     │  POST /transaction { amount, payee, deviceFingerprint }
     ▼
Controller  →  Service (rules engine)  →  Repository  →  PostgreSQL
     ▲                                                        │
     └────────────── { riskScore, decision, reasons } ◄───────┘
```

Classic 3-layer separation: the Controller only handles HTTP, the Service holds all fraud logic, the Repository only talks to the database — each layer stays ignorant of the others' internals.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Java, Spring Boot | Structured, production-grade conventions used in real fintech backends |
| Frontend | React (Vite) | Industry-default for dashboard-style interfaces |
| Database | PostgreSQL | ACID guarantees suit transactional, financial-style data |
| Build | Maven | Standard Spring Boot dependency/build management |

---

## Running Locally

**Backend**
```bash
# create a PostgreSQL database named "sentinelpay"
cp application.properties.example application.properties
# fill in your local database credentials
./mvnw spring-boot:run
# runs on http://localhost:8081
```

**Frontend**
```bash
npm install
npm run dev
# runs on http://localhost:5173
```

Both must run simultaneously — the frontend is non-functional without the backend.

---

## Known Limitations

Being upfront about these because a system that hides its own limitations is less trustworthy than one that names them:

| Limitation | Why it exists | Fix on the roadmap |
|---|---|---|
| Velocity tracking is in-memory | Fast for a single-instance demo | Redis, for shared state across instances |
| No authentication | Out of scope for the current phase | JWT-based auth |
| Device fingerprint is spoofable | Browser-reported signals only | Additional signals (IP, behavioral patterns) |
| Rules are hand-tuned, not learned | Deterministic and explainable by design | ML layer *on top of* rules, not replacing them |

---

## Roadmap

| Phase | Addition | Purpose |
|---|---|---|
| Next | **Scam-intent detection** | Ask "why are you making this payment?" on risky transactions and check the answer against known scam-language signals (guaranteed returns, urgency, OTP requests) |
| Next | **Redis-based velocity tracking** | Replace in-memory state with shared, distributed rate limiting |
| Next | **Fuller decision states** | Expand from Approve/Flag/Block to Approve/Warn/Step-Up/Hold/Block |
| Later | **Beneficiary verification** | Flag new or high-fan-in beneficiary accounts before payment clears |
| Later | **Fraud graph (Neo4j)** | Detect mule-account patterns via fan-in/fan-out relationship analysis |
| Exploratory | **Investigation timeline UI** | Convert a flagged case into a readable step-by-step trail for analysts |

---

## Project Status

Actively in development. Core risk engine, live simulation, device recognition, and persistence are complete and demoed in the video above. See Roadmap for what's being built next.

Built by Anshu Priya.
