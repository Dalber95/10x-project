# 10x Cards

The 10x-cards project aims to enable users to quickly create and manage sets of educational flashcards. The application uses LLM models (via API) to generate flashcard suggestions based on the provided text, solving the problem of manual, time-consuming flashcard creation.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

The project is built with a modern tech stack:

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication, BaaS SDK)
- **AI Integration:** OpenRouter.ai for access to various LLM models
- **Testing:** Vitest and React Testing Library (unit & integration tests), Playwright (E2E tests)
- **CI/CD & Hosting:** GitHub Actions and DigitalOcean (Docker)

## Getting Started Locally

To set up and run the project on your local machine, follow these steps:

### Prerequisites

- Node.js (version `22.14.0` as specified in the `.nvmrc` file)
- npm (or your preferred package manager like pnpm or yarn)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/10x-cards.git
    cd 10x-cards
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Populate the `.env` file with the necessary credentials:
    
    **Required:**
    - `SUPABASE_URL` - Your Supabase project URL (from https://app.supabase.com)
    - `SUPABASE_KEY` - Your Supabase anonymous key (from project settings)
    
    **Optional for development:**
    - `OPENROUTER_API_KEY` - OpenRouter API key (from https://openrouter.ai/keys)
      
      > **Note:** If `OPENROUTER_API_KEY` is not provided in development, the app will use mock flashcards instead of actual AI generation. This allows you to test the authentication and UI without needing an API key.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:4321`.

## Available Scripts

The following scripts are available in the `package.json`:

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run preview`: Previews the production build locally.
-   `npm run lint`: Lints the codebase for errors.
-   `npm run lint:fix`: Lints the codebase and automatically fixes issues.
-   `npm run format`: Formats the code using Prettier.
-   `npm run test`: Runs unit and integration tests.
-   `npm run test:e2e`: Runs end-to-end tests.

## Project Scope

### Key Features

-   **AI-Powered Flashcard Generation:** Automatically create flashcard suggestions from user-provided text.
-   **Flashcard Management:** 
    -   View all saved flashcards in a paginated list
    -   Edit existing flashcards (front and back)
    -   Delete flashcards with confirmation
    -   Track flashcard source (AI-generated, AI-edited, or manual)
-   **User Authentication:** Secure user registration and login with password recovery.
-   **Theme Support:** Light and dark mode with automatic detection of system preferences.
-   **Secure Data Storage:** User and flashcard data stored securely using Supabase.

### Out of Scope (MVP)

The initial version of the project will not include:

-   Advanced, custom spaced repetition algorithms.
-   Gamification features.
-   Native mobile applications.
-   Importing from various document formats (e.g., PDF, DOCX).
-   A public API.
-   Sharing flashcards between users.
-   Advanced notification systems.

## Project Status

**In Development**

The project is currently in the active development phase. The core features are being implemented based on the user stories outlined in the Product Requirements Document.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
