import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_TOKEN_URL = 'https://zoom.us/oauth/token';

interface ZoomMeeting {
  id: string;
  join_url: string;
  password: string;
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class ZoomClient {
  private clientId: string = process.env.ZOOM_CLIENT_ID!;
  private clientSecret: string = process.env.ZOOM_CLIENT_SECRET!;
  private redirectUri: string = process.env.ZOOM_REDIRECT_URI!;
  private accessToken: string | null = null;

  // Get OAuth authorization URL
  getAuthUrl(): string {
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}`;
    return authUrl;
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<string> {
    const response = await axios.post<ZoomTokenResponse>(
      ZOOM_OAUTH_TOKEN_URL,
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
        },
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      }
    );
    this.accessToken = response.data.access_token;
    return this.accessToken;
  }

  // Create a Zoom meeting
  async createMeeting(userId: string = 'me'): Promise<ZoomMeeting> {
    if (!this.accessToken) throw new Error('Access token not found');

    const response = await axios.post(
      `${ZOOM_API_BASE_URL}/users/${userId}/meetings`,
      {
        topic: 'Bot Test Meeting',
        type: 2, // Scheduled meeting
        start_time: new Date().toISOString(),
        duration: 60,
        timezone: 'UTC',
        settings: {
          host_video: false,
          participant_video: false,
          join_before_host: true,
          mute_upon_entry: true,
          auto_recording: 'none',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    return response.data;
  }

  // Generate signature for Zoom Web SDK
  generateSignature(meetingNumber: string, role: number): string {
    // In a real app, use a proper signature generation library
    // This is a placeholder; Zoom requires a JWT signature
    // See Zoom Web SDK documentation for proper implementation
    return 'placeholder-signature';
  }
}

export const zoomClient = new ZoomClient();