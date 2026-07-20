import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android Emulators to reach the host machine's localhost
// For iOS Simulator or Web, localhost works fine.
// Replace with your computer's local IP address (e.g., 192.168.1.5) if testing on a real device via Expo Go.
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Fallback — set EXPO_PUBLIC_API_URL in your .env file
  return 'http://10.164.196.32:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Failed to inject token in API request', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  getAllCategories: () => api.get('/categories').then(res => res.data),
  getAllTests: () => api.get('/tests').then(res => res.data),
  getAllPackages: () => api.get('/packages').then(res => res.data),
  getTestById: (id: string) => api.get(`/tests/${id}`).then(res => res.data),
  createBooking: (data: any) => api.post('/bookings', data).then(res => res.data),
  createRazorpayOrder: (amount: number) => api.post('/bookings/razorpay/create-order', { amount }).then(res => res.data),
  login: (data: any) => api.post('/auth/login', data).then(res => res.data),
  register: (data: any) => api.post('/auth/register', data).then(res => res.data),
  checkMobile: (mobile: string) => api.get(`/auth/check-mobile?mobile=${encodeURIComponent(mobile)}`).then(res => res.data),
  getAddresses: (mobile: string) => api.get(`/addresses?mobile=${encodeURIComponent(mobile)}`).then(res => res.data),
  addAddress: (data: any) => api.post('/addresses', data).then(res => res.data),
  removeAddress: (id: string) => api.delete(`/addresses/${id}`).then(res => res.data),
  getCities: () => api.get('/cities').then(res => res.data),
  getBookings: (mobile: string) => api.get(`/bookings?mobile=${encodeURIComponent(mobile)}`).then(res => res.data),
  getBookingById: (id: string) => api.get(`/bookings?id=${id}`).then(res => res.data),
  getMe: () => api.get('/users/me').then(res => res.data),
  addFamilyMember: (data: any) => api.post('/users/family', data).then(res => res.data),
  removeFamilyMember: (id: string) => api.delete(`/users/family/${id}`).then(res => res.data),
  getPaymentMethods: (mobile: string) => api.get(`/payment-methods?mobile=${encodeURIComponent(mobile)}`).then(res => res.data),
  addPaymentMethod: (data: any) => api.post('/payment-methods', data).then(res => res.data),
  removePaymentMethod: (id: string) => api.delete(`/payment-methods/${id}`).then(res => res.data),
getMyReports: () => api.get('/reports/my-reports').then(res => res.data),
  getReportById: (id: string) => api.get(`/reports/${id}`).then(res => res.data),
 getAvailableSlots: (date: string) => api.get(`/bookings/available-slots?date=${encodeURIComponent(date)}`).then(res => res.data),
getBranches: (params?: { isActive?: boolean; homeCollection?: boolean; labVisit?: boolean }) =>
    api.get('/branches', { params }).then(res => res.data),
  getBranchById: (id: string) => api.get(`/branches/${id}`).then(res => res.data),
updateMe: (data: { name?: string; email?: string }) => api.patch('/users/me', data).then(res => res.data),
  registerPartner: (data: any) => api.post('/auth/register/partner', data).then(res => res.data),
getPartnerBookings: () => api.get('/partner/bookings').then(res => res.data),
  getPartnerHistory: () => api.get('/partner/history').then(res => res.data),
getPartnerNotifications: () => api.get('/partner/notifications').then(res => res.data),
  getBookingOtp: (bookingId: string) => api.get(`/bookings/${bookingId}/collection-otp`).then(res => res.data),
  verifyBookingOtp: (bookingId: string, otp: string) => api.post(`/bookings/${bookingId}/verify-otp`, { otp }).then(res => res.data),
getBookingDetails: (bookingId: string) => api.get(`/bookings?id=${bookingId}`).then(res => {
    // Backend returns array from the list endpoint; extract the single booking
    const data = res.data;
    return Array.isArray(data) ? data[0] ?? null : data;
  }),
  acceptBooking: (bookingId: string) => api.patch(`/partner/bookings/${bookingId}/accept`).then(res => res.data),
  rejectBooking: (bookingId: string, reason?: string) => api.patch(`/partner/bookings/${bookingId}/reject`, { reason }).then(res => res.data),
  updateBookingStatus: (bookingId: string, status: string, note?: string) => api.patch(`/partner/bookings/${bookingId}/status`, { status, note }).then(res => res.data),
  toggleAvailability: (isAvailable: boolean) => api.patch('/partner/availability', { isAvailable }).then(res => res.data),
  getPartnerProfile: () => api.get('/partner/profile').then(res => res.data),
collectCash: (bookingId: string) => api.post(`/partner/bookings/${bookingId}/collect-cash`).then(res => res.data),
  initiateUpiCollection: (bookingId: string) => api.post(`/partner/bookings/${bookingId}/collect-upi`).then(res => res.data),
  checkUpiPaymentStatus: (bookingId: string) => api.get(`/partner/bookings/${bookingId}/upi-status`).then(res => res.data),
getPartnerStats: () => api.get('/partner/stats').then(res => res.data),

  uploadPrescription: (formData: FormData) =>
    api.post('/prescriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  getMyPrescriptions: () => api.get('/prescriptions/my').then(res => res.data),

deletePrescription: (id: string) => api.delete(`/prescriptions/${id}`).then(res => res.data),

  getOrCreateConversation: () => api.get('/chat/conversation').then(res => res.data),
  getChatMessages: (conversationId: string, cursor?: string) =>
    api.get(`/chat/conversation/${conversationId}/messages`, { params: cursor ? { cursor } : {} }).then(res => res.data),
  getChatUnreadCount: () => api.get('/chat/conversation/unread').then(res => res.data),
};
export default api;
