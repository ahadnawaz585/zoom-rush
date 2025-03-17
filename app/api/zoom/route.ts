import { NextResponse } from 'next/server';
import axios from 'axios';
import dotenv from 'dotenv';
import { ZoomClient } from '@/lib/zoom'; // Adjust the path to your ZoomClient file

dotenv.config();

const zoomClient = new ZoomClient();

export async function POST(req: Request) {
  try {
    const { meetingId, password, quantity, duration, botNames } = await req.json();

    // If no meetingId is provided, create a new meeting
    let meetingDetails = { id: meetingId, join_url: '', password };
    if (!meetingId || meetingId === '') {
      const meeting = await zoomClient.createMeeting();
      meetingDetails = {
        id: meeting.id,
        join_url: meeting.join_url,
        password: meeting.password,
      };
    }

    // Simulate joining bots (in a real scenario, you'd use the Zoom Web SDK client-side)
    const initialStatuses = botNames.map((name: string, index: number) => ({
      id: index + 1,
      name,
      status: 'Initializing',
    }));

    return NextResponse.json({
      success: true,
      meetingId: meetingDetails.id,
      joinUrl: meetingDetails.join_url,
      password: meetingDetails.password,
      initialStatuses,
    });
  } catch (error) {
    console.error('Zoom API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process Zoom request' },
      { status: 500 }
    );
  }
}