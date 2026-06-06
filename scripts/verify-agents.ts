import { registry } from '../packages/agents-core/src/registry';
import { obedian } from '../packages/obedian/src/index';

async function main() {
  console.log('🤖 Starting Sierra Estates Agent Core & Obedian Memory Verification...');

  // 1. Check Agent Registry
  const agents = registry.listAgents();
  console.log(`\n📂 Agent Registry: Found ${agents.length} specialist agents.`);
  
  if (agents.length !== 23) {
    throw new Error(`Expected 23 agents, but found ${agents.length}`);
  }

  for (const agent of agents) {
    console.log(`  - [${agent.domain}] ${agent.name}: ${agent.description.slice(0, 80)}...`);
  }

  // 2. Check Obedian Memory store
  console.log('\n🧠 Testing Obedian Memory Store...');
  const testId = 'test-verification-key';
  const testValue = {
    verified: true,
    engine: 'Sierra Estates AI Engine',
    vision: 'Unified multi-agent cognitive architecture',
  };
  const testTags = ['test', 'verification'];

  // Clear previous test keys if any
  await obedian.delete(testId);

  // Write
  await obedian.set(testId, testValue, testTags);
  console.log('  ✓ Set value in Obedian Memory');

  // Read
  const retrieved = await obedian.get(testId);
  if (!retrieved || retrieved.value.engine !== testValue.engine) {
    throw new Error('Failed to retrieve correct value from Obedian Memory');
  }
  console.log('  ✓ Get value from Obedian Memory');

  // Search
  const searchResults = await obedian.search('cognitive', ['verification']);
  if (searchResults.length === 0 || searchResults[0].id !== testId) {
    throw new Error('Failed to search memory by tag and query in Obedian Memory');
  }
  console.log('  ✓ Search Obedian Memory');

  // Clean up
  await obedian.delete(testId);
  console.log('  ✓ Cleaned up verification key');

  console.log('\n✅ Verification Complete! All agents loaded and Obedian memory is functional.');
}

main().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
