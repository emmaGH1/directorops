"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface LiveMonitorProps {
  status: string;
  fps: number;
  packetLoss: number;
  ptsDrift: number;
  primaryEncoder?: string;
  primaryPod?: string;
  isInvestigating?: boolean;
  isConnected?: boolean;
  activeScenario?: string | null;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  status,
  fps,
  packetLoss,
  ptsDrift,
  primaryEncoder,
  primaryPod,
  isInvestigating = false,
  isConnected = true,
  activeScenario,
}) => {
  const encoderName = primaryEncoder || primaryPod || "transcoder-pod-us-east-01";
  const isDegraded = status === "DEGRADED";
  const isRecovered = status === "RECOVERED";
  const [timecode, setTimecode] = useState("01:24:18:04");
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // SMPTE 12M Timecode Clock (60fps simulation)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const f = String(Math.floor((now.getMilliseconds() / 1000) * 60)).padStart(2, "0");
      setTimecode(`${h}:${m}:${s}:${f}`);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Visualizer (24-bin canvas spectrum - quiet, functional)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const numBars = 24;

    const renderSpectrum = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        let baseHeight = Math.sin(Date.now() * 0.004 + i * 0.35) * 0.45 + 0.5;
        if (!isConnected) {
          baseHeight = 0.05; // flatline
        } else if (isDegraded) {
          // Believable audio frame jitter / stutter during packet drop
          baseHeight *= Math.random() > 0.4 ? 0.3 : 1.15;
        }
        const barHeight = Math.max(2, baseHeight * canvas.height * 0.85);

        // Functional broadcast audio meter thresholds
        let fillColor = "#10b981"; // -24dB to -6dB (nominal)
        if (!isConnected) fillColor = "#52525b";
        else if (i > 19) fillColor = isDegraded ? "#ef4444" : "#f59e0b"; // 0dB peak
        else if (i > 15) fillColor = "#f59e0b"; // -6dB warning

        ctx.fillStyle = fillColor;
        ctx.fillRect(i * (barWidth + 2), canvas.height - barHeight, barWidth, barHeight);
      }

      animId = requestAnimationFrame(renderSpectrum);
    };

    renderSpectrum();
    return () => cancelAnimationFrame(animId);
  }, [isDegraded, isConnected]);

  // Operational fault descriptions
  let faultHeadline = "Hardware Buffer Overrun";
  let faultDetail = `PTS desync: +${ptsDrift.toFixed(1)}ms • UDP packet loss: ${packetLoss.toFixed(1)}% • ${fps.toFixed(2)} FPS`;
  if (activeScenario === "cdn_edge_502") {
    faultHeadline = "CDN Edge Origin Gateway Timeout (502)";
    faultDetail = `Origin packager backlog saturated • Edge cascade • ${fps.toFixed(2)} FPS`;
  } else if (activeScenario === "genlock_clock_drift") {
    faultHeadline = "SMPTE ST 2059-2 PTP Reference Drift";
    faultDetail = `Grandmaster jitter 48.5µs • Field phase mismatch • PTS drift: +${ptsDrift.toFixed(1)}ms`;
  }

  return (
    <div className="relative w-full rounded-md border border-[#27272a] bg-[#121215] overflow-hidden flex flex-col">
      {/* Broadcast Monitor Header Strip */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#18181c] border-b border-[#27272a] text-xs">
        <div className="flex items-center space-x-2.5">
          <span className="font-sans font-bold text-white tracking-wider">PGM 01</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-[11px] text-zinc-300">4K UHD @ {fps.toFixed(2)} FPS</span>
        </div>

        <div className="flex items-center space-x-3 text-zinc-400 text-[11px]">
          <span className="font-sans">Source: <strong className="text-zinc-200">CAM A</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="font-sans">
            Ingest: <strong className="font-mono text-zinc-200">{encoderName.split("-").slice(-2).join("-")}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <button
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            className="flex items-center space-x-1 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            title="Toggle broadcast safe guides"
          >
            {showSafeAreas ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="font-sans">Safe Area</span>
          </button>
        </div>
      </div>

      {/* 16:9 Cinema Master Feed Viewport (Clean, Uncluttered Image) */}
      <div className={`relative aspect-video w-full bg-black overflow-hidden select-none ${isDegraded ? "feed-degraded" : ""}`}>
        {/* Cinema Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/cinema_stage.jpg"
            alt="Live Cinema Production Feed"
            className="w-full h-full object-cover brightness-95 contrast-105"
          />
          {/* Subtle natural cinema vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Framing Safe Area Guides (Authentic 90% broadcast action-safe) */}
        {showSafeAreas && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-[90%] h-[90%] border border-white/25 border-dashed relative">
              <span className="absolute top-1 left-2 text-[9px] text-white/40 tracking-widest font-mono">
                90% ACTION SAFE
              </span>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3">
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/30" />
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/30" />
              </div>
            </div>
          </div>
        )}

        {/* Restrained Operational Fault Banner (Answers: "What is wrong?") */}
        {isDegraded && (
          <div className="absolute inset-x-0 top-3 z-30 mx-4 px-4 py-2.5 rounded bg-black/90 border border-red-500/80 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded bg-red-950/80 border border-red-500/60 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h4 className="text-xs font-sans font-bold text-white tracking-wide">
                  {faultHeadline}
                </h4>
                <p className="text-[11px] font-mono text-zinc-300">
                  {faultDetail}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700/60">
                {isInvestigating ? "Triage in progress" : "Failover armed"}
              </span>
            </div>
          </div>
        )}

        {/* Investigating State Bar (When diagnosing but before critical fault threshold) */}
        {isInvestigating && !isDegraded && (
          <div className="absolute inset-x-0 top-3 z-30 mx-4 px-3.5 py-1.5 rounded bg-black/90 border border-amber-500/60 backdrop-blur-sm flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-amber-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="font-sans">Investigating telemetry anomaly via Grafana MCP...</span>
            </div>
          </div>
        )}

        {/* Disconnected State Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
            <span className="text-amber-400 text-sm font-sans font-semibold mb-1">Telemetry Pipeline Offline</span>
            <p className="text-zinc-400 text-xs max-w-xs font-sans">
              FastAPI backend stream disconnected at http://localhost:8001. Attempting automatic reconnection...
            </p>
          </div>
        )}

        {/* Bottom-Left Audio Spectrum Visualizer (Functional, minimal broadcast audio instrumentation) */}
        <div className="absolute bottom-3 left-3 z-20 bg-black/80 border border-zinc-800 px-2.5 py-1 rounded flex items-center space-x-2">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
          <canvas ref={canvasRef} width={110} height={16} className="rounded" />
          <span className="font-mono text-[9px] text-zinc-400 font-semibold">5.1 CH</span>
        </div>
      </div>

      {/* Monitor Footer Strip: Clean Stream Metadata (No redundant resolution or duplicate metrics) */}
      <div className="bg-[#101014] border-t border-[#27272a] px-3.5 py-2 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span>Format: <strong className="text-zinc-200">HEVC Main 10 (10-bit 4:2:2)</strong></span>
          <span className="text-zinc-700">•</span>
          <span>Color: <strong className="text-zinc-200">BT.2020 WCG</strong></span>
          <span className="text-zinc-700">•</span>
          <span>Audio: <strong className="text-zinc-200">SMPTE ST 2110-30</strong></span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="text-zinc-500">Genlock:</span>
          <span className={isDegraded && activeScenario === "genlock_clock_drift" ? "text-amber-400 font-bold" : "text-emerald-400 font-semibold"}>
            {isDegraded && activeScenario === "genlock_clock_drift" ? "PTP Jitter 48.5µs" : "PTP Locked (1.1µs)"}
          </span>
        </div>
      </div>
    </div>
  );
};
