# AGENTS.md — DirectorOps Autonomous Agent Specification
## Master Control Room (MCR) SRE & Autonomous Incident Commander

---

## 1. Executive Agent Overview

**DirectorOps** deploys an autonomous, high-reliability agentic system designed to operate in ultra-low latency broadcast and virtual production control rooms. It continuously monitors live 4K/UHD video pipelines, autonomously diagnoses anomalies using **Grafana Cloud Model Context Protocol (MCP)**, coordinates atomic failovers across SDI/IP routing matrices, and seals resolution proofs via cryptographic receipts.

### 1.1 Model & Framework Alignment
- **Permitted LLM Core**: Google Cloud Gemini 2.0 (`gemini-2.0-flash` / `gemini-2.0-pro-exp`) via the official Google GenAI SDK (`google-genai`).
- **Protocol Protocol**: Model Context Protocol (MCP JSON-RPC 2.0) interacting with Grafana Cloud.
- **Orchestration Pattern**: Asynchronous multi-turn ReAct (Reasoning + Acting) loop with structured function declarations.
- **Fail-Safe Mechanism**: Zero-dependency deterministic offline fallback engine ensuring 100% operational uptime and sub-5ms CPU verification for evaluation.

---

## 2. Agent Architecture & Subsystems

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         MCRAgent (Incident Commander)                       │
 └─────────────────────────────────────────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
 ┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
 │  Observability Hub │       │   Reasoning Hub    │       │  Remediation Hub   │
 └────────────────────┘       └────────────────────┘       └────────────────────┘
           │                            │                            │
           ├─ Ingest Telemetry          ├─ Gemini 2.0 Flash          ├─ SDI Router Matrix
           ├─ PromQL Time-Series        ├─ Multi-turn ReAct          ├─ Pod Ingest Swap
           └─ Loki Log Analysis         └─ Tool Invocation           └─ HMAC Proof Seal
```

### 2.1 Component Responsibilities

1. **`MCRAgent` (`backend/app/agent/mcr_agent.py`)**:
   - Master orchestrator managing incident lifecycles from detection to proof generation.
   - Instantiates the Gemini 2.0 client session with typed function tools.
   - Yields asynchronous SSE events (`ALERT_INGEST`, `AGENT_REASONING`, `TOOL_CALL`, `TOOL_RESULT`, `AGENT_DECISION`, `FAILOVER_EXECUTED`, `MITIGATION_RECEIPT`) for live UI streaming.

2. **`GrafanaMCPClient` (`backend/app/mcp/grafana_mcp.py`)**:
   - Manages JSON-RPC 2.0 sessions with the Grafana Cloud MCP server (`https://mcp.grafana.com/mcp` or local stdio).
   - Formats PromQL metric queries against Prometheus instances.
   - Formats LogQL log inspection queries against Grafana Loki.
   - Dispatches incident timeline annotations with cryptographic hashes.

3. **`BroadcastTelemetryEngine` (`backend/app/telemetry/telemetry_engine.py`)**:
   - Generates real-time broadcast signal metrics (FPS, Bitrate, Packet Loss %, PTS Drift, GPU Saturation).
   - Simulates realistic hardware faults (NVENC buffer overflow, CDN 502 gateway timeouts, SMPTE ST 2059-2 PTP jitter).
   - Executes atomic signal rerouting between primary and backup infrastructure nodes.

4. **`ProofEngine` (`backend/app/receipts/proof_engine.py`)**:
   - Computes deterministic SHA-256 digests over pre-incident and post-incident telemetry states.
   - Signs mitigation actions with an HMAC-SHA256 secret key.
   - Generates tamper-evident `MitigationReceipt` documents for audit compliance and SLA dispute resolution.

---

## 3. Agent Prompts & System Instructions

### 3.1 Primary System Prompt (`mcr_agent.py`)

```text
You are DirectorOps MCR Incident Commander, an autonomous Site Reliability Engineer
and Technical Director for a high-value live broadcast cinema and virtual production pipeline.

YOUR RESPONSIBILITIES:
1. When a broadcast alert fires (PTS desync, packet loss, frame drops, clock drift), investigate immediately.
2. Formulate diagnostic queries using Grafana MCP tools (query_prometheus, query_loki).
3. Correlate time-series telemetry with log streams to isolate the exact failing pod, edge node, or clock reference.
4. Execute atomic signal failover (execute_failover) to switch transmission to hot-standby infrastructure.
5. Post an incident annotation to Grafana (create_annotation) documenting root cause and resolution time.
6. Verify that video framerate (59.94 FPS) and packet loss (0.00%) return to nominal broadcast SLA.

SAFETY & OPERATIONAL RULES:
- Never execute arbitrary system commands; all remediations must flow through typed execute_failover actions.
- Every investigation must cite exact PromQL metrics and LogQL log entries.
- Strive for sub-second resolution to protect live broadcast SLAs ($100k/minute outage risk).
```

---

## 4. MCP Tool Calling Contracts (Typed Schemas)

The agent interacts with the broadcast environment using 4 strictly typed function declarations:

### 4.1 `query_prometheus`
Executes PromQL time-series queries against Grafana Cloud Prometheus.

```json
{
  "name": "query_prometheus",
  "description": "Execute a PromQL metric query against Grafana Cloud Prometheus datasource to inspect broadcast health metrics (FPS, packet drop, PTS drift).",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The PromQL query string, e.g. 'rate(node_network_transmit_drop_total[1m])' or 'nvenc_encoder_buffer_saturation'."
      }
    },
    "required": ["query"]
  }
}
```

### 4.2 `query_loki`
Executes LogQL queries against Grafana Loki to retrieve error logs and hardware diagnostics.

```json
{
  "name": "query_loki",
  "description": "Execute a LogQL query against Grafana Loki log streams to inspect container error output, hardware encoder segfaults, and CDN response codes.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The LogQL query string, e.g. '{app=\"transcoder\"} |= \"PTS desync\"' or '{cluster=\"edge-ingress\"} |= \"502 Bad Gateway\"'."
      }
    },
    "required": ["query"]
  }
}
```

### 4.3 `execute_failover`
Triggers an atomic signal routing switch on the virtual SDI/IP matrix.

```json
{
  "name": "execute_failover",
  "description": "Execute an atomic broadcast signal router failover to hot-standby transcoding infrastructure, alternative CDN edge, or secondary PTP grandmaster.",
  "parameters": {
    "type": "object",
    "properties": {
      "subsystem": {
        "type": "string",
        "description": "Subsystem target: 'video_ingest', 'cdn_route', or 'genlock'.",
        "enum": ["video_ingest", "cdn_route", "genlock"]
      },
      "target": {
        "type": "string",
        "description": "Target standby node identifier, e.g. 'transcoder-pod-us-east-02'."
      }
    },
    "required": ["subsystem"]
  }
}
```

### 4.4 `create_annotation`
Emits an annotated incident marker on the active Grafana Cloud dashboard.

```json
{
  "name": "create_annotation",
  "description": "Post a timestamped incident resolution annotation to Grafana Cloud dashboard timeline with cryptographic proof hash.",
  "parameters": {
    "type": "object",
    "properties": {
      "dashboard_id": {
        "type": "string",
        "description": "Identifier of the target Grafana dashboard, e.g. 'mcr-main-live'."
      },
      "text": {
        "type": "string",
        "description": "Incident summary annotation containing root cause and mitigation details."
      },
      "tags": {
        "type": "array",
        "items": {"type": "string"},
        "description": "Annotation tags, e.g. ['mcr-agent', 'auto-failover', 'pts-recovery']."
      }
    },
    "required": ["dashboard_id", "text"]
  }
}
```

---

## 5. ReAct Incident Resolution Lifecycle

```
[ALERT_INGEST]
    │  BroadcastTranscoderPTSDesync alert fired (+842ms drift, 14.8% drop)
    ▼
[MODEL REASONING]
    │  "Alert indicates severe PTS drift. Need to query Prometheus for packet drop rate."
    ▼
[TOOL_CALL: query_prometheus]
    │  query: rate(node_network_transmit_drop_total{pod="transcoder-pod-us-east-01"}[1m])
    ▼
[TOOL_RESULT]
    │  result: { "pod": "transcoder-pod-us-east-01", "drop_rate": 0.148, "pts_drift_ms": 842.0 }
    ▼
[MODEL REASONING]
    │  "Confirmed 14.8% packet drop on Pod 01. Inspecting Loki logs for hardware fault."
    ▼
[TOOL_CALL: query_loki]
    │  query: {app="transcoder", pod="transcoder-pod-us-east-01"} |= "PTS desync"
    ▼
[TOOL_RESULT]
    │  result: "ERROR [nvenc_core] Ring buffer exhausted. Frame drop spike. Segfault imminent."
    ▼
[AGENT_DECISION]
    │  "Pod 01 hardware encoder exhausted. Switching ingest to Standby Pod 02 immediately."
    ▼
[TOOL_CALL: execute_failover]
    │  subsystem: "video_ingest", target: "transcoder-pod-us-east-02"
    ▼
[FAILOVER_EXECUTED]
    │  Signal rerouted to Pod 02. Framerate restored to 59.94 FPS, packet loss 0.00%.
    ▼
[TOOL_CALL: create_annotation]
    │  dashboard_id: "mcr-main-live", text: "Autonomous failover: Pod 01 -> Pod 02."
    ▼
[MITIGATION_RECEIPT]
    │  HMAC-SHA256 signed proof sealed. SHA-256 digest: 1d5089ad46e89f3a...
```

---

## 6. Safety & Verification Guarantees

1. **Non-Destructive Routing**: The agent never tears down active infrastructure; it performs atomic hot-standby failovers with state preservation.
2. **Deterministic Fallback**: In environments without active Google Cloud or Grafana Cloud API keys, the agent seamlessly transitions to an embedded deterministic engine that mimics exact tool responses in < 5ms.
3. **Cryptographic Accountability**: Every action produces an HMAC-signed audit receipt containing input states, tool outputs, and post-mitigation telemetry verification.
