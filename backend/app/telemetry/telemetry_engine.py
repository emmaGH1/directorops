import time
from typing import Dict, Any, Optional, List

class BroadcastTelemetryEngine:
    """
    Simulates a broadcast infrastructure pipeline:
    Camera SDI Ingest -> Transcoder Pods (Primary/Standby) -> Origin Packager -> CDN Edge.
    Supports 3 distinct broadcast incident failure scenarios.
    """
    def __init__(self):
        self.status = "NOMINAL"
        self.stream_id = "4k_main_live"
        self.active_scenario: Optional[str] = None
        
        # Primary & Standby Topology
        self.primary_encoder = "transcoder-pod-us-east-01"
        self.standby_encoder = "transcoder-pod-us-east-02"
        self.origin_server = "origin-packager-01"
        self.cdn_edge = "edge-ingress-na-east"
        
        # Live Telemetry Readings
        self.fps = 59.94
        self.bitrate_mbps = 12.48
        self.packet_loss_pct = 0.00
        self.pts_drift_ms = 4.0
        self.gpu_utilization_pct = 42.0
        self.origin_latency_ms = 18.5
        self.genlock_jitter_us = 1.2
        
        self.active_alert: Optional[Dict[str, Any]] = None
        self.last_incident_time: Optional[float] = None

    def get_state(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "stream_id": self.stream_id,
            "active_scenario": self.active_scenario,
            "fps": round(self.fps, 2),
            "bitrate_mbps": round(self.bitrate_mbps, 2),
            "packet_loss_pct": round(self.packet_loss_pct, 2),
            "pts_drift_ms": round(self.pts_drift_ms, 1),
            "gpu_utilization_pct": round(self.gpu_utilization_pct, 1),
            "origin_latency_ms": round(self.origin_latency_ms, 1),
            "genlock_jitter_us": round(self.genlock_jitter_us, 1),
            "primary_encoder": self.primary_encoder,
            "standby_encoder": self.standby_encoder,
            "primary_pod": self.primary_encoder,
            "backup_pod": self.standby_encoder,
            "origin_server": self.origin_server,
            "cdn_edge": self.cdn_edge,
            "active_alert": self.active_alert,
            "timestamp": time.time()
        }

    def get_topology(self) -> Dict[str, Any]:
        """Returns the signal routing topology for the UI node graph."""
        return {
            "nodes": [
                {"id": "cam_a", "label": "CAM A (Main 4K Rig)", "type": "source", "status": "NOMINAL"},
                {"id": "enc_01", "label": "ENC 01 (Primary US-East)", "type": "encoder", "status": "FAULT" if self.status == "DEGRADED" and self.active_scenario == "nvenc_buffer_overflow" else "NOMINAL" if self.primary_encoder == "transcoder-pod-us-east-01" else "STANDBY"},
                {"id": "enc_02", "label": "ENC 02 (Standby US-East)", "type": "encoder", "status": "ACTIVE" if self.primary_encoder == "transcoder-pod-us-east-02" else "STANDBY"},
                {"id": "origin", "label": "ORIGIN (HLS/DASH)", "type": "packager", "status": "FAULT" if self.status == "DEGRADED" and self.active_scenario == "cdn_edge_502" else "NOMINAL"},
                {"id": "cdn", "label": "CDN (Edge Ingress)", "type": "distribution", "status": "FAULT" if self.status == "DEGRADED" and self.active_scenario == "cdn_edge_502" else "NOMINAL"}
            ],
            "active_path": ["cam_a", self.primary_encoder.split("-")[-1], "origin", "cdn"],
            "standby_path": ["cam_a", self.standby_encoder.split("-")[-1], "origin", "cdn"],
            "active_encoder": self.primary_encoder
        }

    def inject_anomaly(self, anomaly_type: str = "nvenc_buffer_overflow") -> Dict[str, Any]:
        """Backwards compatibility alias for inject_scenario."""
        return self.inject_scenario(anomaly_type)

    def inject_scenario(self, scenario_id: str = "nvenc_buffer_overflow") -> Dict[str, Any]:
        """
        Injects one of 3 realistic broadcast failure scenarios:
        1. nvenc_buffer_overflow: GPU memory leak, PTS drift +842ms, 14.8% packet drop.
        2. cdn_edge_502: Origin packager gateway timeout, latency >2500ms, HTTP 502 cascade.
        3. genlock_clock_drift: PTP clock jitter 48us, frame mismatch on virtual production wall.
        """
        self.status = "DEGRADED"
        self.active_scenario = scenario_id
        self.last_incident_time = time.time()
        
        if scenario_id == "nvenc_buffer_overflow":
            self.fps = 31.20
            self.bitrate_mbps = 8.15
            self.packet_loss_pct = 14.80
            self.pts_drift_ms = 842.0
            self.gpu_utilization_pct = 98.6
            self.active_alert = {
                "alertname": "BroadcastTranscoderPTSDesync",
                "severity": "critical",
                "affected_node": self.primary_encoder,
                "summary": "Audio/Video PTS drift (+842ms) and 14.8% packet drop on primary 4K transcode pod",
                "startsAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
        elif scenario_id == "cdn_edge_502":
            self.fps = 48.00
            self.bitrate_mbps = 4.20
            self.packet_loss_pct = 22.40
            self.origin_latency_ms = 2840.0
            self.active_alert = {
                "alertname": "CDNEdgeOriginGatewayTimeout502",
                "severity": "critical",
                "affected_node": self.origin_server,
                "summary": "HTTP 502 Bad Gateway cascade on edge ingress; origin response latency > 2.8s",
                "startsAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
        elif scenario_id == "genlock_clock_drift":
            self.fps = 54.10
            self.genlock_jitter_us = 48.5
            self.pts_drift_ms = 124.0
            self.active_alert = {
                "alertname": "GenlockPTPPrecisionClockDrift",
                "severity": "high",
                "affected_node": "ptp-grandmaster-01",
                "summary": "SMPTE ST 2059-2 PTP reference jitter exceeded 45μs; virtual production LED interlace mismatch",
                "startsAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }

        return self.get_state()

    def execute_failover(self, subsystem: str = "video_ingest", target: Optional[str] = None) -> Dict[str, Any]:
        """Switches signal routing to standby component and stabilizes broadcast SLA."""
        if subsystem == "video_ingest":
            temp = self.primary_encoder
            self.primary_encoder = target or self.standby_encoder
            self.standby_encoder = temp
        elif subsystem == "cdn_route":
            self.origin_server = "origin-shield-cache-02"
        elif subsystem == "genlock":
            self.genlock_jitter_us = 1.1

        self.status = "NOMINAL"
        self.fps = 59.94
        self.bitrate_mbps = 12.50
        self.packet_loss_pct = 0.00
        self.pts_drift_ms = 3.5
        self.gpu_utilization_pct = 38.4
        self.origin_latency_ms = 16.2
        self.active_alert = None
        return self.get_state()

    def reset_nominal(self) -> Dict[str, Any]:
        """Resets the entire broadcast chain to default nominal 4K 59.94 FPS."""
        self.status = "NOMINAL"
        self.active_scenario = None
        self.primary_encoder = "transcoder-pod-us-east-01"
        self.standby_encoder = "transcoder-pod-us-east-02"
        self.origin_server = "origin-packager-01"
        self.cdn_edge = "edge-ingress-na-east"
        self.fps = 59.94
        self.bitrate_mbps = 12.48
        self.packet_loss_pct = 0.00
        self.pts_drift_ms = 4.0
        self.gpu_utilization_pct = 42.0
        self.origin_latency_ms = 18.5
        self.genlock_jitter_us = 1.2
        self.active_alert = None
        return self.get_state()

telemetry_engine = BroadcastTelemetryEngine()
