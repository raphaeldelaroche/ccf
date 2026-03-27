import { NextRequest, NextResponse } from 'next/server';
import { fetchGraphQL } from '@/packages/package-fetch-graphql/fetchGraphQL';
import { generateToken } from '@/lib/self-assessment/token-utils';

/**
 * GraphQL query to fetch a Gravity Forms entry by ID
 */
const GET_ENTRY_QUERY = `
  query GetEntry($id: ID!) {
    gfEntry(id: $id, idType: DATABASE_ID) {
      ... on GfSubmittedEntry {
        databaseId
        formFields {
          nodes {
            ... on TextField {
              id
              databaseId
              value
            }
            ... on SelectField {
              id
              databaseId
              value
            }
            ... on EmailField {
              id
              databaseId
              value
            }
          }
        }
      }
    }
  }
`;

interface GfEntryResponse {
  gfEntry: {
    databaseId: number;
    formFields: {
      nodes: Array<{
        id: string;
        databaseId: number;
        value?: string;
      }>;
    };
  };
}

/**
 * GET /api/report-link/[entryId]
 *
 * This route is accessed from Gravity Forms email notifications.
 * It fetches the entry data, generates a JWT token, and redirects to the report page.
 *
 * Example: https://site.com/api/report-link/123
 * Redirects to: https://site.com/self-assessment-report?token=xxx
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;

    // Validate entry ID
    if (!entryId || isNaN(Number(entryId))) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching Gravity Forms entry ${entryId}`);

    // Fetch the entry from WordPress
    let response: GfEntryResponse;
    try {
      response = await fetchGraphQL<GfEntryResponse>(
        GET_ENTRY_QUERY,
        { id: entryId }
      );
      console.log(`[API] GraphQL response:`, JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(`[API] GraphQL error for entry ${entryId}:`, error);
      return NextResponse.json(
        {
          error: 'Failed to fetch entry from WordPress',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (!response?.gfEntry) {
      console.error(`[API] Entry ${entryId} not found in response`);
      console.error(`[API] Full response:`, JSON.stringify(response, null, 2));
      return NextResponse.json(
        {
          error: 'Entry not found',
          details: 'The entry ID may not exist or the form may not have been submitted yet'
        },
        { status: 404 }
      );
    }

    // Extract field values from the entry
    // Field IDs for Self-Assessment Form (Form ID: 3):
    // 1: Sector
    // 3: Company Size
    // 5: Geography
    // 6: Email
    const fields = response.gfEntry.formFields.nodes;

    const getFieldValue = (fieldId: number): string => {
      const field = fields.find(f => f.databaseId === fieldId);
      if (!field) return '';
      return field.value || '';
    };

    const sector = getFieldValue(1);
    const size = getFieldValue(3);
    const geography = getFieldValue(5);
    const email = getFieldValue(6);

    // Validate required fields
    if (!sector) {
      console.error(`[API] Entry ${entryId} missing sector field`);
      return NextResponse.json(
        { error: 'Invalid entry data: missing sector' },
        { status: 400 }
      );
    }

    console.log(`[API] Entry ${entryId} data:`, { sector, size, geography, email: email ? '***' : 'missing' });

    // Generate JWT token
    const token = generateToken({
      sector,
      size,
      geography,
      email,
      entryId: Number(entryId),
    });

    console.log(`[API] Generated token for entry ${entryId}`);

    // Get the base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    request.nextUrl.origin;

    // Redirect to the report page with token
    const redirectUrl = `${baseUrl}/self-assessment-report?token=${token}`;

    console.log(`[API] Redirecting to: ${redirectUrl.replace(token, 'TOKEN_HIDDEN')}`);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('[API] Error in report-link route:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
