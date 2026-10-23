import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Disc, Mic2, Heart, X } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    previousTrack, 
    isShuffle, 
    isRepeat, 
    toggleShuffle, 
    toggleRepeat, 
    volume, 
    setVolume, 
    likedTracks, 
    toggleLikeTrack 
  } = useMusic();

  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const timerRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  const isLiked = currentTrack ? likedTracks.includes(currentTrack.id) : false;

  const isRepeatRef = useRef(isRepeat);
  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Cargar API de YouTube
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Control para archivos locales (USB/MP3)
  useEffect(() => {
    if (currentTrack?.isAudioFile && audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Play error:", e));
      }
    }
  }, [currentTrack?.id, currentTrack?.audioUrl]);

  // 🎧 MEDIA SESSION API: Bluetooth + Notificaciones + Pantalla Bloqueada
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      // 1. Actualizar metadatos en pantalla de bloqueo y carátula del auto / auriculares
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Canción',
        artist: currentTrack.artist || 'PlayMusic',
        album: currentTrack.album || 'PlayMusic Cloud',
        artwork: [
          { src: currentTrack.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512&h=512&fit=crop', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      // 2. Controles de Bluetooth y barra de notificaciones del sistema
      navigator.mediaSession.setActionHandler('play', () => {
        handleTogglePlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        handleTogglePlay();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        previousTrack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handleSeek({ target: { value: details.seekTime } });
        }
      });
    }
  }, [currentTrack, isPlaying]);

  // Sincronizar estado de reproducción de la Media Session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Cargar letras de canciones
  useEffect(() => {
    if (showLyrics && currentTrack) {
      fetchLyrics(currentTrack.artist, currentTrack.title);
    }
  }, [currentTrack?.id, showLyrics]);

  // 23/10/2026
  // Recuperar la última canción reproducida al refrescar la página (F5)
  useEffect(() => {
    const savedTrack = localStorage.getItem('playmusic_current_track');
    if (savedTrack && !currentTrack) {
      try {
        // Si tu contexto permite restaurar, o puedes dejar que Supabase lo maneje.
      } catch (e) {}
    }
  }, []);

  // Guardar la canción actual en localStorage cada vez que cambie
  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('playmusic_current_track', JSON.stringify(currentTrack));
    }
  }, [currentTrack]);

  // 23/10/2026 fiin

  const fetchLyrics = async (artist, title) => {
    setLoadingLyrics(true);
    setLyrics('');
    try {
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
      } else {
        setLyrics('No se encontraron letras disponibles para esta canción.');
      }
    } catch (e) {
      setLyrics('No se pudieron cargar las letras en este momento.');
    } finally {
      setLoadingLyrics(false);
    }
  };

  // // Inicialización del reproductor de YouTube
  const initOrPlayYt = (shouldPlay = false) => {
    if (!currentTrack || currentTrack.isAudioFile || !currentTrack.youtubeId) return;

    if (window.YT && window.YT.Player) {
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          ytPlayerRef.current.loadVideoById(currentTrack.youtubeId);
          if (shouldPlay) {
            ytPlayerRef.current.playVideo();
          } else {
            ytPlayerRef.current.pauseVideo();
          }
        } else {
          const container = document.getElementById('yt-player-container');
          if (container) {
            container.innerHTML = '<div id="yt-hidden-player"></div>';
          }
          ytPlayerRef.current = new window.YT.Player('yt-hidden-player', {
            height: '0',
            width: '0',
            videoId: currentTrack.youtubeId,
            playerVars: {
              autoplay: shouldPlay ? 1 : 0,
              controls: 0,
              enablejsapi: 1,
              playsinline: 1
            },
            events: {
              onReady: (event) => {
                event.target.setVolume(volume * 100);
                setDuration(event.target.getDuration() || 0);
                if (shouldPlay) {
                  event.target.playVideo();
                }
              },
              onStateChange: (event) => {
                // Si el reproductor entra en buffering o se pausa solo, forzamos continuidad si isPlaying es true
                if (event.data === window.YT.PlayerState.ENDED) {
                  if (isRepeatRef.current) {
                    event.target.seekTo(0);
                    event.target.playVideo();
                  } else {
                    nextTrack();
                  }
                }
              }
            }
          });
        }
      } catch (e) {
        console.warn("YT re-init error:", e);
      }
    } else {
      setTimeout(() => initOrPlayYt(shouldPlay), 300);
    }
  };
  // const initOrPlayYt = (shouldPlay = false) => {
  //   if (!currentTrack || currentTrack.isAudioFile || !currentTrack.youtubeId) return;

  //   if (window.YT && window.YT.Player) {
  //     try {
  //       if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
  //         if (shouldPlay) {
  //           ytPlayerRef.current.loadVideoById(currentTrack.youtubeId);
  //           ytPlayerRef.current.playVideo();
  //         } else {
  //           ytPlayerRef.current.cueVideoById(currentTrack.youtubeId);
  //         }
  //       } else {
  //         const container = document.getElementById('yt-player-container');
  //         if (container) {
  //           container.innerHTML = '<div id="yt-hidden-player"></div>';
  //         }
  //         ytPlayerRef.current = new window.YT.Player('yt-hidden-player', {
  //           height: '0',
  //           width: '0',
  //           videoId: currentTrack.youtubeId,
  //           playerVars: {
  //             autoplay: shouldPlay ? 1 : 0,
  //             controls: 0,
  //             enablejsapi: 1,
  //             playsinline: 1 // Crucial para mantener la reproducción en móviles sin abrir pantalla completa
  //           },
  //           events: {
  //             onReady: (event) => {
  //               event.target.setVolume(volume * 100);
  //               setDuration(event.target.getDuration() || 0);
  //               if (shouldPlay) {
  //                 event.target.playVideo();
  //               }
  //             },
  //             onStateChange: (event) => {
  //               if (event.data === 0) { // ENDED
  //                 if (isRepeatRef.current) {
  //                   event.target.seekTo(0);
  //                   event.target.playVideo();
  //                 } else {
  //                   nextTrack();
  //                 }
  //               }
  //             }
  //           }
  //         });
  //       }
  //     } catch (e) {
  //       console.warn("YT re-init error:", e);
  //     }
  //   } else {
  //     setTimeout(() => initOrPlayYt(shouldPlay), 300);
  //   }
  // };

  // useEffect(() => {
  //   if (currentTrack && !currentTrack.isAudioFile && currentTrack.youtubeId) {
  //     initOrPlayYt(isPlaying);
  //   }
  // }, [currentTrack?.id]);
  
  useEffect(() => {
      if (currentTrack && !currentTrack.isAudioFile && currentTrack.youtubeId) {
        // 🛑 AQUÍ AGREGAS ESTO: Si suena YouTube, pausamos el audio local para evitar cruces
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        initOrPlayYt(isPlaying);
      }
    }, [currentTrack?.id]);


  const handleTogglePlay = () => {
    if (!currentTrack) return;

    if (currentTrack.isAudioFile) {
      togglePlay();
      return;
    }

    if (!isPlaying) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        try {
          ytPlayerRef.current.playVideo();
        } catch (e) {
          initOrPlayYt(true);
        }
      } else {
        initOrPlayYt(true);
      }
      togglePlay();
    } else {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {}
      }
      togglePlay();
    }
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try { ytPlayerRef.current.setVolume(volume * 100); } catch (e) {}
    }
  }, [volume]);

  // useEffect(() => {
  //   if (currentTrack?.isAudioFile && audioRef.current) {
  //     if (isPlaying) {
  //       audioRef.current.play().catch(e => console.log("Audio autoplay restriction:", e));
  //     } else {
  //       audioRef.current.pause();
  //     }
  //   }
  // }, [isPlaying]);
  useEffect(() => {
    if (currentTrack?.isAudioFile && audioRef.current) {
      // 🛑 AQUÍ AGREGAS ESTO: Si suena un archivo local, detenemos YouTube para que no suenen ambos
      if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
        try { ytPlayerRef.current.stopVideo(); } catch (e) {}
      }

      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Play error:", e));
      }
    }
  }, [currentTrack?.id, currentTrack?.audioUrl]);

  useEffect(() => {
    if (!currentTrack?.isAudioFile && isPlaying) {
      timerRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            setCurrentTime(cur);
            if (dur > 0) setDuration(dur);
          } catch (e) {}
        }
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentTrack]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (currentTrack?.isAudioFile && audioRef.current) {
      audioRef.current.currentTime = newTime;
    } else if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(newTime, true);
      } catch (err) {}
    }
  };

  const handleAudioEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextTrack();
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time <= 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentTrack) return null;

  return (
    <>
      {showLyrics && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col p-6 max-w-3xl mx-auto my-auto h-[80vh] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <Mic2 className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-lg font-bold text-white">{currentTrack.title}</h3>
                <p className="text-xs text-zinc-400">{currentTrack.artist}</p>
              </div>
            </div>
            <button onClick={() => setShowLyrics(false)} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 custom-scrollbar text-center text-zinc-300 space-y-4 font-medium text-base leading-relaxed whitespace-pre-line">
            {loadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <Disc className="w-8 h-8 text-green-400 animate-spin" />
                <p className="text-xs text-zinc-500">Buscando letra de la canción...</p>
              </div>
            ) : lyrics}
          </div>
        </div>
      )}

      {/* Main Responsive Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/98 border-t border-zinc-900 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between z-40 shadow-2xl backdrop-blur-xl gap-2 sm:gap-3">
        <div id="yt-player-container" className="hidden">
          <div id="yt-hidden-player"></div>
        </div>

        {/* Track Info */}
        <div className="flex items-center justify-between w-full md:w-1/4 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 truncate flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-zinc-800 relative flex-shrink-0 shadow-md">
              {currentTrack.cover ? (
                <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <Disc className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>
            <div className="truncate min-w-0 flex-1">
              <h4 className="text-white text-xs sm:text-sm font-bold truncate">{currentTrack.title}</h4>
              <p className="text-zinc-400 text-[10px] sm:text-xs truncate mt-0.5">{currentTrack.artist}</p>
            </div>
            <button
              onClick={() => toggleLikeTrack(currentTrack.id)}
              className={`p-1.5 transition flex-shrink-0 ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
              title="Me Gusta"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick Actions for Mobile */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-1.5 rounded-lg ${showLyrics ? 'text-green-400 bg-green-500/10' : 'text-zinc-400'}`}
              title="Letras"
            >
              <Mic2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg transition ${isShuffle ? 'text-green-400 bg-green-500/10' : 'text-zinc-400'}`}
              title="Aleatorio"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={previousTrack}
              className="text-zinc-300 hover:text-white p-1.5"
              title="Anterior"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition"
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
            </button>
            <button
              onClick={nextTrack}
              className="text-zinc-300 hover:text-white p-1.5"
              title="Siguiente"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg transition ${isRepeat ? 'text-green-400 bg-green-500/10' : 'text-zinc-400'}`}
              title="Repetir"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4 max-w-xl">
          <div className="hidden md:flex items-center gap-5">
            <button onClick={toggleShuffle} className={`transition hover:scale-110 p-1 ${isShuffle ? 'text-green-400' : 'text-zinc-400 hover:text-white'}`} title="Aleatorio (Shuffle)">
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={previousTrack} className="text-zinc-400 hover:text-white transition hover:scale-110 p-1" title="Anterior">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button onClick={handleTogglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg" title={isPlaying ? "Pausar" : "Reproducir"}>
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition hover:scale-110 p-1" title="Siguiente">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button onClick={toggleRepeat} className={`transition hover:scale-110 p-1 ${isRepeat ? 'text-green-400' : 'text-zinc-400 hover:text-white'}`} title="Repetir Canción">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 w-7 sm:w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-800 accent-green-500 rounded-lg cursor-pointer hover:bg-zinc-700 transition"
            />
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 w-7 sm:w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Lyrics */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <button onClick={() => setShowLyrics(!showLyrics)} className={`p-2 rounded-xl transition ${showLyrics ? 'text-green-400 bg-green-500/10' : 'text-zinc-400 hover:text-white'}`} title="Letras de la canción">
            <Mic2 className="w-5 h-5" />
          </button>
          <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-zinc-400 hover:text-white transition">
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 lg:w-24 accent-green-500 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
          />
        </div>

        {currentTrack.isAudioFile && (
          <audio
            ref={audioRef}
            src={currentTrack.audioUrl}
            autoPlay={isPlaying}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioTimeUpdate}
            onEnded={handleAudioEnded}
            onCanPlayThrough={() => {
              if (isPlaying && audioRef.current) {
                audioRef.current.play().catch(e => console.log("Error al reproducir audio local:", e));
              }
            }}
          />
        )}
      </div>
    </>
  );
}
// new 
// import React, { useRef, useEffect, useState } from 'react';
// import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Disc, Mic2, Heart, X } from 'lucide-react';
// import { useMusic } from '../context/MusicContext';

// export default function Player() {
//   const { 
//     currentTrack, 
//     isPlaying, 
//     togglePlay, 
//     nextTrack, 
//     previousTrack, 
//     isShuffle, 
//     isRepeat, 
//     toggleShuffle, 
//     toggleRepeat, 
//     volume, 
//     setVolume, 
//     likedTracks, 
//     toggleLikeTrack 
//   } = useMusic();

//   const audioRef = useRef(null);
//   const ytPlayerRef = useRef(null);
//   const timerRef = useRef(null);

//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [showLyrics, setShowLyrics] = useState(false);
//   const [lyrics, setLyrics] = useState('');
//   const [loadingLyrics, setLoadingLyrics] = useState(false);

//   const isLiked = currentTrack ? likedTracks.includes(currentTrack.id) : false;

//   // Ref to hold current isRepeat and isShuffle state inside YouTube callbacks
//   const isRepeatRef = useRef(isRepeat);
//   useEffect(() => {
//     isRepeatRef.current = isRepeat;
//   }, [isRepeat]);

//   // Load YouTube API script once
//   useEffect(() => {
//     if (!window.YT) {
//       const tag = document.createElement('script');
//       tag.src = "https://www.youtube.com/iframe_api";
//       const firstScriptTag = document.getElementsByTagName('script')[0];
//       firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
//     }
//   }, []);
// // new 
// useEffect(() => {
//     if (currentTrack?.isAudioFile && audioRef.current) {
//       audioRef.current.load();
//       if (isPlaying) {
//         audioRef.current.play().catch(e => console.log("Play error:", e));
//       }
//     }
//   }, [currentTrack?.id, currentTrack?.audioUrl]);

//   // Fetch lyrics when modal is open
//   useEffect(() => {
//     if (showLyrics && currentTrack) {
//       fetchLyrics(currentTrack.artist, currentTrack.title);
//     }
//   }, [currentTrack?.id, showLyrics]);

//   // segundo plano
// // Sincronizar metadatos y controles multimedia para reproducción en segundo plano (Media Session API)
//   useEffect(() => {
//     if ('mediaSession' in navigator && currentTrack) {
//       navigator.mediaSession.metadata = new MediaMetadata({
//         title: currentTrack.title || 'Reproduciendo música',
//         artist: currentTrack.artist || 'PlayMusic',
//         album: currentTrack.album || 'Catálogo General',
//         artwork: [
//           { src: currentTrack.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512&h=512&fit=crop', sizes: '512x512', type: 'image/jpeg' }
//         ]
//       });

//       navigator.mediaSession.setActionHandler('play', () => {
//         if (!isPlaying) handleTogglePlay();
//       });

//       navigator.mediaSession.setActionHandler('pause', () => {
//         if (isPlaying) handleTogglePlay();
//       });

//       navigator.mediaSession.setActionHandler('previoustrack', () => {
//         previousTrack();
//       });

//       navigator.mediaSession.setActionHandler('nexttrack', () => {
//         nextTrack();
//       });
//     }
//   }, [currentTrack, isPlaying]);
//   // fin de segundo plano

//   const fetchLyrics = async (artist, title) => {
//     setLoadingLyrics(true);
//     setLyrics('');
//     try {
//       const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
//       const data = await res.json();
//       if (data.lyrics) {
//         setLyrics(data.lyrics);
//       } else {
//         setLyrics('No se encontraron letras disponibles para esta canción.');
//       }
//     } catch (e) {
//       setLyrics('No se pudieron cargar las letras en este momento.');
//     } finally {
//       setLoadingLyrics(false);
//     }
//   };

//   // Initialize or Play Video safely
//   const initOrPlayYt = (shouldPlay = false) => {
//     if (!currentTrack || currentTrack.isAudioFile || !currentTrack.youtubeId) return;

//     if (window.YT && window.YT.Player) {
//       try {
//         if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
//           if (shouldPlay) {
//             ytPlayerRef.current.loadVideoById(currentTrack.youtubeId);
//             ytPlayerRef.current.playVideo();
//           } else {
//             ytPlayerRef.current.cueVideoById(currentTrack.youtubeId);
//           }
//         } else {
//           const container = document.getElementById('yt-player-container');
//           if (container) {
//             container.innerHTML = '<div id="yt-hidden-player"></div>';
//           }
//           ytPlayerRef.current = new window.YT.Player('yt-hidden-player', {
//             height: '0',
//             width: '0',
//             videoId: currentTrack.youtubeId,
//             playerVars: {
//               autoplay: shouldPlay ? 1 : 0,
//               controls: 0,
//               enablejsapi: 1
//             },
//             events: {
//               onReady: (event) => {
//                 event.target.setVolume(volume * 100);
//                 setDuration(event.target.getDuration() || 0);
//                 if (shouldPlay) {
//                   event.target.playVideo();
//                 }
//               },
//               onStateChange: (event) => {
//                 if (event.data === 0) { // ENDED
//                   if (isRepeatRef.current) {
//                     event.target.seekTo(0);
//                     event.target.playVideo();
//                   } else {
//                     nextTrack();
//                   }
//                 }
//               }
//             }
//           });
//         }
//       } catch (e) {
//         console.warn("YT re-init error:", e);
//       }
//     } else {
//       setTimeout(() => initOrPlayYt(shouldPlay), 300);
//     }
//   };

//   useEffect(() => {
//     if (currentTrack && !currentTrack.isAudioFile && currentTrack.youtubeId) {
//       initOrPlayYt(isPlaying);
//     }
//   }, [currentTrack?.id]);

//   const handleTogglePlay = () => {
//     if (!currentTrack) return;

//     if (currentTrack.isAudioFile) {
//       togglePlay();
//       return;
//     }

//     if (!isPlaying) {
//       if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
//         try {
//           ytPlayerRef.current.playVideo();
//         } catch (e) {
//           initOrPlayYt(true);
//         }
//       } else {
//         initOrPlayYt(true);
//       }
//       togglePlay();
//     } else {
//       if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
//         try {
//           ytPlayerRef.current.pauseVideo();
//         } catch (e) {}
//       }
//       togglePlay();
//     }
//   };

//   useEffect(() => {
//     if (audioRef.current) audioRef.current.volume = volume;
//     if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
//       try { ytPlayerRef.current.setVolume(volume * 100); } catch (e) {}
//     }
//   }, [volume]);

//   useEffect(() => {
//     if (currentTrack?.isAudioFile && audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.play().catch(e => console.log("Audio autoplay restriction:", e));
//       } else {
//         audioRef.current.pause();
//       }
//     }
//   }, [isPlaying]);

//   useEffect(() => {
//     if (!currentTrack?.isAudioFile && isPlaying) {
//       timerRef.current = setInterval(() => {
//         if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
//           try {
//             const cur = ytPlayerRef.current.getCurrentTime() || 0;
//             const dur = ytPlayerRef.current.getDuration() || 0;
//             setCurrentTime(cur);
//             if (dur > 0) setDuration(dur);
//           } catch (e) {}
//         }
//       }, 500);
//     } else {
//       clearInterval(timerRef.current);
//     }
//     return () => clearInterval(timerRef.current);
//   }, [isPlaying, currentTrack]);

//   const handleAudioTimeUpdate = () => {
//     if (audioRef.current) {
//       setCurrentTime(audioRef.current.currentTime);
//       setDuration(audioRef.current.duration || 0);
//     }
//   };

//   const handleSeek = (e) => {
//     const newTime = parseFloat(e.target.value);
//     setCurrentTime(newTime);
//     if (currentTrack?.isAudioFile && audioRef.current) {
//       audioRef.current.currentTime = newTime;
//     } else if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
//       try {
//         ytPlayerRef.current.seekTo(newTime, true);
//       } catch (err) {}
//     }
//   };

//   const handleAudioEnded = () => {
//     if (isRepeat) {
//       if (audioRef.current) {
//         audioRef.current.currentTime = 0;
//         audioRef.current.play();
//       }
//     } else {
//       nextTrack();
//     }
//   };

//   const formatTime = (time) => {
//     if (isNaN(time) || time <= 0) return '0:00';
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

//   if (!currentTrack) return null;

//   return (
//     <>
//       {showLyrics && (
//         <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col p-6 max-w-3xl mx-auto my-auto h-[80vh] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
//           <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
//             <div className="flex items-center gap-3">
//               <Mic2 className="w-6 h-6 text-green-400" />
//               <div>
//                 <h3 className="text-lg font-bold text-white">{currentTrack.title}</h3>
//                 <p className="text-xs text-zinc-400">{currentTrack.artist}</p>
//               </div>
//             </div>
//             <button onClick={() => setShowLyrics(false)} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full transition">
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//           <div className="flex-1 overflow-y-auto py-6 custom-scrollbar text-center text-zinc-300 space-y-4 font-medium text-base leading-relaxed whitespace-pre-line">
//             {loadingLyrics ? (
//               <div className="flex flex-col items-center justify-center h-full space-y-3">
//                 <Disc className="w-8 h-8 text-green-400 animate-spin" />
//                 <p className="text-xs text-zinc-500">Buscando letra de la canción...</p>
//               </div>
//             ) : lyrics}
//           </div>
//         </div>
//       )}

//       {/* Main Responsive Player Bar */}
//       <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/98 border-t border-zinc-900 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between z-40 shadow-2xl backdrop-blur-xl gap-2 sm:gap-3">
//         <div id="yt-player-container" className="hidden">
//           <div id="yt-hidden-player"></div>
//         </div>

//         {/* Top / Left Section: Track Info & Controls on Mobile */}
//         <div className="flex items-center justify-between w-full md:w-1/4 gap-2">
//           {/* Track Info */}
//           <div className="flex items-center gap-2.5 sm:gap-3 truncate flex-1 min-w-0">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-zinc-800 relative flex-shrink-0 shadow-md">
//               {currentTrack.cover ? (
//                 <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-zinc-500">
//                   <Disc className="w-5 h-5 animate-spin" />
//                 </div>
//               )}
//             </div>
//             <div className="truncate min-w-0 flex-1">
//               <h4 className="text-white text-xs sm:text-sm font-bold truncate">{currentTrack.title}</h4>
//               <p className="text-zinc-400 text-[10px] sm:text-xs truncate mt-0.5">{currentTrack.artist}</p>
//             </div>
//             <button
//               onClick={() => toggleLikeTrack(currentTrack.id)}
//               className={`p-1.5 transition flex-shrink-0 ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
//               title="Me Gusta"
//             >
//               <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
//             </button>
//           </div>

//           {/* Quick Actions for Mobile */}
//           <div className="flex md:hidden items-center gap-1 flex-shrink-0">
//             <button
//               onClick={() => setShowLyrics(!showLyrics)}
//               className={`p-1.5 rounded-lg ${showLyrics ? 'text-green-400 bg-green-500/10' : 'text-zinc-400'}`}
//               title="Letras"
//             >
//               <Mic2 className="w-4 h-4" />
//             </button>
//             <button
//               onClick={toggleShuffle}
//               className={`p-1.5 rounded-lg transition ${isShuffle ? 'text-green-400 bg-green-500/10' : 'text-zinc-400'}`}
//               title="Aleatorio"
//             >
//               <Shuffle className="w-3.5 h-3.5" />
//             </button>
//             <button
//               onClick={previousTrack}
//               className="text-zinc-300 hover:text-white p-1.5"
//               title="Anterior"
//             >
//               <SkipBack className="w-4 h-4 fill-current" />
//             </button>
//             <button
//               onClick={handleTogglePlay}
//               className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition"
//               title={isPlaying ? "Pausar" : "Reproducir"}
//             >
//               {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
//             </button>
//             <button
//               onClick={nextTrack}
//               className="text-zinc-300 hover:text-white p-1.5"
//               title="Siguiente"
//             >
//               <SkipForward className="w-4 h-4 fill-current" />
//             </button>
//             <button
//               onClick={toggleRepeat}
//               className={`p-1.5 rounded-lg transition ${isRepeat ? 'text-green-400 bg-green-500/10' : 'text-zinc-400'}`}
//               title="Repetir"
//             >
//               <Repeat className="w-3.5 h-3.5" />
//             </button>
//           </div>
//         </div>

//         {/* Center Section: Desktop Controls & Progress Bar */}
//         <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4 max-w-xl">
//           {/* Desktop Controls */}
//           <div className="hidden md:flex items-center gap-5">
//             <button onClick={toggleShuffle} className={`transition hover:scale-110 p-1 ${isShuffle ? 'text-green-400' : 'text-zinc-400 hover:text-white'}`} title="Aleatorio (Shuffle)">
//               <Shuffle className="w-4 h-4" />
//             </button>
//             <button onClick={previousTrack} className="text-zinc-400 hover:text-white transition hover:scale-110 p-1" title="Anterior">
//               <SkipBack className="w-5 h-5 fill-current" />
//             </button>
//             <button onClick={handleTogglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg" title={isPlaying ? "Pausar" : "Reproducir"}>
//               {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
//             </button>
//             <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition hover:scale-110 p-1" title="Siguiente">
//               <SkipForward className="w-5 h-5 fill-current" />
//             </button>
//             <button onClick={toggleRepeat} className={`transition hover:scale-110 p-1 ${isRepeat ? 'text-green-400' : 'text-zinc-400 hover:text-white'}`} title="Repetir Canción">
//               <Repeat className="w-4 h-4" />
//             </button>
//           </div>

//           {/* Progress Bar */}
//           <div className="w-full flex items-center gap-2 sm:gap-3">
//             <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 w-7 sm:w-10 text-right">{formatTime(currentTime)}</span>
//             <input
//               type="range"
//               min="0"
//               max={duration || 100}
//               value={currentTime}
//               onChange={handleSeek}
//               className="w-full h-1.5 bg-zinc-800 accent-green-500 rounded-lg cursor-pointer hover:bg-zinc-700 transition"
//             />
//             <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 w-7 sm:w-10">{formatTime(duration)}</span>
//           </div>
//         </div>

//         {/* Right Section: Volume & Lyrics (Desktop) */}
//         <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
//           <button onClick={() => setShowLyrics(!showLyrics)} className={`p-2 rounded-xl transition ${showLyrics ? 'text-green-400 bg-green-500/10' : 'text-zinc-400 hover:text-white'}`} title="Letras de la canción">
//             <Mic2 className="w-5 h-5" />
//           </button>
//           <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-zinc-400 hover:text-white transition">
//             {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
//           </button>
//           <input
//             type="range"
//             min="0"
//             max="1"
//             step="0.01"
//             value={volume}
//             onChange={(e) => setVolume(parseFloat(e.target.value))}
//             className="w-20 lg:w-24 accent-green-500 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
//           />
//         </div>

//       {currentTrack.isAudioFile && (
//           <audio
//             ref={audioRef}
//             src={currentTrack.audioUrl}
//             autoPlay={isPlaying}
//             onTimeUpdate={handleAudioTimeUpdate}
//             onLoadedMetadata={handleAudioTimeUpdate}
//             onEnded={handleAudioEnded}
//             onCanPlayThrough={() => {
//               if (isPlaying && audioRef.current) {
//                 audioRef.current.play().catch(e => console.log("Error al reproducir audio local:", e));
//               }
//             }}
//           />
//         )}
//       </div>
//     </>
//   );
// }
