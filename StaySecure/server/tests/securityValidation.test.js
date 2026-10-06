const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePassword, isValidEmail, sanitizeText, normalizeEmail } = require('../src/utils/validation');
const { buildAuditEntry } = require('../src/services/auditService');

test('strong password validation rejects weak passwords', () => {
  assert.equal(validatePassword('password123'), false);
  assert.equal(validatePassword('StrongPass!1'), true);
});

test('email validation normalizes and rejects malformed addresses', () => {
  assert.equal(isValidEmail('user@example.com'), true);
  assert.equal(isValidEmail('bad-email'), false);
  assert.equal(normalizeEmail(' User@Example.com '), 'user@example.com');
});

test('audit entries capture the actor, action, and target resource', () => {
  const entry = buildAuditEntry({
    actorId: 'user-123',
    actorRole: 'ADMIN',
    action: 'BOOKING_APPROVED',
    resourceType: 'Booking',
    resourceId: 'booking-456',
    details: { status: 'APPROVED' },
  });

  assert.equal(entry.action, 'BOOKING_APPROVED');
  assert.equal(entry.actorRole, 'ADMIN');
  assert.equal(entry.resourceId, 'booking-456');
  assert.equal(sanitizeText('  Hi <script>alert(1)</script>  '), 'Hi alert(1)');
});
