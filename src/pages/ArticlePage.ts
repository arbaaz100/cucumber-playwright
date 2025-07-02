import { Locator, Page, expect } from '@playwright/test';

export class ArticlePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async getCommentIconLocator(): Promise<Locator> {
    return this.page.locator('[data-testid="participate:comments"]');
  }

  async isCommentIconPresent(): Promise<boolean> {
    return await this.page.locator('[data-testid="participate:comments"]').isVisible();
  }

  async isCommentSectionPresent(): Promise<boolean> {
    return await this.page.locator('[data-testid="participate:comments"]').isVisible();
  }

  async verifyCommentSectionLoaded(timeout: number = 10000): Promise<boolean> {
    try {
      console.log('Verifying comment section is loaded and functional...');

      (await this.page.waitForSelector('[data-testid="participate:comments"]', { state: 'visible', timeout })).click();

      // 1. Wait for the comment textarea to be visible
      const commentTextarea = this.page.locator('textarea[placeholder="Add your comment..."]');
      await commentTextarea.waitFor({ state: 'visible', timeout });
      console.log('✓ Comment textarea is visible');

      // 2. Verify textarea is enabled and not disabled
      const isDisabled = await commentTextarea.isDisabled();
      if (isDisabled) {
        console.error('✗ Comment textarea is disabled');
        return false;
      }
      console.log('✓ Comment textarea is enabled');

      // 3. Verify textarea is editable by checking if it's focusable
      await commentTextarea.focus();
      const isFocused = await commentTextarea.evaluate(el => document.activeElement === el);
      if (!isFocused) {
        console.error('✗ Comment textarea cannot be focused');
        return false;
      }
      console.log('✓ Comment textarea is focusable');

      // 4. Test that user can type in the textarea
      await this.page.waitForTimeout(1000);
      const testText = 'Test comment';
      await commentTextarea.fill(testText);
      const inputValue = await commentTextarea.inputValue();
      if (inputValue !== testText) {
        console.error('✗ Cannot type in comment textarea');
        return false;
      }
      console.log('✓ User can type in comment textarea');

      // 5. Verify character count/limit functionality (if aria-label shows remaining characters)
      await this.page.waitForTimeout(1000);
      const ariaLabel = await commentTextarea.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.includes('characters remaining')) {
        console.log('✓ Character count functionality detected');

        // Test character limit by typing more text
        const longText = 'a'.repeat(500); // Assuming 400 char limit based on aria-label
        await commentTextarea.fill(longText);
        const finalValue = await commentTextarea.inputValue();

        if (finalValue.length <= 400) {
          console.log('✓ Character limit is enforced');
        } else {
          console.log('⚠ Character limit may not be enforced properly');
        }
      }

      await this.page.waitForTimeout(1000);
      // 6. Check for submit/post button (common patterns)
      const submitButtonSelectors = [
        'button[type="submit"]',
        'button:has-text("Post")',
        'button:has-text("Submit")',
        'button:has-text("Comment")',
        'button:has-text("Reply")',
        '[data-testid*="submit"]',
        '[data-testid*="post"]',
        '.comment-submit',
        '.post-comment'
      ];

      let submitButtonFound = false;
      for (const selector of submitButtonSelectors) {
        try {
          const submitButton = this.page.locator(selector);
          if (await submitButton.isVisible({ timeout: 1000 })) {
            const isSubmitDisabled = await submitButton.isDisabled();
            console.log(`✓ Submit button found: ${selector} (${isSubmitDisabled ? 'disabled' : 'enabled'})`);
            submitButtonFound = true;
            break;
          }
        } catch (e) {
          // Continue checking other selectors
        }
      }

      if (!submitButtonFound) {
        console.log('⚠ No submit button found - user may need to perform additional actions');
      }

      // 7. Clear the test text
      await commentTextarea.fill('');

      console.log('✅ Comment section verification completed successfully');
      return true;

    } catch (error) {
      console.error('✗ Comment section verification failed:', (error instanceof Error) ? error.message : String(error));
      return false;
    }
  }

  async verifyCommentSectionWhenNotLoggedIn(timeout: number = 10000): Promise<boolean> {

    try {
      console.log('Verifying comment section when not logged in...');

      //wait for comments section to be visible
      await this.page.waitForSelector('#section-heading', { state: 'visible', timeout });

      // verify the text "Comments" is present
      const commentsHeading = this.page.locator('#section-heading');
      const commentsSectionTitle = this.page.locator('#section-title');
      const greetingForNotLoggedIn = this.page.getByText('Sign in to comment, reply and react');

      const headingText = await commentsHeading.textContent();
      const sectionTitleText = await commentsSectionTitle.textContent();

      if(headingText === 'Comments' && sectionTitleText === 'Join the conversation') {
        console.log('✓ Comments section is present and has correct title');
      } else {
        return false;
      }

      if(await greetingForNotLoggedIn.isVisible()) {
        console.log('✓ Greeting for not logged in users is present');
      } else {
        console.error('✗ Greeting for not logged in users is not present');
        return false;
      }

      const commentTextarea = this.page.locator('textarea[placeholder="Add your comment..."]');

      if(await commentTextarea.isVisible()) {
        console.error('✗ Comment textarea should not be visible for not logged in users');
        return false;
      } else {
        console.log('✓ Comment textarea is not visible for not logged in users');
      }

      const signInButton = this.page.locator('[data-testid="account:account"]');
      const registerButton = this.page.locator('a:has-text("Register")');
      if (await signInButton.isVisible() && await registerButton.isVisible()) {
        console.log('✓ Sign in and Register button are present for not logged in users');
      } else {
        console.error('✗ Sign in and Register button are not present for not logged in users');
        return false;
      }

      return true;
      
    } catch (error) {
      console.error('✗ Comment section verification failed:', (error instanceof Error) ? error.message : String(error));
      return false;
    }
  };

  async findAndClickSignInButton(timeout: number = 10000): Promise<boolean> {
    try {
      console.log('Searching for sign-in button...');

      const signInButton = this.page.locator('a:has-text("Sign in"), button:has-text("Sign in")').first();

      await signInButton.waitFor({ state: 'visible', timeout });

      // Validate button is clickable
      const isEnabled = !await signInButton.isDisabled();
      if (!isEnabled) {
        console.error('Sign-in button is disabled');
        return false;
      }

      // Click the button
      await signInButton.click();
      console.log('✓ Successfully clicked sign-in button');

      return true;

    } catch (error) {
      console.error('Failed to find or click sign-in button:', (error as Error).message);
      return false;
    }
  }
}