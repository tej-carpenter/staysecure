import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
  CONFIRMED: 'bg-sky-100 text-sky-700',
  CHECKED_IN: 'bg-violet-100 text-violet-700',
  CHECKED_OUT: 'bg-emerald-100 text-emerald-700',
  PAID: 'bg-emerald-100 text-emerald-700',
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#3C4044]">Bookings</h1>
          <p className="text-[#3C4044]/70 mt-1">Monitor all reservations and booking lifecycle activity.</p>
        </div>

        {loading ? (
          <div className="card-surface p-8 rounded-2xl text-[#3C4044]/70">Loading bookings...</div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDCDB]">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Booking</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Guest</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Property</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Approval</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Booking</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-[#3C4044]/70">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking._id} className="bg-white hover:bg-[#fffaf6]">
                        <td className="px-6 py-4 text-[#3C4044] font-semibold">
                          {booking.bookingNumber || '—'}
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          {booking.user?.name || booking.guestName || '—'}
                          <div className="text-xs text-[#3C4044]/60">{booking.user?.email || 'Guest'}</div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          {booking.property?.name || '—'}
                          <div className="text-xs text-[#3C4044]/60">
                            {[booking.location?.name, booking.location?.city].filter(Boolean).join(' - ') || 'Location pending'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          {booking.roomType?.name || '—'}
                          <div className="text-xs text-[#3C4044]/60">
                            {booking.numberOfGuests || 0} guest{booking.numberOfGuests === 1 ? '' : 's'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : '—'}
                          <div className="text-xs text-[#3C4044]/60">
                            to {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusColors[booking.approvalStatus] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {booking.approvalStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusColors[booking.bookingStatus] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {booking.bookingStatus || 'REQUESTED'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusColors[booking.paymentStatus] || 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {booking.paymentStatus || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
