import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    checkedInCount: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [checkInsRes, checkOutsRes, bookingsRes] = await Promise.all([
          bookingAPI.getTodayCheckIns(),
          bookingAPI.getTodayCheckOuts(),
          bookingAPI.getAllBookings(),
        ]);

        const checkIns = checkInsRes.data.checkIns || [];
        const checkOuts = checkOutsRes.data.checkOuts || [];
        const bookings = bookingsRes.data.bookings || [];
        const checkedIn = bookings.filter((b) => b.bookingStatus === 'CHECKED_IN');

        setStats({
          todayCheckIns: checkIns.length,
          todayCheckOuts: checkOuts.length,
          checkedInCount: checkedIn.length,
          totalBookings: bookings.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Receptionist Dashboard</h1>
          <p className="text-[#3C4044]/70 mt-2">Manage guest check-ins and check-outs.</p>
        </div>

        {loading ? (
          <div className="text-center text-[#3C4044]/70">Loading stats...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card-surface p-6 rounded-2xl border-l-4 border-blue-600">
                <p className="text-[#3C4044]/70 font-semibold">Today's Check-ins</p>
                <p className="text-4xl font-bold text-blue-600 mt-3">{stats.todayCheckIns}</p>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-orange-600">
                <p className="text-[#3C4044]/70 font-semibold">Today's Check-outs</p>
                <p className="text-4xl font-bold text-orange-600 mt-3">{stats.todayCheckOuts}</p>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-emerald-600">
                <p className="text-[#3C4044]/70 font-semibold">Currently Checked In</p>
                <p className="text-4xl font-bold text-emerald-600 mt-3">{stats.checkedInCount}</p>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
                <p className="text-[#3C4044]/70 font-semibold">Total Bookings</p>
                <p className="text-4xl font-bold text-[#FD7B41] mt-3">{stats.totalBookings}</p>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#3C4044]">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Link
                  to="/receptionist/check-in"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 text-center transition flex items-center justify-center gap-2"
                >
                  📥 Check-In Guests
                </Link>
                <Link
                  to="/receptionist/check-out"
                  className="px-6 py-3.5 rounded-xl bg-[#FD7B41] text-white font-semibold hover:bg-[#e76d35] text-center transition flex items-center justify-center gap-2"
                >
                  📤 Check-Out (Any Date)
                </Link>
                <Link
                  to="/receptionist/allocations"
                  className="px-6 py-3.5 rounded-xl bg-[#3C4044] text-white font-semibold hover:bg-[#2b2f33] text-center transition flex items-center justify-center gap-2"
                >
                  🔑 Room Allocations
                </Link>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-[#3C4044]">ℹ️ Receptionist Operations</h3>
              <ul className="space-y-2 text-sm text-[#3C4044]/80">
                <li>✓ <strong>Room Allocation:</strong> Assign available rooms to approved bookings.</li>
                <li>✓ <strong>Flexible Check-out:</strong> Check out guests on any date (regular departure, early leave, or eviction).</li>
                <li>✓ <strong>Instant Room Release:</strong> Checking out frees room to AVAILABLE immediately.</li>
                <li>✓ <strong>Audit Trails:</strong> Every check-in, check-out, and room allocation is fully audit-logged.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
