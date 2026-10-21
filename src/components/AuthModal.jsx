import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function AuthModal() {
  const { login, register, resetPassword } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isForgot) {
        await resetPassword(email);
        setSuccessMsg('¡Correo de recuperación enviado! Revisa tu bandeja de entrada.');
      } else if (isRegister) {
        if (!username.trim()) {
          setErrorMsg('Por favor ingresa un nombre de usuario.');
          setLoading(false);
          return;
        }
        await register(email, password, username);
        setSuccessMsg('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsRegister(false);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50 font-sans select-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-green-950/20 via-black to-zinc-950 pointer-events-none" />

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-2xl mx-auto shadow-lg shadow-green-500/25">
            🎵
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PlayMusic</h1>
          <p className="text-zinc-400 text-xs">
            {isForgot ? 'Recupera tu contraseña' : isRegister ? 'Crea tu cuenta con Supabase' : 'Inicia sesión en tu reproductor'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-2xl font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs p-3 rounded-2xl font-semibold text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && !isForgot && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nombre de Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-sm"
                required
              />
            </div>
          </div>

          {!isForgot && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 text-sm"
                  required
                />
              </div>
            </div>
          )}

          {!isRegister && !isForgot && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgot(true)}
                className="text-xs text-zinc-400 hover:text-green-400 font-semibold transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-extrabold py-3 rounded-2xl transition shadow-lg shadow-green-500/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isForgot ? 'Enviar enlace de recuperación' : isRegister ? 'Registrarse' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800">
          {isForgot ? (
            <button
              onClick={() => { setIsForgot(false); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-xs text-zinc-400 hover:text-white font-semibold transition"
            >
              ← Volver al inicio de sesión
            </button>
          ) : (
            <button
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-xs text-zinc-400 hover:text-white font-semibold transition"
            >
              {isRegister ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}