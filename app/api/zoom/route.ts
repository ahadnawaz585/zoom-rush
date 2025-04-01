// app/api/zoom/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { KJUR } from 'jsrsasign';
import { inNumberArray, isBetween, isRequiredAllOrNone, validateRequest } from '@/lib/validation';

interface RawRequestBody {
  meetingNumber?: string | number;
  role?: string | number;
  expirationSeconds?: string | number;
}

interface CoercedRequestBody {
  meetingNumber?: number;
  role?: number;
  expirationSeconds?: number;
}

interface ValidationError {
  field: string;
  message: string;
}

const propValidations = {
  role: inNumberArray([0, 1]),
  expirationSeconds: isBetween(1800, 172800),
};

const schemaValidations = [isRequiredAllOrNone(['meetingNumber', 'role'])];

const coerceRequestBody = (body: RawRequestBody): CoercedRequestBody => {
  const result: CoercedRequestBody = {};
  
  if (body.meetingNumber !== undefined) {
    result.meetingNumber = typeof body.meetingNumber === 'string' 
      ? parseInt(body.meetingNumber) 
      : body.meetingNumber;
  }
  
  if (body.role !== undefined) {
    result.role = typeof body.role === 'string' 
      ? parseInt(body.role) 
      : body.role;
  }
  
  if (body.expirationSeconds !== undefined) {
    result.expirationSeconds = typeof body.expirationSeconds === 'string' 
      ? parseInt(body.expirationSeconds) 
      : body.expirationSeconds;
  }

  return result;
};

export async function POST(req: NextRequest) {
  console.log('Method:', req.method);

  // Read the body once and store it
  const rawBody = await req.json();
  console.log('Body:', rawBody);

  const requestBody = coerceRequestBody(rawBody);
  console.log('Coerced request body:', requestBody);

  const validationErrors = validateRequest(requestBody, propValidations, schemaValidations);
  const { meetingNumber, role } = requestBody;
  // Fixed expiration to 60 seconds
  const expirationSeconds = 100;

  if (validationErrors.length > 0) {
    console.log('Validation errors:', validationErrors);
    return NextResponse.json({ errors: validationErrors }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY || !process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_SECRET) {
    return NextResponse.json({ error: 'Zoom SDK credentials are not configured' }, { status: 500 });
  }

  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + expirationSeconds;

  const Header = {
    alg: 'HS256' as const,
    typ: 'JWT' as const,
  };

  const Payload = {
    appKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
    sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
    mn: meetingNumber,
    role: role,
    iat: iat,
    exp: exp,
    tokenExp: exp,
  };

  const signature = KJUR.jws.JWS.sign(
    'HS256',
    JSON.stringify(Header),
    JSON.stringify(Payload),
    process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_SECRET
  );

  console.log('Generated signature:', signature);
  return NextResponse.json({
    signature: signature,
    sdkKey: process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY,
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}