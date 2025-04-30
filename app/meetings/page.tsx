"use client"
import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const ZoomMeetingPage = () => {
  const searchParams = useSearchParams();
  const usernames = searchParams.get('usernames')?.split(',').slice(0, 50) || ['JohnDoe'];
  const meetingId = searchParams.get('meetingId') || '88696681332';
  const password = searchParams.get('password') || '16HHw1';
  const signature = searchParams.get('signature') || '';
  const optimized = searchParams.get('optimized') === 'true';
  const noVideo = searchParams.get('noVideo') === 'true';
  const noAudio = searchParams.get('noAudio') === 'true';
  const forceMute = searchParams.get('forceMute') === 'true';
  const lowRes = searchParams.get('lowRes') === 'true';
  
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  
  useEffect(() => {
    // Function to check if iframe is loaded
    const checkIframeLoaded = (iframe: HTMLIFrameElement | null, index: number) => {
      if (!iframe) return;
      
      try {
        // Try to access the iframe's contentWindow to check if it's loaded
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.document) {
          console.log(`Iframe ${index} loaded for ${usernames[index]}`);
          
          // Add any post-load logic here, like checking mute status
          // This needs to be carefully implemented due to same-origin policy
        }
      } catch (error) {
        // This might fail due to same-origin policy if the iframe is on a different domain
        console.error(`Error checking iframe ${index} load status:`, error);
      }
    };
    
    // Check iframe loading status periodically
    const checkIntervals = iframeRefs.current.map((iframe, index) => {
      if (!iframe) return null;
      
      return setInterval(() => {
        checkIframeLoaded(iframe, index);
      }, 5000); // Check every 5 seconds
    });
    
    // Cleanup intervals on unmount
    return () => {
      checkIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [usernames]);

  // Build URL with parameters
  const buildIframeUrl = (username: string) => {
    let url = `${process.env.NEXT_PUBLIC_CLIENT_URL}/meeting?username=${encodeURIComponent(username)}&meetingId=${meetingId}&password=${password}&signature=${signature}`;
    
    // Add optimization parameters if needed
    if (optimized) url += '&optimized=true';
    if (noVideo) url += '&noVideo=true';
    if (noAudio) url += '&noAudio=true';
    if (forceMute) url += '&forceMute=true';
    if (lowRes) url += '&lowRes=true';
    
    return url;
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '20px', 
      padding: '20px' 
    }}>
      {usernames.map((username, index) => {
        const iframeUrl = buildIframeUrl(username);
        return (
          <div key={index} style={{ position: 'relative' }}>
            <iframe
              ref={el => {
                iframeRefs.current[index] = el;
              }}
              src={process.env.NODE_ENV === 'test' ? 'about:blank' : iframeUrl} 
              width="100%"
              height="300px"
              style={{ 
                border: '1px solid #ccc',
                borderTop: 'none',
                borderRadius: '0 0 4px 4px' 
              }}
              allow="camera; microphone"
              title={`Zoom Meeting ${username}`}
              loading="lazy"
            />
          </div>
        );
      })}
    </div>
  );
};

export default ZoomMeetingPage;