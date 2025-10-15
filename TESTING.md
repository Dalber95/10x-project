# Testing Documentation

This project uses **Vitest** for unit testing and **Playwright** for end-to-end testing.

## Table of Contents

- [Unit Testing with Vitest](#unit-testing-with-vitest)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Unit Testing with Vitest

### Overview

Vitest is configured to test:
- Utility functions
- React components
- Business logic
- Hooks

### Configuration

- **Config file**: `vitest.config.ts`
- **Setup file**: `src/test/setup.ts`
- **Test environment**: jsdom (for DOM testing)
- **Coverage provider**: v8

### Writing Unit Tests

Place unit tests next to the files they test with the naming convention:
- `*.test.ts` for TypeScript files
- `*.test.tsx` for React components

#### Example Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    
    const heading = screen.getByRole('heading', { name: /my component/i });
    expect(heading).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();
    
    render(<MyComponent onClick={mockHandler} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

#### Example Utility Test

```typescript
import { describe, it, expect } from 'vitest';
import { myUtility } from './myUtility';

describe('myUtility', () => {
  it('should return correct value', () => {
    const result = myUtility('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(myUtility(null)).toBe(null);
    expect(myUtility(undefined)).toBe(undefined);
  });
});
```

### Mocking with Vitest

#### Function Mocks

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');
mockFn.mockResolvedValue('async value');
```

#### Module Mocks

```typescript
vi.mock('./module', () => ({
  namedExport: vi.fn(() => 'mocked'),
}));
```

#### Spying on Functions

```typescript
const spy = vi.spyOn(object, 'method');
expect(spy).toHaveBeenCalled();
spy.mockRestore();
```

## E2E Testing with Playwright

### Overview

Playwright is configured to test:
- User flows
- Authentication
- Form submissions
- Page navigation
- Visual regression

### Configuration

- **Config file**: `playwright.config.ts`
- **Test directory**: `e2e/`
- **Browser**: Chromium (Desktop Chrome)
- **Base URL**: `http://localhost:4321`

### Page Object Model

We use the Page Object Model pattern to organize E2E tests. Page objects are located in `e2e/pages/`.

#### Example Page Object

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

#### Using Page Objects in Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  
  await expect(page).toHaveURL(/dashboard/);
});
```

### Visual Regression Testing

Playwright supports screenshot comparison:

```typescript
test('should match visual snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100
  });
});
```

### Browser Contexts

Use browser contexts to isolate test environments:

```typescript
test('should have isolated storage', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Your test here
  
  await context.close();
});
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run tests once
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Record new tests using codegen
npm run test:e2e:codegen
```

## Best Practices

### Unit Testing

1. **Use descriptive test names** - Clearly state what is being tested and expected outcome
2. **Follow Arrange-Act-Assert pattern** - Organize tests for clarity
3. **Test user behavior, not implementation** - Focus on outcomes, not internals
4. **Use semantic queries** - Prefer `getByRole` over `getByTestId`
5. **Mock external dependencies** - Isolate units under test
6. **Avoid testing library internals** - Test the public API
7. **Use `vi.fn()` for mocks** - Track calls and return values
8. **Clean up after tests** - Restore mocks and spies

### E2E Testing

1. **Use Page Object Model** - Encapsulate page interactions
2. **Prefer semantic locators** - Use `getByRole`, `getByLabel` over CSS selectors
3. **Wait for elements properly** - Use built-in waiting mechanisms
4. **Use browser contexts** - Isolate test environments
5. **Implement test hooks** - Use `beforeEach`/`afterEach` for setup/teardown
6. **Enable traces on failures** - Debug issues with trace viewer
7. **Run tests in parallel** - Configure workers for faster execution
8. **Use visual comparison** - Leverage screenshot testing

### General Guidelines

1. **Keep tests simple and focused** - One concept per test
2. **Write tests before fixing bugs** - Prevent regressions
3. **Maintain test coverage** - Aim for meaningful coverage, not 100%
4. **Review test failures** - Don't ignore flaky tests
5. **Use inline snapshots** - Make changes visible in code reviews
6. **Organize test files logically** - Mirror source structure
7. **Document complex test scenarios** - Add comments for clarity
8. **Update tests with code changes** - Keep tests in sync

## CI/CD Integration

Tests can be integrated into CI/CD pipelines using GitHub Actions or other CI services.

### Example GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --run
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Vitest Issues

**Problem**: Tests fail with "Cannot find module" errors
- **Solution**: Check `vitest.config.ts` path aliases match `tsconfig.json`

**Problem**: DOM elements not found in tests
- **Solution**: Ensure `environment: 'jsdom'` is set in config

### Playwright Issues

**Problem**: Tests timeout
- **Solution**: Increase timeout in `playwright.config.ts` or use `test.setTimeout()`

**Problem**: Elements not found
- **Solution**: Add explicit waits with `waitForSelector()` or check locators

**Problem**: Screenshots don't match
- **Solution**: Update snapshots with `npx playwright test --update-snapshots`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)

