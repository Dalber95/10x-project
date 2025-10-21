// Simple script to validate .env.test configuration
// Run with: node e2e/check-env.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Load .env.test
const result = dotenv.config({ path: path.resolve(rootDir, ".env.test") });

console.log("\n🔍 Checking .env.test configuration...\n");

if (result.error) {
  console.error("❌ Error loading .env.test:", result.error.message);
  process.exit(1);
}

console.log("✅ .env.test file loaded successfully!\n");

// Check what variables are loaded
console.log("📋 Environment variables from .env.test:");
console.log("-------------------------------------------");

// Check for variables with multiple possible names
const varChecks = [
  {
    names: ["TEST_USER_EMAIL", "E2E_USERNAME"],
    label: "User Email",
    required: true,
    sensitive: false,
  },
  {
    names: ["TEST_USER_PASSWORD", "E2E_PASSWORD"],
    label: "User Password",
    required: true,
    sensitive: true,
  },
  {
    names: ["TEST_USER_ID", "E2E_USERNAME_ID"],
    label: "User ID",
    required: false,
    sensitive: false,
  },
  {
    names: ["PUBLIC_SUPABASE_URL", "SUPABASE_URL"],
    label: "Supabase URL",
    required: false,
    sensitive: false,
  },
  {
    names: ["PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_KEY"],
    label: "Supabase Key",
    required: false,
    sensitive: true,
  },
  {
    names: ["BASE_URL"],
    label: "Base URL",
    required: false,
    sensitive: false,
  },
  {
    names: ["OPENROUTER_API_KEY"],
    label: "OpenRouter API",
    required: false,
    sensitive: true,
  },
];

let allRequiredSet = true;

varChecks.forEach(({ names, label, required, sensitive }) => {
  const foundVar = names.find((name) => process.env[name]);
  const value = foundVar ? process.env[foundVar] : null;

  if (value) {
    if (sensitive) {
      console.log(`✅ ${label} (${foundVar}): ${"*".repeat(Math.min(value.length, 20))}`);
    } else {
      const displayValue = value.substring(0, 50) + (value.length > 50 ? "..." : "");
      console.log(`✅ ${label} (${foundVar}): ${displayValue}`);
    }
  } else {
    const status = required ? "❌" : "⚠️ ";
    console.log(`${status} ${label} (${names.join(" or ")}): NOT SET`);
    if (required) {
      allRequiredSet = false;
    }
  }
});

console.log("\n-------------------------------------------");

if (allRequiredSet) {
  console.log("✅ All required variables are set!");
  console.log("✅ Tests will use credentials from .env.test");
} else {
  console.log("❌ Required variables are missing!");
  console.log("❌ Tests cannot run without valid credentials");
}

console.log("\n💡 TestConfig will provide these values to tests");
console.log("💡 Run: npm run test:e2e to execute tests\n");
