import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the route guards handle auth failures so the app does not do a full-page reload.
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// User endpoints
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  verifyEmail: (id) => api.patch(`/users/${id}/verify-email`),
};

// Room Type endpoints
export const roomTypeAPI = {
  getAllRoomTypes: (params = {}) => api.get('/room-types', { params }),
  getRoomTypeById: (id) => api.get(`/room-types/${id}`),
  createRoomType: (data) => api.post('/room-types', data),
  updateRoomType: (id, data) => api.patch(`/room-types/${id}`, data),
  deleteRoomType: (id) => api.delete(`/room-types/${id}`),
};

// Property endpoints
export const propertyAPI = {
  getProperties: () => api.get('/properties'),
  getAllProperties: () => api.get('/properties/all'),
  getPropertyById: (id) => api.get(`/properties/${id}`),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.patch(`/properties/${id}`, data),
};

// Location endpoints
export const locationAPI = {
  getLocations: () => api.get('/locations'),
  getAllLocations: () => api.get('/locations/all'),
  createLocation: (data) => api.post('/locations', data),
  updateLocation: (id, data) => api.patch(`/locations/${id}`, data),
};

// Room endpoints
export const roomAPI = {
  getAllRooms: (params = {}) => api.get('/rooms', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  getAvailableRooms: (property, roomType, location, checkIn, checkOut, guests) =>
    api.get('/rooms/available', {
      params: { property, roomType, location, checkIn, checkOut, guests },
    }),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.patch(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Booking endpoints
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getAllBookings: () => api.get('/bookings'),
  getMyBookings: () => api.get('/bookings/my'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getPendingBookings: () => api.get('/bookings/pending'),
  approveBooking: (id) => api.patch(`/bookings/${id}/approve`),
  rejectBooking: (id, data) => api.patch(`/bookings/${id}/reject`, data),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
  checkIn: (id) => api.patch(`/reception/${id}/check-in`),
  checkOut: (id, data) => api.patch(`/reception/${id}/check-out`, data),
  getTodayCheckIns: () => api.get('/reception/today/check-ins'),
  getTodayCheckOuts: (params) => api.get('/reception/today/check-outs', { params }),
  getCheckedInGuests: () => api.get('/reception/checked-in'),
};

// Allocation endpoints
export const allocationAPI = {
  getAllAllocations: () => api.get('/allocations'),
  createAllocation: (data) => api.post('/allocations', data),
  getAllocationById: (id) => api.get(`/allocations/${id}`),
};

// Payment endpoints
export const paymentAPI = {
  getAllPayments: () => api.get('/payments'),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  recordPayment: (data) => api.post('/payments', data),
};

// Settings endpoints
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.patch('/settings', data),
};

// Reception endpoints
export const receptionAPI = {
  checkIn: (id) => api.patch(`/reception/${id}/check-in`),
  checkOut: (id, data) => api.patch(`/reception/${id}/check-out`, data),
  getTodayCheckIns: () => api.get('/reception/today/check-ins'),
  getTodayCheckOuts: (params) => api.get('/reception/today/check-outs', { params }),
  getCheckedInGuests: () => api.get('/reception/checked-in'),
};

export default api;
