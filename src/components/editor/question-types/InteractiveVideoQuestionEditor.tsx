import { Play, Pause, Upload, Plus, Trash, CheckCircle, AlertCircle, Image, Film, Link , ChevronDown } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import type { BaseQuestionEditorProps } from "../question-editors/base/BaseQuestionEditor";
import { withBaseQuestionEditor } from "../question-editors/base/BaseQuestionEditor";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { Question, VideoMarker, QuestionOption } from "@/types/editor";


// YouTube Player API typedefinities
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId?: string;
          width?: number;
          height?: number;
          playerVars?: {
            autoplay?: 0 | 1;
            controls?: 0 | 1;
            enablejsapi?: 0 | 1;
            start?: number;
            [key: string]: any;
          };
          events?: {
            onReady?: (event: any) => void;
            onStateChange?: (event: any) => void;
            onError?: (event: any) => void;
            [key: string]: any;
          };
        }
      ) => any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface InteractiveVideoQuestionEditorProps extends BaseQuestionEditorProps {
  currentQuestion: Question;
  onQuestionChange: (question: Question) => void;
  showNameField?: boolean;
}

const InteractiveVideoQuestionEditorComponent: React.FC<InteractiveVideoQuestionEditorProps> = ({
  currentQuestion,
  onQuestionChange,
  showNameField = true,
}) => {
  const { toast } = useToast();
  
  // State voor video URL input
  const [videoUrl, setVideoUrl] = useState<string>("");
  
  // State voor autoplay
  const [autoplay, setAutoplay] = useState<boolean>(false);
  
  // State voor de geselecteerde tab
  const [activeTab, setActiveTab] = useState<string>("video");
  
  // State voor de geselecteerde marker index
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number>(0);
  
  // State voor de huidige tijd van de video
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // State voor de totale duur van de video
  const [totalDuration, setTotalDuration] = useState<number>(0);
  
  // State voor het afspelen van de video
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // State voor de open/dicht status van elke accordion
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  
  // Refs voor video elementen
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  
  // YouTube Player referentie
  const ytPlayerRef = useRef<any>(null);
  
  // Interval referentie voor het updaten van de huidige tijd
  const ytIntervalRef = useRef<number | null>(null);
  
  // Zorg ervoor dat er altijd markers zijn, ook al is het een lege array
  const markers = currentQuestion.markers || [];
  
  // Alleen een geselecteerde marker tonen als deze bestaat
  const selectedMarker = markers.length > 0 ? markers[selectedMarkerIndex] : null;

  // Functie om een lege marker te maken
  function createEmptyMarker(): VideoMarker {
    return {
      id: crypto.randomUUID(),
      time: currentTime,
      text: "",
      options: [],
    };
  }

  // Functie om tijd te formatteren (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Functie om te controleren of een URL een YouTube URL is
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) {
      return false;
    }
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
  };

  // Functie om een YouTube URL om te zetten naar een embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) {
      return "";
    }
    
    try {
      // Extract video ID from various YouTube URL formats
      let videoId = "";
      
      // youtu.be format
      if (url.includes("youtu.be")) {
        const urlParts = url.split("/");
        videoId = urlParts[urlParts.length - 1].split("?")[0];
      } 
      // youtube.com/watch?v= format
      else if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(url.split("?")[1] || "");
        videoId = urlParams.get("v") || "";
      }
      // youtube.com/embed format
      else if (url.includes("youtube.com/embed")) {
        const urlParts = url.split("/");
        videoId = urlParts[urlParts.length - 1].split("?")[0];
      }
      
      if (!videoId) {
        console.error("Geen YouTube video ID gevonden in URL:", url);
        return "";
      }
      
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      console.error("Fout bij verwerken van YouTube URL:", error);
      return "";
    }
  };

  // Functie om een YouTube video ID te extraheren uit een URL
  const getYouTubeVideoId = (url: string): string => {
    if (!url) {
      return "";
    }
    
    try {
      // Voor embed URLs
      let match = url.match(/embed\/([\w-]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Voor normale YouTube URLs
      match = url.match(/v=([\w-]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Voor youtu.be URLs
      match = url.match(/youtu\.be\/([\w-]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      return "";
    } catch (error) {
      console.error("Fout bij extraheren YouTube video ID:", error);
      return "";
    }
  };

  // Functie om de video URL input te verwerken
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  // Functie om een video toe te voegen
  const handleAddVideo = () => {
    if (!videoUrl) {
      toast({
        title: "Fout",
        description: "Voer een geldige video URL in",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verwerk de URL afhankelijk van het type (YouTube of direct)
      const isYoutube = isYouTubeUrl(videoUrl);
      const processedUrl = isYoutube ? getYouTubeEmbedUrl(videoUrl) : videoUrl;
      
      if (isYoutube && !processedUrl) {
        toast({
          title: "Fout",
          description: "Kon de YouTube URL niet verwerken. Controleer of het een geldige YouTube URL is.",
          variant: "destructive",
        });
        return;
      }

      // Update de vraag met de nieuwe video URL
      onQuestionChange({
        ...currentQuestion,
        videoUrl: processedUrl,
        isYouTubeVideo: isYoutube,
        type: "video-interactive",
      });

      toast({
        title: "Video toegevoegd",
        description: "De video is succesvol toegevoegd aan de vraag",
      });
      
      // Reset de video URL input
      setVideoUrl("");
    } catch (error) {
      console.error("Fout bij toevoegen van video:", error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het toevoegen van de video",
        variant: "destructive",
      });
    }
  };

  // Functie om een video te uploaden
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      // Voor nu gebruiken we een placeholder voor video upload
      // In een echte implementatie zou hier een upload naar een server plaatsvinden
      const localVideoUrl = URL.createObjectURL(file);
      
      // Update de vraag met de nieuwe video URL
      onQuestionChange({
        ...currentQuestion,
        videoUrl: localVideoUrl,
        isYouTubeVideo: false, // Lokale video, dus geen YouTube
        type: "video-interactive",
      });

      toast({
        title: "Video geüpload",
        description: "De video is succesvol geüpload",
      });
      
      // Reset de file input
      e.target.value = "";
    } catch (error) {
      console.error("Fout bij uploaden van video:", error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het uploaden van de video",
        variant: "destructive",
      });
    }
  };

  // Functie om de video af te spelen of te pauzeren
  const handlePlayPause = () => {
    try {
      if (currentQuestion.isYouTubeVideo) {
        if (ytPlayerRef.current) {
          if (isPlaying) {
            ytPlayerRef.current.pauseVideo();
          } else {
            ytPlayerRef.current.playVideo();
          }
        } else {
          console.error("YouTube speler is niet geïnitialiseerd");
          // Probeer de YouTube speler opnieuw te initialiseren
          initYouTubePlayer();
        }
      } else {
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            videoRef.current.play().catch((error) => {
              console.error("Fout bij afspelen video:", error);
              toast({
                title: "Fout",
                description: "De video kon niet worden afgespeeld",
                variant: "destructive",
              });
            });
          }
          setIsPlaying(!isPlaying);
        } else {
          console.error("Video element is niet gevonden");
        }
      }
    } catch (error) {
      console.error("Fout bij play/pause:", error);
    }
  };

  // Functie om de video te pauzeren
  const pauseVideo = () => {
    try {
      if (currentQuestion.isYouTubeVideo) {
        if (ytPlayerRef.current) {
          ytPlayerRef.current.pauseVideo();
        }
      } else {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error("Fout bij pauzeren video:", error);
    }
  };

  // Functie om de video naar een specifieke tijd te laten springen
  const seekToTime = (time: number) => {
    try {
      // Zorg ervoor dat de tijd binnen de grenzen van de video blijft
      const safeTime = Math.max(0, Math.min(time, totalDuration));
      
      if (currentQuestion.isYouTubeVideo) {
        if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
          ytPlayerRef.current.seekTo(safeTime, true);
        }
      } else {
        if (videoRef.current) {
          videoRef.current.currentTime = safeTime;
        }
      }
      
      // Update de huidige tijd in de UI
      setCurrentTime(safeTime);
    } catch (error) {
      console.error("Fout bij seeking:", error);
    }
  };

  // Functie om naar een marker te springen
  const jumpToMarker = (index: number) => {
    if (index >= 0 && index < markers.length) {
      setSelectedMarkerIndex(index);
      seekToTime(markers[index].time);
    }
  };

  // Functie om de video tijd bij te werken
  const handleVideoTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Functie om de video duur bij te werken
  const handleVideoDurationChange = (duration: number) => {
    setTotalDuration(duration);
  };

  // Functie om een video toe te voegen
  const handleAddMarker = () => {
    // Pauzeer de video eerst
    pauseVideo();
    
    // Controleer of er al een marker bestaat op deze tijd
    const existingMarkerAtTime = markers.find((marker) => 
      Math.abs(marker.time - currentTime) < 0.5, // Binnen 0.5 seconden van de huidige tijd
    );
    
    if (existingMarkerAtTime) {
      toast({
        title: "Marker bestaat al",
        description: "Er bestaat al een vraag op dit tijdstip. Kies een ander tijdstip.",
        variant: "destructive",
      });
      return;
    }
    
    // Maak 4 standaard antwoordopties
    const defaultOptions: QuestionOption[] = [
      { id: crypto.randomUUID(), text: "", isCorrect: false },
      { id: crypto.randomUUID(), text: "", isCorrect: false },
      { id: crypto.randomUUID(), text: "", isCorrect: false },
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ];
    
    const newMarker: VideoMarker = {
      id: crypto.randomUUID(),
      time: currentTime,
      text: "",
      options: defaultOptions,
      correctFeedback: "",
      incorrectFeedback: "",
      showFeedbackImmediately: true,
      showCorrectAnswer: false,
    };

    const updatedMarkers = [...markers, newMarker];
    
    // Sort markers by time
    updatedMarkers.sort((a, b) => a.time - b.time);
    
    const newIndex = updatedMarkers.findIndex((marker) => marker.id === newMarker.id);
    
    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
    
    setSelectedMarkerIndex(newIndex);
    setActiveTab("vraag");
  };

  // Functie om de vraag van een marker te wijzigen
  const handleMarkerQuestionChange = (text: string) => {
    if (!selectedMarker) {
      return;
    }

    const updatedMarkers = [...markers];
    updatedMarkers[selectedMarkerIndex] = {
      ...selectedMarker,
      text,
    };

    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
  };

  // Functie om de tijd van een marker te wijzigen
  const handleMarkerTimeChange = (timeString: string) => {
    if (!selectedMarker) {
      return;
    }
    
    // Converteer de tijd string (mm:ss) naar seconden
    const [minutes, seconds] = timeString.split(":").map((part) => parseInt(part, 10));
    const newTimeInSeconds = (minutes * 60) + seconds;
    
    // Controleer of de tijd geldig is
    if (isNaN(newTimeInSeconds) || newTimeInSeconds < 0 || newTimeInSeconds > totalDuration) {
      toast({
        title: "Ongeldige tijd",
        description: `Voer een tijd in tussen 00:00 en ${formatTime(totalDuration)}`,
        variant: "destructive",
      });
      return;
    }
    
    // Update de marker tijd
    const updatedMarkers = [...markers];
    updatedMarkers[selectedMarkerIndex] = {
      ...selectedMarker,
      time: newTimeInSeconds,
    };
    
    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
    
    // Update de video tijd
    seekToTime(newTimeInSeconds);
  };

  // Functie om een antwoordoptie toe te voegen
  const handleAddOption = () => {
    if (!selectedMarker) {
      return;
    }

    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      text: "",
      isCorrect: false,
    };

    const updatedMarkers = [...markers];
    updatedMarkers[selectedMarkerIndex] = {
      ...selectedMarker,
      options: [...(selectedMarker.options || []), newOption],
    };

    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
  };

  // Functie om de tekst van een antwoordoptie te wijzigen
  const handleOptionTextChange = (optionId: string, text: string) => {
    if (!selectedMarker) {
      return;
    }

    const updatedMarkers = [...markers];
    const options = [...(selectedMarker.options || [])];
    const optionIndex = options.findIndex((option) => option.id === optionId);
    
    if (optionIndex === -1) {
      return;
    }
    
    options[optionIndex] = {
      ...options[optionIndex],
      text,
    };

    updatedMarkers[selectedMarkerIndex] = {
      ...selectedMarker,
      options,
    };

    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
  };

  // Functie om de correctheid van een antwoordoptie te wijzigen
  const handleOptionCorrectChange = (optionId: string, isCorrect: boolean) => {
    if (!selectedMarker) {
      return;
    }

    const updatedMarkers = [...markers];
    const options = [...(selectedMarker.options || [])];
    const optionIndex = options.findIndex((option) => option.id === optionId);
    
    if (optionIndex === -1) {
      return;
    }
    
    options[optionIndex] = {
      ...options[optionIndex],
      isCorrect,
    };

    updatedMarkers[selectedMarkerIndex] = {
      ...selectedMarker,
      options,
    };

    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
  };

  // Functie om een antwoordoptie te verwijderen
  const handleRemoveOption = (optionId: string) => {
    if (!selectedMarker) {
      return;
    }

    const updatedMarkers = [...markers];
    const options = [...(selectedMarker.options || [])];
    const filteredOptions = options.filter((option) => option.id !== optionId);
    
    updatedMarkers[selectedMarkerIndex] = {
      ...selectedMarker,
      options: filteredOptions,
    };

    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
  };

  // Functie om een marker te verwijderen
  const handleDeleteMarker = (index: number) => {
    const updatedMarkers = [...markers];
    updatedMarkers.splice(index, 1);
    
    onQuestionChange({
      ...currentQuestion,
      markers: updatedMarkers,
    });
    
    setSelectedMarkerIndex(Math.max(0, index - 1));
  };

  // Functie om de YouTube Player te initialiseren
  const initYouTubePlayer = () => {
    if (!youtubeContainerRef.current || !currentQuestion.videoUrl) {
      return;
    }

    try {
      // Haal de video ID uit de URL
      const videoUrl = currentQuestion.videoUrl;
      const videoId = getYouTubeVideoId(videoUrl);
      if (!videoId) {
        console.error("Geen YouTube video ID gevonden in URL:", videoUrl);
        return;
      }

      // Maak een nieuwe YouTube Player
      ytPlayerRef.current = new window.YT.Player(youtubeContainerRef.current, {
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
        },
        events: {
          onReady: (event) => {
            // Update de totale duur van de video
            if (event.target && event.target.getDuration) {
              const duration = event.target.getDuration();
              handleVideoDurationChange(duration);
            }
          },
          onStateChange: (event) => {
            // Update de afspeelstatus
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              
              // Update de huidige tijd elke 100ms als de video speelt
              const updateInterval = setInterval(() => {
                if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                  const currentTime = ytPlayerRef.current.getCurrentTime();
                  handleVideoTimeUpdate(currentTime);
                } else {
                  clearInterval(updateInterval);
                }
              }, 100);
              
              // Sla het interval op zodat we het later kunnen opruimen
              ytIntervalRef.current = updateInterval;
            } else {
              setIsPlaying(false);
              
              // Ruim het interval op als de video niet meer speelt
              if (ytIntervalRef.current) {
                clearInterval(ytIntervalRef.current);
                ytIntervalRef.current = null;
              }
            }
          },
          onError: (event) => {
            console.error("YouTube player error:", event);
          },
        },
      });
    } catch (error) {
      console.error("Fout bij initialiseren YouTube Player:", error);
    }
  };

  // Effect voor het initialiseren van de YouTube Player
  useEffect(() => {
    if (!currentQuestion.isYouTubeVideo || !currentQuestion.videoUrl) {
      return;
    }

    // Laad de YouTube API als deze nog niet geladen is
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // Wacht tot de API is geladen
        window.onYouTubeIframeAPIReady = initYouTubePlayer;
      } else {
        // API is al geladen
        initYouTubePlayer();
      }
    };

    // Wacht even om er zeker van te zijn dat de DOM is geladen
    setTimeout(loadYouTubeAPI, 500);

    return () => {
      // Cleanup
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      
      if (ytIntervalRef.current) {
        clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    };
  }, [currentQuestion.isYouTubeVideo, currentQuestion.videoUrl]);

  // Initialiseer het vraagtype bij het eerste renderen
  useEffect(() => {
    // Alleen uitvoeren bij de eerste render
    const isFirstRender = currentQuestion.type !== "video-interactive";
    
    if (isFirstRender) {
      console.log("Initializing video-interactive question type");
      onQuestionChange({
        ...currentQuestion,
        type: "video-interactive",
        markers: currentQuestion.markers || [],
      });
    }
  }, []);

  return (
    <div className="flex flex-col w-full gap-4 dark:bg-gray-900">
      {showNameField && (
        <div className="w-full mb-4">
          <Label htmlFor="question-name" className="dark:text-gray-200">Naam van de vraag:</Label>
          <Input
            id="question-name"
            value={currentQuestion.name || ""}
            onChange={(e) => onQuestionChange({
              ...currentQuestion,
              name: e.target.value,
            })}
            placeholder="Geef deze vraag een naam..."
            className="dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
      )}
      
      <div className="w-full p-4 border rounded-md dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Video Toevoegen</h3>
        <div className="flex items-center gap-2">
          <Input 
            type="text" 
            placeholder="https://www.youtube.com/watch?v=..." 
            value={videoUrl} 
            onChange={handleVideoUrlChange}
            className="flex-1 dark:bg-gray-800 dark:text-gray-200"
          />
          <Button onClick={handleAddVideo} className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Toevoegen
          </Button>
          <span className="mx-2">OF</span>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700" 
            onClick={() => document.getElementById("video-upload")?.click()}
          >
            <Upload size={16} className="dark:stroke-gray-200" />
            <span className="dark:text-gray-200">Upload Video</span>
          </Button>
          <input 
            id="video-upload" 
            type="file" 
            accept="video/*" 
            className="hidden" 
            onChange={handleVideoUpload} 
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="autoplay" 
              checked={autoplay} 
              onCheckedChange={(checked) => setAutoplay(checked as boolean)} 
              className="dark:bg-gray-800 dark:text-gray-200"
            />
            <Label htmlFor="autoplay" className="dark:text-gray-200">Autoplay</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {/* Video Preview */}
          <div className="aspect-video bg-black flex items-center justify-center text-white relative">
            {currentQuestion.videoUrl ? (
              currentQuestion.isYouTubeVideo ? (
                <>
                  <div className="w-full h-full relative">
                    <div 
                      ref={youtubeContainerRef}
                      className="w-full h-full"
                    />
                  </div>
                  {/* Overlay voor betere controle */}
                  <div 
                    className="absolute inset-0 bg-transparent cursor-pointer z-10"
                    onClick={handlePlayPause}
                  />
                </>
              ) : (
                <>
                  <video 
                    ref={videoRef}
                    src={currentQuestion.videoUrl} 
                    className="w-full h-full" 
                    controls={false}
                    playsInline
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        handleVideoTimeUpdate(videoRef.current.currentTime);
                      }
                    }}
                    onDurationChange={() => {
                      if (videoRef.current) {
                        handleVideoDurationChange(videoRef.current.duration);
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  >
                    Uw browser ondersteunt geen video weergave.
                  </video>
                  {/* Overlay voor betere controle */}
                  <div 
                    className="absolute inset-0 bg-transparent cursor-pointer z-10"
                    onClick={handlePlayPause}
                  />
                </>
              )
            ) : (
              <div className="text-center p-4">
                <p>Voeg een video URL toe of upload een video bestand</p>
              </div>
            )}
            
            {/* Play/Pause indicator */}
            {currentQuestion.videoUrl && (
              <div 
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center cursor-pointer z-20 ${isPlaying ? "opacity-0 hover:opacity-50" : "opacity-100"} transition-opacity duration-200`}
                onClick={handlePlayPause}
              >
                {isPlaying ? 
                  <Pause size={32} className="text-white" /> : 
                  <Play size={32} className="text-white ml-1" />
                }
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePlayPause}
                className="rounded-full dark:bg-gray-800 dark:text-gray-200"
              >
                {isPlaying ? <Pause size={20} className="dark:stroke-gray-200" /> : <Play size={20} className="dark:stroke-gray-200" />}
              </Button>
              <div 
                className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden relative cursor-pointer dark:bg-gray-700"
                onClick={(e) => {
                  // Bereken de nieuwe tijd op basis van de klikpositie
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetX = e.clientX - rect.left;
                  const percentage = offsetX / rect.width;
                  const newTime = percentage * totalDuration;
                  
                  // Spring naar de nieuwe tijd
                  seekToTime(newTime);
                }}
              >
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-600" 
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 min-w-[80px] text-right dark:text-gray-200">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => seekToTime(Math.max(0, currentTime - 5))}
                className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                -5s
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => seekToTime(Math.max(0, currentTime - 1))}
                className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                -1s
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddMarker}
                className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Marker toevoegen
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => seekToTime(Math.min(totalDuration, currentTime + 1))}
                className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                +1s
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => seekToTime(Math.min(totalDuration, currentTime + 5))}
                className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                +5s
              </Button>
            </div>
          </div>

          {/* Marker List */}
          <div className="mt-4 border rounded p-2 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-medium mb-2 dark:text-gray-200">Vragen</h3>
            {markers.length === 0 ? (
              <div className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded dark:bg-gray-700 dark:text-gray-300">
                Nog geen vragen toegevoegd. Gebruik de "Marker toevoegen" knop om een vraag toe te voegen.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {markers.map((marker, index) => (
                  <div key={marker.id} className="border dark:border-gray-700 rounded-md overflow-hidden">
                    <div 
                      className={`p-3 rounded-t flex justify-between items-center cursor-pointer ${
                        selectedMarkerIndex === index 
                          ? "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setSelectedMarkerIndex(index);
                        setActiveTab("vraag");
                        seekToTime(marker.time);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold dark:bg-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium dark:text-gray-200">{formatTime(marker.time)}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 truncate max-w-[150px] text-sm dark:text-gray-300">
                              {marker.text || "Geen vraag"}
                            </span>
                            {marker.text ? (
                              <CheckCircle size={14} className="text-green-500" />
                            ) : (
                              <AlertCircle size={14} className="text-amber-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMarker(index);
                          }}
                          className="dark:hover:bg-gray-700"
                        >
                          <Trash size={16} className="dark:stroke-gray-200" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Feedback Section */}
                    <div className="w-full border-t dark:border-gray-700">
                      <button
                        type="button"
                        className="w-full py-2 px-3 text-sm font-medium flex items-center justify-between dark:text-gray-200 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          if (openAccordion === `feedback-${marker.id}`) {
                            setOpenAccordion(null);
                          } else {
                            setOpenAccordion(`feedback-${marker.id}`);
                          }
                        }}
                      >
                        <span>Feedback</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            openAccordion === `feedback-${marker.id}` ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      
                      {openAccordion === `feedback-${marker.id}` && (
                        <div className="p-3 dark:bg-gray-800">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <Label className="text-sm font-medium dark:text-gray-200">Feedback bij juist antwoord:</Label>
                              <Textarea 
                                value={marker.correctFeedback || ""} 
                                onChange={(e) => {
                                  const updatedMarkers = [...markers];
                                  updatedMarkers[index] = {
                                    ...marker,
                                    correctFeedback: e.target.value,
                                  };
                                  onQuestionChange({
                                    ...currentQuestion,
                                    markers: updatedMarkers,
                                  });
                                }} 
                                placeholder="Voer de feedback in..."
                                className="min-h-[60px] text-sm dark:bg-gray-700 dark:text-gray-200"
                              />
                              <div className="flex gap-2 mt-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                  <Image size={12} className="dark:stroke-gray-200" /> Afbeelding
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                  <Film size={12} className="dark:stroke-gray-200" /> GIF
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                  <Link size={12} className="dark:stroke-gray-200" /> URL
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <Label className="text-sm font-medium dark:text-gray-200">Feedback bij onjuist antwoord:</Label>
                              <Textarea 
                                value={marker.incorrectFeedback || ""} 
                                onChange={(e) => {
                                  const updatedMarkers = [...markers];
                                  updatedMarkers[index] = {
                                    ...marker,
                                    incorrectFeedback: e.target.value,
                                  };
                                  onQuestionChange({
                                    ...currentQuestion,
                                    markers: updatedMarkers,
                                  });
                                }} 
                                placeholder="Voer de feedback in..."
                                className="min-h-[60px] text-sm dark:bg-gray-700 dark:text-gray-200"
                              />
                              <div className="flex gap-2 mt-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                  <Image size={12} className="dark:stroke-gray-200" /> Afbeelding
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                  <Film size={12} className="dark:stroke-gray-200" /> GIF
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1 text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                >
                                  <Link size={12} className="dark:stroke-gray-200" /> URL
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t dark:border-gray-700">
                              <h4 className="text-sm font-medium mb-2 dark:text-gray-200">Feedback Instellingen:</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`show-feedback-immediately-${marker.id}`} 
                                    checked={marker.showFeedbackImmediately ?? true}
                                    onCheckedChange={(checked) => {
                                      const updatedMarkers = [...markers];
                                      updatedMarkers[index] = {
                                        ...marker,
                                        showFeedbackImmediately: checked as boolean,
                                      };
                                      onQuestionChange({
                                        ...currentQuestion,
                                        markers: updatedMarkers,
                                      });
                                    }}
                                    className="dark:bg-gray-700"
                                  />
                                  <Label 
                                    htmlFor={`show-feedback-immediately-${marker.id}`}
                                    className="text-xs dark:text-gray-200"
                                  >
                                    Toon feedback direct na antwoord
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`show-correct-answer-${marker.id}`} 
                                    checked={marker.showCorrectAnswer ?? false}
                                    onCheckedChange={(checked) => {
                                      const updatedMarkers = [...markers];
                                      updatedMarkers[index] = {
                                        ...marker,
                                        showCorrectAnswer: checked as boolean,
                                      };
                                      onQuestionChange({
                                        ...currentQuestion,
                                        markers: updatedMarkers,
                                      });
                                    }}
                                    className="dark:bg-gray-700"
                                  />
                                  <Label 
                                    htmlFor={`show-correct-answer-${marker.id}`}
                                    className="text-xs dark:text-gray-200"
                                  >
                                    Toon correcte antwoord bij foute beantwoording
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline with markers */}
          <div className="relative h-16 mt-4 border rounded p-2 bg-gray-50 dark:bg-gray-800">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-700" />
            {markers.map((marker, index) => (
              <div 
                key={marker.id}
                className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full cursor-pointer flex items-center justify-center ${
                  selectedMarkerIndex === index ? "bg-blue-600 ring-2 ring-blue-300" : "bg-blue-500"
                } dark:bg-blue-600 dark:ring-blue-500`}
                style={{ left: `${(marker.time / totalDuration) * 100}%` }}
                onClick={() => {
                  setSelectedMarkerIndex(index);
                  setActiveTab("vraag");
                  seekToTime(marker.time);
                }}
                title={`${formatTime(marker.time)} - ${marker.text || "Geen vraag"}`}
              >
                <span className="text-white text-xs font-bold">{index + 1}</span>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap dark:text-gray-200">
                  {formatTime(marker.time)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="vraag">Vraag</TabsTrigger>
              <TabsTrigger value="instellingen">Instellingen</TabsTrigger>
            </TabsList>

            <TabsContent value="vraag" className="p-4 border rounded-md dark:border-gray-700 dark:bg-gray-800">
              {selectedMarker ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="question-text" className="text-lg font-medium dark:text-gray-200">Vraag:</Label>
                    <Textarea 
                      id="question-text" 
                      value={selectedMarker?.text || ""} 
                      onChange={(e) => handleMarkerQuestionChange(e.target.value)} 
                      placeholder="Voer de vraag in..."
                      className="min-h-[80px] mt-1 dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-lg font-medium dark:text-gray-200">Antwoordopties:</Label>
                      <div className="text-sm text-gray-500 dark:text-gray-200">Selecteer het juiste antwoord</div>
                    </div>
                    
                    {selectedMarker?.options?.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded dark:bg-gray-700">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium dark:bg-blue-600 dark:text-gray-200">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <Checkbox 
                          checked={option.isCorrect} 
                          onCheckedChange={(checked) => handleOptionCorrectChange(option.id, checked as boolean)} 
                          className="ml-1 dark:bg-gray-700 dark:text-gray-200"
                        />
                        <Input 
                          value={option.text} 
                          onChange={(e) => handleOptionTextChange(option.id, e.target.value)} 
                          placeholder={`Antwoordoptie ${index + 1}...`}
                          className="flex-1 dark:bg-gray-700 dark:text-gray-200"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(option.id)}
                          className="dark:bg-gray-700 dark:text-gray-200"
                        >
                          <Trash size={16} className="dark:stroke-gray-200" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddOption}
                      className="mt-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                      <Plus size={16} className="mr-1 dark:stroke-gray-200" /> Extra Antwoordoptie
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500 dark:text-gray-200">
                  <p>Selecteer een marker of voeg een nieuwe marker toe om een vraag te maken.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="instellingen" className="p-4 border rounded-md dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-6">
                {/* Vraaginteractie Sectie */}
                <div>
                  <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Vraaginteractie</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="time-limit" className="min-w-[200px] dark:text-gray-200">
                        Tijdslimiet voor beantwoorden:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="time-limit"
                          type="number"
                          min={0}
                          value={currentQuestion.timeLimit || 30}
                          onChange={(e) => {
                            onQuestionChange({
                              ...currentQuestion,
                              timeLimit: parseInt(e.target.value) || 0,
                            });
                          }}
                          className="w-20 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                        <span className="text-sm dark:text-gray-300">seconden</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="allow-skip"
                        checked={currentQuestion.allowSkip || false}
                        onCheckedChange={(checked) => {
                          onQuestionChange({
                            ...currentQuestion,
                            allowSkip: checked as boolean,
                          });
                        }}
                        className="dark:bg-gray-700"
                      />
                      <Label htmlFor="allow-skip" className="dark:text-gray-200">
                        Sta toe dat de vraag wordt overgeslagen
                      </Label>
                    </div>
                  </div>
                </div>
                
                {/* Video Weergave Sectie */}
                <div>
                  <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Video Weergave</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="auto-pause"
                        checked={currentQuestion.autoPause !== false} // Default to true
                        onCheckedChange={(checked) => {
                          onQuestionChange({
                            ...currentQuestion,
                            autoPause: checked as boolean,
                          });
                        }}
                        className="dark:bg-gray-700"
                      />
                      <Label htmlFor="auto-pause" className="dark:text-gray-200">
                        Pauzeer automatisch bij vraag
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="allow-seeking"
                        checked={currentQuestion.allowSeeking || false}
                        onCheckedChange={(checked) => {
                          onQuestionChange({
                            ...currentQuestion,
                            allowSeeking: checked as boolean,
                          });
                        }}
                        className="dark:bg-gray-700"
                      />
                      <Label htmlFor="allow-seeking" className="dark:text-gray-200">
                        Sta toe dat studenten door de video spoelen
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="allow-review"
                        checked={currentQuestion.allowReview !== false} // Default to true
                        onCheckedChange={(checked) => {
                          onQuestionChange({
                            ...currentQuestion,
                            allowReview: checked as boolean,
                          });
                        }}
                        className="dark:bg-gray-700"
                      />
                      <Label htmlFor="allow-review" className="dark:text-gray-200">
                        Sta toe dat studenten vragen herzien
                      </Label>
                    </div>
                  </div>
                </div>
                
                {/* Beoordeling Sectie */}
                <div>
                  <h3 className="text-lg font-medium mb-3 dark:text-gray-200">Beoordeling</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="default-points" className="min-w-[200px] dark:text-gray-200">
                        Standaard punten per vraag:
                      </Label>
                      <Input
                        id="default-points"
                        type="number"
                        min={0}
                        value={currentQuestion.defaultPoints || 10}
                        onChange={(e) => {
                          onQuestionChange({
                            ...currentQuestion,
                            defaultPoints: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="w-20 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor="passing-score" className="min-w-[200px] dark:text-gray-200">
                        Minimale score om te slagen:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="passing-score"
                          type="number"
                          min={0}
                          max={100}
                          value={currentQuestion.passingScore || 70}
                          onChange={(e) => {
                            onQuestionChange({
                              ...currentQuestion,
                              passingScore: parseInt(e.target.value) || 0,
                            });
                          }}
                          className="w-20 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                        <span className="text-sm dark:text-gray-300">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Huidige Vraag Indicator */}
                {selectedMarker && (
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-md border border-blue-300 dark:border-blue-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold dark:bg-blue-600">
                        {selectedMarkerIndex + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium dark:text-gray-200">Vraag {selectedMarkerIndex + 1} - {formatTime(selectedMarker.time)}</span>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {selectedMarker.text || "Geen vraag"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export const InteractiveVideoQuestionEditor = withBaseQuestionEditor(InteractiveVideoQuestionEditorComponent);
