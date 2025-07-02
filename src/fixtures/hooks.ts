import { Before, After, AfterStep, setWorldConstructor, Status, World } from "@cucumber/cucumber";
import { chromium, Browser, Page, firefox, webkit } from "playwright";
import * as fs from "fs";
import * as path from "path";

export class CustomWorld extends World {
  browser: Browser | null;
  page: Page | null;

  constructor(options: any) {
    super(options);
    this.browser = null;
    this.page = null;
  }

  async clearBrowserData(): Promise<void> {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    const context = this.page.context();
    
    await context.clearCookies();
    
    await context.clearPermissions();
    
    try {
      const hasDocument = await this.page.evaluate(() => {
        return typeof document !== 'undefined' && document.readyState !== 'loading';
      });
      
      if (hasDocument) {
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
    }
  }
}

setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ 
    headless: false,
    args: ['--no-first-run', '--disable-extensions']
  });
  
  const context = await this.browser.newContext({
    storageState: undefined,
    viewport: { width: 1280, height: 720 }
  });
  
  this.page = await context.newPage();
});

AfterStep(async function (this: CustomWorld, { pickle, result }) {
  if (!this.page) {
    console.warn('Page is not initialized, skipping screenshot');
    return;
  }

  try {
    const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const stepName = pickle.name.replace(/\s+/g, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `step_${stepName}_${timestamp}.png`);

    const screenshotBuffer = await this.page.screenshot({ path: screenshotPath, fullPage: false });

    await this.attach(screenshotBuffer, 'image/png');

    console.log(`Screenshot saved: ${screenshotPath}`);
  } catch (error) {
    console.error('Failed to capture screenshot:', (error as Error).message);
    await this.attach(`Failed to capture screenshot: ${(error as Error).message}`, 'text/plain');
  }
});

After(async function (this: CustomWorld) {
  if (this.browser) {
    await this.browser.close();
  }
});