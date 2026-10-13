import { currentUser } from "@clerk/nextjs/server";

export const DEMO_METADATA_KEY = "isDemoUser";

export interface AuthContext {
  userId: string | null;
  isAuthenticated: boolean;
  isDemoUser: boolean;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
}

export async function getAuthContext(): Promise<AuthContext> {
  const user = await currentUser();

  if (!user) {
    return {
      userId: null,
      isAuthenticated: false,
      isDemoUser: false,
      email: null,
      firstName: null,
      lastName: null,
      fullName: null,
      imageUrl: null,
    };
  }

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  const isDemoUser = Boolean(
    user.privateMetadata?.[DEMO_METADATA_KEY] ||
      user.publicMetadata?.[DEMO_METADATA_KEY] ||
      primaryEmail === process.env.DEMO_USER_EMAIL
  );

  return {
    userId: user.id,
    isAuthenticated: true,
    isDemoUser,
    email: primaryEmail ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: (user.fullName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()) || null,
    imageUrl: user.imageUrl,
  };
}

export function getInitials(name: string | null): string {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isDemoEnabled(): boolean {
  return process.env.DEMO_ACCESS_ENABLED !== "false";
}
