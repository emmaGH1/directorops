"use client";

import React from "react";
import { Activity, Clock, Wifi, Cpu } from "lucide-react";

interface OperationalHealthProps {
  fps: number;
  bitrate: number;
  packetLoss: number;
  ptsDrift: number;
  status: string;
  isConnected?: boolean;
}

export const OperationalHealth: React.FC<OperationalHealthProps> = ({
  fps,
  bitrate,
  packetLoss,
  ptsDrift,
  status,
  isConnected = true,
}) => {
  const isDegraded = status === "DEGRADED";
  const isRecovered = status === "RECOVERED";

  return (
    <div className="w-full rounded-md border border-[#27272a] bg-[#121215] p-3.5 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              !isConnected ? "bg-zinc-500" : isDegraded ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          <h3 className="text-xs font-semibold text-zinc-200">
            Operational Health
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">
          Prometheus Stream Telemetry
        </span>
      </div>

      {/* Large Scannable Telemetry Grid: 2x2 Clean Broadcast Instrumentation */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-1">
        {/* 1. Frame Rate */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px] mb-0.5">
            <Activity className="w-3 h-3 text-zinc-500" />
            <span>Frame Rate</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                !isConnected
                  ? "text-zinc-500"
                  : isDegraded && fps < 50
                  ? "text-red-400"
                  : "text-zinc-100"
              }`}
            >
              {isConnected ? fps.toFixed(2) : "--"}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">FPS</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">
            Target: 59.94
          </span>
        </div>

        {/* 2. Bitrate */}
        <div className="flex flex-col border-l border-[#1e1e24] pl-6">
          <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px] mb-0.5">
            <Wifi className="w-3 h-3 text-zinc-500" />
            <span>Bitrate</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                !isConnected
                  ? "text-zinc-500"
                  : isDegraded && bitrate < 10
                  ? "text-amber-400"
                  : "text-zinc-100"
              }`}
            >
              {isConnected ? bitrate.toFixed(2) : "--"}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">Mbps</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">
            Target: 12.50
          </span>
        </div>

        {/* 3. Packet Loss */}
        <div className="flex flex-col border-t border-[#1e1e24] pt-2.5">
          <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px] mb-0.5">
            <Cpu className="w-3 h-3 text-zinc-500" />
            <span>Packet Loss</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                !isConnected
                  ? "text-zinc-500"
                  : isDegraded && packetLoss > 0
                  ? "text-red-400"
                  : "text-zinc-100"
              }`}
            >
              {isConnected ? packetLoss.toFixed(2) : "--"}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">%</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">
            SLA: 0.00%
          </span>
        </div>

        {/* 4. A/V PTS Drift */}
        <div className="flex flex-col border-t border-l border-[#1e1e24] pt-2.5 pl-6">
          <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px] mb-0.5">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>A/V PTS Drift</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                !isConnected
                  ? "text-zinc-500"
                  : isDegraded && ptsDrift > 50
                  ? "text-red-400"
                  : "text-zinc-100"
              }`}
            >
              {isConnected ? `+${ptsDrift.toFixed(1)}` : "--"}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">ms</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">
            Threshold: 50ms
          </span>
        </div>
      </div>
    </div>
  );
};
