"use client";

import React, { useState } from "react";
import { Check, Copy, Download, X, ShieldCheck, CheckCircle2 } from "lucide-react";

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
    a.download = `mitigation-receipt-${receipt.receipt_id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-sans animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-md border border-zinc-700 bg-[#101014] shadow-2xl overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Document Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#16161b] border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Technical Audit Mitigation Receipt
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono">
                SMPTE ST 2110 Stream Incident Record • HMAC-SHA256 Signed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Document Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded bg-[#09090b] border border-zinc-800 text-[11px]">
            <div>
              <span className="text-zinc-500 block text-[10px]">Receipt ID</span>
              <span className="font-mono text-zinc-200 font-semibold break-all">
                {receipt.receipt_id?.slice(0, 16)}...
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Timestamp (UTC)</span>
              <span className="font-mono text-zinc-200">{receipt.timestamp}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Channel</span>
              <span className="font-mono text-zinc-200">{receipt.affected_stream || "4k_main_live"}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Integrity</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>HMAC Verified</span>
              </span>
            </div>
          </div>

          {/* 1. Action Taken */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              1. Autonomous Action Taken
            </span>
            <div className="p-2.5 rounded bg-[#16161b] border border-zinc-800 text-zinc-200 font-medium leading-relaxed">
              {receipt.action_taken}
            </div>
          </div>

          {/* 2. Diagnosed Root Cause */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              2. Diagnosed Root Cause
            </span>
            <div className="p-2.5 rounded bg-[#16161b] border border-zinc-800 text-zinc-300 leading-relaxed">
              {receipt.root_cause}
            </div>
          </div>

          {/* 3. Observed Evidence & Recovery Delta Table */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              3. Telemetry Verification Delta
            </span>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2 rounded bg-[#09090b] border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Frame Rate</span>
                <div className="mt-0.5 font-mono">
                  <span className="text-red-400 line-through mr-2">{receipt.pre_metrics?.fps}</span>
                  <span className="text-emerald-400 font-bold">{receipt.post_metrics?.fps} FPS</span>
                </div>
              </div>
              <div className="p-2 rounded bg-[#09090b] border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Packet Loss</span>
                <div className="mt-0.5 font-mono">
                  <span className="text-red-400 line-through mr-2">{receipt.pre_metrics?.dropped_frames_pct}%</span>
                  <span className="text-emerald-400 font-bold">{receipt.post_metrics?.dropped_frames_pct}%</span>
                </div>
              </div>
              <div className="p-2 rounded bg-[#09090b] border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">PTS A/V Drift</span>
                <div className="mt-0.5 font-mono">
                  <span className="text-red-400 line-through mr-2">+{receipt.pre_metrics?.pts_drift_ms}ms</span>
                  <span className="text-emerald-400 font-bold">+{receipt.post_metrics?.pts_drift_ms}ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cryptographic Proof & Small Supporting Artifact */}
          <div className="space-y-2 p-3 rounded bg-[#09090b] border border-zinc-800 font-mono text-[11px]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div>
                  <span className="text-zinc-500 text-[10px] block">SHA-256 Telemetry Digest</span>
                  <code className="text-zinc-300 break-all">{receipt.telemetry_sha256}</code>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">HMAC-SHA256 Signature Seal</span>
                  <code className="text-emerald-400 break-all">{receipt.signature}</code>
                </div>
              </div>
              {/* Supporting small artifact only */}
              <div className="w-12 h-12 rounded border border-zinc-700 overflow-hidden flex-shrink-0 bg-black">
                <img
                  src="/assets/hmac_seal.jpg"
                  alt="HMAC Seal"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#16161b] border-t border-zinc-800">
          <span className="text-zinc-500 text-[10px]">
            Tamper-evident audit document
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition font-medium"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied" : "Copy JSON"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-200 hover:bg-white text-zinc-900 transition font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
