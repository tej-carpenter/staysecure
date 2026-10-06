import React, { useEffect, useState } from 'react';
import { bookingAPI, allocationAPI } from '../../services/api';

const RoomManagerDashboard = () => {
  const [stats, setStats] = useState({ approved: 0, allocated: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, allocationsRes] = await Promise.all([
          bookingAPI.getAllBookings(),
          allocationAPI.getAllAllocations(),
        ]);

        const bookings = bookingsRes.data.bookings || [];
        setStats({
          approved: bookings.filter((b) => b.approvalStatus === 'APPROVED').length,
          allocated: allocationsRes.data.allocations?.length || 0,
          pending: bookings.filter((b) => b.approvalStatus === 'PENDING').length,
        });
      } catch (error) {
        console.error('Failed to fetch hotel manager dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3C4044] mb-8">Hotel Manager Dashboard</h1>

        {loading ? (
          <div className="text-[#3C4044]/70">Loading dashboard...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
              <p className="text-[#3C4044]/70 font-semibold">Approved Bookings</p>
              <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.approved}</p>
            </div>
            <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
              <p className="text-[#3C4044]/70 font-semibold">Allocated Rooms</p>
              <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.allocated}</p>
            </div>
            <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
              <p className="text-[#3C4044]/70 font-semibold">Pending Reviews</p>
              <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.pending}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagerDashboard;
