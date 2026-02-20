const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const userDataDir = path.join(process.cwd(), 'linkedin_session');

async function postToLinkedIn(text, options = {}) {
  const { headful = false, mediaPath = null, mediaType = null, isArticle = false } = options;
  console.log(`>>> EXECUTION START: headful=${headful}, isArticle=${isArticle}, media=${mediaPath}`);

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

    // Check if logged in
    const loginWallVisible = await page.$('form.login__form, input#username, a.nav__button-secondary, button.sign-in-form__submit-button');
    if (loginWallVisible) {
      if (!headful) {
        await page.screenshot({ path: 'debug_not_logged_in.png' });
        await browser.close();
        throw new Error(`[LINKEDIN_ERROR_V2] Not logged in. Please run in headful mode.`);
      } else {
        console.log('Please log in manually...');
        const startPostSelector = 'button.share-mbw-trigger, button:has-text("Start a post"), .share-box-feed-entry__trigger';
        await page.waitForSelector(startPostSelector, { timeout: 0 });
        console.log('Logged in!');
      }
    }

    if (isArticle) {
      console.log('Transitioning to Article mode...');
      const writeArticleSelector = 'a[href*="/article/new/"], button:has-text("Write article")';
      await page.waitForSelector(writeArticleSelector, { timeout: 10000 });
      await page.click(writeArticleSelector);

      await page.waitForSelector('.ql-editor', { timeout: 30000 });
      console.log('Filling article body...');
      await page.fill('.ql-editor', text);
      console.log('Article draft ready. Manual publication required for now.');
    } else {
      console.log('Opening share box...');
      const startPostSelector = 'button.share-mbw-trigger, button:has-text("Start a post"), .share-box-feed-entry__trigger';
      await page.waitForSelector(startPostSelector, { timeout: 15000 });
      await page.click(startPostSelector);

      await page.waitForSelector('div.ql-editor', { timeout: 15000 });

      if (mediaPath && fs.existsSync(mediaPath)) {
        console.log(`Uploading ${mediaType}: ${mediaPath}`);
        const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
        await fileInput.setInputFiles(mediaPath);
        await page.waitForTimeout(3000); // Wait for upload
      }

      console.log('Entering text...');
      await page.fill('div.ql-editor', text);

      console.log('Publishing...');
      await page.click('button.share-actions__primary-action');
      await page.waitForSelector('div.ql-editor', { state: 'detached', timeout: 30000 });
      console.log('Post successful!');
    }

    return { success: true };
  } catch (error) {
    console.error('LinkedIn Error:', error);
    if (!page.isClosed()) await page.screenshot({ path: 'debug_error.png' }).catch(() => { });
    return { success: false, error: error.message };
  } finally {
    if (!headful) await browser.close();
  }
}

if (require.main === module) {
  const headful = process.argv.some(arg => arg.toLowerCase().includes('headful'));
  const isArticle = process.argv.some(arg => arg.toLowerCase().includes('article'));
  const mediaPath = process.argv.find(arg => arg.startsWith('--media='))?.split('=')[1];
  const mediaType = process.argv.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'image';

  const textArg = process.argv[2];
  const text = (textArg && !textArg.startsWith('--')) ? textArg : 'Automated post from Social-Ignite';

  postToLinkedIn(text, { headful, isArticle, mediaPath, mediaType });
}

module.exports = { postToLinkedIn };
