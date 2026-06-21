import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase, type Session } from './supabase';

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (!supabase) return;
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (signInError) setError(signInError.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  }, []);

  return {
    session,
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    signInWithGitHub,
    signOut,
  };
}
