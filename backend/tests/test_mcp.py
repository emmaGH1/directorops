import asyncio
from app.mcp.grafana_mcp import GrafanaMCPClient

def test_grafana_mcp_client_tools():
    async def _run():
        client = GrafanaMCPClient()
        
        # Test PromQL tool
        prom_res = await client.query_prometheus("broadcast_dropped_frames_ratio")
        assert prom_res["status"] == "success"
        assert "data" in prom_res
        assert len(prom_res["data"]["result"]) > 0

        # Test LogQL tool
        loki_res = await client.query_loki('{app="ffmpeg-transcoder"} |= "error"')
        assert loki_res["status"] == "success"
        assert "data" in loki_res
        assert len(loki_res["data"]["result"]) > 0

        # Test Annotation tool
        annot_res = await client.create_annotation(
            text="Test incident resolution annotation",
            tags=["directorops", "test"]
        )
        assert annot_res["status"] == "success"
        assert "url" in annot_res

    asyncio.run(_run())
