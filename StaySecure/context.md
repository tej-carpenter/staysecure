# StaySecure Project Context

Last updated: 2026-09-01

## 1. Project Summary
StaySecure is a secure room/hotel booking and management system built as a cybersecurity-focused project. The project combines a full-stack Node.js/Express backend, a React + Vite frontend, and MongoDB storage to simulate a real hospitality platform with secure authentication, RBAC, booking approvals, payments, reception operations, and audit tracking.

The system was developed incrementally, with strict testing after each milestone. The user insisted on one feature at a time, keeping scope tight and ensuring no regressions in existing working code.

## 2. Goal and Scope
The goal is to build a secure, realistic hotel/room booking application that includes:
- customer signup/login/logout
- role-based access control
- room type and room management
- approval workflow for bookings
- payment processing for approved bookings
- receptionist check-in/check-out flow
- audit logging and monitoring
- secure-by-default configuration

This was designed not just as a feature app, but as a cybersecurity-aware system where security issues were identified, fixed, and re-tested in sequence.

## 3. Technology Stack
### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs

### Security / Supporting
- Helmet
- CORS restriction to localhost
- cookie-parser
- express.json size limits
- validation and sanitization helpers
- rate limiting / failed-login lockout
- audit log service

## 4. User Requirements and Workflow Constraints
Important project constraints from the discussion:
- implement improvements one by one
- after each implementation, fully test it
- do not make changes outside the requested scope
- avoid breaking existing working code
- keep the app secure and realistic
- validate each milestone with real API requests and status checks

This disciplined workflow is a core part of the project history and should be respected by any future continuation agent.

## 5. Role Model
Roles implemented in the app:
- ADMIN
- CUSTOMER
- ROOM_MANAGER
- APPROVAL_MANAGER
- ACCOUNTANT
- RECEPTIONIST
- AUDITOR

Key rules:
- Public signup is restricted to CUSTOMER role only
- Non-customer roles are assigned by admin manually
- Each protected route checks authentication and role authorization
- Different departments have separate dashboards and actions

## 6. Initial Problems Identified and Fixed
During the project, several security and implementation issues were identified and fixed incrementally:

### A. Authentication issues
- JWT was initially thought to be stored in localStorage, which is insecure and unhealthy for production-style use
- Fixed by switching to HttpOnly secure cookies
- Frontend auth state no longer depends on localStorage, and refresh/session handling is cookie-based

### B. Security hardening
- CORS was too permissive and had to be restricted to localhost only
- Helmet security headers were added
- Input validation and sanitization were added
- JSON body size limits were enforced
- Password validation rules were enforced

### C. Login abuse and brute force
- Rate limiting and failed-attempt tracking were introduced
- Accounts lock after multiple failed logins

### D. Email verification
- Email verification was enforced before login
- Demo/test accounts were adjusted in MongoDB to ensure verification state matched intended access flows

### E. Role and authorization issues
- Public sign-up was restricted to CUSTOMER
- Role-based middleware was implemented and enforced consistently

### F. Environment issues
- Port conflicts occurred during development
- MongoDB and stale listeners required cleanup
- Vite was switched to port 3001 to avoid conflicts

## 7. Milestone Timeline and Status

### Milestone 1: Project setup and secure auth foundation
Completed.
- Installed dependencies
- Connected backend to MongoDB
- Setup React + Vite frontend
- Implemented secure cookie-based auth
- Added validation and security middleware
- Started demo user seeding

### Milestone 2: RBAC and admin controls
Completed.
- Admin dashboard implemented
- Users management page added
- Role assignment support added
- Room type management CRUD implemented
- Room inventory CRUD implemented
- Settings model and config routes implemented

### Milestone 3: Customer workflow
Completed.
- customer dashboard created
- room search and filtering added
- booking creation flow implemented
- customer booking ownership checks added
- availability checking logic implemented in service layer

### Milestone 4: Approval workflow
Completed and verified.
- approval manager dashboard created
- pending booking list implemented
- approve/reject actions implemented
- rejection reason support added
- approval audit logging added
- approval history page created

### Milestone 5: Payment workflow
Completed and verified.
- accountant dashboard created
- payment recording implemented
- payment methods supported: CASH, UPI, CARD, BANK_TRANSFER
- payment history page created
- booking.paymentStatus updated to PAID correctly
- audit logs generated for payment recording

### Milestone 6: Reception workflow
Next milestone pending.
Planned scope:
- receptionist check-in flow
- receptionist check-out flow
- validation of status transitions
- audit logs for check-in/out
- receptionist dashboard and UI actions

### Milestone 7: Audit UI and system review
Planned after reception workflow.
Scope:
- auditor dashboard or audit log viewer
- display event details, actors, timestamps, resource IDs
- ensure all critical actions are visible and traceable

### Milestone 8: End-to-end validation
Planned final verification.
Full workflow expected:
- register/login as customer
- search rooms
- create booking
- approval manager approves booking
- accountant records payment
- receptionist checks in guest
- receptionist checks out guest
- audit logs confirm all actions

## 8. Key Implemented Features by Area

### Authentication and Authorization
- secure JWT auth via cookie
- login/logout endpoints
- getCurrentUser route
- RBAC middleware
- role-based protected routes
- account lockout logic
- email verification enforcement

### Admin Module
- dashboard with summary stats
- user list and role updates
- room type creation/editing/deletion
- room inventory management
- settings page for approval mode configuration

### Customer Module
- room availability search
- booking request creation
- room-type-based pricing logic
- booking listing by user
- cancellation logic

### Approval Module
- pending booking queries
- approve bookings
- reject bookings with reason
- filtered approval history
- status transitions including approval status audit

### Payment Module
- payment record creation
- payment status update to PAID
- payment history retrieval
- payment method validation
- audit events on each payment recording

### Audit Logging
- centralized audit service
- structured action/event recording
- actor role and ID tracking
- resource type and resource ID tracking
- details object for event-specific metadata

## 9. Core Backend Files and Their Purpose
### Authentication
- server/src/controllers/authController.js
  Handles signup, login, logout, getCurrentUser
- server/src/middleware/auth.js
  Verifies JWT from cookies
- server/src/middleware/role.js
  Enforces role-level permissions
- server/src/services/validation.js
  Email/password validation and sanitization
- server/src/middleware/authSecurity.js
  Failed login tracking and lockout logic

### Models
- server/src/models/User.js
  User data, role, email verification, password hash
- server/src/models/RoomType.js
  Room types and pricing
- server/src/models/Room.js
  Room inventory and room status
- server/src/models/Booking.js
  Booking lifecycle, approval status, payment status, totals
- server/src/models/Payment.js
  Payment records and method tracking
- server/src/models/Settings.js
  Approval mode and config values
- server/src/models/Allocation.js
  Room allocation data for bookings

### Controllers
- server/src/controllers/bookingController.js
  booking lifecycle and approval logic
- server/src/controllers/paymentController.js
  payment creation and updates
- server/src/controllers/roomController.js
  room inventory management
- server/src/controllers/roomTypeController.js
  room-type CRUD
- server/src/controllers/userController.js
  user admin actions
- server/src/controllers/settingsController.js
  configuration toggles

### Routes
- server/src/routes/authRoutes.js
- server/src/routes/bookingRoutes.js
- server/src/routes/paymentRoutes.js
- server/src/routes/roomRoutes.js
- server/src/routes/roomTypeRoutes.js
- server/src/routes/userRoutes.js
- server/src/routes/settingsRoutes.js

### Services
- server/src/services/bookingService.js
  availability checks and allocation logic
- server/src/services/auditService.js
  audit logging service
- server/src/services/pricingService.js
  pricing calculations and related logic

## 10. Frontend Files and Their Purpose
- client/src/App.jsx
  App routing and role-protected routes
- client/src/context/AuthContext.jsx
  session/auth context
- client/src/services/api.js
  centralized API client
- client/src/pages/admin/*
  admin dashboard and management pages
- client/src/pages/customer/*
  customer booking/search pages
- client/src/pages/approval/*
  booking approval pages
- client/src/pages/accountant/*
  payment dashboard/history pages
- client/src/components/*
  Navbar, Sidebar, ProtectedRoute, StatusBadge, etc.

## 11. Verified Working Behaviors
These were validated with live backend requests and frontend build checks:
- secure login with HttpOnly cookie works
- role-based access is enforced
- user can create booking successfully
- booking sits in pending state until approval
- approval manager can approve booking
- payment can be recorded by accountant/admin
- payment status updates in booking model
- payment history is returned
- frontend build completes successfully

## 12. Concrete Example Verified Flow
A real successful payment flow was validated:
- Customer creates booking
- Booking total amount was ₹600
- Approval manager approves booking
- Accountant logs in and records payment with UPI
- Payment record created and linked to booking
- Booking paymentStatus changed to PAID
- Audit log event recorded with PAYMENT_RECORDED action

## 13. Important Operational Notes
- Frontend runs on localhost:3001
- Backend runs on localhost:5001
- MongoDB local database is mongodb://127.0.0.1:27017/stay-secure
- Vite port 3000 was occupied, so frontend moved to 3001
- Some demo accounts needed manual email verification updates in database during testing
- A few dev port conflicts required cleanup from prior runs

## 14. Testing Philosophy in This Project
The project’s development pattern is: implement feature, run real checks, validate outputs, and only then move to next milestone.

The philosophy includes:
- no speculative large changes
- no mixing unrelated tasks
- no broad refactors during feature work
- always verify before claiming success
- preserve existing stable pages and routes while adding new ones

## 15. Current Working State and Next Action
Current verified stage:
- Security foundation complete
- Admin features complete
- Customer features complete
- Approval workflow complete
- Payment workflow complete
- Next milestone: reception workflow

Planned future tasks:
1. Implement receptionist dashboard and actions
2. Add check-in and check-out transitions
3. Validate transitions against booking state rules
4. Audit log reception actions
5. Implement auditor-facing log view
6. Run a complete end-to-end workflow validation

## 16. Rules for Future Continuation
When continuing this project:
1. Read this file first
2. Keep the work incremental and minimal
3. Do not make unrequested changes
4. Test the new feature immediately after implementation
5. Confirm no existing working area breaks
6. Update this context file after each response so the next model resumes from the latest verified state

## 17. Final Consolidated Status
The project is in a strong, working mid-to-late stage. The secure backend, role model, dashboard structure, approval flow, and payment flow are complete and tested. The remaining required work is focused on the receptionist workflow and final audit / end-to-end verification.
  room inventory management
- server/src/controllers/roomTypeController.js
  room-type CRUD
- server/src/controllers/userController.js
  user admin actions
- server/src/controllers/settingsController.js
  configuration toggles

### Routes
- server/src/routes/authRoutes.js
- server/src/routes/bookingRoutes.js
- server/src/routes/paymentRoutes.js
- server/src/routes/roomRoutes.js
- server/src/routes/roomTypeRoutes.js
- server/src/routes/userRoutes.js
- server/src/routes/settingsRoutes.js

### Services
- server/src/services/bookingService.js
  availability checks and allocation logic
- server/src/services/auditService.js
  audit logging service
- server/src/services/pricingService.js
  pricing calculations and related logic

## 10. Frontend Files and Their Purpose
- client/src/App.jsx
  App routing and role-protected routes
- client/src/context/AuthContext.jsx
  session/auth context
- client/src/services/api.js
  centralized API client
- client/src/pages/admin/*
  admin dashboard and management pages
- client/src/pages/customer/*
  customer booking/search pages
- client/src/pages/approval/*
  booking approval pages
- client/src/pages/accountant/*
  payment dashboard/history pages
- client/src/components/*
  Navbar, Sidebar, ProtectedRoute, StatusBadge, etc.

## 11. Verified Working Behaviors
These were validated with live backend requests and frontend build checks:
- secure login with HttpOnly cookie works
- role-based access is enforced
- user can create booking successfully
- booking sits in pending state until approval
- approval manager can approve booking
- payment can be recorded by accountant/admin
- payment status updates in booking model
- payment history is returned
- frontend build completes successfully

## 12. Concrete Example Verified Flow
A real successful payment flow was validated:
- Customer creates booking
- Booking total amount was ₹600
- Approval manager approves booking
- Accountant logs in and records payment with UPI
- Payment record created and linked to booking
- Booking paymentStatus changed to PAID
- Audit log event recorded with PAYMENT_RECORDED action

## 13. Important Operational Notes
- Frontend runs on localhost:3001
- Backend runs on localhost:5001
- MongoDB local database is mongodb://127.0.0.1:27017/stay-secure
- Vite port 3000 was occupied, so frontend moved to 3001
- Some demo accounts needed manual email verification updates in database during testing
- A few dev port conflicts required cleanup from prior runs

## 14. Testing Philosophy in This Project
The project’s development pattern is: implement feature, run real checks, validate outputs, and only then move to next milestone.

The philosophy includes:
- no speculative large changes
- no mixing unrelated tasks
- no broad refactors during feature work
- always verify before claiming success
- preserve existing stable pages and routes while adding new ones

## 15. Current Working State and Next Action
Current verified stage:
- Security foundation complete
- Admin features complete
- Customer features complete
- Approval workflow complete
- Payment workflow complete
- Next milestone: reception workflow

Planned future tasks:
1. Implement receptionist dashboard and actions
2. Add check-in and check-out transitions
3. Validate transitions against booking state rules
4. Audit log reception actions
5. Implement auditor-facing log view
6. Run a complete end-to-end workflow validation

## 16. Rules for Future Continuation
When continuing this project:
1. Read this file first
2. Keep the work incremental and minimal
3. Do not make unrequested changes
4. Test the new feature immediately after implementation
5. Confirm no existing working area breaks
6. Update this context file after each response so the next model resumes from the latest verified state

## 17. Final Consolidated Status
The project is in a strong, working mid-to-late stage. The secure backend, role model, dashboard structure, approval flow, and payment flow are complete and tested. The remaining required work is focused on the receptionist workflow and final audit / end-to-end verification.

---

## UPDATE: Milestone 6 Reception Workflow - Frontend Implementation Complete ✅

**Current Session Progress:**
- ✅ Created ReceptionistDashboard.jsx with stats cards and quick actions
- ✅ Created ReceptionistCheckIn.jsx with CONFIRMED bookings table
- ✅ Created ReceptionistCheckOut.jsx with CHECKED_IN bookings table  
- ✅ Updated App.jsx with 3 receptionist routes (/dashboard, /check-in, /check-out)
- ✅ Updated Sidebar.jsx navigation paths to match new routes
- ✅ Added 4 convenience methods to bookingAPI (checkIn, checkOut, getTodayCheckIns, getTodayCheckOuts)
- ✅ Frontend builds successfully (116 modules)
- ✅ Backend reception endpoints verified working

**Files Modified:**
```
client/src/pages/receptionist/Dashboard.jsx       → NEW
client/src/pages/receptionist/CheckIn.jsx         → NEW
client/src/pages/receptionist/CheckOut.jsx        → NEW
client/src/App.jsx                                → UPDATED (routes)
client/src/components/Sidebar.jsx                 → UPDATED (paths)
client/src/services/api.js                        → UPDATED (methods)
```

**Architecture Complete:**
- Reception backend: checkIn(), checkOut(), getTodayCheckIns(), getTodayCheckOuts() ✅
- Reception frontend: Dashboard, CheckIn UI, CheckOut UI ✅
- API client methods: All wired up ✅
- Routing: Role-protected receptionist routes ✅
- Audit logging: Integrated into checkIn/checkOut endpoints ✅

**Testing Status:**
✅ Frontend compiles without errors
✅ Backend API endpoints are implemented
✅ Role-based access control is enforced
⏳ Need to test with real bookings (check-in/out flows)
⏳ Need to verify audit logs are generated
⏳ Need to verify error handling

**Next Actions for New Session:**
1. Start dev servers: `cd server && npm run dev` && `cd client && npm run dev`
2. Test receptionist dashboard by logging in as reception+demo@example.com
3. Verify stats load correctly on dashboard
4. Create test CONFIRMED booking for check-in testing
5. Test check-in button works and booking disappears from list
6. Create test CHECKED_IN booking for check-out testing
7. Test check-out button works and booking disappears from list
8. Verify audit logs exist for CHECK_IN and CHECK_OUT actions
9. Test role protection (non-RECEPTIONIST should get 403)

**Demo Credentials:**
- Receptionist: reception+demo@example.com / TempPassword123!
- Customer (for creating test bookings): customer+demo@example.com / TempPassword123!
- Approval Manager: approval+demo@example.com / TempPassword123!

All passwords are: `TempPassword123!`

## HOTFIX: CORS Configuration Update

**Issue Found:** Backend CORS whitelist only included localhost:3000, but frontend runs on localhost:3001
**Fix Applied:** Updated `server/src/app.js` to include both 3000 and 3001 in allowedOrigins

**Before:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
```

**After:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];
```

This fix ensures the frontend on port 3001 can make API calls to the backend without CORS violations.

## BUGFIX: Customer Profile Routing Issue

**Issue Found:** After customer login, /customer/profile route was redirecting to same page as /customer/dashboard
**Root Cause:** Both routes were using CustomerDashboard component instead of having a separate profile page
**Fix Applied:** 
1. Created new CustomerProfile.jsx component with profile view/edit functionality
2. Updated App.jsx to import and use CustomerProfile for /customer/profile route

**Changes Made:**
- NEW: client/src/pages/customer/Profile.jsx (profile display and edit form)
- UPDATED: client/src/App.jsx (import + route)

**Profile Features Implemented:**
- Display user information (name, email, phone, role, member since)
- View email verification status
- Edit mode to update name and phone (email is locked)
- Account settings section (password change and preferences - coming soon)
- StaySecure theme styling with edit/cancel functionality

**Build Status:** ✅ Frontend builds successfully (117 modules)

**Routes Now Work Correctly:**
- /customer/dashboard → CustomerDashboard (My Bookings)
- /customer/profile → CustomerProfile (Account Info)
- /customer/rooms → CustomerRoomsPage (Search Rooms)

## Authentication Rate Limiting & Account Lockout Guide

### How Rate Limiting Works

**Failed Login Attempts:**
- Maximum 5 failed login attempts per IP per email combination
- After 5 failed attempts: Account locked for 15 minutes
- Lockout window resets after 15 minutes

**What Causes Failed Attempts:**
1. ❌ Wrong password entered
2. ❌ Non-existent email account
3. ✅ Unverified email (doesn't count as failed attempt, shows verification message instead)

**Error Messages:**

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "Please verify your email before logging in." | 403 | Account not verified | Check email for verification link |
| "Invalid email or password." | 401 | Wrong credentials | Check spelling and password |
| "Too many authentication requests. Please try again later." | 429 | 5+ failed attempts | Wait 15 minutes or contact admin |

### Demo Credentials (All with Password: TempPassword123!)

```
CUSTOMER:      customer+demo@example.com
ADMIN:         admin+demo@example.com
RECEPTIONIST:  reception+demo@example.com
APPROVAL MGR:  approval+demo@example.com
ACCOUNTANT:    accountant+demo@example.com
```

### If You Get Locked Out

**Option 1: Wait 15 minutes** for the lockout to auto-expire

**Option 2: Admin Reset** (requires database access)
```bash
cd server && node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');
async function unlock(email) {
  await mongoose.connect('mongodb://127.0.0.1:27017/stay-secure');
  await User.findOneAndUpdate({ email }, { lockedUntil: null });
  await mongoose.connection.close();
  console.log('Account unlocked: ' + email);
}
unlock('customer+demo@example.com');
"
```

### Email Verification

New customer signups require email verification before login.

**For Demo Accounts:** Email verification is pre-enabled in database.

**For New Accounts:** In development, check browser console or use admin reset script to manually verify:
```bash
await User.findOneAndUpdate({ email }, { emailVerified: true });
```

### Security Notes

- Lockout is per IP address + email combination
- Clearing browser cookies doesn't reset lockout (based on IP)
- Rate limiting protects against brute-force attacks
- Max requests: 10 per 15-minute window per IP (global rate limit)

