"use client";

import React from "react";
import { Activity, Cpu, Wifi, Clock, ExternalLink } from "lucide-react";

interface TelemetryHUDProps {
  fps: number;
  bitrate: number;
  packetLoss: number;
  ptsDrift: number;
  primaryPod: string;
  backupPod: string;
  status: string;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  fps,
  bitrate,
  packetLoss,
  ptsDrift,
  primaryPod,
  backupPod,
  status
}) => {
  const isDegraded = status === "DEGRADED";

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
      {/* 1. Bitrate Metric */}
      <div className="bg-[#121215] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span className="flex items-center space-x-1.5">
            <Wifi className="w-3.5 h-3.5 text-zinc-400" />
            <span>STREAM BITRATE</span>
          </span>
          <span className="text-[10px] text-zinc-500">HEVC CBR</span>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-bold tracking-tight ${isDegraded ? "text-amber-400" : "text-zinc-100"}`}>
            {bitrate.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400">Mbps</span>
        </div>
        <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
          <span>Target: 12.0 Mbps</span>
          <span className={isDegraded ? "text-amber-400" : "text-emerald-400"}>
            {isDegraded ? "Throttle active" : "Optimal"}
          </span>
        </div>
      </div>

      {/* 2. FPS Gauge */}
      <div className="bg-[#121215] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span>FRAME RATE</span>
          </span>
          <span className="text-[10px] text-zinc-500">TARGET: 60P</span>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-bold tracking-tight ${isDegraded ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
            {fps.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400">FPS</span>
        </div>
        <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
          <span>Drop Ratio: {isDegraded ? "14.8%" : "0.0%"}</span>
          <span className={isDegraded ? "text-red-400 font-bold" : "text-emerald-400"}>
            {isDegraded ? "● CRITICAL DROP" : "● LOCKED"}
          </span>
        </div>
      </div>

      {/* 3. Packet Loss % */}
      <div className="bg-[#121215] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>PACKET LOSS</span>
          </span>
          <span className="text-[10px] text-zinc-500">UDP / RTP</span>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-bold tracking-tight ${isDegraded ? "text-red-400" : "text-zinc-100"}`}>
            {packetLoss.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-400">%</span>
        </div>
        <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
          <span>Encoder Pod: <strong className="text-zinc-300">{primaryPod.slice(-6)}</strong></span>
          <span className={isDegraded ? "text-red-400" : "text-zinc-400"}>
            {isDegraded ? "Buffer fault" : "Healthy"}
          </span>
        </div>
      </div>

      {/* 4. PTS A/V Sync Drift */}
      <div className="bg-[#121215] border border-[#27272a] rounded-lg p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>A/V PTS SYNC DRIFT</span>
          </span>
          <span className="text-[10px] text-zinc-500">MAX: &lt;40ms</span>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-bold tracking-tight ${isDegraded ? "text-red-400" : "text-emerald-400"}`}>
            +{ptsDrift.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-400">ms</span>
        </div>
        <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
          <span>Standby: <strong className="text-zinc-300">{backupPod.slice(-6)}</strong></span>
          <span className={isDegraded ? "text-red-400 font-bold" : "text-emerald-400"}>
            {isDegraded ? "DESYNC CRITICAL" : "Lip-sync locked"}
          </span>
        </div>
      </div>
    </div>
  );
};
