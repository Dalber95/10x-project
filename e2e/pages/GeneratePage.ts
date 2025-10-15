import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Flashcard Generation Page
 * Following Playwright best practices for maintainable E2E tests
 */
export class GeneratePage {
  readonly page: Page;
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly flashcardsList: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textInput = page.getByRole('textbox', { name: /input|text|content/i });
    this.generateButton = page.getByRole('button', { name: /generate/i });
    this.flashcardsList = page.getByRole('list');
    this.saveButton = page.getByRole('button', { name: /save/i });
  }

  async goto() {
    await this.page.goto('/generate');
  }

  async enterText(text: string) {
    await this.textInput.fill(text);
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async waitForFlashcards() {
    await this.flashcardsList.waitFor({ state: 'visible' });
  }

  async saveFlashcards() {
    await this.saveButton.click();
  }

  async getFlashcardCount() {
    const items = await this.flashcardsList.locator('li').count();
    return items;
  }
}

