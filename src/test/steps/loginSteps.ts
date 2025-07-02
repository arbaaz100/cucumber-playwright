import { Given } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../fixtures/hooks'; // Import the CustomWorld
import { LoginPage } from '../../pages/LoginPage';

// Removed unused outer loginPage declaration to avoid shadowing
let loginPage: LoginPage;

Given('I open the BBC homepage', { timeout: 2 * 20000 }, async function (this: CustomWorld) {
    const page = this.page;
    if (!page) {
      throw new Error('Page is not initialized');
    }

    const loginPage = new LoginPage(page);
    await page.goto('https://www.bbc.co.uk');
    await page.waitForLoadState('networkidle');
    console.log('BBC homepage opened successfully');

    await loginPage.handleTermsAndConditionsBanner();
  });

Given('I am logged in to BBC', { timeout: 2 * 20000 }, async function (this: CustomWorld) {
    const page = this.page;
    if (!page) {
      throw new Error('Page is not initialized');
    }

  
    const loginPage = new LoginPage(page);
    await page.goto('https://www.bbc.co.uk');
    await page.waitForLoadState('networkidle');
  
    // Check if the terms and privacy policy modal is present
    await loginPage.handleTermsAndConditionsBanner();
  
    // Perform login steps
    await loginPage.clickSignInButton();
    const isLoggedIn = await loginPage.handleLogin();
    expect(isLoggedIn).toBe(true);

  
});