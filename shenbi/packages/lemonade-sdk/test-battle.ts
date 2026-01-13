/**
 * Battle API Test Script
 *
 * Tests the polling-based battle flow for Shenbi.
 * Run with: npx ts-node test-battle.ts
 *
 * Note: This test uses a single user, so it can only test:
 * - Creating a battle room
 * - Getting battle state
 * - Leaving the battle room
 *
 * For a full flow test (host + guest), you'd need two different user tokens.
 */

import { LemonadeClient } from './src/client.ts';

const API_KEY = 'z68ZMnlBRMkzTWd5gqLaAmv4TR8Q2nE1wu3DjLKVFHM';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiYXBwX2lkIjoyLCJleHAiOjE3NjgwNTE5MDEsInR5cGUiOiJhY2Nlc3MifQ.q3gZx3waMvJCLgyfs6xk60qnQZccv_hsFVZp41Be2vA';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎮 Testing Shenbi Battle API\n');

  // Initialize client
  const client = new LemonadeClient({
    apiKey: API_KEY,
    baseUrl: 'https://api.gigaboo.sg',
  });

  // Set access token
  client.setAccessToken(ACCESS_TOKEN);

  let roomCode: string | null = null;

  try {
    // Test 1: Create a battle room
    console.log('1. Creating battle room...');
    const createResult = await client.shenbiBattles.create({
      player_name: 'TestPlayer1',
    });
    roomCode = createResult.room_code;
    console.log(`   ✅ Battle room created!`);
    console.log(`      Room Code: ${roomCode}`);
    console.log(`      Status: ${createResult.status}`);
    console.log(`      Host: ${createResult.host_name}`);

    // Test 2: Get battle state
    console.log('\n2. Getting battle state...');
    const battleState = await client.shenbiBattles.get(roomCode);
    console.log(`   ✅ Battle state retrieved!`);
    console.log(`      Status: ${battleState.status}`);
    console.log(`      Host: ${battleState.host_name}`);
    console.log(`      Guest: ${battleState.guest_name || '(waiting)'}`);
    console.log(`      Level: ${battleState.level ? 'set' : 'not set'}`);

    // Test 3: Poll battle state a few times (simulating waiting for guest)
    console.log('\n3. Polling battle state (3 times, 500ms interval)...');
    for (let i = 0; i < 3; i++) {
      await sleep(500);
      const state = await client.shenbiBattles.get(roomCode);
      console.log(`   Poll ${i + 1}: status=${state.status}, guest=${state.guest_name || 'none'}`);
    }
    console.log('   ✅ Polling complete');

    // Test 4: Leave the battle room (cleanup)
    console.log('\n4. Leaving battle room (cleanup)...');
    const leaveResult = await client.shenbiBattles.leave(roomCode);
    console.log(`   ✅ Left battle room`);
    console.log(`      Message: ${leaveResult.message || 'success'}`);
    const savedRoomCode = roomCode;
    roomCode = null; // Mark as cleaned up

    // Test 5: Verify room state after host leaves
    console.log('\n5. Verifying room state after host leaves...');
    try {
      const finalState = await client.shenbiBattles.get(savedRoomCode);
      // Room might still exist but with ended/cancelled status
      console.log(`   ℹ️  Room still exists with status: ${finalState.status}`);
      if (finalState.status === 'ended' || finalState.status === 'cancelled' || finalState.status === 'expired') {
        console.log('   ✅ Room correctly marked as ended/cancelled/expired');
      }
    } catch (error: any) {
      if (error.status === 404) {
        console.log('   ✅ Room correctly deleted (404)');
      } else {
        console.log(`   ⚠️  Unexpected error: ${error.message}`);
      }
    }

    console.log('\n🎉 Battle API tests completed!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message || error);
    if (error.body) {
      console.error('   Details:', JSON.stringify(error.body, null, 2));
    }
    if (error.status) {
      console.error('   Status:', error.status);
    }

    // Cleanup if we have a room code
    if (roomCode) {
      console.log('\n🧹 Cleaning up...');
      try {
        await client.shenbiBattles.leave(roomCode);
        console.log('   Room cleaned up');
      } catch (cleanupError: any) {
        console.log('   Could not clean up room:', cleanupError.message);
      }
    }
  }
}

main();
