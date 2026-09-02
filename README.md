# SentinelPay — Web Dashboard

React front-end for SentinelPay, a real-time payment fraud detection engine. This repo is the interface; the rules engine and API live in the backend repo.

**Demo video:** https://youtu.be/pU54R6ApH4U?si=OI-iv70-if-16u8g
**Backend:** https://github.com/priya-codesdaily/sentinelpay-backend

> Both repos must be running together. Start the backend first — this app is useless without it.

---

## What this interface does

You submit a transaction. The backend scores it against four fraud rules and returns a risk score, a decision, and the specific reasons it fired. This app renders that decision as it happens.

| Screen area | What it shows |
|---|---|
| Transaction form | Amount and payee input, sitting side by side with the result so you can see cause and effect without scrolling |
| Risk meter | The 0–100 score as a colour-graded indicator — green through amber to red |
| Decision badge | APPROVED · FLAGGED · BLOCKED |
| Reasons list | Every rule that fired, in plain language, with the points it contributed |
| Summary cards | Total transactions, approval rate, and decision breakdown |
| Transaction history | Recent decisions, newest first |
| Attack simulator | Fires a burst of transactions at one payee so you can watch the velocity rule escalate the score in real time |

The attack simulator is the part worth watching. A single transaction looks innocent; the burst is where the score climbs and the decision flips.

---

## Device fingerprinting

Before each request, the app builds a fingerprint from browser-reported signals — user agent, screen dimensions, timezone, and language — and sends it with the transaction. The backend uses it to decide whether this device has been seen before for that payee.

This is deliberately one honest layer, not a complete solution. Every one of those signals can be spoofed by anyone who wants to.

---

## Screenshots

<!-- TODO: add these before sharing the repo widely. A README without screenshots gets closed.
Save to docs/ and reference them here. -->

---

## Running locally

**Prerequisites**
- Node 18 or newer
- The SentinelPay backend running on port 8081

**Setup**
```bash
npm install
npm run dev
```
Serves on `http://localhost:5173`.

---

## Configuration

The backend URL is currently hardcoded to `http://localhost:8081` directly inside `App.jsx`, rather than read from an environment variable. That's a known simplification, not an oversight — see **Known gaps** below.

---

## If the dashboard is empty but the backend works

This is almost always CORS. The front-end runs on `:5173` and the API on `:8081` — different ports are different origins, so the browser blocks the request even though the server is fine. Check the browser console for a blocked-origin error, and confirm the backend's CORS configuration allows `http://localhost:5173`.

Testing the API with `curl` will succeed while the browser fails, which is the clue that it's CORS and not the backend.

If the frontend has silently drifted to a different port (5174, 5175 — Vite does this automatically when 5173 is already in use), that alone will trigger this same error, since the backend only allows the original port. Killing stray Node processes and restarting cleanly on 5173 fixes it.

---

## Stack

React with Vite, plain inline styles, Oxlint. No component library or CSS framework — the risk meter, badges, and cards are hand-built.

---

## Project layout

Everything currently lives in a single `App.jsx` file — the form, risk meter, decision card, reasons list, dashboard cards, history table, and the device fingerprint logic all sit together in one component. Splitting this into separate components (`RiskMeter`, `TransactionForm`, `HistoryTable`, etc.) is a natural next step, but the priority so far has been getting the feature set working end-to-end before organizing it.

```
src/
└── App.jsx    # everything: form, state, API calls, and all rendered UI
```

---

## Known gaps

- No loading or error states on a slow or dead backend — the UI just sits there.
- No input validation on the client; invalid amounts are rejected by the server, not caught here.
- The history view isn't paginated, so it will slow down once there are thousands of rows.
- Backend URL is hardcoded rather than environment-configurable.
- Not responsive below tablet width.
- No component split — see **Project layout**.
- No tests.

---

Built by Anshu Priya. Full design notes, API contract, and the fraud rules themselves are documented in the backend repo.
