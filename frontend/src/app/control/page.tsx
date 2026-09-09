"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { LiveMonitor } from "@/components/LiveMonitor";
import { OperationalRail } from "@/components/OperationalRail";
import { EventLedger } from "@/components/EventLedger";
import { AgentEventStep } from "@/components/GeminiOperator";
import { ReceiptModal } from "@/components/ReceiptModal";

interface TelemetryState {
  status: string;
  fps: number;
  bitrate_mbps: number;
  packet_loss_pct: number;
  pts_drift_ms: number;
  primary_pod: string;
  backup_pod: string;
  active_scenario: string | null;
  active_alert: any;
}

interface HealthState {
  status: string;
  service: string;
  gemini_model: string;
  demo_mode: boolean;
  grafana_connected: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export default function MasterControlRoomPage() {
  const [status, setStatus] = useState<"NOMINAL" | "INVESTIGATING" | "DEGRADED" | "RECOVERED">("NOMINAL");
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [primaryEncoder, setPrimaryEncoder] = useState("transcoder-pod-us-east-01");
  const [standbyEncoder, setStandbyEncoder] = useState("transcoder-pod-us-east-02");

  // Operational Telemetry Metrics
  const [fps, setFps] = useState(59.94);
  const [bitrate, setBitrate] = useState(12.48);
  const [packetLoss, setPacketLoss] = useState(0.00);
  const [ptsDrift, setPtsDrift] = useState(4.0);

  // Backend Connectivity & Runtime Mode
  const [isConnected, setIsConnected] = useState(true);
  const [healthData, setHealthData] = useState<HealthState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time SMPTE Timecode Clock
  const [timecode, setTimecode] = useState("01:24:18:04");

  // Investigation Timing
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedDuration, setElapsedDuration] = useState<string | null>(null);

  // Real ReAct Event Steps from Backend SSE
  const [steps, setSteps] = useState<AgentEventStep[]>([]);
  const [latestReceipt, setLatestReceipt] = useState<any>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // SMPTE 12M Timecode Clock
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

  // Investigation elapsed timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "INVESTIGATING" && startTime) {
      interval = setInterval(() => {
        const diff = ((Date.now() - startTime) / 1000).toFixed(1);
        setElapsedDuration(`${diff}s`);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  // Poll live telemetry and backend health
  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const [telemetryRes, healthRes] = await Promise.all([
          fetch(`${API_BASE}/api/telemetry/live`),
          fetch(`${API_BASE}/api/health`),
        ]);

        if (telemetryRes.ok && healthRes.ok) {
          const tData: TelemetryState = await telemetryRes.json();
          const hData: HealthState = await healthRes.json();

          if (!isMounted) return;
          setIsConnected(true);
          setHealthData(hData);

          if (status !== "INVESTIGATING") {
            if (tData.status === "DEGRADED" && status !== "DEGRADED" && status !== "RECOVERED") {
              setStatus("DEGRADED");
            } else if (tData.status === "NOMINAL" && status !== "RECOVERED") {
              setStatus("NOMINAL");
            }
          }

          setFps(tData.fps);
          setBitrate(tData.bitrate_mbps);
          setPacketLoss(tData.packet_loss_pct);
          setPtsDrift(tData.pts_drift_ms);
          setPrimaryEncoder(tData.primary_pod);
          setStandbyEncoder(tData.backup_pod);
          setActiveScenario(tData.active_scenario);
        } else {
          if (isMounted) setIsConnected(false);
        }
      } catch (err) {
        if (isMounted) setIsConnected(false);
      }
    };

    fetchStatus();
    const pollInterval = setInterval(fetchStatus, 2500);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [status]);

  // Handle deliberate "Run incident" command
  const handleTriggerScenario = async (scenarioId: string) => {
    setIsLoading(true);
    const start = Date.now();
    setStartTime(start);
    setStatus("INVESTIGATING");
    setActiveScenario(scenarioId);
    setSteps([]);
    setLatestReceipt(null);

    try {
      // 1. Trigger the real failure scenario on FastAPI backend
      await fetch(`${API_BASE}/api/telemetry/inject-scenario?scenario=${scenarioId}`, {
        method: "POST",
      });

      // 2. Connect to real Server-Sent Events stream from Gemini ReAct loop
      const eventSource = new EventSource(`${API_BASE}/api/incident/stream`);
      let stepCounter = 1;

      eventSource.addEventListener("agent_step", (e: MessageEvent) => {
        try {
          const rawData = JSON.parse(e.data);

          const formattedStep: AgentEventStep = {
            step: stepCounter++,
            type: rawData.type,
            title: rawData.title,
            content: rawData.content || rawData.summary,
            tool: rawData.tool,
            args: rawData.args,
            summary: rawData.summary,
            hypothesis: rawData.hypothesis,
            action: rawData.action,
            latency_ms: 14,
            timestamp: rawData.timestamp || Date.now(),
          };

          setSteps((prev) => [...prev, formattedStep]);

          // When atomic failover executes: update encoder and restore metrics
          if (rawData.type === "FAILOVER_EXECUTED") {
            setPrimaryEncoder("transcoder-pod-us-east-02");
            setStandbyEncoder("transcoder-pod-us-east-01");
            setFps(59.94);
            setBitrate(12.50);
            setPacketLoss(0.00);
            setPtsDrift(3.5);
          }

          // When proof receipt is issued: seal recovery
          if (rawData.type === "MITIGATION_RECEIPT" && rawData.receipt) {
            setLatestReceipt(rawData.receipt);
            setStatus("RECOVERED");
            const duration = ((Date.now() - start) / 1000).toFixed(1);
            setElapsedDuration(`${duration}s`);
            eventSource.close();
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Error parsing SSE event", err);
        }
      });

      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
      };
    } catch (err) {
      console.error("Error executing incident investigation", err);
      setIsLoading(false);
    }
  };

  // Handle "Reset stream" to return to nominal baseline
  const handleReset = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/api/telemetry/reset`, { method: "POST" });
      setStatus("NOMINAL");
      setActiveScenario(null);
      setPrimaryEncoder("transcoder-pod-us-east-01");
      setStandbyEncoder("transcoder-pod-us-east-02");
      setFps(59.94);
      setBitrate(12.48);
      setPacketLoss(0.00);
      setPtsDrift(4.0);
      setSteps([]);
      setLatestReceipt(null);
      setReceiptModalOpen(false);
      setStartTime(null);
      setElapsedDuration(null);
      setIsLoading(false);
    } catch (err) {
      console.error("Error resetting telemetry", err);
      setIsLoading(false);
    }
  };

  const isDemoMode = healthData ? healthData.demo_mode : true;

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#FF4D3D]/30 selection:text-white">
      {/* Universal Top Broadcast Bar */}
      <Navigation
        status={status}
        onTriggerScenario={handleTriggerScenario}
        onReset={handleReset}
        isLoading={isLoading}
        isConnected={isConnected}
        timecode={timecode}
        isDemoMode={isDemoMode}
      />

      {/* Main Control Room: 65% Left / 35% Right Desktop Composition */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (65% width / 8 cols): Hero Live Program Feed & Event Ledger */}
        <section className="lg:col-span-8 flex flex-col space-y-4">
          <LiveMonitor
            status={status}
            fps={fps}
            packetLoss={packetLoss}
            ptsDrift={ptsDrift}
            primaryEncoder={primaryEncoder}
            isInvestigating={status === "INVESTIGATING"}
            isConnected={isConnected}
            activeScenario={activeScenario}
          />
          <EventLedger
            timecode={timecode}
            status={status}
            steps={steps}
            primaryEncoder={primaryEncoder}
            activeScenario={activeScenario}
          />
        </section>

        {/* RIGHT COLUMN (35% width / 4 cols): One Coherent Operational Rail */}
        <section className="lg:col-span-4 flex flex-col">
          <OperationalRail
            status={status}
            activeScenario={activeScenario}
            primaryEncoder={primaryEncoder}
            standbyEncoder={standbyEncoder}
            fps={fps}
            bitrate={bitrate}
            packetLoss={packetLoss}
            ptsDrift={ptsDrift}
            isConnected={isConnected}
            steps={steps}
            latestReceipt={latestReceipt}
            onViewReceipt={() => setReceiptModalOpen(true)}
            elapsedDuration={elapsedDuration}
          />
        </section>
      </main>

      {/* Technical Audit Mitigation Receipt Modal */}
      {receiptModalOpen && latestReceipt && (
        <ReceiptModal
          receipt={latestReceipt}
          onClose={() => setReceiptModalOpen(false)}
        />
      )}
    </div>
  );
}
