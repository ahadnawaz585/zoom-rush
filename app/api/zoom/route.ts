import { NextResponse } from 'next/server';
import { runMultipleBots } from '@/lib/zoom-automation';

export async function POST(request: Request) {
  try {
    const { meetingId, password, quantity, duration, botNames } = await request.json();

    if (!botNames || botNames.length !== parseInt(quantity)) {
      return NextResponse.json(
        { success: false, message: 'Invalid bot names provided' },
        { status: 400 }
      );
    }

    console.log('Received request to start bots:', { meetingId, quantity, duration, botNames });

    const botStatuses: Record<number, string> = {};

    // Define the status update callback
    const onStatusUpdate = (botId: number, status: string) => {
      console.log(`Bot ${botId} status updated: ${status}`);
      botStatuses[botId] = status;
    };

    // Start the bots and wait for completion
    await runMultipleBots(
      quantity,
      meetingId,
      password,
      duration,
      botNames,
      onStatusUpdate
    );

    console.log('Bots started, sending response');
    return NextResponse.json({
      success: true,
      message: 'Bots started successfully',
      initialStatuses: Object.keys(botStatuses).map(id => ({
        id: parseInt(id),
        status: botStatuses[parseInt(id)],
      })),
    });
  } catch (error) {
    console.error('Failed to start bots:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start bots' },
      { status: 500 }
    );
  }
}