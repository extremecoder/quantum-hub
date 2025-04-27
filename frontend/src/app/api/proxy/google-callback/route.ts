import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Using process.env.NEXT_PUBLIC_AUTH_SERVICE_URL if available, falling back to localhost:8001/api/v1
    const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8001/api/v1';
    const googleCallbackUrl = `${authServiceUrl}/auth/google/callback`;

    console.log('Proxying Google callback request to:', googleCallbackUrl);

    // Forward the request to our backend
    const response = await fetch(googleCallbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: body.code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Google authentication failed',
          detail: errorData.detail || 'Unknown error occurred'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Google authentication failed', detail: 'Server error' },
      { status: 500 }
    );
  }
}
