import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ReceptionistCheckIn = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTodayCheckIns();
  }, []);

  const fetchTodayCheckIns = async () => {
    try {
      const response = await bookingAPI.getTodayCheckIns();
      setBookings(response.data.checkIns || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load check-in bookings.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    setCheckingInId(bookingId);
    setMessage({ type: '', text: '' });

    try {
      const response = await bookingAPI.checkIn(bookingId);

      setMessage({
        type: 'success',
        text: response.data.message || 'Guest checked in successfully.',
      });

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setCheckingInId(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to check in guest.',
      });
      setCheckingInId(null);
    }
  };

  const checkedInCount = bookings.filter((b) => b.bookingStatus === 'CHECKED_IN').length;

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Guest Check-In</h1>
          <p className="text-[#3C4044]/70 mt-2">Check in guests for today's bookings.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card-surface p-4 rounded-2xl border-l-4 border-blue-600">
            <p className="text-[#3C4044]/70 font-semibold">Pending Check-in</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{bookings.length}</p>
          </div>
          <div className="card-surface p-4 rounded-2xl border-l-4 border-emerald-600">
            <p className="text-[#3C4044]/70 font-semibold">Already Checked In</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{checkedInCount}</p>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : message.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="card-surface rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#DDDCDB] bg-white/80">
            <h2 className="text-xl font-bold text-[#3C4044]">Confirmed Bookings ({bookings.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#3C4044]/70">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              No check-ins scheduled for today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Guest Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Check-In Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Guests</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-[#DDDCDB] hover:bg-[#F5F3F1]">
                      <td className="px-6 py-4 text-[#3C4044] font-medium">{booking.bookingNumber}</td>
                      <td className="px-6 py-4 text-[#3C4044]">
                        <div className="text-sm">
                          <div className="font-medium">{booking.user?.name || 'N/A'}</div>
                          <div className="text-[#3C4044]/70">{booking.user?.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#3C4044]">{booking.roomType?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-[#3C4044]">
                        {formatDate(booking.checkInDate)}
                      </td>
                      <td className="px-6 py-4 text-[#3C4044] text-center">{booking.numberOfGuests}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.bookingStatus} />
                      </td>
                      <td className="px-6 py-4">
                        {booking.bookingStatus === 'CONFIRMED' ? (
                          <button
                            onClick={() => handleCheckIn(booking._id)}
                            disabled={checkingInId === booking._id}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                          >
                            {checkingInId === booking._id ? 'Checking...' : 'Check In'}
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold">✓ Done</span>
                        )}
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

export default ReceptionistCheckIn;
