import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // IMPORT NÉCESSAIRE
import { useAuth } from '../hooks/useAuth';
import { authService, clubService } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const ProfilePage = () => {
  const { user, loading: authLoading, fetchUser, setUser } = useAuth();
  const navigate = useNavigate(); // Initialisation du hook de navigation
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'CLUB') {
        setFormData({
          name: user.club?.name || '',
          address: user.club?.address || '',
          phone_number: user.club?.phone_number || '',
        });
      } else {
        setFormData({
          name: user.name || '',
          phone_number: user.phone_number || '',
        });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ====================================================================
  // LOGIQUE DE SOUMISSION CORRIGÉE
  // ====================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Étape 1: Mettre à jour le profil
      let updateResponse;
      if (user.role === 'CLUB') {
        updateResponse = await clubService.updateClubProfile(formData);
      } else {
        updateResponse = await authService.updateProfile(formData);
      }
      
      // Si la mise à jour réussit et retourne des données utilisateur mises à jour
      if (updateResponse.data && updateResponse.data.user) {
        // Mettre à jour le contexte d'authentification avec les nouvelles données
        setUser(updateResponse.data.user);
      }
      
      // Afficher le succès
      setSuccess('Profil mis à jour avec succès !');

      // Étape 2: Rafraîchir les données de l'utilisateur pour s'assurer de la synchronisation
      try {
        await fetchUser();
      } catch (fetchError) {
        console.warn("La mise à jour du profil a réussi, mais le rafraîchissement des données a échoué.", fetchError);
        // Ne pas afficher d'erreur à l'utilisateur car la mise à jour principale a réussi
      }

    } catch (err) {
      // Cette erreur ne concerne que la mise à jour du profil.
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              {success && <Alert variant="default" className="bg-green-100 text-green-800"><AlertDescription>{success}</AlertDescription></Alert>}
              
              <div className="space-y-2">
                <Label htmlFor="name">Nom {user.role === 'CLUB' ? 'du Club' : 'Complet'}</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-gray-500">L'email ne peut pas être modifié.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Numéro de téléphone</Label>
                <Input id="phone_number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />
              </div>
              
              {user.role === 'CLUB' && (
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse du Club</Label>
                  <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
                </div>
              )}

              {/* ==================================================================== */}
              {/* BOUTONS D'ACTION CORRIGÉS */}
              {/* ==================================================================== */}
              <div className="flex items-center space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sauvegarder les modifications
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Retour
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;