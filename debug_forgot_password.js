const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function runTest() {
    console.log('Starting Puppeteer...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Listen to console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to Forgot Password...');
    await page.goto('https://wild-connections.vercel.app/forgot-password.html', { waitUntil: 'networkidle0' });

    // Type a dummy email (we just want to see if the network request fails or succeeds)
    console.log('Typing email...');
    await page.type('#email', 'test@example.com');
    
    console.log('Clicking submit...');
    await page.click('#submit-btn');
    
    // Wait for the response
    console.log('Waiting for network/UI changes...');
    await new Promise(r => setTimeout(r, 3000));
    
    // Check if success message is visible
    const successVisible = await page.evaluate(() => {
        const el = document.getElementById('success-message');
        return el ? window.getComputedStyle(el).display !== 'none' : false;
    });
    
    const errorVisible = await page.evaluate(() => {
        const el = document.getElementById('error-message');
        if (el && window.getComputedStyle(el).display !== 'none') return el.textContent;
        return false;
    });

    console.log('Success message visible?', successVisible);
    console.log('Error message visible?', errorVisible);

    await browser.close();
    console.log('Test finished.');
}

runTest().catch(console.error);
