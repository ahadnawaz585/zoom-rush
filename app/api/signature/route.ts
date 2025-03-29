import { NextRequest, NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
//   try {
//     const { meetingNumber, role } = await req.json();

//     if (!meetingNumber || typeof role !== 'number') {
//       return NextResponse.json(
//         { error: 'Missing or invalid meetingNu  mber or role' },
//         { status: 400 }
//       );
//     }

//     const sdkKey = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY;
//     const sdkSecret = process.env.NEXT_PUBLIC_ZOOM_SDK_SECRET;

//     console.log('ZOOM_SDK_KEY:', sdkKey); // Debug log
//     console.log('ZOOM_SDK_SECRET:', sdkSecret); // Debug log

//     if (!sdkKey || !sdkSecret) {
//       return NextResponse.json(
//         { error: 'Server configuration error: Missing Zoom SDK credentials' },
//         { status: 500 }
//       );
//     }

//     const iat = Math.round(Date.now() / 1000) - 30;
//     const exp = iat + 60 * 60 * 2; // Signature valid for 2 hours

//     const payload = {
//       sdkKey,
//       mn: meetingNumber,
//       role,
//       iat,
//       exp,
//     };

//     const signature = jwt.sign(payload, sdkSecret, { algorithm: 'HS256' });
//     return NextResponse.json({ signature }, { status: 200 });
//   } catch (error) {
//     console.error('Signature generation error:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate signature' },
//       { status: 500 }
//     );
//   }
}