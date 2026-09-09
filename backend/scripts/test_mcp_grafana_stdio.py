import os
import sys
import asyncio
from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

load_dotenv()

GRAFANA_URL = os.getenv("GRAFANA_URL")
GRAFANA_SA_TOKEN = os.getenv("GRAFANA_SA_TOKEN")

async def main():
    print("=" * 65)
    print(" TESTING OFFICIAL GRAFANA MCP SERVER (mcp-grafana.exe)")
    print("=" * 65)

    if not GRAFANA_URL or not GRAFANA_SA_TOKEN or GRAFANA_SA_TOKEN == "glsa_your_service_account_token_here":
        print("\n[PREREQUISITE CHECK]")
        print("  GRAFANA_URL: %s" % (GRAFANA_URL or "NOT SET"))
        print("  GRAFANA_SA_TOKEN: %s" % ("SET" if GRAFANA_SA_TOKEN and not GRAFANA_SA_TOKEN.startswith("glsa_your") else "NOT SET"))
        print("\nTo test with live Grafana Cloud, configure backend/.env:")
        print("  GRAFANA_URL=https://<your-stack>.grafana.net")
        print("  GRAFANA_SA_TOKEN=glsa_...")
        print("\nVerifying binary launch only (without auth)...")

    bin_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bin", "mcp-grafana.exe"))
    print("Binary path: %s" % bin_path)

    env = os.environ.copy()
    if GRAFANA_URL:
        env["GRAFANA_URL"] = GRAFANA_URL
    if GRAFANA_SA_TOKEN:
        env["GRAFANA_SERVICE_ACCOUNT_TOKEN"] = GRAFANA_SA_TOKEN

    server_params = StdioServerParameters(
        command=bin_path,
        args=[],
        env=env
    )

    print("\nSpawning mcp-grafana stdio session...")
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                print("Session initialized successfully!")
                
                tools_result = await session.list_tools()
                tools = tools_result.tools
                print("\n[SUCCESS] Retrieved %d official Grafana MCP tools:" % len(tools))
                for t in tools[:10]:
                    print("  * %s: %s" % (t.name, t.description[:60] if t.description else ""))
                if len(tools) > 10:
                    print("  ... and %d more tools." % (len(tools) - 10))
    except Exception as e:
        print("\n[EXECUTION ERROR]: %s" % str(e))

    print("\n" + "=" * 65)

if __name__ == "__main__":
    asyncio.run(main())
