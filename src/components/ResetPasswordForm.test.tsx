import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "./ResetPasswordForm";

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render the reset password form with all required fields", () => {
      render(<ResetPasswordForm />);

      expect(screen.getByText(/resetowanie hasła/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^nowe hasło$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^potwierdź nowe hasło$/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /zresetuj hasło/i })).toBeInTheDocument();
    });

    it("should render a link to login page", () => {
      render(<ResetPasswordForm />);

      const loginLink = screen.getByRole("link", { name: /zaloguj się/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should display password requirement hint", () => {
      render(<ResetPasswordForm />);

      expect(screen.getByText(/minimum 8 znaków/i)).toBeInTheDocument();
    });

    it("should display helpful description", () => {
      render(<ResetPasswordForm />);

      expect(screen.getByText(/wprowadź nowe hasło dla swojego konta/i)).toBeInTheDocument();
    });
  });

  describe("Validation - Password Field", () => {
    it("should show error when password is less than 8 characters", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);

      await user.type(passwordInput, "short");
      await user.tab();

      expect(await screen.findByText(/hasło musi mieć co najmniej 8 znaków/i)).toBeInTheDocument();
    });

    it("should not show error when password is 8 characters or more", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);

      await user.type(passwordInput, "password123");
      await user.tab();

      expect(screen.queryByText(/hasło musi mieć co najmniej 8 znaków/i)).not.toBeInTheDocument();
    });

    it("should replace hint with error message when password is invalid", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);

      await user.type(passwordInput, "short");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/^minimum 8 znaków$/i)).not.toBeInTheDocument();
        expect(screen.getByText(/hasło musi mieć co najmniej 8 znaków/i)).toBeInTheDocument();
      });
    });
  });

  describe("Validation - Confirm Password Field", () => {
    it("should show error when passwords do not match", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");
      await user.tab();

      expect(await screen.findByText(/hasła nie są zgodne/i)).toBeInTheDocument();
    });

    it("should show success message when passwords match", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      expect(await screen.findByText(/hasła są zgodne/i)).toBeInTheDocument();
    });

    it("should not show success message when confirm password is empty", () => {
      render(<ResetPasswordForm />);

      expect(screen.queryByText(/hasła są zgodne/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Submission - Successful Password Reset", () => {
    it("should call onSubmit with password when form is valid", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zresetuj hasło/i });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          password: "newpassword123",
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zresetuj hasło/i });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      expect(await screen.findByText(/resetowanie\.\.\./i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute("aria-busy", "true");
    });

    it("should disable form inputs during submission", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      await waitFor(() => {
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
      });
    });

    it("should display success message after successful reset", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      expect(await screen.findByText(/hasło zostało pomyślnie zresetowane/i)).toBeInTheDocument();
    });

    it('should change button text to "Hasło zresetowane" after success', async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      expect(await screen.findByRole("button", { name: /hasło zresetowane/i })).toBeInTheDocument();
    });

    it("should disable inputs after successful reset", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      await waitFor(() => {
        expect(screen.getByText(/hasło zostało pomyślnie zresetowane/i)).toBeInTheDocument();
      });

      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when reset fails", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error("Link resetowania hasła wygasł"));

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      expect(await screen.findByText(/link resetowania hasła wygasł/i)).toBeInTheDocument();
    });

    it("should clear previous error when submitting again", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockRejectedValueOnce(new Error("Błąd serwera")).mockResolvedValueOnce(undefined);

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zresetuj hasło/i });

      // First submission - fails
      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      expect(await screen.findByText(/błąd serwera/i)).toBeInTheDocument();

      // Second submission - succeeds
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/błąd serwera/i)).not.toBeInTheDocument();
      });
    });

    it("should handle generic errors gracefully", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockRejectedValue("Network error");

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      expect(await screen.findByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();
    });
  });

  describe("Submit Button State", () => {
    it("should disable submit button when password is too short", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zresetuj hasło/i });

      await user.type(passwordInput, "short");
      await user.type(confirmPasswordInput, "short");

      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when passwords do not match", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zresetuj hasło/i });

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");

      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form is valid", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zresetuj hasło/i });

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      expect(submitButton).not.toBeDisabled();
    });

    it("should disable submit button after successful submission", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);
      const submitButton = screen.getByRole("button", { name: /zresetuj hasło/i });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/hasło zostało pomyślnie zresetowane/i)).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();
    });
  });

  describe("Default API Integration", () => {
    it("should call /api/auth/reset-password endpoint when no onSubmit prop is provided", async () => {
      const user = userEvent.setup({ delay: null });
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

      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: "newpassword123" }),
        });
      });

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for password inputs", () => {
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autoComplete", "new-password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("autoComplete", "new-password");
    });

    it("should associate error message with password input via aria-describedby", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);

      await user.type(passwordInput, "short");
      await user.tab();

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute("aria-describedby", "password-error");
        expect(screen.getByText(/hasło musi mieć co najmniej 8 znaków/i)).toHaveAttribute("id", "password-error");
      });
    });

    it("should mark invalid inputs with aria-invalid", async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

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
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn();

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");
      await user.keyboard("{Enter}");

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Success and Error States Isolation", () => {
    it("should not show success message when there is an error", async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error("Server error"));

      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(/^nowe hasło$/i);
      const confirmPasswordInput = screen.getByLabelText(/^potwierdź nowe hasło$/i);

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(screen.getByRole("button", { name: /zresetuj hasło/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/hasło zostało pomyślnie zresetowane/i)).not.toBeInTheDocument();
    });
  });
});
