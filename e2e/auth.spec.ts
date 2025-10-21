import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Authentication Flow", () => {
  test("should display login page correctly", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify all elements are visible
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test("should navigate to register page from login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToRegister();

    // Verify navigation to register page
    await page.waitForURL(/register/);
    expect(page.url()).toContain("register");
  });

  test("should show password input as password type", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify password input is of type password
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
  });
});

test.describe("Login Form Validation", () => {
  test("should handle empty form submission", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.submitButton.click();

    // Form should still be on login page (not submitted)
    expect(page.url()).toContain("login");
  });

  test("should accept text input in email field", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const testEmail = "test@example.com";
    await loginPage.emailInput.fill(testEmail);

    await expect(loginPage.emailInput).toHaveValue(testEmail);
  });
});
