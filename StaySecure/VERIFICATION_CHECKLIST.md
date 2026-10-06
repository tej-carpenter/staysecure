# ✅ Project Verification Checklist

Use this checklist to verify everything is set up correctly.

## Before You Start

### Prerequisites Check
- [ ] Node.js installed (Check: Open Command Prompt and type `node --version`)
- [ ] npm installed (Check: type `npm --version`)
- [ ] MongoDB installed or MongoDB Atlas account created
- [ ] Text editor/IDE (VS Code recommended)
- [ ] Web browser (Chrome/Firefox/Edge)

---

## Backend Setup

### Installation
- [ ] Opened Terminal in `server` folder
- [ ] Ran `npm install` successfully
- [ ] No error messages during npm install
- [ ] `node_modules` folder created

### Configuration
- [ ] `.env` file exists in `server` folder
- [ ] `.env` contains: PORT, MONGODB_URI, JWT_SECRET, NODE_ENV
- [ ] MongoDB connection works (test by running seed)

### Database Seeding
- [ ] Ran `npm run seed` successfully
- [ ] See output showing users, rooms created
- [ ] No database connection errors

### Starting Backend
- [ ] Ran `npm run dev`
- [ ] See message: "StaySecure Backend Server Running"
- [ ] See: "📍 Server URL: http://localhost:5000"
- [ ] See: "MongoDB Connected"
- [ ] Terminal shows "listening on port 5000"

### Backend Verification
- [ ] Open browser: http://localhost:5000/api/health
- [ ] Should see: `{"success":true,"message":"StaySecure API is running"}`
- [ ] Keep terminal open!

---

## Frontend Setup

### Installation
- [ ] Opened NEW Terminal in `client` folder
- [ ] Ran `npm install` successfully
- [ ] No error messages during npm install
- [ ] `node_modules` folder created

### Starting Frontend
- [ ] Ran `npm run dev`
- [ ] See: `VITE v5.0.2 ready in XXX ms`
- [ ] See: `➜  Local:   http://localhost:3000/`
- [ ] Keep terminal open!

### Frontend Verification
- [ ] Open browser: http://localhost:3000
- [ ] See StaySecure home page
- [ ] See navigation bar at top
- [ ] See login/register buttons

---

## Authentication Test

### Test Customer Login
- [ ] Create a customer account through the registration page using a strong unique password
- [ ] Log in with that account
- [ ] ✅ Should redirect to dashboard
- [ ] ✅ See the customer-only menu items

### Test Admin Login
- [ ] Create or provision a dedicated admin account in a non-production environment with a strong unique password
- [ ] Log in with that account
- [ ] ✅ Should redirect to dashboard
- [ ] ✅ See the admin-only menu items

---

## Feature Tests

### Test 1: Approval Mode Settings (Admin Only)
- [ ] Log in with an admin account created for local testing
- [ ] Go to Admin Dashboard
- [ ] See "System Settings" section
- [ ] See "Booking Approval Mode"
- [ ] [ ] Can toggle between AUTOMATIC and MANUAL
- [ ] [ ] Settings update successfully

### Test 2: Customer Booking View
- [ ] Log in with a customer account created for local testing
- [ ] See "Customer Dashboard"
- [ ] See statistics cards (Total Bookings, etc.)
- [ ] See "My Bookings" table
- [ ] If no bookings yet, see "No bookings yet" message

### Test 3: Navigation
- [ ] See sidebar menu when logged in
- [ ] Sidebar changes based on user role
- [ ] Can click menu items
- [ ] Clicking logo goes to appropriate page
- [ ] Logout button works

---

## API Endpoint Tests

Use tools like Postman or curl to test:

### Test Auth Endpoints
```bash
# Test health check
curl http://localhost:5000/api/health

# Response should be:
# {"success":true,"message":"StaySecure API is running"}
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin@example.com","password":"YourStrongPass!123"}'

# Response should include an authenticated session cookie or token
```

### Test Get Rooms
```bash
curl http://localhost:5000/api/rooms
```

---

## Common Verification Issues

### Problem: Backend won't start
- [ ] Check MongoDB is running
- [ ] Check port 5000 is not in use
- [ ] Check .env file has correct values
- [ ] Check MONGODB_URI is accessible

### Problem: Frontend won't load
- [ ] Check backend is running on http://localhost:5000
- [ ] Check both terminals are still open
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Hard refresh (Ctrl+F5)

### Problem: Login fails
- [ ] Check database was seeded (see seed output)
- [ ] Check you're using correct credentials
- [ ] Check browser console for errors (F12)

### Problem: API calls fail
- [ ] Verify both servers running
- [ ] Check proxy in vite.config.js
- [ ] Check response in Network tab (F12)
- [ ] Verify headers including Authorization token

---

## Database Verification

### Check MongoDB Connection
```bash
# If using local MongoDB, connect with:
# MongoDB Compass: mongodb://localhost:27017/stay-secure
# Or using mongosh: mongosh stay-secure
```

### Verify Collections Exist
- [ ] Users collection has 7 documents
- [ ] RoomTypes collection has 5 documents
- [ ] Rooms collection has 10 documents
- [ ] Settings collection has 1 document

### Sample Query Results
```javascript
// Sample user document
{
  _id: ObjectId(...),
  name: "Admin User",
  email: "admin+demo@example.com",
  role: "ADMIN",
  phone: "9000000001",
  emailVerified: false,
  createdAt: Date
}

// Sample room document
{
  _id: ObjectId(...),
  roomNumber: "H-101",
  roomType: ObjectId(...),
  floor: 1,
  capacity: 6,
  status: "AVAILABLE",
  createdAt: Date
}
```

---

## Performance Checks

- [ ] Backend responds to API calls in < 100ms
- [ ] Frontend pages load in < 1 second
- [ ] No console errors (F12)
- [ ] No network errors (Network tab)
- [ ] Database operations complete quickly

---

## Security Verification

- [ ] Passwords are hashed in database (not plaintext)
- [ ] JWT tokens are in localStorage
- [ ] Logout clears token from storage
- [ ] Protected routes redirect to login without token
- [ ] Unauthorized users can't access admin pages

---

## File Structure Verification

```
Backend Files Present:
✅ server/src/models/ (7 files)
✅ server/src/controllers/ (8 files)
✅ server/src/routes/ (9 files)
✅ server/src/middleware/ (3 files)
✅ server/src/services/ (3 files)
✅ server/src/app.js
✅ server/src/server.js
✅ server/src/seed.js
✅ server/src/config/db.js
✅ server/.env
✅ server/package.json

Frontend Files Present:
✅ client/src/components/ (4+ files)
✅ client/src/pages/ (3+ files)
✅ client/src/context/ (1 file)
✅ client/src/services/ (1 file)
✅ client/src/utils/ (1 file)
✅ client/src/App.jsx
✅ client/src/main.jsx
✅ client/index.html
✅ client/vite.config.js
✅ client/tailwind.config.js
✅ client/postcss.config.js
✅ client/package.json
```

---

## Final Checklist

- [ ] Both terminal windows show "Running" status
- [ ] Browser opens to http://localhost:3000
- [ ] Can login with provided credentials
- [ ] Dashboard loads without errors
- [ ] Sidebar shows role-based menu
- [ ] No JavaScript errors in console (F12)
- [ ] No API errors (Network tab shows success)
- [ ] Database is populated with seed data
- [ ] Can navigate between pages
- [ ] Logout works and clears session

---

## Success Criteria

✅ If ALL items above are checked, your project is **fully functional**!

---

## Next Actions

1. **Explore the application** - Try different user roles
2. **Test workflows** - Create bookings, approve, allocate rooms
3. **Review code** - Understand the architecture
4. **Make changes** - Customize for your needs
5. **Learn more** - Read the detailed README.md

---

## 🎉 Congratulations!

Your MERN stack room booking system is now **operational and ready to use**!

For detailed information, refer to:
- `README.md` - Complete documentation
- `QUICKSTART.md` - Quick setup guide
- `COMPLETION_SUMMARY.md` - Project overview
