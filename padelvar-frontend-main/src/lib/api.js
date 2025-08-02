// padelvar-frontend/src/lib/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
} );

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!isRedirecting && window.location.pathname !== '/login') {
        isRedirecting = true;
        window.location.href = '/login';
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/update-profile', profileData),
  // NOUVELLE FONCTION
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

export const videoService = {
  getMyVideos: () => api.get('/videos/my-videos'),
  startRecording: (data) => api.post('/videos/record', data),
  stopRecording: (data) => api.post('/videos/stop-recording', data),
  unlockVideo: (videoId) => api.post(`/videos/${videoId}/unlock`),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  shareVideo: (videoId, platform) => api.post(`/videos/${videoId}/share`, { platform }),
  buyCredits: (purchaseData) => api.post('/players/credits/buy', purchaseData),
  getCreditPackages: () => api.get('/players/credits/packages'),
  getPaymentMethods: () => api.get('/players/credits/payment-methods'),
  getCreditsHistory: () => api.get('/players/credits/history'),
  scanQrCode: (qrCode) => api.post('/videos/qr-scan', { qr_code: qrCode }),
  getCameraStream: (courtId) => api.get(`/videos/courts/${courtId}/camera-stream`),
  getCourtsForClub: (clubId) => api.get(`/videos/clubs/${clubId}/courts`),
  // NOUVELLES FONCTIONS AMÉLIORÉES
  updateVideo: (videoId, data) => api.put(`/videos/${videoId}`, data),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  getRecordingStatus: (recordingId) => api.get(`/videos/recording/${recordingId}/status`),
  stopRecordingById: (recordingId, data) => api.post(`/videos/recording/${recordingId}/stop`, data),
  getAvailableCourts: () => api.get('/videos/courts/available'),
  downloadVideo: (videoId) => api.get(`/videos/download/${videoId}`, { responseType: 'blob' }),
};

export const recordingService = {
  // Nouvelles API pour l'enregistrement avancé
  startAdvancedRecording: (data) => api.post('/recording/start', data),
  stopRecording: (recordingId) => api.post('/recording/stop', { recording_id: recordingId }),
  forceStopRecording: (recordingId) => api.post(`/recording/force-stop/${recordingId}`),
  getMyActiveRecording: () => api.get('/recording/my-active'),
  getClubActiveRecordings: () => api.get('/recording/club/active'),
  getAvailableCourts: (clubId) => api.get(`/recording/available-courts/${clubId}`),
  cleanupExpiredRecordings: () => api.post('/recording/cleanup-expired'),
};

export const adminService = {
  getAllUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllClubs: () => api.get('/admin/clubs'),
  createClub: (clubData) => api.post('/admin/clubs', clubData),
  updateClub: (clubId, clubData) => api.put(`/admin/clubs/${clubId}`, clubData),
  deleteClub: (clubId) => api.delete(`/admin/clubs/${clubId}`),
  createCourt: (clubId, courtData) => api.post(`/admin/clubs/${clubId}/courts`, courtData),
  getClubCourts: (clubId) => api.get(`/admin/clubs/${clubId}/courts`),
  updateCourt: (courtId, courtData) => api.put(`/admin/courts/${courtId}`, courtData),
  deleteCourt: (courtId) => api.delete(`/admin/courts/${courtId}`),
  getAllVideos: () => api.get('/admin/videos'),
  addCredits: (userId, credits) => api.post(`/admin/users/${userId}/credits`, { credits }),
  
  // ====================================================================
  // CORRECTION APPLIQUÉE ICI
  // On utilise maintenant "api.get" comme pour toutes les autres fonctions.
  // Axios construira l'URL complète vers http://localhost:5000/api/admin/clubs/history/all
  // ====================================================================
  getAllClubsHistory: () => api.get('/admin/clubs/history/all'),
};

export const playerService = {
  getAvailableClubs: () => api.get('/players/clubs/available'),
  followClub: (clubId) => api.post(`/players/clubs/${clubId}/follow`),
  unfollowClub: (clubId) => api.post(`/players/clubs/${clubId}/unfollow`),
  getFollowedClubs: () => api.get('/players/clubs/followed'),
};

export const clubService = {
  getDashboard: () => api.get('/clubs/dashboard'),
  getClubInfo: () => api.get('/clubs/info'),
  getCourts: () => api.get('/clubs/courts'),
  getClubVideos: () => api.get('/clubs/videos'),
  getAllClubs: () => api.get('/clubs/all'),
  getClubHistory: () => api.get('/clubs/history'),
  getFollowers: () => api.get('/clubs/followers'),
  updatePlayer: (playerId, playerData) => api.put(`/clubs/${playerId}`, playerData),
  addCreditsToPlayer: (playerId, credits) => api.post(`/clubs/${playerId}/add-credits`, { credits }),
  updateFollower: (playerId, playerData) => clubService.updatePlayer(playerId, playerData),
  addCreditsToFollower: (playerId, credits) => clubService.addCreditsToPlayer(playerId, credits),
  // NOUVELLE FONCTION
  updateClubProfile: (clubData) => api.put('/clubs/profile', clubData),
  // Fonction pour arrêter un enregistrement depuis le dashboard club
  stopRecording: (courtId) => api.post(`/clubs/courts/${courtId}/stop-recording`),
};

export default api;