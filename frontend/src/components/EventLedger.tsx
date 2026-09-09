"use client";

import React from "react";
import { AgentEventStep } from "./GeminiOperator";

interface EventLedgerProps {
  timecode: string;
  status: string;
  steps: AgentEventStep[];
  primaryEncoder: string;
  activeScenario: string | null;
}

export const EventLedger: React.FC<EventLedgerProps> = ({
  timecode,
  status,
  steps,
  primaryEncoder,
  activeScenario,
}) => {
  // Combine baseline operational events with dynamic ReAct steps from backend SSE
  const baselineEvents = [
    {
      tc: "01:24:00:00",
      subsystem: "INGEST",
      level: "NOMINAL",
      msg: "Primary 12G-SDI camera feed locked on CAM A (4K UHD 59.94p)",
    },
    {
      tc: "01:24:02:14",
      subsystem: "GENLOCK",
      level: "NOMINAL",
      msg: "SMPTE ST 2059-2 PTP grandmaster phase aligned (jitter 1.1µs)",
    },
    {
      tc: "01:24:04:22",
      subsystem: "AUDIO",
      level: "NOMINAL",
      msg: "SMPTE ST 2110-30 5.1 surround channels lip-sync locked",
    },
    {
      tc: "01:24:08:00",
      subsystem: "ROUTER",
      level: "NOMINAL",
      msg: `Crossbar matrix armed: ${primaryEncoder} active on PGM 01`,
    },
  ];

  // Map real SSE steps to broadcast event records
  const dynamicEvents = steps.map((s, idx) => {
    let level = "INFO";
    let subsystem = "GEMINI";

    if (s.type === "ALERT_INGEST") {
      level = "FAULT";
      subsystem = "TELEMETRY";
    } else if (s.type === "TOOL_CALL") {
      level = "DIAG";
      subsystem = s.tool?.includes("prometheus") ? "PROMQL" : s.tool?.includes("loki") ? "LOGQL" : "MCP";
    } else if (s.type === "FAILOVER_EXECUTED") {
      level = "FAILOVER";
      subsystem = "SDI MATRIX";
    } else if (s.type === "MITIGATION_RECEIPT") {
      level = "VERIFIED";
      subsystem = "AUDIT";
    }

    return {
      tc: timecode,
      subsystem,
      level,
      msg: s.title || s.summary || s.content || "Autonomous mitigation event",
    };
  });

  const allEvents = [...baselineEvents, ...dynamicEvents].slice(-6).reverse();

  return (
    <div className="w-full rounded-md border border-[#27272a] bg-[#121215] overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#18181c] border-b border-[#27272a] text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-zinc-200">MCR Event Ledger</span>
          <span className="text-zinc-600">•</span>
          <span className="text-[11px] text-zinc-400 font-mono">Stream Automation & Diagnostics</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500">
          <span>Live Ingest</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Real Event Rows */}
      <div className="p-2 divide-y divide-[#1e1e24]/70 font-mono text-[11px]">
        {allEvents.map((evt, i) => (
          <div
            key={i}
            className="py-1.5 px-2 flex items-center justify-between hover:bg-[#18181c]/50 transition rounded-xs"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <span className="text-zinc-500 shrink-0 select-none">{evt.tc}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                  evt.level === "FAULT"
                    ? "bg-red-950/80 text-red-300 border border-red-800/80"
                    : evt.level === "FAILOVER"
                    ? "bg-[#FF4D3D]/20 text-[#FF4D3D] border border-[#FF4D3D]/40"
                    : evt.level === "VERIFIED"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                    : evt.level === "DIAG"
                    ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                }`}
              >
                {evt.subsystem}
              </span>
              <span className="text-zinc-300 truncate">{evt.msg}</span>
            </div>
            <span
              className={`text-[10px] font-semibold shrink-0 ml-2 ${
                evt.level === "FAULT"
                  ? "text-red-400"
                  : evt.level === "VERIFIED"
                  ? "text-emerald-400"
                  : evt.level === "FAILOVER"
                  ? "text-[#FF4D3D]"
                  : "text-zinc-500"
              }`}
            >
              {evt.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
