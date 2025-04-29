"use client";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Preload Zoom SDK at module level with updated version
ZoomMtg.setZoomJSLib("https://source.zoom.us/2.20.0/lib", "/av");
ZoomMtg.preLoadWasm(); // Preload WASM files for faster initialization
ZoomMtg.prepareWebSDK(); // Prepare SDK with minimal resources

function Meeting() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "JohnDoe";
  const meetingId = searchParams.get("meetingId") || "88696681332";
  const password = searchParams.get("password") || "16HHw1";
  const signature = searchParams.get("signature") || "";

  const [client, setClient] = useState<any>(null);
  const isMounted = useRef(true); // Track component mount state
  const audioRetryCount = useRef(0); // Track mute retries

  useEffect(() => {
    console.log("Starting Zoom meeting initialization", {
      meetingId,
      username,
      hasSignature: !!signature,
    });

    if (!signature || !process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY) {
      console.error("Missing required credentials", {
        hasSignature: !!signature,
        hasSdkKey: !!process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
      });
      return;
    }

    const rootElement = document.getElementById("meetingSDKElement");
    if (!rootElement) {
      console.error("Meeting SDK element not found");
      return;
    }

    // Initialize client only once
    let zoomClient: any;
    if (!client) {
      zoomClient = ZoomMtgEmbedded.createClient();
      setClient(zoomClient);
      console.log("Zoom client created successfully");
    } else {
      zoomClient = client;
      console.log("Reusing existing Zoom client");
    }

    // Function to check if audio is joined
    const isAudioJoined = async (): Promise<boolean> => {
      try {
        const attendees = await zoomClient.getAttendeeslist();
        const currentUser = attendees.find((a: any) => a.userId === zoomClient.getCurrentUser()?.userId);
        const isConnected = currentUser?.audioStatus?.isAudioConnected || false;
        console.log(`Audio join status for ${username}:`, { isConnected });
        return isConnected;
      } catch (error) {
        console.error("Error checking audio status:", error);
        return false;
      }
    };

    // Function to start computer audio
    const startAudio = async () => {
      try {
        await zoomClient.startAudio();
        console.log(`Computer audio started successfully for ${username}`);
        return true;
      } catch (error) {
        console.error(`Failed to start computer audio for ${username}:`, error);
        return false;
      }
    };

    // Function to attempt muting with retries
    const attemptMute = async (userId: string, maxRetries = 3, delayMs = 2000) => {
      if (audioRetryCount.current >= maxRetries) {
        console.error(`Max mute retries (${maxRetries}) reached for ${username}`);
        return;
      }

      const audioJoined = await isAudioJoined();
      if (!audioJoined) {
        console.warn(`Audio not joined for ${username}, retrying (${audioRetryCount.current + 1}/${maxRetries})`);
        audioRetryCount.current += 1;
        setTimeout(() => attemptMute(userId, maxRetries, delayMs), delayMs);
        return;
      }

      try {
        await zoomClient.mute(true, userId);
        console.log(`Audio muted successfully for user ${username}`);
      } catch (error) {
        console.error(`Mute failed for ${username}:`, error);
      }
    };

    // Initialize and join meeting
    const initAndJoin = async () => {
      let initAttempts = 0;
      const maxInitAttempts = 3; // Increased to handle tp.min.js failures

      while (initAttempts < maxInitAttempts) {
        try {
          await zoomClient.init({
            debug: true,
            zoomAppRoot: rootElement,
            language: "en-US",
            patchJsMedia: true,
            leaveOnPageUnload: true,
          });
          console.log("Zoom client initialized successfully");
          break; // Exit loop on success
        } catch (error) {
          console.error(`Initialization attempt ${initAttempts + 1} failed:`, error);
          initAttempts++;
          if (initAttempts >= maxInitAttempts) {
            console.error("Max initialization attempts reached");
            rootElement.setAttribute("data-join-status", "error");
            return;
          }
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      try {
        await zoomClient.join({
          sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
          signature,
          meetingNumber: meetingId,
          userName: username,
          password,
          // Enable auto-join audio
          autoJoinAudio: true,
        });
        console.log(`Successfully joined meeting ${meetingId} as ${username}`);
        rootElement.setAttribute("data-join-status", "success");
        rootElement.style.display = "none";

        // Get current user's ID
        const userId = zoomClient.getCurrentUser()?.userId;
        if (!userId) {
          console.error("Failed to get current user ID");
          return;
        }
        console.log(`Current user ID: ${userId}`);

        // Start computer audio and attempt mute
        const audioStarted = await startAudio();
        if (audioStarted) {
          await attemptMute(userId);
        } else {
          console.error(`Skipping mute as audio start failed for ${username}`);
        }
      } catch (error) {
        console.error(`Error in join process for ${username}:`, {
          error,
          meetingId,
          username,
        });
        rootElement.setAttribute("data-join-status", "error");
      }
    };

    if (isMounted.current) {
      initAndJoin();
    }

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      if (zoomClient) {
        console.log("Cleaning up Zoom client");
        zoomClient.leave().catch((err: unknown) => {
          console.error("Error leaving meeting during cleanup:", err);
        });
      }
    };
  }, [meetingId, username, password, signature, client]);

  return <div id="meetingSDKElement" />;
}

export default Meeting;