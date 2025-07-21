import { useState, useEffect } from 'react';
// CORRECTION FINALE : J'utilise des chemins absolus depuis la racine du projet (@)
// pour éviter toute confusion avec les chemins relatifs (../)
import { videoService } from '@/lib/api'; 
import Navbar from '@/components/common/Navbar';
import StatCard from '@/components/player/StatCard'; 
import ClubFollowing from '@/components/player/ClubFollowing';
import RecordingModal from '@/components/player/RecordingModal'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Video, Clock, BarChart, Plus, QrCode, Loader2, Play, Share2, MoreHorizontal, Calendar } from 'lucide-react';

// Le reste du fichier est identique et correct.
// ====================================================================
// DÉBUT DU NOUVEAU COMPOSANT INTERNE POUR LA LISTE DES VIDÉOS
// ====================================================================
const MyVideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await videoService.getMyVideos();
      setVideos(response.data.videos || []);
    } catch (err) {
      setError('Erreur lors du chargement des vidéos.');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const VideoCard = ({ video }) => {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    };

    return (
      <Card className="flex flex-col">
        <CardHeader className="p-0 relative">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <Play className="h-12 w-12 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow pt-4">
          <CardTitle className="text-lg mb-2 flex justify-between items-center">
            <span>{video.title || `Match du ${formatDate(video.recorded_at)}`}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Modifier</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(video.recorded_at)}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full mr-2"><Play className="h-4 w-4 mr-2" />Regarder</Button>
          <Button variant="outline" className="w-full"><Share2 className="h-4 w-4 mr-2" />Partager</Button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  return (
    <div>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Aucune vidéo pour le moment</h3>
          <p className="text-gray-500 mt-2">Commencez par enregistrer votre premier match !</p>
        </div>
      )}
    </div>
  );
};
// ====================================================================
// FIN DU NOUVEAU COMPOSANT INTERNE
// ====================================================================


const PlayerDashboard = () => {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalDuration: 0,
    averageDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [dataVersion]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await videoService.getMyVideos();
      const videos = response.data.videos || [];
      
      const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
      const averageDuration = videos.length > 0 ? totalDuration / videos.length : 0;

      setStats({
        totalVideos: videos.length,
        totalDuration: totalDuration,
        averageDuration: averageDuration,
      });
    } catch (error) {
      console.error("Erreur lors du chargement du tableau de bord:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Bonjour, gérez vos enregistrements de matchs de padel !
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={Video} title="Total Vidéos" value={stats.totalVideos} />
          <StatCard icon={Clock} title="Temps Total" value={formatDuration(stats.totalDuration)} />
          <StatCard icon={BarChart} title="Durée Moyenne" value={formatDuration(stats.averageDuration)} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Enregistrement
            </Button>
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Scanner QR Code
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="videos">Mes Vidéos</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
          </TabsList>
          <TabsContent value="videos" className="mt-6">
            <MyVideoSection key={dataVersion} />
          </TabsContent>
          <TabsContent value="clubs" className="mt-6">
            <ClubFollowing onFollowChange={handleDataChange} />
          </TabsContent>
        </Tabs>
      </main>

      <RecordingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVideoCreated={handleDataChange}
      />
    </div>
  );
};

export default PlayerDashboard;
