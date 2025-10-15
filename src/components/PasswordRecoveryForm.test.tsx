import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordRecoveryForm } from "./PasswordRecoveryForm";

describe("PasswordRecoveryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the password recovery form with all required fields", () => {
      render(<PasswordRecoveryForm />);

      expect(screen.getByText(/odzyskiwanie hasła/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adres email/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /wyślij link resetujący/i })).toBeInTheDocument();
    });

    it("should render a link back to login page", () => {
      render(<PasswordRecoveryForm />);

      const loginLink = screen.getByRole("link", { name: /wróć do logowania/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should display helpful description", () => {
      render(<PasswordRecoveryForm />);

      expect(
        screen.getByText(/wprowadź swój adres email, a wyślemy ci link do resetowania hasła/i)
      ).toBeInTheDocument();
    });
  });

  describe("Validation - Email Field", () => {
    it("should show error when email format is invalid", async () => {
      const user = userEvent.setup();
      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab();

      expect(await screen.findByText(/nieprawidłowy format adresu email/i)).toBeInTheDocument();
    });

    it("should not show error when email format is valid", async () => {
      const user = userEvent.setup();
      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "test@example.com");
      await user.tab();

      expect(screen.queryByText(/nieprawidłowy format adresu email/i)).not.toBeInTheDocument();
    });

    it("should mark email input as invalid when there is an error", async () => {
      const user = userEvent.setup();
      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("Form Submission - AUTH-05: Password Recovery Request", () => {
    it("should call onSubmit with email when form is valid", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });

      await user.type(emailInput, "user@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "user@example.com",
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });

      await user.type(emailInput, "user@example.com");
      await user.click(submitButton);

      expect(await screen.findByText(/wysyłanie\.\.\./i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute("aria-busy", "true");
    });

    it("should disable email input during submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "user@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
      });
    });

    it("should display success message after successful submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "user@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      expect(
        await screen.findByText(/link do resetowania hasła został wysłany na podany adres email/i)
      ).toBeInTheDocument();
    });

    it("should clear email input after successful submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "user@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      await waitFor(() => {
        expect(emailInput).toHaveValue("");
      });
    });

    it("should reset touched state after successful submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "user@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      await waitFor(() => {
        expect(emailInput).toHaveValue("");
      });

      // Type invalid email - should not show error initially as field is not touched
      await user.type(emailInput, "invalid");
      expect(screen.queryByText(/nieprawidłowy format adresu email/i)).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when recovery request fails", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error("Nie znaleziono użytkownika z tym adresem email"));

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "notfound@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      expect(await screen.findByText(/nie znaleziono użytkownika z tym adresem email/i)).toBeInTheDocument();
    });

    it("should clear previous error when submitting again", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockRejectedValueOnce(new Error("Błąd sieciowy")).mockResolvedValueOnce(undefined);

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });

      // First submission - fails
      await user.type(emailInput, "user@example.com");
      await user.click(submitButton);

      expect(await screen.findByText(/błąd sieciowy/i)).toBeInTheDocument();

      // Second submission - succeeds
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/błąd sieciowy/i)).not.toBeInTheDocument();
      });
    });

    it("should handle generic errors gracefully", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockRejectedValue("Network error");

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "user@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      expect(await screen.findByText(/wystąpił nieoczekiwany błąd/i)).toBeInTheDocument();
    });
  });

  describe("Submit Button State", () => {
    it("should disable submit button when email is invalid", async () => {
      const user = userEvent.setup();
      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });

      await user.type(emailInput, "invalid-email");

      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when email is empty", () => {
      render(<PasswordRecoveryForm />);

      const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });

      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when email is valid", async () => {
      const user = userEvent.setup();
      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });

      await user.type(emailInput, "user@example.com");

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Default API Integration", () => {
    it("should call /api/auth/forgot-password endpoint when no onSubmit prop is provided", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      vi.stubGlobal("fetch", mockFetch);

      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "user@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "user@example.com" }),
        });
      });

      vi.unstubAllGlobals();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for email input", () => {
      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
    });

    it("should associate error message with email input via aria-describedby", async () => {
      const user = userEvent.setup();
      render(<PasswordRecoveryForm />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
        expect(screen.getByText(/nieprawidłowy format adresu email/i)).toHaveAttribute("id", "email-error");
      });
    });
  });

  describe("Success and Error States Isolation", () => {
    it("should not show success message when there is an error", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error("Server error"));

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "user@example.com");
      await user.click(screen.getByRole("button", { name: /wyślij link resetujący/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/link do resetowania hasła został wysłany/i)).not.toBeInTheDocument();
    });

    it("should clear success message when submitting again", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Error on second attempt"));

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);
      const submitButton = screen.getByRole("button", { name: /wyślij link resetujący/i });

      // First submission - success
      await user.type(emailInput, "user@example.com");
      await user.click(submitButton);

      expect(await screen.findByText(/link do resetowania hasła został wysłany/i)).toBeInTheDocument();

      // Second submission - should clear success and show error
      await user.type(emailInput, "another@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/link do resetowania hasła został wysłany/i)).not.toBeInTheDocument();
        expect(screen.getByText(/error on second attempt/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission Prevention", () => {
    it("should not submit form when email is invalid", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(<PasswordRecoveryForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/adres email/i);

      await user.type(emailInput, "invalid-email");
      await user.keyboard("{Enter}");

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
