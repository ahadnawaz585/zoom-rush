import { NextRequest, NextResponse } from "next/server";
import { chromium, firefox } from "playwright"; // Removed webkit
import { Worker } from "worker_threads";
import { KJUR } from 'jsrsasign';
import { setPriority } from 'os';

interface Bot {
  id: number;
  name: string;
  status: string;
  country?: string;
  countryCode?: string;
  flag?: string;
}

interface JoinRequest {
  bots: Bot[];
  meetingId: string;
  password: string;
  botCount?: number;
  duration?: number;
}

interface Task {
  botPair: Bot[];
  meetingId: string;
  password: string;
  origin: string;
  signature: string;
  browserType: 'chromium' | 'firefox' | 'chromium2';
}

interface WorkerResult {
  success: boolean;
  botId: number;
  error?: string;
  browser: 'chromium' | 'firefox' | 'chromium2';
}

const signatureCache = new Map<string, { signature: string; expires: number }>();
const generateSignature = (
  meetingNumber: string,
  role: number = 0,
  duration: number = 60 
): string => {
  console.log(`[${new Date().toISOString()}] Generating signature for meeting ${meetingNumber}`);
  const cacheKey = `${meetingNumber}-${role}-${duration}`;
  const now = Date.now() / 1000;

  const iat = Math.round(now) - 30;
  const exp = iat + duration * 60;

  const cached = signatureCache.get(cacheKey);
  if (cached && cached.expires > now) return cached.signature;

  const { NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY, NEXT_PUBLIC_ZOOM_MEETING_SDK_SECRET } = process.env;
  if (!NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || !NEXT_PUBLIC_ZOOM_MEETING_SDK_SECRET) {
    console.error(`[${new Date().toISOString()}] Zoom SDK credentials missing`);
    throw new Error('Zoom SDK credentials not configured');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    appKey: NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
    sdkKey: NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  };

  const signature = KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), NEXT_PUBLIC_ZOOM_MEETING_SDK_SECRET);
  signatureCache.set(cacheKey, { signature, expires: exp });
  console.log(`[${new Date().toISOString()}] New signature generated for ${meetingNumber} with expiry in ${duration} minutes`);
  return signature;
};

const generateBots = (count: number, existingBots: Bot[]): Bot[] => {
  console.log(`[${new Date().toISOString()}] Generating ${count} new bots`);
  const newBots: Bot[] = [];
  const maxId = existingBots.length ? Math.max(...existingBots.map(b => b.id)) : 0;

  for (let i = 1; i <= count; i++) {
    newBots.push({ id: maxId + i, name: `Bot${maxId + i}`, status: 'ready' });
  }
  console.log(`[${new Date().toISOString()}] Generated ${newBots.length} bots`);
  return newBots;
};

const workerScript = `
  const { parentPort, workerData } = require('worker_threads');
  const { chromium, firefox } = require('playwright');
  const { setPriority } = require('os');

  const browserEngines = { 
    chromium, 
    firefox, 
    chromium2: chromium 
  };

  const joinMeetingPair = async ({ botPair, meetingId, password, origin, signature, browserType }) => {
    setPriority(19);
    console.log(\`[${new Date().toISOString()}] Worker starting for bots \${botPair.map(b => b.name).join(', ')} with \${browserType}\`);
    const browserEngine = browserEngines[browserType];
    let browser;

    try {
      const context = await browserEngine.launchPersistentContext('', { 
        headless: true, 
        args: browserType.includes('chromium') ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] : [],
        timeout: 10000
      });
      browser = context.browser();
      console.log(\`[${new Date().toISOString()}] \${browserType} launched for bots \${botPair.map(b => b.name).join(', ')}\`);

      const results = [];
      const pages = await Promise.all(botPair.map(() => context.newPage()));

      await Promise.all(botPair.map(async (bot, index) => {
        const page = pages[index];
        console.log(\`[${new Date().toISOString()}] \${browserType} attempting to join with bot \${bot.name}\`);
        
        const url = \`\${origin}/meeting?username=\${encodeURIComponent(bot.name)}&meetingId=\${encodeURIComponent(meetingId)}&password=\${encodeURIComponent(password)}&signature=\${encodeURIComponent(signature)}\`;
        
        try {
          const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          if (!response || response.status() >= 400) throw new Error('Navigation failed: Status ' + response?.status());

          await Promise.race([
            page.waitForSelector("#meeting-joined-indicator", { timeout: 15000 }),
            page.waitForSelector(".join-error", { timeout: 15000 }).then(() => {
              throw new Error('Meeting join error detected');
            })
          ]);

          console.log(\`[${new Date().toISOString()}] \${browserType} bot \${bot.name} joined successfully\`);
          results.push({ success: true, botId: bot.id, browser: browserType });
        } catch (error) {
          console.error(\`[${new Date().toISOString()}] \${browserType} bot \${bot.name} failed: \${error.message}\`);
          results.push({ success: false, botId: bot.id, error: error.message, browser: browserType });
        } finally {
          await page.close();
        }
      }));

      await context.close();
      console.log(\`[${new Date().toISOString()}] \${browserType} closed for bots \${botPair.map(b => b.name).join(', ')}\`);
      return results;
    } catch (error) {
      console.error(\`[${new Date().toISOString()}] \${browserType} launch failed: \${error.message}\`);
      if (browser) await browser.close();
      return botPair.map(bot => ({ success: false, botId: bot.id, error: 'Browser launch failed: ' + error.message, browser: browserType }));
    }
  };

  joinMeetingPair(workerData)
    .then(result => parentPort.postMessage(result))
    .catch(error => {
      console.error(\`[${new Date().toISOString()}] Worker fatal error: \${error.message}\`);
      parentPort.postMessage(workerData.botPair.map(bot => ({
        success: false,
        botId: bot.id,
        error: 'Worker fatal error: ' + error.message,
        browser: workerData.browserType
      })));
    });
`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log(`[${new Date().toISOString()}] Received join meeting request`);
  const body = (await req.json()) as JoinRequest;
  let { bots, meetingId, password, botCount = 0, duration } = body;

  if (!meetingId || !password) {
    console.error(`[${new Date().toISOString()}] Missing required fields`);
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  bots = bots || [];
  console.log(`[${new Date().toISOString()}] Initial bot count: ${bots.length}, requested botCount: ${botCount}`);
  if (botCount > 0) bots = [...bots, ...generateBots(botCount, bots)];
  if (bots.length === 0) {
    console.error(`[${new Date().toISOString()}] No bots provided`);
    return NextResponse.json({ error: "No bots provided" }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_ZOOM_REDIRECT_URI || req.headers.get("origin") || "";
  console.log(`[${new Date().toISOString()}] Using origin: ${origin}`);
  const signature = generateSignature(meetingId, 0, duration);

  const browserTypes: ('chromium' | 'firefox' | 'chromium2')[] = ['chromium', 'firefox', 'chromium2'];
  const BOTS_PER_TASK = 4; // Increased to process more bots per worker
  const totalBots = bots.length;
  const tasks: Task[] = [];
  const botPairsByBrowser: { [key: string]: Bot[][] } = { chromium: [], firefox: [], chromium2: [] };

  // Distribute bots across browsers
  const shuffledBots = [...bots].sort(() => Math.random() - 0.5);
  let botIndex = 0;
  for (const browser of browserTypes) {
    const botsForThisBrowser = shuffledBots.slice(botIndex, botIndex + Math.ceil(totalBots / browserTypes.length));
    botIndex += Math.ceil(totalBots / browserTypes.length);
    for (let i = 0; i < botsForThisBrowser.length; i += BOTS_PER_TASK) {
      const botPair = botsForThisBrowser.slice(i, i + BOTS_PER_TASK);
      if (botPair.length > 0) {
        botPairsByBrowser[browser].push(botPair);
        tasks.push({
          botPair,
          meetingId,
          password,
          origin,
          signature,
          browserType: browser,
        });
      }
    }
  }

  console.log(`[${new Date().toISOString()}] Created ${tasks.length} tasks: ` +
    `Chromium: ${botPairsByBrowser.chromium.length} (${botPairsByBrowser.chromium.flat().length} bots), ` +
    `Firefox: ${botPairsByBrowser.firefox.length} (${botPairsByBrowser.firefox.flat().length} bots), ` +
    `Chromium2: ${botPairsByBrowser.chromium2.length} (${botPairsByBrowser.chromium2.flat().length} bots)`);

  const executeTask = async (task: Task): Promise<WorkerResult[]> => {
    const taskId = `${task.browserType}-${task.botPair.map(b => b.id).join('-')}`;
    console.log(`[${new Date().toISOString()}] Starting task ${taskId} with ${task.browserType}`);
    
    return new Promise((resolve) => {
      const worker = new Worker(workerScript, { 
        eval: true,
        workerData: task,
        resourceLimits: {
          maxOldGenerationSizeMb: 400, // Increased memory limits
          maxYoungGenerationSizeMb: 200,
        }
      });

      let timeoutId: NodeJS.Timeout;

      worker.on('message', (result: WorkerResult[]) => {
        clearTimeout(timeoutId);
        console.log(`[${new Date().toISOString()}] Task completed for ${task.browserType} bots ${task.botPair.map(b => b.name).join(', ')}`);
        resolve(result);
      });

      worker.on('error', (error) => {
        clearTimeout(timeoutId);
        console.error(`[${new Date().toISOString()}] Worker error for ${task.browserType}: ${error.stack}`);
        resolve(task.botPair.map(bot => ({
          success: false,
          botId: bot.id,
          error: error.message,
          browser: task.browserType
        })));
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          clearTimeout(timeoutId);
          console.error(`[${new Date().toISOString()}] Worker exited with code ${code} for ${task.browserType}`);
          resolve(task.botPair.map(bot => ({
            success: false,
            botId: bot.id,
            error: `Worker exited with code ${code}`,
            browser: task.browserType
          })));
        }
      });

      timeoutId = setTimeout(() => {
        worker.terminate().then(() => {
          console.warn(`[${new Date().toISOString()}] Worker timeout for ${task.browserType}`);
          resolve(task.botPair.map(bot => ({
            success: false,
            botId: bot.id,
            error: "Timeout",
            browser: task.browserType
          })));
        });
      }, 45000); // Reduced timeout for faster failure detection
    });
  };

  const runTasksInParallel = async () => {
    try {
      setPriority(19);
      console.log(`[${new Date().toISOString()}] Set main process to high priority`);
    } catch (error) {
      console.warn(`[${new Date().toISOString()}] Failed to set process priority: ${error}`);
    }

    console.log(`[${new Date().toISOString()}] Launching all ${tasks.length} tasks in parallel`);
    const results = await Promise.all(tasks.map(task => executeTask(task)));
    return results.flat();
  };

  try {
    const results = await runTasksInParallel();
    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success);

    const response = {
      success: successes === bots.length,
      message: `${successes}/${bots.length} bots joined`,
      failures,
      browserStats: {
        chromium: {
          total: results.filter(r => r.browser === 'chromium').length,
          successes: results.filter(r => r.browser === 'chromium' && r.success).length
        },
        firefox: {
          total: results.filter(r => r.browser === 'firefox').length,
          successes: results.filter(r => r.browser === 'firefox' && r.success).length
        },
        chromium2: {
          total: results.filter(r => r.browser === 'chromium2').length,
          successes: results.filter(r => r.browser === 'chromium2' && r.success).length
        }
      }
    };

    console.log(`[${new Date().toISOString()}] Request completed: ${response.message}`, JSON.stringify(response.browserStats));
    return NextResponse.json(response, { status: failures.length > 0 ? 207 : 200 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Processing error: ${error instanceof Error ? error.stack : String(error)}`);
    return NextResponse.json({ 
      error: "Failed to process bots",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}