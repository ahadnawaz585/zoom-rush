import puppeteer from 'puppeteer';

export async function runMultipleBots(
  quantity: number,
  meetingId: string,
  password: string,
  duration: number, // Duration in seconds
  botNames: string[],
  onStatusUpdate: (botId: number, status: string) => void = (botId, status) =>
    console.log(`Bot ${botId} status updated: ${status}`)
) {
  console.log(`Starting ${quantity} bots for meeting ${meetingId}`);

  if (botNames.length !== Number(quantity)) {
    throw new Error('Number of bot names must match quantity');
  }

  const browser = await puppeteer.launch({
    headless: true, // Use 'new' for modern headless mode
    // Uncomment if needed: executablePath: 'C:\\Users\\AHAD\\.cache\\puppeteer\\chrome\\win64-127.0.6533.88\\chrome-win64\\chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--window-size=800,600',
      '--disable-background-timer-throttling', // Keep bots active
      '--disable-renderer-backgrounding',
    ],
    timeout: 10000, // Faster launch timeout
  });

  const bots = Array.from({ length: quantity }, (_, i) => i + 1);
  const botPromises = bots.map(async (botId) => {
    let page;
    try {
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Initializing...`);
      onStatusUpdate(botId, 'Initializing');

      page = await browser.newPage();

      // Optimize resource usage
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Speed up navigation
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Navigating to Zoom URL`);
      await page.goto(`https://zoom.us/wc/join/${meetingId}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000, // Reduced from 15s
      });

      // Step 1: Enter Passcode
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Entering passcode`);
      await page.waitForSelector('#input-for-pwd', { timeout: 3000 });
      await page.type('#input-for-pwd', password, { delay: 0 });

      // Step 2: Enter Name
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Entering name`);
      await page.waitForSelector('#input-for-name', { timeout: 3000 });
      await page.type('#input-for-name', botNames[botId - 1], { delay: 0 });

      // Step 3: Click Join Button
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Clicking join button`);
      await page.waitForSelector('.preview-join-button', { timeout: 3000 });
      await page.click('.preview-join-button'); // Simplified, Zoom enables it automatically

      // Step 4: Wait for Meeting to Load
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Waiting for meeting`);
      try {
        await page.waitForSelector('.join-audio-container', { timeout: 8000 });
      } catch (e) {
        console.log(`Bot ${botId} (${botNames[botId - 1]}): Fallback - checking meeting`);
        await page.waitForSelector('body', { timeout: 3000 });
      }
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Connected`);
      onStatusUpdate(botId, 'Connected');

      // Stay in the meeting
      const startTime = Date.now();
      await new Promise((resolve) => setTimeout(resolve, duration * 1000));
      const elapsedTime = (Date.now() - startTime) / 1000;
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Stayed for ${elapsedTime.toFixed(2)} seconds`);

      await page.close();
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Disconnected`);
      onStatusUpdate(botId, 'Disconnected');
    } catch (error: any) {
      console.error(`Bot ${botId} (${botNames[botId - 1]}): Error - ${error.message}`);
      onStatusUpdate(botId, `Error: ${error.message}`);
      if (page) await page.close();
    }
  });

  await Promise.all(botPromises);
  await browser.close();
  console.log('All bots have completed their tasks');
}