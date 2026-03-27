import { NextResponse } from 'next/server';
import { fetchGraphQL } from '@/packages/package-fetch-graphql/fetchGraphQL';

/**
 * DEBUG endpoint to list all Gravity Forms entries
 * Access: http://localhost:3000/api/debug-entries
 */
export async function GET() {
  try {
    // Try to get all entries for form ID 3
    const query = `
      query {
        gfForm(id: "3", idType: DATABASE_ID) {
          ... on GfForm {
            databaseId
            title
            entries {
              nodes {
                id
                ... on GfSubmittedEntry {
                  databaseId
                  formDatabaseId
                  formFields {
                    nodes {
                      ... on TextField {
                        id
                        databaseId
                        label
                        value
                      }
                      ... on SelectField {
                        id
                        databaseId
                        label
                        value
                      }
                      ... on EmailField {
                        id
                        databaseId
                        label
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetchGraphQL<{ gfForm: { entries: { nodes: unknown[] } } }>(query);

    return NextResponse.json({
      success: true,
      data: response,
      instructions: {
        message: 'This lists all entries for Form ID 3 (Self-Assessment)',
        howToUse: 'Look for an entry databaseId and use it in /api/report-link/[entryId]'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        instructions: {
          message: 'Failed to fetch entries',
          possibleCauses: [
            'WPGraphQL for Gravity Forms not installed',
            'Permissions issue',
            'Form ID 3 does not exist'
          ]
        }
      },
      { status: 500 }
    );
  }
}
