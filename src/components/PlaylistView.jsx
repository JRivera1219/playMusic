import React from 'react';
import { Play, Trash2, Music, Disc } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function PlaylistView({ playlistId }) {
  const { playlists, tracks, playTrack, removeTrackFromPlaylist, deletePlaylist } = useMusic();

  const playlist = playlists.find(p => p.id === playlistId);

  if (!playlist) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>Esta playlist ya no existe.</p>
      </div>
    );
  }

  const playlistTracks = tracks.filter(t => playlist.tracks.includes(t.id));

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800/80 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl flex-shrink-0">
            <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              Playlist Personal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 tracking-tight">{playlist.name}</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">{playlistTracks.length} canciones</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {playlistTracks.length > 0 && (
            <button
              onClick={() => playTrack(playlistTracks[0], playlistTracks)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-extrabold px-6 py-3 rounded-2xl transition shadow-xl shadow-green-500/20 text-sm"
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
              Reproducir Todo
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm(`¿Deseas eliminar la playlist "${playlist.name}"?`)) {
                deletePlaylist(playlist.id);
              }
            }}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 font-bold px-4 py-3 rounded-2xl border border-zinc-800 transition text-sm"
            title="Eliminar Playlist"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Playlist
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-white mb-4">Canciones en esta Playlist</h2>
        {playlistTracks.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-12 text-center text-zinc-500 space-y-3">
            <Music className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-medium">Esta playlist está vacía.</p>
            <p className="text-xs text-zinc-600">Añade canciones desde el catálogo en Inicio o Buscar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {playlistTracks.map(track => (
              <div
                key={track.id}
                className="bg-zinc-900/80 border border-zinc-800/80 p-3 rounded-2xl hover:bg-zinc-800 transition duration-300 group relative flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-zinc-800 shadow-md">
                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <button
                      onClick={() => playTrack(track, playlistTracks)}
                      className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300 hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate flex-1">
                      <h3 className="font-bold text-white text-sm truncate">{track.title}</h3>
                      <p className="text-zinc-400 text-xs mt-0.5 truncate font-medium">{track.artist}</p>
                    </div>
                    <button
                      onClick={() => removeTrackFromPlaylist(playlist.id, track.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition rounded-lg hover:bg-zinc-800"
                      title="Quitar de playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}