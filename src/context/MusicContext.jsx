import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const MusicContext = createContext();

const INITIAL_TRACKS = [
  {
    id: 't1',
    title: 'La Chona',
    artist: 'Los Tucanes de Tijuana',
    album: 'Me Robó el Corazón (1995)',
    duration: '3:30',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    youtubeId: 'z29g4_y6J3I',
    isAudioFile: false
  },
  {
    id: 't2',
    title: 'El Tucanazo',
    artist: 'Los Tucanes de Tijuana',
    album: 'Mundo de Amor (1996)',
    duration: '3:15',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    youtubeId: '9bZkp7q19f0',
    isAudioFile: false
  }
];

export const MusicProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [dbTracks, setDbTracks] = useState([]);
  const [dbPlaylists, setDbPlaylists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('playmusic_liked_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const saved = localStorage.getItem('playmusic_current_track_v17');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentQueue, setCurrentQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('playmusic_queue_v17');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    localStorage.setItem('playmusic_liked_tracks', JSON.stringify(likedTracks));
  }, [likedTracks]);

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('playmusic_current_track_v17', JSON.stringify(currentTrack));
    }
  }, [currentTrack]);

  useEffect(() => {
    if (currentQueue.length > 0) {
      localStorage.setItem('playmusic_queue_v17', JSON.stringify(currentQueue));
    }
  }, [currentQueue]);

  useEffect(() => {
    if (currentUser) {
      fetchTracksFromSupabase();
      fetchPlaylistsFromSupabase();
    }
  }, [currentUser]);

  const fetchTracksFromSupabase = async () => {
    try {
      const { data } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const formatted = data.map(t => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          album: t.album || 'Sin Álbum',
          cover: t.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
          youtubeId: t.youtube_id,
          audioUrl: t.audio_url,
          isAudioFile: t.is_audio_file,
          userId: t.user_id
        }));
        setDbTracks(formatted);
      }
    } catch (e) {
      console.error("Error fetching tracks", e);
    }
  };

  const fetchPlaylistsFromSupabase = async () => {
    try {
      const { data: playlistsData } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (playlistsData) {
        const playlistsWithTracks = await Promise.all(playlistsData.map(async (pl) => {
          const { data: ptData } = await supabase
            .from('playlist_tracks')
            .select('track_id')
            .eq('playlist_id', pl.id);

          return {
            id: pl.id,
            userId: pl.user_id,
            name: pl.name,
            cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
            tracks: ptData ? ptData.map(item => item.track_id) : []
          };
        }));

        setDbPlaylists(playlistsWithTracks);
      }
    } catch (e) {
      console.error("Error fetching playlists", e);
    }
  };

  const allTracks = [...INITIAL_TRACKS, ...dbTracks];

  const toggleLikeTrack = (trackId) => {
    setLikedTracks(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]);
  };

  const playTrack = (track, queue = null) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    setRecentTracks(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 10);
    });

    if (queue && queue.length > 0) {
      setCurrentQueue(queue);
    } else {
      setCurrentQueue(allTracks);
    }
  };

  const togglePlay = () => {
    if (!currentTrack && allTracks.length > 0) {
      playTrack(allTracks[0], allTracks);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const activeQueue = currentQueue.length > 0 ? currentQueue : allTracks;
    if (!currentTrack || activeQueue.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * activeQueue.length);
      playTrack(activeQueue[randomIndex], activeQueue);
      return;
    }

    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % activeQueue.length;
    playTrack(activeQueue[nextIndex], activeQueue);
  };

  const previousTrack = () => {
    const activeQueue = currentQueue.length > 0 ? currentQueue : allTracks;
    if (!currentTrack || activeQueue.length === 0) return;

    const currentIndex = activeQueue.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + activeQueue.length) % activeQueue.length;
    playTrack(activeQueue[prevIndex], activeQueue);
  };

  const addTrackCatalog = async (newTrack) => {
    if (!currentUser) return;
    try {
      const payload = {
        title: newTrack.title,
        artist: newTrack.artist,
        album: newTrack.album,
        cover: newTrack.cover,
        youtube_id: newTrack.youtubeId,
        user_id: currentUser.id,
        is_audio_file: false
      };

      const { data } = await supabase.from('tracks').insert([payload]).select().single();
      fetchTracksFromSupabase();
      return data?.id;
    } catch (e) {}
  };

  const createPlaylist = async (name) => {
    if (!currentUser) return;
    try {
      await supabase.from('playlists').insert([{ user_id: currentUser.id, name }]);
      fetchPlaylistsFromSupabase();
    } catch (e) {}
  };

  const addTrackToPlaylist = async (playlistId, trackId) => {
    try {
      await supabase.from('playlist_tracks').insert([{ playlist_id: playlistId, track_id: trackId }]);
      fetchPlaylistsFromSupabase();
    } catch (e) {}
  };

  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    try {
      await supabase.from('playlist_tracks').delete().eq('playlist_id', playlistId).eq('track_id', trackId);
      fetchPlaylistsFromSupabase();
    } catch (e) {}
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await supabase.from('playlists').delete().eq('id', playlistId);
      fetchPlaylistsFromSupabase();
    } catch (e) {}
  };

  const deleteTrack = async (trackId) => {
    try {
      await supabase.from('tracks').delete().eq('id', trackId);
      fetchTracksFromSupabase();
    } catch (e) {}
  };

  return (
    <MusicContext.Provider value={{
      tracks: allTracks,
      playlists: dbPlaylists,
      recentTracks,
      currentTrack,
      isPlaying,
      volume,
      setVolume,
      isShuffle,
      isRepeat,
      likedTracks,
      toggleLikeTrack,
      toggleShuffle: () => setIsShuffle(!isShuffle),
      toggleRepeat: () => setIsRepeat(!isRepeat),
      playTrack,
      nextTrack,
      previousTrack,
      togglePlay,
      createPlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      deletePlaylist,
      addTrackCatalog,
      deleteTrack
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
