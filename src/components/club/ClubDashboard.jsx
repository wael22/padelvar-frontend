// padelvar-frontend/src/components/club/ClubDashboard.jsx

import { useState, useEffect } from 'react';
import { clubService } from '../../lib/api';
import Navbar from '../common/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Video,
  Coins,
  Plus,
  Play,
  Calendar,
  Clock,
  User,
  Loader2,
  Gift,
  Square
} from 'lucide-react';

import ClubHistory from './ClubHistory';

const ClubDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    club: null,
    players: [],
    videos: [],
    courts: [],
    stats: { total_videos: 0, total_players: 0, total_credits_offered: 0, total_courts: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clubService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError('Erreur lors du chargement du tableau de bord');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await clubService.addCreditsToPlayer(selectedPlayer.id, creditsToAdd);
      setShowCreditsModal(false);
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout de crédits');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreditsModal = (player) => {
    setSelectedPlayer(player);
    setCreditsToAdd(0);
    setShowCreditsModal(true);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    return `${Math.floor(seconds / 60)}m`;
  };


  // Gestion arrêt club
  const handleClubStopRecording = async (videoId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir forcer l'arrêt de l'enregistrement ?")) return;
    try {
      await clubService.stopRecording(videoId);
      loadDashboard();
    } catch (err) {
      alert("Erreur lors de l'arrêt de l'enregistrement.");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar title="Tableau de bord Club" /><div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Tableau de bord Club" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{dashboardData.club?.name || 'Club'}</h1>
          <p className="text-gray-600 mt-2">Gérez vos joueurs et suivez l'activité de votre club</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Joueurs Inscrits</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.stats?.total_players ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Vidéos Enregistrées</CardTitle><Video className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.stats?.total_videos ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Crédits Offerts par le Club</CardTitle><Gift className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.stats?.total_credits_offered ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Terrains</CardTitle><span className="text-xl">🎾</span></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.stats?.total_courts ?? 0}</div></CardContent></Card>
        </div>
        <Tabs defaultValue="joueurs" className="w-full">
          <TabsList>
            <TabsTrigger value="joueurs">Joueurs</TabsTrigger>
            <TabsTrigger value="terrains">Terrains</TabsTrigger>
            <TabsTrigger value="videos">Vidéos</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="joueurs" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Joueurs du Club</CardTitle><CardDescription>Gérez les informations et crédits de vos joueurs</CardDescription></CardHeader>
              <CardContent>{(dashboardData.players?.length ?? 0) === 0 ? <div className="text-center py-8"><Users className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Aucun joueur inscrit</h3><p className="text-gray-600">Les joueurs apparaîtront ici.</p></div> : <Table><TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Email</TableHead><TableHead>Téléphone</TableHead><TableHead>Crédits</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{dashboardData.players.map((player) => <TableRow key={player.id}><TableCell className="font-medium">{player.name}</TableCell><TableCell>{player.email}</TableCell><TableCell>{player.phone_number || '-'}</TableCell><TableCell><div className="flex items-center space-x-1"><Coins className="h-4 w-4 text-yellow-500" /><span>{player.credits_balance}</span></div></TableCell><TableCell><Button size="sm" variant="outline" onClick={() => openCreditsModal(player)}><Plus className="h-4 w-4 mr-2" />Ajouter Crédits</Button></TableCell></TableRow>)}</TableBody></Table>}</CardContent>
            </Card>
          </TabsContent>
          
          {/* ==================================================================== */}
          {/* CETTE SECTION DOIT ÊTRE PRÉSENTE ET CORRECTE */}
          {/* ==================================================================== */}
          <TabsContent value="terrains" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Terrains du Club</CardTitle>
                <CardDescription>Visualisez les terrains et les flux des caméras associées.</CardDescription>
              </CardHeader>
              <CardContent>
                {(dashboardData.courts?.length ?? 0) === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center"><span className="text-2xl">🎾</span></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun terrain configuré</h3>
                    <p className="text-gray-600">Contactez l'administrateur de la plateforme pour ajouter des terrains.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.courts.map((court) => (
                      <Card key={court.id} className="overflow-hidden flex flex-col">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center">
                            <span>{court.name}</span>
                            {court.status === 'RECORDING' && (
                              <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>QR Code: {court.qr_code?.substring(0, 8)}...</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative mb-4">
                            <img src={court.camera_url} alt={`Caméra ${court.name}`} className="w-full h-full object-cover" />
                          </div>
                          <Button size="sm" variant="outline" className="w-full" onClick={() => window.open(court.camera_url, '_blank')}>
                            <Play className="h-4 w-4 mr-2" />
                            Voir en direct
                          </Button>
                          {/* Bouton Forcer l'arrêt si enregistrement en cours */}
                          {court.status === 'RECORDING' && court.video_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-4"
                              onClick={() => handleClubStopRecording(court.video_id)}
                            >
                              <Square className="h-4 w-4 mr-2" />
                              Forcer l'arrêt
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Vidéos du Club</CardTitle><CardDescription>Toutes les vidéos enregistrées par vos joueurs</CardDescription></CardHeader>
              <CardContent>{(dashboardData.videos?.length ?? 0) === 0 ? <div className="text-center py-8"><Video className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Aucune vidéo enregistrée</h3><p className="text-gray-600">Les vidéos de vos joueurs apparaîtront ici.</p></div> : <Table><TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Joueur</TableHead><TableHead>Durée</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>{dashboardData.videos.map((video) => <TableRow key={video.id}><TableCell><div className="font-medium">{video.title}</div>{video.description && <div className="text-sm text-gray-500 line-clamp-1">{video.description}</div>}</TableCell><TableCell><div className="flex items-center space-x-2"><User className="h-4 w-4 text-gray-400" /><span>{video.player_name || 'N/A'}</span></div></TableCell><TableCell><div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-gray-400" /><span>{formatDuration(video.duration)}</span></div></TableCell><TableCell><div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-gray-400" /><span>{formatDate(video.recorded_at || video.created_at)}</span></div></TableCell></TableRow>)}</TableBody></Table>}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historique" className="mt-6">
            <ClubHistory />
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter des Crédits</DialogTitle><DialogDescription>Ajoutez des crédits à {selectedPlayer?.name}</DialogDescription></DialogHeader>
          <form onSubmit={handleAddCredits} className="space-y-4"><div className="space-y-2"><Label htmlFor="credits-amount">Nombre de crédits à ajouter</Label><Input id="credits-amount" type="number" min="1" value={creditsToAdd} onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)} required /></div><div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-blue-700"><strong>Solde actuel:</strong> {selectedPlayer?.credits_balance} crédits</p><p className="text-sm text-blue-700"><strong>Nouveau solde:</strong> {(selectedPlayer?.credits_balance || 0) + creditsToAdd} crédits</p></div><div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setShowCreditsModal(false)}>Annuler</Button><Button type="submit" disabled={isSubmitting || creditsToAdd <= 0}>{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Ajouter {creditsToAdd || ''} crédit{creditsToAdd > 1 ? 's' : ''}</Button></div></form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubDashboard;