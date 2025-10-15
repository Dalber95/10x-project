# Unit Tests

This directory contains unit test configuration and setup files for Vitest.

## Structure

- `setup.ts` - Global test setup file that runs before all tests
  - Configures testing-library matchers
  - Sets up cleanup after each test

## Writing Tests

### Location
Place unit tests next to the files they test with the naming convention:
- `ComponentName.test.tsx` for React components
- `fileName.test.ts` for TypeScript files

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();
    
    render(<MyComponent onClick={mockFn} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

## Running Tests

- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Best Practices

1. **Use descriptive test names** - Clearly state what is being tested
2. **Follow Arrange-Act-Assert** - Structure tests for clarity
3. **Use testing-library queries** - Prefer `getByRole` over `getByTestId`
4. **Mock external dependencies** - Use `vi.mock()` for modules
5. **Test user behavior** - Focus on how users interact with components
6. **Avoid implementation details** - Test the public API, not internals

