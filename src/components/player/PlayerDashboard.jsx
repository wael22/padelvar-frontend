// padelvar-frontend/src/pages/PlayerDashboard.jsx

import { useState, useEffect } from 'react';
import { videoService } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/common/Navbar';
import StatCard from '@/components/player/StatCard';
import ClubFollowing from '@/components/player/ClubFollowing';
import RecordingModal from '@/components/player/RecordingModal';
import BuyCreditsModal from '@/components/player/BuyCreditsModal';
import VideoEditorModal from '@/components/player/VideoEditorModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Video, Clock, BarChart, Plus, QrCode, Loader2, Play, Share2, MoreHorizontal, Calendar, Scissors, Trash2 } from 'lucide-react';

// ====================================================================
// COMPOSANT VIDÉO (CORRIGÉ POUR L'AFFICHAGE DES BOUTONS)
// ====================================================================
const MyVideoSection = ({ onDataChange, onEditVideo }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await videoService.getMyVideos();
      setVideos(response.data.videos || []);
    } catch (err) {
      setError('Erreur lors du chargement des vidéos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      try {
        await videoService.deleteVideo(videoId);
        await loadVideos();
        onDataChange();
      } catch (err) {
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const VideoCard = ({ video }) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
      <Card className="flex flex-col">
        <CardHeader className="p-0 relative">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <Play className="h-12 w-12 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow pt-4">
          <CardTitle className="text-lg mb-2 flex justify-between items-center">
            <span>{video.title || `Match`}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditVideo(video)}><Scissors className="mr-2 h-4 w-4" /><span>Découper / Éditer</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(video.id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /><span>Supprimer</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(video.recorded_at)}
          </div>
        </CardContent>
        {/* === CORRECTION D'AFFICHAGE ICI === */}
        <CardFooter className="flex space-x-2">
          <Button className="flex-1"><Play className="h-4 w-4 mr-2" />Regarder</Button>
          <Button variant="outline" className="flex-1"><Share2 className="h-4 w-4 mr-2" />Partager</Button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => <VideoCard key={video.id} video={video} />)}
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
// COMPOSANT PRINCIPAL DU TABLEAU DE BORD
// ====================================================================
const PlayerDashboard = () => {
  const { fetchUser } = useAuth();
  const [stats, setStats] = useState({ totalVideos: 0, totalDuration: 0 });
  const [loading, setLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [selectedVideoForEditor, setSelectedVideoForEditor] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [dataVersion]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await videoService.getMyVideos();
      const videos = response.data.videos || [];
      const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
      setStats({ totalVideos: videos.length, totalDuration });
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = () => setDataVersion(prev => prev + 1);
  const handleCreditsUpdated = async () => {
    await fetchUser();
    handleDataChange();
  };

  const openEditorModal = (video) => {
    setSelectedVideoForEditor(video);
    setIsEditorModalOpen(true);
  };
  
  // === FONCTIONNALITÉ SCANNER QR CODE AJOUTÉE ICI ===
  const handleScanQRCode = () => {
    // Dans une application réelle, ceci ouvrirait la caméra du téléphone.
    // Ici, nous simulons la réception d'un QR code.
    const fakeQRCode = `qr_code_${Math.random().toString(36).substring(2, 11)}`;
    alert(`Simulation de scan :\n\nQR Code détecté : ${fakeQRCode}\n\nL'enregistrement pourrait maintenant commencer sur le terrain associé.`);
    // On pourrait ensuite ouvrir le modal d'enregistrement avec le QR code pré-rempli.
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };
  const averageDuration = stats.totalVideos > 0 ? stats.totalDuration / stats.totalVideos : 0;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onBuyCreditsClick={() => setIsBuyCreditsModalOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Bonjour, gérez vos enregistrements !</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={Video} title="Total Vidéos" value={stats.totalVideos} />
          <StatCard icon={Clock} title="Temps Total Enregistré" value={formatDuration(stats.totalDuration)} />
          <StatCard icon={BarChart} title="Durée Moyenne" value={formatDuration(averageDuration)} />
        </div>
        <Card className="mb-8">
          <CardHeader><CardTitle>Actions Rapides</CardTitle></CardHeader>
          <CardContent className="flex space-x-4">
            <Button onClick={() => setIsRecordingModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Nouvel Enregistrement</Button>
            {/* On attache la fonction au bouton */}
            <Button variant="outline" onClick={handleScanQRCode}><QrCode className="h-4 w-4 mr-2" />Scanner QR Code</Button>
          </CardContent>
        </Card>
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="videos">Mes Vidéos</TabsTrigger><TabsTrigger value="clubs">Clubs</TabsTrigger></TabsList>
          <TabsContent value="videos" className="mt-6">
            <MyVideoSection onDataChange={handleDataChange} onEditVideo={openEditorModal} />
          </TabsContent>
          <TabsContent value="clubs" className="mt-6">
            <ClubFollowing onFollowChange={handleDataChange} />
          </TabsContent>
        </Tabs>
      </main>

      <RecordingModal isOpen={isRecordingModalOpen} onClose={() => setIsRecordingModalOpen(false)} onVideoCreated={handleDataChange} />
      <BuyCreditsModal isOpen={isBuyCreditsModalOpen} onClose={() => setIsBuyCreditsModalOpen(false)} onCreditsUpdated={handleCreditsUpdated} />
      <VideoEditorModal isOpen={isEditorModalOpen} onClose={() => setIsEditorModalOpen(false)} video={selectedVideoForEditor} />
    </div>
  );
};

export default PlayerDashboard;