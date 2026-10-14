import { createApiProxy } from "@/lib/server-proxy";
import { NextRequest, NextResponse } from "next/server";

const proxyHandler = createApiProxy("placement-readiness");

export async function GET(
  req: NextRequest,
  context?: { params?: Promise<{ path?: string[] }> }
) {
  const res = await proxyHandler(req, context);
  const contentType = res.headers.get("content-type") || "";

  if (res.ok && contentType.includes("application/json")) {
    try {
      const data = await res.json();
      if (data?.readiness) {
        const factors = data.readiness.factors;
        const connectedCount = Array.isArray(factors)
          ? factors.filter((f: any) => f.status === "Connected").length
          : data.readiness.breakdown?.connectedPillars ?? 0;

        if (connectedCount === 0) {
          data.readiness.overallScore = 0;
          if (Array.isArray(data.readiness.companyTiers)) {
            data.readiness.companyTiers = data.readiness.companyTiers.map((t: any) => ({
              ...t,
              readiness: 0,
              status: "Needs Practice",
            }));
          }
        }
      }
      return NextResponse.json(data, {
        status: res.status,
        headers: res.headers,
      });
    } catch {
      return res;
    }
  }

  return res;
}

export const POST = proxyHandler;
