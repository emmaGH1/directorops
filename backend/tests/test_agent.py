import asyncio
from app.agent.mcr_agent import MCRAgent
from app.telemetry.telemetry_engine import telemetry_engine

def test_mcr_agent_investigation_sequence():
    async def _run():
        agent = MCRAgent()
        telemetry_engine.inject_anomaly()
        assert telemetry_engine.status == "DEGRADED"

        steps = []
        async for step in agent.investigate_and_resolve():
            steps.append(step)

        # Validate step count and progression
        assert len(steps) >= 8
        step_types = [s["type"] for s in steps]
        assert "ALERT_INGEST" in step_types
        assert "TOOL_CALL" in step_types
        assert "TOOL_RESULT" in step_types
        assert "AGENT_DECISION" in step_types
        assert "FAILOVER_EXECUTED" in step_types
        assert "MITIGATION_RECEIPT" in step_types

        # Validate that stream recovered to nominal
        assert telemetry_engine.status == "NOMINAL"
        assert telemetry_engine.fps == 59.94
        assert telemetry_engine.packet_loss_pct == 0.00

    asyncio.run(_run())
