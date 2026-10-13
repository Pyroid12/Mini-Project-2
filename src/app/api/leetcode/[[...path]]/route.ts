import { createApiProxy } from "@/lib/server-proxy";

const handler = createApiProxy("leetcode");

export const GET = handler;
export const POST = handler;
