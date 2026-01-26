/**
 * API Testing Script for Multiverse System
 * Run: node scripts/test-api.js
 * 
 * Prerequisites:
 * 1. Server running: npm run dev
 * 2. Test data created: Run supabase/test_data.sql
 * 3. Get Supabase access token (from browser after login)
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const STORY_ID = 'test-multiverse-story-1';

// ⚠️ IMPORTANT: Replace with your actual Supabase access token
// Get it from: Browser DevTools → Application → Local Storage → supabase.auth.token
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE';

// Test colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testJoinStory(userNumber = 1) {
  log(`\n📝 Test ${userNumber}: Joining story...`, 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/multiverse/stories/${STORY_ID}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      log(`❌ Failed: ${response.status} ${response.statusText}`, 'red');
      log(`   Error: ${JSON.stringify(data, null, 2)}`, 'red');
      return null;
    }

    log(`✅ Success!`, 'green');
    log(`   Instance ID: ${data.instanceId}`, 'green');
    log(`   Character: ${data.characterName}`, 'green');
    log(`   Status: ${data.instanceStatus}`, 'green');
    log(`   Message: ${data.message}`, 'green');

    return data;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function testGetInstance(instanceId) {
  log(`\n📖 Getting instance details...`, 'blue');

  try {
    const response = await fetch(`${BASE_URL}/api/multiverse/instances/${instanceId}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      log(`❌ Failed: ${response.status} ${response.statusText}`, 'red');
      log(`   Error: ${JSON.stringify(data, null, 2)}`, 'red');
      return null;
    }

    log(`✅ Success!`, 'green');
    log(`   Story ID: ${data.instance.storyId}`, 'green');
    log(`   Status: ${data.instance.status}`, 'green');
    log(`   Characters: ${data.characters.length}`, 'green');
    log(`   My Character: ${data.myCharacter?.name}`, 'green');
    log(`   Is Revealed: ${data.myCharacter?.isRevealed}`, 'green');

    return data;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  log('\n🚀 Starting API Tests...', 'yellow');
  log(`   Base URL: ${BASE_URL}`, 'yellow');
  log(`   Story ID: ${STORY_ID}`, 'yellow');

  if (TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    log('\n⚠️  WARNING: Please set SUPABASE_ACCESS_TOKEN environment variable', 'yellow');
    log('   Or edit this file and set TOKEN variable', 'yellow');
    log('   Get token from: Browser DevTools → Application → Local Storage', 'yellow');
    return;
  }

  // Test 1: Join story
  const joinResult = await testJoinStory(1);
  if (!joinResult) {
    log('\n❌ Join story test failed. Stopping tests.', 'red');
    return;
  }

  const instanceId = joinResult.instanceId;

  // Test 2: Get instance details
  await testGetInstance(instanceId);

  log('\n✅ All tests completed!', 'green');
  log(`\n💡 Tip: Run this script multiple times to test multiple users joining`, 'yellow');
  log(`   Each run simulates a different user joining the story`, 'yellow');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
