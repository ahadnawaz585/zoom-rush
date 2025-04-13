import React from 'react';

const ZoomMeetingPage = () => {
  const meetingId = '86292340058';
  const password = '0';
  // Extend usernames to ensure we have at least 10
  const baseUsernames = ['ahad', 'ali', 'ahmad'];
  const usernames = Array.from({ length: 100 }, (_, i) => 
    i < baseUsernames.length 
      ? baseUsernames[i] 
      : `user${i + 1}`
  ); 7
  
  const signature = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBLZXkiOiJBUW85Z0JsUlRBYWlLdWlzeGwzaUEiLCJzZGtLZXkiOiJBUW85Z0JsUlRBYWlLdWlzeGwzaUEiLCJtbiI6Ijg2MjkyMzQwMDU4Iiwicm9sZSI6MCwiaWF0IjoxNzQ0NDY1NjA3LCJleHAiOjE3NDQ0NjkyMDcsInRva2VuRXhwIjoxNzQ0NDY5MjA3fQ.dyj2o74xvgVyWVMWJkji5QH1ZHuIp5cT_fXFZ1gYiT0';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '20px' }}>
      {usernames.map((username, index) => {
        const iframeUrl = `https://zoom-bots.vercel.app/meeting?username=${encodeURIComponent(username)}&meetingId=${meetingId}&password=${password}&signature=${signature}`;
        return (
          <iframe
            key={index}
            src={iframeUrl}
            width="100%"
            height="400px"
            style={{ border: '1px solid #ccc' }}
            allow="camera; microphone"
            title={`Zoom Meeting ${username}`}
          />
        );
      })}
    </div>
  );
};

export default ZoomMeetingPage;