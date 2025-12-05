import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    // Fetch the image from the Google Drive URL.
    // The fetch call on the server can handle redirects.
    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    // Get the image data as a buffer.
    const imageBuffer = await response.arrayBuffer();
    
    // Get the content type from the original response.
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image data with the correct content type.
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
