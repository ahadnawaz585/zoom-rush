'use client'; // Ensure this is a client component

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Meeting component with SSR disabled
const Meeting = dynamic(() => import('@/components/zoom/meeting'), {
  ssr: false, // Prevents server-side rendering
});

const Page = () => {
  return (
    <>
      <Meeting />
    </>
  );
};

export default Page;