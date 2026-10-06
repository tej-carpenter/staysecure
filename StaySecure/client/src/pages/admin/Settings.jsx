import React, { useEffect, useState } from 'react';
import { propertyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const isHotelManager = user?.role === 'HOTEL_MANAGER';
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProperties = async () => {
    try {
      const response = await propertyAPI.getAllProperties();
      setProperties(response.data.properties || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load property settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleApprovalModeChange = async (propertyId, mode) => {
    try {
      setSavingId(propertyId);
      setMessage({ type: '', text: '' });
      const response = await propertyAPI.updateProperty(propertyId, { approvalMode: mode });
      setProperties((prev) =>
        prev.map((property) => (property._id === propertyId ? response.data.property : property))
      );
      setMessage({ type: 'success', text: `Approval mode updated to ${mode} successfully.` });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update approval mode.',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">
            {isHotelManager ? 'Hotel Approval Settings' : 'Property Approval Settings'}
          </h1>
          <p className="text-[#3C4044]/70 mt-1">
            {isHotelManager
              ? 'Manage the approval mode (Automatic or Manual) for your assigned hotel or PG.'
              : 'Manage approval mode separately for each hotel, PG, or hostel.'}
          </p>
        </div>

        {message.text && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="card-surface p-8 rounded-2xl text-[#3C4044]/70">Loading settings...</div>
        ) : properties.length === 0 ? (
          <div className="card-surface p-8 rounded-2xl text-[#3C4044]/70">
            {isHotelManager
              ? 'No hotel or PG is currently assigned to your account. Please contact an administrator.'
              : 'No properties available.'}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property._id} className="card-surface rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#3C4044]">{property.name}</h2>
                    <p className="text-sm text-[#3C4044]/70 mt-1">
                      {property.type} · {[property.location?.name, property.location?.city].filter(Boolean).join(' - ') || 'No location assigned'}
                    </p>
                    <p className="text-sm text-[#3C4044]/70 mt-1">
                      Manager: {property.manager?.name || 'Unassigned'}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-[#EDBF9B] px-3 py-1 text-xs font-bold text-[#3C4044]">
                    {property.approvalMode}
                  </span>
                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#DDDCDB]">
                    <input
                      type="radio"
                      name={`approvalMode-${property._id}`}
                      value="AUTOMATIC"
                      checked={property.approvalMode === 'AUTOMATIC'}
                      onChange={() => handleApprovalModeChange(property._id, 'AUTOMATIC')}
                      className="mt-1 accent-[#FD7B41]"
                      disabled={savingId === property._id}
                    />
                    <span className="text-[#3C4044]">
                      <strong>Automatic</strong> - Bookings auto-confirm when a matching room is available.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#DDDCDB]">
                    <input
                      type="radio"
                      name={`approvalMode-${property._id}`}
                      value="MANUAL"
                      checked={property.approvalMode === 'MANUAL'}
                      onChange={() => handleApprovalModeChange(property._id, 'MANUAL')}
                      className="mt-1 accent-[#FD7B41]"
                      disabled={savingId === property._id}
                    />
                    <span className="text-[#3C4044]">
                      <strong>Manual</strong> - Hotel manager must review and approve each booking.
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
