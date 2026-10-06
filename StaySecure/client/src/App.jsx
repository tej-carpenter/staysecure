import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerProfile from './pages/customer/Profile';
import CustomerRoomsPage from './pages/customer/Rooms';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersPage from './pages/admin/Users';
import AdminPropertiesPage from './pages/admin/Properties';
import AdminRoomTypesPage from './pages/admin/RoomTypes';
import AdminRoomsPage from './pages/admin/Rooms';
import AdminBookingsPage from './pages/admin/Bookings';
import AdminSettingsPage from './pages/admin/Settings';
import ApprovalDashboard from './pages/approval/Dashboard';
import ApprovalPending from './pages/approval/Pending';
import ApprovalHistory from './pages/approval/History';
import AccountantDashboard from './pages/accountant/Dashboard';
import AccountantPayments from './pages/accountant/Payments';
import AccountantHistory from './pages/accountant/History';
import RoomManagerDashboard from './pages/room-manager/Dashboard';
import RoomManagerAllocations from './pages/room-manager/Allocations';
import HotelManagerDashboard from './pages/hotel-manager/Dashboard';
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistCheckIn from './pages/receptionist/CheckIn';
import ReceptionistCheckOut from './pages/receptionist/CheckOut';
import AdminAuditLogs from './pages/admin/AuditLogs';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DDDCDB] text-[#3C4044] text-xl font-semibold">
        Loading session...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <div className={isAuthenticated ? 'flex-1' : 'w-full'}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/rooms"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerRoomsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute requiredRoles={['CUSTOMER']}>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/properties"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminPropertiesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/room-types"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'HOTEL_MANAGER']}>
                  <AdminRoomTypesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'HOTEL_MANAGER']}>
                  <AdminRoomsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'HOTEL_MANAGER', 'ACCOUNTANT', 'RECEPTIONIST']}>
                  <AdminBookingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'HOTEL_MANAGER']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/dashboard"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <HotelManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/pending"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <ApprovalPending />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/history"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <ApprovalHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/rooms"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <AdminRoomsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/room-types"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <AdminRoomTypesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/allocations"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <RoomManagerAllocations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/bookings"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <AdminBookingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hotel-manager/settings"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approval/dashboard"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <HotelManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approval/pending"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <ApprovalPending />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approval/history"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <ApprovalHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accountant/dashboard"
              element={
                <ProtectedRoute requiredRoles={['ACCOUNTANT']}>
                  <AccountantDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accountant/payments"
              element={
                <ProtectedRoute requiredRoles={['ACCOUNTANT']}>
                  <AccountantPayments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/accountant/history"
              element={
                <ProtectedRoute requiredRoles={['ACCOUNTANT']}>
                  <AccountantHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/room-manager/dashboard"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <HotelManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/room-manager/allocations"
              element={
                <ProtectedRoute requiredRoles={['HOTEL_MANAGER']}>
                  <RoomManagerAllocations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/check-in"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckIn />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/checkin"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckIn />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reception/check-in"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckIn />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reception/checkin"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckIn />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/check-out"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckOut />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/checkout"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckOut />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reception/check-out"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckOut />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reception/checkout"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <ReceptionistCheckOut />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/allocations"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <RoomManagerAllocations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reception/allocations"
              element={
                <ProtectedRoute requiredRoles={['RECEPTIONIST', 'ADMIN']}>
                  <RoomManagerAllocations />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
