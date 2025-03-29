// // zoom.auth.ts
// import jwt from 'jsonwebtoken';
// import { zoomConfig } from './zoom.config';

// export function generateZoomJWT() {
//   const payload = {
//     iss: zoomConfig.apiKey,
//     exp: Date.now() + 3600 // 1 hour expiration
//   };

//   return jwt.sign(payload, zoomConfig.apiSecret);
// }

// export const zoomAuthHeaders = {
//   'Authorization': `Bearer ${generateZoomJWT()}`,
//   'Content-Type': 'application/json'
// };