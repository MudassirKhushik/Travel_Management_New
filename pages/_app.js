// pages/_app.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // If user is authenticated and on auth page, redirect to dashboard
      if (session && router.pathname === '/auth') {
        router.push('/dashboard');
      }
      
      // If no user and trying to access protected route, redirect to auth
      if (!session && router.pathname !== '/auth' && router.pathname !== '/login') {
        router.push('/auth');
      }
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          router.push('/dashboard');
        }
        
        if (event === 'SIGNED_OUT') {
          router.push('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Travel Craft Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          {`
            /* Fallback styles while Tailwind loads */
            body { 
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              line-height: 1.5;
            }
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </Head>
      <Component {...pageProps} user={user} />
    </>
  );
}