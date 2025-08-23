import { scrapeCapterra } from './src/scrapers/capterra.js';
import { scrapeTrustRadius } from './src/scrapers/trustradius.js';
import { scrapeG2 } from './src/scrapers/g2.js';
import {
  filterReviewsFromDate,
  saveFilteredReviews,
  logReviewsSummary,
  sortReviewsByDateAscending,
} from './utils/filter.js';

// adding company name and the date for the review 
(async () => {
  const company = 'notion';
  const cutoffDate = '2025-01-01';

  // scraping from each source
  const capterraReviews = await scrapeCapterra(company);
  const trustRadiusReviews = await scrapeTrustRadius(company);
  const g2Reviews = await scrapeG2(company);

  // Process each source
  for (const [source, reviews] of [
    ['capterra', capterraReviews],
    ['trustradius', trustRadiusReviews],
    ['g2', g2Reviews],
  ]) {
    const filtered = sortReviewsByDateAscending(filterReviewsFromDate(reviews, cutoffDate));
    saveFilteredReviews(source, company, filtered);
    logReviewsSummary(source, filtered);
  }

  console.log('🎉 All reviews scraped, filtered, sorted, and saved.');
})();
