import { Page, Locator } from '@playwright/test';
import { FlashcardItem } from './components/FlashcardItem';

/**
 * Page Object Model for the Flashcard Generation Page
 * Following Playwright best practices for maintainable E2E tests
 * Uses data-test-id attributes for stable element selection
 */
export class GeneratePage {
  readonly page: Page;
  readonly sourceTextInput: Locator;
  readonly generateButton: Locator;
  readonly flashcardsList: Locator;
  readonly saveAllButton: Locator;
  readonly saveAcceptedButton: Locator;
  readonly logoutButton: Locator;
  readonly characterCount: Locator;
  readonly errorNotification: Locator;
  readonly skeletonLoader: Locator;

  constructor(page: Page) {
    this.page = page;
    // Using accessible selectors - more reliable with Astro + React hydration
    this.sourceTextInput = page.getByLabel(/tekst źródłowy/i);
    this.generateButton = page.getByRole('button', { name: /rozpocznij generowanie fiszek/i });
    this.flashcardsList = page.locator('[data-test-id="flashcard-list"]'); // Use data-test-id only for uniqueness
    this.saveAllButton = page.getByRole('button', { name: /zapisz wszystkie.*fiszek do bazy danych/i });
    this.saveAcceptedButton = page.getByRole('button', { name: /zapisz.*zaakceptowanych fiszek do bazy danych/i });
    this.logoutButton = page.getByRole('button', { name: /wyloguj/i });
    this.characterCount = page.locator('#character-count');
    this.errorNotification = page.getByRole('alert');
    this.skeletonLoader = page.locator('.animate-pulse').first();
  }

  /**
   * Navigate to generate page
   */
  async goto() {
    await this.page.goto('/generate');
  }

  /**
   * Fill in source text
   */
  async fillSourceText(text: string) {
    await this.sourceTextInput.click();
    // Use pressSequentially - it's the most reliable way to trigger React onChange
    // Even though it's slower, it ensures proper React state updates
    await this.sourceTextInput.pressSequentially(text, { delay: 5 });
    // Wait for React to update character count and button state
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click generate button
   */
  async clickGenerate() {
    // Verify button is enabled before clicking
    const isEnabled = await this.generateButton.isEnabled();
    if (!isEnabled) {
      // Try clicking text input again to trigger validation
      await this.sourceTextInput.click();
      await this.page.waitForTimeout(500);
    }
    await this.generateButton.click();
  }

  /**
   * Wait for flashcards to be generated and displayed
   */
  async waitForFlashcards() {
    await this.flashcardsList.waitFor({ state: 'visible' });
  }

  /**
   * Wait for generation to complete (skeleton loader disappears)
   */
  async waitForGenerationComplete() {
    await this.skeletonLoader.waitFor({ state: 'hidden', timeout: 60000 });
  }

  /**
   * Get flashcard item by index
   */
  getFlashcard(index: number): FlashcardItem {
    return new FlashcardItem(this.page, index);
  }

  /**
   * Get all flashcard items
   */
  async getAllFlashcards(): Promise<FlashcardItem[]> {
    const count = await this.getFlashcardCount();
    const flashcards: FlashcardItem[] = [];
    for (let i = 0; i < count; i++) {
      flashcards.push(this.getFlashcard(i));
    }
    return flashcards;
  }

  /**
   * Get number of flashcards
   */
  async getFlashcardCount(): Promise<number> {
    const items = await this.page.locator('[data-test-id^="flashcard-item-"]').count();
    return items;
  }

  /**
   * Click save all flashcards button
   */
  async clickSaveAll() {
    await this.saveAllButton.click();
  }

  /**
   * Click save accepted flashcards button
   */
  async clickSaveAccepted() {
    await this.saveAcceptedButton.click();
  }

  /**
   * Check if generate button is enabled
   */
  async isGenerateButtonEnabled(): Promise<boolean> {
    return await this.generateButton.isEnabled();
  }

  /**
   * Check if save all button is enabled
   */
  async isSaveAllButtonEnabled(): Promise<boolean> {
    return await this.saveAllButton.isEnabled();
  }

  /**
   * Check if save accepted button is enabled
   */
  async isSaveAcceptedButtonEnabled(): Promise<boolean> {
    return await this.saveAcceptedButton.isEnabled();
  }

  /**
   * Get character count text
   */
  async getCharacterCount(): Promise<string> {
    return await this.characterCount.textContent() || '';
  }

  /**
   * Check if error notification is visible
   */
  async hasError(): Promise<boolean> {
    return await this.errorNotification.isVisible();
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorNotification.textContent() || '';
  }

  /**
   * Wait for successful save (flashcards list disappears)
   */
  async waitForSuccessfulSave() {
    await this.flashcardsList.waitFor({ state: 'hidden' });
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(text?: string) {
    const toast = text 
      ? this.page.getByRole('status').filter({ hasText: text })
      : this.page.getByRole('status');
    await toast.waitFor({ state: 'visible' });
  }

  /**
   * Logout from application
   */
  async logout() {
    await this.logoutButton.click();
  }

  /**
   * Complete flow: enter text and generate flashcards
   */
  async generateFlashcardsFromText(text: string) {
    await this.fillSourceText(text);
    // Extra wait for React to fully process the text change
    await this.page.waitForTimeout(1000);
    await this.clickGenerate();
    await this.waitForGenerationComplete();
    await this.waitForFlashcards();
  }

  /**
   * Accept all flashcards
   */
  async acceptAllFlashcards() {
    const flashcards = await this.getAllFlashcards();
    for (const flashcard of flashcards) {
      await flashcard.accept();
    }
  }

  /**
   * Accept flashcards by indices
   */
  async acceptFlashcardsByIndices(indices: number[]) {
    for (const index of indices) {
      const flashcard = this.getFlashcard(index);
      await flashcard.accept();
    }
  }
}

