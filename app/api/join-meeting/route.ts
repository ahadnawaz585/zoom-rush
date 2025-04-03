import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

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
}

export async function POST(req: NextRequest) {
  const { bots, meetingId, password } = (await req.json()) as JoinRequest;

  if (!bots || bots.length === 0 || !meetingId || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Launch a single browser instance
    const browser = await chromium.launch({ headless: true });
    const origin =  process.env.NEXT_PUBLIC_ZOOM_REDIRECT_URI ||req.headers.get("origin")  ;

    // Process bots sequentially
    for (const bot of bots) {
      const context = await browser.newContext(); // New context for isolation
      const page = await context.newPage();
      const url = `${origin}/meeting?username=${encodeURIComponent(
        bot.name
      )}&meetingId=${encodeURIComponent(meetingId)}&password=${encodeURIComponent(password)}`;

      console.log(`Navigating bot ${bot.name} to ${url}`);
      await page.goto(url);

      // Wait for the bot to successfully join the meeting
      await page.waitForFunction(
        () => console.log("Joined successfully") === undefined, // Check for success log
        { timeout: 30000 } // Adjust timeout as needed (30 seconds)
      );

      console.log(`Bot ${bot.name} successfully joined the meeting`);

      // Keep the context open to maintain the tab; we'll close the browser later
    }

    // Optionally close the browser after all bots are done
    // await browser.close();

    return NextResponse.json({ success: true, message: "All bots joined successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in Playwright script:", error);
    return NextResponse.json({ error: "Failed to join meeting with bots" }, { status: 500 });
  }
}