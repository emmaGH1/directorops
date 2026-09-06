"use client";

import React from "react";
import { Radio, Activity, ExternalLink, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";

interface HeaderProps {
  status: string;
  onInjectAnomaly: () => void;
  onReset: () => void;
  isLoading: boolean;
  activeAlert: any;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onInjectAnomaly,
  onReset,
  isLoading,
  activeAlert
}) => {
  const isDegraded = status === "DEGRADED";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Studio ID */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-tight text-white text-base">DirectorOps</span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              MCR 01
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Autonomous Broadcast Director • Gemini ADK + Grafana MCP
          </p>
        </div>
      </div>

      {/* Center Tally Light */}
      <div className="hidden md:flex items-center space-x-3 px-4 py-1.5 rounded-full bg-[#121215] border border-[#27272a]">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isDegraded ? "bg-red-500 animate-pulseFast shadow-[0_0_8px_#ef4444]" : "bg-emerald-500 shadow-[0_0_8px_#10b981]"}`} />
          <span className="text-xs font-mono font-bold tracking-wide text-zinc-200">
            {isDegraded ? "INCIDENT DETECTED (DEGRADED)" : "● LIVE ON AIR (4K HDR)"}
          </span>
        </div>
        <span className="text-zinc-600">|</span>
        <span className="text-xs font-mono text-zinc-400">
          CH 01 • GLOBAL FEED
        </span>
      </div>

      {/* Right Controls & Badges */}
      <div className="flex items-center space-x-3">
        {/* Grafana Cloud MCP Status */}
        <a
          href="https://grafana.com"
          target="_blank"
          rel="noreferrer"
          className="hidden lg:flex items-center space-x-1.5 text-xs font-mono text-orange-400 bg-orange-950/30 border border-orange-800/40 px-2.5 py-1 rounded hover:bg-orange-900/40 transition"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Grafana Cloud MCP</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
        </a>

        {/* Demo Action Trigger Buttons */}
        {!isDegraded ? (
          <button
            onClick={onInjectAnomaly}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/50 hover:bg-red-900/50 px-3 py-1.5 rounded transition active:scale-95 disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Transcode Incident</span>
          </button>
        ) : (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 px-3 py-1.5 rounded transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Stream</span>
          </button>
        )}
      </div>
    </header>
  );
};
