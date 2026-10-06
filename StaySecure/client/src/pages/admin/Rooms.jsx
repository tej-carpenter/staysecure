import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { roomAPI, roomTypeAPI, locationAPI, propertyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const defaultForm = {
  roomNumber: '',
  property: '',
  roomType: '',
  location: '',
  floor: 1,
  capacity: 1,
  status: 'AVAILABLE',
};

const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'BLOCKED'];

const AdminRoomsPage = () => {
  const { user } = useAuth();
  const isHotelManager = user?.role === 'HOTEL_MANAGER';
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasProperties = properties.length > 0;

  const fetchData = async () => {
    try {
      const [roomsRes, roomTypesRes, locationsRes, propertiesRes] = await Promise.all([
        roomAPI.getAllRooms(),
        roomTypeAPI.getAllRoomTypes(),
        locationAPI.getAllLocations(),
        propertyAPI.getAllProperties(),
      ]);

      const availableProperties = propertiesRes.data.properties || [];
      const availableRoomTypes = roomTypesRes.data.roomTypes || [];
      setRooms(roomsRes.data.rooms || []);
      setRoomTypes(availableRoomTypes);
      setLocations(locationsRes.data.locations || []);
      setProperties(availableProperties);
      if (!form.roomType && (roomTypesRes.data.roomTypes || []).length > 0) {
        const firstProperty = availableProperties[0] || null;
        const firstRoomType = availableRoomTypes.find((type) => (type.property?._id || type.property) === firstProperty?._id) || availableRoomTypes[0];
        setForm((prev) => ({
          ...prev,
          property: firstProperty?._id || '',
          roomType: firstRoomType?._id || '',
          location: firstProperty?.location?._id || firstProperty?.location || locationsRes.data.locations?.[0]?._id || '',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch rooms data:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load rooms.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      roomNumber: '',
      property: properties[0]?._id || '',
      roomType: roomTypes.find((type) => (type.property?._id || type.property) === properties[0]?._id)?._id || roomTypes[0]?._id || '',
      location: properties[0]?.location?._id || properties[0]?.location || locations[0]?._id || '',
      floor: 1,
      capacity: 1,
      status: 'AVAILABLE',
    });
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'property') {
      const property = properties.find((item) => item._id === value);
      const nextRoomType = roomTypes.find((type) => (type.property?._id || type.property) === value);
      setForm((prev) => ({
        ...prev,
        property: value,
        roomType: nextRoomType?._id || '',
        location: property?.location?._id || property?.location || prev.location,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...form,
        floor: Number(form.floor),
        capacity: Number(form.capacity),
      };

      if (editingId) {
        const response = await roomAPI.updateRoom(editingId, payload);
        setRooms((prev) =>
          prev.map((room) => (room._id === editingId ? response.data.room : room))
        );
        setMessage({ type: 'success', text: 'Room updated successfully.' });
      } else {
        const response = await roomAPI.createRoom(payload);
        setRooms((prev) => [response.data.room, ...prev]);
        setMessage({ type: 'success', text: 'Room created successfully.' });
      }

      resetForm();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to save room.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      property: room.property?._id || room.property || '',
      roomType: room.roomType?._id || room.roomType || '',
      location: room.location?._id || room.location || '',
      floor: room.floor,
      capacity: room.capacity,
      status: room.status,
    });
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;

    try {
      await roomAPI.deleteRoom(roomId);
      setRooms((prev) => prev.filter((room) => room._id !== roomId));
      if (editingId === roomId) {
        resetForm();
      }
      setMessage({ type: 'success', text: 'Room deleted successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to delete room.',
      });
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3C4044]">
              {isHotelManager ? 'My Hotel Rooms' : 'Rooms Management'}
            </h1>
            <p className="text-[#3C4044]/70 mt-1">
              {isHotelManager
                ? 'Manage room inventory and add rooms for your assigned hotel or PG only.'
                : 'Create and manage room inventory across hotels and properties.'}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#3C4044] text-white shadow-sm">
              🛏️ Rooms Inventory
            </span>
            <Link
              to={isHotelManager ? '/hotel-manager/room-types' : '/admin/room-types'}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-[#3C4044] border border-[#DDDCDB] hover:bg-gray-100 transition shadow-sm"
            >
              🏷️ Room Types
            </Link>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-5 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#3C4044] mb-5">
              {editingId ? 'Edit Room' : isHotelManager ? 'Add Room to Hotel' : 'Add Room'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Room Number</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={handleChange}
                  placeholder="H-101"
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">
                  {isHotelManager ? 'My Assigned Hotel / PG' : 'Property'}
                </label>
                <select
                  name="property"
                  value={form.property}
                  onChange={handleChange}
                  disabled={!hasProperties || (isHotelManager && properties.length === 1)}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none disabled:bg-gray-100"
                  required
                >
                  {!hasProperties && <option value="">No properties available</option>}
                  {properties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.name} ({property.type})
                    </option>
                  ))}
                </select>
                {!hasProperties && (
                  <p className="mt-2 text-sm text-red-700">
                    {isHotelManager
                      ? 'No hotel or PG is assigned to your account. Contact an administrator to assign a property.'
                      : 'Create or migrate a property before adding rooms.'}
                  </p>
                )}
                {isHotelManager && hasProperties && (
                  <p className="mt-1 text-xs text-[#3C4044]/60">
                    🔒 Rooms will be added exclusively to your assigned hotel.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Room Type</label>
                <select
                  name="roomType"
                  value={form.roomType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                >
                  {roomTypes
                    .filter((type) => !form.property || (type.property?._id || type.property) === form.property)
                    .map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Location</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">Floor</label>
                  <input
                    type="number"
                    name="floor"
                    min="1"
                    value={form.floor}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                >
                  {roomStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting || !hasProperties}
                className="primary-btn px-4 py-2.5 rounded-lg font-bold disabled:opacity-60"
              >
                {submitting ? (editingId ? 'Saving...' : 'Creating...') : editingId ? 'Update Room' : 'Create Room'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-lg border border-[#DDDCDB] bg-white text-[#3C4044] font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="card-surface rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-[#3C4044]/70">Loading rooms...</div>
            ) : (
              <div className="w-full">
                <table className="w-full table-fixed divide-y divide-[#DDDCDB] text-xs">
                  <thead className="bg-[#F5F3F1]">
                    <tr>
                      <th className="w-[13%] px-2 py-3 text-left font-bold text-[#3C4044]">Room</th>
                      <th className="w-[18%] px-2 py-3 text-left font-bold text-[#3C4044]">Property</th>
                      <th className="w-[14%] px-2 py-3 text-left font-bold text-[#3C4044]">Type</th>
                      <th className="w-[16%] px-2 py-3 text-left font-bold text-[#3C4044]">Location</th>
                      <th className="w-[8%] px-2 py-3 text-left font-bold text-[#3C4044]">Floor</th>
                      <th className="w-[11%] px-2 py-3 text-left font-bold text-[#3C4044]">Capacity</th>
                      <th className="w-[14%] px-2 py-3 text-left font-bold text-[#3C4044]">Status</th>
                      <th className="w-[18%] px-2 py-3 text-left font-bold text-[#3C4044]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDCDB]">
                    {rooms.map((room) => (
                      <tr key={room._id} className="bg-white hover:bg-[#fffaf6]">
                        <td className="break-words px-2 py-3 font-bold text-[#3C4044]">{room.roomNumber}</td>
                        <td className="break-words px-2 py-3 text-[#3C4044]">
                          <div className="font-semibold">{room.property?.name || '—'}</div>
                          {room.property?.type && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-[#3C4044]">
                              {room.property.type}
                            </span>
                          )}
                        </td>
                        <td className="break-words px-2 py-3 text-[#3C4044]">{room.roomType?.name || room.roomType}</td>
                        <td className="break-words px-2 py-3 text-[#3C4044]">{room.location?.name || 'Unassigned'}</td>
                        <td className="px-2 py-3 text-[#3C4044]">{room.floor}</td>
                        <td className="px-2 py-3 text-[#3C4044]">{room.capacity}</td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              room.status === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : room.status === 'OCCUPIED'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(room)}
                              className="px-2 py-1 rounded-md bg-[#FD7B41] text-white text-[10px] font-bold"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(room._id)}
                              className="px-2 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 text-[10px] font-bold"
                            >
                              Delete
                            </button>
                          </div>
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
    </div>
  );
};

export default AdminRoomsPage;
