// zoom.config.ts
export const zoomConfig = {
    apiKey: process.env.ZOOM_API_KEY || 'your_api_key',
    apiSecret: process.env.ZOOM_API_SECRET || 'your_api_secret',
    accountId: process.env.ZOOM_ACCOUNT_ID || 'your_account_id', // For JWT app
    clientId: process.env.ZOOM_CLIENT_ID || 'your_client_id', // For OAuth app
    clientSecret: process.env.ZOOM_CLIENT_SECRET || 'your_client_secret' // For OAuth app
  };