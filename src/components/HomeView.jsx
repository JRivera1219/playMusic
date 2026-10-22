import React, { useState } from 'react';
import { Play, Plus, Check, Video, Disc, Users, FolderUp, Trash2, Clock } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function HomeView() {
  const { tracks, playTrack, playlists, addTrackToPlaylist, addTrackCatalog, addMultipleTracks, deleteTrack, deleteAlbum, recentTracks } = useMusic();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  const extractYoutubeId = (url) => {
    try {
      if (!url) return 'z29g4_y6J3I';
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.slice(1);
      }
      return parsedUrl.searchParams.get('v') || 'z29g4_y6J3I';
    } catch (e) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : 'z29g4_y6J3I';
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    const ytId = extractYoutubeId(url);
    if (ytId && ytId !== 'z29g4_y6J3I' && !title) {
      setTitle('Canción de YouTube');
      setArtist('YouTube Music');
    }
  };

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    
    const ytId = extractYoutubeId(youtubeUrl);
    const trackId = 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newTrack = {
      id: trackId,
      title: title.trim() || 'Canción YouTube',
      artist: artist.trim() || 'YouTube Music',
      album: album.trim() || 'YouTube Music',
      duration: '3:45',
      cover: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      youtubeId: ytId,
      isAudioFile: false
    };

    addTrackCatalog(newTrack);

    if (selectedPlaylistId) {
      addTrackToPlaylist(selectedPlaylistId, trackId);
    }

    setTitle('');
    setArtist('');
    setAlbum('');
    setYoutubeUrl('');
    setSelectedPlaylistId('');
    setShowAddModal(false);
  };

  const handleFolderUpload = (e) => {
    const files = Array.from(e.target.files);
    const audioFiles = files.filter(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.mp3') || name.endsWith('.m4a') || name.endsWith('.wav') || name.endsWith('.flac') || name.endsWith('.aac') || f.type.includes('audio');
    });
    
    if (audioFiles.length === 0) {
      alert(`No se encontraron archivos de audio (.mp3, .wav, etc.). Archivos detectados: ${files.length}`);
      return;
    }

 const newTracks = audioFiles.map(file => {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const parts = nameWithoutExt.split('-');
      const songTitle = parts.length > 1 ? parts[1].trim() : nameWithoutExt;
      const songArtist = parts.length > 1 ? parts[0].trim() : 'Música Local (USB)';

      return {
        title: songTitle,
        artist: songArtist,
        album: 'USB / Mis Canciones',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        audioUrl: URL.createObjectURL(file),
        rawFile: file, // <-- IMPORTANTE: Pasa el archivo real aquí
        isAudioFile: true
      };
    });

    if (typeof addMultipleTracks === 'function') {
      addMultipleTracks(newTracks);
    }
    alert(`¡Se han cargado ${newTracks.length} canciones desde tu USB correctamente!`);
  };

  const artistsList = Array.from(new Set(tracks.map(t => t.artist)));
  const albumsList = Array.from(new Set(tracks.map(t => t.album)));

  return (
    <div className="space-y-6 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-6 rounded-3xl border border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">PlayMusic</h1>
          <p className="text-zinc-400 mt-1.5 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
            Agrega enlaces de YouTube Music o reproduce tus carpetas de música USB directamente guardándolas en tu biblioteca y playlists.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-3 rounded-2xl transition cursor-pointer shadow-lg text-xs sm:text-sm">
            <FolderUp className="w-4 h-4 text-green-400" />
            Cargar Carpeta USB / MP3
            <input
              type="file"
              multiple
              accept=".mp3,.m4a,.wav,.flac,audio/*"
              onChange={handleFolderUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-extrabold px-5 py-3 rounded-2xl transition shadow-xl shadow-green-500/20 text-xs sm:text-sm flex-shrink-0"
          >
            <Video className="w-4 h-4" />
            Enlace YouMusic
          </button>
        </div>
      </div>

      {/* Recientemente Escuchadas */}
      {recentTracks && recentTracks.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Clock className="w-5 h-5 text-green-400" />
            Recientemente Escuchadas
          </div>
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {recentTracks.map((rt) => (
              <div
                key={rt.id}
                onClick={() => playTrack(rt)}
                className="flex items-center gap-3 bg-zinc-800/80 hover:bg-zinc-800 p-2.5 rounded-2xl cursor-pointer min-w-[200px] max-w-[240px] border border-zinc-700/50 transition flex-shrink-0 group"
              >
                <img src={rt.cover} alt={rt.title} className="w-10 h-10 rounded-xl object-cover shadow" />
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-green-400 transition">{rt.title}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{rt.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'all' ? 'bg-white text-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Todas las Canciones
        </button>
        <button
          onClick={() => setActiveTab('artists')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'artists' ? 'bg-white text-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Artistas ({artistsList.length})
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'albums' ? 'bg-white text-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Disc className="w-4 h-4" />
          Álbumes ({albumsList.length})
        </button>
      </div>

      {activeTab === 'all' && (
        <div>
          <h2 className="text-xl font-black text-white mb-4">Catálogo General</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tracks.map(track => {
              const isDefaultTrack = track.id === 't1' || track.id === 't2';
              return (
                <div
                  key={track.id}
                  className="bg-zinc-900/80 border border-zinc-800/80 p-3 rounded-2xl hover:bg-zinc-800 transition duration-300 group relative flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-zinc-800 shadow-md">
                      <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <button
                        onClick={() => playTrack(track, tracks)}
                        className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300 hover:scale-105"
                        title="Reproducir"
                      >
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      </button>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate flex-1">
                        <h3 className="font-bold text-white text-sm truncate">{track.title}</h3>
                        <p className="text-zinc-400 text-xs mt-0.5 truncate font-medium">{track.artist}</p>
                        <p className="text-zinc-500 text-[10px] truncate mt-0.5">{track.album}</p>
                      </div>
                      {!isDefaultTrack && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Deseas eliminar la canción "${track.title}"?`)) {
                              deleteTrack(track.id);
                            }
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1 transition rounded-lg hover:bg-zinc-800"
                          title="Eliminar canción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {playlists.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Añadir</span>
                      <div className="flex gap-1">
                        {playlists.map(pl => {
                          const isInPlaylist = pl.tracks.includes(track.id);
                          return (
                            <button
                              key={pl.id}
                              onClick={() => addTrackToPlaylist(pl.id, track.id)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                                isInPlaylist ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                              }`}
                              title={pl.name}
                            >
                              {isInPlaylist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'artists' && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white mb-3">Artistas Registrados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artistsList.map(artist => {
              const artistTracks = tracks.filter(t => t.artist === artist);
              return (
                <div key={artist} className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg">
                      {artist.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{artist}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{artistTracks.length} canciones</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    {artistTracks.map(t => (
                      <div key={t.id} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-xl hover:bg-zinc-800 transition">
                        <span className="text-zinc-300 font-semibold truncate max-w-[150px]">{t.title}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => playTrack(t, artistTracks)}
                            className="bg-green-500 text-black p-1 rounded-md font-bold hover:scale-105 transition flex items-center"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                          {t.id !== 't1' && t.id !== 't2' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar "${t.title}"?`)) deleteTrack(t.id);
                              }}
                              className="text-zinc-500 hover:text-red-400 p-0.5"
                              title="Eliminar canción"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'albums' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Álbumes / Carpetas Organizadas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {albumsList.map(album => {
              const albumTracks = tracks.filter(t => t.album === album);
              const sampleCover = albumTracks[0]?.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';
              const isDefaultAlbum = album.includes('Me Robó el Corazón') || album.includes('Mundo de Amor');

              return (
                <div key={album} className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl shadow-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 shadow mb-2 relative group">
                      <img src={sampleCover} alt={album} className="w-full h-full object-cover" />
                      <button
                        onClick={() => playTrack(albumTracks[0], albumTracks)}
                        className="absolute bottom-2 right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300 hover:scale-105"
                        title="Reproducir Álbum Completo"
                      >
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      </button>
                    </div>
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="truncate flex-1">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">{album}</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{albumTracks.length} canciones</p>
                      </div>
                      {!isDefaultAlbum && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar todo el álbum/carpeta "${album}" y sus ${albumTracks.length} canciones?`)) {
                              deleteAlbum(album);
                            }
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1 transition rounded-lg hover:bg-zinc-800 flex-shrink-0"
                          title="Eliminar álbum o carpeta completa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-zinc-800 max-h-28 overflow-y-auto custom-scrollbar">
                    {albumTracks.map(t => (
                      <div key={t.id} className="flex items-center justify-between text-xs py-0.5 px-1 rounded-lg hover:bg-zinc-800 transition">
                        <span className="text-zinc-300 truncate max-w-[100px] text-[10px]">{t.title}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => playTrack(t, albumTracks)}
                            className="text-green-400 hover:text-green-300 font-bold text-[10px]"
                            title="Reproducir"
                          >
                            ▶
                          </button>
                          {!isDefaultAlbum && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar "${t.title}"?`)) deleteTrack(t.id);
                              }}
                              className="text-zinc-500 hover:text-red-400 text-[10px]"
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Añadir Canción de YouTube / YouTube Music</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Pega el enlace del video o canción de YouTube. Se reproducirá directamente y podrás asignarla a tu playlist inmediatamente.
            </p>
            <form onSubmit={handleAddSong} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Enlace de YouTube / YouTube Music (URL)</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={handleUrlChange}
                  placeholder="https://music.youtube.com/watch?v=..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Título de la canción</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. La Chona"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Artista / Grupo</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Ej. Los Tucanes"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Álbum / Disco (Opcional)</label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="Ej. Mis Éxitos"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {playlists.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Guardar directamente en Playlist (Opcional)</label>
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-green-500 text-xs sm:text-sm"
                  >
                    <option value="">-- No añadir a playlist por ahora --</option>
                    {playlists.map(pl => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-zinc-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-green-500/20"
                >
                  Guardar Canción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}