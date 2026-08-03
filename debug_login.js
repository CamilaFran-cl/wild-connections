const puppeteer = require('puppeteer');

async function runTest() {
  console.log("Starting Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url());
  });

  try {
    console.log("Navigating to Login...");
    await page.goto('https://wild-connections.vercel.app/login.html', { waitUntil: 'networkidle0' });
    
    // Take screenshot
    await page.screenshot({ path: 'login_debug.png' });
    console.log("Screenshot saved as login_debug.png");
    
    const html = await page.content();
    console.log("HTML length:", html.length);
    if (html.includes('login-card')) {
        console.log("login-card found in HTML.");
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
    console.log("Test finished.");
  }
}

runTest();
