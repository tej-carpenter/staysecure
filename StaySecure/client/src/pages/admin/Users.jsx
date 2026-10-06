import React, { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';

const roleOptions = ['ADMIN', 'CUSTOMER', 'HOTEL_MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load users.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, nextRole) => {
    if (!userId || !nextRole) return;

    setSavingId(userId);
    setMessage({ type: '', text: '' });

    try {
      const response = await userAPI.updateUser(userId, { role: nextRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: response.data.user.role } : user
        )
      );
      setMessage({ type: 'success', text: 'Role updated successfully.' });
    } catch (error) {
      console.error('Failed to update user role:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to update role.',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleVerifyEmail = async (userId) => {
    if (!userId) return;

    setSavingId(userId);
    setMessage({ type: '', text: '' });

    try {
      const response = await userAPI.verifyEmail(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, emailVerified: response.data.user.emailVerified } : user
        )
      );
      setMessage({ type: 'success', text: 'Email verified successfully.' });
    } catch (error) {
      console.error('Failed to verify user email:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to verify email.',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#3C4044]">User Management</h1>
            <p className="text-[#3C4044]/70 mt-1">Manage staff roles and account access.</p>
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

        {loading ? (
          <div className="card-surface p-8 rounded-2xl text-[#3C4044]/70">Loading users...</div>
        ) : (
          <div className="card-surface rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDCDB]">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Verification Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#3C4044]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDCDB]">
                  {users.map((user) => (
                    <tr key={user._id} className="bg-white hover:bg-[#fffaf6]">
                      <td className="px-6 py-4 text-[#3C4044] font-semibold">{user.name}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{user.email}</td>
                      <td className="px-6 py-4 text-[#3C4044]">{user.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role || 'CUSTOMER'}
                          onChange={(event) => handleRoleChange(user._id, event.target.value)}
                          disabled={savingId === user._id}
                          className="rounded-lg border border-[#DDDCDB] bg-white px-3 py-2 text-sm font-medium text-[#3C4044] focus:border-[#FD7B41] focus:outline-none"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.emailVerified
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {user.emailVerified ? '✓ Verified' : '⚠ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!user.emailVerified && (
                          <button
                            onClick={() => handleVerifyEmail(user._id)}
                            disabled={savingId === user._id}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#FD7B41] text-white text-xs font-semibold hover:bg-[#f56d34] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingId === user._id ? 'Verifying...' : 'Verify Email'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
