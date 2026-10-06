import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatCurrency, calculateDays } from '../../utils/helpers';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.approvalStatus === 'PENDING').length,
    confirmed: bookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
    checkedIn: bookings.filter(b => b.bookingStatus === 'CHECKED_IN').length,
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#3C4044]">Customer Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
            <p className="text-[#3C4044]/70 font-semibold">Total Bookings</p>
            <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.total}</p>
          </div>
          <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
            <p className="text-[#3C4044]/70 font-semibold">Pending Approval</p>
            <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.pending}</p>
          </div>
          <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
            <p className="text-[#3C4044]/70 font-semibold">Confirmed</p>
            <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.confirmed}</p>
          </div>
          <div className="card-surface p-6 rounded-2xl border-l-4 border-[#EDBF9B]">
            <p className="text-[#3C4044]/70 font-semibold">Checked In</p>
            <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.checkedIn}</p>
          </div>
        </div>

        <div className="card-surface rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#DDDCDB] bg-white/80">
            <h2 className="text-xl font-bold text-[#3C4044]">My Bookings</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-[#3C4044]/70">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center text-[#3C4044]/70">No bookings yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Check-In</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Check-Out</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-[#DDDCDB] hover:bg-[#F5F3F1]">
                      <td className="px-6 py-4 text-[#3C4044] font-medium">{booking.bookingNumber}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{booking.roomType?.name}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{formatDate(booking.checkInDate)}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{formatDate(booking.checkOutDate)}</td>
                      <td className="px-6 py-4 font-bold text-[#3C4044]">{formatCurrency(booking.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.bookingStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
