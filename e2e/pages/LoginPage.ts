import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Login Page
 * Following Playwright best practices for maintainable E2E tests
 * Uses data-test-id attributes for stable element selection
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    // Using accessible selectors - more reliable with Astro + React hydration
    this.emailInput = page.getByRole('textbox', { name: /adres email/i });
    this.passwordInput = page.getByRole('textbox', { name: /hasło/i }); // Playwright sees password as textbox with label
    this.submitButton = page.getByRole('button', { name: /zaloguj się/i });
    // Navigation links
    this.registerLink = page.getByRole('link', { name: /zarejestruj/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /zapomniałeś hasła/i });
    this.errorAlert = page.getByRole('alert');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    // Wait for form to be ready
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill in email field
   */
  async fillEmail(email: string) {
    await this.emailInput.click();
    await this.emailInput.clear();
    // Use pressSequentially for reliable React onChange triggering
    await this.emailInput.pressSequentially(email, { delay: 50 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill in password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.click();
    await this.passwordInput.clear();
    // Use pressSequentially for reliable React onChange triggering
    await this.passwordInput.pressSequentially(password, { delay: 50 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Click submit button
   */
  async clickSubmit() {
    // Playwright auto-waits for actionability (visible, stable, enabled)
    await this.submitButton.click({ timeout: 10000 });
  }

  /**
   * Perform complete login flow
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    // Wait for React to validate form and enable submit button
    await this.page.waitForTimeout(1000); // Extra time for React state update and validation
    await this.clickSubmit();
  }

  /**
   * Navigate to register page
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Check if login button is enabled
   */
  async isSubmitEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  /**
   * Check if error is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorAlert.textContent() || '';
  }

  /**
   * Wait for successful login (redirect to /generate)
   */
  async waitForSuccessfulLogin() {
    await this.page.waitForURL('/generate');
  }
}

