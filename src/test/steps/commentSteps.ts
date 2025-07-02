import { Given, When, Then } from '@cucumber/cucumber';
import { ArticlePage } from '../../pages/ArticlePage';
import { LoginPage } from '../../pages/LoginPage';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../fixtures/hooks'; // Import the CustomWorld

let articlePage: ArticlePage;
let loginPage: LoginPage;


When('I navigate to the article {string}', async function (this: CustomWorld, url: string) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  articlePage = new ArticlePage(this.page);
  await articlePage.navigateTo(url);
});

When('I navigate the BBC Homepage until I find an article with comments enabled', {timeout: 2 * 20000}, async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  articlePage = new ArticlePage(this.page);
  
  if (await (await articlePage.getCommentIconLocator()).count() > 0) {
    // If comments section is found, navigate to the first article
    const firstArticle = this.page.locator('[data-testid="participate:comments"]').first();
    await firstArticle.click();
  } else {
    // If comments section is not found, iterate through navigation tabs
    const navLinks = await this.page.locator('[data-testid="mainNavigationLink"]').all();
    for (const link of navLinks) {
      // Get the href attribute and navigate to the tab
      const href = await link.getAttribute('href');
      if (href) {
        const fullUrl = href.startsWith('http') ? href : `https://www.bbc.co.uk${href}`;
        await this.page.goto(fullUrl);
        await this.page.waitForTimeout(2000);

        // Check for comments section on this page
        if (await this.page.locator('[data-testid="participate:comments"]').count() > 0) {
          // If found, navigate to the first article
          const firstArticle = this.page.locator('[data-testid="participate:comments"]').first();
          await firstArticle.click();
          await this.page.waitForTimeout(2000);
          break; // Exit loop after finding comments and navigating
        }
      }
    }
  }

  // Optional: Add an assertion to verify navigation
  await expect(this.page).toHaveURL(/\/.+/); // Ensure URL has changed from homepage
});

Then('I should see the comment section', {timeout: 2 * 20000}, async function (this: CustomWorld) {
  const isPresent = await articlePage.isCommentSectionPresent();
  expect(isPresent).toBeTruthy();
});

Then('I should not see the comment section', async function (this: CustomWorld) {
  const isPresent = await articlePage.isCommentSectionPresent();
  expect(isPresent).toBeFalsy();
});

Then('The comment section should be loaded and functional', {timeout: 2 * 20000}, async function (this: CustomWorld) {
  const page = this.page;
  if (!page) {
    throw new Error('Page is not initialized');
  }
  
  const isCommentSectionReady = await articlePage.verifyCommentSectionLoaded();
  expect(isCommentSectionReady, 'Comment section should be loaded and functional').toBe(true);
});

Then('I should not be able to post a comment without signing in', async function (this: CustomWorld) {
  const page = this.page;
  if (!page) {
    throw new Error('Page is not initialized');
  }

  // Check the comment section presence when not logged in
  const commentSectionPresenceForUsersNotLoggedIn = await articlePage.verifyCommentSectionWhenNotLoggedIn();
  expect(commentSectionPresenceForUsersNotLoggedIn, 'Comment section should be present').toBeTruthy();

});

Given('I find and click the sign-in button and Log in', {timeout: 2 * 20000}, async function (this: CustomWorld) {
  const page = this.page;
  if (!page) {
    throw new Error('Page is not initialized');
  }

  // Assuming you have a LoginPage class instance
  loginPage = new LoginPage(page);
  
  const success = await articlePage.findAndClickSignInButton();
  expect(success, 'Should find sign-in button and complete login successfully').toBe(true);

  // Perform login steps
  const isLoggedIn = await loginPage.handleLogin();
  expect(isLoggedIn).toBe(true);
});
