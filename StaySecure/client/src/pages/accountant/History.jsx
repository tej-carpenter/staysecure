import React, { useEffect, useState } from 'react';
import { paymentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const AccountantHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getAllPayments();
      setPayments(response.data.payments || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load payment history.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter((p) => p.status === filter);

  const stats = {
    total: payments.length,
    paid: payments.filter((p) => p.status === 'PAID').length,
    pending: payments.filter((p) => p.status === 'PENDING').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="p-6 bg-[#DDDCDB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3C4044]">Payment History</h1>
          <p className="text-[#3C4044]/70 mt-2">View all payment transactions.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <div className="card-surface p-4 rounded-2xl border-l-4 border-[#3C4044]">
            <p className="text-[#3C4044]/70 font-semibold text-sm">Total Payments</p>
            <p className="text-3xl font-bold text-[#3C4044] mt-2">{stats.total}</p>
          </div>
          <div className="card-surface p-4 rounded-2xl border-l-4 border-emerald-600">
            <p className="text-[#3C4044]/70 font-semibold text-sm">Paid Count</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.paid}</p>
          </div>
          <div className="card-surface p-4 rounded-2xl border-l-4 border-yellow-600">
            <p className="text-[#3C4044]/70 font-semibold text-sm">Pending Count</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="card-surface p-4 rounded-2xl border-l-4 border-[#FD7B41]">
            <p className="text-[#3C4044]/70 font-semibold text-sm">Total Amount</p>
            <p className="text-xl font-bold text-[#FD7B41] mt-2">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="card-surface p-4 rounded-2xl border-l-4 border-emerald-600">
            <p className="text-[#3C4044]/70 font-semibold text-sm">Amount Paid</p>
            <p className="text-xl font-bold text-emerald-600 mt-2">₹{stats.paidAmount.toLocaleString('en-IN')}</p>
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
              <h2 className="text-xl font-bold text-[#3C4044]">Payment Transactions</h2>
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
                  onClick={() => setFilter('PAID')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    filter === 'PAID'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#DDDCDB] text-[#3C4044] hover:bg-[#c7c5c2]'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    filter === 'PENDING'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-[#DDDCDB] text-[#3C4044] hover:bg-[#c7c5c2]'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#3C4044]/70">Loading payment history...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-[#3C4044]/70">
              No {filter !== 'all' ? filter.toLowerCase() : ''} payments to display.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Booking #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Room Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#3C4044]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="border-b border-[#DDDCDB] hover:bg-[#F5F3F1]">
                      <td className="px-6 py-4 text-[#3C4044] font-medium">
                        {payment.booking?.bookingNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-[#3C4044]">
                        <div className="text-sm">
                          <div className="font-medium">{payment.booking?.user?.name || 'N/A'}</div>
                          <div className="text-[#3C4044]/70">{payment.booking?.user?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#3C4044]">{payment.booking?.roomType?.name || 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-[#3C4044]">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-[#3C4044]">
                        <span className="px-2 py-1 bg-[#EDBF9B] text-[#3C4044] text-xs font-semibold rounded">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3C4044]/70">
                        {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
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

export default AccountantHistory;
