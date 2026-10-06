import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatCurrency, calculateDays } from '../../utils/helpers';

const ApprovalPending = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const response = await bookingAPI.getPendingBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load pending bookings.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    if (processing) return;

    setProcessing(bookingId);
    setMessage({ type: '', text: '' });

    try {
      const response = await bookingAPI.approveBooking(bookingId);

      setMessage({
        type: 'success',
        text: response.data.message || 'Booking approved successfully.',
      });

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to approve booking.',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (bookingId) => {
    setRejectingId(bookingId);
    setRejectReason('');
  };

  const handleRejectCancel = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  const handleRejectSubmit = async (bookingId) => {
    if (processing) return;

    setProcessing(bookingId);
    setMessage({ type: '', text: '' });

    try {
      const response = await bookingAPI.rejectBooking(bookingId, {
        rejectionReason: rejectReason || 'Rejected by hotel manager',
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Booking rejected successfully.',
      });

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setRejectingId(null);
      setRejectReason('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject booking.',
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Pending Booking Requests</h1>
          <p className="text-[#3C4044]/70 mt-2">Review and approve customer booking requests.</p>
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
            <h2 className="text-xl font-bold text-[#3C4044]">Requests ({bookings.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#3C4044]/70">Loading pending bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              No pending bookings to review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Hotel / PG</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Dates</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Guests</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <React.Fragment key={booking._id}>
                      <tr className="border-b border-[#DDDCDB] hover:bg-[#F5F3F1]">
                        <td className="px-6 py-4 text-[#3C4044] font-medium">{booking.bookingNumber}</td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          <div className="text-sm">
                            <div className="font-medium">{booking.user?.name || 'N/A'}</div>
                            <div className="text-[#3C4044]/70">{booking.user?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          <div className="font-semibold">{booking.property?.name || 'N/A'}</div>
                          {booking.property?.type && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              {booking.property.type}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">{booking.roomType?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-[#3C4044]">
                          <div>{formatDate(booking.checkInDate)}</div>
                          <div className="text-[#3C4044]/70">to {formatDate(booking.checkOutDate)}</div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">{booking.numberOfGuests}</td>
                        <td className="px-6 py-4 font-bold text-[#3C4044]">
                          {formatCurrency(booking.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(booking._id)}
                              disabled={processing === booking._id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {processing === booking._id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectClick(booking._id)}
                              disabled={processing === booking._id || rejectingId === booking._id}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                      {rejectingId === booking._id && (
                        <tr className="border-b border-[#DDDCDB] bg-red-50">
                          <td colSpan="8" className="px-6 py-4">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-[#3C4044] mb-2">
                                  Rejection Reason (Optional)
                                </label>
                                <textarea
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder="Explain why this booking is being rejected..."
                                  className="w-full border border-red-300 rounded-lg px-3 py-2 text-[#3C4044] focus:outline-none focus:ring-2 focus:ring-red-500"
                                  rows="3"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRejectSubmit(booking._id)}
                                  disabled={processing === booking._id}
                                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                                >
                                  {processing === booking._id ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                                <button
                                  onClick={handleRejectCancel}
                                  disabled={processing === booking._id}
                                  className="px-4 py-2 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-500 disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

export default ApprovalPending;
