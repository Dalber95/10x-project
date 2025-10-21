/**
 * Test Configuration Helper
 * Centralized access to test environment variables
 */

export const TestConfig = {
  /**
   * Test user credentials
   * Supports both TEST_USER_* and E2E_USERNAME/E2E_PASSWORD naming conventions
   */
  user: {
    email: process.env.TEST_USER_EMAIL || process.env.E2E_USERNAME || "test@example.com",
    password: process.env.TEST_USER_PASSWORD || process.env.E2E_PASSWORD || "TestPassword123!",
    id: process.env.TEST_USER_ID || process.env.E2E_USERNAME_ID || "",
  },

  /**
   * Application URLs
   */
  urls: {
    base: process.env.BASE_URL || "http://localhost:4321",
    login: "/login",
    register: "/register",
    generate: "/generate",
    forgotPassword: "/forgot-password",
  },

  /**
   * Supabase configuration (if needed in tests)
   * Supports both PUBLIC_SUPABASE_* and SUPABASE_* naming conventions
   */
  supabase: {
    url: process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    anonKey: process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "",
  },

  /**
   * OpenRouter API (if needed for testing AI features)
   */
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "",
  },

  /**
   * Feature flags
   */
  features: {
    testMode: process.env.ENABLE_TEST_MODE === "true",
  },

  /**
   * Test timeouts (in milliseconds)
   */
  timeouts: {
    default: 30000,
    generation: 60000, // AI generation może trwać dłużej
    navigation: 10000,
  },
};

/**
 * Validate that required environment variables are set
 */
export function validateTestConfig(): void {
  const required = {
    TEST_USER_EMAIL: TestConfig.user.email,
    TEST_USER_PASSWORD: TestConfig.user.password,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(required)) {
    if (!value || value.includes("example.com")) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  Warning: The following test environment variables are not set or using defaults:\n` +
        missing.map((key) => `   - ${key}`).join("\n") +
        `\n\nCreate a .env.test file in the project root with your test credentials.`
    );
  }
}
