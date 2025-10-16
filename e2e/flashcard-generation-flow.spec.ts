import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { GeneratePage } from './pages/GeneratePage';
import { TestConfig } from './helpers/test-config';
import { cleanupTestUser } from './helpers/test-teardown';

/**
 * E2E Test Suite: Flashcard Generation Flow
 * Tests the complete user journey from login to saving flashcards
 * Following Playwright best practices with Page Object Model
 * 
 * Note: Test cleans up its test data in afterEach hook
 */

const SOURCE_TEXT = `
Sztuczna inteligencja (AI) to dziedzina informatyki zajmująca się tworzeniem systemów 
zdolnych do wykonywania zadań wymagających ludzkiej inteligencji. Obejmuje uczenie maszynowe, 
przetwarzanie języka naturalnego oraz rozpoznawanie obrazów. Machine learning pozwala 
komputerom uczyć się z danych bez jawnego programowania. Deep learning to podzbiór uczenia 
maszynowego wykorzystujący sztuczne sieci neuronowe do analizy danych.

Uczenie maszynowe (Machine Learning) to metoda analizy danych, która automatyzuje budowę modeli 
analitycznych. Jest to gałąź sztucznej inteligencji oparta na idei, że systemy mogą uczyć się 
z danych, identyfikować wzorce i podejmować decyzje przy minimalnej interwencji człowieka.
Algorytmy uczenia maszynowego wykorzystują metody obliczeniowe do "uczenia się" informacji 
bezpośrednio z danych, bez polegania na wcześniej określonym równaniu jako modelu.

Deep Learning to podzbiór uczenia maszynowego, w którym sztuczne sieci neuronowe - algorytmy 
zainspirowane ludzkim mózgiem - uczą się na dużych ilościach danych. Podczas gdy pojedyncza 
sieć neuronowa może wciąż dokonywać przybliżonych prognoz, dodatkowe ukryte warstwy mogą 
pomóc zoptymalizować i udoskilić dokładność. Deep learning napędza wiele usług i aplikacji 
sztucznej inteligencji (AI), które ulepszają automatyzację, wykonując zadania analityczne i 
fizyczne bez interwencji człowieka.
`.trim();

test.describe('Flashcard Generation Flow', () => {
  let loginPage: LoginPage;
  let generatePage: GeneratePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    generatePage = new GeneratePage(page);
  });

  // Clean up test data after each test
  test.afterEach(async () => {
    if (TestConfig.user.id) {
      await cleanupTestUser(TestConfig.user.id);
    }
  });

  test('should complete full flow: login, generate, and save all flashcards', async ({ page }) => {
    // 1. Navigate to login page
    await loginPage.goto();
    
    // 2. Login with valid credentials from test config
    await loginPage.login(TestConfig.user.email, TestConfig.user.password);
    
    // 3. Verify successful login (redirect to /generate)
    await loginPage.waitForSuccessfulLogin();
    expect(page.url()).toContain('/generate');
    
    // 4. Enter source text (minimum 1000 characters for backend validation)
    await generatePage.fillSourceText(SOURCE_TEXT);
    
    // 5. Click generate flashcards (button will be enabled after text is filled)
    await generatePage.clickGenerate();
    
    // 6. Wait for generation to complete
    await generatePage.waitForGenerationComplete();
    await generatePage.waitForFlashcards();
    
    // 7. Verify flashcards were generated
    const flashcardCount = await generatePage.getFlashcardCount();
    expect(flashcardCount).toBeGreaterThan(0);
    
    // 8. Save all flashcards
    await generatePage.clickSaveAll();
    
    // 9. Wait for flashcards list to be cleared (indicates successful save)
    await generatePage.waitForSuccessfulSave();
    
    // 10. Verify flashcards list is not visible
    expect(await generatePage.flashcardsList.isVisible()).toBe(false);
  });
});
