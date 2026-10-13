import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("github");

export const GET = handler;
export const POST = handler;
