import { useState, useEffect } from 'react';
import { playerService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  HeartOff, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2,
  Users,
  Calendar
} from 'lucide-react';

const ClubFollowing = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadAvailableClubs();
  }, []);

  const loadAvailableClubs = async () => {
    try {
      setLoading(true);
      const response = await playerService.getAvailableClubs();
      setClubs(response.data.clubs);
    } catch (error) {
      setError('Erreur lors du chargement des clubs');
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (clubId, isFollowed) => {
    try {
      setActionLoading(prev => ({ ...prev, [clubId]: true }));
      
      if (isFollowed) {
        await playerService.unfollowClub(clubId);
      } else {
        await playerService.followClub(clubId);
      }
      
      // Mettre à jour l'état local
      setClubs(clubs.map(club => 
        club.id === clubId 
          ? { ...club, is_followed: !isFollowed }
          : club
      ));
      
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'action');
      console.error('Error toggling follow:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [clubId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        <h2 className="text-2xl font-bold text-gray-900">Clubs Disponibles</h2>
        <p className="text-gray-600 mt-2">
          Suivez vos clubs préférés pour rester connecté avec leur communauté
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {clubs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun club disponible
            </h3>
            <p className="text-gray-600 text-center">
              Il n'y a actuellement aucun club disponible à suivre
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card key={club.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {club.is_followed ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Heart className="h-3 w-3 mr-1" />
                          Suivi
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Non suivi
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informations du club */}
                <div className="space-y-2 text-sm text-gray-600">
                  {club.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{club.address}</span>
                    </div>
                  )}
                  {club.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{club.phone_number}</span>
                    </div>
                  )}
                  {club.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{club.email}</span>
                    </div>
                  )}
                  {club.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Créé le {formatDate(club.created_at)}</span>
                    </div>
                  )}
                </div>

                {/* Bouton d'action */}
                <Button
                  onClick={() => handleFollowToggle(club.id, club.is_followed)}
                  disabled={actionLoading[club.id]}
                  variant={club.is_followed ? "outline" : "default"}
                  className="w-full"
                >
                  {actionLoading[club.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : club.is_followed ? (
                    <HeartOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Heart className="h-4 w-4 mr-2" />
                  )}
                  {club.is_followed ? 'Ne plus suivre' : 'Suivre'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubFollowing;

