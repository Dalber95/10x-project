import { test, expect } from "@playwright/test";
import { TestConfig, validateTestConfig } from "./helpers/test-config";

/**
 * Configuration Validation Test
 * Verifies that .env.test is properly loaded and TestConfig is working
 */

test.describe("Configuration Validation", () => {
  test("should load environment variables from .env.test", async () => {
    // Print configuration for debugging
    console.log("📋 TestConfig loaded:");
    console.log("   Email:", TestConfig.user.email);
    console.log("   Password:", TestConfig.user.password ? "***" : "NOT SET");
    console.log("   Base URL:", TestConfig.urls.base);
    console.log("   Supabase URL:", TestConfig.supabase.url || "NOT SET");

    // Validate that config is not using defaults
    expect(TestConfig.user.email).toBeTruthy();
    expect(TestConfig.user.password).toBeTruthy();

    // Check if using default values (which means .env.test might not be set up)
    if (TestConfig.user.email.includes("example.com")) {
      console.warn("⚠️  WARNING: Using default email (test@example.com)");
      console.warn("   This suggests .env.test might not be properly configured");
    }

    // Run validation
    validateTestConfig();
  });

  test("should have valid TestConfig structure", async () => {
    expect(TestConfig).toBeDefined();
    expect(TestConfig.user).toBeDefined();
    expect(TestConfig.urls).toBeDefined();
    expect(TestConfig.supabase).toBeDefined();
    expect(TestConfig.timeouts).toBeDefined();

    // Check timeouts are reasonable
    expect(TestConfig.timeouts.default).toBeGreaterThan(0);
    expect(TestConfig.timeouts.generation).toBeGreaterThan(TestConfig.timeouts.default);
  });

  test("should have required environment variables", async () => {
    // At minimum, we need user credentials
    expect(TestConfig.user.email).not.toBe("");
    expect(TestConfig.user.password).not.toBe("");

    // Log what we have
    const hasSupabaseConfig = !!(TestConfig.supabase.url && TestConfig.supabase.anonKey);
    const hasOpenRouterKey = !!TestConfig.openrouter.apiKey;

    console.log("🔑 Environment configuration:");
    console.log("   ✅ User credentials:", "SET");
    console.log(
      "   " + (hasSupabaseConfig ? "✅" : "⚠️ ") + " Supabase config:",
      hasSupabaseConfig ? "SET" : "NOT SET"
    );
    console.log("   " + (hasOpenRouterKey ? "✅" : "⚠️ ") + " OpenRouter API:", hasOpenRouterKey ? "SET" : "NOT SET");
  });
});
