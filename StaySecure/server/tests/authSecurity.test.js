const test = require('node:test');
const assert = require('node:assert/strict');

const {
  recordFailedLoginAttempt,
  clearLoginAttempt,
  isLoginLockedOut,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
} = require('../src/middleware/authSecurity');

test('lockout triggers after repeated failed login attempts', () => {
  const key = 'test@example.com::127.0.0.1';
  clearLoginAttempt(key);

  for (let i = 1; i <= MAX_LOGIN_ATTEMPTS - 1; i += 1) {
    const result = recordFailedLoginAttempt(key, Date.now());
    assert.equal(result.lockedOut, false);
  }

  const finalResult = recordFailedLoginAttempt(key, Date.now());
  assert.equal(finalResult.lockedOut, true);
  assert.equal(isLoginLockedOut(key, Date.now()), true);
});

test('successful login clears lockout state', () => {
  const key = 'success@example.com::127.0.0.1';
  clearLoginAttempt(key);

  for (let i = 0; i < MAX_LOGIN_ATTEMPTS; i += 1) {
    recordFailedLoginAttempt(key, Date.now());
  }

  assert.equal(isLoginLockedOut(key, Date.now()), true);

  clearLoginAttempt(key);
  assert.equal(isLoginLockedOut(key, Date.now()), false);
});

test('lockout window is enforced by duration', () => {
  const key = 'window@example.com::127.0.0.1';
  clearLoginAttempt(key);

  const now = Date.now();
  for (let i = 0; i < MAX_LOGIN_ATTEMPTS; i += 1) {
    recordFailedLoginAttempt(key, now);
  }

  assert.equal(isLoginLockedOut(key, now + LOCKOUT_DURATION_MS - 1), true);
  assert.equal(isLoginLockedOut(key, now + LOCKOUT_DURATION_MS), false);
});
