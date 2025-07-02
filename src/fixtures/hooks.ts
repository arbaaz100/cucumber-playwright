import { Before, After, AfterStep, setWorldConstructor, Status, World } from "@cucumber/cucumber";
import { chromium, Browser, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

// Extend CustomWorld from World to inherit attach method
export class CustomWorld extends World {
  browser: Browser | null;
  page: Page | null;

  constructor(options: any) {
    super(options); // Call the parent World constructor
    this.browser = null;
    this.page = null;
  }

  // Method to clear cache, cookies, and storage
  async clearBrowserData(): Promise<void> {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    const context = this.page.context();
    
    // Clear cookies
    await context.clearCookies();
    
    // Clear permissions
    await context.clearPermissions();
    
    try {
      // Only clear storage if we have a document loaded
      const hasDocument = await this.page.evaluate(() => {
        return typeof document !== 'undefined' && document.readyState !== 'loading';
      });
      
      if (hasDocument) {
        // Clear local storage and session storage
        await this.page.evaluate(() => {
          try {
            localStorage.clear();
          } catch (e) {
            console.log('Could not clear localStorage:', (e as Error).message);
          }
          
          try {
            sessionStorage.clear();
          } catch (e) {
            console.log('Could not clear sessionStorage:', (e as Error).message);
          }
        });

        // Clear cache storage
        await this.page.evaluate(async () => {
          try {
            if ('caches' in window) {
              const cachesKeys = await caches.keys();
              await Promise.all(cachesKeys.map(key => caches.delete(key)));
            }
          } catch (e) {
            console.log('Could not clear cache storage:', (e as Error).message);
          }
        });
      }
    } catch (error) {
      console.log('Error during storage clearing:', (error as Error).message);
      // Continue execution - storage clearing is not critical for test setup
    }
  }

  // Alternative method: Clear browser data after navigating to a page
  async clearBrowserDataAfterNavigation(): Promise<void> {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    const context = this.page.context();
    
    // Clear cookies
    await context.clearCookies();
    
    // Navigate to about:blank to ensure we have a document
    await this.page.goto('about:blank');
    
    // Now safely clear storage
    await this.page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignore errors - storage might not be available
      }
    });

    // Clear cache storage
    await this.page.evaluate(async () => {
      try {
        if ('caches' in window) {
          const cachesKeys = await caches.keys();
          await Promise.all(cachesKeys.map(key => caches.delete(key)));
        }
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Clear permissions
    await context.clearPermissions();
  }
}

setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  // Launch browser with a clean profile
  this.browser = await chromium.launch({ 
    headless: false,
    args: ['--no-first-run', '--disable-extensions']
  });
  
  // Create a new context with a defined viewport size
  const context = await this.browser.newContext({
    storageState: undefined, // Don't load any existing storage state
    viewport: { width: 1280, height: 720 } // Set a standard viewport size
  });
  
  this.page = await context.newPage();
});

AfterStep(async function (this: CustomWorld, { pickle, result }) {
  if (!this.page) {
    console.warn('Page is not initialized, skipping screenshot');
    return;
  }

  try {
    // Create screenshots directory if it doesn't exist
    const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Generate a unique filename for the screenshot
    const stepName = pickle.name.replace(/\s+/g, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `step_${stepName}_${timestamp}.png`);

    // Capture screenshot of only the viewport
    const screenshotBuffer = await this.page.screenshot({ path: screenshotPath, fullPage: false });

    // Attach screenshot to Cucumber report
    await this.attach(screenshotBuffer, 'image/png');

    console.log(`Screenshot saved: ${screenshotPath}`);
  } catch (error) {
    console.error('Failed to capture screenshot:', (error as Error).message);
    // Attach an error message to the report
    await this.attach(`Failed to capture screenshot: ${(error as Error).message}`, 'text/plain');
  }
});

After(async function (this: CustomWorld) {
  if (this.browser) {
    await this.browser.close();
  }
});