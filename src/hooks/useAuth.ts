import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
  /** false = credenziali Supabase assenti → app in modalità locale */
  configured: boolean;
};

/** Sessione Supabase + stato di caricamento. */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading, configured: isSupabaseConfigured };
}
