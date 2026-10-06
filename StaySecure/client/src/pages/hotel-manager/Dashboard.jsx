import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI, bookingAPI, roomAPI, roomTypeAPI, allocationAPI } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/helpers';

const HotelManagerDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    totalRooms: 0,
    allocations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [savingModeId, setSavingModeId] = useState(null);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [rejectingBookingId, setRejectingBookingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Quick Add Room form state
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    property: '',
    roomType: '',
    floor: 1,
    capacity: 1,
  });
  const [submittingRoom, setSubmittingRoom] = useState(false);

  // Quick Add Room Type form state
  const [showAddRoomType, setShowAddRoomType] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    property: '',
    capacity: 2,
    pricePerDay: 1200,
  });
  const [submittingRoomType, setSubmittingRoomType] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [propertiesRes, pendingRes, allBookingsRes, roomsRes, roomTypesRes, allocationsRes] =
        await Promise.all([
          propertyAPI.getAllProperties(),
          bookingAPI.getPendingBookings(),
          bookingAPI.getAllBookings(),
          roomAPI.getAllRooms(),
          roomTypeAPI.getAllRoomTypes(),
          allocationAPI.getAllAllocations(),
        ]);

      const myProperties = propertiesRes.data.properties || [];
      const myPending = pendingRes.data.bookings || [];
      const myAllBookings = allBookingsRes.data.bookings || [];
      const myRooms = roomsRes.data.rooms || [];
      const myRoomTypes = roomTypesRes.data.roomTypes || [];
      const myAllocations = allocationsRes.data.allocations || [];

      setProperties(myProperties);
      setPendingBookings(myPending);
      setRooms(myRooms);
      setRoomTypes(myRoomTypes);
      setAllocations(myAllocations);

      setStats({
        pending: myPending.length,
        approved: myAllBookings.filter((b) => b.approvalStatus === 'APPROVED').length,
        totalRooms: myRooms.length,
        allocations: myAllocations.length,
      });

      if (myProperties.length > 0) {
        const firstProp = myProperties[0];
        const propTypes = myRoomTypes.filter(
          (t) => (t.property?._id || t.property) === firstProp._id
        );
        if (!roomForm.property) {
          setRoomForm((prev) => ({
            ...prev,
            property: firstProp._id,
            roomType: propTypes[0]?._id || '',
          }));
        }
        if (!roomTypeForm.property) {
          setRoomTypeForm((prev) => ({
            ...prev,
            property: firstProp._id,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load hotel manager dashboard data:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load hotel dashboard data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update approval mode for specific hotel
  const handleApprovalModeChange = async (propertyId, newMode) => {
    try {
      setSavingModeId(propertyId);
      setMessage({ type: '', text: '' });

      const response = await propertyAPI.updateProperty(propertyId, { approvalMode: newMode });
      const updatedProp = response.data.property;

      setProperties((prev) =>
        prev.map((prop) => (prop._id === propertyId ? updatedProp : prop))
      );

      setMessage({
        type: 'success',
        text: `Approval mode updated to ${newMode} for ${updatedProp.name}.`,
      });
    } catch (error) {
      console.error('Failed to update approval mode:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update approval mode.',
      });
    } finally {
      setSavingModeId(null);
    }
  };

  // Approve booking
  const handleApproveBooking = async (bookingId) => {
    try {
      setProcessingBookingId(bookingId);
      setMessage({ type: '', text: '' });

      const response = await bookingAPI.approveBooking(bookingId);
      setMessage({
        type: 'success',
        text: response.data.message || 'Booking approved successfully.',
      });

      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to approve booking.',
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  // Reject booking
  const handleRejectBooking = async (bookingId) => {
    try {
      setProcessingBookingId(bookingId);
      setMessage({ type: '', text: '' });

      const response = await bookingAPI.rejectBooking(bookingId, {
        rejectionReason: rejectReason || 'Rejected by hotel manager',
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Booking rejected successfully.',
      });

      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setRejectingBookingId(null);
      setRejectReason('');
      setStats((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
      }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject booking.',
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  // Quick Add Room
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRoom(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        roomNumber: roomForm.roomNumber,
        property: roomForm.property,
        roomType: roomForm.roomType,
        floor: Number(roomForm.floor),
        capacity: Number(roomForm.capacity),
      };

      const response = await roomAPI.createRoom(payload);
      setRooms((prev) => [response.data.room, ...prev]);
      setStats((prev) => ({ ...prev, totalRooms: prev.totalRooms + 1 }));
      setMessage({
        type: 'success',
        text: `Room ${response.data.room.roomNumber} created successfully for your hotel!`,
      });

      setRoomForm((prev) => ({
        ...prev,
        roomNumber: '',
        floor: 1,
        capacity: 1,
      }));
      setShowAddRoom(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add room.',
      });
    } finally {
      setSubmittingRoom(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Delete room ${roomNumber} from your hotel?`)) return;

    try {
      await roomAPI.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      setStats((prev) => ({ ...prev, totalRooms: Math.max(0, prev.totalRooms - 1) }));
      setMessage({
        type: 'success',
        text: `Room ${roomNumber} deleted successfully.`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete room.',
      });
    }
  };

  // Quick Add Room Type
  const handleAddRoomTypeSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRoomType(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: roomTypeForm.name,
        description: roomTypeForm.description,
        property: roomTypeForm.property,
        capacity: Number(roomTypeForm.capacity),
        pricePerDay: Number(roomTypeForm.pricePerDay),
      };

      const response = await roomTypeAPI.createRoomType(payload);
      const createdType = response.data.roomType;
      setRoomTypes((prev) => [createdType, ...prev]);
      setMessage({
        type: 'success',
        text: `Room type "${createdType.name}" created successfully!`,
      });

      setRoomTypeForm((prev) => ({
        ...prev,
        name: '',
        description: '',
        capacity: 2,
        pricePerDay: 1200,
      }));
      setRoomForm((prev) => ({
        ...prev,
        roomType: prev.roomType || createdType._id,
      }));
      setShowAddRoomType(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add room type.',
      });
    } finally {
      setSubmittingRoomType(false);
    }
  };

  // Delete Room Type
  const handleDeleteRoomType = async (typeId, typeName) => {
    if (!window.confirm(`Delete room type "${typeName}"?`)) return;

    try {
      await roomTypeAPI.deleteRoomType(typeId);
      setRoomTypes((prev) => prev.filter((t) => t._id !== typeId));
      setMessage({
        type: 'success',
        text: `Room type "${typeName}" deleted successfully.`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete room type.',
      });
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Hotel Manager Dashboard</h1>
          <p className="text-[#3C4044]/70 mt-1">
            Manage your hotel's rooms, review booking approvals, and configure your hotel's approval mode.
          </p>
        </div>

        {message.text && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="card-surface p-8 rounded-2xl text-center text-[#3C4044]/70">
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Assigned Hotels & Approval Mode Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#3C4044]">My Assigned Hotel / PG</h2>

              {properties.length === 0 ? (
                <div className="card-surface rounded-2xl p-6 border-l-4 border-amber-500 bg-amber-50">
                  <p className="font-semibold text-amber-800">No Hotel Assigned</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You currently have no hotel or PG assigned to your account. Please ask an administrator to assign a property to you so you can manage its rooms and approvals.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {properties.map((property) => (
                    <div key={property._id} className="card-surface rounded-2xl p-6 border border-[#DDDCDB]">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-[#3C4044]">{property.name}</h3>
                            <span className="rounded-full bg-[#EDBF9B] px-3 py-1 text-xs font-bold text-[#3C4044]">
                              {property.type}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                property.approvalMode === 'AUTOMATIC'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {property.approvalMode === 'AUTOMATIC' ? '⚡ Auto Approval' : '✍️ Manual Approval'}
                            </span>
                          </div>
                          <p className="text-sm text-[#3C4044]/70 mt-1">
                            {[property.location?.name, property.location?.city, property.location?.address]
                              .filter(Boolean)
                              .join(' · ') || 'No location set'}
                          </p>
                        </div>

                        {/* Approval Mode Toggle */}
                        <div className="bg-[#F5F3F1] p-4 rounded-xl border border-[#DDDCDB]">
                          <label className="block text-xs font-bold text-[#3C4044] uppercase tracking-wider mb-2">
                            Approval Mode for this Hotel
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#3C4044]">
                              <input
                                type="radio"
                                name={`approvalMode-${property._id}`}
                                value="AUTOMATIC"
                                checked={property.approvalMode === 'AUTOMATIC'}
                                onChange={() => handleApprovalModeChange(property._id, 'AUTOMATIC')}
                                disabled={savingModeId === property._id}
                                className="accent-[#FD7B41]"
                              />
                              <span className="font-semibold">Automatic</span>
                              <span className="text-xs text-[#3C4044]/60">(Instant confirm)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#3C4044]">
                              <input
                                type="radio"
                                name={`approvalMode-${property._id}`}
                                value="MANUAL"
                                checked={property.approvalMode === 'MANUAL'}
                                onChange={() => handleApprovalModeChange(property._id, 'MANUAL')}
                                disabled={savingModeId === property._id}
                                className="accent-[#FD7B41]"
                              />
                              <span className="font-semibold">Manual</span>
                              <span className="text-xs text-[#3C4044]/60">(Review each request)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="card-surface p-6 rounded-2xl border-l-4 border-amber-500">
                <p className="text-[#3C4044]/70 font-semibold text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                <Link
                  to="/hotel-manager/pending"
                  className="text-xs font-bold text-[#FD7B41] hover:underline mt-2 inline-block"
                >
                  Review requests &rarr;
                </Link>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-[#FD7B41]">
                <p className="text-[#3C4044]/70 font-semibold text-sm">Hotel Rooms</p>
                <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.totalRooms}</p>
                <button
                  type="button"
                  onClick={() => setShowAddRoom(true)}
                  className="text-xs font-bold text-[#FD7B41] hover:underline mt-2 inline-block"
                >
                  + Add room &rarr;
                </button>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-indigo-500">
                <p className="text-[#3C4044]/70 font-semibold text-sm">Room Types</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{roomTypes.length}</p>
                <button
                  type="button"
                  onClick={() => setShowAddRoomType(true)}
                  className="text-xs font-bold text-[#FD7B41] hover:underline mt-2 inline-block"
                >
                  + Add room type &rarr;
                </button>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-emerald-500">
                <p className="text-[#3C4044]/70 font-semibold text-sm">Approved Bookings</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.approved}</p>
                <Link
                  to="/hotel-manager/bookings"
                  className="text-xs font-bold text-[#FD7B41] hover:underline mt-2 inline-block"
                >
                  View bookings &rarr;
                </Link>
              </div>

              <div className="card-surface p-6 rounded-2xl border-l-4 border-sky-500">
                <p className="text-[#3C4044]/70 font-semibold text-sm">Allocated Rooms</p>
                <p className="text-3xl font-bold text-sky-600 mt-2">{stats.allocations}</p>
                <Link
                  to="/hotel-manager/allocations"
                  className="text-xs font-bold text-[#FD7B41] hover:underline mt-2 inline-block"
                >
                  Manage allocations &rarr;
                </Link>
              </div>
            </div>

            {/* Pending Approvals Section */}
            <div className="card-surface rounded-2xl overflow-hidden border border-[#DDDCDB]">
              <div className="p-6 border-b border-[#DDDCDB] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#3C4044]">
                    Pending Booking Requests ({pendingBookings.length})
                  </h2>
                  <p className="text-sm text-[#3C4044]/70 mt-0.5">
                    Customer reservations waiting for your approval.
                  </p>
                </div>
                <Link
                  to="/hotel-manager/pending"
                  className="text-sm font-bold text-[#FD7B41] hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="p-8 text-center text-[#3C4044]/70">
                  🎉 No pending booking requests to review!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F3F1] text-xs font-bold text-[#3C4044]">
                      <tr>
                        <th className="px-6 py-3">Booking #</th>
                        <th className="px-6 py-3">Guest</th>
                        <th className="px-6 py-3">Hotel / PG</th>
                        <th className="px-6 py-3">Room Type</th>
                        <th className="px-6 py-3">Dates</th>
                        <th className="px-6 py-3">Guests</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDDCDB] text-sm">
                      {pendingBookings.slice(0, 5).map((booking) => (
                        <React.Fragment key={booking._id}>
                          <tr className="hover:bg-[#fffaf6]">
                            <td className="px-6 py-4 font-bold text-[#3C4044]">
                              {booking.bookingNumber}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-[#3C4044]">
                                {booking.user?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-[#3C4044]/60">
                                {booking.user?.email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#3C4044]">
                              <span className="font-medium">{booking.property?.name || 'My Hotel'}</span>
                              {booking.property?.type && (
                                <span className="ml-2 text-xs rounded bg-stone-200 px-1.5 py-0.5">
                                  {booking.property.type}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-[#3C4044]">
                              {booking.roomType?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-xs text-[#3C4044]">
                              <div>{formatDate(booking.checkInDate)}</div>
                              <div className="text-[#3C4044]/60">to {formatDate(booking.checkOutDate)}</div>
                            </td>
                            <td className="px-6 py-4 text-[#3C4044]">{booking.numberOfGuests}</td>
                            <td className="px-6 py-4 font-bold text-[#3C4044]">
                              {formatCurrency(booking.totalAmount)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApproveBooking(booking._id)}
                                  disabled={processingBookingId === booking._id}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {processingBookingId === booking._id ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingBookingId(booking._id);
                                    setRejectReason('');
                                  }}
                                  disabled={processingBookingId === booking._id}
                                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>

                          {rejectingBookingId === booking._id && (
                            <tr className="bg-red-50">
                              <td colSpan="8" className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRejectBooking(booking._id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                                  >
                                    Confirm Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingBookingId(null)}
                                    className="px-3 py-1.5 rounded-lg border border-[#DDDCDB] bg-white text-xs font-bold text-[#3C4044]"
                                  >
                                    Cancel
                                  </button>
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

            {/* Quick Add Room Modal / Form */}
            {showAddRoom && (
              <div className="card-surface rounded-2xl p-6 border-2 border-[#FD7B41]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#3C4044]">Add New Room to Your Hotel</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddRoom(false)}
                    className="text-sm font-bold text-[#3C4044]/60 hover:text-[#3C4044]"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleAddRoomSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3C4044] mb-1">Hotel / PG</label>
                      <select
                        value={roomForm.property}
                        onChange={(e) => {
                          const propId = e.target.value;
                          const filteredTypes = roomTypes.filter(
                            (t) => (t.property?._id || t.property) === propId
                          );
                          setRoomForm((prev) => ({
                            ...prev,
                            property: propId,
                            roomType: filteredTypes[0]?._id || '',
                          }));
                        }}
                        className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                        required
                      >
                        {properties.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3C4044] mb-1">Room Type</label>
                      <select
                        value={roomForm.roomType}
                        onChange={(e) =>
                          setRoomForm((prev) => ({ ...prev, roomType: e.target.value }))
                        }
                        className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                        required
                      >
                        <option value="">Select Room Type</option>
                        {roomTypes
                          .filter(
                            (t) =>
                              !roomForm.property ||
                              (t.property?._id || t.property) === roomForm.property
                          )
                          .map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} (Cap: {t.capacity}, ₹{t.pricePerDay}/day)
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3C4044] mb-1">Room Number</label>
                      <input
                        type="text"
                        value={roomForm.roomNumber}
                        onChange={(e) =>
                          setRoomForm((prev) => ({ ...prev, roomNumber: e.target.value }))
                        }
                        placeholder="e.g. 101, B-204"
                        className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#3C4044] mb-1">Floor</label>
                        <input
                          type="number"
                          min="0"
                          value={roomForm.floor}
                          onChange={(e) =>
                            setRoomForm((prev) => ({ ...prev, floor: e.target.value }))
                          }
                          className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#3C4044] mb-1">Capacity</label>
                        <input
                          type="number"
                          min="1"
                          value={roomForm.capacity}
                          onChange={(e) =>
                            setRoomForm((prev) => ({ ...prev, capacity: e.target.value }))
                          }
                          className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRoom(false)}
                      className="px-4 py-2 rounded-lg border border-[#DDDCDB] bg-white text-sm font-bold text-[#3C4044]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingRoom || !roomForm.roomType}
                      className="px-5 py-2 rounded-lg bg-[#FD7B41] text-white text-sm font-bold hover:bg-[#e76d35] disabled:opacity-50"
                    >
                      {submittingRoom ? 'Creating Room...' : 'Create Room in Hotel'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quick Add Room Type Modal / Form */}
            {showAddRoomType && (
              <div className="card-surface rounded-2xl p-6 border-2 border-indigo-500 bg-[#FAF9F8]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#3C4044]">Add New Room Type to Your Hotel</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddRoomType(false)}
                    className="text-sm font-bold text-[#3C4044]/60 hover:text-[#3C4044]"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleAddRoomTypeSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3C4044] mb-1">Hotel / PG</label>
                      <select
                        value={roomTypeForm.property}
                        onChange={(e) =>
                          setRoomTypeForm((prev) => ({ ...prev, property: e.target.value }))
                        }
                        className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                        required
                      >
                        {properties.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3C4044] mb-1">Room Type Name</label>
                      <input
                        type="text"
                        value={roomTypeForm.name}
                        onChange={(e) =>
                          setRoomTypeForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="e.g. Deluxe Room, Single AC"
                        className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3C4044] mb-1">Capacity (Guests)</label>
                      <input
                        type="number"
                        min="1"
                        value={roomTypeForm.capacity}
                        onChange={(e) =>
                          setRoomTypeForm((prev) => ({ ...prev, capacity: e.target.value }))
                        }
                        className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3C4044] mb-1">Price per Day (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={roomTypeForm.pricePerDay}
                        onChange={(e) =>
                          setRoomTypeForm((prev) => ({ ...prev, pricePerDay: e.target.value }))
                        }
                        className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3C4044] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={roomTypeForm.description}
                      onChange={(e) =>
                        setRoomTypeForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Brief details about amenities, bed type, inclusions..."
                      className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm text-[#3C4044] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRoomType(false)}
                      className="px-4 py-2 rounded-lg border border-[#DDDCDB] bg-white text-sm font-bold text-[#3C4044]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingRoomType || !roomTypeForm.property}
                      className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submittingRoomType ? 'Creating Room Type...' : 'Create Room Type in Hotel'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* My Hotel Rooms List */}
            <div className="card-surface rounded-2xl overflow-hidden border border-[#DDDCDB]">
              <div className="p-6 border-b border-[#DDDCDB] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#3C4044]">
                    My Hotel Rooms ({rooms.length})
                  </h2>
                  <p className="text-sm text-[#3C4044]/70 mt-0.5">
                    Rooms belonging to your assigned hotel or PG.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddRoom((prev) => !prev)}
                    className="px-4 py-2 rounded-xl bg-[#FD7B41] text-white text-sm font-bold hover:bg-[#e76d35]"
                  >
                    {showAddRoom ? 'Hide Form' : '+ Add Room to Hotel'}
                  </button>
                  <Link
                    to="/hotel-manager/rooms"
                    className="px-4 py-2 rounded-xl border border-[#DDDCDB] bg-white text-sm font-bold text-[#3C4044] hover:bg-[#F5F3F1]"
                  >
                    Manage All Rooms &rarr;
                  </Link>
                </div>
              </div>

              {rooms.length === 0 ? (
                <div className="p-8 text-center text-[#3C4044]/70">
                  No rooms added to your hotel yet. Click "+ Add Room to Hotel" to create your first room.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F3F1] text-xs font-bold text-[#3C4044]">
                      <tr>
                        <th className="px-6 py-3">Room #</th>
                        <th className="px-6 py-3">Hotel / PG</th>
                        <th className="px-6 py-3">Room Type</th>
                        <th className="px-6 py-3">Floor</th>
                        <th className="px-6 py-3">Capacity</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDDCDB] text-sm">
                      {rooms.slice(0, 8).map((room) => (
                        <tr key={room._id} className="hover:bg-[#fffaf6]">
                          <td className="px-6 py-4 font-bold text-[#3C4044]">{room.roomNumber}</td>
                          <td className="px-6 py-4 text-[#3C4044]">
                            <span className="font-semibold">{room.property?.name || '—'}</span>
                            {room.property?.type && (
                              <span className="ml-2 text-xs rounded bg-stone-200 px-1.5 py-0.5">
                                {room.property.type}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#3C4044]">{room.roomType?.name || '—'}</td>
                          <td className="px-6 py-4 text-[#3C4044]">{room.floor}</td>
                          <td className="px-6 py-4 text-[#3C4044]">{room.capacity}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                room.status === 'AVAILABLE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : room.status === 'OCCUPIED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {room.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleDeleteRoom(room._id, room.roomNumber)}
                              className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* My Hotel Room Types List */}
            <div className="card-surface rounded-2xl overflow-hidden border border-[#DDDCDB]">
              <div className="p-6 border-b border-[#DDDCDB] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#3C4044]">
                    My Hotel Room Types ({roomTypes.length})
                  </h2>
                  <p className="text-sm text-[#3C4044]/70 mt-0.5">
                    Room categories, capacities, and pricing configured for your hotel or PG.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddRoomType((prev) => !prev)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
                  >
                    {showAddRoomType ? 'Hide Form' : '+ Add Room Type'}
                  </button>
                  <Link
                    to="/hotel-manager/room-types"
                    className="px-4 py-2 rounded-xl border border-[#DDDCDB] bg-white text-sm font-bold text-[#3C4044] hover:bg-[#F5F3F1]"
                  >
                    Manage All Room Types &rarr;
                  </Link>
                </div>
              </div>

              {roomTypes.length === 0 ? (
                <div className="p-8 text-center text-[#3C4044]/70">
                  No room types defined yet. Click "+ Add Room Type" to create room categories for your hotel.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F3F1] text-xs font-bold text-[#3C4044]">
                      <tr>
                        <th className="px-6 py-3">Category Name</th>
                        <th className="px-6 py-3">Hotel / PG</th>
                        <th className="px-6 py-3">Capacity</th>
                        <th className="px-6 py-3">Price / Day</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDDCDB] text-sm">
                      {roomTypes.map((type) => (
                        <tr key={type._id} className="hover:bg-[#fffaf6]">
                          <td className="px-6 py-4 font-bold text-[#3C4044]">{type.name}</td>
                          <td className="px-6 py-4 text-[#3C4044]">
                            <span className="font-semibold">{type.property?.name || '—'}</span>
                            {type.property?.type && (
                              <span className="ml-2 text-xs rounded bg-stone-200 px-1.5 py-0.5">
                                {type.property.type}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#3C4044]">{type.capacity} guests</td>
                          <td className="px-6 py-4 font-semibold text-emerald-700">
                            {formatCurrency(type.pricePerDay)}
                          </td>
                          <td className="px-6 py-4 text-[#3C4044]/80 max-w-xs truncate">
                            {type.description}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleDeleteRoomType(type._id, type.name)}
                              className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HotelManagerDashboard;
