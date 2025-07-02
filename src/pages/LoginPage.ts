import { Page, Locator } from '@playwright/test';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  authCookie?: string;
}

export interface ModalHandlingResult {
  handled: boolean;
  method?: 'iframe' | 'close-button' | 'not-found';
  error?: string;
}

export class LoginPage {
  private readonly page: Page;
  private readonly selectors = {
    signInButton: 'button[aria-label="Sign In"]',
    emailInput: 'input#username',
    passwordInput: 'input#password',
    continueButton: 'button#submit-button:has-text("Continue")',
    loginButton: 'button#submit-button:has-text("Log In")',
    accountButton: 'button.sc-ac7f3982-1.cqxMID',
    modal: '.tp-modal',
    modalCloseButton: 'button.tp-close[aria-label="Close the modal"]',
    modalIframe: 'iframe[id^="offer_"]'
  } as const;

  private readonly constants = {
    defaultTimeout: 10000,
    shortTimeout: 2000,
    modalTimeout: 5000,
    iframeTimeout: 3000,
    authCookieNames: ['ckns_', 'BBC-UID', 'id_token']
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = '/signin'): Promise<void> {
    await this.page.goto(path);
  }

  async clickSignInButton(): Promise<void> {
    await this.page.locator(this.selectors.signInButton).click();
  }

  async setEmail(email: string): Promise<void> {
    const emailInput = this.page.locator(this.selectors.emailInput);
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(email);
  }

  async clickContinue(): Promise<void> {
    const continueButton = this.page.locator(this.selectors.continueButton);
    await continueButton.waitFor({ state: 'visible' });
    await continueButton.click();
  }

  async setPassword(password: string): Promise<void> {
    const passwordInput = this.page.locator(this.selectors.passwordInput);
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    const loginButton = this.page.locator(this.selectors.loginButton);
    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
  }

  async isAccountButtonVisible(): Promise<boolean> {
    try {
      const accountButton = this.page.locator(this.selectors.accountButton);
      return await accountButton.isVisible();
    } catch {
      return false;
    }
  }

  async performLogin(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      console.log(`Attempting login for: ${credentials.email}`);
      
      await this.page.waitForTimeout(this.constants.shortTimeout);
      
      // Enter email and continue
      await this.setEmail(credentials.email);
      await this.clickContinue();
      await this.page.waitForTimeout(this.constants.shortTimeout);

      // Enter password and login
      await this.setPassword(credentials.password);
      await this.clickLogin();
      await this.page.waitForTimeout(this.constants.shortTimeout);

      // Verify login success
      const authResult = await this.verifyAuthentication();
      
      if (authResult.success) {
        console.log('Login successful - auth cookie found:', authResult.authCookie);
        return { success: true, authCookie: authResult.authCookie };
      } else {
        console.log('Login failed - no auth cookie found');
        return { success: false, error: 'Authentication failed - no valid auth cookie found' };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Login process failed:', errorMessage);
      return { success: false, error: `Login process failed: ${errorMessage}` };
    }
  }

  // Convenience method for quick login with default credentials
  async handleLogin(): Promise<boolean> {
    const defaultCredentials: LoginCredentials = {
      email: 'arbaaz100@gmail.com',
      password: 'Arbaaz@786'
    };
    
    const result = await this.performLogin(defaultCredentials);
    return result.success;
  }

  async handleTermsAndConditionsBanner(): Promise<ModalHandlingResult> {
    try {
      const modal = this.page.locator(this.selectors.modal);
      await modal.waitFor({ 
        state: 'visible', 
        timeout: this.constants.modalTimeout 
      });

      console.log('Terms modal detected, attempting to handle...');

      // Try iframe method first
      const iframeResult = await this.handleModalViaIframe();
      if (iframeResult.handled) {
        await this.waitForModalToClose(modal);
        return iframeResult;
      }

      // Fallback to close button
      const closeButtonResult = await this.handleModalViaCloseButton();
      if (closeButtonResult.handled) {
        await this.waitForModalToClose(modal);
        return closeButtonResult;
      }

      return { 
        handled: false, 
        error: 'Could not handle modal with any available method' 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('No terms modal found or modal handling failed:', errorMessage);
      return { 
        handled: false, 
        method: 'not-found', 
        error: errorMessage 
      };
    }
  }

  private async verifyAuthentication(): Promise<{ success: boolean; authCookie?: string }> {
    const cookies = await this.page.context().cookies();
    
    const authCookie = cookies.find(cookie => 
      this.constants.authCookieNames.some(name => cookie.name.includes(name))
    );

    return {
      success: !!authCookie,
      authCookie: authCookie?.name
    };
  }

  private async handleModalViaIframe(): Promise<ModalHandlingResult> {
    try {
      const iframe = this.page.frameLocator(this.selectors.modalIframe);
      const continueButton = iframe.locator('button.piano-bbc-close-button', { 
        hasText: 'Continue' 
      });
      
      await continueButton.waitFor({ 
        state: 'visible', 
        timeout: this.constants.iframeTimeout 
      });
      await continueButton.click();
      
      console.log('Successfully clicked Continue button inside iframe');
      return { handled: true, method: 'iframe' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('Could not click Continue inside iframe:', errorMessage);
      return { handled: false, error: errorMessage };
    }
  }

  private async handleModalViaCloseButton(): Promise<ModalHandlingResult> {
    try {
      const closeButton = this.page.locator(this.selectors.modalCloseButton);
      await closeButton.waitFor({ 
        state: 'visible', 
        timeout: this.constants.iframeTimeout 
      });
      await closeButton.click();
      
      console.log('Successfully clicked modal close button');
      return { handled: true, method: 'close-button' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('Could not click close button:', errorMessage);
      return { handled: false, error: errorMessage };
    }
  }

  private async waitForModalToClose(modal: Locator): Promise<void> {
    try {
      await modal.waitFor({ 
        state: 'hidden', 
        timeout: this.constants.modalTimeout 
      });
      console.log('Modal successfully closed');
    } catch {
      console.log('Warning: Modal may not have closed properly');
    }
  }

  // Utility method for waiting with better error handling
  private async safeWait(ms: number): Promise<void> {
    try {
      await this.page.waitForTimeout(ms);
    } catch (error) {
      console.warn(`Wait timeout may have been interrupted: ${error}`);
    }
  }

  // Method to check if user is already logged in
  async isUserLoggedIn(): Promise<boolean> {
    const authResult = await this.verifyAuthentication();
    return authResult.success;
  }

  // Method to logout if needed
  async logout(): Promise<boolean> {
    try {
      // Clear all cookies to simulate logout
      await this.page.context().clearCookies();
      console.log('Successfully logged out (cleared cookies)');
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }
}