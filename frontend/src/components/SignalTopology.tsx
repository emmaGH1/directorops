"use client";

import React from "react";
import { Server, Radio, Cpu, Globe, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface TopologyProps {
  status: string;
  activeScenario: string | null;
  primaryEncoder: string;
  standbyEncoder: string;
  originServer: string;
  cdnEdge: string;
}

export const SignalTopology: React.FC<TopologyProps> = ({
  status,
  activeScenario,
  primaryEncoder,
  standbyEncoder,
  originServer,
  cdnEdge
}) => {
  const isDegraded = status === "DEGRADED";
  const isEnc01Active = primaryEncoder === "transcoder-pod-us-east-01";

  return (
    <div className="w-full h-full rounded-lg border border-[#27272a] bg-[#121215] p-4 flex flex-col justify-between shadow-xl font-mono relative overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-zinc-200">SIGNAL ROUTING TOPOLOGY (PVW 01)</span>
        </div>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {isDegraded ? "INCIDENT REROUTE ARMED" : "PRIMARY PATH LOCKED"}
        </span>
      </div>

      {/* SVG Topology Visualizer */}
      <div className="relative flex-1 flex items-center justify-between px-2 py-4">
        {/* Animated Connecting Bezier Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="faultGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="failoverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Path from Cam A to Primary Enc */}
          <path
            d={isEnc01Active ? "M 70 80 Q 140 40, 210 45" : "M 70 80 Q 140 120, 210 115"}
            stroke={isDegraded ? "url(#faultGrad)" : "url(#activeGrad)"}
            strokeWidth="2.5"
            strokeDasharray={isDegraded ? "4 4" : "none"}
            fill="none"
            className={isDegraded ? "animate-pulse" : ""}
          />

          {/* Path from Primary Enc to Origin */}
          <path
            d={isEnc01Active ? "M 280 45 Q 350 40, 420 80" : "M 280 115 Q 350 120, 420 80"}
            stroke={isDegraded && activeScenario === "cdn_edge_502" ? "url(#faultGrad)" : "url(#activeGrad)"}
            strokeWidth="2.5"
            strokeDasharray={isDegraded && activeScenario === "cdn_edge_502" ? "4 4" : "none"}
            fill="none"
          />

          {/* Path from Origin to CDN Edge */}
          <path
            d="M 490 80 L 560 80"
            stroke={isDegraded && activeScenario === "cdn_edge_502" ? "url(#faultGrad)" : "url(#activeGrad)"}
            strokeWidth="2.5"
            fill="none"
          />
        </svg>

        {/* Node 1: Camera Source */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg group hover:border-emerald-500 transition">
            <Radio className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-zinc-300 mt-2">CAM RIG A</span>
          <span className="text-[9px] text-zinc-500">4K 12G-SDI</span>
        </div>

        {/* Node Column 2: Dual Encoders (Primary & Standby) */}
        <div className="relative z-10 flex flex-col space-y-5">
          {/* ENC 01 */}
          <div className={`p-2.5 rounded-lg border transition-all duration-300 flex items-center space-x-2.5 ${
            isEnc01Active
              ? isDegraded && activeScenario === "nvenc_buffer_overflow"
                ? "bg-red-950/60 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                : "bg-zinc-900/90 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              : "bg-zinc-950/60 border-zinc-800 opacity-60"
          }`}>
            <Cpu className={`w-4 h-4 ${isEnc01Active ? isDegraded ? "text-red-400" : "text-emerald-400" : "text-zinc-500"}`} />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-zinc-200">ENC 01</span>
                {isEnc01Active && isDegraded ? (
                  <span className="text-[8px] bg-red-900 text-red-200 px-1 py-0.2 rounded">FAULT</span>
                ) : isEnc01Active ? (
                  <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800">PRIMARY</span>
                ) : (
                  <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded">DRAINED</span>
                )}
              </div>
              <span className="text-[9px] text-zinc-500 block">NVENC Pod US-East-01</span>
            </div>
          </div>

          {/* ENC 02 (Standby) */}
          <div className={`p-2.5 rounded-lg border transition-all duration-300 flex items-center space-x-2.5 ${
            !isEnc01Active
              ? "bg-zinc-900/90 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              : "bg-zinc-950/60 border-zinc-800"
          }`}>
            <Cpu className={`w-4 h-4 ${!isEnc01Active ? "text-emerald-400" : "text-zinc-500"}`} />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-zinc-200">ENC 02</span>
                {!isEnc01Active ? (
                  <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800">ACTIVE</span>
                ) : (
                  <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1 py-0.2 rounded border border-cyan-800">HOT STANDBY</span>
                )}
              </div>
              <span className="text-[9px] text-zinc-500 block">NVENC Pod US-East-02</span>
            </div>
          </div>
        </div>

        {/* Node 3: Origin Packager */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-lg transition ${
            isDegraded && activeScenario === "cdn_edge_502"
              ? "bg-red-950 border-red-500 animate-pulse text-red-400"
              : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-cyan-500"
          }`}>
            <Server className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-zinc-300 mt-2">ORIGIN</span>
          <span className="text-[9px] text-zinc-500">HLS/DASH Ingest</span>
        </div>

        {/* Node 4: CDN Edge */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-lg transition ${
            isDegraded && activeScenario === "cdn_edge_502"
              ? "bg-red-950 border-red-500 animate-pulse text-red-400"
              : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500"
          }`}>
            <Globe className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-zinc-300 mt-2">CDN EDGE</span>
          <span className="text-[9px] text-zinc-500">Global Theaters</span>
        </div>
      </div>

      {/* Bottom Route Status Banner */}
      <div className="mt-2 pt-2 border-t border-[#27272a] flex items-center justify-between text-[10px] text-zinc-400">
        <div className="flex items-center space-x-1.5">
          <span className="text-zinc-500">ACTIVE INGEST:</span>
          <span className="font-bold text-zinc-200">{primaryEncoder}</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-400 font-bold">
          <CheckCircle2 className="w-3 h-3" />
          <span>GENLOCK: PTP LOCKED (1.1μs)</span>
        </div>
      </div>
    </div>
  );
};
