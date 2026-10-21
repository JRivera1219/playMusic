import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          username: data.username || user.user_metadata?.username || 'Usuario',
          role: data.role || 'user',
          avatar: data.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.email
        });
      } else {
        const newProfile = {
          id: user.id,
          username: user.user_metadata?.username || 'Usuario',
          email: user.email,
          role: 'user',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.email
        };

        await supabase.from('profiles').insert([newProfile]);
        setCurrentUser({
          id: user.id,
          email: user.email,
          username: newProfile.username,
          role: newProfile.role,
          avatar: newProfile.avatar_url
        });
      }
    } catch (e) {
      setCurrentUser({
        id: user.id,
        email: user.email,
        username: 'Usuario',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.email
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (username, avatarUrl) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({ username, avatar_url: avatarUrl })
      .eq('id', currentUser.id);

    if (error) throw error;
    setCurrentUser(prev => ({ ...prev, username, avatar: avatarUrl }));
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsersList(data || []);
    } catch (e) {
      console.error("Error fetching users list", e);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) throw error;
    fetchAllUsers();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      register,
      resetPassword,
      logout,
      usersList,
      fetchAllUsers,
      updateUserRole,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
