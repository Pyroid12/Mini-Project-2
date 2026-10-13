import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("career-insights");

export const GET = handler;
export const POST = handler;
