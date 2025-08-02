import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PlayerDashboard from './components/player/PlayerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ClubDashboard from './components/club/ClubDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Routes protégées */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="player">
                  <PlayerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/club" 
              element={
                <ProtectedRoute requiredRole="club">
                  <ClubDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Pages profil et paramètres protégées */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Route 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

