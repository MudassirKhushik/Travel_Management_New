// pages/auth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    console.log('User state:', user);
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // DEMO LOGIN - Static credentials, bypasses Supabase
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Static demo credentials
      const DEMO_EMAIL = 'Demo@gmail.com';
      const DEMO_PASSWORD = '123456';
      
      // First, try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (error) {
        // If Supabase login fails, create a mock session
        console.log('Supabase login failed, using mock session');
        
        // Create a mock user object
        const mockUser = {
          id: 'demo-user-123',
          email: DEMO_EMAIL,
          user_metadata: {
            full_name: 'Demo User'
          }
        };
        
        // Store in localStorage to persist across page reloads
        localStorage.setItem('demo_session', JSON.stringify(mockUser));
        
        setMessage('Demo login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
        return;
      }

      if (data.user) {
        setMessage('Login successful! Redirecting...');
        router.push('/dashboard');
      } else {
        throw new Error('No user data returned after login');
      }
    } catch (err) {
      setError('Demo login failed. Please try regular login or register.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setMessage('Login successful! Redirecting...');
          router.push('/dashboard');
        } else {
          throw new Error('No user data returned after login');
        }

      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) throw error;

        setMessage('Registration successful! Please check your email to verify your account.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    } catch (err) {
      if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLogout = async () => {
    try {
      // Clear demo session if exists
      localStorage.removeItem('demo_session');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage('Logged out successfully.');
      window.location.reload();
    } catch (err) {
      setError('Error logging out: ' + err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication service...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{isLogin ? 'Login' : 'Register'} | Travel Craft</title>
        <meta name="description" content="Travel Craft Admin Portal" />
      </Head>
      
      <div className="min-h-screen flex bg-gray-50">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-red-800 items-center justify-center p-12">
          <div className="max-w-md text-center text-white">
            <h1 className="text-5xl font-bold mb-6">TRAVEL CRAFT</h1>
            <p className="text-xl opacity-90">Premium Travel Management System</p>
            <p className="mt-4 opacity-80">Admin Portal</p>
          </div>
        </div>
        
        {/* Right Panel - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-4xl font-bold text-red-600">Travel Craft</h1>
              <p className="text-gray-600 mt-2">Admin Portal</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <img
                src="/images/LOGO.jpg"
                alt="Travel Craft Logo"
                width={400}
                height={100}
                className="mr-3 object-contain"
              />
              <br/>
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`flex-1 py-3 font-semibold ${isLogin ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-3 font-semibold ${!isLogin ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </div>
              
              <form onSubmit={handleAuth} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading 
                    ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                    : (isLogin ? 'Sign In' : 'Create Account')}
                </button>

                {/* DEMO LOGIN SECTION */}
                {isLogin && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Quick Demo</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                    >
                      🚀 Try Demo Account
                    </button>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-700 font-medium">
                        📧 Demo@gmail.com
                      </p>
                      <p className="text-xs text-green-600">
                        🔑 Password: 123456
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        ⚡ No database setup required
                      </p>
                    </div>
                  </>
                )}
                
                {user && (
                  <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center">
                    <p>You're already logged in.</p>
                    <button 
                      onClick={handleManualLogout}
                      className="text-red-600 font-semibold hover:underline mt-2"
                    >
                      Click here to logout
                    </button>
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center">
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center">
                    {message}
                  </div>
                )}
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                {isLogin ? (
                  <p>
                    Don't have an account?{' '}
                    <button 
                      className="text-red-600 font-semibold hover:underline"
                      onClick={() => setIsLogin(false)}
                    >
                      Register here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button 
                      className="text-red-600 font-semibold hover:underline"
                      onClick={() => setIsLogin(true)}
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}