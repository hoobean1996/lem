/**
 * Simple test script for the Lemonade SDK
 * Run with: npm test
 */

const { LemonadeClient } = require('./dist/client');

const API_KEY = process.env.LEMONADE_API_KEY || 'your-api-key';
const ACCESS_TOKEN = process.env.LEMONADE_ACCESS_TOKEN || 'your-access-token';

async function main() {
  console.log('🍋 Testing Lemonade SDK\n');

  // Initialize client
  const client = new LemonadeClient({
    apiKey: API_KEY,
    baseUrl: 'https://api.gigaboo.sg',
  });

  // Set existing access token
  client.setAccessToken(ACCESS_TOKEN);

  try {
    // Test 1: List subscription plans
    console.log('1. Fetching subscription plans...');
    const plans = await client.subscriptions.listPlans();
    console.log(`   ✅ Found ${plans.length} plans:`);
    plans.forEach(plan => {
      console.log(`      - ${plan.name}: $${(plan.price_cents || 0) / 100}/${plan.billing_interval}`);
    });

    // Test 2: Get current user
    console.log('\n2. Fetching current user...');
    const user = await client.auth.me();
    console.log(`   ✅ Logged in as: ${user.email} (ID: ${user.id})`);

    // Test 3: Get current subscription
    console.log('\n3. Fetching current subscription...');
    const subscription = await client.subscriptions.getCurrent();
    if (subscription) {
      console.log(`   ✅ Subscription status: ${subscription.status}`);
    } else {
      console.log('   ✅ No active subscription');
    }

    // Test 4: Check storage status
    console.log('\n4. Checking storage status...');
    const storageStatus = await client.storage.status();
    console.log(`   ✅ Storage configured: ${storageStatus.configured}`);

    // Test 5: Check email status
    console.log('\n5. Checking email status...');
    const emailStatus = await client.email.status();
    console.log(`   ✅ Email configured: ${emailStatus.success}`);

    // Test 6: List organizations
    console.log('\n6. Listing organizations...');
    const orgs = await client.organizations.list();
    console.log(`   ✅ Found ${orgs.organizations?.length || 0} organizations`);

    console.log('\n🎉 All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
    if (error.body) {
      console.error('   Details:', JSON.stringify(error.body, null, 2));
    }
  }
}

main();
