// "use client";
// import { useState, useEffect } from "react";
// import dynamic from "next/dynamic";

// // Define the type for ZoomMtg (basic structure based on usage)
// interface ZoomMtgType {
//   setZoomJSLib: (lib: string, path: string) => void;
//   preLoadWasm: () => void;
//   prepareWebSDK: () => void;
//   init: (options: {
//     leaveUrl: string;
//     success: () => void;
//     error: (error: any) => void;
//   }) => void;
//   join: (options: {
//     sdkKey: string;
//     signature: string;
//     meetingNumber: string;
//     passWord: string;
//     userName: string;
//     success: () => void;
//     error: (error: any) => void;
//   }) => void;
// }

// // Dynamically import ZoomMtg, specifying we only need ZoomMtg
// const ZoomMtg = dynamic(
//   () =>
//     import("@zoomus/websdk").then((mod) => {
//       return mod.ZoomMtg as ZoomMtgType;
//     }),
//   { ssr: false }
// );

// export default function Home() {
//   const [meetingId, setMeetingId] = useState("");
//   const [password, setPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [isJoining, setIsJoining] = useState(false);

//   // Load Zoom SDK dependencies
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       ZoomMtg.setZoomJSLib("https://source.zoom.us/2.17.0/lib", "/av");
//       ZoomMtg.preLoadWasm();
//       ZoomMtg.prepareWebSDK();
//     }
//   }, []);

//   const joinMeeting = async () => {
//     setIsJoining(true);

//     try {
//       // Fetch signature from API route
//       const response = await fetch("/api/zoom-signature", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ meetingNumber: meetingId }),
//       });
//       const { signature } = await response.json();

//       // Initialize and join the meeting
//       ZoomMtg.init({
//         leaveUrl: window.location.href, // Redirect here after leaving
//         success: () => {
//           ZoomMtg.join({
//             sdkKey: process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID || "", // Public client ID
//             signature: signature,
//             meetingNumber: meetingId,
//             passWord: password,
//             userName: username,
//             success: () => {
//               console.log("Joined meeting successfully");
//             },
//             error: (error: any) => {
//               console.error("Error joining meeting:", error);
//               setIsJoining(false);
//             },
//           });
//         },
//         error: (error: any) => {
//           console.error("Error initializing Zoom:", error);
//           setIsJoining(false);
//         },
//       });
//     } catch (error) {
//       console.error("Error fetching signature:", error);
//       setIsJoining(false);
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Join a Zoom Meeting</h1>
//       <div>
//         <label>
//           Meeting ID:
//           <input
//             type="text"
//             value={meetingId}
//             onChange={(e) => setMeetingId(e.target.value)}
//             disabled={isJoining}
//           />
//         </label>
//       </div>
//       <div>
//         <label>
//           Password:
//           <input
//             type="text"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             disabled={isJoining}
//           />
//         </label>
//       </div>
//       <div>
//         <label>
//           Username:
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             disabled={isJoining}
//           />
//         </label>
//       </div>
//       <button onClick={joinMeeting} disabled={isJoining}>
//         {isJoining ? "Joining..." : "Join Meeting"}
//       </button>
//     </div>
//   );
// }