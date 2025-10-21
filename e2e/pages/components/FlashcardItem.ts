import { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for a single Flashcard Item component
 * Represents one flashcard in the list with all its actions
 * Uses data-test-id attributes for stable element selection
 */
export class FlashcardItem {
  readonly page: Page;
  readonly index: number;
  readonly container: Locator;
  readonly frontField: Locator;
  readonly backField: Locator;
  readonly acceptButton: Locator;
  readonly editButton: Locator;
  readonly rejectButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly frontInput: Locator;
  readonly backInput: Locator;
  readonly acceptedBadge: Locator;
  readonly editedBadge: Locator;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;

    // Container
    this.container = page.getByTestId(`flashcard-item-${index}`);

    // Action buttons (in non-edit mode)
    this.acceptButton = page.getByTestId(`flashcard-accept-button-${index}`);
    this.editButton = page.getByTestId(`flashcard-edit-button-${index}`);
    this.rejectButton = page.getByTestId(`flashcard-reject-button-${index}`);

    // Edit mode buttons
    this.saveButton = this.container.getByRole("button", { name: /zapisz/i });
    this.cancelButton = this.container.getByRole("button", { name: /anuluj/i });

    // Fields in view mode
    this.frontField = this.container.locator("#front-" + index).locator("..");
    this.backField = this.container.locator("#back-" + index).locator("..");

    // Input fields in edit mode
    this.frontInput = this.container.locator(`#front-${index}`);
    this.backInput = this.container.locator(`#back-${index}`);

    // Badges
    this.acceptedBadge = this.container.getByText("Zaakceptowana");
    this.editedBadge = this.container.getByText("Edytowana");
  }

  /**
   * Click accept button to toggle acceptance
   */
  async accept() {
    await this.acceptButton.click();
  }

  /**
   * Click reject button to remove flashcard
   */
  async reject() {
    await this.rejectButton.click();
  }

  /**
   * Click edit button to enter edit mode
   */
  async startEdit() {
    await this.editButton.click();
  }

  /**
   * Edit flashcard content
   */
  async edit(front: string, back: string) {
    await this.startEdit();
    await this.frontInput.fill(front);
    await this.backInput.fill(back);
    await this.saveButton.click();
  }

  /**
   * Cancel editing
   */
  async cancelEdit() {
    await this.cancelButton.click();
  }

  /**
   * Save edited flashcard
   */
  async saveEdit() {
    await this.saveButton.click();
  }

  /**
   * Get front content text
   */
  async getFrontText(): Promise<string> {
    return (await this.frontField.textContent()) || "";
  }

  /**
   * Get back content text
   */
  async getBackText(): Promise<string> {
    return (await this.backField.textContent()) || "";
  }

  /**
   * Check if flashcard is accepted
   */
  async isAccepted(): Promise<boolean> {
    return await this.acceptedBadge.isVisible();
  }

  /**
   * Check if flashcard is edited
   */
  async isEdited(): Promise<boolean> {
    return await this.editedBadge.isVisible();
  }

  /**
   * Check if flashcard is in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    return await this.saveButton.isVisible();
  }

  /**
   * Check if flashcard is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }

  /**
   * Wait for flashcard to be visible
   */
  async waitForVisible() {
    await this.container.waitFor({ state: "visible" });
  }

  /**
   * Wait for flashcard to be hidden (after rejection)
   */
  async waitForHidden() {
    await this.container.waitFor({ state: "hidden" });
  }

  /**
   * Get flashcard number (1-based)
   */
  getNumber(): number {
    return this.index + 1;
  }
}
