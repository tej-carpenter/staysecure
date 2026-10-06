import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

const CustomerProfile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateUser(user.id || user._id, {
        name: formData.name,
        phone: formData.phone,
      });
      login(response.data.user);
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-[#DDDCDB] min-h-screen flex items-center justify-center">
        <div className="text-[#3C4044]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3C4044]">My Profile</h1>
          <p className="text-[#3C4044]/70 mt-2">Manage your account information</p>
        </div>

        <div className="card-surface rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#DDDCDB] bg-white/80 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#3C4044]">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg bg-[#FD7B41] text-white font-semibold hover:bg-[#FD7B41]/90 transition"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="p-6">
            {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}
            {success && <p className="mb-4 text-sm font-semibold text-emerald-600">{success}</p>}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#DDDCDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-[#DDDCDB] rounded-lg bg-[#F5F3F1] text-[#3C4044]/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-[#3C4044]/60 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3C4044] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#DDDCDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD7B41]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#DDDCDB] text-[#3C4044] font-semibold hover:bg-[#DDDCDB]/80 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-[#3C4044]/70 font-semibold uppercase tracking-wide">
                    Full Name
                  </p>
                  <p className="text-lg text-[#3C4044] mt-1 font-medium">{user.name}</p>
                </div>

                <div>
                  <p className="text-sm text-[#3C4044]/70 font-semibold uppercase tracking-wide">
                    Email Address
                  </p>
                  <p className="text-lg text-[#3C4044] mt-1 font-medium">{user.email}</p>
                  {user.isEmailVerified ? (
                    <p className="text-xs text-emerald-600 mt-1 font-semibold">✓ Verified</p>
                  ) : (
                    <p className="text-xs text-red-600 mt-1 font-semibold">⚠ Not verified</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-[#3C4044]/70 font-semibold uppercase tracking-wide">
                    Phone Number
                  </p>
                  <p className="text-lg text-[#3C4044] mt-1 font-medium">{user.phone || 'Not provided'}</p>
                </div>

                <div>
                  <p className="text-sm text-[#3C4044]/70 font-semibold uppercase tracking-wide">
                    User Role
                  </p>
                  <p className="text-lg text-[#3C4044] mt-1 font-medium">
                    <span className="px-3 py-1 rounded-full bg-[#FD7B41]/20 text-[#FD7B41] font-bold text-sm">
                      {user.role}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#3C4044]/70 font-semibold uppercase tracking-wide">
                    Member Since
                  </p>
                  <p className="text-lg text-[#3C4044] mt-1 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card-surface rounded-2xl overflow-hidden mt-6">
          <div className="p-6 border-b border-[#DDDCDB] bg-white/80">
            <h2 className="text-xl font-bold text-[#3C4044]">Account Settings</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F5F3F1] rounded-lg">
              <div>
                <p className="font-semibold text-[#3C4044]">Change Password</p>
                <p className="text-sm text-[#3C4044]/70">Update your account password</p>
              </div>
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-[#DDDCDB] text-[#3C4044]/50 font-semibold cursor-not-allowed"
                title="Coming soon"
              >
                Coming Soon
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F5F3F1] rounded-lg">
              <div>
                <p className="font-semibold text-[#3C4044]">Preferences</p>
                <p className="text-sm text-[#3C4044]/70">Manage notification and privacy settings</p>
              </div>
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-[#DDDCDB] text-[#3C4044]/50 font-semibold cursor-not-allowed"
                title="Coming soon"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
