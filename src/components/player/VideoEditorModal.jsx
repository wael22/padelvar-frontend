import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Scissors,
  Download,
  Loader2,
  Clock,
  Video as VideoIcon
} from 'lucide-react';

const VideoEditorModal = ({ isOpen, onClose, video }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialiser les temps quand la vidéo change
  useEffect(() => {
    if (video && video.duration) {
      setDuration(video.duration);
      setEndTime(video.duration);
      setStartTime(0);
      setCurrentTime(0);
    }
  }, [video]);

  // Mettre à jour le temps actuel pendant la lecture
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setEndTime(videoElement.duration);
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.currentTime = time;
    setCurrentTime(time);
  };

  const handleSetStartTime = () => {
    setStartTime(currentTime);
    if (currentTime >= endTime) {
      setEndTime(Math.min(currentTime + 30, duration)); // Ajouter 30 secondes par défaut
    }
  };

  const handleSetEndTime = () => {
    setEndTime(currentTime);
    if (currentTime <= startTime) {
      setStartTime(Math.max(currentTime - 30, 0)); // Retirer 30 secondes par défaut
    }
  };

  const handleDownloadSegment = async () => {
    if (startTime >= endTime) {
      setError('Le temps de début doit être inférieur au temps de fin');
      return;
    }

    if (endTime - startTime < 1) {
      setError('Le segment doit durer au moins 1 seconde');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulation du découpage et téléchargement
      // Dans une vraie implémentation, on ferait appel à un service de découpage vidéo
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation du traitement
      
      // Créer un lien de téléchargement simulé
      const segmentDuration = endTime - startTime;
      const filename = `${video.title || 'segment'}_${formatTime(startTime)}-${formatTime(endTime)}.mp4`;
      
      // Simulation du téléchargement
      const blob = new Blob(['Contenu vidéo simulé'], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess(`Segment téléchargé: ${filename} (${formatTime(segmentDuration)})`);
      
    } catch (error) {
      setError('Erreur lors du découpage de la vidéo');
      console.error('Error cutting video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    setError('');
    setSuccess('');
    onClose();
  };

  const getSegmentDuration = () => {
    return endTime - startTime;
  };

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Scissors className="h-5 w-5" />
            <span>Découper la Vidéo</span>
          </DialogTitle>
          <DialogDescription>
            Sélectionnez la partie de la vidéo que vous souhaitez télécharger
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Download className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Lecteur vidéo */}
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={video.file_url}
                className="w-full h-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>

            {/* Contrôles de lecture */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSeek(Math.max(currentTime - 10, 0))}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSeek(Math.min(currentTime + 10, duration))}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={([value]) => handleSeek(value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Sélection du segment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sélection du Segment</CardTitle>
              <CardDescription>
                Définissez le début et la fin de votre extrait
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Temps de début */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Début du segment</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetStartTime}
                  >
                    Définir ici ({formatTime(currentTime)})
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[startTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={([value]) => setStartTime(Math.min(value, endTime - 1))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-16">
                    {formatTime(startTime)}
                  </span>
                </div>
              </div>

              {/* Temps de fin */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Fin du segment</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetEndTime}
                  >
                    Définir ici ({formatTime(currentTime)})
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[endTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={([value]) => setEndTime(Math.max(value, startTime + 1))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-16">
                    {formatTime(endTime)}
                  </span>
                </div>
              </div>

              {/* Aperçu du segment */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Durée du segment:</span>
                  </div>
                  <span className="font-semibold text-blue-800">
                    {formatTime(getSegmentDuration())}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-blue-600">
                    De {formatTime(startTime)} à {formatTime(endTime)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <VideoIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">
                      {Math.round((getSegmentDuration() / duration) * 100)}% de la vidéo
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handleDownloadSegment} 
              disabled={isLoading || startTime >= endTime || getSegmentDuration() < 1}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Télécharger le Segment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoEditorModal;

