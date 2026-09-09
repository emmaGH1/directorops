"use client";

import React from "react";
import { Radio, Cpu, Server, Globe, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface TopologyProps {
  status: string;
  activeScenario: string | null;
  primaryEncoder: string;
  standbyEncoder: string;
  originServer?: string;
  cdnEdge?: string;
}

export const SignalTopology: React.FC<TopologyProps> = ({
  status,
  activeScenario,
  primaryEncoder,
  standbyEncoder,
  originServer = "origin-packager-01",
  cdnEdge = "edge-ingress-na-east",
}) => {
  const isDegraded = status === "DEGRADED";
  const isRecovered = status === "RECOVERED";
  const isEnc01Active = primaryEncoder.includes("01");

  const isNvencFault = isDegraded && (!activeScenario || activeScenario === "nvenc_buffer_overflow");
  const isCdnFault = isDegraded && activeScenario === "cdn_edge_502";
  const isGenlockFault = isDegraded && activeScenario === "genlock_clock_drift";

  return (
    <div className="w-full rounded-md border border-[#27272a] bg-[#121215] p-3.5 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDegraded ? "bg-red-500" : isRecovered ? "bg-emerald-500" : "bg-zinc-400"
            }`}
          />
          <h3 className="text-xs font-semibold text-zinc-200">
            Signal Path Topology
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-zinc-500 font-mono">
            Virtual SDI Matrix
          </span>
          <span className="text-zinc-700">•</span>
          <span
            className={`text-[10px] font-medium ${
              isDegraded ? "text-red-400" : isRecovered ? "text-emerald-400" : "text-zinc-400"
            }`}
          >
            {isDegraded ? "Failover armed" : isRecovered ? "Rerouted to Standby" : "Nominal route"}
          </span>
        </div>
      </div>

      {/* Clean, Minimal SVG Signal Graph */}
      <div className="relative py-2 px-1 flex items-center justify-between min-h-[140px]">
        {/* Minimal SVG Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Path to ENC 01 (top) */}
          <path
            d="M 45 70 C 80 70, 95 38, 120 38"
            stroke={isNvencFault ? "#ef4444" : isEnc01Active ? "#a1a1aa" : "#3f3f46"}
            strokeWidth={isEnc01Active ? 2 : 1}
            strokeDasharray={!isEnc01Active ? "3 3" : "none"}
            opacity={isEnc01Active ? 1 : 0.35}
            fill="none"
          />

          {/* Path to ENC 02 (bottom) */}
          <path
            d="M 45 70 C 80 70, 95 102, 120 102"
            stroke={!isEnc01Active ? "#10b981" : "#3f3f46"}
            strokeWidth={!isEnc01Active ? 2 : 1}
            strokeDasharray={isEnc01Active ? "3 3" : "none"}
            opacity={!isEnc01Active ? 1 : 0.35}
            fill="none"
          />

          {/* Path from ENC 01 to Origin */}
          <path
            d="M 225 38 C 255 38, 265 70, 290 70"
            stroke={isEnc01Active ? (isNvencFault ? "#ef4444" : "#a1a1aa") : "#3f3f46"}
            strokeWidth={isEnc01Active ? 2 : 1}
            strokeDasharray={!isEnc01Active ? "3 3" : "none"}
            opacity={isEnc01Active ? 1 : 0.35}
            fill="none"
          />

          {/* Path from ENC 02 to Origin */}
          <path
            d="M 225 102 C 255 102, 265 70, 290 70"
            stroke={!isEnc01Active ? "#10b981" : "#3f3f46"}
            strokeWidth={!isEnc01Active ? 2 : 1}
            strokeDasharray={isEnc01Active ? "3 3" : "none"}
            opacity={!isEnc01Active ? 1 : 0.35}
            fill="none"
          />

          {/* Path from Origin to CDN Edge */}
          <path
            d="M 330 70 L 368 70"
            stroke={isCdnFault ? "#ef4444" : "#a1a1aa"}
            strokeWidth={2}
            strokeDasharray={isCdnFault ? "3 3" : "none"}
            opacity={isCdnFault ? 0.8 : 1}
            fill="none"
          />
        </svg>

        {/* Node 1: Camera Source */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-9 h-9 rounded bg-[#18181c] border border-zinc-700 flex items-center justify-center text-zinc-200">
            <Radio className="w-4 h-4 text-zinc-300" />
          </div>
          <span className="text-[10px] font-semibold text-zinc-200 mt-1">CAM A</span>
          <span className="text-[9px] text-zinc-500 font-mono">12G-SDI</span>
        </div>

        {/* Node Column 2: Dual Transcoders (ENC 01 & ENC 02) */}
        <div className="relative z-10 flex flex-col space-y-3">
          {/* ENC 01 */}
          <div
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center space-x-2 transition ${
              isEnc01Active
                ? isNvencFault
                  ? "bg-red-950/40 border-red-500/80 text-white"
                  : "bg-[#18181c] border-zinc-500 text-white"
                : "bg-[#101014] border-zinc-800 text-zinc-500 opacity-50"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isNvencFault && isEnc01Active
                  ? "bg-red-500"
                  : isEnc01Active
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }`}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-[11px]">ENC 01</span>
                {isEnc01Active && isNvencFault && (
                  <span className="text-[9px] text-red-400 font-mono">FAULT</span>
                )}
                {isEnc01Active && !isNvencFault && (
                  <span className="text-[9px] text-zinc-400 font-mono">ACTIVE</span>
                )}
                {!isEnc01Active && (
                  <span className="text-[9px] text-zinc-500 font-mono">STANDBY</span>
                )}
              </div>
              <span className="text-[9px] text-zinc-400 font-mono block">pod-us-east-01</span>
            </div>
          </div>

          {/* ENC 02 */}
          <div
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center space-x-2 transition ${
              !isEnc01Active
                ? "bg-emerald-950/30 border-emerald-500/80 text-white"
                : "bg-[#101014] border-zinc-800 text-zinc-500 opacity-60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                !isEnc01Active ? "bg-emerald-400" : "bg-zinc-600"
              }`}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-[11px]">ENC 02</span>
                {!isEnc01Active ? (
                  <span className="text-[9px] text-emerald-400 font-mono">HOT FAILOVER</span>
                ) : (
                  <span className="text-[9px] text-zinc-500 font-mono">STANDBY</span>
                )}
              </div>
              <span className="text-[9px] text-zinc-400 font-mono block">pod-us-east-02</span>
            </div>
          </div>
        </div>

        {/* Node 3: Origin Packager */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded border flex items-center justify-center transition ${
              isCdnFault
                ? "bg-red-950/40 border-red-500/80 text-red-300"
                : "bg-[#18181c] border-zinc-700 text-zinc-300"
            }`}
          >
            <Server className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-zinc-200 mt-1">ORIGIN</span>
          <span className="text-[9px] text-zinc-500 font-mono">HLS/DASH</span>
        </div>

        {/* Node 4: CDN Edge */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded border flex items-center justify-center transition ${
              isCdnFault
                ? "bg-red-950/40 border-red-500/80 text-red-300"
                : "bg-[#18181c] border-zinc-700 text-zinc-300"
            }`}
          >
            <Globe className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-zinc-200 mt-1">CDN EDGE</span>
          <span className="text-[9px] text-zinc-500 font-mono">Egress</span>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="border-t border-[#27272a] pt-2 mt-2 flex items-center justify-between text-[10px] text-zinc-400">
        <div className="flex items-center space-x-1.5">
          <span className="text-zinc-500">Active Encoder:</span>
          <span className="font-mono text-zinc-200 font-semibold">{primaryEncoder}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isGenlockFault ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <span className={isGenlockFault ? "text-amber-400 font-medium" : "text-zinc-400"}>
            {isGenlockFault ? "PTP Drift: 48.5µs" : "PTP Synced: 1.1µs"}
          </span>
        </div>
      </div>
    </div>
  );
};
