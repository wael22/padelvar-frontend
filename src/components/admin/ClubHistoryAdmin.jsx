import { useState, useEffect } from 'react';
import { adminService } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Loader2,
  Heart,
  HeartOff,
  Edit,
  Plus,
  UserPlus,
  UserMinus,
  Calendar,
  User,
  Building,
  Filter,
  Search
} from 'lucide-react';

const ClubHistoryAdmin = () => {
  // Initialiser avec un tableau vide pour éviter les erreurs
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    clubId: '',
    actionType: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // On peut garder cette dépendance, car allHistory sera toujours un tableau
    applyFilters();
  }, [allHistory, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyResponse, clubsResponse] = await Promise.all([
        adminService.getAllClubsHistory(),
        adminService.getAllClubs()
      ]);
      
      // **CORRECTION PRINCIPALE ICI**
      // On vérifie si la réponse contient bien un tableau `history`.
      // Si ce n'est pas le cas, on utilise un tableau vide par défaut.
      const historyData = historyResponse?.data?.history || [];
      const clubsData = clubsResponse?.data?.clubs || [];

      setAllHistory(historyData);
      setClubs(clubsData);

    } catch (error) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', error);
      // En cas d'erreur, s'assurer que les états sont des tableaux vides
      setAllHistory([]);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Cette ligne est maintenant sûre car allHistory est toujours un tableau
    let filtered = [...allHistory];

    if (filters.clubId) {
      filtered = filtered.filter(entry => entry.club_id === parseInt(filters.clubId));
    }

    if (filters.actionType) {
      filtered = filtered.filter(entry => entry.action_type === filters.actionType);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.player_name?.toLowerCase().includes(searchLower) ||
        entry.club_name?.toLowerCase().includes(searchLower) ||
        entry.performed_by_name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredHistory(filtered);
  };

  // ... Le reste du fichier reste identique ...

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'follow_club': return <Heart className="h-4 w-4 text-green-600" />;
      case 'unfollow_club': return <HeartOff className="h-4 w-4 text-red-600" />;
      case 'update_player': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'add_credits': return <Plus className="h-4 w-4 text-yellow-600" />;
      case 'create_player': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'delete_player': return <UserMinus className="h-4 w-4 text-red-600" />;
      default: return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (actionType) => {
    const labels = {
      follow_club: 'Suivi du club',
      unfollow_club: 'Arrêt du suivi',
      update_player: 'Modification joueur',
      add_credits: 'Ajout de crédits',
      create_player: 'Création joueur',
      delete_player: 'Suppression joueur',
    };
    return labels[actionType] || 'Action inconnue';
  };

  const getActionVariant = (actionType) => {
    switch (actionType) {
      case 'follow_club': case 'create_player': return 'default';
      case 'unfollow_club': case 'delete_player': return 'destructive';
      case 'update_player': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatActionDetails = (actionDetails) => {
    if (!actionDetails) return null;
    try {
      const details = JSON.parse(actionDetails);
      if (details.changes) {
        return `Modifications: ${Object.entries(details.changes).map(([field, change]) => `${field}: "${change.old}" → "${change.new}"`).join(', ')}`;
      }
      if (details.credits_added) {
        return `${details.credits_added} crédits ajoutés (${details.old_balance} → ${details.new_balance})`;
      }
      return JSON.stringify(details);
    } catch (e) {
      return actionDetails;
    }
  };

  const clearFilters = () => {
    setFilters({ clubId: '', actionType: '', search: '' });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Historique Global des Clubs</h2>
        <p className="text-gray-600 mt-2">
          Suivi de toutes les actions effectuées sur la plateforme ({filteredHistory.length} résultats).
        </p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filtres</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Club</label>
              <Select value={filters.clubId} onValueChange={(value) => setFilters({...filters, clubId: value})}>
                <SelectTrigger><SelectValue placeholder="Tous les clubs" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les clubs</SelectItem>
                  {clubs.map((club) => <SelectItem key={club.id} value={club.id.toString()}>{club.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type d'action</label>
              <Select value={filters.actionType} onValueChange={(value) => setFilters({...filters, actionType: value})}>
                <SelectTrigger><SelectValue placeholder="Toutes les actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les actions</SelectItem>
                  {Object.entries({follow_club: 'Suivi', unfollow_club: 'Arrêt suivi', update_player: 'Modif. joueur', add_credits: 'Ajout crédits', create_player: 'Création joueur', delete_player: 'Supp. joueur'}).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Nom du joueur, club..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="pl-10" />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">Effacer</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredHistory.length === 0 ? (
        <Card><CardContent className="text-center py-12"><History className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3>Aucun historique trouvé</h3><p className="text-gray-600">Aucune action ne correspond à vos filtres.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getActionIcon(entry.action_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={getActionVariant(entry.action_type)}>{getActionLabel(entry.action_type)}</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700"><Building className="h-3 w-3 mr-1" />{entry.club_name}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{entry.player_name}</span>
                        <span className="text-gray-500">par {entry.performed_by_name}</span>
                      </div>
                      {entry.action_details && <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{formatActionDetails(entry.action_details)}</div>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right text-xs text-gray-500">
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{formatDate(entry.performed_at)}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubHistoryAdmin;
