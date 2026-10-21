import React from 'react';
import { Play, Heart, Music } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function LikedView() {
  const { tracks, likedTracks, playTrack, toggleLikeTrack } = useMusic();

  const favoriteTracks = tracks.filter(t => likedTracks.includes(t.id));

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-8 rounded-3xl border border-red-500/20 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-red-600 to-pink-500 flex items-center justify-center text-white shadow-2xl flex-shrink-0">
            <Heart className="w-12 h-12 fill-current" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Colección Especial
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 tracking-tight">Tus Me Gusta</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">{favoriteTracks.length} canciones guardadas</p>
          </div>
        </div>

        {favoriteTracks.length > 0 && (
          <button
            onClick={() => playTrack(favoriteTracks[0], favoriteTracks)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-extrabold px-6 py-3 rounded-2xl transition shadow-xl shadow-red-500/20 text-sm"
          >
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
            Reproducir Todo
          </button>
        )}
      </div>

      <div>
        {favoriteTracks.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-12 text-center text-zinc-500 space-y-3">
            <Music className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-medium">Aún no tienes canciones favoritas.</p>
            <p className="text-xs text-zinc-600">Haz clic en el ícono de corazón ❤️ en cualquier canción para guardarla aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {favoriteTracks.map(track => (
              <div
                key={track.id}
                className="bg-zinc-900/80 border border-zinc-800/80 p-3 rounded-2xl hover:bg-zinc-800 transition duration-300 group relative flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-zinc-800 shadow-md">
                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <button
                      onClick={() => playTrack(track, favoriteTracks)}
                      className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300 hover:scale-105"
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
                      onClick={() => toggleLikeTrack(track.id)}
                      className="text-red-500 p-1 hover:scale-110 transition"
                      title="Quitar de favoritos"
                    >
                      <Heart className="w-4 h-4 fill-current" />
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
