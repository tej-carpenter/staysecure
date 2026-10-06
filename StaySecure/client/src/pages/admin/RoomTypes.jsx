import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { roomTypeAPI, propertyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const defaultForm = {
  property: '',
  name: '',
  description: '',
  capacity: 1,
  pricePerDay: 0,
  isActive: true,
};

const AdminRoomTypesPage = () => {
  const { user } = useAuth();
  const isHotelManager = user?.role === 'HOTEL_MANAGER';
  const [roomTypes, setRoomTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const hasProperties = properties.length > 0;

  const fetchRoomTypes = async () => {
    try {
      const [roomTypesResponse, propertiesResponse] = await Promise.all([
        roomTypeAPI.getAllRoomTypes(),
        propertyAPI.getAllProperties(),
      ]);
      const availableProperties = propertiesResponse.data.properties || [];
      setRoomTypes(roomTypesResponse.data.roomTypes || []);
      setProperties(availableProperties);
      setForm((prev) => ({
        ...prev,
        property: prev.property || availableProperties[0]?._id || '',
      }));
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load room types.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const resetForm = () => {
    setForm({ ...defaultForm, property: properties[0]?._id || '' });
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        pricePerDay: Number(form.pricePerDay),
      };

      if (editingId) {
        const response = await roomTypeAPI.updateRoomType(editingId, payload);
        setRoomTypes((prev) =>
          prev.map((item) => (item._id === editingId ? response.data.roomType : item))
        );
        setMessage({ type: 'success', text: 'Room type updated successfully.' });
      } else {
        const response = await roomTypeAPI.createRoomType(payload);
        setRoomTypes((prev) => [response.data.roomType, ...prev]);
        setMessage({ type: 'success', text: 'Room type created successfully.' });
      }

      resetForm();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to save room type.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (roomType) => {
    setEditingId(roomType._id);
    setForm({
      name: roomType.name,
      property: roomType.property?._id || roomType.property || '',
      description: roomType.description,
      capacity: roomType.capacity,
      pricePerDay: roomType.pricePerDay,
      isActive: roomType.isActive,
    });
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (roomTypeId) => {
    if (!window.confirm('Delete this room type?')) return;

    try {
      await roomTypeAPI.deleteRoomType(roomTypeId);
      setRoomTypes((prev) => prev.filter((item) => item._id !== roomTypeId));
      if (editingId === roomTypeId) {
        resetForm();
      }
      setMessage({ type: 'success', text: 'Room type deleted successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to delete room type.',
      });
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3C4044]">
              {isHotelManager ? 'My Hotel Room Types' : 'Room Types'}
            </h1>
            <p className="text-[#3C4044]/70 mt-1">
              {isHotelManager
                ? 'Create and manage room categories for your property.'
                : 'Configure room categories, capacities, and daily pricing.'}
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex gap-2">
            <Link
              to={isHotelManager ? '/hotel-manager/rooms' : '/admin/rooms'}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-[#3C4044] border border-[#DDDCDB] hover:bg-gray-100 transition shadow-sm"
            >
              🛏️ Rooms Inventory
            </Link>
            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-[#3C4044] text-white shadow-sm">
              🏷️ Room Types
            </span>
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
              {editingId ? 'Edit Room Type' : isHotelManager ? 'Add Room Type to Hotel' : 'Add Room Type'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">
                  {isHotelManager ? 'My Hotel / PG' : 'Property'}
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
                      ? 'No property assigned to your account. Contact an administrator.'
                      : 'Create a property before adding room types.'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Deluxe Room, Single Sharing, Dorm Bed"
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this room type"
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">Price / Day</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    min="0"
                    step="0.01"
                    value={form.pricePerDay}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-[#3C4044] font-medium">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="accent-[#FD7B41]"
                />
                Active
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting || !hasProperties}
                className="primary-btn px-4 py-2.5 rounded-lg font-bold disabled:opacity-60"
              >
                {submitting ? (editingId ? 'Saving...' : 'Creating...') : editingId ? 'Update Room Type' : 'Create Room Type'}
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
              <div className="p-8 text-[#3C4044]/70">Loading room types...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DDDCDB]">
                  <thead className="bg-[#F5F3F1]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Property</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Capacity</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Price / Day</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDCDB]">
                    {roomTypes.map((roomType) => (
                      <tr key={roomType._id} className="bg-white hover:bg-[#fffaf6]">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#3C4044]">{roomType.name}</div>
                          <div className="text-sm text-[#3C4044]/70 mt-1">{roomType.description}</div>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          <div className="font-semibold">{roomType.property?.name || '—'}</div>
                          {roomType.property?.type && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-[#3C4044]">
                              {roomType.property.type}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">{roomType.capacity}</td>
                        <td className="px-6 py-4 text-[#3C4044]">₹{roomType.pricePerDay}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              roomType.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {roomType.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(roomType)}
                              className="px-3 py-1.5 rounded-lg bg-[#FD7B41] text-white text-sm font-bold"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(roomType._id)}
                              className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-bold"
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

export default AdminRoomTypesPage;
