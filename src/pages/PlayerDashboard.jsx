import { useState, useEffect } from 'react';
// CORRECTION FINALE : On revient aux chemins relatifs (../) qui sont plus fiables
import { videoService } from '../lib/api';
import Navbar from './common/Navbar';
import StatCard from './player/StatCard';
import VideoList from './player/VideoList';
import ClubFollowing from './player/ClubFollowing';
import RecordingModal from './player/RecordingModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Play, Clock, BarChart, Plus, QrCode, Loader2 } from 'lucide-react';

const PlayerDashboard = () => {
  const [stats, setStats] = useState({
    totalVideos: 0,
    unlockedVideos: 0,
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
      
      const unlockedCount = videos.filter(v => v.is_unlocked).length;
      const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
      const averageDuration = videos.length > 0 ? totalDuration / videos.length : 0;

      setStats({
        totalVideos: videos.length,
        unlockedVideos: unlockedCount,
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Video} title="Total Vidéos" value={stats.totalVideos} />
          <StatCard icon={Play} title="Vidéos Déverrouillées" value={stats.unlockedVideos} />
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
            <VideoList key={dataVersion} />
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