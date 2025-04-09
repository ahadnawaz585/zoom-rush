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
  const searchParams:any = useSearchParams();
  const username = searchParams.get("username") || "JohnDoe";
  const meetingId = searchParams.get("meetingId") || "88696681332";
  const password = searchParams.get("password") || "16HHw1";
  const signature = searchParams.get("signature") || "";

  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const zoomClient = ZoomMtgEmbedded.createClient();
    setClient(zoomClient);

    const rootElement = document.getElementById("meetingSDKElement");
    if (!rootElement) return;

    zoomClient.init({
      debug: true,
        zoomAppRoot: rootElement,
        language: "en-US",
        // leaveUrl: formData.leaveUrl,
        patchJsMedia: true,
        leaveOnPageUnload: true,
    }).then(() => {
      zoomClient.join({
        sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || "",
        signature,
        meetingNumber: meetingId,
        userName: username,
        password,
      }).then(() => {
        rootElement.setAttribute("data-join-status", "success");
      }).catch(error => {
        console.error(`Join failed for ${username}:`, error);
        rootElement.setAttribute("data-join-status", "error");
      });
    }).catch(error => console.error("Init failed:", error));
  }, [meetingId, username, password, signature]);

  return <div id="meetingSDKElement" />;
}

export default Meeting;