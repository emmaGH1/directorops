import os
import sys
import time
import json
import asyncio
from typing import Dict, Any, List, Optional
from app.config import settings
from app.telemetry.telemetry_engine import telemetry_engine

class GrafanaMCPError(Exception):
    """Raised when an active Grafana Cloud MCP request fails."""
    pass

class GrafanaMCPClient:
    """
    Official Model Context Protocol (MCP) client for Grafana Cloud.
    Route: Option 2 — Official open-source mcp-grafana server with Service Account Token.
    Supports unattended server-side execution via stdio transport.
    Strictly prohibits sending service account tokens to hosted OAuth endpoints.
    """
    def __init__(self, base_url: Optional[str] = None, token: Optional[str] = None):
        self.base_url = (base_url or settings.GRAFANA_URL).rstrip("/")
        self.token = token or settings.GRAFANA_SA_TOKEN
        self.is_live = bool(self.token and not settings.DEMO_MODE)
        self.binary_path = self._resolve_binary_path()

    def _resolve_binary_path(self) -> str:
        candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "bin", "mcp-grafana.exe")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "bin", "mcp-grafana")),
            "mcp-grafana.exe",
            "mcp-grafana"
        ]
        for c in candidates:
            if os.path.exists(c):
                return c
        return "mcp-grafana"

    def _get_server_params(self):
        from mcp import StdioServerParameters
        env = os.environ.copy()
        if self.base_url:
            env["GRAFANA_URL"] = self.base_url
        if self.token:
            env["GRAFANA_SERVICE_ACCOUNT_TOKEN"] = self.token
            env["GRAFANA_SA_TOKEN"] = self.token
        return StdioServerParameters(command=self.binary_path, args=[], env=env)

    async def list_tools(self) -> List[Dict[str, Any]]:
        """MCP tools/list via official mcp-grafana stdio session."""
        if self.is_live:
            from mcp import ClientSession
            from mcp.client.stdio import stdio_client
            try:
                server_params = self._get_server_params()
                async with stdio_client(server_params) as (read, write):
                    async with ClientSession(read, write) as session:
                        await session.initialize()
                        resp = await session.list_tools()
                        return [{"name": t.name, "description": t.description, "inputSchema": t.inputSchema} for t in resp.tools]
            except Exception as e:
                raise GrafanaMCPError(f"Live mcp-grafana stdio tools/list failed: {str(e)}")

        return [
            {"name": "query_prometheus", "description": "Execute instant PromQL query over broadcast cluster metrics"},
            {"name": "query_loki_logs", "description": "Execute LogQL stream search over transcoder and CDN edge logs"},
            {"name": "create_annotation", "description": "Write incident mitigation marker to Grafana Cloud dashboard"},
            {"name": "check_datasources_health", "description": "Check datasource health across Grafana Cloud stack"},
            {"name": "user_info", "description": "Inspect authenticated service account identity in Grafana Cloud"}
        ]

    async def call_tool(self, name: str, arguments: Optional[Dict[str, Any]] = None) -> Any:
        """Invokes a tool on the official mcp-grafana server with strict non-mocking error handling."""
        arguments = arguments or {}
        if not self.is_live:
            raise GrafanaMCPError(f"Cannot execute live tool '{name}' while in DEMO_MODE=True or without token.")

        from mcp import ClientSession
        from mcp.client.stdio import stdio_client
        try:
            server_params = self._get_server_params()
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    res = await session.call_tool(name, arguments)
                    if getattr(res, "isError", False):
                        err_text = " ".join(c.text for c in res.content if hasattr(c, "text"))
                        raise GrafanaMCPError(f"Live mcp-grafana tool '{name}' failed: {err_text}")
                    if hasattr(res, "content") and res.content:
                        first = res.content[0]
                        if hasattr(first, "text"):
                            try:
                                return json.loads(first.text)
                            except Exception:
                                return first.text
                    return res
        except GrafanaMCPError:
            raise
        except Exception as e:
            raise GrafanaMCPError(f"Live mcp-grafana execution error on '{name}': {str(e)}")

    async def query_prometheus(self, query: str, datasource_uid: Optional[str] = None) -> Dict[str, Any]:
        """MCP Tool: query_prometheus"""
        if self.is_live:
            args = {
                "datasourceUid": datasource_uid or "grafanacloud-prom",
                "expr": query,
                "queryType": "instant",
                "endTime": "now"
            }
            res = await self.call_tool("query_prometheus", args)
            return res if isinstance(res, dict) else {"status": "success", "raw": res}

        return self._simulate_promql(query)

    async def query_loki(self, query: str, limit: int = 20, datasource_uid: Optional[str] = None) -> Dict[str, Any]:
        """MCP Tool: query_loki_logs"""
        if self.is_live:
            args = {
                "datasourceUid": datasource_uid or "grafanacloud-logs",
                "logql": query,
                "limit": limit
            }
            res = await self.call_tool("query_loki_logs", args)
            return res if isinstance(res, dict) else {"status": "success", "raw": res}

        return self._simulate_logql(query)

    async def create_annotation(self, text: str, tags: Optional[List[str]] = None) -> Dict[str, Any]:
        """MCP Tool: create_annotation"""
        tags = tags or ["directorops", "gemini-3.8-flash", "incident-mitigated"]
        if self.is_live:
            args = {
                "text": text,
                "tags": tags,
                "time": int(time.time() * 1000)
            }
            res = await self.call_tool("create_annotation", args)
            return res if isinstance(res, dict) else {"status": "success", "raw": res}

        return {
            "status": "success",
            "annotation_id": 104291,
            "url": f"{self.base_url}/d/broadcast-mcr-01?inspect=104291",
            "text": text,
            "tags": tags
        }

    def _simulate_promql(self, query: str) -> Dict[str, Any]:
        now = time.time()
        scenario = telemetry_engine.active_scenario or "nvenc_buffer_overflow"
        
        if scenario == "nvenc_buffer_overflow":
            if "dropped_frames" in query or "drop" in query:
                return {
                    "status": "success",
                    "data": {
                        "resultType": "vector",
                        "result": [
                            {"metric": {"pod": "transcoder-pod-us-east-01", "stream": "4k_main"}, "value": [now, "0.148"]},
                            {"metric": {"pod": "transcoder-pod-us-east-02", "stream": "4k_standby"}, "value": [now, "0.000"]}
                        ]
                    }
                }
            elif "gpu" in query:
                return {
                    "status": "success",
                    "data": {
                        "resultType": "vector",
                        "result": [
                            {"metric": {"pod": "transcoder-pod-us-east-01"}, "value": [now, "0.986"]},
                            {"metric": {"pod": "transcoder-pod-us-east-02"}, "value": [now, "0.384"]}
                        ]
                    }
                }
            elif "pts" in query:
                return {
                    "status": "success",
                    "data": {
                        "resultType": "vector",
                        "result": [
                            {"metric": {"pod": "transcoder-pod-us-east-01"}, "value": [now, "842.0"]}
                        ]
                    }
                }
        elif scenario == "cdn_edge_502":
            if "502" in query or "error" in query:
                return {
                    "status": "success",
                    "data": {
                        "resultType": "vector",
                        "result": [
                            {"metric": {"edge_pop": "iad-01", "origin": "origin-packager-01"}, "value": [now, "0.224"]},
                            {"metric": {"edge_pop": "ord-01", "origin": "origin-packager-01"}, "value": [now, "0.182"]}
                        ]
                    }
                }
            elif "latency" in query:
                return {
                    "status": "success",
                    "data": {
                        "resultType": "vector",
                        "result": [
                            {"metric": {"origin": "origin-packager-01"}, "value": [now, "2840.0"]},
                            {"metric": {"origin": "origin-shield-cache-02"}, "value": [now, "16.2"]}
                        ]
                    }
                }
        elif scenario == "genlock_clock_drift":
            return {
                "status": "success",
                "data": {
                    "resultType": "vector",
                    "result": [
                        {"metric": {"reference": "smpte_st_2059_2", "device": "ptp-grandmaster-01"}, "value": [now, "48.5"]}
                    ]
                }
            }

        return {
            "status": "success",
            "data": {
                "resultType": "vector",
                "result": [{"metric": {"stream": "4k_main"}, "value": [now, "12480000"]}]
            }
        }

    def _simulate_logql(self, query: str) -> Dict[str, Any]:
        now_ns = str(int(time.time() * 1e9))
        scenario = telemetry_engine.active_scenario or "nvenc_buffer_overflow"

        if scenario == "nvenc_buffer_overflow":
            lines = [
                "[error] [libx265 @ 0x7f9a14002800] NVENC hardware ring buffer exhaustion in CUvidDecoder",
                "[error] [mpegts @ 0x7f9a14008100] PTS/DTS discontinuity detected: DTS=1849200 PTS=1857620 drift=842ms",
                "[fatal] [cuda @ 0x7f9a14010a00] Out of memory on NVENC device 0; dropping frame packets 421-490",
                "[warn] [rtp @ 0x7f9a14014200] Downstream edge CDN reports packet loss ratio 14.8% on port 5004"
            ]
        elif scenario == "cdn_edge_502":
            lines = [
                "[error] [nginx-edge @ iad-01] 2026/09/06 07:42:19 [error] 1402#0: *84912 upstream timed out (110: Connection timed out) while connecting to upstream, client: 172.68.22.4",
                "[error] [nginx-edge @ ord-01] 2026/09/06 07:42:20 [error] 1403#0: *84914 HTTP 502 Bad Gateway while reading response header from upstream: origin-packager-01:8080",
                "[warn] [packager @ origin-packager-01] TCP syn backlog queue full; dropped 182 incoming edge requests",
                "[info] [dns @ origin-shield-cache-02] Standby origin shield cache is online and synced (health check 200 OK)"
            ]
        else: # genlock_clock_drift
            lines = [
                "[error] [ptp4l @ ptp-grandmaster-01] master offset 48520 s2 freq +48200 path delay 1240",
                "[warn] [camera-tracking @ rig-cam-a] SMPTE ST 2059-2 frame sync phase error > 1 field duration",
                "[error] [unreal-engine @ stagecraft-01] Genlock frequency mismatch: LED volume display tearing detected on camera frustum",
                "[info] [ptp4l @ ptp-grandmaster-02] Backup PTP grandmaster reference locked to GPS atomic time (jitter 1.1μs)"
            ]

        return {
            "status": "success",
            "data": {
                "resultType": "streams",
                "result": [
                    {
                        "stream": {"app": "broadcast-sre", "scenario": scenario},
                        "values": [[now_ns, line] for line in lines]
                    }
                ]
            }
        }
