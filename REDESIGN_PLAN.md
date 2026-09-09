# DirectorOps Frontend Systematic Redesign Plan (Revised)

> **Product**: DirectorOps — Autonomous Master Control Room (MCR) SRE & Technical Director  
> **Aesthetic Mandate**: Modern professional broadcast engineering software × Premium cinematic production tooling × Extremely restrained enterprise software.  
> **Core Benchmark**: Blackmagic ATEM Television Studio × Linear Dark Zinc × Datadog Incident Command.  
> **Final Aesthetic Test**: *"Would this look plausible on software used by a professional broadcast engineer in a real control room?"* If the answer is no, simplify it.

---

## 1. Executive Summary & Core Design Principles

DirectorOps is being systematically redesigned to eliminate all "AI-generated cyber dashboard" tropes (excessive borders, nested cards, indiscriminate monospace, arbitrary cyan accents, scanlines, chromatic aberration, and pseudo-hacker decorations).

### 1.1 Visual Principles (Revised)

1. **Hierarchy Over Decoration**: The live program monitor is the hero of the master control room. Operational status is immediately obvious from across the room.
2. **Three Control Room Questions**: The `/control` interface must immediately answer three questions and nothing else:
   - **Is the feed healthy?** (Live tally, frame status, audio meter stability)
   - **If not, what is wrong?** (Primary fault diagnosis, affected node, metric breach)
   - **What is Gemini doing about it?** (Autonomous state, active mitigation action, failover target)
   - *Forensic technical clutter (raw PromQL inspection, MCP stdio packet dumps, JSON-RPC schemas) is strictly moved to `/incidents` or `/system`.*
3. **Restrained Warm Broadcast Accent**: Replace bright cyan (`#38bdf8`) with a restrained warm broadcast signal accent: **`#FF4D3D`** for brand identity, primary interventions, and active tally cues.
4. **Strict Semantic Colors**: Colors only communicate operational state—never decoration:
   - **Healthy**: Broadcast Green (`#10b981`)
   - **Warning**: Broadcast Amber (`#f59e0b`)
   - **Danger / Alert**: Signal Red (`#ef4444`)
   - **Information**: Muted Slate Blue (`#60a5fa`)
5. **No Decorative Glitch or Cyberpunk Effects**:
   - Completely remove chromatic aberration, RGB channel splitting, CRT scanlines, animated noise, and decorative glitch shaders.
   - Signal degradation is represented only through operationally believable behavior: frame stutter/drop, subtle macroblocking, clean freeze-frame slate, and erratic audio meter response.
6. **Restrained Pipeline Topology**: Minimal SVG routing diagram. Zero glowing particles, neon pulses, or energy animations. State changes are communicated strictly via line weight (1px vs 2px), opacity (30% vs 100%), crisp labels, and small semantic dots.
7. **Typography with Broadcast Authenticity**:
   - Use sentence and title case for all standard interface text, buttons, and navigation.
   - Reserve **ALL CAPS** strictly for authentic broadcast conventions (`ON AIR`, `PGM`, `STBY`, `REC`, `LIVE`).
   - Use interface sans (`Inter`/`Geist Sans`) for headings, body copy, and UI controls. Monospace (`Geist Mono`/`JetBrains Mono`) is reserved strictly for SMPTE timecodes, live numeric telemetry, PromQL/LogQL queries, node IDs, and cryptographic hashes.
8. **Purposeful Motion**: Motion communicates state transition only. Zero decorative looping animations. All transitions are short, quiet, and functional (< 200ms).
9. **Technical Audit Authority for Receipts**: `/receipts/[id]` must resemble a premium enterprise technical audit document—not a crypto, Web3, or NFT certificate. The HMAC seal appears only as a subtle, small supporting artifact.
10. **Provable Claims**: Landing page claims describe verified capabilities only (sub-second autonomous failover, Grafana MCP observability, verifiable HMAC proofs). Remove unsupported financial hype.

---

## 2. Final Design Token System

### 2.1 Studio Switcher Neutral Ramp
```css
:root {
  --bg-canvas: #09090b;           /* Deep obsidian control room canvas */
  --bg-surface: #121215;          /* Monitor bezels, primary panel surfaces */
  --bg-surface-elevated: #18181c; /* Elevated headers, modal sheets */
  --bg-surface-subtle: #1c1c22;   /* Subtle row highlights */
  
  --border-structural: #27272a;   /* Structural region dividers only */
  --border-subtle: #1e1e24;       /* Quiet internal item dividers */
  --border-focus: #3f3f46;        /* Active focus outlines */
  
  --text-primary: #fafafa;        /* High-contrast telemetry, titles */
  --text-secondary: #a1a1aa;      /* Subtitles, secondary status */
  --text-muted: #71717a;          /* Metadata, timecode labels, units */
}
```

### 2.2 Broadcast Signal & Semantic Tokens
```css
:root {
  /* Product Identity & Primary Tally Accent */
  --signal-accent: #FF4D3D;       /* Warm broadcast signal red-orange */
  --signal-accent-hover: #e03e2f; /* Interactive hover */
  --signal-accent-muted: rgba(255, 77, 61, 0.12); /* Subtle badge background */

  /* Operational State Semantics */
  --state-healthy: #10b981;       /* Nominal broadcast health, locked PTP */
  --state-healthy-muted: rgba(16, 185, 129, 0.12);
  --state-warning: #f59e0b;       /* Buffer warning, elevated jitter */
  --state-warning-muted: rgba(245, 158, 11, 0.12);
  --state-danger: #ef4444;        /* SLA breach, packet loss, fatal fault */
  --state-danger-muted: rgba(239, 68, 68, 0.12);
  --state-info: #60a5fa;          /* Muted informational indicators */
  --state-info-muted: rgba(96, 165, 250, 0.12);
}
```

### 2.3 Typography Hierarchy
| Element | Font Family | Size / Weight | Case | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Mark** | Interface Sans | `1.125rem` (18px) / Bold (700) | Title Case | "DirectorOps" |
| **Broadcast Tally** | Interface Sans | `0.75rem` (12px) / Bold (700) | **ALL CAPS** | `ON AIR`, `PGM 01`, `STANDBY` |
| **SMPTE Timecode** | Broadcast Mono | `0.9375rem` (15px) / Bold (700) | Monospace | `01:24:18:04` |
| **Telemetry Value** | Broadcast Mono | `1.875rem` (30px) / Bold (700) | Monospace | `59.94`, `12.48`, `0.00` |
| **Telemetry Label** | Interface Sans | `0.6875rem` (11px) / Medium (500) | Title Case | "Stream Bitrate", "Frame Rate" |
| **Operator State** | Interface Sans | `0.8125rem` (13px) / Bold (700) | **ALL CAPS** | `MONITORING`, `INVESTIGATING` |
| **Operational Prose**| Interface Sans | `0.8125rem` (13px) / Normal (400) | Sentence Case | Action sentences and diagnostic summaries |
| **Hashes / Queries** | Broadcast Mono | `0.6875rem` (11px) / Normal (400) | Monospace | PromQL, LogQL, SHA-256 digests |

---

## 3. Application Route Architecture

```
frontend/src/app/
├── layout.tsx                 # Root studio layout, global navigation & font tokens
├── globals.css                # Restrained broadcast styling tokens
├── page.tsx                   # Route 1: Landing / Product Introduction
├── control/
│   └── page.tsx               # Route 2: Primary Master Control Room (65/35 Composition)
├── incidents/
│   └── [id]/
│       └── page.tsx           # Route 3: Forensic Incident Timeline & MCP Inspector
├── receipts/
│   └── [id]/
│       └── page.tsx           # Route 4: Technical Audit Proof Receipt
└── system/
    └── page.tsx               # Route 5: Architecture & Runtime Boundaries
```

### 3.1 Route Breakdown

#### `/` — Landing / Product Introduction
- **Hero**: Clear statement of verified product capabilities: Autonomous Master Control Room SRE for live broadcast pipelines.
- **Visual Centerpiece**: High-resolution 1U rackmount chassis hardware showcase (`chassis_hero.jpg`) with callouts on hardware specs (dual redundant PSU, OLED telemetry, SDI/IP matrix).
- **Core Workflow**: Explain the automated sequence (Detection via Grafana MCP → Autonomous reasoning via Gemini 3.8 Flash → Atomic SDI failover → Tamper-evident HMAC receipts).
- **Provable Claims Only**: Focus on demonstrable capabilities (sub-second atomic failover, deterministic offline engine, zero-regression verifier).
- **Primary CTA**: Clean, prominent button launching `/control`.

#### `/control` — Primary Autonomous Master Control Room
- **Composition**: **65% Left / 35% Right** desktop split.
- **Core Purpose**: Answers the 3 critical control room questions at a glance.
- **Left (65%) — Dominant Live Program Monitor**:
  - Clean 16:9 cinema stage program feed (`cinema_stage.jpg`).
  - SMPTE 12M running timecode and `ON AIR` tally indicator.
  - Web Audio API 24-bin canvas spectrum (clean, smooth green/amber bars).
  - Optional 90% broadcast safe area framing guides.
  - Operationally believable degradation states (frame freeze/drop indicator, subtle macroblocking slate, audio stutter).
- **Right (35%) — Operational Control Stack**:
  1. **Pipeline Topology**: Clean, quiet SVG routing matrix showing Cam Rig A → Encoders (ENC 01 / ENC 02) → Origin → CDN. State change communicated purely through line weight and opacity.
  2. **Operational Health**: Clean, large telemetry figures (FPS, Bitrate, Packet Loss %, PTS Drift) with subtle tolerance indicators. Click navigates to `/incidents` or `/system` for deep PromQL inspection.
  3. **Gemini Operator**: Transforms visibly across 5 autonomous states (`MONITORING`, `INVESTIGATING`, `DECIDING`, `EXECUTING`, `VERIFIED`).
- **Header & Commands**:
  - Live SMPTE timecode and ATEM program tally.
  - Deliberate **`[Run Incident ▾]`** command dropdown (NVENC Buffer Overflow, CDN Edge 502, SMPTE ST 2059 PTP Drift) + **`[Reset Stream]`**.
  - Discreet runtime boundary pill (Gemini Cloud vs Offline Engine).

#### `/incidents/[id]` — Forensic Incident Timeline & MCP Inspector
- Deep-dive technical investigation page for an active or past incident.
- Chronological ReAct trace (Alert Ingestion → PromQL MCP Query → Loki MCP Log Inspection → Autonomous Synthesis → Crossbar Switch → Proof Sealing).
- Full MCP stdio message inspector displaying raw JSON-RPC 2.0 query strings, arguments, and return payloads.
- Direct link to inspect the signed mitigation receipt at `/receipts/[id]`.

#### `/receipts/[id]` — Technical Audit Proof Receipt
- Rendered as an authoritative enterprise technical audit document (clean white/zinc typographic hierarchy on dark obsidian canvas).
- Structured hierarchy:
  1. **Action Taken**: Explicit statement of remediation executed.
  2. **Root Cause**: Diagnosed failure mechanism isolated via Loki LogQL.
  3. **Observed Evidence**: Pre-incident telemetry breach (FPS drop, packet loss %, PTS desync).
  4. **Autonomous Decision**: Gemini 3.8 Flash synthesis and routing justification.
  5. **Execution Record**: Atomic matrix crossbar reroute confirmation and timestamp.
  6. **Verification Delta**: Pre vs post recovery telemetry table (e.g. 31.20 → 59.94 FPS).
  7. **Cryptographic Signatures**: Telemetry SHA-256 digest and HMAC-SHA256 signature seal.
- Small, tasteful HMAC seal artwork (`hmac_seal.jpg`) as a supporting technical artifact.
- Live client-side signature verification against `/api/receipt/verify`.
- One-click copy JSON and download `.json` receipt actions.

#### `/system` — Architecture & Runtime Boundaries
- **Runtime Boundaries**: Professional table detailing live cloud infrastructure vs local staged/simulated layers (replacing "Honesty Matrix").
  - Live: Next.js 15 UI, FastAPI SSE stream, real HMAC-SHA256 proof engine, real `mcp-grafana` stdio client, Gemini 3.8 Flash agent.
  - Simulated: Virtual SDI routing matrix (software state machine), synthetic telemetry fault injection, deterministic offline fallback.
- **Three-Hub Architecture**: Diagram and technical specifications for Observability Hub (Grafana MCP), Reasoning Hub (Gemini 3.8 Flash), and Remediation Hub (SDI Router & Proof Engine).
- **Official MCP Tool Schemas**: Documentation for `query_prometheus`, `query_loki`, `execute_failover`, and `create_annotation`.
- **60-Second CPU Reproduction**: Embeds `verify_in_60s.py` code block with one-click copy button (`python verify_in_60s.py`) and live backend health status.

---

## 4. Master Control Room (`/control`) Layout Blueprint

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STUDIO TOPBAR: [Logo] DirectorOps MCR 01  │  ● ON AIR  │  01:24:18:04 SMPTE  │ [Run Incident ▾] [Reset]│
├───────────────────────────────────────────────────────┬──────────────────────────────────────────┤
│ LEFT: HERO PROGRAM MONITOR (65% Width)                │ RIGHT: OPERATIONAL STACK (35% Width)     │
│                                                       │                                          │
│ ┌───────────────────────────────────────────────────┐ │ 1. PIPELINE TOPOLOGY                     │
│ │ LIVE PROGRAM MONITOR (16:9 Cinema Feed)           │ │ • Minimal SVG routes (1px/2px weights)   │
│ │ • Virtual Production LED Cinema Feed              │ │ • Cam Rig A ── ENC 01 (Primary) ── Origin│
│ │ • SMPTE Timecode & PGM Tally                      │ │ • Standby ENC 02 crossbar path           │
│ │ • 24-bin Audio Canvas Spectrum                    │ ├──────────────────────────────────────────┤
│ │ • Framing Safe Area Guides (90%)                  │ │ 2. OPERATIONAL HEALTH                    │
│ │ • Restrained Fault State (Freeze / Stutter Slate) │ │ • Large 30px Monospace Figures           │
│ │ • Operational Fault Banner (Red/Amber)            │ │ • 59.94 FPS • 12.48 Mbps • 0.00% Loss    │
│ └───────────────────────────────────────────────────┘ │ • Subtle SLA tolerance indicators        │
│ Stream Information Strip:                             ├──────────────────────────────────────────┤
│ UHD 3840×2160 • HEVC Main 10 • Lip-sync Locked • PTP  │ 3. GEMINI AUTONOMOUS OPERATOR            │
│                                                       │ State: [MONITORING / INVESTIGATING / ...]│
│ Answers Question 1: "Is the feed healthy?"            │ • Editorial action headline              │
│ Answers Question 2: "If not, what is wrong?"          │ • Concise reasoning status               │
│                                                       │ • Verified proof receipt link            │
│                                                       │                                          │
│                                                       │ Answers Question 3:                      │
│                                                       │ "What is Gemini doing about it?"         │
└───────────────────────────────────────────────────────┴──────────────────────────────────────────┘
```

### 4.1 Gemini Operator 5 Operational States
The Gemini Operator card cleanly transitions between:

1. **`MONITORING`**:
   - Indicator: Quiet green dot.
   - Headline: "System Nominal"
   - Detail: "Listening for Grafana Alertmanager telemetry triggers on channel `4k_main_live`. All signal paths nominal."
2. **`INVESTIGATING`**:
   - Indicator: Amber signal dot + elapsed latency timer.
   - Headline: "Investigating Anomaly"
   - Detail: "PTS desync +842ms detected on primary encoder. Dispatching PromQL and LogQL queries via Grafana MCP."
3. **`DECIDING`**:
   - Indicator: Warm signal accent dot (`#FF4D3D`).
   - Headline: "Formulating Mitigation"
   - Detail: "NVENC hardware ring buffer exhaustion diagnosed on Pod 01. Formulating atomic failover to standby Pod 02."
4. **`EXECUTING`**:
   - Indicator: Warm signal accent dot (`#FF4D3D`).
   - Headline: "Executing Failover"
   - Detail: "Switching virtual SDI crossbar to standby transcoder `transcoder-pod-us-east-02`."
5. **`VERIFIED`**:
   - Indicator: Solid green check.
   - Headline: "Resolution Verified"
   - Detail: "Broadcast SLA restored at 59.94 FPS, 0.00% packet loss. HMAC-SHA256 receipt sealed." Button: "View Audit Receipt →".

### 4.2 Deliberate "Run Incident" Command
- Triggered by a restrained ATEM-style button: **`[Run Incident ▾]`**.
- Opens a clean, focused popover offering the 3 supported real-world scenarios:
  1. **NVENC Buffer Overflow**: Primary encoder exhaustion, 14.8% packet drop, +842ms PTS drift.
  2. **CDN Edge 502 Timeout**: Origin packager timeout, edge 502 cascade, 2.8s latency.
  3. **SMPTE ST 2059 PTP Drift**: Master grandmaster clock drift, 48.5µs jitter.
- Paired with an immediate **`[Reset Stream]`** action button.

---

## 5. Reusable Component Strategy

```
frontend/src/components/
├── Navigation.tsx             # Global topbar (brand mark, route links, live timecode, tally)
├── LiveMonitor.tsx            # Hero 16:9 program monitor (cinema feed, audio spectrum, safe guides)
├── SignalTopology.tsx         # Minimalist SVG routing matrix (Cam A -> Encoders -> Origin -> CDN)
├── OperationalHealth.tsx      # High-visibility telemetry HUD (large monospace metrics, clean layout)
├── GeminiOperator.tsx         # 5-state autonomous operator panel (answers "What is Gemini doing?")
├── IncidentTriggerModal.tsx   # Deliberate "Run Incident" scenario selector
└── ReceiptView.tsx            # Shared audit receipt document (used in modal and /receipts/[id])
```

---

## 6. Implementation Invariants & Quality Verification

1. **Preserve Backend Integrations**:
   - Zero modifications to backend endpoints or SSE protocols.
   - `verify_in_60s.py` must continue to pass in < 5ms.
   - `pytest backend/tests/` must continue to pass 4/4 tests.
2. **Zero Fake Client Mocking**:
   - State mutations and agent thoughts must originate exclusively from real backend SSE events (`/api/incident/stream`) and REST calls (`/api/telemetry/inject-scenario`).
3. **TypeScript & Build Integrity**:
   - `npm run build` must succeed with 0 errors across all 5 routes.
4. **Visual Critique Protocol (Rule 5)**:
   - Run both backend and frontend servers.
   - Use automated browser tools to inspect each of the 5 routes in a real desktop viewport.
   - Conduct visual critique testing contrast, monospace discipline, lack of sci-fi tropes, and adherence to the 65/35 composition.
