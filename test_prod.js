const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');

async function runTest() {
  console.log("Starting static server on dist...");
  const serveProcess = spawn('npx', ['vite', 'preview', '--port', '3000'], { shell: true, stdio: 'pipe' });

  // Wait for server to start
  await new Promise(r => setTimeout(r, 3000));

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
    await page.goto('http://localhost:3000/login.html');
    
    await page.waitForSelector('#email');
    await page.type('#email', '777caceres.fer@gmail.com');
    await page.type('#password', 'wrongpassword123');
    
    console.log("Clicking login...");
    await page.click('#login-btn');
    
    const dialogMsg = await new Promise(resolve => {
        page.on('dialog', async dialog => {
            const msg = dialog.message();
            await dialog.dismiss();
            resolve(msg);
        });
        setTimeout(() => resolve("NO_DIALOG"), 5000);
    });

    console.log("Alert received:", dialogMsg);
    
    if (dialogMsg.includes("Correo electrónico o contraseña incorrectos")) {
        console.log("SUCCESS! Supabase is correctly communicating with the server!");
    } else {
        throw new Error("Unexpected dialog: " + dialogMsg);
    }

  } catch (error) {
    console.error("Test failed:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    serveProcess.kill();
    console.log("Test finished.");
  }
}

runTest();
