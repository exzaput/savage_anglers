import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Toaster } from 'sonner';

// Pages
import Home from '@/src/pages/Home';
import Marketplace from '@/src/pages/Marketplace';
import Profile from '@/src/pages/Profile';
import Chat from '@/src/pages/Chat';
import Events from '@/src/pages/Events';
import Auth from '@/src/pages/Auth';
import Navbar from '@/src/components/Navbar';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if supabase is a proxy that will throw (i.e., not configured)
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } catch (e) {
      console.error('Supabase initialization failed:', e);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary">
        <div className="animate-pulse font-black text-2xl tracking-widest">🌊 MENYELAMI LAUTAN...</div>
      </div>
    );
  }

  // Check if Supabase is configured by trying to access a property
  let isConfigured = true;
  try {
    // This will trigger the Proxy's throw if not configured
    const _ = supabase.auth;
  } catch (e) {
    isConfigured = false;
  }

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
        <div className="bg-card rugged-card p-8 max-w-md space-y-6">
          <div className="bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <span className="text-4xl">⚓</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-primary">KONFIGURASI DIPERLUKAN</h1>
          <p className="text-muted-foreground">
            Untuk memulai perjalanan memancing Anda, Anda perlu menghubungkan proyek Supabase Anda.
          </p>
          <div className="text-left bg-muted p-4 rounded-lg font-mono text-xs space-y-2 overflow-x-auto">
            <p className="text-primary font-bold">// Tambahkan ini ke file .env Anda:</p>
            <p>VITE_SUPABASE_URL=url_proyek_anda</p>
            <p>VITE_SUPABASE_ANON_KEY=anon_key_anda</p>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Lihat file <span className="font-bold">SUPABASE_SETUP.md</span> untuk skema database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppLayout session={session} />
    </Router>
  );
}

function AppLayout({ session }: { session: Session | null }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar session={session} isDark={isDark} toggleTheme={toggleTheme} />
      <main className={`flex-1 flex flex-col ${isAuthPage ? '' : 'container mx-auto px-4 py-6 pb-24 md:pb-6'}`}>
        <Routes>
          <Route path="/" element={<Home session={session} />} />
          <Route path="/marketplace" element={<Marketplace session={session} />} />
          <Route path="/events" element={<Events session={session} />} />
          <Route path="/profile/:id" element={<Profile session={session} />} />
          <Route path="/chat" element={session ? <Chat session={session} /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        </Routes>
      </main>
      <Toaster position="top-center" theme={isDark ? 'dark' : 'light'} richColors />
    </div>
  );
}
