import pytest
from app.telemetry.telemetry_engine import BroadcastTelemetryEngine

def test_telemetry_state_transitions():
    engine = BroadcastTelemetryEngine()
    
    # Check initial nominal state
    state = engine.get_state()
    assert state["status"] == "NOMINAL"
    assert state["fps"] == 59.94
    assert state["packet_loss_pct"] == 0.00
    assert state["active_alert"] is None

    # Inject anomaly
    degraded = engine.inject_anomaly()
    assert degraded["status"] == "DEGRADED"
    assert degraded["fps"] == 31.20
    assert degraded["packet_loss_pct"] == 14.80
    assert degraded["pts_drift_ms"] == 842.0
    assert degraded["active_alert"] is not None

    # Execute failover
    recovered = engine.execute_failover()
    assert recovered["status"] == "NOMINAL"
    assert recovered["fps"] == 59.94
    assert recovered["packet_loss_pct"] == 0.00
    assert recovered["primary_pod"] == "transcoder-pod-us-east-02"
