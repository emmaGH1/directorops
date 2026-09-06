# DESIGN.MD: DirectorOps Master Control Room Design Specification
<!-- Grounded in styles.refero.design, Blackmagic ATEM, Linear Dark, and 60fps.design -->

This document establishes the official visual design tokens, layout bento grid, and component specifications for **DirectorOps** — Autonomous Master Control Room (MCR) SRE for Live Broadcast Cinema & Virtual Production.

---

## 1. Visual Direction & Design Anchors
- **Selected Aesthetic**: Minimalist Dark Studio Switcher / Command Center
- **Benchmark Products**: Blackmagic ATEM Television Studio, Linear (Dark Zinc), Datadog Incident Command
- **Design Inspiration Anchors (`references/DESIGN_INSPIRATION_ENGINE.md`)**:
  - `navbar.gallery` — Floating glass pill header with integrated SMPTE timecode, tally lights, and scenario controls.
  - `posts.design` — Dense dual-row bento grid architecture maximizing above-the-fold telemetry density.
  - `60fps.design` — 60fps canvas audio frequency spectrum, spring-physics button clicks, and animated SVG signal routing.
  - `cta.gallery` — Ambient dual-layered gradient border glows on critical action triggers.
  - `styles.refero.design` — Machine-readable design tokens and CSS variables.

---

## 2. Color Palette & Design Tokens

### Studio Switcher Neutral Ramp
```css
:root {
  --bg-primary: #09090b;        /* Deep obsidian control room canvas */
  --bg-surface: #121215;        /* Bento card backgrounds, monitor bezels */
  --bg-surface-elevated: #18181c;/* Header bars, active modal sheets */
  --bg-surface-hover: #1f1f24;  /* Interactive hover states */
  --border-subtle: #27272a;     /* Card dividers, bento grid rules */
  --border-strong: #3f3f46;     /* Focused inputs, active monitor bezels */
  --text-primary: #fafafa;      /* Primary metrics, SMPTE timecode, headings */
  --text-muted: #a1a1aa;        /* Secondary telemetry, labels */
  --text-faint: #71717a;        /* Timestamps, camera tags, metadata */
}
```

### Broadcast Semantic Accents
```css
:root {
  --live-red: #ef4444;          /* On Air indicator, firing Prometheus alerts, video glitch */
  --live-red-glow: rgba(239, 68, 68, 0.4); /* Tally light ambient glow */
  --nominal-green: #10b981;     /* Broadcast Nominal, 59.94 FPS locked, lip-sync nominal */
  --nominal-green-glow: rgba(16, 185, 129, 0.35); /* Stabilized tally light glow */
  --warning-amber: #f59e0b;     /* Buffer overrun warnings, audio PTS drift */
  --agent-cyan: #38bdf8;        /* Gemini ADK reasoning, PromQL tool calls, MCP execution */
  --grafana-orange: #f97316;    /* Grafana Cloud deep-links, Loki LogQL tags */
  --signal-active: #22c55e;     /* Active signal route bezier pulse */
  --signal-failover: #3b82f6;   /* Hot-standby rerouted signal line */
}
```

---

## 3. Typography Hierarchy
- **Interface Sans**: `Inter`, `Geist Sans`, or `-apple-system, BlinkMacSystemFont`
- **Broadcast Monospace**: `Geist Mono`, `JetBrains Mono`, or `ui-monospace`

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Header Title** | `1.125rem` (`18px`) | Bold (`700`) | `1.2` | DirectorOps Brand Mark |
| **SMPTE Timecode** | `1.0rem` (`16px`) | Bold (`700`) Mono | `1.0` | Running Timecode (01:42:19:12) |
| **Telemetry Metric** | `1.75rem` (`28px`) | Bold (`700`) Mono | `1.0` | Bitrate, FPS, Packet Loss readouts |
| **Card Header** | `0.8125rem` (`13px`) | SemiBold (`600`) Mono | `1.2` | PGM Monitor, Signal Routing, Sparklines |
| **Body / Details** | `0.75rem` (`12px`) | Normal (`400`) | `1.4` | Incident descriptions, topology labels |
| **Terminal / Query** | `0.6875rem` (`11px`)| Normal (`400`) Mono | `1.4` | Raw PromQL, LogQL, MCP JSON-RPC payloads |

---

## 4. Bento Grid Layout Anatomy (`posts.design`)

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER: Floating Glass Control Pill (navbar.gallery)                  │
│  [Logo] DirectorOps MCR 01 • ● ON AIR • TC 01:24:18:04 • [Scenarios] [Deploy SRE]│
├──────────────────────────────────┬─────────────────────────────────────┤
│  ROW 1 LEFT (55% Width)          │  ROW 1 RIGHT (45% Width)            │
│  Program Monitor (PGM 01)        │  Preview (PVW) & Signal Topology    │
│  - Real Cinema Master Video      │  - Interactive SVG Node Graph       │
│  - Web Audio API Spectrum Canvas │  - Cam A → Enc 01 (Fault) → CDN     │
│  - SMPTE OSD, Glitch Shaders     │  - Animated Failover to Enc 02      │
├──────────────────────────────────┼─────────────────────────────────────┤
│  ROW 2 LEFT (50% Width)          │  ROW 2 RIGHT (50% Width)            │
│  PromQL Telemetry Sparklines HUD │  Gemini 2.0 ReAct Terminal          │
│  - Live SVG Time-Series Curves   │  - Linear-Style Step Stream         │
│  - Bitrate, FPS, Loss %, PTS     │  - Expandable MCP JSON-RPC Payloads │
│  - Click-to-Inspect PromQL Query │  - Cryptographic Receipt Trigger    │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 5. Micro-Interactions & Transitions (`60fps.design`)
- **Video Glitch Layer**: Chromatic aberration (red/cyan channel displacement) + frame skipping when packet loss > 5%.
- **Audio Spectrum**: HTML5 `<canvas>` rendering 24 responsive frequency bins driven by Web Audio API `AnalyserNode`.
- **Signal Rerouting**: SVG bezier path transition animating a glowing blue signal line from `CAM A` to `ENC 02 [STANDBY]` when failover executes.
- **Action Buttons (`cta.gallery`)**: Dual-layered gradient border with ambient blur (`active:scale-95 transition-all duration-150`).
- **Receipt Verification**: Cryptographic seal badge pops into view with green pulse animation and downloadable JSON proof.
