import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import PlaylistView from './components/PlaylistView';
import AdminDashboard from './components/AdminDashboard';
import LikedView from './components/LikedView';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { Menu } from 'lucide-react';

export default function App() {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-bold">Cargando datos de Supabase...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-zinc-950 border-b border-zinc-900 px-4 py-3 flex items-center justify-between flex-shrink-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-zinc-300 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎵</span>
            <span className="font-black text-white text-base">PlayMusic</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {currentView === 'home' && <HomeView />}
          {currentView === 'search' && <SearchView />}
          {currentView === 'liked' && <LikedView />}
          {currentView === 'admin' && <AdminDashboard />}
          {typeof currentView === 'object' && currentView.type === 'playlist' && (
            <PlaylistView playlistId={currentView.id} />
          )}
        </main>
      </div>

      <Player />
    </div>
  );
}
