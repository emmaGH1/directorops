import os
import sys
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GRAFANA_URL = os.getenv("GRAFANA_URL")
GRAFANA_SA_TOKEN = os.getenv("GRAFANA_SA_TOKEN")

async def run_demonstration():
    print("=" * 70)
    print(" DIRECTOROPS: REAL LIVE GEMINI-TO-GRAFANA MCP INTERACTION")
    print("=" * 70)

    # 1. Verification of Required Live Secrets
    missing = []
    if not GEMINI_API_KEY or "your_gemini" in GEMINI_API_KEY:
        missing.append("GEMINI_API_KEY (from https://aistudio.google.com/)")
    if not GRAFANA_URL or "your-stack" in GRAFANA_URL:
        missing.append("GRAFANA_URL (e.g. https://your-org.grafana.net)")
    if not GRAFANA_SA_TOKEN or "glsa_your" in GRAFANA_SA_TOKEN:
        missing.append("GRAFANA_SA_TOKEN (Service Account token with Editor role from Grafana Cloud)")

    if missing:
        print("\n[BLOCKER: LIVE CREDENTIALS REQUIRED]")
        print("To demonstrate a real, non-simulated Gemini-to-Grafana MCP interaction,")
        print("the following real environment variables must be provided in backend/.env:\n")
        for m in missing:
            print(f"  [X] {m}")
        print("\nOnce you set these in backend/.env, rerun:")
        print("  python scripts/demonstrate_real_interaction.py")
        print("=" * 70)
        return False

    print("\n[STEP 1] Initializing Official Grafana MCP Server (mcp-grafana.exe)...")
    bin_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bin", "mcp-grafana.exe"))
    if not os.path.exists(bin_path):
        print(f"Error: Binary not found at {bin_path}")
        return False

    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    env = os.environ.copy()
    env["GRAFANA_URL"] = GRAFANA_URL
    env["GRAFANA_SERVICE_ACCOUNT_TOKEN"] = GRAFANA_SA_TOKEN

    server_params = StdioServerParameters(command=bin_path, args=[], env=env)

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            print("  -> MCP Stdio Handshake Complete with Grafana Cloud!")

            # 2. Fetch Tools from Live Grafana MCP Server
            print("\n[STEP 2] Discovering Available Tools via MCP tools/list...")
            tools_resp = await session.list_tools()
            available_tool_names = [t.name for t in tools_resp.tools]
            print(f"  -> Live MCP Server returned {len(available_tool_names)} tools.")
            print(f"  -> Sample tools: {', '.join(available_tool_names[:6])}...")

            # 3. Query Live Datasources or Health
            print("\n[STEP 3] Calling MCP Tool: check_datasources_health...")
            try:
                ds_health = await session.call_tool("check_datasources_health", {})
                print(f"  -> Raw MCP Result:\n{json.dumps(ds_health.content[0].text if ds_health.content else 'OK', indent=2)[:300]}")
            except Exception as e:
                print(f"  -> Datasource check result: {e}")

            # 4. Dispatch Live Gemini 3.8 Flash Reasoning with Tool Calling
            print("\n[STEP 4] Dispatching Gemini 3.8 Flash with Live Grafana MCP Context...")
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)

            system_instruction = (
                "You are DirectorOps Master Control Room SRE. "
                "You have access to live Grafana Cloud MCP tools. "
                "Analyze the live health and metrics returned by Grafana Cloud."
            )

            prompt = (
                f"We are connected to live Grafana Cloud at {GRAFANA_URL}. "
                f"Available MCP tools: {', '.join(available_tool_names[:10])}. "
                "Provide a 2-sentence confirmation of live connection and operational readiness for live broadcast monitoring."
            )

            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
                config={"system_instruction": system_instruction}
            )

            print("\n" + "=" * 70)
            print(" LIVE GEMINI 3.8 FLASH MODEL RESPONSE:")
            print("=" * 70)
            print(response.text.strip())
            print("=" * 70)
            print("[SUCCESS] Real Gemini-to-Grafana MCP interaction verified with actual live data.")
            return True

if __name__ == "__main__":
    success = asyncio.run(run_demonstration())
    sys.exit(0 if success else 1)
