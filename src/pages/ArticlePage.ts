import { Locator, Page, expect } from '@playwright/test';

export interface CommentVerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export class ArticlePage {
  private readonly page: Page;
  private readonly selectors = {
    commentIcon: '[data-testid="participate:comments"]',
    commentTextarea: 'textarea[placeholder="Add your comment..."]',
    sectionHeading: '#section-heading',
    sectionTitle: '#section-title',
    signInGreeting: 'Sign in to comment, reply and react',
    accountButton: '[data-testid="account:account"]',
    registerButton: 'a:has-text("Register")',
    signInButton: 'a:has-text("Sign in"), button:has-text("Sign in")',
    submitButtons: [
      'button[type="submit"]',
      'button:has-text("Post")',
      'button:has-text("Submit")',
      'button:has-text("Comment")',
      'button:has-text("Reply")',
      '[data-testid*="submit"]',
      '[data-testid*="post"]',
      '.comment-submit',
      '.post-comment'
    ]
  } as const;

  private readonly constants = {
    defaultTimeout: 10000,
    shortTimeout: 1000,
    testComment: 'Test comment',
    maxCharacters: 400,
    longText: 'a'.repeat(500)
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async getCommentIconLocator(): Promise<Locator> {
    return this.page.locator(this.selectors.commentIcon);
  }

  async isCommentIconPresent(): Promise<boolean> {
    try {
      return await this.page.locator(this.selectors.commentIcon).isVisible();
    } catch {
      return false;
    }
  }

  async isCommentSectionPresent(): Promise<boolean> {
    return this.isCommentIconPresent();
  }

  async verifyCommentSectionLoaded(timeout: number = this.constants.defaultTimeout): Promise<boolean> {
    try {
      console.log('Verifying comment section is loaded and functional...');

      // Click comment icon to expand section
      await this.clickCommentIcon(timeout);

      // Verify textarea functionality
      const textareaResult = await this.verifyTextareaFunctionality();
      if (!textareaResult.success) {
        console.error('✗ Textarea verification failed:', textareaResult.errors.join(', '));
        return false;
      }
      
      // Log warnings but don't fail the test
      if (textareaResult.warnings.length > 0) {
        console.warn('⚠ Warnings:', textareaResult.warnings.join(', '));
      }

      // Verify submit button
      const submitResult = await this.verifySubmitButton();
      if (!submitResult.found) {
        console.warn('⚠ No submit button found - user may need to perform additional actions');
      }

      // Clean up test input
      await this.clearTestInput();

      console.log('✅ Comment section verification completed successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('✗ Comment section verification failed:', errorMessage);
      return false;
    }
  }

  async verifyCommentSectionWhenNotLoggedIn(timeout: number = this.constants.defaultTimeout): Promise<boolean> {
    try {
      console.log('Verifying comment section when not logged in...');

      // Wait for comments section
      await this.page.waitForSelector(this.selectors.sectionHeading, { 
        state: 'visible', 
        timeout 
      });

      // Verify section titles
      const titlesValid = await this.verifySectionTitles();
      if (!titlesValid) {
        console.error('✗ Comments section titles are incorrect');
        return false;
      }

      // Verify greeting for non-logged-in users
      const greetingVisible = await this.verifySignInGreeting();
      if (!greetingVisible) {
        console.error('✗ Greeting for not logged in users is not present');
        return false;
      }

      // Verify textarea is not visible
      const textareaHidden = await this.verifyTextareaHidden();
      if (!textareaHidden) {
        console.error('✗ Comment textarea should not be visible for not logged in users');
        return false;
      }

      // Verify sign-in and register buttons
      const buttonsVisible = await this.verifyAuthButtons();
      if (!buttonsVisible) {
        console.error('✗ Sign in and Register buttons are not present for not logged in users');
        return false;
      }

      console.log('✅ Comment section verification for non-logged-in users completed successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('✗ Comment section verification failed:', errorMessage);
      return false;
    }
  }

  async findAndClickSignInButton(timeout: number = this.constants.defaultTimeout): Promise<boolean> {
    try {
      console.log('Searching for sign-in button...');

      const signInButton = this.page.locator(this.selectors.signInButton).first();
      await signInButton.waitFor({ state: 'visible', timeout });

      const isEnabled = !await signInButton.isDisabled();
      if (!isEnabled) {
        console.error('Sign-in button is disabled');
        return false;
      }

      await signInButton.click();
      console.log('✓ Successfully clicked sign-in button');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to find or click sign-in button:', errorMessage);
      return false;
    }
  }

  private async clickCommentIcon(timeout: number): Promise<void> {
    const commentIcon = await this.page.waitForSelector(this.selectors.commentIcon, { 
      state: 'visible', 
      timeout 
    });
    await commentIcon.click();
  }

  private async verifyTextareaFunctionality(): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const result: { success: boolean; errors: string[]; warnings: string[] } = { success: false, errors: [], warnings: [] };

    // Wait for textarea
    const commentTextarea = this.page.locator(this.selectors.commentTextarea);
    await commentTextarea.waitFor({ state: 'visible', timeout: this.constants.defaultTimeout });
    console.log('✓ Comment textarea is visible');

    // Check if enabled
    if (await commentTextarea.isDisabled()) {
      result.errors.push('Comment textarea is disabled');
      return result;
    }
    console.log('✓ Comment textarea is enabled');

    // Test focus
    await commentTextarea.focus();
    const isFocused = await commentTextarea.evaluate(el => document.activeElement === el);
    if (!isFocused) {
      result.errors.push('Comment textarea cannot be focused');
      return result;
    }
    console.log('✓ Comment textarea is focusable');

    // Test typing
    await this.page.waitForTimeout(this.constants.shortTimeout);
    await commentTextarea.fill(this.constants.testComment);
    const inputValue = await commentTextarea.inputValue();
    if (inputValue !== this.constants.testComment) {
      result.errors.push('Cannot type in comment textarea');
      return result;
    }
    console.log('✓ User can type in comment textarea');

    // Test character limit
    await this.verifyCharacterLimit(commentTextarea, result);

    result.success = true;
    return result;
  }

  private async verifyCharacterLimit(
    textarea: Locator, 
    result: { warnings: string[] }
  ): Promise<void> {
    await this.page.waitForTimeout(this.constants.shortTimeout);
    const ariaLabel = await textarea.getAttribute('aria-label');
    
    if (ariaLabel?.includes('characters remaining')) {
      console.log('✓ Character count functionality detected');

      await textarea.fill(this.constants.longText);
      const finalValue = await textarea.inputValue();

      if (finalValue.length <= this.constants.maxCharacters) {
        console.log('✓ Character limit is enforced');
      } else {
        result.warnings.push('Character limit may not be enforced properly');
      }
    }
  }

  private async verifySubmitButton(): Promise<{ found: boolean }> {
    await this.page.waitForTimeout(this.constants.shortTimeout);
    
    for (const selector of this.selectors.submitButtons) {
      try {
        const submitButton = this.page.locator(selector);
        if (await submitButton.isVisible({ timeout: this.constants.shortTimeout })) {
          const isDisabled = await submitButton.isDisabled();
          console.log(`✓ Submit button found: ${selector} (${isDisabled ? 'disabled' : 'enabled'})`);
          return { found: true };
        }
      } catch {
        // Continue checking other selectors
      }
    }
    
    return { found: false };
  }

  private async clearTestInput(): Promise<void> {
    const textarea = this.page.locator(this.selectors.commentTextarea);
    await textarea.fill('');
  }

  private async verifySectionTitles(): Promise<boolean> {
    const heading = await this.page.locator(this.selectors.sectionHeading).textContent();
    const title = await this.page.locator(this.selectors.sectionTitle).textContent();
    
    const isValid = heading === 'Comments' && title === 'Join the conversation';
    if (isValid) {
      console.log('✓ Comments section is present and has correct title');
    }
    return isValid;
  }

  private async verifySignInGreeting(): Promise<boolean> {
    const greeting = this.page.getByText(this.selectors.signInGreeting);
    const isVisible = await greeting.isVisible();
    
    if (isVisible) {
      console.log('✓ Greeting for not logged in users is present');
    }
    return isVisible;
  }

  private async verifyTextareaHidden(): Promise<boolean> {
    const textarea = this.page.locator(this.selectors.commentTextarea);
    const isHidden = !(await textarea.isVisible());
    
    if (isHidden) {
      console.log('✓ Comment textarea is not visible for not logged in users');
    }
    return isHidden;
  }

  private async verifyAuthButtons(): Promise<boolean> {
    const signInButton = this.page.locator(this.selectors.accountButton);
    const registerButton = this.page.locator(this.selectors.registerButton);
    
    const bothVisible = await signInButton.isVisible() && await registerButton.isVisible();
    if (bothVisible) {
      console.log('✓ Sign in and Register buttons are present for not logged in users');
    }
    return bothVisible;
  }
}