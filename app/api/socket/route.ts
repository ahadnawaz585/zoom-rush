// // In your Next.js app, add Socket.io:
// // pages/api/socket.js
// import { Server } from 'socket.io';

// const SocketHandler = (req, res) => {
//   if (res.socket.server.io) {
//     console.log('Socket is already running');
//   } else {
//     console.log('Socket is initializing');
//     const io = new Server(res.socket.server);
//     res.socket.server.io = io;
    
//     io.on('connection', socket => {
//       console.log('New client connected');
      
//       socket.on('disconnect', () => {
//         console.log('Client disconnected');
//       });
//     });
//   }
//   res.end();
// };

// export default SocketHandler;

// // Then modify your API handler to use this socket:
// // In your API handler
// import { runMultipleBots } from '@/lib/zoom-automation';

// export default async function handler(req, res) {
//   // ... existing code
  
//   try {
//     // Get socket.io instance
//     const io = res.socket.server.io;
    
//     const botPromise = runMultipleBots(
//       quantity,
//       meetingId,
//       password,
//       duration,
//       (botId, status) => {
//         console.log(`Bot ${botId} status: ${status}`);
        
//         // Emit status update through socket
//         if (io) {
//           io.emit('bot-status-update', { botId, status });
//         }
//       }
//     );
    
//     // Rest of the code...
//   } catch (error) {
//     // Error handling...
//   }
// }