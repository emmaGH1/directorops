"use client";

import React, { useState } from "react";
import { Activity, Cpu, Wifi, Clock, Code, ChevronRight } from "lucide-react";

interface TelemetryHUDProps {
  fps: number;
  bitrate: number;
  packetLoss: number;
  ptsDrift: number;
  primaryPod: string;
  backupPod: string;
  status: string;
  isConnected?: boolean;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  fps,
  bitrate,
  packetLoss,
  ptsDrift,
  primaryPod,
  backupPod,
  status,
  isConnected = true
}) => {
  const isDegraded = status === "DEGRADED";
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

  const toggleQuery = (key: string) => {
    setExpandedQuery(expandedQuery === key ? null : key);
  };

  return (
    <div className="w-full flex flex-col space-y-2 font-mono">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1">
        <span className="font-bold uppercase tracking-wider text-zinc-300">
          PROMETHEUS TIME-SERIES TELEMETRY (SLAs &amp; TOLERANCES)
        </span>
        <span className="text-zinc-500">
          {isConnected ? "POLLING: 2.0s INTERVAL (FASTAPI)" : "POLLING PAUSED (OFFLINE)"}
        </span>
      </div>

      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* 1. Bitrate Metric */}
        <div className="bg-[#121215] border border-[#27272a] rounded-lg p-2.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center space-x-1.5">
              <Wifi className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-bold">STREAM BITRATE</span>
            </span>
            <button
              onClick={() => toggleQuery("bitrate")}
              title="Inspect PromQL query"
              className="text-[9px] text-orange-400/80 hover:text-orange-300 flex items-center space-x-0.5"
            >
              <Code className="w-2.5 h-2.5" />
              <span>PromQL</span>
            </button>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-xl lg:text-2xl font-bold tracking-tight ${
              !isConnected ? "text-zinc-500" : isDegraded ? "text-amber-400" : "text-zinc-100"
            }`}>
              {isConnected ? bitrate.toFixed(2) : "--"}
            </span>
            <span className="text-xs text-zinc-400">Mbps</span>
          </div>
          <div className="mt-1.5 text-[9px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1">
            <span>Target: 12.0 Mbps</span>
            <span className={!isConnected ? "text-zinc-500" : isDegraded ? "text-amber-400 font-bold" : "text-emerald-400"}>
              {!isConnected ? "Offline" : isDegraded ? "Throttled" : "Optimal"}
            </span>
          </div>
          {expandedQuery === "bitrate" && (
            <div className="mt-1.5 p-1 rounded bg-black/70 border border-orange-800/40 text-[9px] text-orange-300 break-all">
              <code>rate(container_network_transmit_bytes_total[1m]) * 8 / 1e6</code>
            </div>
          )}
        </div>

        {/* 2. FPS Gauge */}
        <div className="bg-[#121215] border border-[#27272a] rounded-lg p-2.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-bold">FRAME RATE</span>
            </span>
            <button
              onClick={() => toggleQuery("fps")}
              title="Inspect PromQL query"
              className="text-[9px] text-orange-400/80 hover:text-orange-300 flex items-center space-x-0.5"
            >
              <Code className="w-2.5 h-2.5" />
              <span>PromQL</span>
            </button>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-xl lg:text-2xl font-bold tracking-tight ${
              !isConnected ? "text-zinc-500" : isDegraded ? "text-red-400 animate-pulse" : "text-emerald-400"
            }`}>
              {isConnected ? fps.toFixed(2) : "--"}
            </span>
            <span className="text-xs text-zinc-400">FPS</span>
          </div>
          <div className="mt-1.5 text-[9px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1">
            <span>Drop: {isDegraded ? "14.8%" : "0.0%"}</span>
            <span className={!isConnected ? "text-zinc-500" : isDegraded ? "text-red-400 font-bold" : "text-emerald-400"}>
              {!isConnected ? "Offline" : isDegraded ? "● CRITICAL DROP" : "● LOCKED"}
            </span>
          </div>
          {expandedQuery === "fps" && (
            <div className="mt-1.5 p-1 rounded bg-black/70 border border-orange-800/40 text-[9px] text-orange-300 break-all">
              <code>broadcast_transcoder_framerate_fps&#123;pod=&quot;{primaryPod}&quot;&#125;</code>
            </div>
          )}
        </div>

        {/* 3. Packet Loss % */}
        <div className="bg-[#121215] border border-[#27272a] rounded-lg p-2.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-bold">PACKET LOSS</span>
            </span>
            <button
              onClick={() => toggleQuery("loss")}
              title="Inspect PromQL query"
              className="text-[9px] text-orange-400/80 hover:text-orange-300 flex items-center space-x-0.5"
            >
              <Code className="w-2.5 h-2.5" />
              <span>PromQL</span>
            </button>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-xl lg:text-2xl font-bold tracking-tight ${
              !isConnected ? "text-zinc-500" : isDegraded ? "text-red-400" : "text-zinc-100"
            }`}>
              {isConnected ? packetLoss.toFixed(2) : "--"}
            </span>
            <span className="text-xs text-zinc-400">%</span>
          </div>
          <div className="mt-1.5 text-[9px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1">
            <span>Pod: <strong className="text-zinc-300">{primaryPod.split("-").slice(-2).join("-")}</strong></span>
            <span className={!isConnected ? "text-zinc-500" : isDegraded ? "text-red-400 font-bold" : "text-zinc-400"}>
              {!isConnected ? "Offline" : isDegraded ? "Buffer fault" : "Healthy"}
            </span>
          </div>
          {expandedQuery === "loss" && (
            <div className="mt-1.5 p-1 rounded bg-black/70 border border-orange-800/40 text-[9px] text-orange-300 break-all">
              <code>rate(node_network_transmit_drop_total&#123;pod=&quot;{primaryPod}&quot;&#125;[1m])</code>
            </div>
          )}
        </div>

        {/* 4. PTS A/V Sync Drift */}
        <div className="bg-[#121215] border border-[#27272a] rounded-lg p-2.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-bold">A/V PTS DRIFT</span>
            </span>
            <button
              onClick={() => toggleQuery("pts")}
              title="Inspect PromQL query"
              className="text-[9px] text-orange-400/80 hover:text-orange-300 flex items-center space-x-0.5"
            >
              <Code className="w-2.5 h-2.5" />
              <span>PromQL</span>
            </button>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-xl lg:text-2xl font-bold tracking-tight ${
              !isConnected ? "text-zinc-500" : isDegraded ? "text-red-400" : "text-emerald-400"
            }`}>
              {isConnected ? `+${ptsDrift.toFixed(1)}` : "--"}
            </span>
            <span className="text-xs text-zinc-400">ms</span>
          </div>
          <div className="mt-1.5 text-[9px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1">
            <span>Standby: <strong className="text-zinc-300">{backupPod.split("-").slice(-2).join("-")}</strong></span>
            <span className={!isConnected ? "text-zinc-500" : isDegraded ? "text-red-400 font-bold" : "text-emerald-400"}>
              {!isConnected ? "Offline" : isDegraded ? "DESYNC CRITICAL" : "Lip-sync locked"}
            </span>
          </div>
          {expandedQuery === "pts" && (
            <div className="mt-1.5 p-1 rounded bg-black/70 border border-orange-800/40 text-[9px] text-orange-300 break-all">
              <code>broadcast_audio_video_pts_drift_seconds * 1000</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

