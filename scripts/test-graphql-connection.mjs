/**
 * Script pour tester la connexion GraphQL et vérifier Gravity Forms
 */

const GRAPHQL_URL = 'http://climate-contribution-framework.local/graphql';

async function testGraphQL() {
  console.log('🔍 Testing GraphQL connection...\n');
  console.log(`URL: ${GRAPHQL_URL}\n`);

  // Test 1: Vérifier que l'endpoint GraphQL répond
  console.log('Test 1: Basic GraphQL connection');
  const basicQuery = `
    query {
      generalSettings {
        title
        url
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: basicQuery }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }

    const data = await response.json();

    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return;
    }

    console.log('✅ GraphQL connection successful');
    console.log('Site:', data.data.generalSettings.title);
    console.log('URL:', data.data.generalSettings.url);
    console.log('');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return;
  }

  // Test 2: Vérifier WPGraphQL for Gravity Forms
  console.log('Test 2: Check if WPGraphQL for Gravity Forms is active');
  const gfQuery = `
    query {
      gfForms(first: 1) {
        nodes {
          databaseId
          title
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: gfQuery }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('❌ WPGraphQL for Gravity Forms not available');
      console.error('Errors:', data.errors.map(e => e.message).join(', '));
      console.log('\n⚠️  Please install and activate "WPGraphQL for Gravity Forms" plugin');
      console.log('   Download: https://github.com/AxeWP/wp-graphql-gravity-forms');
      return;
    }

    console.log('✅ WPGraphQL for Gravity Forms is active');
    if (data.data.gfForms.nodes.length > 0) {
      console.log(`Found ${data.data.gfForms.nodes.length} form(s):`);
      data.data.gfForms.nodes.forEach(form => {
        console.log(`  - ID: ${form.databaseId}, Title: ${form.title}`);
      });
    } else {
      console.log('⚠️  No forms found in Gravity Forms');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error checking Gravity Forms:', error.message);
    return;
  }

  // Test 3: Tester la requête exacte utilisée par useGravityForm
  console.log('Test 3: Test exact query from useGravityForm hook (formId=1)');
  const formQuery = `
    query GetGravityForm($id: ID!) {
      gfForm(id: $id, idType: DATABASE_ID) {
        databaseId
        title
        formFields(first: 200) {
          nodes {
            databaseId
            type
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: formQuery,
        variables: { id: 1 }
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('❌ Error fetching form ID 1:');
      console.error('Errors:', data.errors.map(e => e.message).join(', '));
      console.log('\n💡 Possible issues:');
      console.log('   1. Form ID 1 does not exist');
      console.log('   2. WPGraphQL for Gravity Forms needs configuration');
      console.log('   3. Gravity Forms plugin is not active');
      return;
    }

    if (!data.data.gfForm) {
      console.error('❌ Form ID 1 not found');
      console.log('\n💡 Create the form using the script:');
      console.log('   http://climate-contribution-framework.local/create-contact-form.php');
      return;
    }

    console.log('✅ Form fetched successfully');
    console.log(`   ID: ${data.data.gfForm.databaseId}`);
    console.log(`   Title: ${data.data.gfForm.title}`);
    console.log(`   Fields: ${data.data.gfForm.formFields.nodes.length}`);
    console.log('');

    console.log('🎉 All tests passed! Your setup is correct.');
  } catch (error) {
    console.error('❌ Error testing form query:', error.message);
  }
}

testGraphQL().catch(console.error);
