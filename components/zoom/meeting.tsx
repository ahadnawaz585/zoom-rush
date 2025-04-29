"use client";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Preload Zoom SDK at module level
ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.2/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

function Meeting() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "JohnDoe";
  const meetingId = searchParams.get("meetingId") || "88696681332";
  const password = searchParams.get("password") || "16HHw1";
  const signature = searchParams.get("signature") || "";

  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    console.log("Starting Zoom meeting initialization", {
      meetingId,
      username,
      hasSignature: !!signature,
    });

    const zoomClient = ZoomMtgEmbedded.createClient();
    setClient(zoomClient);
    console.log("Zoom client created successfully");

    const rootElement = document.getElementById("meetingSDKElement");
    if (!rootElement) {
      console.error("Meeting SDK element not found");
      return;
    }

    zoomClient
      .init({
        debug: true,
        zoomAppRoot: rootElement,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
      })
      .then(() => {
        console.log("Zoom client initialized successfully");
        return zoomClient.join({
          sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || "",
          signature,
          meetingNumber: meetingId,
          userName: username,
          password,
        });
      })
      .then(() => {
        console.log(`Successfully joined meeting ${meetingId} as ${username}`);
        rootElement.setAttribute("data-join-status", "success");
        // Hide the root element on successful join
        rootElement.style.display = "none";

        // Get current user's ID
        const userId = zoomClient.getCurrentUser()?.userId;
        if (!userId) {
          console.error("Failed to get current user ID");
          return;
        }
        console.log(`Current user ID: ${userId}`);

        // Automatically stop audio stream
        return zoomClient.mute(true, userId);
      })
      .then(() => {
        console.log(`Audio muted successfully for user ${username}`);
      })
      .catch((error: unknown) => {
        console.error(`Error in Zoom meeting process for ${username}:`, {
          error,
          meetingId,
          username,
        });
        rootElement.setAttribute("data-join-status", "error");
      });

  }, [meetingId, username, password, signature]);

  return <div id="meetingSDKElement" />;
}

export default Meeting;