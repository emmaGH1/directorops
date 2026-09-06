"use client";

import React, { useEffect, useRef, useState } from "react";
import { Film, Volume2, AlertOctagon, Maximize2, Radio, Eye } from "lucide-react";

interface LiveMonitorProps {
  status: string;
  fps: number;
  packetLoss: number;
  ptsDrift: number;
  primaryEncoder: string;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  status,
  fps,
  packetLoss,
  ptsDrift,
  primaryEncoder
}) => {
  const isDegraded = status === "DEGRADED";
  const [timecode, setTimecode] = useState("01:42:19:12");
  const [showSafeAreas, setShowSafeAreas] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // SMPTE Timecode Clock
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

  // Web Audio Visualizer Simulation (Real Canvas Frequency Bins)
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
        // Compute dynamic height based on time and audio frequency
        let baseHeight = Math.sin(Date.now() * 0.005 + i * 0.4) * 0.5 + 0.5;
        if (isDegraded) {
          baseHeight *= (Math.random() > 0.4 ? 0.3 : 1.2); // erratic audio stutter
        }
        const barHeight = Math.max(3, baseHeight * canvas.height * 0.85);

        // Color coding (green -> amber -> red)
        let fillColor = "#10b981"; // nominal green
        if (i > 18) fillColor = isDegraded ? "#ef4444" : "#f59e0b";
        else if (i > 14) fillColor = "#f59e0b";

        ctx.fillStyle = fillColor;
        ctx.fillRect(i * (barWidth + 2), canvas.height - barHeight, barWidth, barHeight);
      }

      animId = requestAnimationFrame(renderSpectrum);
    };

    renderSpectrum();
    return () => cancelAnimationFrame(animId);
  }, [isDegraded]);

  return (
    <div className="relative w-full rounded-lg border border-[#27272a] bg-[#121215] overflow-hidden shadow-2xl flex flex-col font-mono">
      {/* Monitor Header Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#18181c] border-b border-[#27272a] text-[11px]">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isDegraded ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
          <span className="font-bold text-zinc-200">PROGRAM (PGM 01)</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">4K DCI 3840x2160p @ {fps}fps</span>
        </div>
        <div className="flex items-center space-x-3 text-zinc-400">
          <button
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] transition ${
              showSafeAreas ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Safe Guides</span>
          </button>
          <span>INGEST: <strong className="text-zinc-200">{primaryEncoder.split("-").slice(-2).join("-")}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-bold">GENLOCK 59.94Hz</span>
        </div>
      </div>

      {/* 16:9 Viewport Area */}
      <div className={`relative aspect-video w-full bg-black overflow-hidden select-none ${isDegraded ? "glitch-active" : ""}`}>
        {/* Cinema Video Background Simulation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
          {/* Animated Ambient Cinema Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute w-96 h-96 rounded-full bg-red-600/10 blur-[140px] pointer-events-none" />

          {/* Central Broadcast Slate */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900/90 border border-zinc-700/80 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <Film className="w-7 h-7 text-zinc-300" />
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-white font-sans">
              "THE PROMETHEUS PROTOCOL"
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              GLOBAL CINEMA PREMIERE • SATELLITE 12G-SDI FEED
            </p>
            <div className="mt-3 flex items-center space-x-2 text-[10px] font-mono text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded border border-zinc-800">
              <span>COLOR: REC.709 10-BIT</span>
              <span>•</span>
              <span>AUDIO: 5.1 SURROUND</span>
              <span>•</span>
              <span className={isDegraded ? "text-red-400 font-bold" : "text-emerald-400"}>
                BITRATE: {isDegraded ? "8.15 Mbps (THROTTLED)" : "12.48 Mbps"}
              </span>
            </div>
          </div>
        </div>

        {/* 90% Action Safe / 80% Title Safe Framing Guides */}
        {showSafeAreas && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            {/* 90% Action Safe Guide */}
            <div className="w-[90%] h-[90%] border border-zinc-500/20 border-dashed rounded-xs relative">
              <span className="absolute top-1 left-1 text-[8px] text-zinc-500/40 uppercase">Action Safe 90%</span>
            </div>
            {/* 80% Title Safe Guide */}
            <div className="w-[80%] h-[80%] border border-zinc-500/30 rounded-xs absolute">
              <span className="absolute top-1 left-1 text-[8px] text-zinc-500/50 uppercase">Title Safe 80%</span>
            </div>
          </div>
        )}

        {/* Incident Degradation Banner */}
        {isDegraded && (
          <div className="absolute inset-x-0 top-1/3 z-30 bg-red-950/90 border-y border-red-500 px-4 py-3 flex items-center justify-between backdrop-blur-md animate-pulse">
            <div className="flex items-center space-x-3">
              <AlertOctagon className="w-6 h-6 text-red-400 animate-bounce" />
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  HARDWARE BUFFER OVERRUN • PACKET DROP CASCADE
                </h4>
                <p className="text-[11px] text-red-200">
                  PTS desync: +{ptsDrift}ms • UDP loss: {packetLoss}% • Frame rate: {fps} FPS
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-red-900 text-red-100 border border-red-700 rounded">
              FAILOVER ARMED
            </span>
          </div>
        )}

        {/* CRT Scanline Layer */}
        <div className="scanlines absolute inset-0 z-20 pointer-events-none" />

        {/* Top-Left OSD Tally Light */}
        <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 bg-black/80 border border-zinc-800 px-2 py-1 rounded text-[10px]">
          <span className={`w-2 h-2 rounded-full ${isDegraded ? "bg-red-500 animate-ping" : "bg-red-500"}`} />
          <span className="text-white font-bold">PGM • CAM A</span>
        </div>

        {/* Top-Right Running SMPTE Timecode */}
        <div className="absolute top-3 right-3 z-20 bg-black/80 border border-zinc-800 px-2.5 py-1 rounded text-xs text-emerald-400 font-bold tracking-wider">
          {timecode}
        </div>

        {/* Bottom Audio Frequency Visualizer Canvas */}
        <div className="absolute bottom-3 left-3 z-20 bg-black/80 border border-zinc-800 px-2.5 py-1.5 rounded flex items-center space-x-2">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
          <canvas ref={canvasRef} width={130} height={20} className="rounded" />
          <span className="text-[9px] text-zinc-400 font-bold">5.1 CH</span>
        </div>

        {/* Bottom-Right Stream Health Badge */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center space-x-1.5 bg-black/80 border border-zinc-800 px-2 py-1 rounded text-[10px]">
          <span className={`w-2 h-2 rounded-full ${isDegraded ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
          <span className={isDegraded ? "text-red-400 font-bold" : "text-zinc-300"}>
            {isDegraded ? "SLA BREACHED" : "LIP-SYNC LOCKED"}
          </span>
        </div>
      </div>
    </div>
  );
};
