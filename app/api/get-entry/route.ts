import { NextRequest, NextResponse } from 'next/server';
import { decodeEntryToken } from '@/lib/self-assessment/entry-token';

/**
 * GET /api/get-entry?token=xxx
 * GET /api/get-entry?id=123 (fallback for direct ID)
 *
 * Fetches a Gravity Forms entry from WordPress via custom REST endpoint
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const directId = request.nextUrl.searchParams.get('id');

  let entryId: string | null = null;

  // Prefer token, fallback to direct ID
  if (token) {
    entryId = decodeEntryToken(token);
    if (!entryId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
  } else if (directId) {
    entryId = directId;
  } else {
    return NextResponse.json(
      { error: 'Missing token or entry ID' },
      { status: 400 }
    );
  }

  const WORDPRESS_REST_URL = process.env.WORDPRESS_REST_URL ||
    'http://climate-contribution-framework.local/wp-json';

  try {
    const response = await fetch(`${WORDPRESS_REST_URL}/ccf/v1/entry/${entryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Entry not found' },
          { status: 404 }
        );
      }
      throw new Error(`REST API error: ${response.status}`);
    }

    const entryData = await response.json();

    console.log('[API] Entry fetched successfully:', entryData.entryId);

    return NextResponse.json(entryData);

  } catch (error) {
    console.error('[API] Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
