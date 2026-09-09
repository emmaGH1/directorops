---
trigger: always_on
description: DirectorOps workspace engineering invariants - preserve verified integrations, no fake frontend behavior, live vs simulated state transparency, broadcast switcher design system, and mandatory browser screenshot critiques.
---

# DirectorOps Workspace Engineering Invariants & Quality Rules

These rules are mandatory for all agents and contributors working in the **DirectorOps** codebase. They encode core lessons, quality bars, and operational constraints across backend integrations, frontend architecture, UI design, and verification workflows.

---

## Rule 1: Preserve Verified Integrations

**Never break, bypass, or regress existing verified integrations.**

- **Core Integrations Protected**:
  - **FastAPI SSE Event Stream** (`backend/app/main.py` -> `/api/events`): Must stream standard event types (`ALERT_INGEST`, `AGENT_REASONING`, `TOOL_CALL`, `TOOL_RESULT`, `AGENT_DECISION`, `FAILOVER_EXECUTED`, `MITIGATION_RECEIPT`).
  - **Grafana MCP Stdio Client** (`backend/app/mcp/grafana_mcp.py`): Must use official open-source `mcp-grafana` server over JSON-RPC 2.0 stdio with strict `GrafanaMCPError` handling.
  - **Gemini 3.8 Flash ReAct Agent** (`backend/app/agent/mcr_agent.py`): Multi-turn tool-calling loop using Google GenAI SDK (`google-genai`).
  - **Proof & Cryptographic Engine** (`backend/app/receipts/proof_engine.py`): Deterministic SHA-256 pre/post telemetry hashing and HMAC-SHA256 mitigation proof signing.
  - **60-Second CPU Verifier** (`verify_in_60s.py`): Zero-dependency test script that executes in < 5ms on Python standard library.
- **Enforcement & Guardrails**:
  - Run `python verify_in_60s.py` and `pytest backend/tests/` after modifying backend, agent, or telemetry code.
  - Maintain typed tool call schemas (`query_prometheus`, `query_loki`, `execute_failover`, `create_annotation`). Do not alter parameter signatures or payload contracts without updating all tests and verifiers.
  - Preserve zero-dependency deterministic fallback: when API keys (`GEMINI_API_KEY`, Grafana Cloud tokens) are absent or in `DEMO_MODE=True`, fallbacks must execute deterministically in < 5ms without hanging or crashing.

---

## Rule 2: Never Substitute Fake Frontend Behavior

**Do not mock, fake, or simulate interactive agent workflows in client-side React code.**

- **Real Backend Ingestion Only**:
  - All agent thought streaming, tool execution steps, and failover notifications must originate from real backend Server-Sent Events (`/api/events`) or real REST endpoints (`/api/scenarios/trigger`).
  - **Forbidden**: `setTimeout` or `setInterval` mock ladders in React components that pretend to execute agent steps, fake progress bars that increment arbitrarily, or client-side synthetic tool calls.
  - If backend streaming is offline or disconnected, the UI must display a prominent disconnected/reconnecting state, NOT fall back to client-side fake simulation.
- **Interactive Controls**:
  - Buttons like "Deploy SRE", "Inject NVENC Anomaly", or "Trigger Failover" must dispatch actual HTTP POST requests to the backend (`/api/scenarios/trigger`, `/api/failover`).
  - State mutations must flow strictly from backend event reception back into UI stores or React state.

---

## Rule 3: Clearly Distinguish Live and Simulated States

**Enforce radical transparency distinguishing live cloud infrastructure from staged or simulated broadcast components.**

- **Honesty Matrix Alignment (`HONESTY_TABLE.md`)**:
  - The UI and codebase must explicitly differentiate between:
    - **100% Live**: Next.js 15 HUD, FastAPI SSE pipeline, real SHA-256/HMAC proof signing, real `mcp-grafana` stdio client, real Gemini 3.8 Flash ReAct engine (when API key is provided).
    - **Simulated / Staged**: Virtual SDI routing matrix (simulated via `telemetry_engine.py` rather than physical $250k broadcast hardware routers), synthetic telemetry faults (NVENC buffer overflow, CDN 502, SMPTE ST 2059 PTP jitter), offline deterministic fallback payloads (when `DEMO_MODE=True`).
- **UI Labeling Mandates**:
  - Tally indicators and status pills must clearly show active operating modes:
    - `LIVE CLOUD (GEMINI 3.8 FLASH)` vs. `DETERMINISTIC OFFLINE ENGINE`
    - `LIVE GRAFANA MCP (STDIO)` vs. `STAGED PROMQL/LOGQL EMULATOR`
    - `VIRTUAL SDI ROUTER MATRIX` (never claim physical 12G-SDI hardware)
  - Never mislead hackathon judges, operators, or users regarding what is executing on live cloud infrastructure versus local deterministic emulation.

---

## Rule 4: Avoid Generic Cyberpunk Dashboard Patterns

**Adhere strictly to the professional broadcast engineering design language established in `DESIGN.MD`.**

- **Prohibited Clichés**:
  - Generic "cyberpunk / sci-fi hacker" tropes: random hex matrix backgrounds, gratuitous neon magenta/hot pink laser lines, unreadable decorative pseudo-code rain, spinning wireframe globes, or low-contrast neon-on-black text.
- **Prescribed Aesthetic: Minimalist Dark Studio Switcher**:
  - **Benchmarks**: Blackmagic ATEM Television Studio, Linear (Dark Zinc), Datadog Incident Command.
  - **Color Tokens**:
    - Canvas: Deep obsidian `#09090b` (`--bg-primary`).
    - Surfaces & Bezels: `#121215` (`--bg-surface`), `#18181c` elevated.
    - Subtle Dividers: `#27272a` (`--border-subtle`).
    - Semantic Accents: SMPTE Live Red `#ef4444`, Nominal Green `#10b981`, Warning Amber `#f59e0b`, Agent Cyan `#38bdf8`, Grafana Orange `#f97316`.
  - **Layout & Density**:
    - Dense dual-row Bento Grid architecture (`posts.design` / `navbar.gallery`) prioritizing above-the-fold telemetry density.
    - Functional typography: Interface sans (`Inter` / `Geist Sans`) paired with monospace (`Geist Mono` / `ui-monospace`) for SMPTE timecodes (`01:24:18:04`), telemetry metrics, and PromQL queries.
    - Functional micro-interactions: 24-bin Web Audio API `<canvas>` spectrum, chromatic aberration video glitch shader during packet loss spikes, and clean SVG bezier signal routing paths (`60fps.design`).

---

## Rule 5: Require Browser Screenshots Plus Visual Critique Before Calling UI Work Complete

**No UI implementation, styling change, or frontend bugfix is complete until it has been visually validated in a real browser.**

- **Mandatory Verification Protocol**:
  1. **Spin Up Environment**: Ensure Next.js dev server (`npm run dev`) and FastAPI backend are operational.
  2. **Automated Browser Inspection**: Use Chrome DevTools MCP or browser automation to load the dashboard page (`http://localhost:3000`).
  3. **Capture Viewport Screenshots**: Take high-resolution screenshots of key views:
     - Nominal steady-state broadcast HUD.
     - Active incident state (glitch shader, firing alert, tally light red).
     - Streaming Gemini agent reasoning drawer with raw MCP JSON-RPC payloads.
     - Mitigation receipt modal with cryptographic HMAC seal.
  4. **Perform Structured Visual Critique**:
     - Contrast and readability of monospace metrics.
     - Bento grid border alignment and padding consistency.
     - Correct rendering of SVG bezier routing paths and tally glows.
     - Responsive behavior across viewport sizes.
  5. **Artifact Documentation**: Embed or document the screenshot analysis and visual critique in walkthrough/handover documents before marking UI tasks resolved. Never rely solely on `tsc` or unit tests to declare frontend work finished.
