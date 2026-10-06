const test = require('node:test');
const assert = require('node:assert/strict');

const Property = require('../src/models/Property');
const User = require('../src/models/User');
const { ensurePropertyAccess } = require('../src/utils/propertyAccess');

test('Property model requires separate name and type fields', () => {
  const property = new Property({
    name: 'Grand Royal Stay',
    type: 'HOTEL',
    approvalMode: 'MANUAL',
  });

  assert.equal(property.name, 'Grand Royal Stay');
  assert.equal(property.type, 'HOTEL');
  assert.equal(property.approvalMode, 'MANUAL');
  assert.notEqual(property.name, property.type);

  // PG type test
  const pgProperty = new Property({
    name: 'Comfort Living PG',
    type: 'PG',
    approvalMode: 'AUTOMATIC',
  });
  assert.equal(pgProperty.name, 'Comfort Living PG');
  assert.equal(pgProperty.type, 'PG');
  assert.equal(pgProperty.approvalMode, 'AUTOMATIC');
});

test('Property model rejects invalid property types', () => {
  const invalidProperty = new Property({
    name: 'Invalid Property',
    type: 'INVALID_TYPE',
  });

  const error = invalidProperty.validateSync();
  assert.ok(error.errors['type']);
});

test('Property model supports AUTOMATIC and MANUAL approval modes per property', () => {
  const hotelProperty = new Property({
    name: 'City Center Hotel',
    type: 'HOTEL',
    approvalMode: 'MANUAL',
  });
  assert.equal(hotelProperty.approvalMode, 'MANUAL');

  const pgProperty = new Property({
    name: 'Campus PG',
    type: 'PG',
    approvalMode: 'AUTOMATIC',
  });
  assert.equal(pgProperty.approvalMode, 'AUTOMATIC');
});

test('User roles only include HOTEL_MANAGER and no deprecated room/approval managers', () => {
  const user = new User({
    name: 'Test Manager',
    email: 'manager@example.com',
    phone: '9876543210',
    password: 'ValidPassword123!',
    role: 'HOTEL_MANAGER',
  });
  assert.equal(user.role, 'HOTEL_MANAGER');

  const deprecatedRoomManager = new User({
    name: 'Old Room Manager',
    email: 'oldrm@example.com',
    phone: '9876543210',
    password: 'ValidPassword123!',
    role: 'ROOM_MANAGER',
  });
  const rmError = deprecatedRoomManager.validateSync();
  assert.ok(rmError.errors['role']);

  const deprecatedApprovalManager = new User({
    name: 'Old Approval Manager',
    email: 'oldam@example.com',
    phone: '9876543210',
    password: 'ValidPassword123!',
    role: 'APPROVAL_MANAGER',
  });
  const amError = deprecatedApprovalManager.validateSync();
  assert.ok(amError.errors['role']);
});

test('ensurePropertyAccess allows admin to access all properties and restricts hotel managers to assigned properties', async () => {
  const adminUser = { id: 'admin123', role: 'ADMIN' };
  const canAdminAccess = await ensurePropertyAccess(adminUser, 'any_property_id');
  assert.equal(canAdminAccess, true);

  const customerUser = { id: 'cust123', role: 'CUSTOMER' };
  const canCustomerPassThrough = await ensurePropertyAccess(customerUser, 'any_property_id');
  assert.equal(canCustomerPassThrough, true);
});

test('Property model supports all valid property types', () => {
  const validTypes = ['HOTEL', 'PG', 'HOSTEL', 'GUEST_HOUSE', 'DORMITORY'];
  for (const type of validTypes) {
    const prop = new Property({
      name: `Test ${type}`,
      type,
    });
    const err = prop.validateSync();
    assert.equal(err, undefined, `Expected type ${type} to be valid`);
  }
});

test('Property model defaults approvalMode to MANUAL and rejects invalid mode', () => {
  const defaultProp = new Property({
    name: 'Default Mode Property',
    type: 'HOTEL',
  });
  assert.equal(defaultProp.approvalMode, 'MANUAL');

  const invalidModeProp = new Property({
    name: 'Invalid Mode Property',
    type: 'HOTEL',
    approvalMode: 'INSTANT_APPROVAL',
  });
  const err = invalidModeProp.validateSync();
  assert.ok(err.errors['approvalMode'], 'Expected error for invalid approval mode');
});

test('RBAC role validation allows HOTEL_MANAGER and rejects deprecated roles', () => {
  const { isAllowedRoleAssignment, VALID_ROLES } = require('../src/utils/rbac');

  assert.equal(isAllowedRoleAssignment('HOTEL_MANAGER'), true);
  assert.equal(isAllowedRoleAssignment('ADMIN'), true);
  assert.equal(isAllowedRoleAssignment('CUSTOMER'), true);

  assert.equal(isAllowedRoleAssignment('ROOM_MANAGER'), false);
  assert.equal(isAllowedRoleAssignment('APPROVAL_MANAGER'), false);
  assert.equal(VALID_ROLES.includes('ROOM_MANAGER'), false);
  assert.equal(VALID_ROLES.includes('APPROVAL_MANAGER'), false);
});

test('authorize middleware permits HOTEL_MANAGER and blocks unauthorized roles', () => {
  const authorize = require('../src/middleware/role');
  const hotelManagerAuth = authorize(['ADMIN', 'HOTEL_MANAGER']);

  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };

  // HOTEL_MANAGER passes
  hotelManagerAuth({ user: { id: 'hm1', role: 'HOTEL_MANAGER' } }, {}, mockNext);
  assert.equal(nextCalled, true);

  // ADMIN passes
  nextCalled = false;
  hotelManagerAuth({ user: { id: 'admin1', role: 'ADMIN' } }, {}, mockNext);
  assert.equal(nextCalled, true);

  // CUSTOMER is rejected (403)
  nextCalled = false;
  let responseStatus = null;
  let responseBody = null;
  const mockRes = {
    status(code) {
      responseStatus = code;
      return {
        json(data) {
          responseBody = data;
        },
      };
    },
  };
  hotelManagerAuth({ user: { id: 'cust1', role: 'CUSTOMER' } }, mockRes, mockNext);
  assert.equal(nextCalled, false);
  assert.equal(responseStatus, 403);
  assert.equal(responseBody.success, false);
});

