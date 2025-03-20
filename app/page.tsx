// "use client";

// import { useEffect, useState } from "react";
// import { Video } from "lucide-react";
// import { toast } from "sonner";
// import { ZoomMtg } from "@zoomus/websdk";
// import MeetingForm from "@/components/shared/meeting-form";
// import BotList from "@/components/shared/bot-list";
// import PreviousSchedule from "@/components/shared/previous-schedule";
// import { generateBotName } from "@/lib/botUtils";
// import router from "next/router";

// // Global declaration for TypeScript
// declare global {
//   interface Window {
//     ZoomMtg: typeof ZoomMtg;
//   }
// }

// export default function Home() {
//   const [generatedBots, setGeneratedBots] = useState<{ id: number; name: string; status: string }[]>([]);
//   const [isJoining, setIsJoining] = useState(false);
  
//   // Remove authentication check completely to avoid any delays
  
  
//   function handleBotsGenerated(quantity: number, country: string) {
//     const bots = Array.from({ length: quantity }, (_, i) => ({
//       id: i + 1,
//       name: generateBotName(country),
//       status: "Ready",
//     }));
    
//     setGeneratedBots(bots);
    
//     toast.success("Bots generated successfully", {
//       description: `Generated ${quantity} bots for the meeting`,
//     });
//   }

//   async function joinMeeting(formValues: {
//     meetingId: string;
//     password: string;
//     quantity: number;
//     duration: number;
//   }) {
//     if (generatedBots.length === 0) {
//       toast.error("No bots generated");
//       return;
//     }

//     setIsJoining(true);

//     try {
//       const response = await fetch('/api/zoom', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           meetingId: formValues.meetingId,
//           password: formValues.password,
//           quantity: formValues.quantity,
//           duration: formValues.duration * 60, // Convert to seconds
//           botNames: generatedBots.map(bot => bot.name),
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success("Bots are joining the meeting", {
//           description: `${formValues.quantity} bots are connecting to the meeting`,
//         });

//         // Initialize Zoom Web SDK
//         ZoomMtg.setZoomJSLib('https://source.zoom.us/2.11.0/lib', '/av');
//         ZoomMtg.preLoadWasm();
//         ZoomMtg.prepareWebSDK();

//         // Join each bot
//         generatedBots.forEach((bot, index) => {
//           ZoomMtg.init({
//             leaveUrl: window.location.origin,
//             success: () => {
//               ZoomMtg.join({
//                 meetingNumber: data.meetingId,
//                 passWord: data.password,
//                 userName: bot.name,
//                 signature: '', // Replace with proper signature generation
//                 // apiKey: process.env.NEXT_PUBLIC_ZOOM_API_KEY || '', // Add to .env
//                 success: () => {
//                   setGeneratedBots(prevBots =>
//                     prevBots.map(b => b.id === bot.id ? { ...b, status: 'Connected' } : b)
//                   );
//                   console.log(`${bot.name} joined the meeting`);
//                 },
//                 error: (error: any) => {
//                   setGeneratedBots(prevBots =>
//                     prevBots.map(b => b.id === bot.id ? { ...b, status: 'Error' } : b)
//                   );
//                   console.error(`Error joining ${bot.name}:`, error);
//                 },
//               });
//             },
//             error: (error: any) => {
//               console.error('ZoomMtg init error:', error);
//             },
//           });
//         });

//         if (data.initialStatuses && data.initialStatuses.length > 0) {
//           setGeneratedBots(prevBots =>
//             prevBots.map(bot => {
//               const updatedStatus = data.initialStatuses.find((s: any) => s.id === bot.id);
//               return updatedStatus ? { ...bot, status: updatedStatus.status } : bot;
//             })
//           );
//         }

//         simulateStatusUpdates(formValues.quantity);
//       } else {
//         toast.error("Failed to join meeting", {
//           description: data.message || "An error occurred while joining the meeting",
//         });
//       }
//     } catch (error) {
//       toast.error("Failed to join meeting", {
//         description: "An error occurred while connecting to the server",
//       });
//     } finally {
//       setIsJoining(false);
//     }
//   }

//   // Function to simulate status updates
//   function simulateStatusUpdates(botCount: number) {
//     const statuses = ['Initializing', 'Joining', 'Connected'];
//     let currentStatusIndex = 0;

//     const interval = setInterval(() => {
//       if (currentStatusIndex >= statuses.length) {
//         clearInterval(interval);
//         return;
//       }

//       const currentStatus = statuses[currentStatusIndex];

//       setGeneratedBots(prevBots =>
//         prevBots.map(bot => ({ ...bot, status: currentStatus }))
//       );

//       currentStatusIndex++;
//     }, 5000);
//   }

//   return (
//     <div className="h-screen overflow-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-6xl mx-auto min-h-full flex flex-col">
//         <div className="flex items-center justify-center mb-8">
//           <Video className="h-8 w-8 text-blue-500 mr-3" />
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             Zoom Meeting Bot Manager
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
//           <MeetingForm
//             onBotsGenerated={handleBotsGenerated}
//             onJoinMeeting={joinMeeting}
//             isJoining={isJoining}
//             hasGeneratedBots={generatedBots.length > 0}
//           />

//           <BotList bots={generatedBots} />
//         </div>

//         <div className="mt-6">
//           <PreviousSchedule />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple redirect to home without any authentication check
    setTimeout(() => {
      router.push("/home");
    }, 500); // Small timeout to show loading state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-white/20 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-purple-600 p-3 rounded-full shadow-lg">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Zoom Meeting Bot Manager
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-100 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-white/5 border border-purple-300/20 rounded-lg 
                       text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-white/5 border border-purple-300/20 rounded-lg 
                       text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 
                     hover:to-purple-900 text-white font-medium py-3 px-4 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                     focus:ring-offset-purple-900 transform transition-all duration-200 
                     hover:shadow-lg hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-purple-200 hover:text-white text-sm transition-colors duration-200">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}