import hmac
import hashlib
import json
import time
import uuid
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.config import settings

class MetricsSnapshot(BaseModel):
    fps: float
    dropped_frames_pct: float
    pts_drift_ms: float
    status: str

class MitigationReceipt(BaseModel):
    receipt_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    incident_name: str
    affected_stream: str
    failed_pod: str
    standby_pod: str
    root_cause: str
    action_taken: str
    pre_metrics: MetricsSnapshot
    post_metrics: MetricsSnapshot
    grafana_annotation_url: str
    telemetry_sha256: str
    signature: str = ""

class ProofEngine:
    """
    Cryptographic Proof & Receipt Engine for DirectorOps.
    Issues immutable, tamper-evident Broadcast Incident Mitigation Receipts.
    """
    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = (secret_key or settings.SECRET_KEY).encode("utf-8")

    def generate_receipt(
        self,
        incident_name: str,
        affected_stream: str,
        failed_pod: str,
        standby_pod: str,
        root_cause: str,
        action_taken: str,
        pre_metrics: Dict[str, Any],
        post_metrics: Dict[str, Any],
        grafana_annotation_url: str,
        telemetry_raw: str
    ) -> MitigationReceipt:
        # Calculate SHA-256 of the raw telemetry window and Loki logs
        telemetry_sha256 = hashlib.sha256(telemetry_raw.encode("utf-8")).hexdigest()

        receipt = MitigationReceipt(
            incident_name=incident_name,
            affected_stream=affected_stream,
            failed_pod=failed_pod,
            standby_pod=standby_pod,
            root_cause=root_cause,
            action_taken=action_taken,
            pre_metrics=MetricsSnapshot(**pre_metrics),
            post_metrics=MetricsSnapshot(**post_metrics),
            grafana_annotation_url=grafana_annotation_url,
            telemetry_sha256=telemetry_sha256
        )

        # Generate HMAC-SHA256 signature
        payload_to_sign = json.dumps(receipt.model_dump(exclude={"signature"}), sort_keys=True)
        receipt.signature = hmac.new(self.secret_key, payload_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
        return receipt

    def verify_receipt(self, receipt_dict: Dict[str, Any]) -> bool:
        """Verifies the HMAC signature on an incoming receipt."""
        if "signature" not in receipt_dict:
            return False
        claimed_sig = receipt_dict["signature"]
        payload_data = {k: v for k, v in receipt_dict.items() if k != "signature"}
        payload_to_sign = json.dumps(payload_data, sort_keys=True)
        expected_sig = hmac.new(self.secret_key, payload_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
        return hmac.compare_digest(claimed_sig, expected_sig)
