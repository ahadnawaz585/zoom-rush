import { NextApiRequest, NextApiResponse } from 'next';
import { runMultipleBots } from '@/lib/zoom-automation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { meetingId, password, quantity, duration } = req.body;
  
  // Store bot statuses to send back to client
  const botStatuses: Record<number, string> = {};
  
  try {
    // Start the Zoom bots in the background
    runMultipleBots(
      quantity,
      meetingId,
      password,
      duration,
      (botId, status) => {
        botStatuses[botId] = status;
        // You could implement a WebSocket here to push status updates to the client
      }
    ).catch(error => {
      console.error('Error running bots:', error);
    });
    
    // Return immediately with initial success message
    return res.status(200).json({ 
      success: true, 
      message: 'Bots started successfully',
      initialStatuses: Object.keys(botStatuses).map(id => ({
        id: parseInt(id),
        status: botStatuses[parseInt(id)]
      }))
    });
  } catch (error) {
    console.error('Failed to start bots:', error);
    return res.status(500).json({ success: false, message: 'Failed to start bots' });
  }
}