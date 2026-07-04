// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      // Check for demo session first
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        try {
          const demoUser = JSON.parse(demoSession);
          setUser(demoUser);
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('demo_session');
        }
      }

      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      // Only update if not demo session
      if (!localStorage.getItem('demo_session')) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading };
};