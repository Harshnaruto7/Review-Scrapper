import puppeteer from 'puppeteer';
import fs from 'fs';

export async function scrapeTrustRadius(company = 'notion') {
  console.log(`Scraping TrustRadius (${company})...`);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // perform like real browser to prevent bot detection
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  );

  const url = `https://www.trustradius.com/products/${company}/reviews`;
  console.log(`Navigating to: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    // Handle cookie consent if needed
    try {
      await page.waitForSelector('button#truste-consent-button', { timeout: 3000 });
      await page.click('button#truste-consent-button');
      await page.waitForTimeout(1000);
    } catch {}

    // Scroll the page to help with lazy-loading
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });

    // Save debug info
    await page.screenshot({ path: 'debug/trustradius_debug_main.png', fullPage: true });
    const html = await page.content();
    fs.writeFileSync('debug/trustradius_debug_main.html', html);

    const articleSelector = 'article[class*="ReviewNew_article"]';

    let reviewCards = [];
    try {
      await page.waitForSelector(articleSelector, { timeout: 15000 });
      reviewCards = await page.$$(articleSelector);
    } catch {
      console.log('No review articles found in main page DOM.');
    }

    let reviews = [];

    // Extract review fields
    function extractReviewFields(articles) {
      return articles.map((card) => {
        const author = card.querySelector('.Byline_name__csm_H')?.innerText.trim() || 'Anonymous';
        const title = card.querySelector('h5 > a')?.innerText.trim() || '';
        const date = card.querySelector('.Header_date__bW46N')?.innerText.trim() || '';
        // Use ALL classes for the review text container
        const textEl = card.querySelector(
          '.ReviewAnswer_longForm__wwyHy.question-text.Typography_typography__4kcAN',
        );
        const text = textEl ? textEl.innerText.trim() : '';
        return { author, title, date, text };
      });
    }

    if (reviewCards.length === 0) {
      // Try in iframes for more reviews
      let found = false;
      for (const frame of page.frames()) {
        try {
          await frame.waitForSelector(articleSelector, { timeout: 5000 });
          reviews = await frame.$$eval(articleSelector, extractReviewFields);
          found = true;
          break;
        } catch {}
      }
      if (!found) {
        console.log('No review articles found in any iframes either.');
      }
    } else {
      reviews = await page.$$eval(articleSelector, extractReviewFields);
    }

    await browser.close();

    if (!fs.existsSync('data')) fs.mkdirSync('data');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `data/${company}_trustradius_reviews_${timestamp}.json`;
    fs.writeFileSync(fileName, JSON.stringify(reviews, null, 2));
    console.log(`* TrustRadius reviews saved to ${fileName}`);

    return reviews;
  } catch (error) {
    console.error('Failed to scrape TrustRadius:', error);
    await browser.close();
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const reviews = await scrapeTrustRadius('notion');
    console.log('Reviews:', reviews);
  })();
}
