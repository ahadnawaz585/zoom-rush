

```typescript
// bot.ts
import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';

// Static Configuration
const BOT_CONFIG = {
  meetingId: '123456789', // Replace with your meeting ID
  password: 'yourpassword', // Replace with your password
  duration: 60, // Duration in seconds
  botNames: ['Bot1', 'Bot2', 'Bot3'], // Static bot names
  quantity: 3, // Number of bots
};

// Status update callback type
type StatusCallback = (botId: number, status: string) => void;

// Bot instance class
class ZoomBot {
  private browser: Browser | null = null;
  private pages: Map<number, Page> = new Map();

  constructor(private config = BOT_CONFIG) {}

  // Launch browser with optimized settings
  private async launchBrowser(): Promise<Browser> {
    const launchOptions: PuppeteerLaunchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--window-size=800,600',
        '--no-zygote',
        '--single-process',
      ],
      pipe: true,
      defaultViewport: { width: 800, height: 600 },
    };

    return await puppeteer.launch(launchOptions);
  }

  // Optimize page settings
  private async optimizePage(page: Page): Promise<void> {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media', 'script'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.setCacheEnabled(false);
  }

  // Join meeting logic
  private async joinMeeting(
    page: Page,
    botId: number,
    botName: string,
    onStatusUpdate: StatusCallback
  ): Promise<void> {
    const { meetingId, password } = this.config;
    const meetingUrl = `https://zoom.us/wc/join/${meetingId}`;

    try {
      onStatusUpdate(botId, 'Navigating');
      await page.goto(meetingUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

      // Enter password
      await page.waitForSelector('#input-for-pwd', { timeout: 5000 });
      await page.type('#input-for-pwd', password);

      // Enter name
      await page.waitForSelector('#input-for-name', { timeout: 5000 });
      await page.type('#input-for-name', botName);

      // Join meeting
      await page.waitForSelector('.preview-join-button', { timeout: 5000 });
      await page.evaluate(() => {
        const joinButton = document.querySelector('.preview-join-button') as HTMLElement;
        joinButton?.click();
      });

      // Wait for meeting to load
      await page.waitForSelector('.join-audio-container', { timeout: 15000 });
      onStatusUpdate(botId, 'Connected');
    } catch (error) {
      throw error;
    }
  }

  // Run single bot
  private async runBot(botId: number, onStatusUpdate: StatusCallback): Promise<void> {
    if (!this.browser) return;

    const botName = this.config.botNames[botId - 1] || `Bot${botId}`;
    let page: Page | null = null;

    try {
      onStatusUpdate(botId, 'Initializing');
      page = await this.browser.newPage();
      this.pages.set(botId, page);

      await this.optimizePage(page);
      await this.joinMeeting(page, botId, botName, onStatusUpdate);

      // Stay for specified duration
      await new Promise((resolve) => setTimeout(resolve, this.config.duration * 1000));

      onStatusUpdate(botId, 'Disconnecting');
      await page.close();
      this.pages.delete(botId);
      onStatusUpdate(botId, 'Disconnected');
    } catch (error) {
      const err = error as Error;
      onStatusUpdate(botId, `Error: ${err.message}`);
      if (page) {
        await page.close();
        this.pages.delete(botId);
      }
    }
  }

  // Main execution method
  async execute(onStatusUpdate: StatusCallback): Promise<void> {
    try {
      this.browser = await this.launchBrowser();
      console.log(`Starting ${this.config.quantity} bots for meeting ${this.config.meetingId}`);

      const botPromises = Array.from(
        { length: Math.min(this.config.quantity, this.config.botNames.length) },
        (_, i) => this.runBot(i + 1, onStatusUpdate)
      );

      await Promise.all(botPromises);
    } catch (error) {
      console.error('Browser launch failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      console.log('All bots completed');
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    for (const [botId, page] of this.pages) {
      await page.close();
      this.pages.delete(botId);
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Express server
import express from 'express';

const app = express();

app.get('/start-bots', async (req, res) => {
  const bot = new ZoomBot();

  const statusUpdates: Record<number, string> = {};
  const updateStatus = (botId: number, status: string) => {
    statusUpdates[botId] = status;
    console.log(`Bot ${botId} (${BOT_CONFIG.botNames[botId - 1]}): ${status}`);
  };

  try {
    await bot.execute(updateStatus);
    res.json({ message: 'Bots completed', statusUpdates });
  } catch (error) {
    await bot.cleanup();
    res.status(500).json({ error: 'Bot execution failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Key Changes:
1. Removed all query parameter handling
2. Added static `BOT_CONFIG` object with predefined values
3. The bot now uses these static values automatically when the endpoint is hit
4. Simplified the GET endpoint to immediately start the bots with the static configuration

### How to Use:

1. **Install dependencies:**
```bash
npm init -y
npm install typescript puppeteer express @types/express @types/puppeteer
npx tsc --init
```

2. **Configure tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true
  }
}
```

3. **Update the static configuration:**
Before running, edit the `BOT_CONFIG` object in the code:
```typescript
const BOT_CONFIG = {
  meetingId: 'YOUR_MEETING_ID_HERE',
  password: 'YOUR_PASSWORD_HERE',
  duration: 60, // Duration in seconds
  botNames: ['Bot1', 'Bot2', 'Bot3'],
  quantity: 3,
};
```

4. **Run:**
```bash
npx tsc
node dist/bot.js
```

5. **Trigger the bots:**
Simply visit:
```
http://localhost:3000/start-bots
```
or use any HTTP client to make a GET request to that URL.

### Notes:
- The bots will use the static configuration every time the endpoint is hit
- Replace `'123456789'` and `'yourpassword'` with your actual Zoom meeting credentials
- Adjust `duration`, `botNames`, and `quantity` as needed in the `BOT_CONFIG`
- All optimizations from previous versions are preserved
- The server will respond with a JSON object containing the status updates once all bots complete

This version will automatically start joining the Zoom meeting with the predefined settings whenever you access the `/start-bots` endpoint, no parameters needed!