import { NextResponse } from 'next/server';

/**
 * GET /api/list-entries
 *
 * Lists all entries from form ID 3 for debugging
 */
export async function GET() {
  const WORDPRESS_GRAPHQL_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`;

  const query = `
    query {
      gfForm(id: "3", idType: DATABASE_ID) {
        ... on GfForm {
          databaseId
          title
          entries(first: 50) {
            nodes {
              ... on GfSubmittedEntry {
                databaseId
                dateCreated
                formFields {
                  nodes {
                    ... on TextField {
                      databaseId
                      label
                      value
                    }
                    ... on SelectField {
                      databaseId
                      label
                      value
                    }
                    ... on EmailField {
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

  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      console.error('[API] GraphQL errors:', errors);
      return NextResponse.json(
        { error: 'GraphQL query failed', details: errors },
        { status: 500 }
      );
    }

    const entries = data?.gfForm?.entries?.nodes || [];

    // Format entries for easier reading
    const formattedEntries = entries.map((entry: { databaseId: number; dateCreated: string; formFields: { nodes: { label: string; value: string }[] } }) => {
      const fields: Record<string, string> = {};
      entry.formFields.nodes.forEach((field: { label: string; value: string }) => {
        fields[field.label] = field.value;
      });

      return {
        id: entry.databaseId,
        dateCreated: entry.dateCreated,
        fields
      };
    });

    return NextResponse.json({
      totalEntries: formattedEntries.length,
      entries: formattedEntries
    });

  } catch (error) {
    console.error('[API] Error listing entries:', error);
    return NextResponse.json(
      { error: 'Failed to list entries', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
