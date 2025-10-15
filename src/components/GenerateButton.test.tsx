import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateButton } from './GenerateButton';

describe('GenerateButton', () => {
  it('should render the button with correct text', () => {
    const mockClick = vi.fn();
    render(<GenerateButton onClick={mockClick} disabled={false} isLoading={false} />);
    
    const button = screen.getByRole('button', { name: /rozpocznij generowanie/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/generuj fiszki/i);
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();
    render(<GenerateButton onClick={mockClick} disabled={false} isLoading={false} />);
    
    const button = screen.getByRole('button', { name: /rozpocznij generowanie/i });
    await user.click(button);
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockClick = vi.fn();
    render(<GenerateButton onClick={mockClick} disabled={true} isLoading={false} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show loading state when isLoading is true', () => {
    const mockClick = vi.fn();
    render(<GenerateButton onClick={mockClick} disabled={false} isLoading={true} />);
    
    const button = screen.getByRole('button', { name: /generowanie/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/generowanie/i);
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('should not call onClick when disabled and clicked', async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();
    render(<GenerateButton onClick={mockClick} disabled={true} isLoading={false} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockClick).not.toHaveBeenCalled();
  });
});

