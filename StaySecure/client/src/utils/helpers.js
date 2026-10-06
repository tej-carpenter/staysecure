// Format date to DD/MM/YYYY
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-[#EDBF9B] text-[#3C4044]',
    APPROVED: 'bg-[#FD7B41] text-white',
    REJECTED: 'bg-[#3C4044] text-white',
    CONFIRMED: 'bg-[#FD7B41] text-white',
    CHECKED_IN: 'bg-[#EDBF9B] text-[#3C4044]',
    CHECKED_OUT: 'bg-[#DDDCDB] text-[#3C4044]',
    CANCELLED: 'bg-[#3C4044] text-white',
    AVAILABLE: 'bg-[#EDBF9B] text-[#3C4044]',
    OCCUPIED: 'bg-[#FD7B41] text-white',
    BLOCKED: 'bg-[#3C4044] text-white',
    PAID: 'bg-[#EDBF9B] text-[#3C4044]',
  };
  return colors[status] || 'bg-[#DDDCDB] text-[#3C4044]';
};

// Calculate number of days
export const calculateDays = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

// Calculate total amount
export const calculateTotalAmount = (pricePerDay, checkIn, checkOut) => {
  const days = calculateDays(checkIn, checkOut);
  return pricePerDay * days;
};

// Format currency
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
