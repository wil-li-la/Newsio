import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }
      setSession(data.session ?? null);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setInitializing(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const signUp = async (email, password, options = {}) => {
    console.log('🚀 signUp called with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Mobile 使用 newsflow://，Web 應該使用完整的 callback URL
        emailRedirectTo: options.emailRedirectTo || 'newsflow://',
        ...options,
      },
    });
    
    if (error) {
      console.error('❌ signUp error:', error);
      throw error;
    }
    
    console.log('✅ signUp success:', data);
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      session,
      initializing,
      signIn,
      signUp,
      signOut,
    }),
    [session, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
