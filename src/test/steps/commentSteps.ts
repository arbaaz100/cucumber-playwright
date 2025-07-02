import { Given, When, Then } from '@cucumber/cucumber';
import { ArticlePage } from '../../pages/ArticlePage';
import { LoginPage } from '../../pages/LoginPage';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../fixtures/hooks';
import { UserType, getUserCredentials } from '../../userCredentials/userCredentials';

let articlePage: ArticlePage;
let loginPage: LoginPage;


When('I navigate to the article {string}', async function (this: CustomWorld, url: string) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  articlePage = new ArticlePage(this.page);
  await articlePage.navigateTo(url);
});

When('I navigate the BBC Homepage until I find an article with comments enabled and I open the article', {timeout: 2 * 20000}, async function (this: CustomWorld) {
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
          break;
        }
      }
    }
  }

  await expect(this.page).toHaveURL(/\/.+/);
});

Then('I should see the comment section', {timeout: 2 * 20000}, async function (this: CustomWorld) {
  const isPresent = await articlePage.isCommentSectionPresent();
  expect(isPresent).toBeTruthy();
});

Then('I should not see the comment section', async function (this: CustomWorld) {
  const isPresent = await articlePage.isCommentSectionPresent();
  expect(isPresent).toBeFalsy();
});

Then('The comment section should be visible and interactive', {timeout: 2 * 20000}, async function (this: CustomWorld) {
  const page = this.page;
  if (!page) {
    throw new Error('Page is not initialized');
  }
  
  const isCommentSectionReady = await articlePage.verifyCommentSectionLoaded();
  expect(isCommentSectionReady, 'Comment section should be loaded and functional').toBe(true);
});

Then('The comment input field should be disabled and I should not be able to post a comment without signing in', async function (this: CustomWorld) {
  const page = this.page;
  if (!page) {
    throw new Error('Page is not initialized');
  }

  // Check the comment section presence when not logged in
  const commentSectionPresenceForUsersNotLoggedIn = await articlePage.verifyCommentSectionWhenNotLoggedIn();
  expect(commentSectionPresenceForUsersNotLoggedIn, 'Comment section should be present').toBeTruthy();

});

Then('I find and click the sign-in button and Log in as {string}', {timeout: 2 * 20000}, async function (this: CustomWorld, userTypeString: string) {
  const page = this.page;
  if (!page) {
    throw new Error('Page is not initialized');
  }

  // Convert string to enum (case-insensitive)
  const userType = Object.values(UserType).find(type => 
    type.toLowerCase() === userTypeString.toLowerCase()
  ) as UserType;

  if (!userType) {
    throw new Error(`Invalid user type: ${userTypeString}. Valid types: ${Object.values(UserType).join(', ')}`);
  }

  console.log(`Attempting to log in as user type: ${userType}`);

  const userCredentials = getUserCredentials(userType);
  const loginPage = new LoginPage(page);
  const articlePage = new ArticlePage(page);

  // Find and click sign-in button
  const signInSuccess = await articlePage.findAndClickSignInButton();
  expect(signInSuccess, `Should find and click sign-in button for user ${userType}`).toBe(true);

  // Perform login
  const loginResult = await loginPage.performLogin({
    email: userCredentials.email,
    password: userCredentials.password
  });

  expect(loginResult.success, `Login should succeed for user ${userType}. Error: ${loginResult.error || 'Unknown error'}`).toBe(true);
  
  console.log(`✅ Successfully logged in as ${userCredentials.displayName}`);
});

