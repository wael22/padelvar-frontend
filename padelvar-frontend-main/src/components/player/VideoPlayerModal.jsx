import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Download,
  X
} from 'lucide-react';

const VideoPlayerModal = ({ video, isOpen, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [isOpen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const seekTime = (e.target.value / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadVideo = () => {
    // Utilisation de Bunny CDN pour télécharger la vidéo
    let downloadUrl = '';
    
    if (video.file_url?.startsWith('http')) {
      downloadUrl = video.file_url;
    } else {
      // Format: https://storage.bunnycdn.com/padelvar/[filename]
      const bunnyStorage = 'https://storage.bunnycdn.com/padelvar/';
      const filename = video.file_url ? video.file_url.split('/').pop() : `video_${video.id}.mp4`;
      downloadUrl = `${bunnyStorage}${filename}`;
    }
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${video.title || 'video'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!video || !isOpen) return null;

  // Construction de l'URL de la vidéo en utilisant Bunny CDN
  let videoUrl = '';
  if (video.file_url) {
    if (video.file_url.startsWith('http')) {
      // URL absolue externe (déjà complète)
      videoUrl = video.file_url;
    } else {
      // Utilisation de Bunny CDN pour servir les vidéos
      // Format: https://storage.bunnycdn.com/padelvar/[filename]
      const bunnyStorage = 'https://storage.bunnycdn.com/padelvar/';
      
      // Extraire le nom du fichier de file_url
      const filename = video.file_url.split('/').pop();
      
      if (filename) {
        videoUrl = `${bunnyStorage}${filename}`;
      } else {
        // Fallback: utiliser l'ID de la vidéo comme nom de fichier
        videoUrl = `${bunnyStorage}video_${video.id}.mp4`;
      }
    }
  } else {
    // URL par défaut si file_url est vide
    const bunnyStorage = 'https://storage.bunnycdn.com/padelvar/';
    videoUrl = `${bunnyStorage}video_${video.id}.mp4`;
  }

  console.log("URL de la vidéo:", videoUrl); // Pour faciliter le debugging

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{video.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-black">
          {/* Lecteur vidéo */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-auto max-h-[70vh]"
            poster={video.thumbnail_url}
            onClick={togglePlay}
          />
          
          {/* Contrôles vidéo */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Barre de progression */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-white text-sm">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>
            
            {/* Contrôles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => skipTime(-10)}>
                  <SkipBack className="h-4 w-4 text-white" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => skipTime(10)}>
                  <SkipForward className="h-4 w-4 text-white" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={toggleMute}>
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                  </Button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={downloadVideo}>
                  <Download className="h-4 w-4 text-white" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Informations vidéo */}
        <div className="p-4">
          {video.description && (
            <p className="text-gray-600 text-sm">{video.description}</p>
          )}
          <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
            <span>Enregistré le: {new Date(video.recorded_at || video.created_at).toLocaleDateString('fr-FR')}</span>
            {video.duration && <span>Durée: {formatTime(video.duration)}</span>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
