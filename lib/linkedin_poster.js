const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const userDataDir = path.join(process.cwd(), 'linkedin_session');

async function postToLinkedIn(text, headful = false) {
  console.log(`>>> EXECUTION START: headful=${headful}, text="${text.substring(0, 20)}..."`);

  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: !headful,
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await browser.newPage();

  try {
    console.log('Navigating to LinkedIn...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'load', timeout: 30000 });

    // Wait for either the feed or the login wall
    try {
      await Promise.race([
        page.waitForSelector('.share-box-feed-entry__trigger, button.share-mbw-trigger', { timeout: 10000 }),
        page.waitForSelector('form.login__form, input#username, button[type="submit"]', { timeout: 10000 })
      ]);
    } catch (e) {
      console.log('Navigation settled but no clear state detected. Proceeding...');
    }

    // Check if logged in - look for login forms or sign-in buttons
    const loginWallVisible = await page.$('form.login__form, input#username, a.nav__button-secondary, button.sign-in-form__submit-button, [data-tracking-control-name="guest_homepage-basic_nav-header-signin"]');
    if (loginWallVisible) {
      console.log('Login button detected - session might be invalid.');
      if (!headful) {
        await page.screenshot({ path: 'debug_not_logged_in.png' });
        await browser.close();
        const errorMsg = `[LINKEDIN_ERROR_V2] Not logged in. (headful=${headful}). Please run in headful mode to log in first.`;
        throw new Error(errorMsg);
      } else {
        console.log('Please log in manually in the browser window...');
        // Wait for user to log in - we'll wait for the "Start a post" button to appear
        const startPostSelector = 'button.share-mbw-trigger, button:has-text("Start a post"), div.share-box-feed-entry__trigger, .share-box-feed-entry__trigger, [data-control-name="share_trigger"]';
        await page.waitForSelector(startPostSelector, { timeout: 0 });
        console.log('Logged in successfully!');
      }
    }

    console.log('Starting a new post...');
    const startPostSelector = 'button.share-mbw-trigger, button:has-text("Start a post"), div.share-box-feed-entry__trigger, .share-box-feed-entry__trigger, [data-control-name="share_trigger"]';

    try {
      await page.waitForSelector(startPostSelector, { timeout: 15000 });
      await page.click(startPostSelector);
    } catch (e) {
      console.error('Failed to find "Start a post" button. Saving screenshot...');
      await page.screenshot({ path: 'debug_timeout.png', fullPage: true });
      throw new Error(`Timeout waiting for post button. Screenshot saved as debug_timeout.png. Selectors tried: ${startPostSelector}`);
    }

    console.log('Waiting for post editor...');
    await page.waitForSelector('div.ql-editor', { timeout: 15000 });

    console.log('Typing post content...');
    await page.fill('div.ql-editor', text);

    console.log('Clicking post button...');
    await page.click('button.share-actions__primary-action');

    // Wait for success message or for the editor to disappear
    await page.waitForSelector('div.ql-editor', { state: 'detached', timeout: 30000 });
    console.log('Post published successfully!');

    return { success: true };
  } catch (error) {
    console.error('Error during LinkedIn post:', error);
    if (page && !page.isClosed()) {
      await page.screenshot({ path: 'debug_final_error.png' }).catch(() => { });
    }
    return { success: false, error: error.message };
  } finally {
    if (!headful) {
      await browser.close();
    }
  }
}

// Support command line execution
if (require.main === module) {
  console.log('--- CLI DEBUG ---');
  console.log('Full process.argv:', JSON.stringify(process.argv));

  const headful = process.argv.some(arg => arg.toLowerCase().includes('headful'));
  console.log('Detected headful flag:', headful);

  const textArg = process.argv[2];
  const text = (textArg && !textArg.startsWith('--')) ? textArg : 'Hello from automated script!';
  console.log('Extracted text:', text);
  console.log('-----------------');

  postToLinkedIn(text, headful);
}

module.exports = { postToLinkedIn };
