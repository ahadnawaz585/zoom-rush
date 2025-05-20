"use client";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// Preload Zoom SDK
ZoomMtg.setZoomJSLib("https://source.zoom.us/2.21.0/lib", "/av");
ZoomMtg.preLoadWasm();

function Meeting() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "JohnDoe";
  const meetingId = searchParams.get("meetingId") || "98066497454";
  const password = searchParams.get("password") || "16HHw1";
  const signature = searchParams.get("signature") || "";
  const noAudio = searchParams.get("noAudio") === "true";

  const [client, setClient] = useState<any>(null);
  const isMounted = useRef(true);
  const audioRetryCount = useRef(0);
  const muteRetryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("Starting Zoom meeting initialization", { meetingId, username, noAudio });

    if (!signature || !process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY) {
      console.error("Missing required credentials");
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
        const isConnected = await zoomClient.isAudioConnected();
        console.log(`Audio join status for ${username}:`, { isConnected });
        return isConnected;
      } catch (error) {
        console.error("Error checking audio status:", error);
        return false;
      }
    };

    const findAndClickMuteButton = () => {
      try {
        const muteButton = document.querySelector('button[aria-label*="mute"], button[title*="Mute"], .zm-btn__mute');
        if (muteButton) {
          console.log(`Found mute button for ${username}, clicking it`);
          (muteButton as HTMLButtonElement).click();
          return true;
        }
        console.log("Mute button not found in DOM");
        return false;
      } catch (error) {
        console.error("Error finding/clicking mute button:", error);
        return false;
      }
    };

    // New: Handle auto_play_audio_failed event
    const handleAutoPlayAudioFailed = () => {
      console.warn(`Auto-play audio failed for ${username}, prompting user interaction`);
      const retryButton = document.createElement("button");
      retryButton.innerText = "Enable Audio";
      retryButton.style.position = "fixed";
      retryButton.style.top = "10px";
      retryButton.style.left = "10px";
      retryButton.style.zIndex = "1000";
      retryButton.onclick = async () => {
        try {
          await zoomClient.joinAudio({ autoAdjustMic: false, mute: true });
          console.log(`Audio started after user interaction for ${username}`);
          retryButton.remove();
          await attemptMute(zoomClient.getCurrentUser()?.userId);
        } catch (error) {
          console.error("Failed to start audio after user interaction:", error);
        }
      };
      document.body.appendChild(retryButton);
    };

    const checkAndJoinAudio = async (maxRetries = 5, delayMs = 2000) => {
      if (noAudio) {
        console.log(`Audio disabled for ${username}`);
        return false;
      }

      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const isConnected = await zoomClient.isAudioConnected();
          if (isConnected) {
            console.log(`Audio already connected for ${username}`);
            return true;
          }

          console.log(`Attempting to join audio for ${username}`);
          await zoomClient.joinAudio({ autoAdjustMic: false, mute: true });
          console.log(`Audio join command sent for ${username}`);

          await new Promise(resolve => setTimeout(resolve, 1000));
          const joinSucceeded = await isAudioJoined();
          if (joinSucceeded) {
            console.log(`Audio joined successfully for ${username}`);
            return true;
          }

          console.warn(`Audio not connected for ${username}, retrying (${attempts + 1}/${maxRetries})`);
          attempts++;
          if (attempts >= maxRetries) {
            console.error("Max audio connection attempts reached");
            return false;
          }
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } catch (error) {
          console.error(`Audio connection attempt ${attempts + 1} failed:`, error);
          attempts++;
          if (attempts >= maxRetries) {
            console.error("Max audio connection attempts reached");
            return false;
          }
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      return false;
    };

    const attemptMute = async (userId: string, maxRetries = 5, delayMs = 2000) => {
      if (audioRetryCount.current >= maxRetries) {
        console.error(`Max mute retries (${maxRetries}) reached for ${username}`);
        findAndClickMuteButton();
        return;
      }

      try {
        await zoomClient.mute({ userId });
        console.log(`Audio muted programmatically for ${username}`);

        setTimeout(async () => {
          try {
            const currentUser = zoomClient.getCurrentUser();
            if (currentUser && !currentUser.bAudioMuted) {
              console.warn(`User ${username} wasn't muted, retrying...`);
              audioRetryCount.current += 1;
              attemptMute(userId, maxRetries, delayMs);
            } else {
              console.log(`Confirmed: User ${username} is muted`);
            }
          } catch (error) {
            console.error("Error checking mute status:", error);
          }
        }, 1000);
      } catch (error) {
        console.error(`Programmatic mute failed for ${username}:`, error);
        const uiClicked = findAndClickMuteButton();
        if (!uiClicked) {
          console.warn(`Couldn't find mute button for ${username}, retrying...`);
          audioRetryCount.current += 1;
          setTimeout(() => attemptMute(userId, maxRetries, delayMs), delayMs);
        }
      }
    };

    const setupPersistentMuteCheck = (userId: string) => {
      if (muteRetryIntervalRef.current) {
        clearInterval(muteRetryIntervalRef.current);
      }

      muteRetryIntervalRef.current = setInterval(() => {
        if (!isMounted.current) {
          if (muteRetryIntervalRef.current) {
            clearInterval(muteRetryIntervalRef.current);
          }
          return;
        }

        try {
          const currentUser = zoomClient.getCurrentUser();
          if (currentUser && !currentUser.bAudioMuted) {
            console.log(`Detected unmuted state for ${username}, re-muting...`);
            zoomClient.mute({ userId }).catch(() => findAndClickMuteButton());
          }
        } catch (error) {
          console.error("Error in persistent mute check:", error);
        }
      }, 5000);
    };

    const prepareSDKWithRetry = async (maxRetries = 3, delayMs = 1500) => {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          await ZoomMtg.prepareWebSDK();
          console.log("WebSDK prepared successfully");
          return true;
        } catch (error) {
          console.error(`prepareWebSDK attempt ${attempts + 1} failed:`, error);
          attempts++;
          if (attempts >= maxRetries) {
            console.error("Max prepareWebSDK attempts reached");
            return false;
          }
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      return false;
    };

    const initAndJoin = async () => {
      const sdkPrepared = await prepareSDKWithRetry();
      if (!sdkPrepared) {
        console.error("Failed to prepare WebSDK after retries");
        rootElement.setAttribute("data-join-status", "error");
        return;
      }

      try {
        await zoomClient.init({
          debug: true,
          zoomAppRoot: rootElement,
          language: "en-US",
          patchJsMedia: true,
          leaveOnPageUnload: true,
        });
        console.log("Zoom client initialized successfully");
      } catch (error) {
        console.error("Initialization failed:", error);
        rootElement.setAttribute("data-join-status", "error");
        return;
      }

      try {
        await zoomClient.join({
          sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
          signature,
          meetingNumber: meetingId,
          userName: username,
          password,
          autoJoinAudio: !noAudio,
          audioOptions: { mute: true },
        });
        console.log(`Successfully joined meeting ${meetingId} as ${username}`);
        rootElement.setAttribute("data-join-status", "success");

        const userId = zoomClient.getCurrentUser()?.userId;
        if (!userId) {
          console.error("Failed to get current user ID");
          return;
        }
        console.log(`Current user ID: ${userId}`);

        if (noAudio) {
          console.log(`Audio disabled for ${username}, skipping audio join`);
        } else {
          // New: Register auto_play_audio_failed event listener
          zoomClient.on("auto_play_audio_failed", handleAutoPlayAudioFailed);

          setTimeout(async () => {
            const audioStarted = await checkAndJoinAudio();
            if (audioStarted) {
              await attemptMute(userId);
              setupPersistentMuteCheck(userId);
            } else {
              console.error(`Audio start failed for ${username}, trying UI mute`);
              findAndClickMuteButton();
            }
          }, 2000);
        }
      } catch (error) {
        console.error(`Error in join process for ${username}:`, error);
        rootElement.setAttribute("data-join-status", "error");
      }
    };

    if (isMounted.current) {
      initAndJoin();
    }

    return () => {
      isMounted.current = false;
      if (muteRetryIntervalRef.current) {
        clearInterval(muteRetryIntervalRef.current);
      }
      // if (zoomClient) {
      //   console.log("Cleaning up Zoom client");
      //   ZoomMtgEmbedded.destroyClient();
      // }
    };
  }, [meetingId, username, password, signature, client, noAudio]);

  return <div id="meetingSDKElement" />;
}

export default Meeting;