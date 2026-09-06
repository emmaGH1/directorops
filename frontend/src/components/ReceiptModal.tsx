"use client";

import React, { useState } from "react";
import { CheckCircle2, Copy, Download, ExternalLink, ShieldCheck, X } from "lucide-react";

interface ReceiptModalProps {
  receipt: any;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `directorops-receipt-${receipt.receipt_id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-xl border border-zinc-700 bg-[#121215] shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#18181c] border-b border-zinc-800">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>BROADCAST INCIDENT MITIGATION RECEIPT</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#09090b] border border-zinc-800/80">
            <div>
              <span className="text-zinc-500 text-[10px]">RECEIPT ID</span>
              <p className="text-zinc-200 font-bold">{receipt.receipt_id}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px]">TIMESTAMP (UTC)</span>
              <p className="text-zinc-200 font-bold">{receipt.timestamp}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px]">STREAM CHANNEL</span>
              <p className="text-zinc-200 font-bold">{receipt.affected_stream}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px]">STATUS</span>
              <p className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% RECOVERED (59.94 FPS)</span>
              </p>
            </div>
          </div>

          {/* Root Cause & Remediation */}
          <div className="space-y-2 p-3 rounded-lg bg-[#09090b] border border-zinc-800/80">
            <div>
              <span className="text-red-400 font-bold text-[11px]">DIAGNOSED ROOT CAUSE (VIA LOKI LOGQL):</span>
              <p className="text-zinc-300 text-[11px] mt-0.5">{receipt.root_cause}</p>
            </div>
            <div className="border-t border-zinc-800/80 pt-2">
              <span className="text-emerald-400 font-bold text-[11px]">AUTONOMOUS MITIGATION ACTION:</span>
              <p className="text-zinc-300 text-[11px] mt-0.5">{receipt.action_taken}</p>
            </div>
          </div>

          {/* Metrics Delta Matrix */}
          <div>
            <span className="text-zinc-400 font-bold text-[11px] block mb-2">TELEMETRY RECOVERY DELTA</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">FRAME RATE</span>
                <span className="text-red-400 line-through mr-2">{receipt.pre_metrics.fps}</span>
                <span className="text-emerald-400 font-bold">{receipt.post_metrics.fps} FPS</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">PACKET LOSS</span>
                <span className="text-red-400 line-through mr-2">{receipt.pre_metrics.dropped_frames_pct}%</span>
                <span className="text-emerald-400 font-bold">{receipt.post_metrics.dropped_frames_pct}%</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">PTS A/V DRIFT</span>
                <span className="text-red-400 line-through mr-2">+{receipt.pre_metrics.pts_drift_ms}ms</span>
                <span className="text-emerald-400 font-bold">+{receipt.post_metrics.pts_drift_ms}ms</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Proof Verification Box */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
            <div>
              <span className="text-zinc-500 text-[10px] block">TELEMETRY SHA-256 DIGEST</span>
              <code className="text-[11px] text-cyan-400 break-all">{receipt.telemetry_sha256}</code>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">HMAC-SHA256 SIGNATURE SEAL</span>
              <code className="text-[11px] text-emerald-400 break-all">{receipt.signature}</code>
            </div>
          </div>

          {/* Grafana Cloud Link */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-950/20 border border-orange-800/40">
            <div className="flex items-center space-x-2">
              <span className="text-orange-400 font-bold">Grafana Cloud Dashboard Annotation</span>
            </div>
            <a
              href={receipt.grafana_annotation_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-orange-400 hover:text-orange-300 underline font-bold"
            >
              <span>View Annotation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#18181c] border-t border-zinc-800">
          <span className="text-zinc-500 text-[10px]">VERIFIED TAMPER-EVIDENT PAYLOAD</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition font-bold"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy JSON"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
