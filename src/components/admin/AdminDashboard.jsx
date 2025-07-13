import { useState, useEffect } from 'react';
import { adminService } from '../../lib/api';
import Navbar from '../common/Navbar';
import UserManagement from './UserManagement';
import ClubManagement from './ClubManagement';
import VideoManagement from './VideoManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Building, 
  Video, 
  TrendingUp,
  Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClubs: 0,
    totalVideos: 0,
    totalCredits: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques en parallèle
      const [usersResponse, clubsResponse, videosResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllClubs(),
        adminService.getAllVideos()
      ]);

      const users = usersResponse.data.users;
      const clubs = clubsResponse.data.clubs;
      const videos = videosResponse.data.videos;
      
      const totalCredits = users.reduce((sum, user) => sum + (user.credits_balance || 0), 0);

      setStats({
        totalUsers: users.length,
        totalClubs: clubs.length,
        totalVideos: videos.length,
        totalCredits
      });
    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Administration" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord administrateur
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les utilisateurs, clubs et vidéos de la plateforme
          </p>
        </div>

        {/* Statistiques */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Joueurs, clubs et admins
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClubs}</div>
                <p className="text-xs text-muted-foreground">
                  Clubs enregistrés
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vidéos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVideos}</div>
                <p className="text-xs text-muted-foreground">
                  Matchs enregistrés
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crédits Distribués</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCredits}</div>
                <p className="text-xs text-muted-foreground">
                  Crédits en circulation
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onglets de gestion */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
            <TabsTrigger value="videos">Vidéos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="clubs" className="mt-6">
            <ClubManagement onStatsUpdate={loadStats} />
          </TabsContent>
          
          <TabsContent value="videos" className="mt-6">
            <VideoManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

