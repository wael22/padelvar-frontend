import { useState, useEffect } from 'react';
import { adminService } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    clubId: '',
    actionType: '',
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
      
      setAllHistory(historyResponse.data.history);
      setClubs(clubsResponse.data.clubs);
    } catch (error) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allHistory];

    // Filtre par club
    if (filters.clubId) {
      filtered = filtered.filter(entry => entry.club_id === parseInt(filters.clubId));
    }

    // Filtre par type d'action
    if (filters.actionType) {
      filtered = filtered.filter(entry => entry.action_type === filters.actionType);
    }

    // Filtre par recherche
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

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'follow_club':
        return <Heart className="h-4 w-4 text-green-600" />;
      case 'unfollow_club':
        return <HeartOff className="h-4 w-4 text-red-600" />;
      case 'update_player':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'add_credits':
        return <Plus className="h-4 w-4 text-yellow-600" />;
      case 'create_player':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'delete_player':
        return <UserMinus className="h-4 w-4 text-red-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case 'follow_club':
        return 'Suivi du club';
      case 'unfollow_club':
        return 'Arrêt du suivi';
      case 'update_player':
        return 'Modification du joueur';
      case 'add_credits':
        return 'Ajout de crédits';
      case 'create_player':
        return 'Création du joueur';
      case 'delete_player':
        return 'Suppression du joueur';
      default:
        return 'Action inconnue';
    }
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
        const changes = Object.entries(details.changes).map(([field, change]) => {
          return `${field}: "${change.old}" → "${change.new}"`;
        }).join(', ');
        return `Modifications: ${changes}`;
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
    setFilters({
      clubId: '',
      actionType: '',
      search: ''
    });
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
        <h2 className="text-2xl font-bold text-gray-900">Historique de Tous les Clubs</h2>
        <p className="text-gray-600 mt-2">
          Toutes les actions effectuées dans tous les clubs ({filteredHistory.length} entrées)
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtres */}
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
              <Select value={filters.clubId} onValueChange={(value) => setFilters({...filters, clubId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les clubs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les clubs</SelectItem>
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
              <Select value={filters.actionType} onValueChange={(value) => setFilters({...filters, actionType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les actions</SelectItem>
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
                Effacer les filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun historique trouvé
            </h3>
            <p className="text-gray-600 text-center">
              Aucune action ne correspond aux filtres sélectionnés
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
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
                      <span className="text-sm text-gray-500">
                        {formatDate(entry.performed_at)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{entry.player_name}</span>
                        <span className="text-gray-500">
                          par {entry.performed_by_name}
                        </span>
                      </div>
                      
                      {entry.action_details && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {formatActionDetails(entry.action_details)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(entry.performed_at).toLocaleDateString('fr-FR')}</span>
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

