import { Page } from '@playwright/test';

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto('/signin'); // Update URL if needed
  }

  async clickSignInButton() {
    return this.page.locator('button[aria-label="Sign In"]').click();
  }

  async setEmail(email: string) {
    const emailInput = this.page.locator('input#username');
    await emailInput.fill(email);
  }

  async clickContinue() {
    const continueButton = this.page.locator('button#submit-button:has-text("Continue")');
    await continueButton.click();
  }

  async setPassword(password: string) {
    const passwordInput = this.page.locator('input#password');
    await passwordInput.fill(password);
  } 

  async clickLogin() {
    const loginButton = this.page.locator('button#submit-button:has-text("Log In")');
    await loginButton.click();
  }

  async isAccountButtonVisible() {
    const accountButton = this.page.locator('button.sc-ac7f3982-1.cqxMID');
    return await accountButton.isVisible();
  }

  async handleLogin(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(2000);

      await this.setEmail('arbaaz100@gmail.com');
      await this.clickContinue();
      await this.page.waitForTimeout(2000);

      await this.setPassword('Arbaaz@786');
      await this.clickLogin();
      await this.page.waitForTimeout(2000);

      // Validate successful login by checking for authentication cookie
      const cookies = await this.page.context().cookies();
      const authCookie = cookies.find(cookie => cookie.name.includes('ckns_') ||
        cookie.name.includes('BBC-UID') ||
        cookie.name.includes('id_token')
      );

      if (authCookie) {
        console.log('Login successful - auth cookie found:', authCookie.name);
        return true;
      } else {
        console.log('Login failed - no auth cookie found');
        return false;
      }

    } catch (loginError) {
      console.error('Login process failed:', loginError);
      return false;
    }
  }

  async handleTermsAndConditionsBanner() {
    try {
      const modal = this.page.locator('.tp-modal');
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      console.log('Terms modal detected, attempting to handle...');

      // Option 1: Try clicking the Continue button inside the iframe
      try {
        const iframe = this.page.frameLocator('iframe[id^="offer_"]');
        const continueButton = iframe.locator('button.piano-bbc-close-button', { hasText: 'Continue' });
        await continueButton.waitFor({ state: 'visible', timeout: 3000 });
        await continueButton.click();
        console.log('Successfully clicked Continue button inside iframe');
      } catch (iframeError) {
        if (iframeError instanceof Error) {
          console.log('Could not click Continue inside iframe, trying close button:', iframeError.message);
        } else {
          console.log('Could not click Continue inside iframe, trying close button:', iframeError);
        }

        // Option 2: Click the close button outside the iframe
        const closeButton = this.page.locator('button.tp-close[aria-label="Close the modal"]');
        await closeButton.waitFor({ state: 'visible', timeout: 3000 });
        await closeButton.click();
        console.log('Successfully clicked modal close button');
      }

      // Wait for modal to disappear
      await modal.waitFor({ state: 'hidden', timeout: 5000 });

    } catch (error) {
      if (error instanceof Error) {
        console.log('No terms modal found or modal handling failed:', error.message);
      } else {
        console.log('No terms modal found or modal handling failed:', error);
      }
    }
  }
}