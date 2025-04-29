"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

// Minimal Zoom Meeting component optimized for automation
const ZoomMeeting = () => {
  const searchParams = useSearchParams()
  const username = searchParams.get("username") || "JohnDoe"
  const meetingId = searchParams.get("meetingId") || "88696681332"
  const password = searchParams.get("password") || "16HHw1"
  const signature = searchParams.get("signature") || ""

  const meetingElementRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true
    let zoomPromise: Promise<any> | null = null

    // Lazy load Zoom SDK only once
    if (!window.zoomPromise) {
      // Create a single promise for loading the SDK
      window.zoomPromise = Promise.all([import("@zoom/meetingsdk"), import("@zoom/meetingsdk/embedded")]).then(
        ([zoomMtg, zoomEmbedded]) => {
          const { ZoomMtg } = zoomMtg
          const ZoomMtgEmbedded = zoomEmbedded.default

          // Configure SDK only once
          if (!window.zoomSDKLoaded) {
            ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.2/lib", "/av")
            ZoomMtg.preLoadWasm()
            ZoomMtg.prepareWebSDK()
            window.zoomSDKLoaded = true
          }

          return { ZoomMtgEmbedded }
        },
      )
    }

    zoomPromise = window.zoomPromise

    const initializeZoom = async () => {
      try {
        // Wait for SDK to load
        const { ZoomMtgEmbedded } = await zoomPromise

        if (!isMounted || !meetingElementRef.current) return

        // Create client only once
        if (!clientRef.current) {
          clientRef.current = ZoomMtgEmbedded.createClient()
        }

        const client = clientRef.current

        // Initialize client with minimal options
        await client.init({
          debug: false,
          zoomAppRoot: meetingElementRef.current,
          language: "en-US",
          patchJsMedia: true,
          leaveOnPageUnload: true,
        })

        if (!isMounted) return

        // Join meeting
        await client.join({
          sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || "",
          signature,
          meetingNumber: meetingId,
          userName: username,
          password,
        })

        if (!isMounted) return

        // Get current user's ID and mute audio
        const userId = client.getCurrentUser()?.userId
        if (userId) {
          await client.mute(true, userId)
        }

        // Add data attribute for Playwright to detect when meeting is joined
        if (meetingElementRef.current) {
          meetingElementRef.current.setAttribute("data-meeting-joined", "true")
        }
      } catch (err) {
        console.error("Zoom meeting error:", err)
        // Add data attribute for Playwright to detect errors
        if (meetingElementRef.current) {
          meetingElementRef.current.setAttribute("data-meeting-error", "true")
        }
      }
    }

    initializeZoom()

    // Cleanup function
    return () => {
      isMounted = false
      if (clientRef.current) {
        try {
          clientRef.current.leave()
        } catch (err) {
          console.error("Error leaving meeting:", err)
        }
      }
    }
  }, [meetingId, username, password, signature])

  // Only render the container for the Zoom SDK
  return <div id="meetingSDKElement" ref={meetingElementRef} style={{ width: "100%", height: "100%" }} />
}

// Add this to the window object for TypeScript
declare global {
  interface Window {
    zoomSDKLoaded?: boolean
    zoomPromise?: Promise<any>
  }
}

export default ZoomMeeting
