import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Proxy endpoint for the /token API to avoid CORS issues
 * @param {NextRequest} req - The incoming request
 * @returns {NextResponse} - The response from the auth service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Using process.env.BACKEND_URL if available, falling back to localhost:8000
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const tokenUrl = `${backendUrl}/token`;
    
    console.log('Proxying token request to:', tokenUrl);
    
    // Send the request to the auth service
    const response = await axios.post(
      tokenUrl,
      {
        username: body.username,
        password: body.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Return the response from the auth service
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Token proxy error:', error.message);
    
    // Pass through any error status and message from the auth service
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || 'An error occurred while authenticating';
    
    return new NextResponse(
      JSON.stringify({ error: message }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
