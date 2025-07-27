import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
};

export const videoService = {
  getMyVideos: () => api.get('/videos/my-videos'),
  startRecording: (data) => api.post('/videos/record', data),
  stopRecording: (data) => api.post('/videos/stop-recording', data),
  unlockVideo: (videoId) => api.post(`/videos/${videoId}/unlock`),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  shareVideo: (videoId, platform) => api.post(`/videos/${videoId}/share`, { platform }),
  buyCredits: (credits, paymentMethod) => api.post('/videos/buy-credits', { credits, payment_method: paymentMethod }),
  scanQrCode: (qrCode) => api.post('/videos/qr-scan', { qr_code: qrCode }),
  getCameraStream: (courtId) => api.get(`/videos/courts/${courtId}/camera-stream`),
  
  // ====================================================================
  // NOUVELLE LIGNE AJOUTÉE ICI
  // ====================================================================
  getCourtsForClub: (clubId) => api.get(`/videos/clubs/${clubId}/courts`),
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
  getAllClubsHistory: async () => {
    try {
      const response = await fetch('/api/admin/clubs/history/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour les sessions
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response for history:', data); // Debug
      return { data };
      
    } catch (error) {
      console.error('Error fetching clubs history:', error);
      throw error;
    }
  },
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
};

export default api;
