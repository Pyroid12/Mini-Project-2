import { prisma } from "../server/lib/prisma";

async function main() {
  console.log("Testing Supabase connection via Prisma...");
  const count = await prisma.user.count();
  console.log(`Current users in Supabase: ${count}`);

  // Test upsert
  const testUser = await prisma.user.upsert({
    where: { clerkUserId: "user_test_healthcheck" },
    update: { fullName: "Test Supabase User" },
    create: {
      clerkUserId: "user_test_healthcheck",
      email: "test_supabase@careerbuddy.local",
      fullName: "Test Supabase User",
    },
  });
  console.log("Successfully wrote test record to Supabase:", testUser.clerkUserId);

  // Clean up
  await prisma.user.delete({
    where: { clerkUserId: "user_test_healthcheck" },
  });
  console.log("Successfully cleaned up test record!");
  console.log(">>> SUPABASE POSTGRESQL + PRISMA FULLY OPERATIONAL! <<<");
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
