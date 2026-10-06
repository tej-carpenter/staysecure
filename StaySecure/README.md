# StaySecure - Room Booking & Accommodation Management System

A complete MERN (MongoDB, Express, React, Node.js) stack application for managing room bookings with support for automatic and manual approval modes.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Demo Credentials](#demo-credentials)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features](#features)

---

## 🎯 Project Overview

StaySecure is a complete booking system that supports:
- **7 Different User Roles** with specific permissions
- **Automatic & Manual Booking Approval** modes
- **Room Allocation** with availability checking
- **Payment Recording** and tracking
- **Check-in/Check-out** management
- **Role-Based Dashboards** for each user type

---

## 💻 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management

---

## 📦 Prerequisites

Before you start, make sure you have installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **MongoDB** (Local or Cloud)
   - Option A: Local MongoDB
     - Download from: https://www.mongodb.com/try/download/community
     - Start MongoDB service
   - Option B: MongoDB Atlas (Cloud)
     - Sign up at: https://www.mongodb.com/cloud/atlas
     - Create a cluster and get connection string

3. **Git** (Optional)
   - Download from: https://git-scm.com/

---

## 🚀 Installation & Setup

### Step 1: Navigate to the Project Directory

```bash
cd c:\Users\msaya\Documents\Projects\BookingApp\StaySecure
```

### Step 2: Set Up Backend

#### 2.1 Install Backend Dependencies

```bash
cd server
npm install
```

**Expected output:**
```
added XXX packages in XXs
```

#### 2.2 Configure Environment Variables

Edit the `.env` file in the `server` folder:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stay-secure
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

**If using MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stay-secure?retryWrites=true&w=majority
```

#### 2.3 Seed Database (Create Initial Data)

```bash
npm run seed
```

**Expected output:**
```
MongoDB Connected: localhost
Cleared existing data...
✓ 7 users created
✓ 5 room types created
✓ 10 rooms created
✓ Settings created (approvalMode: MANUAL)

✅ Database seeded successfully!

Demo accounts may be created for local testing, but production environments must not ship default credentials.
```

### Step 3: Set Up Frontend

#### 3.1 Install Frontend Dependencies

```bash
cd ../client
npm install
```

**Expected output:**
```
added XXX packages in XXs
```

---

## ▶️ Running the Project

### Terminal Setup

You'll need **2 terminal windows** - one for backend, one for frontend.

#### **Terminal 1: Start Backend Server**

```bash
cd server
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════╗
║  StaySecure Backend Server Running     ║
║  Port: 5000                            ║
║  Environment: development              ║
╚════════════════════════════════════════╝

📍 Server URL: http://localhost:5000
📍 Health Check: http://localhost:5000/api/health
```

✅ **Keep this terminal open**

#### **Terminal 2: Start Frontend Server**

```bash
cd client
npm run dev
```

**Expected output:**
```
  VITE v5.0.2  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

✅ **Keep this terminal open**

---

## 🌐 Access the Application

Open your browser and go to: **http://localhost:3000**

You should see the StaySecure home page.

---

## 🔐 Demo Credentials

This project must not ship default credentials in production environments. For local development or demos, create user accounts through the registration flow or seed a separate non-production test account set with unique strong passwords. Do not use embedded default account credentials in documentation or runtime code.

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <your_token>
```

### Key Endpoints

#### Auth
- `POST /auth/register` - Register new customer
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

#### Bookings
- `POST /bookings` - Create booking (Customer)
- `GET /bookings/my` - Get my bookings (Customer)
- `GET /bookings/pending` - Get pending bookings (Approval Manager)
- `PATCH /bookings/:id/approve` - Approve booking (Approval Manager)
- `PATCH /bookings/:id/reject` - Reject booking (Approval Manager)
- `PATCH /bookings/:id/cancel` - Cancel booking (Customer)

#### Rooms
- `GET /rooms` - Get all rooms
- `GET /rooms/available` - Get available rooms
- `POST /rooms` - Create room (Admin, Room Manager)
- `PATCH /rooms/:id` - Update room

#### Allocations
- `POST /allocations` - Allocate room (Room Manager)

#### Payments
- `POST /payments` - Record payment (Accountant)
- `GET /payments` - Get all payments

#### Reception
- `PATCH /reception/:id/check-in` - Check in (Receptionist)
- `PATCH /reception/:id/check-out` - Check out (Receptionist)

---

## 📁 Project Structure

```
StaySecure/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js (MongoDB connection)
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Room.js
│   │   │   ├── Booking.js
│   │   │   ├── Allocation.js
│   │   │   ├── Payment.js
│   │   │   ├── RoomType.js
│   │   │   └── Settings.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── roomController.js
│   │   │   ├── paymentController.js
│   │   │   └── (more controllers...)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   └── (more routes...)
│   │   ├── middleware/
│   │   │   ├── auth.js (Authentication)
│   │   │   ├── role.js (Authorization)
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── bookingService.js
│   │   │   ├── allocationService.js
│   │   │   └── pricingService.js
│   │   ├── app.js (Express app setup)
│   │   ├── server.js (Server entry point)
│   │   └── seed.js (Database seeding)
│   ├── .env (Environment variables)
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── StatusBadge.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── customer/
    │   │   ├── admin/
    │   │   └── (more pages...)
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js (Axios configuration)
    │   ├── utils/
    │   │   └── helpers.js (Utility functions)
    │   ├── App.jsx (Main component)
    │   ├── main.jsx (Entry point)
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ✨ Key Features

### User Roles
- **Admin** - Full system control
- **Customer** - Book rooms and manage bookings
- **Room Manager** - Manage rooms and allocations
- **Approval Manager** - Approve/reject bookings
- **Accountant** - Record payments
- **Receptionist** - Check-in/check-out
- **Auditor** - Read-only access

### Booking Workflows

#### Automatic Approval Mode
```
Customer creates booking
    ↓
System checks availability
    ↓
Room automatically allocated
    ↓
Booking CONFIRMED
```

#### Manual Approval Mode
```
Customer creates booking
    ↓
Booking PENDING
    ↓
Approval Manager approves/rejects
    ↓
Room Manager allocates room
    ↓
Booking CONFIRMED
```

### Core Functions
- ✅ User registration and authentication
- ✅ Room availability checking
- ✅ Automatic room allocation
- ✅ Manual room allocation
- ✅ Payment recording
- ✅ Check-in/check-out
- ✅ Booking cancellation
- ✅ Role-based dashboards
- ✅ Booking approval workflow

---

## 🐛 Troubleshooting

### Problem: Backend won't start (Port 5000 already in use)
**Solution:**
```bash
# Change PORT in server/.env to different port
PORT=5001
```

### Problem: MongoDB Connection Error
**Solution:**
1. Ensure MongoDB is running
2. Check MONGODB_URI in .env
3. If using MongoDB Atlas, verify connection string and IP whitelist

### Problem: Frontend shows "Cannot find module"
**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: API calls failing (404 errors)
**Solution:**
1. Ensure backend is running on http://localhost:5000
2. Check vite.config.js proxy settings
3. Clear browser cache and refresh

---

## 📖 How to Use the Application

### 1. Login as Customer
- Create a customer account through the registration form using a strong password.
- Can search rooms, create bookings, view bookings

### 2. Login as Admin
- Create or provision a dedicated admin account in a local non-production environment with a strong unique password.
- Can manage users, rooms, settings

### 3. Test Booking Workflow
1. Admin sets approval mode to AUTOMATIC
2. Customer searches for available rooms
3. Customer creates booking
4. Booking auto-confirms
5. Accountant records payment
6. Receptionist checks in customer

---

## 📝 Notes

- Change JWT_SECRET in production
- Use environment-specific .env files
- All passwords are hashed with bcryptjs
- MongoDB should be running on localhost:27017 or configured in .env
- Frontend runs on port 3000, Backend on port 5000

---

## 🤝 Contributing

This is a college project. Feel free to modify and extend as needed.

---

## 📄 License

This project is provided as-is for educational purposes.
