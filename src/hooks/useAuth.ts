import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabase';
import { UserProfile } from '../types/database';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setError(null);
        
        // Check for existing session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (sessionError.message.includes('refresh_token_not_found') || 
              sessionError.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
            if (mounted) {
              setUser(null);
              setProfile(null);
              setError('Sessão expirada. Faça login novamente.');
            }
            return;
          }
        }

        if (session?.user) {
          if (mounted) {
            setUser(session.user);
            try {
              const userProfile = await getUserProfile(session.user.id);
              if (mounted) {
                setProfile(userProfile);
              }
            } catch (profileError) {
              console.error('Error loading profile:', profileError);
              if (mounted) {
                setError('Erro ao carregar perfil do usuário.');
              }
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Erro ao inicializar autenticação. Faça login novamente.');
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        setError(null);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          try {
            const userProfile = await getUserProfile(session.user.id);
            setProfile(userProfile);
          } catch (error) {
            console.error('Error getting user profile:', error);
            if (error instanceof Error && 
                (error.message.includes('refresh_token_not_found') || 
                 error.message.includes('Invalid Refresh Token'))) {
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setError('Sessão expirada. Faça login novamente.');
            } else {
              setError('Erro ao carregar perfil do usuário.');
              setProfile(null);
            }
          }
        } else if (session?.user) {
          setUser(session.user);
          try {
            const userProfile = await getUserProfile(session.user.id);
            setProfile(userProfile);
          } catch (error) {
            console.error('Error getting user profile:', error);
            setError('Erro ao carregar perfil do usuário.');
            setProfile(null);
          }
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Handle sign in or user update
          setUser(session?.user ?? null);
          if (session?.user) {
            try {
              const userProfile = await getUserProfile(session.user.id);
              setProfile(userProfile);
            } catch (error) {
              console.error('Error getting user profile:', error);
              setError('Erro ao carregar perfil do usuário.');
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
        } else if (!session) {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading, error, sessionChecked };
};