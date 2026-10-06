# 🚀 Quick Start Guide

Follow these steps to get StaySecure running on your computer.

## Prerequisites

1. **Node.js** installed (Download: https://nodejs.org/)
2. **MongoDB** running locally OR MongoDB Atlas account
   - Local: Download from https://www.mongodb.com/try/download/community
   - Cloud: Sign up at https://www.mongodb.com/cloud/atlas

## Step-by-Step Setup

### STEP 1: Open Terminal (Command Prompt or PowerShell)

Navigate to the project:
```bash
cd C:\Users\msaya\Documents\Projects\BookingApp\StaySecure
```

### STEP 2: Backend Setup (Terminal 1)

```bash
# Navigate to server folder
cd server

# Install packages (This will take 1-2 minutes)
npm install

# Create database and sample data
npm run seed

# Start the backend server
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║  StaySecure Backend Server Running     ║
║  Port: 5000                            ║
╚════════════════════════════════════════╝
```

✅ **KEEP THIS TERMINAL OPEN**

### STEP 3: Frontend Setup (Terminal 2)

Open a **NEW** terminal window and:

```bash
# Navigate to client folder
cd C:\Users\msaya\Documents\Projects\BookingApp\StaySecure\client

# Install packages (This will take 1-2 minutes)
npm install
npm install -D tailwindcss@3.4.17 postcss autoprefixer
# Start the frontend server
npm run dev
```

You should see:
```
  VITE v5.0.2  ready in XXX ms
  ➜  Local:   http://localhost:3000/
```

### STEP 4: Open Application

Open your web browser and go to:

## 🌐 http://localhost:3000

---

## 👤 Login Credentials

### Customer Account
- **Email:** generated from the registration flow in a local non-production environment
- **Password:** use a unique strong password created for that account

### Admin Account
- **Email:** generated from the registration flow in a local non-production environment
- **Password:** use a unique strong password created for that account

### Other Accounts
Create or provision role-based accounts through the registration or admin workflow in a non-production environment using strong unique passwords. Do not embed default credentials in docs or runtime code.

---

## ✅ What to Try First

### As Customer:
1. Create a customer account with a strong password
2. Log in and click "Search Rooms"
3. Select a date range and book a room
4. View your booking in "My Bookings"

### As Admin:
1. Create or provision an admin account with a strong unique password
2. Go to Settings and toggle approval mode
3. Manage users and rooms

---

## 🆘 Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Fix:** Make sure MongoDB is running
- Windows: Search "MongoDB" in Start Menu and run it
- Or use MongoDB Atlas connection string

### Problem: "Port 5000 already in use"
**Fix:** Change PORT in `server/.env`
```
PORT=5001
```

### Problem: "Cannot find module"
**Fix:** Delete and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Frontend won't load
**Fix:** Open browser console (F12) and check errors
- Ensure backend is running on http://localhost:5000
- Check if both terminals are still open

---

## 📞 Need Help?

- Check the main [README.md](README.md) for more details
- Server logs show backend errors
- Browser console (F12) shows frontend errors

---

**Enjoy using StaySecure! 🎉**
