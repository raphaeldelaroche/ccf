import { NextRequest, NextResponse } from 'next/server';
import { getReportLink } from '@/lib/self-assessment/report-link-store';
import { generateToken } from '@/lib/self-assessment/token-utils';

/**
 * GET /api/report/[linkId]
 *
 * Short, clean URL for email links
 * Example: https://site.com/api/report/abc123
 *
 * Retrieves data from store, generates JWT, and redirects to report
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;

    console.log(`[API] Accessing report link: ${linkId}`);

    // Get data from store
    const data = getReportLink(linkId);

    if (!data) {
      return NextResponse.json(
        {
          error: 'Link not found or expired',
          message: 'This link may have expired (7 days) or does not exist. Please request a new assessment.'
        },
        { status: 404 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      sector: data.sector,
      size: data.size,
      geography: data.geography,
      email: data.email,
    });

    console.log(`[API] Generated token for link ${linkId}`);

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    request.nextUrl.origin;

    // Redirect to report with token
    const redirectUrl = `${baseUrl}/self-assessment-report?token=${token}`;

    console.log(`[API] Redirecting to report page`);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('[API] Error in report link route:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
