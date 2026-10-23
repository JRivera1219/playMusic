import React, { useState, useEffect } from 'react';
import { Search, Play, Plus, Check, Disc } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function GlobalSearch() {
  const { searchGlobalMusic, playTrack, addMultipleTracks } = useMusic();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState([]);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      if (typeof searchGlobalMusic === 'function') {
        const data = await searchGlobalMusic(query);
        setResults(data || []);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, searchGlobalMusic]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    if (typeof searchGlobalMusic === 'function') {
      const data = await searchGlobalMusic(query);
      setResults(data || []);
    }
    setLoading(false);
  };

  const handleAddTrack = async (track) => {
    if (typeof addMultipleTracks === 'function') {
      await addMultipleTracks([{
        title: track.title,
        artist: track.artist,
        album: track.album || 'YouTube Music',
        duration: track.duration || '3:30', // <--- Se manda la duración
        cover: track.cover,
        audioUrl: track.audioUrl || null,
        youtubeId: track.youtubeId || null,
        isAudioFile: track.isAudioFile ?? false
      }]);
      setAddedIds(prev => [...prev, track.id]);
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Formulario de Búsqueda */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar artistas, canciones o álbumes (ej. Chalino Sánchez)..."
          className="w-full bg-zinc-900 text-white placeholder-zinc-500 pl-11 pr-28 py-3.5 rounded-2xl border border-zinc-800 focus:outline-none focus:border-green-500 transition shadow-inner"
        />
        <Search className="w-5 h-5 text-zinc-400 absolute left-4" />
        <button
          type="submit"
          className="absolute right-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
        >
          {loading ? <Disc className="w-4 h-4 animate-spin" /> : "Buscar"}
        </button>
      </form>

      {/* Resultados de Búsqueda */}
      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((track) => {
            const isAdded = addedIds.includes(track.id);
            return (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/80 rounded-xl transition border border-zinc-800/50 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="truncate">
                    <h4 className="text-white font-bold text-sm truncate">{track.title}</h4>
                    <p className="text-xs text-zinc-400 truncate">{track.artist} • {track.album}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => playTrack(track, results)}
                    className="p-2.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black rounded-full transition"
                    title="Reproducir"
                  >
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </button>
                  <button
                    onClick={() => handleAddTrack(track)}
                    disabled={isAdded}
                    className={`p-2.5 rounded-full transition ${
                      isAdded ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                    title={isAdded ? "Agregada a tu biblioteca" : "Agregar a mi biblioteca"}
                  >
                    {isAdded ? <Check className="w-4 h-4 text-green-400" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          query.trim() && !loading && (
            <p className="text-center text-zinc-500 text-sm py-8">
              No se encontraron canciones que coincidan con "{query}".
            </p>
          )
        )}
      </div>
    </div>
  );
}