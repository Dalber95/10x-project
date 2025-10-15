import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the registration form with all required fields", () => {
      render(<RegisterForm />);

      // Check for title (first occurrence of "Utwórz konto")
      expect(screen.getAllByText(/utwórz konto/i)[0]).toBeInTheDocument();
      expect(screen.getByLabelText(/adres email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^hasło$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/potwierdź hasło/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /utwórz konto/i })).toBeInTheDocument();
    });

    it("should render a link to login page", () => {
      render(<RegisterForm />);

      const loginLink = screen.getByRole("link", { name: /zaloguj się/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should display password requirement hint", () => {
      render(<RegisterForm />);

      expect(screen.getByText(/minimum 8 znaków/i)).toBeInTheDocument();
    });
  });

  describe("Validation - Email Field", () => {
    it("should show error when email format is invalid", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab();

      expect(await screen.findByText(/nieprawidłowy format adresu email/i)).toBeInTheDocument();
    });

    it("should not show error when email format is valid", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "test@example.com");
      await user.tab();

      expect(screen.queryByText(/nieprawidłowy format adresu email/i)).not.toBeInTheDocument();
    });
  });

  describe("Validation - Password Field", () => {
    it("should show error when password is less than 8 characters", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(passwordInput, "short");
      await user.tab();

      expect(await screen.findByText(/hasło musi mieć co najmniej 8 znaków/i)).toBeInTheDocument();
    });

    it("should not show error when password is 8 characters or more", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(passwordInput, "password123");
      await user.tab();

      expect(screen.queryByText(/hasło musi mieć co najmniej 8 znaków/i)).not.toBeInTheDocument();
    });

    it("should replace hint with error message when password is invalid", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(passwordInput, "short");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/minimum 8 znaków/i)).not.toBeInTheDocument();
        expect(screen.getByText(/hasło musi mieć co najmniej 8 znaków/i)).toBeInTheDocument();
      });
    });
  });

  describe("Validation - Confirm Password Field", () => {
    it("should show error when passwords do not match", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");
      await user.tab();

      expect(await screen.findByText(/hasła nie są zgodne/i)).toBeInTheDocument();
    });

    it("should show success message when passwords match", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      expect(await screen.findByText(/hasła są zgodne/i)).toBeInTheDocument();
    });

    it("should not show success message when confirm password is empty", () => {
      render(<RegisterForm />);

      expect(screen.queryByText(/hasła są zgodne/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Submission - AUTH-01: Successful Registration", () => {
    it("should call onSubmit with email and password when form is valid", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "newuser@example.com",
          password: "password123",
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 1000)));

      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      // Click and immediately check loading state
      user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/tworzenie konta\.\.\./i)).toBeInTheDocument();
      });

      expect(submitButton).toHaveAttribute("aria-busy", "true");
    });

    it("should disable form inputs during submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));

      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(screen.getByRole("button", { name: /utwórz konto/i }));

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
      });
    });
  });

  describe("Form Submission - AUTH-02: Email Already Exists", () => {
    it("should display error message when email is already taken", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error("E-mail jest już zajęty"));

      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(screen.getByRole("button", { name: /utwórz konto/i }));

      expect(await screen.findByText(/e-mail jest już zajęty/i)).toBeInTheDocument();
    });

    it("should clear previous error when submitting again", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi
        .fn()
        .mockRejectedValueOnce(new Error("E-mail jest już zajęty"))
        .mockResolvedValueOnce(undefined);

      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      // First submission - fails
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(submitButton);

      expect(await screen.findByText(/e-mail jest już zajęty/i)).toBeInTheDocument();

      // Second submission - succeeds
      await user.clear(emailInput);
      await user.type(emailInput, "newuser@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/e-mail jest już zajęty/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Submit Button State", () => {
    it("should disable submit button when email is invalid", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when password is too short", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "short");
      await user.type(confirmPasswordInput, "short");

      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when passwords do not match", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");

      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form is valid", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Default API Integration", () => {
    it("should call /api/auth/register endpoint when no onSubmit prop is provided", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      vi.stubGlobal("fetch", mockFetch);

      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: { ...originalLocation, href: "" },
        writable: true,
      });

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(screen.getByRole("button", { name: /utwórz konto/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "newuser@example.com", password: "password123" }),
        });
      });

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });

    it("should redirect to /generate after successful registration", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      vi.stubGlobal("fetch", mockFetch);

      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: { ...originalLocation, href: "" },
        writable: true,
      });

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(screen.getByRole("button", { name: /utwórz konto/i }));

      await waitFor(() => {
        expect(window.location.href).toBe("/generate");
      });

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for inputs", () => {
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autoComplete", "new-password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("autoComplete", "new-password");
    });

    it("should associate error message with inputs via aria-describedby", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
        expect(screen.getByText(/nieprawidłowy format adresu email/i)).toHaveAttribute("id", "email-error");
      });
    });

    it("should mark invalid inputs with aria-invalid", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "different");
      await user.tab();

      await waitFor(() => {
        expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("Form Submission Prevention", () => {
    it("should not submit form when validation fails", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(<RegisterForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i);

      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");
      await user.keyboard("{Enter}");

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
