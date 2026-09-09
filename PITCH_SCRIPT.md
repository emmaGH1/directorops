# DirectorOps — Live Demo Pitch Script
## Master Control Room (MCR) Autonomous SRE & Incident Commander
### Agentic Cinema: The Blockbuster Hackathon — Grafana Labs Track ($15k) & Google Cloud AI Track

---

## 🎯 60–90 Second Live Screen Recording Script

### [0:00 – 0:20] The High-Stakes Hook
*(Start screen recording on `http://localhost:3000/control` in full screen)*

> **Narrator:**
> "In live global broadcasting and virtual production—whether it's the NFL, the Oscars, or a $100M LED volume stage—downtime costs over $100,000 every single minute. Human operators simply cannot parse multi-gigabit ST 2110 telemetry fast enough during catastrophic packet bursts.
>
> This is **DirectorOps**: an autonomous Master Control Room Incident Commander powered by **Google Cloud Gemini 3.8 Flash** and the **Grafana Cloud Model Context Protocol (MCP)**."

---

### [0:20 – 0:50] Triggering the Anomaly & Autonomous Agent Triage
*(Click **"Run incident"** in the top-right header and select **"NVENC Buffer Overflow"**)*

> **Narrator:**
> "Here, our 4K 59.94 FPS broadcast pipeline encounters a sudden encoder ring buffer fault.
>
> Notice the immediate fault response: frame rate collapses to 31.2 FPS, packet loss spikes to 14.8%, and PTS audio/video drifts past 800ms. In the right operational rail, telemetry health dynamically elevates the packet loss failure to hero size.
>
> Simultaneously, our Gemini 3.8 Flash Operator engages in a real-time ReAct loop:
> 1. It queries Grafana Prometheus via MCP PromQL to isolate the packet drop on Transcoder Pod 01.
> 2. It queries Loki log streams via MCP LogQL to identify the exact NVENC ring buffer exhaustion.
> 3. It makes the executive decision to execute an atomic SDI router failover."

---

### [0:50 – 1:15] Hot Failover & Verified Recovery
*(Observe the transition to `Verified` in the Gemini Operator zone and the Signal Route schematic)*

> **Narrator:**
> "Watch the Virtual SDI Signal Route: it atomically reroutes transmission to standby Pod 02, locking into `Active: ENC 02 (Hot Failover Locked)` while isolating the degraded encoder.
>
> Framerate instantly locks back to a pristine 59.94 FPS, packet loss returns to 0.00%, and the MCR Event Ledger logs the exact chronological sequence directly beneath the program monitor."

---

### [1:15 – 1:35] Cryptographic Mitigation Receipt
*(Click **"View Technical Receipt"** button)*

> **Narrator:**
> "For broadcast compliance and SLA dispute resolution, every mitigation is cryptographically sealed. 
>
> This Technical Audit Mitigation Receipt binds pre-incident and post-incident telemetry states into a deterministic SHA-256 digest, signed with an HMAC-SHA256 key, and annotated directly back to the Grafana Cloud dashboard."

---

### [1:35 – 1:50] The 60-Second CPU Verifier
*(Cut to terminal and run `python verify_in_60s.py`)*

> **Narrator:**
> "Hackathon judges can verify this entire 6-step lifecycle without any cloud dependencies. Running `python verify_in_60s.py` validates the full telemetry degradation, Grafana MCP PromQL and LogQL calls, atomic routing failover, and HMAC receipt verification on plain Python in under 1 millisecond.
>
> DirectorOps: Autonomous, observable, and tamper-proof broadcast reliability."

---

## 🎬 Pre-Recording Checklist (30-second prep)
- [ ] Browser open at `http://localhost:3000/control` (1680×914 or 1920×1080)
- [ ] Click `Reset stream` to ensure clean baseline (59.94 FPS, 0.00% packet loss, `Nominal`, `Monitoring`)
- [ ] Terminal split open with `python verify_in_60s.py` ready to execute
- [ ] Record using OBS / Loom / QuickTime / Windows Game Bar (`Win + Alt + R`)
