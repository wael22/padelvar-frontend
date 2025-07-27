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
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    clubId: 'all',
    actionType: 'all',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allHistory, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyResponse, clubsResponse] = await Promise.all([
        adminService.getAllClubsHistory(),
        adminService.getAllClubs()
      ]);
      
      console.log('History data:', historyResponse.data); // Debug
      console.log('Clubs data:', clubsResponse.data); // Debug
      
      setAllHistory(historyResponse.data.history || []);
      setClubs(clubsResponse.data.clubs || []);
    } catch (error) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allHistory];
    
    console.log('Applying filters:', filters); // Debug
    console.log('Total history entries:', filtered.length); // Debug

    // Filtre par club - CORRECTION: utiliser club_id au lieu de club_id
    if (filters.clubId && filters.clubId !== 'all') {
      const clubIdToFilter = parseInt(filters.clubId, 10);
      console.log('Filtering by club ID:', clubIdToFilter); // Debug
      
      filtered = filtered.filter(entry => {
        console.log('Entry club_id:', entry.club_id, 'Type:', typeof entry.club_id); // Debug
        return entry.club_id === clubIdToFilter;
      });
      
      console.log('After club filter:', filtered.length); // Debug
    }

    // Filtre par type d'action
    if (filters.actionType && filters.actionType !== 'all') {
      console.log('Filtering by action type:', filters.actionType); // Debug
      
      filtered = filtered.filter(entry => {
        console.log('Entry action_type:', entry.action_type); // Debug
        return entry.action_type === filters.actionType;
      });
      
      console.log('After action filter:', filtered.length); // Debug
    }

    // Filtre par recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      console.log('Filtering by search:', searchLower); // Debug
      
      filtered = filtered.filter(entry => 
        (entry.player_name && entry.player_name.toLowerCase().includes(searchLower)) ||
        (entry.club_name && entry.club_name.toLowerCase().includes(searchLower)) ||
        (entry.performed_by_name && entry.performed_by_name.toLowerCase().includes(searchLower))
      );
      
      console.log('After search filter:', filtered.length); // Debug
    }

    console.log('Final filtered results:', filtered.length); // Debug
    setFilteredHistory(filtered);
  };

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
      case 'follow_club': 
      case 'create_player': 
        return 'default';
      case 'unfollow_club': 
      case 'delete_player': 
        return 'destructive';
      case 'update_player': 
        return 'secondary';
      case 'add_credits':
        return 'outline';
      default: 
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatActionDetails = (actionDetails) => {
    if (!actionDetails) return null;
    try {
      const details = JSON.parse(actionDetails);
      if (details.changes) {
        return `Modifications: ${Object.entries(details.changes).map(([field, change]) => 
          `${field}: "${change.old}" → "${change.new}"`).join(', ')}`;
      }
      if (details.credits_added) {
        return `${details.credits_added} crédits ajoutés (${details.old_balance} → ${details.new_balance})`;
      }
      if (details.club_name) {
        return `Club: ${details.club_name}`;
      }
      return JSON.stringify(details);
    } catch (e) {
      return actionDetails;
    }
  };

  const clearFilters = () => {
    setFilters({ clubId: 'all', actionType: 'all', search: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Historique Global des Clubs</h2>
        <p className="text-gray-600 mt-2">
          Suivi de toutes les actions effectuées sur la plateforme ({filteredHistory.length} résultats).
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Club</label>
              <Select 
                value={filters.clubId} 
                onValueChange={(value) => {
                  console.log('Club filter changed to:', value); // Debug
                  setFilters({...filters, clubId: value});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les clubs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clubs</SelectItem>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id.toString()}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Type d'action</label>
              <Select 
                value={filters.actionType} 
                onValueChange={(value) => {
                  console.log('Action type filter changed to:', value); // Debug
                  setFilters({...filters, actionType: value});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="follow_club">Suivi du club</SelectItem>
                  <SelectItem value="unfollow_club">Arrêt du suivi</SelectItem>
                  <SelectItem value="update_player">Modification du joueur</SelectItem>
                  <SelectItem value="add_credits">Ajout de crédits</SelectItem>
                  <SelectItem value="create_player">Création du joueur</SelectItem>
                  <SelectItem value="delete_player">Suppression du joueur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Nom du joueur, club..." 
                  value={filters.search} 
                  onChange={(e) => setFilters({...filters, search: e.target.value})} 
                  className="pl-10" 
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Effacer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun historique trouvé</h3>
            <p className="text-gray-600">Aucune action ne correspond à vos filtres.</p>
            {allHistory.length > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Voir tout l'historique
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={getActionVariant(entry.action_type)}>
                        {getActionLabel(entry.action_type)}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Building className="h-3 w-3 mr-1" />
                        {entry.club_name}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{entry.player_name}</span>
                        <span className="text-gray-500">par {entry.performed_by_name}</span>
                      </div>
                      
                      {entry.action_details && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {formatActionDetails(entry.action_details)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(entry.performed_at)}</span>
                    </div>
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