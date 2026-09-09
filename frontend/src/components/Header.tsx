"use client";

import React, { useState } from "react";
import { Radio, Activity, ExternalLink, RefreshCw, AlertTriangle, ChevronDown, CheckCircle2, ShieldAlert, WifiOff } from "lucide-react";

export interface HealthData {
  status?: string;
  service?: string;
  gemini_model?: string;
  demo_mode?: boolean;
  grafana_connected?: boolean;
}

interface HeaderProps {
  status: string;
  onInjectScenario: (scenarioId: string) => void;
  onReset: () => void;
  isLoading: boolean;
  activeAlert: any;
  isConnected: boolean;
  healthData?: HealthData | null;
  isInvestigating: boolean;
  hasMitigationReceipt: boolean;
  onViewReceipt?: () => void;
}

const SCENARIOS = [
  { id: "nvenc_buffer_overflow", label: "NVENC Buffer Overflow", desc: "PTS drift +842ms, 14.8% packet loss" },
  { id: "cdn_edge_502", label: "CDN Edge 502 Timeout", desc: "Origin packager gateway failure" },
  { id: "genlock_clock_drift", label: "SMPTE ST 2059 PTP Drift", desc: "Genlock 48µs master clock desync" }
];

export const Header: React.FC<HeaderProps> = ({
  status,
  onInjectScenario,
  onReset,
  isLoading,
  activeAlert,
  isConnected,
  healthData,
  isInvestigating,
  hasMitigationReceipt,
  onViewReceipt
}) => {
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const isDegraded = status === "DEGRADED";
  const isRecovered = status === "RECOVERED";

  // Determine Tally Light State
  let tallyColor = "bg-emerald-500 shadow-[0_0_8px_#10b981]";
  let tallyText = "● LIVE ON AIR (4K HDR 59.94P)";

  if (!isConnected) {
    tallyColor = "bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]";
    tallyText = "CONNECTION OFFLINE (FASTAPI)";
  } else if (isInvestigating) {
    tallyColor = "bg-cyan-400 animate-pulse shadow-[0_0_10px_#38bdf8]";
    tallyText = "AGENT INVESTIGATING (REASONING)";
  } else if (isDegraded) {
    tallyColor = "bg-red-500 animate-pulseFast shadow-[0_0_12px_#ef4444]";
    tallyText = "INCIDENT DETECTED (SLA BREACH)";
  } else if (isRecovered) {
    tallyColor = "bg-emerald-400 shadow-[0_0_10px_#34d399]";
    tallyText = "FAILOVER SEALED (59.94 FPS)";
  }

  const isDemoMode = healthData?.demo_mode !== false;
  const isGrafanaLive = !isDemoMode && Boolean(healthData?.grafana_connected);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-md px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono">
      {/* Brand & Studio ID */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <Radio className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2 font-sans">
            <span className="font-bold tracking-tight text-white text-base">DirectorOps</span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              MCR 01
            </span>
          </div>
          <p className="text-[10px] text-zinc-400">
            Autonomous MCR Incident Commander • Live Broadcast SRE
          </p>
        </div>
      </div>

      {/* Center Tally Light & Master Channel */}
      <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#121215] border border-[#27272a] text-xs">
        <span className={`w-2 h-2 rounded-full ${tallyColor}`} />
        <span className="font-bold tracking-wide text-zinc-200">{tallyText}</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400 text-[11px]">CH 01 • CINEMA MASTER</span>
      </div>

      {/* Right Mode Badges & Scenario Controls */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Radical Transparency Badges (Honesty Table) */}
        <div className="hidden xl:flex items-center space-x-1.5 text-[10px]">
          <span
            title={isDemoMode ? "Operating via deterministic sub-5ms CPU fallback engine" : "Connected directly to Google Cloud Gemini 3.8 Flash"}
            className={`px-2 py-0.5 rounded border ${
              isDemoMode
                ? "bg-zinc-900/90 text-zinc-400 border-zinc-700"
                : "bg-cyan-950/60 text-cyan-300 border-cyan-700"
            }`}
          >
            {isDemoMode ? "ENGINE: DETERMINISTIC" : "ENGINE: GEMINI 3.8 FLASH"}
          </span>

          <span
            title={isGrafanaLive ? "Live JSON-RPC 2.0 stdio transport to mcp-grafana" : "Staged PromQL/LogQL broadcast telemetry emulator"}
            className={`px-2 py-0.5 rounded border ${
              isGrafanaLive
                ? "bg-orange-950/60 text-orange-300 border-orange-700"
                : "bg-zinc-900/90 text-zinc-400 border-zinc-700"
            }`}
          >
            {isGrafanaLive ? "GRAFANA: LIVE MCP (STDIO)" : "GRAFANA: STAGED EMULATOR"}
          </span>
        </div>

        {/* Disconnection Warning Pill */}
        {!isConnected && (
          <div className="flex items-center space-x-1 text-amber-400 bg-amber-950/60 border border-amber-700 px-2.5 py-1 rounded text-[11px] animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>DISCONNECTED</span>
          </div>
        )}

        {/* Scenario Injection Dropdown */}
        <div className="relative">
          {!isDegraded ? (
            <div className="flex items-center">
              <button
                onClick={() => setScenarioOpen(!scenarioOpen)}
                disabled={isLoading || !isConnected}
                className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 bg-red-950/50 border border-red-800/60 hover:bg-red-900/50 px-3 py-1.5 rounded-l transition active:scale-95 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Inject Anomaly</span>
              </button>
              <button
                onClick={() => setScenarioOpen(!scenarioOpen)}
                disabled={isLoading || !isConnected}
                className="bg-red-950/60 border-y border-r border-red-800/60 hover:bg-red-900/60 px-1.5 py-1.5 rounded-r text-red-300 transition"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onReset}
              disabled={isLoading || !isConnected}
              className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-3 py-1.5 rounded transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Stream</span>
            </button>
          )}

          {/* Scenario Menu */}
          {scenarioOpen && !isDegraded && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-lg bg-[#18181c] border border-zinc-700 shadow-2xl p-1.5 z-50 text-[11px]">
              <div className="px-2 py-1 text-zinc-500 font-bold uppercase text-[9px] border-b border-zinc-800">
                Select Broadcast Incident
              </div>
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    onInjectScenario(sc.id);
                    setScenarioOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 transition flex flex-col space-y-0.5 group"
                >
                  <span className="font-bold text-zinc-200 group-hover:text-red-400">{sc.label}</span>
                  <span className="text-[10px] text-zinc-500">{sc.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset / Inspect Receipt Quick Action */}
        {hasMitigationReceipt && onViewReceipt && (
          <button
            onClick={onViewReceipt}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-700/60 hover:bg-emerald-900/50 px-2.5 py-1.5 rounded transition shadow-[0_0_8px_rgba(16,185,129,0.2)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Receipt</span>
          </button>
        )}
      </div>
    </header>
  );
};

