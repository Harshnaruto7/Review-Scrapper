import puppeteer from 'puppeteer';
import fs from 'fs';

export async function scrapeCapterra(company = 'Notion') {
  console.log(`Scraping Capterra (${company})...`);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = `https://www.capterra.com/p/186596/${company}/reviews/`;
  console.log(`Navigating to: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
  } catch (error) {
    console.error(`Failed to navigate to ${url}:`, error);
    await browser.close();
    throw error;
  }

  // Scroll to load dynamic content
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

  // Wait for reviews container
  await page.waitForSelector('[data-test-id="review-cards-container"]', { timeout: 10000 });

  // Extract reviews
  const reviews = await page.$$eval('[data-test-id="review-cards-container"] > div', (cards) =>
    cards.map((card) => {
      // Title
      const titleEl = card.querySelector('h3');

      // Review text
      const textEl = card.querySelector('div.space-y-6');

      // Author extraction
      let author = '';
      const authorContainer = card.querySelector('div.typo-10.text-neutral-90.w-full');
      if (authorContainer) {
        const authorSpan = authorContainer.querySelector(
          'span.typo-20.text-neutral-99.font-semibold',
        );
        author = authorSpan ? authorSpan.innerText.trim() : '';
      }
      if (!author) author = 'Anonymous';

      // Rating extraction
      const ratingContainer = card.querySelector('div[data-testid="rating"]');
      let rating = '';
      if (ratingContainer) {
        const spanTexts = Array.from(ratingContainer.querySelectorAll('span'))
          .map((s) => s.innerText.trim())
          .filter((text) => /\d+(\.\d+)?/.test(text));
        rating = spanTexts.length > 0 ? spanTexts[0] : '';
      }

      // Date extraction
      let date = '';
      const dateEl = card.querySelector('div.typo-0.text-neutral-90');
      if (dateEl) {
        date = dateEl.innerText.trim();
      }

      const title = titleEl?.innerText.trim() || '';
      const text = textEl?.innerText.trim() || '';

      return { title, text, author, rating, date };
    }),
  );

  await browser.close();

  // Ensure 'data' directory exists
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }

  // Generate versioned filename
  function getNextFileName(baseName) {
    let counter = 1;
    let fileName = `data/${baseName}_${counter}.json`;

    while (fs.existsSync(fileName)) {
      counter++;
      fileName = `data/${baseName}_${counter}.json`;
    }

    return fileName;
  }

  const baseName = `${company}_capterra_reviews`;
  const fileName = getNextFileName(baseName);

  // Save to JSON file
  fs.writeFileSync(fileName, JSON.stringify(reviews, null, 2));
  console.log(` Capterra Reviews saved to ${fileName}`);

  return reviews;
}

// Run standalone if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const reviews = await scrapeCapterra('Notion');
    console.log('Reviews for Notion:', reviews);
  })();
}
