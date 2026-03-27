import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/self-assessment/token-utils';
import { createReportLink } from '@/lib/self-assessment/report-link-store';

/**
 * POST /api/generate-report-link
 *
 * Generates a report link with JWT token from form data.
 * This is called after successful Gravity Forms submission.
 *
 * Body: { sector, size, geography, email }
 * Returns: { reportUrl, token }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sector, size, geography, email } = body;

    // Validate required fields
    if (!sector) {
      return NextResponse.json(
        { error: 'Missing required field: sector' },
        { status: 400 }
      );
    }

    console.log('[API] Generating report link for:', { sector, size, geography, email: email ? '***' : 'none' });

    // Generate JWT token
    const token = generateToken({
      sector,
      size: size || '',
      geography: geography || '',
      email: email || '',
    });

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    request.nextUrl.origin;

    // Create short link ID
    const linkId = createReportLink({
      sector,
      size: size || '',
      geography: geography || '',
      email: email || '',
    });

    const shortUrl = `${baseUrl}/api/report/${linkId}`;
    const reportUrl = `${baseUrl}/self-assessment-report?token=${token}`;

    console.log('[API] Generated report link successfully');

    return NextResponse.json({
      success: true,
      reportUrl,
      shortUrl, // New: short URL for emails
      linkId,   // New: the ID itself
      token,
    });

  } catch (error) {
    console.error('[API] Error generating report link:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate report link',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-report-link?sector=technology&size=pme&geography=europe&email=test@example.com
 *
 * Alternative GET endpoint for testing or direct link generation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sector = searchParams.get('sector');
    const size = searchParams.get('size') || '';
    const geography = searchParams.get('geography') || '';
    const email = searchParams.get('email') || '';

    if (!sector) {
      return NextResponse.json(
        { error: 'Missing required parameter: sector' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      sector,
      size,
      geography,
      email,
    });

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    request.nextUrl.origin;

    const reportUrl = `${baseUrl}/self-assessment-report?token=${token}`;

    // Redirect directly to the report
    return NextResponse.redirect(reportUrl);

  } catch (error) {
    console.error('[API] Error generating report link:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate report link',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
