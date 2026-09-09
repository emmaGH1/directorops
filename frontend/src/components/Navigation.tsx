"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, RefreshCw, AlertTriangle, Radio, Shield, Clock } from "lucide-react";

interface NavigationProps {
  status: "NOMINAL" | "INVESTIGATING" | "DEGRADED" | "RECOVERED";
  onTriggerScenario: (scenarioId: string) => void;
  onReset: () => void;
  isLoading: boolean;
  isConnected: boolean;
  timecode: string;
  isDemoMode?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  status,
  onTriggerScenario,
  onReset,
  isLoading,
  isConnected,
  timecode,
  isDemoMode = true,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDegraded = status === "DEGRADED";
  const isRecovered = status === "RECOVERED";
  const isInvestigating = status === "INVESTIGATING";

  const scenarios = [
    {
      id: "nvenc_buffer_overflow",
      title: "NVENC Buffer Overflow",
      detail: "Primary encoder exhaustion • +842ms PTS drift • 14.8% drop",
    },
    {
      id: "cdn_edge_502",
      title: "CDN Edge 502 Timeout",
      detail: "Origin packager timeout • Edge 502 cascade • 2.8s origin latency",
    },
    {
      id: "genlock_clock_drift",
      title: "SMPTE ST 2059 PTP Drift",
      detail: "Grandmaster clock jitter 48.5µs • Virtual stage phase desync",
    },
  ];

  return (
    <header className="w-full border-b border-[#27272a] bg-[#121215] px-4 lg:px-6 py-2 flex items-center justify-between font-sans text-xs select-none">
      {/* Left: Brand Mark, Authentic Broadcast Tally, System State, SMPTE Timecode */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm tracking-tight text-white">DirectorOps</span>
          <span className="text-[10px] text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            MCR 01
          </span>
        </div>

        <span className="text-zinc-700">|</span>

        {/* 1. Authentic Broadcast ON AIR Tally (Red broadcast lamp semantics) */}
        <div
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded font-bold tracking-wider text-[11px] ${
            !isConnected
              ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
              : "bg-red-600 text-white shadow-xs"
          }`}
          title={isConnected ? "Broadcast Program is transmitting live" : "Transmission offline"}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>ON AIR</span>
        </div>

        {/* 2. Independent Incident / System Health State */}
        <div
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
            !isConnected
              ? "bg-zinc-900 border-zinc-800 text-zinc-500"
              : isDegraded
              ? "bg-red-950/60 border-red-800/80 text-red-300"
              : isInvestigating
              ? "bg-amber-950/60 border-amber-800/80 text-amber-300"
              : isRecovered
              ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
              : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              !isConnected
                ? "bg-zinc-500"
                : isDegraded
                ? "bg-red-500"
                : isInvestigating
                ? "bg-amber-400"
                : isRecovered
                ? "bg-emerald-400"
                : "bg-emerald-500"
            }`}
          />
          <span>
            {isDegraded
              ? "Degraded"
              : isInvestigating
              ? "Investigating"
              : isRecovered
              ? "Restored"
              : "Nominal"}
          </span>
        </div>

        {/* SMPTE Running Timecode */}
        <div className="hidden sm:flex items-center space-x-1 font-mono text-[11px] text-zinc-300 bg-[#09090b] px-2 py-0.5 rounded border border-[#27272a]">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span>{timecode}</span>
        </div>
      </div>

      {/* Center: Clean Route Navigation Links (Control Room, Incidents, System) */}
      <nav className="hidden md:flex items-center space-x-5 text-xs font-medium">
        <Link
          href="/control"
          className="text-white border-b-2 border-zinc-200 pb-0.5"
        >
          Control Room
        </Link>
        <span className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer" title="Incident forensistics">
          Incidents
        </span>
        <span className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer" title="System settings & MCP boundaries">
          System
        </span>
      </nav>

      {/* Right: Runtime Indicator, Deliberate Incident Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Runtime Boundary (Quiet neutral display) */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          <span>
            Runtime: <strong className="text-zinc-300 font-semibold">{isDemoMode ? "Offline Engine" : "Gemini 3.8 Flash"}</strong>
          </span>
        </div>

        <span className="hidden lg:inline text-zinc-700">|</span>

        {/* Deliberate "Run incident" Command (Using #FF4D3D signal accent for primary intervention trigger) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isLoading || isInvestigating}
            className="px-3 py-1.5 rounded bg-[#FF4D3D] hover:bg-[#e03e2f] text-white font-medium text-xs flex items-center space-x-1.5 transition active:scale-98 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <span>{isInvestigating ? "Mitigating..." : "Run incident"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Clean Scenario Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-md bg-[#18181c] border border-zinc-700 shadow-xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1 text-zinc-400 text-[10px] font-semibold border-b border-zinc-800">
                Select Benchmark Incident
              </div>
              <div className="divide-y divide-zinc-800/60 mt-1">
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      onTriggerScenario(sc.id);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-zinc-800/80 transition flex flex-col space-y-0.5 group cursor-pointer"
                  >
                    <span className="font-semibold text-zinc-200 group-hover:text-white">
                      {sc.title}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {sc.detail}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Secondary "Reset stream" Action */}
        <button
          onClick={onReset}
          disabled={isLoading || status === "NOMINAL"}
          className={`px-2.5 py-1.5 rounded border text-xs font-medium flex items-center space-x-1.5 transition ${
            status !== "NOMINAL"
              ? "bg-[#18181c] hover:bg-zinc-800 border-zinc-700 text-zinc-200 cursor-pointer"
              : "bg-[#121215] border-zinc-850 text-zinc-600 opacity-40 cursor-not-allowed"
          }`}
          title="Reset stream to nominal baseline"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Reset stream</span>
        </button>
      </div>
    </header>
  );
};
