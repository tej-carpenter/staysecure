import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const menusByRole = {
      CUSTOMER: [
        { label: 'Dashboard', path: '/customer/dashboard' },
        { label: 'Search Rooms', path: '/customer/rooms' },
        { label: 'My Bookings', path: '/customer/bookings' },
        { label: 'Profile', path: '/customer/profile' },
      ],
      ADMIN: [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Properties', path: '/admin/properties' },
        { label: 'Room Types', path: '/admin/room-types' },
        { label: 'Rooms', path: '/admin/rooms' },
        { label: 'Bookings', path: '/admin/bookings' },
        { label: 'Approval Settings', path: '/admin/settings' },
        { label : 'Audit Logs', path: '/admin/audit-logs' },
      ],
      HOTEL_MANAGER: [
        { label: 'Dashboard', path: '/hotel-manager/dashboard' },
        { label: 'Pending Requests', path: '/hotel-manager/pending' },
        { label: 'My Rooms', path: '/hotel-manager/rooms' },
        { label: 'Room Types', path: '/hotel-manager/room-types' },
        { label: 'Allocations', path: '/hotel-manager/allocations' },
        { label: 'Bookings', path: '/hotel-manager/bookings' },
        { label: 'Hotel Settings', path: '/hotel-manager/settings' },
      ],
      ACCOUNTANT: [
        { label: 'Dashboard', path: '/accountant/dashboard' },
        { label: 'Bookings', path: '/admin/bookings' },
        { label: 'Payments', path: '/accountant/payments' },
      ],
      RECEPTIONIST: [
        { label: 'Dashboard', path: '/receptionist/dashboard' },
        { label: 'Bookings', path: '/admin/bookings' },
        { label: 'Room Allocations', path: '/receptionist/allocations' },
        { label: 'Check-In', path: '/receptionist/check-in' },
        { label: 'Check-Out', path: '/receptionist/check-out' },
      ],
    };

    return menusByRole[user?.role] || [{ label: 'Dashboard', path: '/dashboard' }];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 min-h-screen bg-[#3C4044] text-white border-r border-[#3C4044]/10">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-8 tracking-tight text-[#EDBF9B]">🏨 StaySecure</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white/90 transition hover:bg-[#FD7B41]/15 hover:text-[#EDBF9B]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
