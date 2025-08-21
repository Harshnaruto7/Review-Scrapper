// src/scrapers/g2.js
import puppeteer from 'puppeteer';
import fs from 'fs';

// Helper delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function scrapeG2(company = 'zoom') {
  console.log(`Scraping G2 (${company})...`);

  const browser = await puppeteer.launch({
    headless: false, // headful to look human
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set a real user-agent to bypass bot detection
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  );

  await page.goto(`https://www.g2.com/products/${company}/reviews`, {
    waitUntil: 'networkidle2',
  });

  // Wait for review container
  await page.waitForSelector('article', { timeout: 10000 }).catch(() => {
    console.log('Reviews not found!');
  });

  // Human-like scrolling
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let totalHeight = 0;
    const distance = 500;
    while (totalHeight < document.body.scrollHeight) {
      window.scrollBy(0, distance);
      totalHeight += distance;
      await delay(1000 + Math.random() * 500); // random delay
    }
  });

  // Extra wait to ensure JS-loaded content appears
  await delay(3000);

  // Save debug screenshot + HTML
  await page.screenshot({ path: 'g2_debug.png', fullPage: true });
  const html = await page.content();
  fs.writeFileSync('g2_debug.html', html);

  // Extract reviews
  const reviews = await page.$$eval('article', (cards) =>
    cards.slice(0, 5).map((card) => {
      const title = card.querySelector('[itemprop="name"] div')?.innerText.trim() || '';
      const text = card.querySelector('[itemprop="reviewBody"]')?.innerText.trim() || '';
      const rating =
        card.querySelector('[itemprop="reviewRating"]')?.getAttribute('aria-label') || '';
      const author = card.querySelector('.reviewer-name')?.innerText.trim() || '';
      return { title, text, rating, author };
    }),
  );

  await browser.close();
  console.log('✅ G2 Reviews:', reviews);
  return reviews;
}

// Quick test run
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await scrapeG2('zoom');
  })();
}
