import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import fs from 'fs';
import { URL } from 'url';

const targetUrls = [
  'http://localhost:3000/',
  'http://localhost:3000/marketing',
  'http://localhost:3000/bakery-loyalty',
  'http://localhost:3000/features/whatsapp-stamp-card'
];

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port
  };

  const results = {};

  for (const target of targetUrls) {
    console.log(`Running Lighthouse for: ${target}`);
    const runnerResult = await lighthouse(target, options);
    const scores = {
      performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
      accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
      seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
    };

    const audits = runnerResult.lhr.audits;
    const webVitals = {
      LCP: audits['largest-contentful-paint']?.displayValue,
      CLS: audits['cumulative-layout-shift']?.displayValue,
      TTFB: audits['server-response-time']?.displayValue
    };

    results[target] = { scores, webVitals };
    console.log(`Scores for ${target}:`, scores);
    console.log(`Web Vitals for ${target}:`, webVitals);
  }

  await chrome.kill();

  fs.writeFileSync('lighthouse-report.json', JSON.stringify(results, null, 2));
  console.log("Lighthouse report generated: lighthouse-report.json");
}

runLighthouse().catch(console.error);
