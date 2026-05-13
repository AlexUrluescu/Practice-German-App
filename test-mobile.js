const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  
  await page.goto('http://localhost:3001');
  await page.screenshot({ path: 'mobile-home.png' });
  
  await page.goto('http://localhost:3001/vocabulary');
  await page.screenshot({ path: 'mobile-vocab.png' });
  
  await page.goto('http://localhost:3001/verbs');
  await page.screenshot({ path: 'mobile-verbs.png' });
  
  await page.goto('http://localhost:3001/profile');
  await page.screenshot({ path: 'mobile-profile.png' });
  
  await browser.close();
})();
