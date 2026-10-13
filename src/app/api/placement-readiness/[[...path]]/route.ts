import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("placement-readiness");

export const GET = handler;
export const POST = handler;
