import { scrapeCapterra } from './src/scrapers/capterra.js';

(async () => {
  const company = 'Notion'; // Change this to other company slugs like 'Zoom', 'Salesforce-CRM', etc.
  try {
    const reviews = await scrapeCapterra(company);
    console.log(`\nReviews for ${company}:`, reviews);
  } catch (error) {
    console.error('Failed to scrape Capterra reviews:', error);
  }
})();
