// padelvar-frontend/src/pages/PlayerDashboard.jsx

import { useState, useEffect } from 'react';
import { videoService, recordingService } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/common/Navbar';
import StatCard from '@/components/player/StatCard';
import ClubFollowing from '@/components/player/ClubFollowing';
import AdvancedRecordingModal from '@/components/player/AdvancedRecordingModal';
import ActiveRecordingBanner from '@/components/player/ActiveRecordingBanner';
import BuyCreditsModal from '@/components/player/BuyCreditsModal';
import VideoEditorModal from '@/components/player/VideoEditorModal';
import CreditSystemDisplay from '@/components/player/CreditSystemDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Video, Clock, BarChart, Plus, QrCode, Loader2, Play, Share2, MoreHorizontal, Calendar, Scissors, Trash2, Coins, Timer } from 'lucide-react';

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
  const [activeRecording, setActiveRecording] = useState(null);

  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [selectedVideoForEditor, setSelectedVideoForEditor] = useState(null);

  useEffect(() => {
    loadDashboardData();
    checkActiveRecording();
  }, [dataVersion]);

  // Vérifier périodiquement s'il y a un enregistrement en cours
  useEffect(() => {
    const interval = setInterval(checkActiveRecording, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

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

  const checkActiveRecording = async () => {
    try {
      const response = await recordingService.getMyActiveRecording();
      setActiveRecording(response.data.active_recording);
    } catch (error) {
      console.error("Erreur lors de la vérification de l'enregistrement actif:", error);
    }
  };

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
    checkActiveRecording(); // Vérifier aussi l'enregistrement actif
  };
  
  const handleCreditsUpdated = async () => {
    await fetchUser();
    handleDataChange();
  };

  const handleRecordingStarted = (recordingSession) => {
    setActiveRecording(recordingSession);
    handleDataChange();
  };

  const handleStopRecording = async (recordingId) => {
    try {
      await recordingService.stopRecording(recordingId);
      setActiveRecording(null);
      handleDataChange();
    } catch (error) {
      console.error("Erreur lors de l'arrêt d'enregistrement:", error);
    }
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

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    
    // Si c'est déjà en minutes (notre nouveau format)
    if (minutes < 200) {
      return `${Math.floor(minutes)}m`;
    }
    
    // Si c'est en secondes (ancien format), convertir
    const convertedMinutes = Math.floor(minutes / 60);
    return `${convertedMinutes}m`;
  };
  const averageDuration = stats.totalVideos > 0 ? stats.totalDuration / stats.totalVideos : 0;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bandeau d'enregistrement actif */}
      {activeRecording && (
        <ActiveRecordingBanner
          recording={activeRecording}
          onStop={handleStopRecording}
        />
      )}

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
            <Button 
              onClick={() => setIsRecordingModalOpen(true)}
              disabled={!!activeRecording} // Désactiver si enregistrement en cours
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeRecording ? "Enregistrement en cours..." : "Nouvel Enregistrement"}
            </Button>
            {/* On attache la fonction au bouton */}
            <Button variant="outline" onClick={handleScanQRCode}><QrCode className="h-4 w-4 mr-2" />Scanner QR Code</Button>
          </CardContent>
        </Card>
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videos">Mes Vidéos</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
            <TabsTrigger value="credits">
              <Coins className="h-4 w-4 mr-2" />
              Système de Crédits
            </TabsTrigger>
          </TabsList>
          <TabsContent value="videos" className="mt-6">
            <MyVideoSection onDataChange={handleDataChange} onEditVideo={openEditorModal} />
          </TabsContent>
          <TabsContent value="clubs" className="mt-6">
            <ClubFollowing onFollowChange={handleDataChange} />
          </TabsContent>
          <TabsContent value="credits" className="mt-6">
            <CreditSystemDisplay onBuyCreditsClick={() => setIsBuyCreditsModalOpen(true)} />
          </TabsContent>
        </Tabs>
      </main>

      <AdvancedRecordingModal 
        isOpen={isRecordingModalOpen} 
        onClose={() => setIsRecordingModalOpen(false)} 
        onRecordingStarted={handleRecordingStarted}
      />
      <BuyCreditsModal isOpen={isBuyCreditsModalOpen} onClose={() => setIsBuyCreditsModalOpen(false)} onCreditsUpdated={handleCreditsUpdated} />
      <VideoEditorModal isOpen={isEditorModalOpen} onClose={() => setIsEditorModalOpen(false)} video={selectedVideoForEditor} />
    </div>
  );
};

export default PlayerDashboard;