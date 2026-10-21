import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Palette, X, Check, Camera } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, currentTheme, setTheme }) {
  const { currentUser, updateUserProfile } = useAuth();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const themes = [
    { id: 'green', name: 'Esmeralda (Spotify)', color: 'bg-green-500', border: 'border-green-500', text: 'text-green-400' },
    { id: 'purple', name: 'Cyberpunk Morado', color: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400' },
    { id: 'blue', name: 'Azul Neón', color: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' },
    { id: 'red', name: 'Rojo Fuego', color: 'bg-red-500', border: 'border-red-500', text: 'text-red-400' },
    { id: 'amber', name: 'Dorado Cálido', color: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400' }
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (updateUserProfile) {
        await updateUserProfile(username, avatarUrl);
      }
      setMessage('¡Perfil actualizado correctamente!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setMessage('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Ajustes de Perfil y Apariencia</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-2xl text-center font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 shadow-xl">
              <img src={avatarUrl || currentUser?.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => {
                const seed = Math.random().toString(36).substring(7);
                setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
              }}
              className="text-xs text-green-400 hover:underline flex items-center gap-1 font-bold"
            >
              <Camera className="w-3.5 h-3.5" />
              Generar Nuevo Avatar
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-green-400" />
              Tema de Color de la Aplicación
            </label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition ${
                    currentTheme === t.id ? `${t.border} bg-zinc-800 text-white` : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full ${t.color}`} />
                    {t.name}
                  </div>
                  {currentTheme === t.id && <Check className="w-4 h-4 text-green-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-2xl transition shadow-lg shadow-green-500/20"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
