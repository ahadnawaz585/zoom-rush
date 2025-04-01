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
  // Parse the request body
  const { bots, meetingId, password } = (await req.json()) as JoinRequest;

  if (!bots || bots.length === 0 || !meetingId || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Launch a headless browser
    const browser = await chromium.launch({ headless: true });

    // Process the first bot immediately
    const firstBot = bots[0];
    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    const origin = req.headers.get("origin") || "http://localhost:3000"; // Fallback for local dev
    const firstUrl = `${origin}/test?username=${encodeURIComponent(
      firstBot.name
    )}&meetingId=${encodeURIComponent(meetingId)}&password=${encodeURIComponent(password)}`;
    await firstPage.goto(firstUrl);
    console.log(`First bot ${firstBot.name} navigated to ${firstUrl}`);

    // Wait 1 second before processing the rest
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Process remaining bots in parallel
    const botPromises = bots.map(async (bot) => {
      const context = await browser.newContext(); // New context for isolation
      const page = await context.newPage();
      const url = `${origin}/test?username=${encodeURIComponent(
        bot.name
      )}&meetingId=${encodeURIComponent(meetingId)}&password=${encodeURIComponent(password)}`;
      
      await page.goto(url);
      console.log(`Bot ${bot.name} navigated to ${url}`);

      // Optionally wait for some action (e.g., Zoom SDK to load)
      // await page.waitForTimeout(2000); // Adjust as needed

      await context.close(); // Clean up after each bot
    });
    
    await Promise.all(botPromises);
    await browser.close();

    return NextResponse.json({ success: true, message: "All bots joined successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in Playwright script:", error);
    return NextResponse.json({ error: "Failed to join meeting with bots" }, { status: 500 });
  }
}