import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DirectorOps | Autonomous Master Control Room (MCR) SRE",
  description: "Autonomous Master Control Room Incident Commander for Live Broadcast Cinema & Virtual Production with Google Cloud Gemini ADK and Grafana Cloud MCP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-[#fafafa] antialiased min-h-screen selection:bg-studio-red selection:text-white">
        {children}
      </body>
    </html>
  );
}
