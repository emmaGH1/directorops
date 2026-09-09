"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal, ShieldAlert, Cpu, CheckCircle2, FileCheck, ArrowRight, Play, ChevronDown, ChevronRight, Activity } from "lucide-react";

export interface AgentStep {
  step: number;
  type: string;
  title?: string;
  content?: string;
  tool?: string;
  args?: any;
  data?: any;
  summary?: string;
  hypothesis?: string;
  action?: string;
  post_metrics?: any;
  receipt?: any;
  timestamp: number;
}

interface AgentDrawerProps {
  steps: AgentStep[];
  isInvestigating: boolean;
  onTriggerInvestigation: () => void;
  onViewReceipt: () => void;
  status: string;
  latestReceipt: any;
  isConnected?: boolean;
  isDemoMode?: boolean;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  steps,
  isInvestigating,
  onTriggerInvestigation,
  onViewReceipt,
  status,
  latestReceipt,
  isConnected = true,
  isDemoMode = true
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const isDegraded = status === "DEGRADED";
  const [expandedArgs, setExpandedArgs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  const toggleArgs = (idx: number) => {
    setExpandedArgs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="w-full rounded-lg border border-[#27272a] bg-[#121215] overflow-hidden shadow-xl flex flex-col h-[480px] font-mono">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-[#18181c] border-b border-[#27272a] gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-zinc-200">
            GEMINI 3.8 FLASH ReAct SRE TERMINAL
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Pill */}
          <span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
            isDemoMode
              ? "bg-zinc-900 text-zinc-400 border-zinc-700"
              : "bg-cyan-950 text-cyan-300 border-cyan-800"
          }`}>
            {isDemoMode ? "OFFLINE ENGINE" : "LIVE GEMINI 3.8"}
          </span>

          {latestReceipt && (
            <button
              onClick={onViewReceipt}
              className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 hover:bg-emerald-900/50 px-2 py-0.5 rounded transition active:scale-95"
            >
              <FileCheck className="w-3 h-3" />
              <span>Receipt</span>
            </button>
          )}

          {isDegraded && (
            <button
              onClick={onTriggerInvestigation}
              disabled={isInvestigating || !isConnected}
              className="flex items-center space-x-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded transition active:scale-95 disabled:opacity-50 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isInvestigating ? "Diagnosing via MCP..." : "Deploy Gemini SRE"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Feed */}
      <div className="flex-1 p-3.5 overflow-y-auto text-xs space-y-2.5 bg-[#09090b]/90">
        {!isConnected ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
            <Cpu className="w-8 h-8 text-amber-500 mb-2 animate-pulse" />
            <p className="font-semibold text-amber-400">FastAPI SSE Pipeline Offline</p>
            <p className="text-[11px] max-w-sm mt-1 text-zinc-500">
              Unable to connect to Server-Sent Events stream at /api/incident/stream. Check backend process on port 8001.
            </p>
          </div>
        ) : steps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
            <Cpu className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="font-semibold text-zinc-400">Master Control Room Standby</p>
            <p className="text-[11px] max-w-sm mt-1 text-zinc-500">
              Stream telemetry nominal. ReAct agent listening on Grafana Alertmanager webhook on channel 4K_MAIN_LIVE.
            </p>
            {isDegraded && (
              <button
                onClick={onTriggerInvestigation}
                disabled={isInvestigating}
                className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-500 transition shadow-lg flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Deploy Autonomous Incident Commander</span>
              </button>
            )}
          </div>
        ) : (
          steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded border border-zinc-800/80 bg-[#121215]/95 p-2.5 transition-all duration-200"
            >
              {/* Badge & Title */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      step.type === "ALERT_INGEST"
                        ? "bg-red-950 text-red-400 border border-red-800/50"
                        : step.type === "TOOL_CALL"
                        ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
                        : step.type === "TOOL_RESULT"
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        : step.type === "AGENT_DECISION"
                        ? "bg-amber-950 text-amber-400 border border-amber-800/50"
                        : step.type === "FAILOVER_EXECUTED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                        : "bg-purple-950 text-purple-400 border border-purple-800/50"
                    }`}
                  >
                    {step.type}
                  </span>
                  <span className="font-bold text-zinc-200 text-[11px]">{step.title}</span>
                </div>
                <span className="text-[9px] text-zinc-500">Step {step.step}</span>
              </div>

              {/* Main Content */}
              {step.content && <p className="text-zinc-300 text-[11px] leading-relaxed mt-1">{step.content}</p>}

              {/* Tool Call Arguments (Expandable) */}
              {step.args && (
                <div className="mt-1.5">
                  <button
                    onClick={() => toggleArgs(idx)}
                    className="flex items-center space-x-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    {expandedArgs[idx] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>MCP Tool Args ({step.tool || "query"})</span>
                  </button>
                  {expandedArgs[idx] && (
                    <div className="mt-1 bg-black/80 p-2 rounded border border-zinc-800 text-[10px] text-cyan-300 font-mono overflow-x-auto">
                      <pre>{JSON.stringify(step.args, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tool Result Summary */}
              {step.summary && (
                <p className="mt-1.5 text-zinc-300 text-[11px] bg-zinc-900/70 p-2 rounded border border-zinc-800/80">
                  ↳ {step.summary}
                </p>
              )}

              {/* Hypothesis & Action */}
              {step.hypothesis && (
                <div className="mt-1.5 space-y-1 text-[11px] bg-amber-950/20 border border-amber-800/30 p-2 rounded">
                  <p className="text-amber-300">
                    <strong className="text-amber-400">Diagnosis: </strong>
                    {step.hypothesis}
                  </p>
                  {step.action && (
                    <p className="text-emerald-300">
                      <strong className="text-emerald-400">Mitigation: </strong>
                      {step.action}
                    </p>
                  )}
                </div>
              )}

              {/* Mitigation Receipt Preview */}
              {step.receipt && (
                <div className="mt-2 bg-emerald-950/30 border border-emerald-800/50 p-2 rounded text-[11px]">
                  <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                    <span className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>STREAM RESTORED • 59.94 FPS LOCKED</span>
                    </span>
                    <button
                      onClick={onViewReceipt}
                      className="underline text-xs text-emerald-300 hover:text-emerald-200"
                    >
                      View Full Receipt →
                    </button>
                  </div>
                  <p className="text-zinc-400 text-[10px]">
                    SHA-256 Digest: {step.receipt.telemetry_sha256?.slice(0, 24)}...
                  </p>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

