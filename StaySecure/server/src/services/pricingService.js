// Calculate total amount for a booking
const calculateTotalAmount = (pricePerDay, checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  // Calculate number of days
  const numberOfDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  if (numberOfDays <= 0) {
    throw new Error('Check-out date must be after check-in date.');
  }

  return pricePerDay * numberOfDays;
};

module.exports = {
  calculateTotalAmount,
};
