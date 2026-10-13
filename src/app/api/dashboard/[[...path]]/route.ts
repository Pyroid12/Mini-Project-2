import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("dashboard");

export const GET = handler;
