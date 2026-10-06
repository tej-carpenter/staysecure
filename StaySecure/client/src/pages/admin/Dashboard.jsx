import React, { useEffect, useState } from 'react';
import { bookingAPI, userAPI, roomAPI, propertyAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalProperties: 0,
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, roomsRes, bookingsRes, propertiesRes] = await Promise.all([
        userAPI.getAllUsers(),
        roomAPI.getAllRooms(),
        bookingAPI.getAllBookings(),
        propertyAPI.getAllProperties(),
      ]);
      const propertyList = propertiesRes.data.properties || [];

      setStats({
        totalUsers: usersRes.data.users?.length || 0,
        totalRooms: roomsRes.data.rooms?.length || 0,
        totalBookings: bookingsRes.data.bookings?.length || 0,
        pendingBookings: bookingsRes.data.bookings?.filter(b => b.approvalStatus === 'PENDING').length || 0,
        totalProperties: propertyList.length,
      });
      setProperties(propertyList);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalModeChange = async (propertyId, mode) => {
    try {
      const response = await propertyAPI.updateProperty(propertyId, { approvalMode: mode });
      setProperties((prev) =>
        prev.map((property) => (property._id === propertyId ? response.data.property : property))
      );
    } catch (error) {
      console.error('Failed to update approval mode:', error);
      alert('Failed to update approval mode');
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#3C4044]">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center text-[#3C4044]/70">Loading...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
                <p className="text-[#3C4044]/70 font-semibold">Total Users</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.totalUsers}</p>
              </div>
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
                <p className="text-[#3C4044]/70 font-semibold">Total Rooms</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.totalRooms}</p>
              </div>
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
                <p className="text-[#3C4044]/70 font-semibold">Total Bookings</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.totalBookings}</p>
              </div>
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
                <p className="text-[#3C4044]/70 font-semibold">Pending Approvals</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.pendingBookings}</p>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#3C4044]">Property Approval Settings</h2>
              <div className="border-t border-[#DDDCDB] pt-4">
                <label className="block text-[#3C4044] font-semibold mb-4">
                  Booking Approval Mode by Property
                </label>
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property._id} className="rounded-xl border border-[#DDDCDB] bg-white p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-bold text-[#3C4044]">{property.name}</p>
                          <p className="text-sm text-[#3C4044]/70">{property.type}</p>
                        </div>
                        <div className="flex gap-3">
                          {['AUTOMATIC', 'MANUAL'].map((mode) => (
                            <label key={mode} className="flex items-center gap-2 text-sm text-[#3C4044]">
                              <input
                                type="radio"
                                name={`approvalMode-${property._id}`}
                                value={mode}
                                checked={property.approvalMode === mode}
                                onChange={() => handleApprovalModeChange(property._id, mode)}
                                className="accent-[#FD7B41]"
                              />
                              {mode}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 border-l-4 border-[#FD7B41] bg-[#fffaf6]">
              <h3 className="font-bold text-[#3C4044] mb-2">ℹ️ Admin Information</h3>
              <ul className="text-sm text-[#3C4044]/80 space-y-1">
                <li>✓ Manage users and assign roles</li>
                <li>✓ Create and manage room types by property</li>
                <li>✓ View all bookings and payments</li>
                <li>✓ Change booking approval mode per property</li>
                <li>✓ Access comprehensive reports</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
