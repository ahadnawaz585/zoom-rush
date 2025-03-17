// pages/index.js or app/page.js
"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { toast } from "sonner";
import { ZoomMtg } from "@zoomus/websdk";
import MeetingForm from "@/components/shared/meeting-form";
import BotList from "@/components/shared/bot-list";
import PreviousSchedule from "@/components/shared/previous-schedule";
import { generateBotName } from "@/lib/botUtils";

// Global declaration for TypeScript
declare global {
  interface Window {
    ZoomMtg: typeof ZoomMtg;
  }
}

export default function Home() {
  const [generatedBots, setGeneratedBots] = useState<{ id: number; name: string; status: string }[]>([]);
  const [isJoining, setIsJoining] = useState(false);

  function handleBotsGenerated(quantity: number, country: string) {
    const bots = Array.from({ length: quantity }, (_, i) => ({
      id: i + 1,
      name: generateBotName(country),
      status: "Ready",
    }));
    
    setGeneratedBots(bots);
    
    toast.success("Bots generated successfully", {
      description: `Generated ${quantity} bots for the meeting`,
    });
  }

  async function joinMeeting(formValues: {
    meetingId: string;
    password: string;
    quantity: number;
    duration: number;
  }) {
    if (generatedBots.length === 0) {
      toast.error("No bots generated");
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch('/api/zoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: formValues.meetingId,
          password: formValues.password,
          quantity: formValues.quantity,
          duration: formValues.duration * 60, // Convert to seconds
          botNames: generatedBots.map(bot => bot.name),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Bots are joining the meeting", {
          description: `${formValues.quantity} bots are connecting to the meeting`,
        });

        // Initialize Zoom Web SDK
        ZoomMtg.setZoomJSLib('https://source.zoom.us/2.11.0/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        // Join each bot
        generatedBots.forEach((bot, index) => {
          ZoomMtg.init({
            leaveUrl: window.location.origin,
            success: () => {
              ZoomMtg.join({
                meetingNumber: data.meetingId,
                passWord: data.password,
                userName: bot.name,
                signature: '', // Replace with proper signature generation
                // apiKey: process.env.NEXT_PUBLIC_ZOOM_API_KEY || '', // Add to .env
                success: () => {
                  setGeneratedBots(prevBots =>
                    prevBots.map(b => b.id === bot.id ? { ...b, status: 'Connected' } : b)
                  );
                  console.log(`${bot.name} joined the meeting`);
                },
                error: (error: any) => {
                  setGeneratedBots(prevBots =>
                    prevBots.map(b => b.id === bot.id ? { ...b, status: 'Error' } : b)
                  );
                  console.error(`Error joining ${bot.name}:`, error);
                },
              });
            },
            error: (error: any) => {
              console.error('ZoomMtg init error:', error);
            },
          });
        });

        if (data.initialStatuses && data.initialStatuses.length > 0) {
          setGeneratedBots(prevBots =>
            prevBots.map(bot => {
              const updatedStatus = data.initialStatuses.find((s: any) => s.id === bot.id);
              return updatedStatus ? { ...bot, status: updatedStatus.status } : bot;
            })
          );
        }

        simulateStatusUpdates(formValues.quantity);
      } else {
        toast.error("Failed to join meeting", {
          description: data.message || "An error occurred while joining the meeting",
        });
      }
    } catch (error) {
      toast.error("Failed to join meeting", {
        description: "An error occurred while connecting to the server",
      });
    } finally {
      setIsJoining(false);
    }
  }

  // Function to simulate status updates
  function simulateStatusUpdates(botCount: number) {
    const statuses = ['Initializing', 'Joining', 'Connected'];
    let currentStatusIndex = 0;

    const interval = setInterval(() => {
      if (currentStatusIndex >= statuses.length) {
        clearInterval(interval);
        return;
      }

      const currentStatus = statuses[currentStatusIndex];

      setGeneratedBots(prevBots =>
        prevBots.map(bot => ({ ...bot, status: currentStatus }))
      );

      currentStatusIndex++;
    }, 5000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Video className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Zoom Meeting Bot Manager
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MeetingForm
            onBotsGenerated={handleBotsGenerated}
            onJoinMeeting={joinMeeting}
            isJoining={isJoining}
            hasGeneratedBots={generatedBots.length > 0}
          />
          
          <BotList bots={generatedBots} />
        </div>

        <PreviousSchedule />
      </div>
    </div>
  );
}