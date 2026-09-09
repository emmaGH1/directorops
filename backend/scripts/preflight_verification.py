import os
import sys
import json
import asyncio
from dotenv import load_dotenv

# Load backend/.env
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
GRAFANA_URL = os.getenv("GRAFANA_URL")
GRAFANA_SA_TOKEN = os.getenv("GRAFANA_SA_TOKEN")

def mask_token(token: str | None) -> str:
    """Safely mask secrets to guarantee tokens are never printed in logs."""
    if not token or token.strip() == "":
        return "[NOT SET]"
    token = token.strip()
    if len(token) <= 8:
        return "[SET - REDACTED]"
    return f"{token[:4]}...{token[-4:]} ({len(token)} chars)"

async def run_preflight():
    print("=" * 70)
    print(" DIRECTOROPS: OFFICIAL PREFLIGHT VERIFICATION REPORT")
    print(f" Target Model: {GEMINI_MODEL}")
    print(" Route: Option 2 — Official mcp-grafana server via stdio transport")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # STEP 0: Credentials Inspection (Masked)
    # -------------------------------------------------------------------------
    print("\n[STEP 0] Inspecting Authentication Configuration (Tokens Masked):")
    print(f"  • GEMINI_API_KEY: {mask_token(GEMINI_API_KEY)}")
    print(f"  • GEMINI_MODEL:   {GEMINI_MODEL}")
    print(f"  • GRAFANA_URL:    {GRAFANA_URL or '[NOT SET]'}")
    print(f"  • GRAFANA_SA_TOKEN (Service Account): {mask_token(GRAFANA_SA_TOKEN)}")

    missing = []
    if not GEMINI_API_KEY or "your_gemini" in GEMINI_API_KEY:
        missing.append("GEMINI_API_KEY")
    if not GRAFANA_URL or "your-stack" in GRAFANA_URL or "demo.grafana.net" in GRAFANA_URL:
        missing.append("GRAFANA_URL")
    if not GRAFANA_SA_TOKEN or "glsa_your" in GRAFANA_SA_TOKEN:
        missing.append("GRAFANA_SA_TOKEN")

    if missing:
        print("\n" + "!" * 70)
        print(" [PREFLIGHT PAUSED: CREDENTIALS REQUIRED]")
        print(" Missing or placeholder configuration detected in backend/.env:")
        for m in missing:
            print(f"   [X] {m}")
        print("\n Preflight requires live credentials to execute real cloud verifications.")
        print(" (Simulated fallbacks are strictly prohibited per verification policy).")
        print("!" * 70)
        return False

    report = {}

    # -------------------------------------------------------------------------
    # CHECK 1: Gemini Model Returns Real Response
    # -------------------------------------------------------------------------
    print(f"\n[CHECK 1] Testing live model response from {GEMINI_MODEL}...")
    from google import genai
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    resp_text = None
    for attempt in range(1, 4):
        try:
            resp = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents="Broadcast telemetry verification. Respond with 'DIRECTOROPS_ACTIVE' and nothing else."
            )
            resp_text = resp.text.strip()
            print(f"  -> Raw model response: {resp_text}")
            if not resp_text:
                raise ValueError("Model returned an empty response")
            report["check_1_gemini_response"] = "PASS"
            print("  -> [PASS] Gemini model returned a real response.")
            break
        except Exception as e:
            if "503" in str(e) and attempt < 3:
                print(f"  -> Transient 503 spike encountered on attempt {attempt}, retrying in 2s...")
                await asyncio.sleep(2)
                continue
            report["check_1_gemini_response"] = f"FAIL: {str(e)}"
            print(f"  -> [FAIL] Gemini response error: {e}")
            return False

    # -------------------------------------------------------------------------
    # CHECK 2: Gemini Performs a Real Function/Tool Call
    # -------------------------------------------------------------------------
    print(f"\n[CHECK 2] Testing real Gemini function/tool call...")
    try:
        from google.genai import types
        tool_decl = types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="query_prometheus",
                    description="Execute instant PromQL metric query against Grafana Cloud Prometheus.",
                    parameters={
                        "type": "OBJECT",
                        "properties": {
                            "query": {
                                "type": "STRING",
                                "description": "The PromQL metric query"
                            }
                        },
                        "required": ["query"]
                    }
                )
            ]
        )
        tool_config = types.GenerateContentConfig(
            system_instruction="You are DirectorOps MCR SRE. When asked for stream health metrics, always call the query_prometheus tool.",
            temperature=0.0,
            tools=[tool_decl],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
        )
        chat = gemini_client.chats.create(
            model=GEMINI_MODEL,
            config=tool_config
        )
        tool_resp = chat.send_message(
            "What is the current broadcast_dropped_frames_ratio? Query Prometheus immediately."
        )
        if not tool_resp.function_calls:
            raise ValueError("Gemini did not return function_calls payload.")
        call = tool_resp.function_calls[0]
        print(f"  -> Gemini generated tool call: {call.name}({dict(call.args)})")
        assert call.name == "query_prometheus", f"Unexpected tool invoked: {call.name}"
        report["check_2_gemini_tool_call"] = "PASS"
        print("  -> [PASS] Gemini performed a real function/tool call.")
    except Exception as e:
        report["check_2_gemini_tool_call"] = f"FAIL: {str(e)}"
        print(f"  -> [FAIL] Gemini tool call error: {e}")
        return False

    # -------------------------------------------------------------------------
    # CHECK 3 & 4: Official Grafana MCP Server Initialization & Tool List
    # -------------------------------------------------------------------------
    print("\n[CHECK 3 & 4] Initializing official mcp-grafana server over stdio...")
    bin_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bin", "mcp-grafana.exe"))
    if not os.path.exists(bin_path):
        bin_path = "mcp-grafana"

    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    env = os.environ.copy()
    env["GRAFANA_URL"] = GRAFANA_URL.rstrip("/")
    env["GRAFANA_SERVICE_ACCOUNT_TOKEN"] = GRAFANA_SA_TOKEN
    server_params = StdioServerParameters(command=bin_path, args=[], env=env)

    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                report["check_3_mcp_init"] = "PASS"
                print("  -> [PASS] Official mcp-grafana server initialized over stdio.")

                tools_resp = await session.list_tools()
                tool_names = [t.name for t in tools_resp.tools]
                print(f"  -> Discovered {len(tool_names)} official Grafana tools.")
                print(f"  -> Sample tools: {', '.join(tool_names[:6])}")
                if len(tool_names) < 10:
                    raise ValueError(f"Expected >=10 tools, received {len(tool_names)}")
                report["check_4_tool_list"] = "PASS"
                print("  -> [PASS] Grafana returned its real tool list.")

                # -------------------------------------------------------------
                # CHECK 5: One Real Grafana Tool Call Succeeds
                # -------------------------------------------------------------
                print("\n[CHECK 5] Executing real tool call against Grafana Cloud (check_datasources_health)...")
                health_result = await session.call_tool("check_datasources_health", {})
                if getattr(health_result, "isError", False):
                    err_msg = health_result.content[0].text if health_result.content else "Unknown error"
                    raise RuntimeError(f"Grafana Cloud tool execution failed: {err_msg}")

                raw_output = health_result.content[0].text if health_result.content else "OK"
                preview = raw_output[:250].replace("\n", " ")
                print(f"  -> Real Grafana Cloud output: {preview}...")
                report["check_5_tool_call_success"] = "PASS"
                print("  -> [PASS] Real Grafana tool call executed and succeeded.")

                # -------------------------------------------------------------
                # CHECK 6: Failures Remain Failures (Anti-Mock Verification)
                # -------------------------------------------------------------
                print("\n[CHECK 6] Verifying anti-mock policy: ensuring failures remain failures...")
                try:
                    # Intentionally execute an invalid tool call
                    invalid_res = await session.call_tool("nonexistent_broadcast_tool", {"dummy": 123})
                    is_err = getattr(invalid_res, "isError", False)
                    if not is_err:
                        raise AssertionError("Failure test failed: invalid tool call was reported as successful!")
                    print(f"  -> Expected error returned cleanly by mcp-grafana: isError=True")
                    report["check_6_failures_remain_failures"] = "PASS"
                    print("  -> [PASS] Failures remain failures and are never silently mocked.")
                except Exception as e:
                    if "AssertionError" in str(type(e)):
                        raise
                    print(f"  -> Expected exception caught: {e}")
                    report["check_6_failures_remain_failures"] = "PASS"
                    print("  -> [PASS] Failures remain failures and are never silently mocked.")

    except Exception as e:
        print(f"  -> [FAIL] Grafana MCP error: {e}")
        return False

    # -------------------------------------------------------------------------
    # FINAL PREFLIGHT SUMMARY
    # -------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print(" PREFLIGHT VERIFICATION SUMMARY: ALL 6 CHECKS PASSED")
    print("=" * 70)
    for k, v in report.items():
        print(f"  [PASS] {k}: {v}")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = asyncio.run(run_preflight())
    sys.exit(0 if success else 1)
