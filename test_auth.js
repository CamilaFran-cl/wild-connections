const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

async function runTest() {
  console.log("Starting Vite dev server...");
  const viteProcess = spawn('npx', ['vite', '--port', '3000'], { shell: true, stdio: 'pipe' });

  // Wait a bit for vite to start
  await new Promise(r => setTimeout(r, 5000));

  console.log("Starting Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText, request.response()?.status());
  });

  try {
    // 1. Test Login with the user they mentioned
    console.log("Navigating to Login...");
    await page.goto('http://localhost:3000/login.html');
    
    // Wait for form
    await page.waitForSelector('#email');
    await page.type('#email', '777caceres.fer@gmail.com');
    // We don't have their password, but if they get an error about wrong password, it means Supabase is CONNECTED.
    // The previous error was "Supabase no esta configurado". If we don't get that, it's a huge win!
    await page.type('#password', 'wrongpassword123');
    await page.click('#login-btn');
    
    // Wait for alert
    const dialogMsg = await new Promise(resolve => {
        page.on('dialog', async dialog => {
            const msg = dialog.message();
            await dialog.dismiss();
            resolve(msg);
        });
        // Timeout in case no dialog appears
        setTimeout(() => resolve("NO_DIALOG"), 10000);
    });

    console.log("Alert received:", dialogMsg);
    
    if (dialogMsg.includes("Supabase no está configurado") || dialogMsg.includes("Error técnico")) {
        throw new Error("Supabase is still not configured correctly! Error: " + dialogMsg);
    } else if (dialogMsg.includes("Correo electrónico o contraseña incorrectos")) {
        console.log("SUCCESS! Supabase is correctly communicating with the server!");
    } else {
        console.log("Unexpected dialog:", dialogMsg);
    }

  } catch (error) {
    console.error("Test failed:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    viteProcess.kill();
    console.log("Test finished.");
  }
}

runTest();
