import React, { useState } from 'react';
import { Search as SearchIcon, Play, Plus, Check } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function SearchView() {
  const { tracks, playTrack, playlists, addTrackToPlaylist } = useMusic();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="relative max-w-xl">
        <SearchIcon className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="¿Qué quieres escuchar hoy? (Canción, artista, álbum)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-sm font-medium shadow-lg"
        />
      </div>

      <div>
        <h2 className="text-xl font-black text-white mb-4">
          {searchTerm ? `Resultados para "${searchTerm}"` : 'Explora tus canciones'}
        </h2>
        
        {filteredTracks.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">No se encontraron canciones que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredTracks.map(track => (
              <div
                key={track.id}
                className="bg-zinc-900/80 border border-zinc-800/80 p-3 rounded-2xl hover:bg-zinc-800 transition duration-300 group relative flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-zinc-800 shadow-md">
                    <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <button
                      onClick={() => playTrack(track, filteredTracks)}
                      className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300 hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{track.title}</h3>
                  <p className="text-zinc-400 text-xs mt-0.5 truncate font-medium">{track.artist}</p>
                  <p className="text-zinc-500 text-[10px] truncate mt-0.5">{track.album}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}