import pytest
from app.receipts.proof_engine import ProofEngine

def test_receipt_generation_and_verification():
    engine = ProofEngine(secret_key="test-secret-key-123")
    
    pre = {"fps": 31.2, "dropped_frames_pct": 14.8, "pts_drift_ms": 842.0, "status": "DEGRADED"}
    post = {"fps": 59.94, "dropped_frames_pct": 0.0, "pts_drift_ms": 3.5, "status": "NOMINAL"}
    
    receipt = engine.generate_receipt(
        incident_name="TestIncident",
        affected_stream="4k_main",
        failed_pod="pod-1",
        standby_pod="pod-2",
        root_cause="Hardware memory buffer overflow",
        action_taken="Failover to pod-2",
        pre_metrics=pre,
        post_metrics=post,
        grafana_annotation_url="https://grafana.net/d/test",
        telemetry_raw="sample-raw-telemetry-string"
    )
    
    # Assert valid SHA-256 and signature
    assert len(receipt.telemetry_sha256) == 64
    assert len(receipt.signature) == 64
    assert receipt.pre_metrics.fps == 31.2
    assert receipt.post_metrics.fps == 59.94

    # Verify signature
    receipt_dict = receipt.model_dump()
    assert engine.verify_receipt(receipt_dict) is True

    # Tamper test
    tampered_dict = receipt_dict.copy()
    tampered_dict["root_cause"] = "Fake tampered root cause"
    assert engine.verify_receipt(tampered_dict) is False
