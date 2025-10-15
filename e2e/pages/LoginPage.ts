import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Login Page
 * Following Playwright best practices for maintainable E2E tests
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in|login/i });
    this.registerLink = page.getByRole('link', { name: /sign up|register/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async goToRegister() {
    await this.registerLink.click();
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}

