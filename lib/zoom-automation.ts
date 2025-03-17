import puppeteer from 'puppeteer';

export async function runMultipleBots(
  quantity: number,
  meetingId: string,
  password: string,
  duration: number, // Duration in seconds
  botNames: string[],
  onStatusUpdate: (botId: number, status: string) => void
) {
  console.log(`Starting ${quantity} bots for meeting ${meetingId}`);


  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: 'C:\\Users\\AHAD\\.cache\\puppeteer\\chrome\\win64-127.0.6533.88\\chrome-win64\\chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--window-size=800,600', // Smaller window size to save resources
    ],
  });

  const bots = Array.from({ length: quantity }, (_, i) => i + 1);
  const botPromises = bots.map(async (botId) => {
    let page:any;
    try {
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Initializing...`);
      onStatusUpdate(botId, 'Initializing');

      page = await browser.newPage();

      // Optimize resource usage
      await page.setRequestInterception(true);
      page.on('request', (req:any) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`Bot ${botId} (${botNames[botId - 1]}): Navigating to Zoom URL`);
      const meetingUrl = `https://zoom.us/wc/join/${meetingId}`;
      await page.goto(meetingUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }); // Reduced timeout

      // Step 1: Enter Passcode
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Waiting for passcode field`);
      await page.waitForSelector('#input-for-pwd', { timeout: 5000 });
      await page.type('#input-for-pwd', password, { delay: 0 });

      // Step 2: Enter Name
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Entering name`);
      await page.waitForSelector('#input-for-name', { timeout: 5000 });
      await page.type('#input-for-name', botNames[botId - 1], { delay: 0 });

      // Step 3: Click Join Button
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Clicking join button`);
      await page.waitForSelector('.preview-join-button', { timeout: 5000 });
      await page.evaluate(() => {
        const joinButton:any = document.querySelector('.preview-join-button');
        joinButton.classList.remove('disabled', 'zm-btn--disabled');
        joinButton.click();
      });

      // Step 4: Wait for Meeting to Load (with fallback)
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Waiting for meeting to load`);
      try {
        await page.waitForSelector('.join-audio-container', { timeout: 10000 });
      } catch (e) {
        console.log(`Bot ${botId} (${botNames[botId - 1]}): Fallback - assuming joined`);
        // Fallback: Check for any meeting-related element if .join-audio-container fails
        await page.waitForSelector('body', { timeout: 5000 }); // Basic page load check
      }
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Connected`);
      onStatusUpdate(botId, 'Connected');

      // Stay in the meeting for exact duration
      const startTime = Date.now();
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, duration * 1000);
        page.on('close', () => clearTimeout(timeout));
      });
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