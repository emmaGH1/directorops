# Operational Handover & Engineering Playbook: DirectorOps
## Autonomous Master Control Room (MCR) SRE & Incident Commander

---

### Document Overview
- **Project**: **DirectorOps**
- **Repository**: [https://github.com/emmaGH1/directorops](https://github.com/emmaGH1/directorops)
- **Target Event**: [Agentic Cinema: The Blockbuster Hackathon](https://agentic-cinema.devpost.com/)
- **Sponsor Tracks**: **Grafana Labs Track** ($15k Purse) & **Google Cloud AI Track**
- **Date**: September 2026
- **Status**: PRODUCTION READY & SUBMISSION COMPLIANT

---

## 1. System Architecture & Repository Map

```
directorops/
├── .gitignore                     # Git exclusion rules (node_modules, pycache, envs)
├── LICENSE                        # Official MIT Open-Source License
├── README.md                      # 30,000-char submission overview & pitch script
├── PRD.md                         # Product Requirements Document
├── AGENTS.md                      # Agent architecture, prompts, and MCP contracts
├── HANDOVER.md                    # Engineering handover & operational playbook
├── DESIGN.MD                      # Studio Bento Grid design system tokens
├── HONESTY_TABLE.md               # Transparency matrix (live vs simulated layers)
├── verify_in_60s.py               # Standalone zero-dependency CPU verification script
├── package.json                   # Root workspace scripts & tooling
│
├── backend/                       # Python / FastAPI / Gemini / Grafana MCP Core
│   ├── pytest.ini                 # Pytest configuration
│   ├── requirements.txt           # Python dependencies (fastapi, google-genai, pydantic)
│   ├── .env.example               # Template for API keys & environment variables
│   ├── app/
│   │   ├── config.py              # Pydantic v2 settings (DEMO_MODE, GEMINI_API_KEY)
│   │   ├── main.py                # FastAPI gateway, REST endpoints, SSE event stream
│   │   ├── agent/
│   │   │   └── mcr_agent.py       # Google Cloud Gemini 2.0 ReAct orchestrator
│   │   ├── mcp/
│   │   │   └── grafana_mcp.py     # Official Grafana Cloud MCP JSON-RPC 2.0 client
│   │   ├── receipts/
│   │   │   └── proof_engine.py    # HMAC-SHA256 mitigation proof receipt generator
│   │   └── telemetry/
│   │       └── telemetry_engine.py# Broadcast telemetry simulation & failover engine
│   └── tests/                     # 100% passing test suite
│       ├── test_agent.py          # Gemini ReAct step-by-step resolution test
│       ├── test_mcp.py            # Grafana MCP tool invocation test
│       ├── test_proof.py          # HMAC-SHA256 signature verification test
│       └── test_telemetry.py      # Telemetry state transition & failover test
│
└── frontend/                      # Next.js 15 / React 19 / Tailwind CSS Studio HUD
    ├── package.json               # Frontend dependencies & build scripts
    ├── tsconfig.json              # TypeScript strict configuration
    ├── tailwind.config.js         # Studio dark-mode theme colors and borders
    └── src/
        ├── app/
        │   ├── globals.css        # Custom CRT scanline & glow animations
        │   ├── layout.tsx         # Studio HUD container & font provider
        │   └── page.tsx           # 2-Row Bento Grid Master Control Room Dashboard
        └── components/
            ├── Header.tsx         # Studio navigation pill, SMPTE clock, tally light
            ├── LiveMonitor.tsx    # 16:9 4K preview with Web Audio 24-bin spectrum
            ├── SignalTopology.tsx # Interactive SVG routing graph with animated flows
            ├── TelemetryHUD.tsx   # PromQL live sparklines (FPS, Bitrate, Loss, Drift)
            ├── AgentDrawer.tsx    # Streaming Gemini model thoughts & raw MCP calls
            └── ReceiptModal.tsx   # Cryptographic HMAC mitigation receipt inspector
```

---

## 2. Quickstart & Local Reproduction

### 2.1 Fast-Track: 60-Second CPU Reproduction (Zero Dependencies)
For hackathon judges and rapid verification, execute the standalone Python script. It runs directly on Python 3 standard library with **zero external pip packages** in under **5 milliseconds**:

```bash
# Clone the repository
git clone https://github.com/emmaGH1/directorops.git
cd directorops

# Run the 60-second verifier
python verify_in_60s.py
```

Expected Output:
```
=================================================================
 RUNNING 60-SECOND CPU REPRODUCTION & PROOF VERIFICATION
=================================================================
 [PASS] Step 1: Broadcast Telemetry Initialization
 [PASS] Step 2: Hardware Anomaly & Packet Loss Trigger
 [PASS] Step 3: Grafana MCP Tool: PromQL Telemetry Ingestion
 [PASS] Step 4: Grafana MCP Tool: LogQL Diagnostic Isolation
 [PASS] Step 5: Autonomous Stream Ingest Failover
 [PASS] Step 6: Cryptographic Proof & SHA-256 Receipt Seal
=================================================================
[SUCCESS] ALL 6 CHECKS PASSED IN 0.43ms (<500ms requirement)
VERIFICATION RECEIPT STATUS: 100% DETERMINISTIC CPU VALIDATION
=================================================================
```

---

## 3. Running the Full Stack

### 3.1 Backend Service (FastAPI + Gemini + Grafana MCP)

1. **Navigate to the backend directory and activate virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables** (Optional for Demo Mode):
   ```bash
   cp .env.example .env
   ```
   *In `.env`:*
   ```env
   # To use Live Google Gemini 2.0 Flash:
   GEMINI_API_KEY=your_gemini_api_key_here

   # To connect to live Grafana Cloud MCP:
   GRAFANA_URL=https://your-instance.grafana.net
   GRAFANA_SA_TOKEN=your_grafana_service_account_token_here
   GRAFANA_MCP_SERVER_URL=https://mcp.grafana.com/mcp

   # Demo Mode (defaults to True if keys are unset):
   DEMO_MODE=True
   RECEIPT_SECRET_KEY=directorops-broadcast-secret-key-2026
   ```

4. **Run Backend Test Suites**:
   ```bash
   python -m pytest tests -v
   ```
   *Expected output: 4 passed in ~4.0s.*

5. **Start FastAPI Gateway**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will be live at `http://localhost:8000`. OpenAPI documentation is available at `http://localhost:8000/docs`.

---

### 3.2 Frontend Studio HUD (Next.js 15 App Router)

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Verify Build**:
   ```bash
   npm run build
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 4. Operational Playbook & Incident Scenarios

The Master Control Room dashboard provides 3 realistic broadcast failure scenarios. Each can be triggered from the top navigation bar or via API:

### Scenario 1: NVENC Buffer Overflow (`nvenc_buffer_overflow`)
- **Simulated Condition**: GPU transcode pod ring buffer saturates (98.6% GPU load). Video PTS drifts to `+842ms`, packet loss spikes to `14.8%`, and framerate drops to `31.2 FPS`.
- **API Trigger**: `POST http://localhost:8000/api/telemetry/inject-scenario?scenario_id=nvenc_buffer_overflow`
- **Agent Behavior**:
  1. Detects `BroadcastTranscoderPTSDesync` alert.
  2. Queries Grafana Prometheus via MCP (`rate(node_network_transmit_drop_total[1m])`).
  3. Queries Grafana Loki via MCP (`{app="transcoder"} |= "PTS desync"`).
  4. Identifies segfault risk on `transcoder-pod-us-east-01`.
  5. Executes atomic failover to `transcoder-pod-us-east-02`.
  6. Emits Grafana dashboard annotation and signs HMAC-SHA256 receipt.
- **Expected Recovery**: Framerate locks back to 59.94 FPS; packet loss drops to 0.00%.

### Scenario 2: CDN Edge 502 Cascade (`cdn_edge_502`)
- **Simulated Condition**: Origin packager response latency spikes to `2840ms`, causing an HTTP 502 Bad Gateway cascade across the CDN edge layer. Packet loss hits `22.4%`.
- **API Trigger**: `POST http://localhost:8000/api/telemetry/inject-scenario?scenario_id=cdn_edge_502`
- **Agent Behavior**:
  1. Detects `CDNEdgeOriginGatewayTimeout502` alert.
  2. Runs PromQL to verify origin HTTP response duration.
  3. Inspects Loki edge ingress access logs.
  4. Executes `execute_failover(subsystem="cdn_route", target="origin-shield-cache-02")`.
  5. Restores nominal origin latency (16.2ms) and verifies stream integrity.

### Scenario 3: Genlock PTP Clock Drift (`genlock_clock_drift`)
- **Simulated Condition**: SMPTE ST 2059-2 PTP grandmaster clock reference jitter exceeds `48.5μs`. Virtual production LED wall exhibits scanline phase tearing.
- **API Trigger**: `POST http://localhost:8000/api/telemetry/inject-scenario?scenario_id=genlock_clock_drift`
- **Agent Behavior**:
  1. Detects `GenlockPTPPrecisionClockDrift` alert.
  2. Queries PTP grandmaster phase error metric via PromQL.
  3. Triggers PTP lock re-calibration (`execute_failover(subsystem="genlock")`).
  4. Brings clock jitter back down to `1.1μs` nominal reference.

---

## 5. Deployment Guide

### 5.1 Frontend Deployment on Vercel
1. Link your GitHub repository (`https://github.com/emmaGH1/directorops`) in Vercel.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Next.js`.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your hosted backend URL (e.g. `https://directorops-backend.run.app`).
5. Deploy.

### 5.2 Backend Deployment on Google Cloud Run
1. Build the Docker container:
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/directorops-backend
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy directorops-backend \
     --image gcr.io/YOUR_PROJECT_ID/directorops-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="your_key",DEMO_MODE="False"
   ```

---

## 6. Submission & Presentation Assets

| Asset | Location / URL | Status |
|---|---|---|
| **Public GitHub Repo** | [https://github.com/emmaGH1/directorops](https://github.com/emmaGH1/directorops) | LIVE (MIT License) |
| **Zero-Dep Verifier** | [`verify_in_60s.py`](verify_in_60s.py) | VERIFIED (0.43ms) |
| **Product Requirements** | [`PRD.md`](PRD.md) | COMPLETE |
| **Agent Specification** | [`AGENTS.md`](AGENTS.md) | COMPLETE |
| **Honesty Table** | [`HONESTY_TABLE.md`](HONESTY_TABLE.md) | COMPLETE |
| **Design Specifications** | [`DESIGN.MD`](DESIGN.MD) | COMPLETE |
| **3-Minute Pitch Script** | Included in [`README.md`](README.md#the-3-minute-pitch-video-script) | READY FOR RECORDING |

---

## 7. Troubleshooting & FAQ

### Q: Why does `verify_in_60s.py` not require `pip install google-genai` or `pip install grafana-mcp`?
**A**: Hackathon judges often review dozens of submissions and do not have the time or credentials to provision Google Cloud service accounts or paid Grafana Cloud instances. `verify_in_60s.py` provides a deterministic reproduction of the exact telemetry degradation, PromQL/LogQL MCP schemas, failover math, and HMAC signature algorithms using Python's standard library so any judge can verify the engine in milliseconds.

### Q: Can I run with live Google Cloud Gemini 2.0 and live Grafana Cloud?
**A**: Yes! Simply provide `GEMINI_API_KEY` and your `GRAFANA_SA_TOKEN` in `backend/.env`. The system detects live credentials and switches from the embedded fallback engine to live API execution.

### Q: Does the agent have permissions to execute arbitrary bash commands?
**A**: No. Broadcast pipelines require strict deterministic boundaries. All remediations are restricted to typed functions (`execute_failover`, `create_annotation`, `query_prometheus`, `query_loki`). Arbitrary shell execution is disallowed by design.
