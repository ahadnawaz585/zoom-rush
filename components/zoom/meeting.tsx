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
  const [joinStatus, setJoinStatus] = useState("pending");

  useEffect(() => {
    const zoomClient = ZoomMtgEmbedded.createClient();
    setClient(zoomClient);

    const rootElement = document.getElementById("meetingSDKElement");
    if (!rootElement) return;

    // Initialize with optimized settings
    zoomClient
      .init({
        debug: false, // Disable debug mode in production
        zoomAppRoot: rootElement,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
        // Remove invalid properties:
        // videoDecode: true,
        // videoShare: false,
        // audioShare: false,
        // preloadWasm: true,
        // videoMaxFps: 15,
      })
      .then(() => {
        // Join with optimized settings
        zoomClient
          .join({
            sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || "",
            signature,
            meetingNumber: meetingId,
            userName: username,
            password,
            // Remove invalid properties:
            // videoOptions: {
            //   isVideoOn: false,
            //   videoQuality: 2,
            // },
            // audioOptions: {
            //   autoAdjustMic: false,
            //   echoCancellation: true,
            //   suppressBackground: true,
            // },
          })
          .then(() => {
            setJoinStatus("success");
            rootElement.setAttribute("data-join-status", "success");

            // Get current user's ID
            const userId = zoomClient.getCurrentUser()?.userId;
            if (!userId) {
              console.error("Failed to get current user ID");
              return;
            }

            // Apply optimizations after joining
            applyOptimizations(zoomClient, userId);
          })
          .catch((error: unknown) => {
            console.error(`Join failed for ${username}:`, error);
            setJoinStatus("error");
            rootElement.setAttribute("data-join-status", "error");
          });
      })
      .catch((error: unknown) => console.error("Init failed:", error));

    return () => {
      // Clean up when component unmounts
      if (client && joinStatus === "success") {
        client.leave().catch((error: unknown) => {
          console.error("Failed to leave meeting:", error);
        });
      }
    };
  }, [meetingId, username, password, signature, joinStatus]);

  // Function to apply all optimizations after joining
  const applyOptimizations = (zoomClient: any, userId: number) => {
    // Ensure audio is muted - Fix type error by converting userId to string if needed
    zoomClient.mute(true, userId).catch((error: unknown) => {
      console.error("Failed to mute audio:", error);
    });

    // Ensure video is off
    zoomClient.stopVideo().catch((error: unknown) => {
      console.error("Failed to stop video:", error);
    });

    // Use try-catch blocks for each feature to handle potential API differences
    try {
      // Check if methods exist before calling them
      if (typeof zoomClient.setVirtualBackground === 'function') {
        zoomClient.setVirtualBackground(false);
      }
    } catch (error) {
      console.error("Virtual background API not available:", error);
    }

    try {
      if (typeof zoomClient.setBandwidthMode === 'function') {
        zoomClient.setBandwidthMode("low");
      }
    } catch (error) {
      console.error("Bandwidth mode API not available:", error);
    }

    try {
      if (typeof zoomClient.getUIController === 'function') {
        const uiController = zoomClient.getUIController();
        if (uiController && typeof uiController.setScreenShareButtonVisibility === 'function') {
          uiController.setScreenShareButtonVisibility(false);
        }
      }
    } catch (error) {
      console.error("UI controller API not available:", error);
    }

    try {
      if (typeof zoomClient.getChatController === 'function') {
        const chatController = zoomClient.getChatController();
        if (chatController && typeof chatController.setVisibility === 'function') {
          chatController.setVisibility(false);
        }
      }
    } catch (error) {
      console.error("Chat controller API not available:", error);
    }

    try {
      if (typeof zoomClient.getVideoController === 'function') {
        const videoController = zoomClient.getVideoController();
        if (videoController && typeof videoController.setVideoQuality === 'function') {
          videoController.setVideoQuality("90p"); // Use lowest quality as string
        }
      }
    } catch (error) {
      console.error("Video controller API not available:", error);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div id="meetingSDKElement" className="w-full h-full" />
      {joinStatus === "pending" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <p>Connecting to meeting with optimized settings...</p>
        </div>
      )}
    </div>
  );
}

export default Meeting;