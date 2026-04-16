import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { MarketplaceItem, MarketplaceCategory } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  ShoppingBag, 
  Plus, 
  MessageSquare, 
  Heart,
  ChevronDown,
  Tag,
  Navigation
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import CreateMarketItemDialog from '@/src/components/CreateMarketItemDialog';

interface MarketplaceProps {
  session: Session | null;
}

export default function Marketplace({ session }: MarketplaceProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory | 'All'>('All');
  const [radius, setRadius] = useState<number>(25);
  const [sortBy, setSortBy] = useState<'latest' | 'cheapest' | 'nearest'>('latest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase
      .from('marketplace_items')
      .select('*, profiles(*)');

    if (category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (sortBy === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'cheapest') {
      query = query.order('price', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Gagal mengambil data pasar');
    } else {
      let filteredItems = data || [];

      // Radius filtering (client-side for simplicity in this demo)
      if (sortBy === 'nearest' && userLocation) {
        filteredItems = filteredItems
          .filter(item => {
            if (!item.latitude || !item.longitude) return false;
            const dist = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              item.latitude,
              item.longitude
            );
            return dist <= radius;
          })
          .sort((a, b) => {
            const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude!, a.longitude!);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude!, b.longitude!);
            return distA - distB;
          });
      } else if (userLocation && radius < 100) {
        // Apply radius filter even if not sorting by nearest
        filteredItems = filteredItems.filter(item => {
          if (!item.latitude || !item.longitude) return true; // Keep items without location if not sorting by nearest?
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            item.latitude,
            item.longitude
          );
          return dist <= radius;
        });
      }

      setItems(filteredItems);
    }
    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback to profile location if available
          if (session?.user.id) {
            supabase.from('profiles').select('latitude, longitude').eq('id', session.user.id).single()
              .then(({ data }) => {
                if (data?.latitude && data?.longitude) {
                  setUserLocation({ lat: data.latitude, lng: data.longitude });
                }
              });
          }
        }
      );
    }
  }, [session]);

  useEffect(() => {
    fetchItems();
  }, [category, sortBy, radius, userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="space-y-8">
      {/* Featured Gear Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-sky-600 via-blue-500 to-teal-600 p-8 md:p-12 border-4 border-white shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <ShoppingBag className="w-64 h-64 rotate-12 text-white" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge className="bg-white text-sky-600 border-none font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">UNGGULAN MINGGU INI</Badge>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-none drop-shadow-lg">SHIMANO STELLA <br/> SW 8000HG</h2>
            <p className="text-white text-lg max-w-md font-bold leading-relaxed drop-shadow-md">
              Reel legendaris untuk pertarungan monster laut dalam. Teknologi terbaru Infinity Drive untuk kekuatan tanpa batas! 🌊
            </p>
            <div className="flex items-center gap-6">
              <div className="text-4xl font-black text-white drop-shadow-xl">Rp 12.500.000</div>
              <Button className="bg-white text-sky-600 hover:bg-sky-50 font-black px-10 h-14 rounded-2xl uppercase tracking-widest shadow-xl transition-transform active:scale-95">
                LIHAT DETAIL
              </Button>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border-4 border-white/10 shadow-2xl group">
            <img 
              src="https://images.unsplash.com/photo-1611095773767-1160d3a87588?q=80&w=2070&auto=format&fit=crop" 
              alt="Featured Reel" 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-primary flex items-center gap-3">
            <ShoppingBag className="w-10 h-10" /> PASAR ALAT
          </h1>
          <p className="text-muted-foreground font-medium">Jual beli alat pancing profesional.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari alat..." 
              className="pl-10 bg-card border-2 border-border focus:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2 font-bold"
            onClick={() => session ? setIsCreateOpen(true) : toast.error('Silakan masuk untuk menjual alat')}
          >
            <Plus className="w-4 h-4" /> JUAL ALAT
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-border bg-background">
                <Tag className="w-4 h-4 text-primary" />
                {category === 'All' ? 'Semua Kategori' : category}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Kategori</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCategory('All')}>Semua Alat</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Joran')}>Joran (Rods)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Reel')}>Reel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Senar')}>Senar (Lines)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Umpan')}>Umpan (Lures)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategory('Aksesoris')}>Aksesoris</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-border bg-background">
                <Navigation className="w-4 h-4 text-secondary" />
                Radius: {radius}km
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Radius Pencarian</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[5, 10, 25, 50, 100].map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setRadius(r)}>{r}km</DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-border bg-background">
                <Filter className="w-4 h-4 text-muted-foreground" />
                Urutkan: {sortBy === 'latest' ? 'Terbaru' : sortBy === 'cheapest' ? 'Termurah' : 'Terdekat'}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Urutkan Berdasarkan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('latest')}>Terbaru</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('cheapest')}>Termurah</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('nearest')}>Terdekat</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Menampilkan {items.length} alat
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <Card key={`market-skeleton-${i}`} className="rugged-card h-80 animate-pulse bg-muted/20"></Card>
          ))
        ) : items.length > 0 ? (
          items.map((item, i) => (
            <Card key={`${item.id}-${i}`} className="rugged-card group overflow-hidden flex flex-col border-2 border-border/50 hover:border-primary/50 transition-all duration-300">
              <div className="relative aspect-square bg-muted overflow-hidden">
                <img 
                  src={item.image_url || 'https://picsum.photos/seed/fishing/400/400'} 
                  alt={item.title} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <Badge className="bg-primary/90 text-white border-none font-black text-[10px] uppercase tracking-tighter rounded-sm">
                    {item.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-none font-black text-[8px] uppercase tracking-widest rounded-sm">
                    KONDISI: BARU
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                    <Navigation className="w-3 h-3 text-secondary" /> {item.location_name || 'LOKASI MISTERIUS'}
                  </div>
                </div>
              </div>
              <CardHeader className="p-4 space-y-2">
                <CardTitle className="text-base font-black uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Rp</span>
                  <span className="text-2xl font-black text-primary font-mono tracking-tighter">
                    {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <p className="text-xs text-muted-foreground line-clamp-2 font-medium leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90 gap-2 font-black text-[10px] uppercase tracking-widest h-10 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <MessageSquare className="w-3 h-3" /> HUBUNGI
                </Button>
                <Button variant="outline" size="icon" className="border-border h-10 w-10 rounded-sm hover:bg-muted">
                  <Heart className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-32 bg-card rounded-2xl border-2 border-dashed border-border">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground font-mono uppercase tracking-widest">Tidak ada alat ditemukan di sektor ini.</p>
          </div>
        )}
      </div>

      <CreateMarketItemDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        userId={session?.user.id}
        onSuccess={fetchItems}
      />
    </div>
  );
}
