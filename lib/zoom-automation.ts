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
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--window-size=800,600',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
    ],
    timeout: 10000,
  });

  const bots = Array.from({ length: quantity }, (_, i) => i + 1);
  const botPromises = bots.map(async (botId) => {
    let page;
    try {
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Initializing...`);
      onStatusUpdate(botId, 'Initializing');

      page = await browser.newPage();

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`Bot ${botId} (${botNames[botId - 1]}): Navigating to Zoom URL`);
      onStatusUpdate(botId, 'Joining');
      await page.goto(`https://zoom.us/wc/join/${meetingId}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      console.log(`Bot ${botId} (${botNames[botId - 1]}): Entering passcode`);
      await page.waitForSelector('#input-for-pwd', { timeout: 3000 });
      await page.type('#input-for-pwd', password, { delay: 0 });

      console.log(`Bot ${botId} (${botNames[botId - 1]}): Entering name`);
      await page.waitForSelector('#input-for-name', { timeout: 3000 });
      await page.type('#input-for-name', botNames[botId - 1], { delay: 0 });

      console.log(`Bot ${botId} (${botNames[botId - 1]}): Clicking join button`);
      await page.waitForSelector('.preview-join-button', { timeout: 3000 });
      await page.click('.preview-join-button');

      console.log(`Bot ${botId} (${botNames[botId - 1]}): Waiting for meeting`);
      try {
        await page.waitForSelector('.join-audio-container', { timeout: 8000 });
      } catch (e) {
        console.log(`Bot ${botId} (${botNames[botId - 1]}): Fallback - checking meeting`);
        await page.waitForSelector('body', { timeout: 3000 });
      }
      console.log(`Bot ${botId} (${botNames[botId - 1]}): Connected`);
      onStatusUpdate(botId, 'Connected');

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