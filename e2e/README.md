# E2E Tests

This directory contains end-to-end tests using Playwright.

## Structure

- `*.spec.ts` - Test files
- `pages/` - Page Object Models for maintainable tests
- `.gitignore` - Excludes test artifacts from git

## Page Object Model

We use the Page Object Model pattern to keep tests maintainable and reusable.

### Example Page Object

```typescript
import { Page, Locator } from '@playwright/test';

export class MyPage {
  readonly page: Page;
  readonly myButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myButton = page.getByRole('button', { name: /click me/i });
  }

  async goto() {
    await this.page.goto('/my-page');
  }

  async clickButton() {
    await this.myButton.click();
  }
}
```

### Using Page Objects in Tests

```typescript
import { test, expect } from '@playwright/test';
import { MyPage } from './pages/MyPage';

test('should interact with my page', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto();
  await myPage.clickButton();
  
  await expect(page).toHaveURL(/success/);
});
```

## Running Tests

- `npm run test:e2e` - Run all E2E tests
- `npm run test:e2e:ui` - Open Playwright UI mode
- `npm run test:e2e:debug` - Run tests in debug mode
- `npm run test:e2e:codegen` - Record tests using codegen

## Best Practices

1. **Use Page Object Model** - Encapsulate page interactions in page objects
2. **Use browser contexts** - Isolate test environments
3. **Prefer semantic locators** - Use `getByRole`, `getByLabel` over CSS selectors
4. **Wait for elements properly** - Use built-in waiting mechanisms
5. **Use visual comparison** - Leverage `expect(page).toHaveScreenshot()`
6. **Implement test hooks** - Use `beforeEach`/`afterEach` for setup/teardown
7. **Run tests in parallel** - Configure workers for faster execution
8. **Use trace viewer** - Enable traces for debugging failures

## Configuration

See `playwright.config.ts` in the root directory for configuration options:
- Base URL
- Browser settings (Chromium/Desktop Chrome)
- Test timeout
- Retry logic
- Screenshot and trace settings

