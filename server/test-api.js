// Simple API test script
// Run with: node test-api.js

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing SSG InnoVoice API...\n');

  // Test 1: Health check
  try {
    console.log('1️⃣  Testing health check endpoint...');
    const response = await fetch(BASE_URL);
    const data = await response.json();
    console.log('✅ Health check passed:', data.message);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Create suggestion with validation
  try {
    console.log('\n2️⃣  Testing suggestion creation with validation...');
    const response = await fetch(`${BASE_URL}/api/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'academic',
        title: 'Test Suggestion',
        content: 'This is a test suggestion to verify the API works correctly.',
        isAnonymous: true
      })
    });
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Suggestion created successfully');
      console.log('   Tracking Code:', data.data.trackingCode);
      console.log('   Priority:', data.data.priority);
      
      // Test 3: Track suggestion
      console.log('\n3️⃣  Testing suggestion tracking...');
      const trackResponse = await fetch(`${BASE_URL}/api/suggestions/track/${data.data.trackingCode}`);
      const trackData = await trackResponse.json();
      
      if (trackData.success) {
        console.log('✅ Tracking works correctly');
        console.log('   Status:', trackData.data.status);
      } else {
        console.log('❌ Tracking failed:', trackData.message);
      }
    } else {
      console.log('❌ Suggestion creation failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test 4: Validation error handling
  try {
    console.log('\n4️⃣  Testing validation error handling...');
    const response = await fetch(`${BASE_URL}/api/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'invalid_category',
        title: '',
        content: 'Test'
      })
    });
    const data = await response.json();
    
    if (!data.success && data.errors) {
      console.log('✅ Validation errors handled correctly');
      console.log('   Errors:', data.errors.length);
    } else {
      console.log('⚠️  Validation might not be working as expected');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test 5: Admin authentication
  try {
    console.log('\n5️⃣  Testing admin authentication...');
    const response = await fetch(`${BASE_URL}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'invalid_password'
      })
    });
    const data = await response.json();
    
    if (!data.success && response.status === 401) {
      console.log('✅ Admin authentication working correctly');
    } else {
      console.log('⚠️  Authentication might not be working as expected');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n✨ API tests completed!\n');
  console.log('📝 Check server/logs/ for detailed logs');
}

// Run tests
testAPI().catch(console.error);
