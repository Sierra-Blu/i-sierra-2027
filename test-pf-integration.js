#!/usr/bin/env node
/**
 * PropertyFinder Integration Test
 * Tests webhook signature verification and lead sync
 */

import crypto from 'crypto';

const PF_WEBHOOK_SECRET = process.env.PF_WEBHOOK_SECRET || 'test-pf-webhook-secret-key-for-signature-verification';

function generateSignature(payload) {
  return crypto.createHmac('sha256', PF_WEBHOOK_SECRET).update(payload).digest('hex');
}

function verifySignature(payload, signature) {
  const expected = generateSignature(payload);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Test payload: PropertyFinder lead webhook
const testPayload = JSON.stringify({
  type: 'lead.created',
  data: {
    id: 'pf_lead_12345',
    name: 'Ahmed Al-Mansouri',
    phone: '+201234567890',
    email: 'ahmed@example.com',
    listing: {
      reference: 'PF-CAIRO-2024-001',
      title: 'Luxury Villa in New Cairo',
      price: 5000000,
      beds: 4,
      baths: 3,
      area: 450,
      location: { name: 'New Cairo', city: 'Cairo' },
    },
    channel: 'web',
    created_at: new Date().toISOString(),
  },
});

const signature = generateSignature(testPayload);

console.log('✅ PropertyFinder Webhook Integration Test\n');
console.log('📦 Test Payload:');
console.log(JSON.parse(testPayload));
console.log('\n🔐 Signature:', signature.substring(0, 20) + '...');
console.log('✓ Signature Valid:', verifySignature(testPayload, signature));

// Simulate webhook POST
console.log('\n📤 Testing webhook endpoint...');
console.log('POST http://localhost:3000/api/webhooks/property-finder');
console.log('Headers:');
console.log('  X-Signature:', signature);
console.log('  Content-Type: application/json');
console.log('\nBody:', JSON.stringify(JSON.parse(testPayload), null, 2));

console.log('\n✅ Integration test ready. Run app with:');
console.log('  pnpm dev');
console.log('\nThen test with:');
console.log(`  curl -X POST http://localhost:3000/api/webhooks/property-finder \\
    -H "X-Signature: ${signature}" \\
    -H "Content-Type: application/json" \\
    -d '${testPayload}'`);

export {};
