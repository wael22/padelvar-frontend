import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { videoService } from '../../lib/api';
import Navbar from '../common/Navbar';
import VideoCard from './VideoCard';
import RecordingModal from './RecordingModal';
import BuyCreditsModal from './BuyCreditsModal';
import ProfileModal from './ProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Play, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Plus,
  QrCode,
  Loader2,
  Coins,
  User,
  Settings
} from 'lucide-react';

const PlayerDashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await videoService.getMyVideos();
      setVideos(response.data.videos);
    } catch (error) {
      setError('Erreur lors du chargement des vidéos');
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUnlocked = (videoId) => {
    setVideos(videos.map(video => 
      video.id === videoId 
        ? { ...video, is_unlocked: true }
        : video
    ));
  };

  // Statistiques
  const totalVideos = videos.length;
  const unlockedVideos = videos.filter(v => v.is_unlocked).length;
  const totalDuration = videos.reduce((sum, video) => sum + (video.duration || 0), 0);
  const averageDuration = totalVideos > 0 ? Math.round(totalDuration / totalVideos / 60) : 0;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Tableau de bord" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de bienvenue */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.name} !
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos enregistrements de matchs de padel
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vidéos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVideos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vidéos Déverrouillées</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unlockedVideos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageDuration}m</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Commencez un nouvel enregistrement ou scannez un QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowRecordingModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nouvel Enregistrement
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowRecordingModal(true)}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Scanner QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des vidéos */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Toutes les vidéos</TabsTrigger>
            <TabsTrigger value="unlocked">Déverrouillées</TabsTrigger>
            <TabsTrigger value="locked">Verrouillées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : videos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Video className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune vidéo enregistrée
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Commencez votre premier enregistrement pour voir vos matchs ici
                  </p>
                  <Button onClick={() => setShowRecordingModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Premier Enregistrement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    onVideoUnlocked={handleVideoUnlocked}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unlocked" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.filter(v => v.is_unlocked).map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  onVideoUnlocked={handleVideoUnlocked}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="locked" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.filter(v => !v.is_unlocked).map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  onVideoUnlocked={handleVideoUnlocked}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal d'enregistrement */}
      <RecordingModal 
        isOpen={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        onVideoCreated={loadVideos}
      />
    </div>
  );
};

export default PlayerDashboard;

