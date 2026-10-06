import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentAPI, bookingAPI } from '../../services/api';

const AccountantDashboard = () => {
  const [stats, setStats] = useState({
    totalPayments: 0,
    paidCount: 0,
    pendingCount: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [paymentsRes, bookingsRes] = await Promise.all([
          paymentAPI.getAllPayments(),
          bookingAPI.getAllBookings(),
        ]);

        const payments = paymentsRes.data.payments || [];
        const bookings = bookingsRes.data.bookings || [];

        const approvedBookings = bookings.filter((b) => b.approvalStatus === 'APPROVED');
        const paidPayments = payments.filter((p) => p.status === 'PAID');
        const pendingPayments = approvedBookings.filter((b) => b.paymentStatus === 'PENDING');

        const totalAmount = approvedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

        setStats({
          totalPayments: payments.length,
          paidCount: paidPayments.length,
          pendingCount: pendingPayments.length,
          totalAmount,
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
          <h1 className="text-3xl font-bold text-[#3C4044]">Accountant Dashboard</h1>
          <p className="text-[#3C4044]/70 mt-2">Manage booking payments and invoices.</p>
        </div>

        {loading ? (
          <div className="text-center text-[#3C4044]/70">Loading stats...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#3C4044]">
                <p className="text-[#3C4044]/70 font-semibold">Total Payments</p>
                <p className="text-4xl font-bold text-[#3C4044] mt-3">{stats.totalPayments}</p>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-emerald-600">
                <p className="text-[#3C4044]/70 font-semibold">Paid</p>
                <p className="text-4xl font-bold text-emerald-600 mt-3">{stats.paidCount}</p>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-yellow-600">
                <p className="text-[#3C4044]/70 font-semibold">Pending Payments</p>
                <p className="text-4xl font-bold text-yellow-600 mt-3">{stats.pendingCount}</p>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
                <p className="text-[#3C4044]/70 font-semibold">Total Amount</p>
                <p className="text-2xl font-bold text-[#FD7B41] mt-3">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#3C4044]">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  to="/accountant/payments"
                  className="px-6 py-3 rounded-xl bg-[#FD7B41] text-white font-semibold hover:bg-[#e76d35] text-center transition"
                >
                  💰 Record Payment
                </Link>
                <Link
                  to="/accountant/history"
                  className="px-6 py-3 rounded-xl bg-[#3C4044] text-white font-semibold hover:bg-[#2b2f33] text-center transition"
                >
                  📊 View Payment History
                </Link>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-[#3C4044]">ℹ️ Accountant Guide</h3>
              <ul className="space-y-2 text-sm text-[#3C4044]/80">
                <li>✓ Record payments for approved bookings</li>
                <li>✓ Accept multiple payment methods (Cash, UPI, Card, Bank Transfer)</li>
                <li>✓ Track all payment transactions</li>
                <li>✓ View payment history and status</li>
                <li>✓ Generate payment reports</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountantDashboard;
