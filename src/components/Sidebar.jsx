import React, { useState } from 'react';
import { Home, Search, Library, Plus, LogOut, X, Shield, Heart, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import ProfileModal from './ProfileModal';

export default function Sidebar({ currentView, setCurrentView, isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const { playlists, createPlaylist, likedTracks } = useMusic();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [theme, setTheme] = useState('green');

  const handleCreatePlaylist = () => {
    const name = prompt('Nombre de tu nueva playlist:');
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    if (onClose) onClose();
  };

  return (
    <>
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        currentTheme={theme}
        setTheme={setTheme}
      />

      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50
        w-64 bg-black flex flex-col h-screen border-r border-zinc-900 select-none flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        pb-28 md:pb-24
      `}>
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black shadow-lg shadow-green-500/25">
              🎵
            </div>
            <span className="text-white font-black text-xl tracking-tight">PlayMusic</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-4 space-y-1 flex-shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition ${
              currentView === 'home' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Home className="w-5 h-5" />
            Inicio
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition ${
              currentView === 'search' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>

          <button
            onClick={() => handleNavClick('liked')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition ${
              currentView === 'liked' ? 'bg-red-500/20 text-red-400 shadow-lg border border-red-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            Tus Me Gusta ({likedTracks.length})
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition ${
                currentView === 'admin' 
                  ? 'bg-green-500/20 text-green-400 shadow-lg border border-green-500/30' 
                  : 'text-green-400/80 hover:text-green-300 hover:bg-green-500/10'
              }`}
            >
              <Shield className="w-5 h-5" />
              Panel Admin
            </button>
          )}
        </div>

        <div className="mt-6 px-6 flex items-center justify-between text-zinc-400 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Library className="w-4 h-4" />
            Tus Playlist
          </div>
          <button
            onClick={handleCreatePlaylist}
            className="hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            title="Crear Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar min-h-0">
          {playlists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => handleNavClick({ type: 'playlist', id: playlist.id })}
              className="w-full text-left px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-semibold truncate transition"
            >
              {playlist.name}
            </button>
          ))}
        </div>

        <div className="mx-4 mb-4 p-3 border border-zinc-800 rounded-2xl bg-zinc-950 flex items-center justify-between gap-2 flex-shrink-0 shadow-lg">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2.5 truncate text-left hover:opacity-80 transition flex-1"
            title="Editar Perfil"
          >
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=demo'}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0"
            />
            <div className="truncate">
              <p className="text-white text-xs font-bold truncate flex items-center gap-1">
                {currentUser?.username || 'Usuario'}
                <Settings className="w-3 h-3 text-zinc-500 inline" />
              </p>
              <p className="text-zinc-500 text-[10px] truncate">{currentUser?.email}</p>
            </div>
          </button>
          <button
            onClick={() => {
              if (window.confirm('¿Deseas cerrar sesión?')) {
                logout();
              }
            }}
            className="flex items-center gap-1 px-2 py-1.5 bg-zinc-900 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 rounded-xl transition text-xs font-bold border border-zinc-800"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
