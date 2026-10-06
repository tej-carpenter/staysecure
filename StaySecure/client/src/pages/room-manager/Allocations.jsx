import React, { useEffect, useState } from 'react';
import { allocationAPI, bookingAPI, roomAPI } from '../../services/api';

const RoomManagerAllocations = () => {
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      let approved = [];
      try {
        const bookingsRes = await bookingAPI.getApprovedBookings();
        approved = bookingsRes.data.bookings || [];
      } catch (innerErr) {
        const bookingsRes = await bookingAPI.getAllBookings();
        approved = (bookingsRes.data.bookings || []).filter((b) => b.approvalStatus === 'APPROVED');
      }

      const [roomsRes, allocationsRes] = await Promise.all([
        roomAPI.getAllRooms(),
        allocationAPI.getAllAllocations(),
      ]);

      setApprovedBookings(approved);
      setRooms(roomsRes.data.rooms || []);
      setAllocations(allocationsRes.data.allocations || []);
    } catch (error) {
      console.error('Failed to fetch allocation data:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load allocation data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedRoomsByBooking, setSelectedRoomsByBooking] = useState({});
  const [allocatingId, setAllocatingId] = useState(null);

  const getMatchingRooms = (booking) => {
    const bookingPropId = String(booking?.property?._id || booking?.property || '');
    const bookingTypeId = String(booking?.roomType?._id || booking?.roomType || '');
    return rooms.filter((r) => {
      const roomPropId = String(r.property?._id || r.property || '');
      const roomTypeId = String(r.roomType?._id || r.roomType || '');
      return r.status === 'AVAILABLE' && roomTypeId === bookingTypeId && (!bookingPropId || roomPropId === bookingPropId);
    });
  };

  const handleAllocate = async (bookingId) => {
    const booking = approvedBookings.find((b) => b._id === bookingId);
    const matchingRooms = getMatchingRooms(booking);
    const chosenRoomId = selectedRoomsByBooking[bookingId] || matchingRooms[0]?._id;

    if (!chosenRoomId) {
      setMessage({ type: 'error', text: 'No matching available room found for this booking.' });
      return;
    }

    setAllocatingId(bookingId);
    setMessage({ type: '', text: '' });

    try {
      const response = await allocationAPI.createAllocation({ bookingId, roomId: chosenRoomId });
      setMessage({ type: 'success', text: response.data.message || 'Room allocated successfully.' });
      await fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to allocate room.' });
    } finally {
      setAllocatingId(null);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3C4044] mb-2">Room Allocations</h1>
        <p className="text-[#3C4044]/70 mb-6">Assign available rooms to approved reservations.</p>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-[#3C4044]/70">Loading allocations...</div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDCDB]">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Guest</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Hotel / PG</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Room Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {approvedBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-[#3C4044]/70">No approved bookings need allocation.</td>
                    </tr>
                  ) : (
                    approvedBookings.map((booking) => {
                      const allocation = allocations.find((a) => (a.booking?._id || a.booking) === booking._id);
                      const matching = getMatchingRooms(booking);
                      return (
                        <tr key={booking._id} className="bg-white hover:bg-[#fffaf6]">
                          <td className="px-6 py-4 text-[#3C4044] font-semibold">{booking.bookingNumber}</td>
                          <td className="px-6 py-4 text-[#3C4044]">
                            <div className="font-medium">{booking.user?.name || '—'}</div>
                            <div className="text-xs text-[#3C4044]/60">{booking.user?.phone || booking.user?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4 text-[#3C4044]">
                            <div className="font-medium text-sm">{booking.property?.name || '—'}</div>
                            {booking.property?.type && (
                              <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                {booking.property.type}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#3C4044]">{booking.roomType?.name || '—'}</td>
                          <td className="px-6 py-4 text-[#3C4044]">
                            <div className="text-sm">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : '—'}</div>
                            <div className="text-xs text-[#3C4044]/60">to {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : '—'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {allocation ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                <span>✓ Room {allocation.room?.roomNumber || 'Assigned'}</span>
                              </div>
                            ) : matching.length === 0 ? (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                                No available rooms
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <select
                                  value={selectedRoomsByBooking[booking._id] || matching[0]?._id}
                                  onChange={(e) => setSelectedRoomsByBooking((prev) => ({ ...prev, [booking._id]: e.target.value }))}
                                  className="text-xs rounded-lg border border-[#DDDCDB] bg-white px-2 py-1.5 text-[#3C4044] focus:outline-none focus:border-[#FD7B41]"
                                >
                                  {matching.map((r) => (
                                    <option key={r._id} value={r._id}>
                                      Room {r.roomNumber} (Fl. {r.floor})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAllocate(booking._id)}
                                  disabled={allocatingId === booking._id}
                                  className="px-3 py-1.5 rounded-lg bg-[#FD7B41] text-white text-xs font-bold hover:bg-[#e96e34] disabled:opacity-60 transition"
                                >
                                  {allocatingId === booking._id ? 'Allocating...' : 'Allocate'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
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

export default RoomManagerAllocations;
