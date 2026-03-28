import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/get-entry-direct?id=123
 *
 * Fetches a Gravity Forms entry DIRECTLY from WordPress database
 * Bypasses GraphQL - uses direct MySQL query via WordPress REST API
 */
export async function GET(request: NextRequest) {
  const entryId = request.nextUrl.searchParams.get('id');

  if (!entryId) {
    return NextResponse.json(
      { error: 'Missing entry ID' },
      { status: 400 }
    );
  }

  // WordPress REST API endpoint for Gravity Forms entries
  // This requires the Gravity Forms REST API to be enabled
  const WORDPRESS_REST_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/gf/v2`;

  try {
    // Fetch entry from GF REST API
    const response = await fetch(`${WORDPRESS_REST_URL}/entries/${entryId}`, {
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

    const entry = await response.json();

    // Extract field values by field ID
    const entryData = {
      entryId: entry.id,
      formId: entry.form_id,
      sector: entry['1'] || '',      // Field ID 1: Sector
      size: entry['3'] || '',         // Field ID 3: Size
      geography: entry['5'] || '',    // Field ID 5: Geography
      email: entry['6'] || '',        // Field ID 6: Email
    };

    console.log('[API] Entry fetched successfully (direct):', entryData.entryId);

    return NextResponse.json(entryData);

  } catch (error) {
    console.error('[API] Error fetching entry (direct):', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch entry',
        message: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure Gravity Forms REST API is enabled in WP Admin → Forms → Settings → REST API'
      },
      { status: 500 }
    );
  }
}
