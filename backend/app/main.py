import json
import asyncio
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from app.config import settings
from app.telemetry.telemetry_engine import telemetry_engine
from app.agent.mcr_agent import mcr_agent
from app.receipts.proof_engine import ProofEngine

app = FastAPI(
    title="DirectorOps API",
    description="Autonomous Master Control Room (MCR) SRE for Live Cinema Broadcasts",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

proof_engine = ProofEngine()
latest_receipt = None

@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "service": "DirectorOps MCR API",
        "gemini_model": settings.GEMINI_MODEL,
        "demo_mode": settings.DEMO_MODE,
        "grafana_connected": bool(settings.GRAFANA_SA_TOKEN or settings.DEMO_MODE)
    }

@app.get("/api/telemetry/live")
async def get_live_telemetry():
    return telemetry_engine.get_state()

@app.get("/api/topology")
async def get_topology():
    return telemetry_engine.get_topology()

@app.post("/api/telemetry/inject-scenario")
async def inject_scenario(scenario: str = Query("nvenc_buffer_overflow")):
    return telemetry_engine.inject_scenario(scenario)

@app.post("/api/telemetry/reset")
async def reset_telemetry():
    return telemetry_engine.reset_nominal()

@app.get("/api/incident/stream")
async def stream_incident_investigation(request: Request):
    """
    SSE stream of the Gemini ADK agent's live ReAct reasoning, Grafana MCP tool calls,
    automated failover execution, and receipt generation.
    """
    async def event_generator():
        global latest_receipt
        async for step in mcr_agent.investigate_and_resolve():
            if await request.is_disconnected():
                break
            if step.get("type") == "MITIGATION_RECEIPT":
                latest_receipt = step.get("receipt")
            yield {
                "event": "agent_step",
                "data": json.dumps(step)
            }
            await asyncio.sleep(0.04)

    return EventSourceResponse(event_generator())

@app.post("/api/incident/trigger")
async def trigger_incident_investigation():
    """Non-streaming execution of the full investigation loop."""
    global latest_receipt
    steps = []
    async for step in mcr_agent.investigate_and_resolve():
        steps.append(step)
        if step.get("type") == "MITIGATION_RECEIPT":
            latest_receipt = step.get("receipt")
    return {
        "status": "resolved",
        "steps_count": len(steps),
        "receipt": latest_receipt
    }

@app.get("/api/receipt/latest")
async def get_latest_receipt():
    return {"receipt": latest_receipt}

@app.post("/api/receipt/verify")
async def verify_receipt(receipt_data: dict):
    is_valid = proof_engine.verify_receipt(receipt_data)
    return {
        "valid": is_valid,
        "receipt_id": receipt_data.get("receipt_id"),
        "signature": receipt_data.get("signature")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
