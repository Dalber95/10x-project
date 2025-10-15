# Testing Quick Reference

## 🧪 Unit Tests (Vitest)

### Commands
```bash
npm test                    # Run all unit tests once
npm run test:watch          # Watch mode - reruns on file changes
npm run test:ui             # Visual UI for exploring tests
npm run test:coverage       # Generate coverage report
```

### Quick Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### File Location
- Place tests next to source files
- Use `*.test.ts` or `*.test.tsx` extension

### Key Features
- ✅ Fast test execution
- ✅ Hot reload in watch mode
- ✅ React Testing Library integrated
- ✅ Coverage reports with v8
- ✅ Mock functions with `vi.fn()`

---

## 🎭 E2E Tests (Playwright)

### Commands
```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Visual UI mode
npm run test:e2e:debug      # Debug mode with inspector
npm run test:e2e:codegen    # Record tests visually
```

### Quick Example
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'pass');
  await expect(page).toHaveURL(/dashboard/);
});
```

### File Location
- Create tests in `e2e/*.spec.ts`
- Create page objects in `e2e/pages/*.ts`

### Key Features
- ✅ Chromium browser (Desktop Chrome)
- ✅ Page Object Model pattern
- ✅ Auto-start dev server
- ✅ Visual regression testing
- ✅ Trace viewer for debugging
- ✅ Parallel test execution

---

## 📊 Test Coverage

### Generate Report
```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - Visual HTML report
- `coverage/coverage-final.json` - JSON data

---

## 🔍 Common Queries (Testing Library)

### By Role (Preferred)
```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })
```

### By Label
```typescript
screen.getByLabelText(/email/i)
```

### By Text
```typescript
screen.getByText(/hello world/i)
```

### Query Variants
- `getBy*` - Throws if not found (for assertions)
- `queryBy*` - Returns null if not found (for non-existence)
- `findBy*` - Async, waits for element (for async elements)

---

## 🎯 Playwright Locators

### By Role (Preferred)
```typescript
page.getByRole('button', { name: /submit/i })
```

### By Label
```typescript
page.getByLabel(/email/i)
```

### By Test ID
```typescript
page.getByTestId('submit-button')
```

### By Text
```typescript
page.getByText(/welcome/i)
```

---

## 🛠️ Mocking with Vitest

### Mock Function
```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
expect(mockFn).toHaveBeenCalledTimes(1);
```

### Spy on Method
```typescript
const spy = vi.spyOn(obj, 'method');
expect(spy).toHaveBeenCalled();
spy.mockRestore();
```

### Mock Module
```typescript
vi.mock('./module', () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}));
```

---

## 🐛 Debugging

### Vitest
```typescript
import { debug } from '@testing-library/react';

// Print DOM structure
debug();

// Print specific element
debug(screen.getByRole('button'));
```

### Playwright
```bash
# Run with inspector
npm run test:e2e:debug

# View traces
npx playwright show-trace trace.zip
```

### Pause in Test
```typescript
// Vitest
import { vi } from 'vitest';
await vi.waitFor(() => {
  // Wait for condition
});

// Playwright
await page.pause(); // Opens inspector
```

---

## 📝 Best Practices

### ✅ DO
- Test user behavior, not implementation
- Use semantic queries (getByRole)
- Write descriptive test names
- Mock external dependencies
- Use Page Object Model for E2E
- Follow Arrange-Act-Assert pattern

### ❌ DON'T
- Test implementation details
- Use `getByTestId` as first choice
- Write tests that depend on other tests
- Hardcode delays (use waitFor)
- Skip cleanup
- Ignore flaky tests

---

## 📚 Documentation

- **Complete Guide**: `TESTING.md`
- **Unit Tests**: `src/test/README.md`
- **E2E Tests**: `e2e/README.md`
- **Setup Summary**: `.ai/testing-setup.md`

---

## 🚀 Quick Start

### Run Your First Unit Test
```bash
npm run test:watch
```

### Run Your First E2E Test
```bash
npm run test:e2e:ui
```

### Record a New E2E Test
```bash
npm run test:e2e:codegen
```

---

## 💡 Tips

1. **Use watch mode** during development for instant feedback
2. **Use UI modes** to visually explore and debug tests
3. **Write tests first** when fixing bugs (TDD)
4. **Keep tests simple** - one concept per test
5. **Use codegen** to quickly create E2E test skeletons
6. **Check traces** when E2E tests fail in CI
7. **Update snapshots** carefully and review changes
8. **Run coverage** before pushing to ensure adequate testing

