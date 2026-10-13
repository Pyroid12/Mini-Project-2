import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("linkedin-analyses");

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
