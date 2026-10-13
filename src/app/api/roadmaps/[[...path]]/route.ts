import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("roadmaps");

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
