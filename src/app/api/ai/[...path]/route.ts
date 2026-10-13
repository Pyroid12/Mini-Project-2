import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("ai");

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
