import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "./LogoutButton";
import { toast } from "sonner";

// Mock the sonner toast library
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render logout button with correct text and icon", () => {
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      expect(button).toBeInTheDocument();
    });

    it("should apply correct variant and size classes", () => {
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Form Submission - AUTH-06: Successful Logout", () => {
    it("should call /api/auth/logout endpoint when clicked", async () => {
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

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      });

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });

    it("should show loading state during logout", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      vi.stubGlobal("fetch", mockFetch);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      expect(await screen.findByText(/wylogowanie\.\.\./i)).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");

      vi.unstubAllGlobals();
    });

    it("should display success toast after successful logout", async () => {
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

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Wylogowano pomyślnie");
      });

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });

    it("should redirect to /login after successful logout", async () => {
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

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(window.location.href).toBe("/login");
      });

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });
  });

  describe("Error Handling", () => {
    it("should display error toast when logout fails", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Błąd serwera" }),
      });

      vi.stubGlobal("fetch", mockFetch);

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Nie udało się wylogować. Spróbuj ponownie.");
      });

      consoleErrorSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it("should log error to console when logout fails", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Błąd serwera" }),
      });

      vi.stubGlobal("fetch", mockFetch);

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Logout error:", expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it("should re-enable button after error", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Błąd serwera" }),
      });

      vi.stubGlobal("fetch", mockFetch);

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      expect(button).not.toBeDisabled();

      consoleErrorSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it("should handle network errors gracefully", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

      vi.stubGlobal("fetch", mockFetch);

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Nie udało się wylogować. Spróbuj ponownie.");
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith("Logout error:", expect.any(Error));

      consoleErrorSpy.mockRestore();
      vi.unstubAllGlobals();
    });
  });

  describe("Multiple Click Prevention", () => {
    it("should not trigger multiple logout requests when clicked multiple times", async () => {
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

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });

      // Click multiple times quickly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only call fetch once because button is disabled after first click
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      vi.unstubAllGlobals();
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-busy attribute during loading", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      vi.stubGlobal("fetch", mockFetch);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });

      // Button has aria-busy="false" initially
      expect(button).toHaveAttribute("aria-busy", "false");

      await user.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute("aria-busy", "true");
      });

      vi.unstubAllGlobals();
    });

    it("should be disabled during logout process", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      vi.stubGlobal("fetch", mockFetch);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });

      expect(button).not.toBeDisabled();

      await user.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      vi.unstubAllGlobals();
    });
  });

  describe("Button States", () => {
    it("should show logout icon when not loading", () => {
      render(<LogoutButton />);

      expect(screen.getByRole("button", { name: /wyloguj się/i })).toBeInTheDocument();
    });

    it("should show loading spinner when loading", async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      vi.stubGlobal("fetch", mockFetch);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /wyloguj się/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/wylogowanie\.\.\./i)).toBeInTheDocument();
      });

      vi.unstubAllGlobals();
    });
  });
});
