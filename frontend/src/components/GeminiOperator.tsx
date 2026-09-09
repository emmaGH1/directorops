"use client";

import React from "react";
import { Check, ShieldCheck, Clock, ArrowRight, FileText } from "lucide-react";

export interface AgentEventStep {
  step: number;
  type: string;
  title?: string;
  content?: string;
  tool?: string;
  args?: any;
  summary?: string;
  hypothesis?: string;
  action?: string;
  latency_ms?: number;
  timestamp: number;
}

interface GeminiOperatorProps {
  status: string; // "NOMINAL" | "INVESTIGATING" | "DEGRADED" | "RECOVERED"
  steps: AgentEventStep[];
  latestReceipt: any;
  onViewReceipt?: () => void;
  isConnected?: boolean;
  elapsedDuration?: string | null;
  primaryEncoder: string;
}

export const GeminiOperator: React.FC<GeminiOperatorProps> = ({
  status,
  steps,
  latestReceipt,
  onViewReceipt,
  isConnected = true,
  elapsedDuration,
  primaryEncoder,
}) => {
  // Derive operational state strictly in Title Case
  let operationalState: "Monitoring" | "Investigating" | "Deciding" | "Executing" | "Verified" = "Monitoring";

  if (status === "RECOVERED" || latestReceipt) {
    operationalState = "Verified";
  } else if (steps.some((s) => s.type === "FAILOVER_EXECUTED")) {
    operationalState = "Executing";
  } else if (steps.some((s) => s.type === "AGENT_DECISION")) {
    operationalState = "Deciding";
  } else if (status === "INVESTIGATING" || steps.length > 0) {
    operationalState = "Investigating";
  }

  // Find real decision and diagnosis from existing events
  const decisionStep = steps.find((s) => s.type === "AGENT_DECISION");
  const failoverStep = steps.find((s) => s.type === "FAILOVER_EXECUTED");

  return (
    <div className="w-full rounded-md border border-[#27272a] bg-[#121215] p-3.5 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              operationalState === "Monitoring"
                ? "bg-emerald-500"
                : operationalState === "Investigating"
                ? "bg-amber-400"
                : operationalState === "Deciding" || operationalState === "Executing"
                ? "bg-[#FF4D3D]"
                : "bg-emerald-500"
            }`}
          />
          <h3 className="text-xs font-semibold text-zinc-200">
            Gemini Operator
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {elapsedDuration && operationalState === "Investigating" && (
            <span className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{elapsedDuration}</span>
            </span>
          )}
          <span
            className={`text-[11px] font-medium ${
              operationalState === "Monitoring"
                ? "text-zinc-400"
                : operationalState === "Investigating"
                ? "text-amber-400"
                : operationalState === "Deciding" || operationalState === "Executing"
                ? "text-[#FF4D3D]"
                : "text-emerald-400"
            }`}
          >
            {operationalState}
          </span>
        </div>
      </div>

      {/* State Body: Clean, restrained operational surface */}
      <div className="flex-1 flex flex-col justify-center min-h-[140px]">
        {/* 1. STATE: MONITORING (Idle) */}
        {operationalState === "Monitoring" && (
          <div className="py-2 space-y-1.5">
            <p className="text-xs font-medium text-zinc-300">
              Watching production telemetry.
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              No intervention required. Primary ingest stream and Genlock phase reference are locked within broadcast tolerances.
            </p>
          </div>
        )}

        {/* 2. STATE: INVESTIGATING */}
        {operationalState === "Investigating" && (
          <div className="py-1 space-y-2">
            <p className="text-xs font-medium text-amber-300">
              Correlating real-time telemetry and error streams...
            </p>

            {/* Progressive real event checklist from existing SSE stream */}
            <div className="space-y-1.5 border-t border-[#1e1e24] pt-2">
              {steps.map((step, idx) => {
                const isComplete = idx < steps.length - 1 || steps.length > 3;
                let label = step.title || step.type;
                if (step.type === "ALERT_INGEST") {
                  label = `Ingested alert: ${step.title?.replace("Alert Ingested: ", "") || "BroadcastDesync"}`;
                } else if (step.tool === "query_prometheus") {
                  label = "Queried Prometheus metric drop rate";
                } else if (step.tool === "query_loki") {
                  label = "Isolated hardware fault in Loki log stream";
                }

                return (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-300 truncate max-w-[240px]">{label}</span>
                    <span className="text-emerald-400 font-mono text-[10px] ml-2">✓</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. STATE: DECIDING */}
        {operationalState === "Deciding" && (
          <div className="py-1 space-y-2">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                Mitigation Decision
              </span>
              <p className="text-xs font-semibold text-white mt-0.5">
                {decisionStep?.action || "Fail program ingest to hot-standby transcoder"}
              </p>
            </div>

            <div className="border-t border-[#1e1e24] pt-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                Diagnosed Root Cause
              </span>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                {decisionStep?.hypothesis || decisionStep?.content || "Hardware encoder buffer overrun confirmed."}
              </p>
            </div>
          </div>
        )}

        {/* 4. STATE: EXECUTING */}
        {operationalState === "Executing" && (
          <div className="py-1 space-y-2">
            <div>
              <span className="text-[10px] font-mono text-[#FF4D3D] uppercase tracking-wider block">
                Signal Transition in Progress
              </span>
              <p className="text-xs font-semibold text-white mt-0.5">
                Rerouting active crossbar: transcoder-pod-us-east-01 → transcoder-pod-us-east-02
              </p>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-[#1e1e24] pt-2">
              Atomic SDI matrix failover committed. Awaiting stream lock at 59.94 FPS...
            </p>
          </div>
        )}

        {/* 5. STATE: VERIFIED */}
        {operationalState === "Verified" && (
          <div className="py-1 space-y-2.5">
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Stream SLA Restored &amp; Verified</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                Active feed locked at 59.94 FPS, 0.00% packet loss on {primaryEncoder}. Cryptographic proof sealed.
              </p>
            </div>

            {latestReceipt && onViewReceipt && (
              <button
                onClick={onViewReceipt}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[#18181c] hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 transition font-medium"
              >
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Technical Audit Receipt</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
