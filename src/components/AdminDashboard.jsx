import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { Users, Shield, RefreshCw, Key, Disc, Music, ListMusic, TrendingUp, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, usersList, fetchAllUsers, updateUserRole, resetPassword } = useAuth();
  const { tracks, playlists } = useMusic();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAllUsers();
    }
  }, [currentUser]);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-zinc-400">
        <h2 className="text-xl font-bold text-white mb-2">Acceso Restringido</h2>
        <p>No tienes permisos de Administrador para ver este panel.</p>
      </div>
    );
  }

  const handleReset = async (email) => {
    try {
      await resetPassword(email);
      alert(`Correo de recuperación enviado a ${email}`);
    } catch (e) {
      alert('Error al enviar correo: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-2xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Panel de Administrador (Analytics & Usuarios)
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Supervisa el estado global del sistema, estadísticas de la plataforma y usuarios registrados.
          </p>
        </div>
        <button
          onClick={fetchAllUsers}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2.5 rounded-2xl transition text-xs shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar Datos
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 p-5 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Usuarios Totales</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{usersList.length}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 p-5 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Canciones en Nube</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{tracks.length}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 p-5 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Playlists Creadas</p>
            <h3 className="text-2xl font-black text-white mt-0.5">{playlists.length}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 p-5 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Estado Sistema</p>
            <h3 className="text-sm font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              100% Sincronizado
            </h3>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <h2 className="text-base font-bold text-white">Gestión de Cuentas Registradas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4 text-right">Acciones Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.email} alt="Avatar" className="w-8 h-8 rounded-full bg-zinc-800" />
                    <span className="font-bold text-white">{u.username || 'Sin Nombre'}</span>
                  </td>
                  <td className="p-4 text-zinc-300">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      u.role === 'admin' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition text-xs"
                    >
                      {u.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                    </button>
                    <button
                      onClick={() => handleReset(u.email)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-green-400 rounded-xl font-bold transition text-xs inline-flex items-center gap-1"
                      title="Enviar link de restablecimiento"
                    >
                      <Key className="w-3.5 h-3.5" />
                      Reset Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
