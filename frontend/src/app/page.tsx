"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { LiveMonitor } from "@/components/LiveMonitor";
import { TelemetryHUD } from "@/components/TelemetryHUD";
import { AgentDrawer, AgentStep } from "@/components/AgentDrawer";
import { ReceiptModal } from "@/components/ReceiptModal";
import { Server, Activity, ShieldCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function MasterControlRoomPage() {
  const [status, setStatus] = useState("NOMINAL");
  const [fps, setFps] = useState(59.94);
  const [bitrate, setBitrate] = useState(12.48);
  const [packetLoss, setPacketLoss] = useState(0.00);
  const [ptsDrift, setPtsDrift] = useState(4.0);
  const [primaryPod, setPrimaryPod] = useState("transcoder-pod-us-east-4");
  const [backupPod, setBackupPod] = useState("transcoder-pod-us-east-backup");
  const [activeAlert, setActiveAlert] = useState<any>(null);

  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Poll live telemetry every 2 seconds
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/telemetry/live`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setFps(data.fps);
          setBitrate(data.bitrate_mbps);
          setPacketLoss(data.packet_loss_pct);
          setPtsDrift(data.pts_drift_ms);
          setPrimaryPod(data.primary_pod);
          setBackupPod(data.backup_pod);
          setActiveAlert(data.active_alert);
        }
      } catch (err) {
        // Backend might still be starting or in offline mode
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectAnomaly = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/inject-anomaly`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setFps(data.fps);
        setBitrate(data.bitrate_mbps);
        setPacketLoss(data.packet_loss_pct);
        setPtsDrift(data.pts_drift_ms);
        setActiveAlert(data.active_alert);
      }
    } catch (err) {
      // Local fallback
      setStatus("DEGRADED");
      setFps(31.2);
      setBitrate(8.15);
      setPacketLoss(14.8);
      setPtsDrift(842.0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/reset`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setFps(data.fps);
        setBitrate(data.bitrate_mbps);
        setPacketLoss(data.packet_loss_pct);
        setPtsDrift(data.pts_drift_ms);
        setPrimaryPod(data.primary_pod);
        setActiveAlert(null);
        setSteps([]);
        setLatestReceipt(null);
      }
    } catch (err) {
      setStatus("NOMINAL");
      setFps(59.94);
      setBitrate(12.48);
      setPacketLoss(0.0);
      setPtsDrift(4.0);
      setSteps([]);
      setLatestReceipt(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerInvestigation = () => {
    setIsInvestigating(true);
    setSteps([]);

    // Connect to Server-Sent Events (SSE) endpoint
    const eventSource = new EventSource(`${API_BASE}/api/incident/stream`);

    eventSource.addEventListener("agent_step", (e: MessageEvent) => {
      try {
        const stepData: AgentStep = JSON.parse(e.data);
        setSteps((prev) => [...prev, stepData]);

        if (stepData.type === "FAILOVER_EXECUTED") {
          setStatus("NOMINAL");
          setFps(59.94);
          setBitrate(12.5);
          setPacketLoss(0.0);
          setPtsDrift(3.5);
          setPrimaryPod(backupPod);
        }

        if (stepData.type === "MITIGATION_RECEIPT" && stepData.receipt) {
          setLatestReceipt(stepData.receipt);
          setIsInvestigating(false);
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing SSE event", err);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
      setIsInvestigating(false);
    };
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <Header
        status={status}
        onInjectAnomaly={handleInjectAnomaly}
        onReset={handleReset}
        isLoading={isLoading}
        activeAlert={activeAlert}
      />

      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col space-y-6">
        {/* Main Grid: Viewport + Telemetry on Left, Agent Drawer on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Video Viewport & Telemetry HUD (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <LiveMonitor
              status={status}
              fps={fps}
              packetLoss={packetLoss}
              ptsDrift={ptsDrift}
              primaryPod={primaryPod}
            />

            <TelemetryHUD
              fps={fps}
              bitrate={bitrate}
              packetLoss={packetLoss}
              ptsDrift={ptsDrift}
              primaryPod={primaryPod}
              backupPod={backupPod}
              status={status}
            />

            {/* Architecture Details Footer Bar */}
            <div className="p-3.5 rounded-lg bg-[#121215] border border-[#27272a] font-mono text-[11px] text-zinc-400 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-zinc-500" />
                <span>ACTIVE POD: <strong className="text-zinc-200">{primaryPod}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>GRAFANA MCP: <strong className="text-emerald-400">ONLINE (60+ TOOLS)</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>GEMINI ADK: <strong className="text-cyan-300">AUTONOMOUS SRE</strong></span>
              </div>
            </div>
          </div>

          {/* Right Column: Autonomous Agent Terminal (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <AgentDrawer
              steps={steps}
              isInvestigating={isInvestigating}
              onTriggerInvestigation={handleTriggerInvestigation}
              onViewReceipt={() => setShowReceiptModal(true)}
              status={status}
              latestReceipt={latestReceipt}
            />
          </div>
        </div>
      </div>

      {/* Verifiable Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          receipt={latestReceipt}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </main>
  );
}
