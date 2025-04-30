"use client";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Preload Zoom SDK with latest version
ZoomMtg.setZoomJSLib("https://source.zoom.us/2.21.0/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

function Meeting() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "JohnDoe";
  const meetingId = searchParams.get("meetingId") || "88696681332";
  const password = searchParams.get("password") || "16HHw1";
  const signature = searchParams.get("signature") || "";

  const [client, setClient] = useState<any>(null);
  const isMounted = useRef(true);
  const audioRetryCount = useRef(0);

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

    let zoomClient: any;
    if (!client) {
      zoomClient = ZoomMtgEmbedded.createClient();
      setClient(zoomClient);
      console.log("Zoom client created successfully");
    } else {
      zoomClient = client;
      console.log("Reusing existing Zoom client");
    }

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

    const startAudio = async (maxRetries = 3, delayMs = 2000) => {
      if (!zoomClient || typeof zoomClient.joinAudio !== "function") {
        console.error("Zoom client is not initialized or joinAudio is unavailable");
        return false;
      }
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          await zoomClient.joinAudio();
          console.log(`Computer audio started successfully for ${username}`);
          return true;
        } catch (error) {
          console.error(`Audio attempt ${attempts + 1} failed for ${username}:`, error);
          attempts++;
          if (attempts >= maxRetries) {
            console.error("Max audio attempts reached");
            return false;
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      return false;
    };

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

    const initAndJoin = async () => {
      let initAttempts = 0;
      const maxInitAttempts = 3;

      while (initAttempts < maxInitAttempts) {
        try {
          await ZoomMtg.prepareWebSDK();
          await zoomClient.init({
            debug: true,
            zoomAppRoot: rootElement,
            language: "en-US",
            patchJsMedia: true,
            leaveOnPageUnload: true,
          });
          console.log("Zoom client initialized successfully");
          break;
        } catch (error) {
          console.error(`Initialization attempt ${initAttempts + 1} failed:`, error);
          initAttempts++;
          if (initAttempts >= maxInitAttempts) {
            console.error("Max initialization attempts reached");
            rootElement.setAttribute("data-join-status", "error");
            return;
          }
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
          autoJoinAudio: true,
        });
        console.log(`Successfully joined meeting ${meetingId} as ${username}`);
        rootElement.setAttribute("data-join-status", "success");
        rootElement.style.display = "none";

        const userId = zoomClient.getCurrentUser()?.userId;
        if (!userId) {
          console.error("Failed to get current user ID");
          return;
        }
        console.log(`Current user ID: ${userId}`);

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

    return () => {
      isMounted.current = false;
      if (zoomClient) {
        console.log("Cleaning up Zoom client");
        ZoomMtgEmbedded.destroyClient();
      }
    };
  }, [meetingId, username, password, signature, client]);

  return <div id="meetingSDKElement" />;
}

export default Meeting;