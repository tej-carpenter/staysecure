import React, { useEffect, useState } from 'react';
import { locationAPI, propertyAPI, userAPI } from '../../services/api';

const propertyTypes = ['HOTEL', 'PG', 'HOSTEL', 'GUEST_HOUSE', 'DORMITORY'];
const approvalModes = ['MANUAL', 'AUTOMATIC'];

const defaultForm = {
  name: '',
  type: 'HOTEL',
  location: '',
  manager: '',
  approvalMode: 'MANUAL',
  isActive: true,
};

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      const [propertiesRes, usersRes] = await Promise.all([
        propertyAPI.getAllProperties(),
        userAPI.getAllUsers(),
      ]);

      setProperties(propertiesRes.data.properties || []);
      setManagers((usersRes.data.users || []).filter((user) => user.role === 'HOTEL_MANAGER'));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load properties.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
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
        name: form.name,
        type: form.type,
        location: form.location,
        address: form.location,
        approvalMode: form.approvalMode,
        isActive: form.isActive,
      };

      if (form.manager) payload.manager = form.manager;

      if (editingId) {
        const response = await propertyAPI.updateProperty(editingId, payload);
        setProperties((prev) =>
          prev.map((property) => (property._id === editingId ? response.data.property : property))
        );
        setMessage({ type: 'success', text: 'Property updated successfully.' });
      } else {
        const response = await propertyAPI.createProperty(payload);
        setProperties((prev) => [response.data.property, ...prev]);
        setMessage({ type: 'success', text: 'Property created successfully.' });
      }

      resetForm();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to save property.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (property) => {
    setEditingId(property._id);
    const locText = property.address || [property.location?.address || property.location?.name, property.location?.city].filter(Boolean).join(', ') || '';
    setForm({
      name: property.name || '',
      type: property.type || 'HOTEL',
      location: locText,
      manager: property.manager?._id || property.manager || '',
      approvalMode: property.approvalMode || 'MANUAL',
      isActive: property.isActive !== false,
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#3C4044]">Properties</h1>
          <p className="text-[#3C4044]/70 mt-1">Create and manage hotels, PGs, hostels, and guest houses.</p>
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
              {editingId ? 'Edit Property' : 'Add Property'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Property Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. StaySecure Palace Hotel or Green Valley PG"
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Accommodation Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="PG">PG (Paying Guest)</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="GUEST_HOUSE">Guest House</option>
                  <option value="DORMITORY">Dormitory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Location / Address</label>
                <textarea
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter full address and location details (e.g. 104 MG Road, Koramangala, Bengaluru, Karnataka 560034)"
                  rows={3}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Manager</label>
                <select
                  name="manager"
                  value={form.manager}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} - {manager.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3C4044] mb-2">Approval Mode</label>
                <select
                  name="approvalMode"
                  value={form.approvalMode}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#DDDCDB] bg-white px-3 py-2.5 text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                >
                  {approvalModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
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
                disabled={submitting}
                className="primary-btn px-4 py-2.5 rounded-lg font-bold disabled:opacity-60"
              >
                {submitting ? (editingId ? 'Saving...' : 'Creating...') : editingId ? 'Update Property' : 'Create Property'}
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
              <div className="p-8 text-[#3C4044]/70">Loading properties...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DDDCDB]">
                  <thead className="bg-[#F5F3F1]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Property Name & Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Hotel Manager</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Approval Mode</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDCDB]">
                    {properties.map((property) => (
                      <tr key={property._id} className="bg-white hover:bg-[#fffaf6]">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#3C4044]">{property.name}</div>
                          <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#FD7B41]/10 text-[#FD7B41]">
                            {property.type === 'PG' ? 'PG' : property.type?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#3C4044] text-sm">
                          {property.address || [property.location?.name, property.location?.city].filter(Boolean).join(' - ') || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          {property.manager ? (
                            <div>
                              <div className="font-medium text-[#3C4044]">{property.manager.name}</div>
                              <div className="text-xs text-[#3C4044]/60">{property.manager.email}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#3C4044]">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            property.approvalMode === 'AUTOMATIC'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {property.approvalMode}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              property.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {property.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleEdit(property)}
                            className="px-3 py-1.5 rounded-lg bg-[#FD7B41] text-white text-sm font-bold"
                          >
                            Edit
                          </button>
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

export default AdminPropertiesPage;
