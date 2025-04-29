"use client";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Preload Zoom SDK at module level with minimal setup
ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.2/lib", "/av");
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

    // Initialize and join meeting
    const initAndJoin = async () => {
      try {
        await zoomClient.init({
          debug: true,
          zoomAppRoot: rootElement,
          language: "en-US",
          patchJsMedia: true,
          leaveOnPageUnload: true,
        });
        console.log("Zoom client initialized successfully");

        await zoomClient.join({
          sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
          signature,
          meetingNumber: meetingId,
          userName: username,
          password,
        });
        console.log(`Successfully joined meeting ${meetingId} as ${username}`);
        rootElement.setAttribute("data-join-status", "success");
        rootElement.style.display = "none";

        // Get current user's ID and mute self
        const userId = zoomClient.getCurrentUser()?.userId;
        if (!userId) {
          console.error("Failed to get current user ID");
          return;
        }
        console.log(`Current user ID: ${userId}`);

        await zoomClient.mute(true, userId); // Self-mute
        console.log(`Audio muted successfully for user ${username}`);
      } catch (error) {
        console.error(`Error in Zoom meeting process for ${username}:`, {
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