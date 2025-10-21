/**
 * Standalone script to clean up test data
 * Run with: npx tsx e2e/cleanup-test-data.ts
 *
 * This script allows you to manually clean test data without running tests
 */

// IMPORTANT: Load .env.test BEFORE importing TestConfig
import dotenv from "dotenv";
import { resolve } from "path";

const result = dotenv.config({ path: resolve(process.cwd(), ".env.test"), override: true });

if (result.error) {
  console.error("Error loading .env.test:", result.error);
  process.exit(1);
}

// Now import helpers (they will use already loaded env vars)
import { cleanupTestUser, cleanupRecentTestData, getTestDataCount } from "./helpers/test-teardown.js";

async function main() {
  console.log("\n🧹 Test Data Cleanup Tool\n");
  console.log("=".repeat(50));

  // Get user ID directly from process.env (loaded by dotenv above)
  const userId = process.env.TEST_USER_ID || process.env.E2E_USERNAME_ID || "";
  const email = process.env.TEST_USER_EMAIL || process.env.E2E_USERNAME || "unknown";

  if (!userId) {
    console.error("❌ Error: TEST_USER_ID or E2E_USERNAME_ID not set in .env.test");
    console.log("\nPlease add your test user ID to .env.test:");
    console.log("  E2E_USERNAME_ID=your-user-id-here\n");
    process.exit(1);
  }

  console.log(`📋 User ID: ${userId}`);
  console.log(`📧 Email: ${email}\n`);

  // Check current data count
  console.log("📊 Current test data count:");
  const beforeCount = await getTestDataCount(userId);
  console.log(`   - Flashcards: ${beforeCount.flashcards}`);
  console.log(`   - Generations: ${beforeCount.generations}`);
  console.log(`   - Error Logs: ${beforeCount.errorLogs}\n`);

  if (beforeCount.flashcards === 0 && beforeCount.generations === 0) {
    console.log("✨ No test data to clean up!\n");
    return;
  }

  // Get cleanup mode from command line args
  const mode = process.argv[2] || "all";

  switch (mode) {
    case "recent": {
      const minutes = parseInt(process.argv[3] || "30");
      console.log(`🕐 Cleaning up data from last ${minutes} minutes...`);
      await cleanupRecentTestData(userId, minutes);
      break;
    }

    case "all":
    default:
      console.log("🗑️  Cleaning up ALL test data...");
      await cleanupTestUser(userId);
      break;
  }

  // Check data count after cleanup
  const afterCount = await getTestDataCount(userId);
  console.log("📊 Remaining test data:");
  console.log(`   - Flashcards: ${afterCount.flashcards}`);
  console.log(`   - Generations: ${afterCount.generations}`);
  console.log(`   - Error Logs: ${afterCount.errorLogs}\n`);

  console.log("✅ Cleanup completed successfully!\n");
}

main().catch((error) => {
  console.error("\n❌ Cleanup failed:", error.message);
  process.exit(1);
});
