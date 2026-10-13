import { NextResponse } from "next/server";
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

type UserEventData = {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  image_url?: string | null;
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
};

async function verifyAndParse(
  request: Request
): Promise<{ type: string; data: UserEventData }> {
  if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET not configured on server");
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  const svixHeaders: WebhookRequiredHeaders = {
    "svix-id": headers["svix-id"],
    "svix-timestamp": headers["svix-timestamp"],
    "svix-signature": headers["svix-signature"],
  };

  const wh = new Webhook(webhookSecret);
  return wh.verify(payload, svixHeaders) as unknown as {
    type: string;
    data: UserEventData;
  };
}

export async function POST(request: Request) {
  try {
    const evt = await verifyAndParse(request);
    const { data, type } = evt;

    const primaryEmail =
      data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id
      )?.email_address ??
      data.email_addresses[0]?.email_address ??
      "unknown@example.com";

    const isDemoUser = false;

    if (type === "user.created" || type === "user.updated") {
      await prisma.user.upsert({
        where: { clerkUserId: data.id },
        create: {
          clerkUserId: data.id,
          email: primaryEmail,
          fullName: data.full_name ?? undefined,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          imageUrl: data.image_url ?? undefined,
          isDemoUser,
        },
        update: {
          email: primaryEmail,
          fullName: data.full_name ?? undefined,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          imageUrl: data.image_url ?? undefined,
          isDemoUser,
        },
      });
    } else if (type === "user.deleted") {
      await prisma.user.deleteMany({ where: { clerkUserId: data.id } });
    }

    return NextResponse.json({ success: true, handled: type });
  } catch (err) {
    console.error("[webhooks/clerk] error:", err);
    return NextResponse.json(
      { error: "Webhook verification or handling failed" },
      { status: 400 }
    );
  }
}
