import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';

const ApprovalDashboard = () => {
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await bookingAPI.getAllBookings();
        const bookings = response.data.bookings || [];

        setStats({
          pendingCount: bookings.filter((b) => b.approvalStatus === 'PENDING').length,
          approvedCount: bookings.filter((b) => b.approvalStatus === 'APPROVED').length,
          rejectedCount: bookings.filter((b) => b.approvalStatus === 'REJECTED').length,
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
          <h1 className="text-3xl font-bold text-[#3C4044]">Hotel Manager Dashboard</h1>
          <p className="text-[#3C4044]/70 mt-2">Review and manage booking approval requests for your property.</p>
        </div>

        {loading ? (
          <div className="text-center text-[#3C4044]/70">Loading stats...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                to="/approval/pending"
                className="card-surface p-6 rounded-2xl border-l-4 border-yellow-600 hover:shadow-lg transition cursor-pointer"
              >
                <p className="text-[#3C4044]/70 font-semibold">Pending Requests</p>
                <p className="text-4xl font-bold text-yellow-600 mt-3">{stats.pendingCount}</p>
                <p className="text-sm text-[#3C4044]/70 mt-3">Click to review</p>
              </Link>

              <Link
                to="/approval/history"
                className="card-surface p-6 rounded-2xl border-l-4 border-emerald-600 hover:shadow-lg transition cursor-pointer"
              >
                <p className="text-[#3C4044]/70 font-semibold">Approved</p>
                <p className="text-4xl font-bold text-emerald-600 mt-3">{stats.approvedCount}</p>
                <p className="text-sm text-[#3C4044]/70 mt-3">View history</p>
              </Link>

              <Link
                to="/approval/history"
                className="card-surface p-6 rounded-2xl border-l-4 border-red-600 hover:shadow-lg transition cursor-pointer"
              >
                <p className="text-[#3C4044]/70 font-semibold">Rejected</p>
                <p className="text-4xl font-bold text-red-600 mt-3">{stats.rejectedCount}</p>
                <p className="text-sm text-[#3C4044]/70 mt-3">View history</p>
              </Link>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#3C4044]">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  to="/approval/pending"
                  className="px-6 py-3 rounded-xl bg-[#FD7B41] text-white font-semibold hover:bg-[#e76d35] text-center transition"
                >
                  📋 Review Pending Requests
                </Link>
                <Link
                  to="/approval/history"
                  className="px-6 py-3 rounded-xl bg-[#3C4044] text-white font-semibold hover:bg-[#2b2f33] text-center transition"
                >
                  📊 View Approval History
                </Link>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-[#3C4044]">Hotel Manager Guide</h3>
              <ul className="space-y-2 text-sm text-[#3C4044]/80">
                <li>✓ Review all pending customer booking requests</li>
                <li>✓ Approve or reject requests based on business rules</li>
                <li>✓ Provide rejection reasons for rejected bookings</li>
                <li>✓ Track all approval decisions in history</li>
                <li>✓ Approved bookings proceed to room allocation</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovalDashboard;
