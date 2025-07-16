import axios from 'axios';

// Configuration de base pour l'API
const API_BASE_URL = 'https://padelvar-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Pour inclure les cookies de session
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion si non authentifié
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/update-profile', profileData),
};

// Services pour les vidéos
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
};

// Services pour l'administration
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
  // Nouvelles fonctionnalités pour l'historique
  getClubHistory: (clubId) => api.get(`/admin/clubs/${clubId}/history`),
  getAllClubsHistory: () => api.get('/admin/clubs/history/all'),
};

// Services pour les joueurs
export const playerService = {
  getAvailableClubs: () => api.get('/players/clubs/available'),
  followClub: (clubId) => api.post(`/players/clubs/${clubId}/follow`),
  unfollowClub: (clubId) => api.post(`/players/clubs/${clubId}/unfollow`),
  getFollowedClubs: () => api.get('/players/clubs/followed'),
};

// Services pour les clubs
export const clubService = {
  getDashboard: () => api.get('/clubs/dashboard'),
  getPlayers: () => api.get('/clubs/players'),
  getPlayerVideos: (playerId) => api.get(`/clubs/players/${playerId}/videos`),
  addCreditsToPlayer: (playerId, credits) => api.post(`/clubs/players/${playerId}/add-credits`, { credits }),
  getClubVideos: () => api.get('/clubs/videos'),
  getClubInfo: () => api.get('/clubs/info'),
  updateClubInfo: (clubData) => api.put('/clubs/info', clubData),
  getCourts: () => api.get('/clubs/courts'),
  updateCourt: (courtId, courtData) => api.put(`/clubs/courts/${courtId}`, courtData),
  deleteCourt: (courtId) => api.delete(`/clubs/courts/${courtId}`),
  createPlayer: (playerData) => api.post('/clubs/players', playerData),
  updatePlayer: (playerId, playerData) => api.put(`/clubs/players/${playerId}`, playerData),
  getAllClubs: () => api.get('/clubs/all'),
  getClubCourts: (clubId) => api.get(`/clubs/${clubId}/courts`),
  // Nouvelles fonctionnalités
  getFollowers: () => api.get('/clubs/followers'),
  updateFollower: (playerId, playerData) => api.put(`/clubs/followers/${playerId}/update`, playerData),
  addCreditsToFollower: (playerId, credits) => api.post(`/clubs/followers/${playerId}/add-credits`, { credits }),
  getClubHistory: () => api.get('/clubs/history'),
};

export default api;
