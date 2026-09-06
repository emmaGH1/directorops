# Product Requirements Document (PRD): DirectorOps
## Autonomous Master Control Room (MCR) SRE for Live Broadcast Cinema & Virtual Production

---

### Document Control
- **Product Name**: DirectorOps
- **Version**: 1.0.0-PROD
- **Target Hackathon**: [Agentic Cinema: The Blockbuster Hackathon](https://agentic-cinema.devpost.com/)
- **Target Sponsor Track**: **Grafana Labs Track** ($15,000 Track Purse)
- **Status**: APPROVED FOR PRODUCTION & SUBMISSION
- **Repository**: [https://github.com/emmaGH1/directorops](https://github.com/emmaGH1/directorops)
- **License**: MIT License

---

## 1. Executive Summary & Problem Statement

### 1.1 The $100,000/Minute Hollywood Bottleneck
Live entertainment broadcasts—the Academy Awards (Oscars) telecast, Netflix Live global events, Disney+ stadium concerts, and virtual production LED volumes (StageCraft)—operate on zero-tolerance SLA margins. 

* **The Financial Toll**: Live OTT stream blackouts and severe degradation cost broadcasters between **$50,000 and $120,000 per minute** in lost programmatic ad impressions, compliance fines, and audience churn.
* **The Silent Degradation Problem**: Catastrophic broadcast incidents rarely manifest as complete hard crashes. Instead, they begin as silent buffer saturations:
  1. An NVENC hardware ring buffer exhausts on a single transcode pod.
  2. Audio and Video Presentation Timestamps (PTS) drift apart by **+842ms**, causing jarring lip-sync desynchronization.
  3. UDP frame drops spike to **14.8%**, inducing severe macroblocking across millions of downstream smart TV clients.
* **The Cognitive Overload**: In physical Master Control Rooms (MCRs), human technical directors take **8 to 15 minutes** to manually cross-correlate dozens of fragmented Grafana dashboards, Prometheus time-series alerts, and Loki log streams to isolate the malfunctioning pod and execute an SDI/IP video router failover.
* **The Solution**: **DirectorOps** replaces human triage latency with an autonomous Master Control Room Incident Commander powered by **Google Cloud Gemini 2.0** multi-turn ReAct reasoning and the official **Grafana Cloud Model Context Protocol (MCP)** server.

---

## 2. Target Personas & User Stories

| Persona | Role | Primary Pain Point | DirectorOps Impact |
|---|---|---|---|
| **MCR Technical Director** | Live Event Operator | Swamped by 50+ alerts during peak broadcast; high risk of misdiagnosing encoder failures under stress. | Sub-second autonomous diagnosis and instant 1-click or automated failover execution. |
| **Broadcast Reliability Engineer (SRE)** | Infrastructure Owner | Lack of verifiable audit trails after post-incident post-mortems; disputed cloud SLA credits. | Cryptographically signed `MitigationReceipt` with HMAC-SHA256 telemetry digest. |
| **Virtual Production Supervisor** | Volume Stage Lead (LED Wall) | Genlock PTP clock drift causes camera shutter/LED scan line tearing during live takes. | Automated PTP grandmaster jitter isolation and SMPTE ST 2059-2 re-synchronization. |

---

## 3. Sponsor Alignment & Compliance Matrix

### 3.1 Google Cloud AI Track Compliance
- **Permitted LLM**: Exclusively uses Google Cloud AI (`google-genai` SDK / Gemini 2.0 Flash / Gemini 2.0 Pro).
- **Tool Calling Architecture**: Uses native Google Gemini function declarations (`types.FunctionDeclaration`) to invoke Grafana MCP tools.
- **Strict Compliance**: Zero usage of prohibited model providers (OpenAI, Anthropic, AWS Bedrock).

### 3.2 Grafana Labs Track Compliance ($15,000 Track Purse)
- **Active Runtime Integration**: Connects directly to Grafana Cloud via the Model Context Protocol (MCP JSON-RPC 2.0).
- **Core MCP Tooling**:
  1. `query_prometheus`: Executes PromQL queries (`rate(node_network_transmit_drop_total[1m])`, `nvenc_encoder_buffer_saturation`) to quantify stream health.
  2. `query_loki`: Executes LogQL queries (`{app="transcoder"} |= "PTS desync"`) to isolate hardware segfaults.
  3. `create_annotation`: Posts broadcast incident mitigation markers onto the live Grafana dashboard timeline with cryptographic proof hashes.
- **Failover & Sandbox Modes**: Seamless dual-execution support for live Grafana Cloud MCP instances or zero-dependency embedded mock engines for judge evaluation.

---

## 4. System Architecture & Component Breakdown

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    DIRECTOROPS SYSTEM ARCHITECTURE                     │
 └────────────────────────────────────────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
 ┌───────────────────┐                               ┌───────────────────┐
 │ Next.js 15 Studio │ ◄── Server-Sent Events (SSE) ─┤  FastAPI Gateway  │
 │ Bento Grid HUD    │                               │  (Port 8000)      │
 └───────────────────┘                               └───────────────────┘
           │                                                   │
           ├─ SMPTE Timecode Clock                             ├─ Telemetry Engine
           ├─ Web Audio 24-bin Spectrum                        ├─ Grafana MCP Client
           ├─ SVG Signal Topology Graph                        ├─ Proof Engine (HMAC)
           └─ Telemetry Sparklines (PromQL)                    └─ MCRAgent (Gemini)
                                                                       │
                                                       ┌───────────────┴───────────────┐
                                                       ▼                               ▼
                                             ┌───────────────────┐           ┌───────────────────┐
                                             │  Google Cloud AI  │           │ Grafana Cloud MCP │
                                             │  Gemini 2.0 Flash │           │ PromQL / LogQL    │
                                             └───────────────────┘           └───────────────────┘
```

### 4.1 Backend Engine (`backend/app/`)
1. **`config.py`**: Pydantic v2 configuration schema supporting zero-config `DEMO_MODE=true` and live production API keys (`GEMINI_API_KEY`, `GRAFANA_SA_TOKEN`, `GRAFANA_URL`).
2. **`telemetry/telemetry_engine.py`**: Broadcast infrastructure simulation generating live SMPTE telemetry across ingest cameras, primary/standby transcoding pods, origin packagers, and CDN edge egress.
3. **`mcp/grafana_mcp.py`**: Official Grafana Cloud MCP JSON-RPC 2.0 client supporting bidirectional tool discovery and query execution.
4. **`agent/mcr_agent.py`**: Google Cloud Gemini 2.0 multi-turn ReAct orchestrator managing prompt construction, tool execution, decision synthesis, and mitigation verification.
5. **`receipts/proof_engine.py`**: Cryptographic receipt generator producing SHA-256 state digests and HMAC signatures for indisputable SLA compliance audits.
6. **`main.py`**: High-performance FastAPI router serving REST management endpoints and real-time Server-Sent Events (SSE) to the frontend.

### 4.2 Frontend Operator Interface (`frontend/src/`)
1. **Studio Header (`components/Header.tsx`)**: High-contrast broadcast bar featuring live tally status (`PROGRAM` / `REHEARSAL`), SMPTE timecode clock (`01:42:19:12`), scenario triggers, and one-click autonomous intervention controls.
2. **Live Cinema Monitor (`components/LiveMonitor.tsx`)**: 16:9 4K preview monitor featuring a 24-bin canvas Web Audio frequency visualizer, broadcast framing guides, dynamic glitch shaders, and live stream telemetry overlays.
3. **Signal Routing Topology (`components/SignalTopology.tsx`)**: Interactive SVG node graph visualizing the SDI/IP signal path (`Camera Rig A -> Transcoder 01 -> Origin Packager -> CDN Edge`) with animated bezier flow lines and real-time failover rerouting to Transcoder 02.
4. **Telemetry HUD (`components/TelemetryHUD.tsx`)**: Broadcast telemetry telemetry sparklines (FPS, Bitrate, Packet Loss %, PTS Drift) with PromQL query inspection modals and deep-links to Grafana Cloud.
5. **Agent Reasoning Drawer (`components/AgentDrawer.tsx`)**: Linear/Datadog-style incident activity feed streaming live Gemini model thoughts, expandable raw JSON-RPC MCP tool calls, and cryptographic mitigation receipts.
6. **Mitigation Receipt Modal (`components/ReceiptModal.tsx`)**: Interactive inspector displaying the cryptographic HMAC-SHA256 signature, before/after telemetry delta, and PromQL audit trail.

---

## 5. Functional Requirements (FR)

### FR1: Real-time Broadcast Telemetry Simulation
- The system MUST simulate live broadcast metrics at 60Hz: FPS (59.94 nominal), Bitrate (12.5 Mbps nominal), Packet Loss % (0.00% nominal), and PTS Drift (4.0ms nominal).
- The system MUST simulate 3 distinct broadcast failure scenarios:
  1. `nvenc_buffer_overflow`: Hardware GPU saturation (98.6%), dropped frames (14.8%), PTS desync (+842ms).
  2. `cdn_edge_502`: HTTP 502 Bad Gateway cascade on edge egress; origin response latency > 2.8s.
  3. `genlock_clock_drift`: SMPTE ST 2059-2 PTP clock reference jitter exceeding 45μs; virtual production LED interlace mismatch.

### FR2: Grafana Cloud MCP Integration
- The system MUST implement JSON-RPC 2.0 client bindings compatible with `grafana/mcp-grafana`.
- The system MUST provide `query_prometheus` to query time-series metrics using PromQL.
- The system MUST provide `query_loki` to query application and syslog streams using LogQL.
- The system MUST provide `create_annotation` to post timestamped mitigation events to Grafana dashboards.

### FR3: Autonomous Investigation & Decision Loop
- The system MUST orchestrate an agentic ReAct loop using Google Cloud Gemini 2.0.
- The agent MUST inspect the active incident alert, formulate diagnostic PromQL/LogQL queries, evaluate tool responses, and autonomously decide whether to execute an SDI/IP video ingest failover.
- The system MUST complete the autonomous diagnosis and failover in under 3.0 seconds.

### FR4: Cryptographic Answer Receipts
- The system MUST generate an immutable `MitigationReceipt` upon incident resolution.
- The receipt MUST compute a SHA-256 digest of pre-incident and post-incident telemetry states.
- The receipt MUST sign the digest with an HMAC-SHA256 cryptographic key.
- The receipt MUST be downloadable as JSON and inspectable via the frontend UI.

---

## 6. Non-Functional Requirements (NFR)

### NFR1: Standalone 60-Second CPU Reproducibility
- The entire system verification script (`verify_in_60s.py`) MUST execute in **under 60 seconds** on a standard single-core CPU with **zero third-party dependencies** (pure standard library: `hashlib`, `hmac`, `json`, `time`, `urllib`).
- Benchmarked reproduction speed MUST remain under 10 milliseconds.

### NFR2: Zero Hallucination & Transparency
- All mock and live boundaries MUST be explicitly declared in `HONESTY_TABLE.md`.
- No simulated data shall be represented as live cloud telemetry without transparent UI labeling.

### NFR3: Visual & Operational Polish
- The frontend UI MUST adhere to professional broadcast studio aesthetics (`DESIGN.MD`), utilizing dark-theme zinc backgrounds (`#09090b`), high-visibility amber/emerald tally indicators, and zero generic boilerplate styling.

---

## 7. Success Criteria & Hackathon KPIs

1. **Deterministic Verification**: `python verify_in_60s.py` runs with 100% pass rate in < 5ms.
2. **Automated Test Coverage**: 4/4 pytest suites passing (`backend/tests`).
3. **Frontend Compilation**: Next.js 15 compiles with 0 TypeScript/ESLint errors.
4. **Sponsor Track Alignment**: Active Grafana Cloud MCP tool utilization demonstrated in live UI and code.
5. **3-Minute Demo Video**: Clear, engaging walkthrough demonstrating all 3 failure scenarios and autonomous resolution.
