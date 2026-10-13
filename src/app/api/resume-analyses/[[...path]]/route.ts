import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("resume-analyses");

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
