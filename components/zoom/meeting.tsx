"use client";
import "./test.css";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useCallback, useState, ChangeEvent, useEffect } from "react";
import { useSearchParams } from 'next/navigation'; // For Next.js App Router

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.2/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

interface ZoomConfig {
  signature: string;
  sdkKey: string;
}

interface MeetingParams {
  meetingNumber: string;
  role: number;
}

interface MeetingFormData {
  sdkKey: string;
  meetingNumber: string;
  userName: string;
  password: string;
  userEmail: string;
  role: number;
  registrantToken: string;
  zakToken: string;
  leaveUrl: string;
}

interface MeetingProps {
  username: string;
  meetingId: string;
  password: string;
}

function Meeting() {

      console.log("opened page");
      const searchParams = useSearchParams(); 
      const username = searchParams.get('username') || 'JohnDoe';
      const meetingId = searchParams.get('meetingId') || '88696681332';
      const password = searchParams.get('password') || '16HHw1';

  const [client, setClient] = useState<any>(null);
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);

  const [formData, setFormData] = useState<MeetingFormData>({
    sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || "",
    meetingNumber: meetingId || "",
    userName: username || "",
    password: password || "",
    userEmail: "",
    role: 0,
    registrantToken: "",
    zakToken: "",
    leaveUrl: process.env.NEXT_PUBLIC_ZOOM_REDIRECT_URI || "http://localhost:3000",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const zoomClient = ZoomMtgEmbedded.createClient();
      setClient(zoomClient);
    }
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      meetingNumber: meetingId,
      userName: username,
      password: password,
    }));
  }, [meetingId, username, password]);

  useEffect(() => {
    if (client && meetingId && username && password && !isMeetingStarted) {
      getSignature();
      setIsMeetingStarted(true);
    }
  }, [client, meetingId, username, password, isMeetingStarted]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "role" ? parseInt(value, 10) : value,
    }));
  };

  const getSignature = useCallback(async () => {
    if (!client) {
      console.error("Zoom client not initialized yet");
      return;
    }

    try {
      const response = await fetch("/api/zoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingNumber: formData.meetingNumber,
          role: formData.role,
        } as MeetingParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ZoomConfig = await response.json();
      await startMeeting(data);
    } catch (error) {
      console.error("Error getting signature:", error);
    }
  }, [client, formData.meetingNumber, formData.role]);

  const startMeeting = async ({ signature, sdkKey }: ZoomConfig) => {
    if (!client) {
      console.error("Zoom client not initialized yet");
      return;
    }

    const rootElement = document.getElementById("meetingSDKElement");
    if (!rootElement) {
      console.error("Meeting SDK element not found in DOM");
      return;
    }

    try {
      await client.init({
        debug: true,
        zoomAppRoot: rootElement,
        language: "en-US",
        leaveUrl: formData.leaveUrl,
        patchJsMedia: true,
        leaveOnPageUnload: true,
      });

      await client.join({
        sdkKey: sdkKey || formData.sdkKey,
        signature: signature,
        meetingNumber: formData.meetingNumber,
        userName: formData.userName,
        password: formData.password,
        userEmail: formData.userEmail,
        tk: formData.registrantToken,
        zak: formData.zakToken,
      });

      // Signal success for Playwright to detect
      console.log(`Bot ${formData.userName} joined successfully`);
      // Optionally update DOM for more reliable detection
      rootElement.setAttribute("data-join-status", "success");
    } catch (error) {
      console.error("Error in init or join:", error);
      throw error; // Re-throw to fail the Playwright wait
    }
  };

  return (
    <div id="meetingSDKElement">
      {/* Zoom Meeting SDK Component View Rendered Here */}
    </div>
  );
}

export default Meeting;