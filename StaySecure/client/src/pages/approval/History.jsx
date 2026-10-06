import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ApprovalHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredBookings(bookings.filter((b) => b.approvalStatus !== 'PENDING'));
    } else if (filter === 'approved') {
      setFilteredBookings(bookings.filter((b) => b.approvalStatus === 'APPROVED'));
    } else if (filter === 'rejected') {
      setFilteredBookings(bookings.filter((b) => b.approvalStatus === 'REJECTED'));
    }
  }, [filter, bookings]);

  const fetchAllBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load booking history.',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: bookings.filter((b) => b.approvalStatus !== 'PENDING').length,
    approved: bookings.filter((b) => b.approvalStatus === 'APPROVED').length,
    rejected: bookings.filter((b) => b.approvalStatus === 'REJECTED').length,
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Approval History</h1>
          <p className="text-[#3C4044]/70 mt-2">Review all approved and rejected bookings.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="card-surface p-6 rounded-2xl border-l-4 border-[#3C4044]">
            <p className="text-[#3C4044]/70 font-semibold">Total Processed</p>
            <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.total}</p>
          </div>
          <div className="card-surface p-6 rounded-2xl border-l-4 border-emerald-600">
            <p className="text-[#3C4044]/70 font-semibold">Approved</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.approved}</p>
          </div>
          <div className="card-surface p-6 rounded-2xl border-l-4 border-red-600">
            <p className="text-[#3C4044]/70 font-semibold">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#3C4044]">Booking Decisions</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    filter === 'all'
                      ? 'bg-[#3C4044] text-white'
                      : 'bg-[#DDDCDB] text-[#3C4044] hover:bg-[#c7c5c2]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    filter === 'approved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#DDDCDB] text-[#3C4044] hover:bg-[#c7c5c2]'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    filter === 'rejected'
                      ? 'bg-red-600 text-white'
                      : 'bg-[#DDDCDB] text-[#3C4044] hover:bg-[#c7c5c2]'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#3C4044]/70">Loading approval history...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              No {filter !== 'all' ? filter : ''} bookings to display.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Dates</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-[#DDDCDB] hover:bg-[#F5F3F1]">
                      <td className="px-6 py-4 text-[#3C4044] font-medium">{booking.bookingNumber}</td>
                      <td className="px-6 py-4 text-[#3C4044]">
                        <div className="text-sm">
                          <div className="font-medium">{booking.user?.name || 'N/A'}</div>
                          <div className="text-[#3C4044]/70">{booking.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#3C4044]">{booking.roomType?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-[#3C4044]">
                        <div>{formatDate(booking.checkInDate)}</div>
                        <div className="text-[#3C4044]/70">to {formatDate(booking.checkOutDate)}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#3C4044]">
                        {formatCurrency(booking.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.approvalStatus} />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3C4044]/70 max-w-xs">
                        {booking.rejectionReason || '-'}
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

export default ApprovalHistory;
