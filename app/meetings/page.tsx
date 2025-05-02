"use client";
import React, { useEffect, useRef, useState } from 'react';
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
  const [statusMessages, setStatusMessages] = useState<string[]>(
    usernames.map(() => 'Loading...')
  );
  
  useEffect(() => {
    // Create a channel for each iframe to communicate with the parent
    const channels = usernames.map((username, index) => {
      const channel = new BroadcastChannel(`zoom-meeting-${username}-${index}`);
      
      channel.onmessage = (event) => {
        const { type, message } = event.data;
        
        if (type === 'status') {
          setStatusMessages(prev => {
            const updated = [...prev];
            updated[index] = message;
            return updated;
          });
        }
      };
      
      return channel;
    });
    
    // Function to send commands to child iframes
    const sendCommandToIframe = (index: number, command: string) => {
      if (!iframeRefs.current[index]) return;
      
      try {
        const message = { type: 'command', command };
        channels[index].postMessage(message);
      } catch (error) {
        console.error(`Error sending command to iframe ${index}:`, error);
      }
    };
    
    // Periodically send mute command to ensure bots stay muted
    const muteIntervals = usernames.map((_, index) => {
      if (forceMute) {
        return setInterval(() => {
          sendCommandToIframe(index, 'mute');
        }, 10000); // Every 10 seconds
      }
      return null;
    });
    
    // Cleanup intervals and channels on unmount
    return () => {
      muteIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
      });
      
      channels.forEach(channel => {
        channel.close();
      });
    };
  }, [usernames, forceMute]);

  // Build URL with parameters
  const buildIframeUrl = (username: string, index: number) => {
    let url = `${process.env.NEXT_PUBLIC_CLIENT_URL || ''}/meeting?username=${encodeURIComponent(username)}&meetingId=${meetingId}&password=${password}&signature=${signature}`;
    
    // Add optimization parameters if needed
    if (optimized) url += '&optimized=true';
    if (noVideo) url += '&noVideo=true';
    if (noAudio) url += '&noAudio=true';
    if (forceMute) url += '&forceMute=true';
    if (lowRes) url += '&lowRes=true';
    
    // Add index to identify this specific iframe
    url += `&frameIndex=${index}`;
    
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
        const iframeUrl = buildIframeUrl(username, index);
        return (
          <div key={index} style={{ position: 'relative' }}>
            <div style={{
              backgroundColor: '#2D8CFF',
              color: 'white',
              padding: '8px',
              borderRadius: '4px 4px 0 0',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>{username}</span>
              <span>{statusMessages[index]}</span>
            </div>
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