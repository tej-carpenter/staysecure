const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ALLOWED_ROLES,
  normalizePublicSignupRole,
  isAllowedRoleAssignment,
} = require('../src/utils/rbac');

test('public signup always forces CUSTOMER role and blocks privilege escalation', () => {
  assert.equal(normalizePublicSignupRole('ADMIN'), 'CUSTOMER');
  assert.equal(normalizePublicSignupRole('HOTEL_MANAGER'), 'CUSTOMER');
  assert.equal(normalizePublicSignupRole('CUSTOMER'), 'CUSTOMER');
});

test('admin role assignments are restricted to the supported role set', () => {
  assert.equal(isAllowedRoleAssignment('CUSTOMER'), true);
  assert.equal(isAllowedRoleAssignment('ADMIN'), true);
  assert.equal(isAllowedRoleAssignment('HOTEL_MANAGER'), true);
  assert.equal(isAllowedRoleAssignment('SUPER_ADMIN'), false);
  assert.equal(isAllowedRoleAssignment(''), false);
  assert.deepEqual(ALLOWED_ROLES.includes('ADMIN'), true);
});
