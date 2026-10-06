import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ReceptionistCheckOut = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' or 'TODAY'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingForCheckout, setSelectedBookingForCheckout] = useState(null);
  const [checkoutReason, setCheckoutReason] = useState('Normal checkout');
  const [customReason, setCustomReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let list = [];
      try {
        const response = await bookingAPI.getCheckedInGuests();
        list = response.data.guests || response.data.checkOuts || [];
      } catch (innerErr) {
        const fallbackRes = await bookingAPI.getTodayCheckOuts({ all: 'true' });
        list = fallbackRes.data.checkOuts || fallbackRes.data.guests || [];
      }
      setAllBookings(list);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load checked-in guests.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isEarly = (dateString) => {
    if (!dateString) return false;
    const checkoutDate = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return checkoutDate > today;
  };

  const filteredBookings = allBookings.filter((booking) => {
    if (filterMode === 'TODAY' && !isToday(booking.checkOutDate)) {
      return false;
    }

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const bNumber = (booking.bookingNumber || '').toLowerCase();
    const guestName = (booking.user?.name || '').toLowerCase();
    const guestPhone = (booking.user?.phone || '').toLowerCase();
    const roomNumber = (booking.allocatedRoom?.roomNumber || '').toLowerCase();
    const propertyName = (booking.property?.name || '').toLowerCase();

    return (
      bNumber.includes(term) ||
      guestName.includes(term) ||
      guestPhone.includes(term) ||
      roomNumber.includes(term) ||
      propertyName.includes(term)
    );
  });

  const todayCount = allBookings.filter((b) => isToday(b.checkOutDate)).length;

  const handleOpenCheckoutModal = (booking) => {
    setSelectedBookingForCheckout(booking);
    if (isEarly(booking.checkOutDate)) {
      setCheckoutReason('Customer leaving early');
    } else {
      setCheckoutReason('Normal checkout');
    }
    setCustomReason('');
  };

  const handleConfirmCheckOut = async () => {
    if (!selectedBookingForCheckout || processing) return;

    setProcessing(true);
    setMessage({ type: '', text: '' });

    const finalReason = checkoutReason === 'Other' ? customReason || 'Other departure' : checkoutReason;

    try {
      const response = await bookingAPI.checkOut(selectedBookingForCheckout._id, {
        reason: finalReason,
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Customer checked out successfully. Room has been released.',
      });

      setAllBookings((prev) => prev.filter((b) => b._id !== selectedBookingForCheckout._id));
      setSelectedBookingForCheckout(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to check out customer.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Guest Check-Out</h1>
          <p className="text-[#3C4044]/70 mt-2">
            Check out guests on any date &mdash; handle regular check-outs, early departures, or evictions.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card-surface p-5 rounded-2xl border-l-4 border-[#FD7B41]">
            <p className="text-[#3C4044]/70 font-semibold text-sm">All Active Checked-In</p>
            <p className="text-3xl font-bold text-[#3C4044] mt-1">{allBookings.length}</p>
            <p className="text-xs text-[#3C4044]/60 mt-1">Eligible for check-out at any date</p>
          </div>
          <div className="card-surface p-5 rounded-2xl border-l-4 border-amber-500">
            <p className="text-[#3C4044]/70 font-semibold text-sm">Scheduled For Today</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{todayCount}</p>
            <p className="text-xs text-[#3C4044]/60 mt-1">Normal departure schedule</p>
          </div>
          <div className="card-surface p-5 rounded-2xl border-l-4 border-blue-500 sm:col-span-2 lg:col-span-1">
            <p className="text-[#3C4044]/70 font-semibold text-sm">Early / Anytime Checkout</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">Enabled</p>
            <p className="text-xs text-[#3C4044]/60 mt-1">Early leave or evicted guests can checkout immediately</p>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Controls: Filter & Search */}
        <div className="card-surface rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filterMode === 'ALL'
                  ? 'bg-[#3C4044] text-white shadow-sm'
                  : 'bg-white text-[#3C4044] hover:bg-[#F5F3F1] border border-[#DDDCDB]'
              }`}
            >
              All Checked-In Guests ({allBookings.length})
            </button>
            <button
              onClick={() => setFilterMode('TODAY')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filterMode === 'TODAY'
                  ? 'bg-[#3C4044] text-white shadow-sm'
                  : 'bg-white text-[#3C4044] hover:bg-[#F5F3F1] border border-[#DDDCDB]'
              }`}
            >
              Scheduled For Today ({todayCount})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search guest, room, booking #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none focus:border-[#FD7B41]"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card-surface rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#DDDCDB] bg-white/80 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#3C4044]">
              {filterMode === 'ALL' ? 'Active Checked-In Guests' : "Today's Scheduled Departures"} (
              {filteredBookings.length})
            </h2>
            <button
              onClick={fetchBookings}
              className="text-xs font-semibold text-[#FD7B41] hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#3C4044]/70">Loading guests...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              No checked-in guests found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Guest</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Hotel / PG</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Room</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Scheduled Checkout</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {filteredBookings.map((booking) => {
                    const early = isEarly(booking.checkOutDate);
                    return (
                      <tr key={booking._id} className="bg-white hover:bg-[#fffaf6]">
                        <td className="px-6 py-4 text-[#3C4044] font-medium">{booking.bookingNumber}</td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          <div className="text-sm">
                            <div className="font-semibold">{booking.user?.name || 'N/A'}</div>
                            <div className="text-[#3C4044]/70 text-xs">{booking.user?.phone || booking.user?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          <div className="font-semibold text-sm">{booking.property?.name || 'N/A'}</div>
                          {booking.property?.type && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              {booking.property.type}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          {booking.allocatedRoom ? (
                            <div>
                              <span className="font-bold text-[#3C4044]">
                                Room {booking.allocatedRoom.roomNumber}
                              </span>
                              <div className="text-xs text-[#3C4044]/60">{booking.roomType?.name}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#3C4044]/60">{booking.roomType?.name || 'N/A'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#3C4044]">
                          <div>{formatDate(booking.checkOutDate)}</div>
                          {early && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">
                              Future Date (Early Checkout Allowed)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.bookingStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleOpenCheckoutModal(booking)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#FD7B41] text-white text-xs font-bold hover:bg-[#e76d35] shadow-sm transition"
                          >
                            Check Out
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Checkout Modal with Reason Options */}
        {selectedBookingForCheckout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card-surface rounded-2xl p-6 max-w-lg w-full space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#3C4044]">Confirm Guest Check-Out</h2>
                <p className="text-[#3C4044]/70 mt-1 text-sm">
                  Complete check-out and free the allocated room for other guests.
                </p>
              </div>

              {/* Booking Snapshot */}
              <div className="bg-[#F5F3F1] rounded-xl p-4 space-y-2 text-sm text-[#3C4044]">
                <div className="flex justify-between">
                  <span className="text-[#3C4044]/70">Booking Number:</span>
                  <span className="font-bold">{selectedBookingForCheckout.bookingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3C4044]/70">Guest Name:</span>
                  <span className="font-bold">{selectedBookingForCheckout.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3C4044]/70">Property & Room:</span>
                  <span className="font-bold">
                    {selectedBookingForCheckout.property?.name}{' '}
                    {selectedBookingForCheckout.allocatedRoom
                      ? `(Room ${selectedBookingForCheckout.allocatedRoom.roomNumber})`
                      : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3C4044]/70">Scheduled Checkout:</span>
                  <span className="font-bold">{formatDate(selectedBookingForCheckout.checkOutDate)}</span>
                </div>
                {isEarly(selectedBookingForCheckout.checkOutDate) && (
                  <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                    ⚠️ Early Departure: The guest is checking out before their scheduled checkout date.
                  </div>
                )}
              </div>

              {/* Checkout Reason */}
              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">
                  Departure / Check-out Reason
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'Normal checkout', label: 'Normal Check-out (Scheduled)' },
                    { value: 'Customer leaving early', label: 'Customer Leaving Early (Emergency / Personal)' },
                    { value: 'Customer evicted / kicked out', label: 'Evicted / Kicked Out (Policy violation / Disciplinary)' },
                    { value: 'Other', label: 'Other' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-[#3C4044] cursor-pointer">
                      <input
                        type="radio"
                        name="checkoutReason"
                        value={option.value}
                        checked={checkoutReason === option.value}
                        onChange={(e) => setCheckoutReason(e.target.value)}
                        className="accent-[#FD7B41]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>

                {checkoutReason === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Specify reason..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none focus:border-[#FD7B41]"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleConfirmCheckOut}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FD7B41] text-white font-bold hover:bg-[#e76d35] disabled:opacity-60 transition"
                >
                  {processing ? 'Processing Check-Out...' : 'Confirm Check-Out'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForCheckout(null)}
                  disabled={processing}
                  className="px-4 py-2.5 rounded-xl border border-[#DDDCDB] bg-white text-[#3C4044] font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistCheckOut;
