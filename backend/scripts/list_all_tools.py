import os
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    bin_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bin", "mcp-grafana.exe"))
    server_params = StdioServerParameters(command=bin_path, args=[], env=os.environ.copy())
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools_resp = await session.list_tools()
            for t in tools_resp.tools:
                print(f"{t.name}: {t.description}")

if __name__ == "__main__":
    asyncio.run(main())
