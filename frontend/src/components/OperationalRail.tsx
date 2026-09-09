"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { AgentEventStep } from "./GeminiOperator";

interface OperationalRailProps {
  status: "NOMINAL" | "INVESTIGATING" | "DEGRADED" | "RECOVERED";
  activeScenario: string | null;
  primaryEncoder: string;
  standbyEncoder: string;
  fps: number;
  bitrate: number;
  packetLoss: number;
  ptsDrift: number;
  isConnected: boolean;
  steps: AgentEventStep[];
  latestReceipt: any;
  onViewReceipt: () => void;
  elapsedDuration: string | null;
}

export const OperationalRail: React.FC<OperationalRailProps> = ({
  status,
  activeScenario,
  primaryEncoder,
  standbyEncoder,
  fps,
  bitrate,
  packetLoss,
  ptsDrift,
  isConnected,
  steps,
  latestReceipt,
  onViewReceipt,
  elapsedDuration,
}) => {
  const isDegraded = status === "DEGRADED";
  const isRecovered = status === "RECOVERED";
  const isInvestigating = status === "INVESTIGATING";

  const isEnc01Active = primaryEncoder.includes("01");
  const isNvencFault = isDegraded && (!activeScenario || activeScenario === "nvenc_buffer_overflow");
  const isCdnFault = isDegraded && activeScenario === "cdn_edge_502";
  const isGenlockFault = isDegraded && activeScenario === "genlock_clock_drift";

  // Derive active Gemini Operator Title Case state
  let operatorState = "Monitoring";
  if (isInvestigating) {
    const hasFailover = steps.some((s) => s.type === "FAILOVER_EXECUTED");
    const hasDecision = steps.some((s) => s.type === "AGENT_DECISION");
    operatorState = hasFailover ? "Executing" : hasDecision ? "Deciding" : "Investigating";
  } else if (isRecovered) {
    operatorState = "Verified";
  } else if (isDegraded) {
    operatorState = "Investigating";
  }

  return (
    <aside className="w-full rounded-md border border-[#27272a] bg-[#121215] overflow-hidden flex flex-col font-sans select-none shadow-sm">
      {/* ─────────────────────────────────────────────────────────────
          ZONE 1: SIGNAL PATH (Minimal Schematic Flow, Zero Box Clutter)
          ───────────────────────────────────────────────────────────── */}
      <section className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
            Signal Route
          </h3>
          <span
            className={`text-[11px] font-medium font-mono ${
              isDegraded
                ? "text-red-400"
                : isRecovered
                ? "text-emerald-400"
                : "text-zinc-400"
            }`}
          >
            {isDegraded
              ? isNvencFault
                ? "ENC 01 Fault • Failover Armed"
                : "Edge Fault • Armed"
              : isRecovered
              ? !isEnc01Active
                ? "Active: ENC 02 (Hot Failover Locked)"
                : "Active: ENC 01 (Program Locked)"
              : "Active: ENC 01 (Program Locked)"}
          </span>
        </div>

        {/* Minimal Schematic Signal Graph */}
        <div className="relative py-2 flex items-center justify-between min-h-[95px] px-1">
          {/* SVG Route Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {/* CAM A to ENC 01 (Upper) */}
            <path
              d="M 50 48 C 85 48, 95 24, 125 24"
              stroke={isNvencFault ? "#ef4444" : isEnc01Active ? "#10b981" : "#3f3f46"}
              strokeWidth={isEnc01Active ? 2 : 1}
              strokeDasharray={!isEnc01Active ? "3 3" : "none"}
              opacity={isEnc01Active ? 1 : 0.3}
              fill="none"
            />

            {/* CAM A to ENC 02 (Lower) */}
            <path
              d="M 50 48 C 85 48, 95 72, 125 72"
              stroke={!isEnc01Active ? "#10b981" : "#3f3f46"}
              strokeWidth={!isEnc01Active ? 2 : 1}
              strokeDasharray={isEnc01Active ? "3 3" : "none"}
              opacity={!isEnc01Active ? 1 : 0.3}
              fill="none"
            />

            {/* ENC 01 to Origin */}
            <path
              d="M 230 24 C 260 24, 270 48, 295 48"
              stroke={isEnc01Active ? (isNvencFault ? "#ef4444" : "#10b981") : "#3f3f46"}
              strokeWidth={isEnc01Active ? 2 : 1}
              strokeDasharray={!isEnc01Active ? "3 3" : "none"}
              opacity={isEnc01Active ? 1 : 0.3}
              fill="none"
            />

            {/* ENC 02 to Origin */}
            <path
              d="M 230 72 C 260 72, 270 48, 295 48"
              stroke={!isEnc01Active ? "#10b981" : "#3f3f46"}
              strokeWidth={!isEnc01Active ? 2 : 1}
              strokeDasharray={isEnc01Active ? "3 3" : "none"}
              opacity={!isEnc01Active ? 1 : 0.3}
              fill="none"
            />

            {/* Origin to CDN */}
            <path
              d="M 345 48 L 380 48"
              stroke={isCdnFault ? "#ef4444" : "#10b981"}
              strokeWidth={2}
              strokeDasharray={isCdnFault ? "3 3" : "none"}
              opacity={1}
              fill="none"
            />
          </svg>

          {/* Node 1: Source CAM A */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-bold text-white tracking-wide">CAM A</span>
            <span className="text-[10px] text-zinc-500 font-mono">12G-SDI</span>
          </div>

          {/* Node 2: Dual Encoders (ENC 01 & ENC 02) */}
          <div className="relative z-10 flex flex-col space-y-2">
            {/* ENC 01 */}
            <div
              className={`px-2 py-1 rounded text-xs flex items-center justify-between space-x-2 border transition ${
                isEnc01Active
                  ? isNvencFault
                    ? "bg-red-950/70 border-red-500 text-white shadow-xs"
                    : "bg-[#18181c] border-emerald-500/80 text-white"
                  : "bg-[#101014] border-zinc-800 text-zinc-500 opacity-40"
              }`}
            >
              <span className="font-mono font-semibold text-[11px]">ENC 01</span>
              <span
                className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                  isNvencFault && isEnc01Active
                    ? "bg-red-900 text-red-100"
                    : isEnc01Active
                    ? "bg-emerald-950 text-emerald-300"
                    : "text-zinc-600"
                }`}
              >
                {isEnc01Active ? (isNvencFault ? "FAULT" : "ACTIVE") : "ISOLATED"}
              </span>
            </div>

            {/* ENC 02 */}
            <div
              className={`px-2 py-1 rounded text-xs flex items-center justify-between space-x-2 border transition ${
                !isEnc01Active
                  ? "bg-emerald-950/60 border-emerald-500 text-white shadow-xs"
                  : "bg-[#101014] border-zinc-800 text-zinc-500 opacity-50"
              }`}
            >
              <span className="font-mono font-semibold text-[11px]">ENC 02</span>
              <span
                className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                  !isEnc01Active
                    ? "bg-emerald-900 text-emerald-100"
                    : "text-zinc-500"
                }`}
              >
                {!isEnc01Active ? "ACTIVE" : "HOT STANDBY"}
              </span>
            </div>
          </div>

          {/* Node 3: Origin Packager */}
          <div className="relative z-10 flex flex-col items-center">
            <span
              className={`text-xs font-bold tracking-wide ${
                isCdnFault ? "text-red-400" : "text-white"
              }`}
            >
              ORIGIN
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">HLS/DASH</span>
          </div>

          {/* Node 4: CDN Distribution */}
          <div className="relative z-10 flex flex-col items-center">
            <span
              className={`text-xs font-bold tracking-wide ${
                isCdnFault ? "text-red-400" : "text-white"
              }`}
            >
              CDN
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Egress</span>
          </div>
        </div>
      </section>

      {/* Subtle Horizontal Divider */}
      <div className="border-t border-[#1e1e24]" />

      {/* ─────────────────────────────────────────────────────────────
          ZONE 2: OPERATIONAL HEALTH (Dynamic Fault Priority Readout)
          ───────────────────────────────────────────────────────────── */}
      <section className="p-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
            Telemetry Health
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">
            SMPTE ST 2110 Stream Invariants
          </span>
        </div>

        {/* Dynamic Priority Layout:
            If Packet Loss is high, elevate it to hero status.
            If PTP drift is high, elevate clock drift.
            Otherwise, render balanced typography. */}
        {packetLoss > 0 ? (
          /* High Priority Fault State: Packet Loss Elevation */
          <div className="space-y-2 py-1">
            <div className="bg-red-950/40 border border-red-800/80 rounded p-3 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-red-400 block uppercase">
                  Critical SLA Breach
                </span>
                <span className="text-3xl font-bold font-mono text-red-300 tracking-tight">
                  {packetLoss.toFixed(2)}%
                </span>
                <span className="text-xs text-red-400 ml-1.5 font-medium">Packet Drop</span>
              </div>
              <span className="text-[11px] font-mono text-red-400">
                SLA: 0.00%
              </span>
            </div>

            {/* Subordinate Secondary Telemetry */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">Frame Rate</span>
                <span className="text-zinc-300 font-semibold">{fps.toFixed(2)} FPS</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Bitrate</span>
                <span className="text-zinc-300 font-semibold">{bitrate.toFixed(2)} Mbps</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">A/V PTS Drift</span>
                <span className="text-zinc-300 font-semibold">+{ptsDrift.toFixed(1)} ms</span>
              </div>
            </div>
          </div>
        ) : ptsDrift > 50 ? (
          /* High Priority Fault State: PTP Clock Drift Elevation */
          <div className="space-y-2 py-1">
            <div className="bg-amber-950/40 border border-amber-800/80 rounded p-3 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 block uppercase">
                  SMPTE ST 2059 Clock Desync
                </span>
                <span className="text-3xl font-bold font-mono text-amber-300 tracking-tight">
                  +{ptsDrift.toFixed(1)} ms
                </span>
                <span className="text-xs text-amber-400 ml-1.5 font-medium">A/V Drift</span>
              </div>
              <span className="text-[11px] font-mono text-amber-400">
                Threshold: 50ms
              </span>
            </div>

            {/* Subordinate Secondary Telemetry */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">Frame Rate</span>
                <span className="text-zinc-300 font-semibold">{fps.toFixed(2)} FPS</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Bitrate</span>
                <span className="text-zinc-300 font-semibold">{bitrate.toFixed(2)} Mbps</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Packet Loss</span>
                <span className="text-emerald-400 font-semibold">{packetLoss.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Nominal State: Restrained, Balanced Typography (No Box Tiles) */
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-1 font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 block font-sans">Frame Rate</span>
              <span className="text-2xl font-bold text-zinc-100 tracking-tight">
                {isConnected ? fps.toFixed(2) : "--"}
              </span>
              <span className="text-[11px] text-zinc-400 ml-1 font-sans">FPS</span>
              <span className="text-[10px] text-zinc-600 block mt-0.5">Target: 59.94</span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-500 block font-sans">Bitrate</span>
              <span className="text-2xl font-bold text-zinc-100 tracking-tight">
                {isConnected ? bitrate.toFixed(2) : "--"}
              </span>
              <span className="text-[11px] text-zinc-400 ml-1 font-sans">Mbps</span>
              <span className="text-[10px] text-zinc-600 block mt-0.5">Target: 12.50</span>
            </div>

            <div className="border-t border-[#1e1e24] pt-2">
              <span className="text-[10px] text-zinc-500 block font-sans">Packet Loss</span>
              <span className="text-2xl font-bold text-zinc-100 tracking-tight">
                {isConnected ? packetLoss.toFixed(2) : "--"}%
              </span>
              <span className="text-[10px] text-zinc-600 block mt-0.5">SLA: 0.00%</span>
            </div>

            <div className="border-t border-[#1e1e24] pt-2">
              <span className="text-[10px] text-zinc-500 block font-sans">A/V PTS Drift</span>
              <span className="text-2xl font-bold text-zinc-100 tracking-tight">
                +{isConnected ? ptsDrift.toFixed(1) : "--"}
              </span>
              <span className="text-[11px] text-zinc-400 ml-1 font-sans">ms</span>
              <span className="text-[10px] text-zinc-600 block mt-0.5">Threshold: 50ms</span>
            </div>
          </div>
        )}
      </section>

      {/* Subtle Horizontal Divider */}
      <div className="border-t border-[#1e1e24]" />

      {/* ─────────────────────────────────────────────────────────────
          ZONE 3: GEMINI OPERATOR (Autonomous SRE Commander)
          ───────────────────────────────────────────────────────────── */}
      <section className="p-4 pt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
              Gemini Operator
            </h3>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                operatorState === "Verified"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                  : operatorState === "Executing"
                  ? "bg-red-950/80 text-red-300 border border-red-800"
                  : operatorState === "Investigating" || operatorState === "Deciding"
                  ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                  : "text-zinc-400 bg-zinc-900 border border-zinc-800"
              }`}
            >
              {operatorState}
            </span>
          </div>

          {/* State-specific Body */}
          {operatorState === "Monitoring" && (
            <div className="py-2 text-xs text-zinc-400 leading-relaxed font-sans">
              <p>
                Autonomous sentinel actively monitoring live stream invariants. Watching telemetry stream for PTS drift, frame drops, and clock jitter.
              </p>
              <div className="mt-3 flex items-center space-x-2 text-[11px] font-mono text-zinc-500">
                <span>Active alerts: 0</span>
                <span>•</span>
                <span>SDI Router: Locked</span>
              </div>
            </div>
          )}

          {(operatorState === "Investigating" || operatorState === "Deciding" || operatorState === "Executing") && (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300 font-medium">
                  {operatorState === "Executing"
                    ? "Committing atomic failover route..."
                    : "Diagnosing telemetry anomaly via Grafana MCP..."}
                </span>
                {elapsedDuration && (
                  <span className="font-mono text-zinc-400 text-xs">{elapsedDuration}</span>
                )}
              </div>

              {/* Progressive Real SSE Action Checklist */}
              <div className="space-y-1.5 font-mono text-[11px] bg-[#09090b] p-2.5 rounded border border-[#27272a]">
                {steps.length === 0 ? (
                  <div className="text-zinc-500">Connecting to Gemini ReAct event stream...</div>
                ) : (
                  steps.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-zinc-300">
                      <span className="truncate pr-2">
                        {s.title || s.summary || s.content || `Step ${s.step}`}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {operatorState === "Verified" && (
            <div className="space-y-3 py-1">
              <div className="text-xs text-zinc-300 space-y-1">
                <p className="font-medium text-emerald-400">
                  Failover completed successfully.
                </p>
                <p className="text-zinc-400 text-[11px]">
                  Program stabilized on <strong className="font-mono text-zinc-200">{primaryEncoder}</strong>.
                </p>
              </div>

              {/* Factual Operational Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-[#09090b] p-2.5 rounded border border-[#27272a] font-mono text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block font-sans">Recovery Time</span>
                  <span className="text-zinc-200 font-semibold">{elapsedDuration || "3.2s"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-sans">Checks Verified</span>
                  <span className="text-emerald-400 font-semibold">6/6 Invariants</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls for Verified State */}
        {operatorState === "Verified" && (
          <div className="mt-4 pt-3 border-t border-[#1e1e24] flex items-center space-x-2">
            <button
              onClick={onViewReceipt}
              className="flex-1 py-1.5 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer border border-zinc-700 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Technical Receipt</span>
            </button>
            <button
              onClick={() => alert("Navigating to full forensic incident investigation...")}
              className="py-1.5 px-3 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-medium text-xs flex items-center justify-center space-x-1 transition cursor-pointer border border-zinc-800"
            >
              <span>Incident Log</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </section>
    </aside>
  );
};
