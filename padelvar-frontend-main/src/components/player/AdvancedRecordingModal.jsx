import { useState, useEffect } from 'react';
import { recordingService, playerService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Clock, 
  QrCode, 
  Loader2,
  Camera,
  AlertCircle,
  CheckCircle,
  Timer,
  Infinity,
  User
} from 'lucide-react';

const AdvancedRecordingModal = ({ isOpen, onClose, onRecordingStarted }) => {
  const [step, setStep] = useState('setup');
  const [recordingData, setRecordingData] = useState({
    title: '',
    description: '',
    club_id: '',
    court_id: '',
    duration: 90,
    qr_code: ''
  });
  
  const [followedClubs, setFollowedClubs] = useState([]);
  const [availableCourts, setAvailableCourts] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Options de durée
  const durationOptions = [
    { value: 60, label: '60 minutes', icon: <Clock className="h-4 w-4" />, description: 'Match court' },
    { value: 90, label: '90 minutes', icon: <Clock className="h-4 w-4" />, description: 'Durée standard' },
    { value: 120, label: '120 minutes', icon: <Clock className="h-4 w-4" />, description: 'Match long' },
    { value: 'MAX', label: 'MAX (200 min)', icon: <Infinity className="h-4 w-4" />, description: 'Durée maximale' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadFollowedClubs();
      // Réinitialiser le formulaire
      setRecordingData({
        title: '',
        description: '',
        club_id: '',
        court_id: '',
        duration: 90,
        qr_code: ''
      });
      setStep('setup');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (recordingData.club_id) {
      loadAvailableCourts(recordingData.club_id);
    } else {
      setAvailableCourts([]);
      setRecordingData(prev => ({ ...prev, court_id: '' }));
    }
  }, [recordingData.club_id]);

  const loadFollowedClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await playerService.getFollowedClubs();
      setFollowedClubs(response.data.clubs || []);
    } catch (error) {
      console.error('Error loading followed clubs:', error);
      setError('Erreur lors du chargement de vos clubs suivis');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadAvailableCourts = async (clubId) => {
    try {
      setLoadingCourts(true);
      setError('');
      
      // Utiliser le recordingService au lieu de fetch direct
      const response = await recordingService.getAvailableCourts(clubId);
      setAvailableCourts(response.data.courts || []);
      
      if (!response.data.courts || response.data.courts.length === 0) {
        setError('Aucun terrain trouvé pour ce club');
      }
    } catch (error) {
      console.error('Error loading courts:', error);
      setError('Erreur lors du chargement des terrains');
      setAvailableCourts([]);
    } finally {
      setLoadingCourts(false);
    }
  };

  const handleStartRecording = async () => {
    if (!recordingData.club_id || !recordingData.court_id) {
      setError('Veuillez sélectionner un club et un terrain');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Utiliser le recordingService au lieu de fetch direct
      const response = await recordingService.startAdvancedRecording({
        court_id: recordingData.court_id,
        duration: recordingData.duration,
        title: recordingData.title || `Match du ${new Date().toLocaleDateString('fr-FR')}`,
        description: recordingData.description
      });

      // Notifier le parent du succès
      onRecordingStarted(response.data.recording_session);
      handleClose();
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors du démarrage de l\'enregistrement';
      setError(errorMessage);
      console.error('Error starting recording:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('setup');
    setRecordingData({
      title: '',
      description: '',
      club_id: '',
      court_id: '',
      duration: 90,
      qr_code: ''
    });
    setError('');
    setFollowedClubs([]);
    setAvailableCourts([]);
    onClose();
  };

  const selectedDuration = durationOptions.find(opt => opt.value === recordingData.duration);

  const CourtCard = ({ court }) => (
    <div 
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        recordingData.court_id === court.id.toString() 
          ? 'border-blue-500 bg-blue-50' 
          : court.available 
            ? 'border-gray-200 hover:border-gray-300' 
            : 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
      }`}
      onClick={() => {
        if (court.available) {
          setRecordingData(prev => ({ ...prev, court_id: court.id.toString() }));
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{court.name}</p>
          <p className="text-xs text-gray-500">Terrain #{court.id}</p>
        </div>
        <div className="flex items-center space-x-2">
          {court.available ? (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Disponible</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Occupé</span>
            </Badge>
          )}
        </div>
      </div>
      
      {!court.available && court.recording_info && (
        <div className="mt-2 p-2 bg-red-50 rounded border text-xs">
          <div className="flex items-center space-x-1 text-red-700">
            <User className="h-3 w-3" />
            <span className="font-medium">{court.recording_info.player_name}</span>
          </div>
          <div className="flex items-center space-x-1 text-red-600 mt-1">
            <Clock className="h-3 w-3" />
            <span>Reste: {court.recording_info.remaining_minutes} min</span>
          </div>
        </div>
      )}
      
      {!court.available && !court.recording_info && (
        <div className="mt-2 text-xs text-red-600">
          <p>⚠️ Terrain temporairement indisponible</p>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel Enregistrement avec Durée</DialogTitle>
          <DialogDescription>
            Configurez votre enregistrement de match avec une durée personnalisée
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du match</Label>
              <Input 
                id="title" 
                placeholder="Ex: Match contre équipe X" 
                value={recordingData.title} 
                onChange={(e) => setRecordingData(prev => ({ ...prev, title: e.target.value }))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Notes sur le match..." 
                value={recordingData.description} 
                onChange={(e) => setRecordingData(prev => ({ ...prev, description: e.target.value }))} 
                rows={2} 
              />
            </div>
          </div>

          {/* Sélection de durée */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span>Durée d'enregistrement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {durationOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      recordingData.duration === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRecordingData(prev => ({ ...prev, duration: option.value }))}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                ))}
              </div>
              
              {selectedDuration && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <strong>Durée sélectionnée:</strong> {selectedDuration.label}
                  {recordingData.duration === 'MAX' && (
                    <span className="text-gray-600"> (arrêt automatique après 200 minutes)</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sélection du club */}
          <div className="space-y-2">
            <Label htmlFor="club">Club *</Label>
            <Select 
              value={recordingData.club_id} 
              onValueChange={(value) => setRecordingData(prev => ({ ...prev, club_id: value }))}
              disabled={loadingClubs}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClubs ? "Chargement..." : "Sélectionnez un club"} />
              </SelectTrigger>
              <SelectContent>
                {followedClubs.map((club) => (
                  <SelectItem key={club.id} value={club.id.toString()}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection du terrain */}
          <div className="space-y-2">
            <Label>Terrain disponible *</Label>
            {!recordingData.club_id ? (
              <p className="text-sm text-gray-500">Sélectionnez d'abord un club</p>
            ) : loadingCourts ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement des terrains...</span>
              </div>
            ) : availableCourts.length === 0 ? (
              <p className="text-sm text-red-600">Aucun terrain disponible</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableCourts.map((court) => (
                  <CourtCard key={court.id} court={court} />
                ))}
              </div>
            )}
          </div>

          {/* QR Code optionnel */}
          <div className="space-y-2">
            <Label>QR Code du terrain (optionnel)</Label>
            <div className="flex space-x-2">
              <Input 
                placeholder="Code du terrain" 
                value={recordingData.qr_code} 
                onChange={(e) => setRecordingData(prev => ({ ...prev, qr_code: e.target.value }))} 
              />
              <Button type="button" variant="outline" size="icon">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleStartRecording} 
              disabled={
                isLoading || 
                !recordingData.club_id || 
                !recordingData.court_id ||
                availableCourts.find(c => c.id.toString() === recordingData.court_id)?.available === false
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Démarrer l'enregistrement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedRecordingModal;
