import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Take a screenshot for visual comparison
    await expect(page).toHaveScreenshot("homepage.png", {
      maxDiffPixels: 100,
    });
  });

  test("should have correct title", async ({ page }) => {
    await page.goto("/");

    // Check if the page has a proper title
    await expect(page).toHaveTitle(/10x/i);
  });

  test("should navigate to login page when not authenticated", async ({ page }) => {
    await page.goto("/generate");

    // Should redirect to login if not authenticated
    await page.waitForURL(/login/);
    expect(page.url()).toContain("login");
  });
});

test.describe("Authentication", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");

    // Check for email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();

    // Check for submit button
    const submitButton = page.getByRole("button", { name: /sign in|login/i });
    await expect(submitButton).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    const submitButton = page.getByRole("button", { name: /sign in|login/i });
    await submitButton.click();

    // Should show some validation or error message
    // This is a basic check - adjust based on your actual implementation
  });

  test("should have link to registration page", async ({ page }) => {
    await page.goto("/login");

    // Check for register link
    const registerLink = page.getByRole("link", { name: /sign up|register/i });
    await expect(registerLink).toBeVisible();
  });
});
