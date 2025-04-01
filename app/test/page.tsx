'use client'; // Add this if using Next.js App Router with client-side features

import Meeting from '@/components/zoom/page';
import React from 'react';
import { useSearchParams } from 'next/navigation'; // For Next.js App Router

const Page = () => {
    console.log("opened page");
    const searchParams = useSearchParams(); 
    const username = searchParams.get('username') || 'JohnDoe';
    const meetingId = searchParams.get('meetingId') || '88696681332';
    const password = searchParams.get('password') || '16HHw1';

    return (
        <>
            <Meeting
                username={username}
                meetingId={meetingId}
                password={password}
            />
        </>
    );
};

export default Page;