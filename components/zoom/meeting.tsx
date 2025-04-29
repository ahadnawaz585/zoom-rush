"use client";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Preload Zoom SDK at module level
console.log("[ZOOM-BOT] Initializing Zoom SDK libraries");
ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.2/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

function Meeting() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "JohnDoe";
  const meetingId = searchParams.get("meetingId") || "88696681332";
  const password = searchParams.get("password") || "16HHw1";
  const signature = searchParams.get("signature") || "";

  useEffect(() => {
    console.log("[ZOOM-BOT] Component mounted, creating client");
    const zoomClient = ZoomMtgEmbedded.createClient();
    
    const rootElement = document.getElementById("meetingSDKElement");
    if (!rootElement) {
      console.error("[ZOOM-BOT] Root element not found");
      return;
    }

    console.log("[ZOOM-BOT] Initializing client");
    zoomClient
      .init({
        debug: false,
        zoomAppRoot: rootElement,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
      })
      .then(() => {
        console.log("[ZOOM-BOT] Client initialized, joining meeting", { meetingId, username });
        zoomClient
          .join({
            sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || "",
            signature,
            meetingNumber: meetingId,
            userName: username,
            password,
          })
          .then(() => {
            console.log("[ZOOM-BOT] Successfully joined meeting");
            
            // Get current user's ID
            const userId = zoomClient.getCurrentUser()?.userId;
            if (!userId) {
              console.error("[ZOOM-BOT] Failed to get current user ID");
              return;
            }
            
            console.log("[ZOOM-BOT] Current user ID:", userId);
            
            // Disable audio only - this is a supported method
            console.log("[ZOOM-BOT] Disabling audio");
            zoomClient.mute(true, userId).catch((error: Error) => {
              console.error("[ZOOM-BOT] Failed to mute audio:", error);
            });
            
            // Log that we're in the meeting with minimal features
            console.log("[ZOOM-BOT] Meeting joined with minimal features enabled");
            console.log("[ZOOM-BOT] Audio muted, video disabled by default");
            console.log("[ZOOM-BOT] Meeting setup complete");
          })
          .catch((error: Error) => {
            console.error("[ZOOM-BOT] Join failed:", error);
          });
      })
      .catch((error: Error) => console.error("[ZOOM-BOT] Init failed:", error));

    // No cleanup function that calls leave() since it doesn't exist
    return () => {
      console.log("[ZOOM-BOT] Component unmounting");
      // We can't call leave() directly as it doesn't exist on the client
      // Instead, we rely on leaveOnPageUnload: true in the init options
    };
  }, [meetingId, username, password, signature]);

  // Return only the SDK element with no additional HTML
  return <div id="meetingSDKElement" />;
}

export default Meeting;