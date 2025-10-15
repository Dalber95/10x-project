import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the login form with all required fields", () => {
      render(<LoginForm />);

      // Check for title (first occurrence of "Zaloguj się")
      expect(screen.getAllByText(/zaloguj się/i)[0]).toBeInTheDocument();
      expect(screen.getByLabelText(/adres email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^hasło$/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
    });

    it("should render a link to password recovery page", () => {
      render(<LoginForm />);

      const forgotPasswordLink = screen.getByRole("link", { name: /zapomniałeś hasła/i });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    });

    it("should render a link to registration page", () => {
      render(<LoginForm />);

      const registerLink = screen.getByRole("link", { name: /zarejestruj się/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("Validation - Email Field", () => {
    it("should show error when email format is invalid", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab(); // Trigger blur event

      expect(await screen.findByText(/nieprawidłowy format adresu email/i)).toBeInTheDocument();
    });

    it("should not show error when email format is valid", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "test@example.com");
      await user.tab(); // Trigger blur event

      expect(screen.queryByText(/nieprawidłowy format adresu email/i)).not.toBeInTheDocument();
    });

    it("should mark email input as invalid when there is an error", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("Validation - Password Field", () => {
    it("should accept any non-empty password", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(passwordInput, "1");

      expect(passwordInput).toHaveValue("1");
    });
  });

  describe("Form Submission - AUTH-03: Successful Login", () => {
    it("should call onSubmit with email and password when form is valid", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "password123",
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/logowanie\.\.\./i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveAttribute("aria-busy", "true");
      });
    });

    it("should disable form inputs during submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      });
    });
  });

  describe("Form Submission - AUTH-04: Invalid Credentials", () => {
    it("should display error message when login fails", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error("Nieprawidłowe dane logowania"));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

      expect(await screen.findByText(/nieprawidłowe dane logowania/i)).toBeInTheDocument();
    });

    it("should clear previous error when submitting again", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi
        .fn()
        .mockRejectedValueOnce(new Error("Nieprawidłowe dane logowania"))
        .mockResolvedValueOnce(undefined);

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      // First submission - fails
      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      expect(await screen.findByText(/nieprawidłowe dane logowania/i)).toBeInTheDocument();

      // Second submission - succeeds
      await user.clear(passwordInput);
      await user.type(passwordInput, "correctpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/nieprawidłowe dane logowania/i)).not.toBeInTheDocument();
      });
    });

    it("should handle generic errors gracefully", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockRejectedValue("Network error");

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

      expect(await screen.findByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();
    });
  });

  describe("Submit Button State", () => {
    it("should disable submit button when email is invalid", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "password123");

      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when password is empty", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");

      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form is valid", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Default API Integration", () => {
    it("should call /api/auth/login endpoint when no onSubmit prop is provided", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      vi.stubGlobal("fetch", mockFetch);

      // Mock window.location.href
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: { ...originalLocation, href: "" },
        writable: true,
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "user@example.com", password: "password123" }),
        });
      });

      // Restore window.location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });

    it("should redirect to /generate after successful login", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      vi.stubGlobal("fetch", mockFetch);

      // Mock window.location
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: { ...originalLocation, href: "" },
        writable: true,
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "password123");
      await user.click(screen.getByRole("button", { name: /zaloguj się/i }));

      await waitFor(() => {
        expect(window.location.href).toBe("/generate");
      });

      // Restore window.location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for email input", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
    });

    it("should have proper ARIA attributes for password input", () => {
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    });

    it("should associate error message with email input via aria-describedby", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
        expect(screen.getByText(/nieprawidłowy format adresu email/i)).toHaveAttribute("id", "email-error");
      });
    });
  });

  describe("Form Submission Prevention", () => {
    it("should not submit form when pressing Enter with invalid email", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);

      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "password123");
      await user.keyboard("{Enter}");

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
