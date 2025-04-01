"use client";
import "./test.css";
import { ZoomMtg } from "@zoom/meetingsdk";
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";
import { useCallback, useState, ChangeEvent, useEffect } from "react";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.2/lib", "/av"); // Updated to latest version
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

function Meeting({ username, meetingId, password }: MeetingProps) {
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
    leaveUrl: "http://localhost:3000",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const zoomClient = ZoomMtgEmbedded.createClient();
      setClient(zoomClient);
    }
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      meetingNumber: meetingId,
      userName: username,
      password: password
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
        headers: { "Content-Type": "application/json" }, // Fixed typo
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
        zoomAppRoot: rootElement, // Fixed parameter name from zoomMeetingRoot
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
      
      console.log("Joined successfully");
    } catch (error) {
      console.error("Error in init or join:", error);
    }
  };

  return (
    <div className="Meeting">
      <main>
        <h1>Zoom Meeting SDK Sample React</h1>

        {(!meetingId || !username || !password) && (
          <div style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc" }}>
            <h2>Enter Meeting Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
              <label>
                SDK Key:
                <input type="text" name="sdkKey" value={formData.sdkKey} onChange={handleInputChange} />
              </label>
              <label>
                Meeting Number:
                <input type="text" name="meetingNumber" value={formData.meetingNumber} onChange={handleInputChange} />
              </label>
              <label>
                User Name:
                <input type="text" name="userName" value={formData.userName} onChange={handleInputChange} />
              </label>
              <label>
                Password:
                <input type="text" name="password" value={formData.password} onChange={handleInputChange} />
              </label>
            </div>
            <button onClick={getSignature} disabled={!client}>
              Join Meeting
            </button>
          </div>
        )}

        <div id="meetingSDKElement">
          {/* Zoom Meeting SDK Component View Rendered Here */}
        </div>
      </main>
    </div>
  );
}

export default Meeting;