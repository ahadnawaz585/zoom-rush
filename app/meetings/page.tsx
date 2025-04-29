"use client"
import React from 'react';
import { useSearchParams } from 'next/navigation';

const ZoomMeetingPage = () => {
  const searchParams = useSearchParams();
  const usernames = searchParams.get('usernames')?.split(',').slice(0, 50) || ['JohnDoe'];
  const meetingId = searchParams.get('meetingId') || '88696681332';
  const password = searchParams.get('password') || '16HHw1';
  const signature = searchParams.get('signature') || '';


  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '20px' }}>
      {usernames.map((username, index) => {
        const iframeUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/meeting?username=${encodeURIComponent(username)}&meetingId=${meetingId}&password=${password}&signature=${signature}`;
        return (
          <iframe
            key={index}
            src={process.env.NODE_ENV === 'test' ? 'about:blank' : iframeUrl} 
            width="100%"
            height="400px"
            style={{ border: '1px solid #ccc' }}
            allow="camera; microphone"
            title={`Zoom Meeting ${username}`}
            loading="lazy"
          />
        );
      })}
    </div>
  );
};

export default ZoomMeetingPage;