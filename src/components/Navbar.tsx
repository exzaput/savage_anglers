import { Link, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { Home, ShoppingBag, MessageSquare, User, LogOut, Fish, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/src/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavbarProps {
  session: Session | null;
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Navbar({ session, isDark, toggleTheme }: NavbarProps) {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Beranda' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Pasar' },
    { path: '/events', icon: Fish, label: 'Event' },
    { path: '/chat', icon: MessageSquare, label: 'Pesan' },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-primary">
            <Fish className="w-8 h-8" />
            <span>SAVAGE ANGLERS</span>
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full text-muted-foreground hover:text-primary"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={session.user.user_metadata.avatar_url} />
                      <AvatarFallback className="bg-muted text-primary">
                        {session.user.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Link to={`/profile/${session.user.id}`} className="flex items-center gap-2 w-full">
                      <User className="w-4 h-4" /> Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" className="bg-primary hover:bg-primary/90">
                <Link to="/auth">Masuk</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t px-6 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(14,165,233,0.1)]">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
          </Link>
        ))}
        
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          <span className="text-[10px] uppercase font-bold tracking-wider">Tema</span>
        </button>

        {session ? (
          <Link
            to={`/profile/${session.user.id}`}
            className={`flex flex-col items-center gap-1 ${
              location.pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Profil</span>
          </Link>
        ) : (
          <Link
            to="/auth"
            className={`flex flex-col items-center gap-1 ${
              location.pathname === '/auth' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Masuk</span>
          </Link>
        )}
      </nav>
    </>
  );
}
