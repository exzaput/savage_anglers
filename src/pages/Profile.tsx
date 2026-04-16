import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Profile as ProfileType, Post, MarketplaceItem, UserGear, UserFavoriteSpot } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Trophy, Settings, MessageSquare, Fish, ShoppingBag, Edit, Anchor, Map as MapIcon, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PostCard from '@/src/components/PostCard';
import { Badge } from '@/components/ui/badge';
import EditProfileDialog from '@/src/components/EditProfileDialog';
import CreateGearDialog from '@/src/components/CreateGearDialog';
import CreateSpotDialog from '@/src/components/CreateSpotDialog';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ProfileProps {
  session: Session | null;
}

export default function Profile({ session }: ProfileProps) {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [gear, setGear] = useState<UserGear[]>([]);
  const [spots, setSpots] = useState<UserFavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isGearOpen, setIsGearOpen] = useState(false);
  const [isSpotOpen, setIsSpotOpen] = useState(false);
  const isOwnProfile = session?.user.id === id;

  const fetchProfileData = async () => {
    if (!id) return;
    setLoading(true);

    // Fetch Profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      toast.error('Profil tidak ditemukan');
    } else {
      setProfile(profileData);
    }

    // Fetch Posts
    const { data: postData } = await supabase
      .from('posts')
      .select('*, profiles(*), fishing_spots(*), gear_setups(*), likes(user_id), comments(id)')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    setPosts(postData || []);

    // Fetch Marketplace Items
    const { data: itemData } = await supabase
      .from('marketplace_items')
      .select('*, profiles(*)')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    setItems(itemData || []);

    // Fetch User Gear
    const { data: gearData } = await supabase
      .from('user_gear')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    
    setGear(gearData || []);

    // Fetch Favorite Spots
    const { data: spotData } = await supabase
      .from('user_favorite_spots')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    
    setSpots(spotData || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse font-mono text-primary">MEMUAT PROFIL...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Angler tidak ditemukan.</h2>
        <Button variant="link" className="mt-4">
          <Link to="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="rugged-card overflow-hidden border-none shadow-2xl rounded-[40px]">
        <div className="h-64 relative bg-muted">
          {profile.cover_url ? (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-400 via-blue-500 to-teal-600"></div>
          )}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-6 right-6 flex gap-3">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
              RANK #42
            </Badge>
            <Badge className="bg-teal-400/30 backdrop-blur-md text-teal-100 border-teal-400/40 font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
              VERIFIED ANGLER
            </Badge>
          </div>
        </div>
        
        <CardContent className="relative pt-0 pb-8 px-8 text-center md:text-left md:flex md:items-end md:gap-8 -mt-20">
          <div className="relative inline-block mx-auto md:mx-0">
            <Avatar className="h-40 w-40 border-8 border-background shadow-2xl rounded-sm">
              <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
              <AvatarFallback className="bg-muted text-primary text-4xl font-black rounded-none">
                {profile.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-sm shadow-lg border-2 border-background">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          
          <div className="flex-1 space-y-3 mt-6 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-5xl font-black tracking-tighter uppercase">{profile.username}</h1>
              <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-primary text-white border-none font-black uppercase tracking-widest text-xs px-3 py-1 rounded-sm">
                LEVEL: {profile.experience_level === 'beginner' ? 'PEMULA' : profile.experience_level === 'intermediate' ? 'MENENGAH' : 'PRO'}
              </Badge>
            </div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">{profile.full_name}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs text-muted-foreground font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> {profile.location || 'PERAIRAN MISTERIUS'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> BERGABUNG APRIL 2024
              </div>
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-primary" /> {profile.fishing_style === 'freshwater' ? 'AIR TAWAR' : profile.fishing_style === 'saltwater' ? 'AIR LAUT' : 'SEMUA MEDAN'}
              </div>
            </div>
          </div>

          <div className="pt-8 md:pt-0 flex gap-3 justify-center">
            {isOwnProfile ? (
              <Button 
                onClick={() => setIsEditOpen(true)}
                className="bg-primary hover:bg-primary/90 gap-2 font-black uppercase tracking-widest h-12 px-8 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
              >
                <Edit className="w-4 h-4" /> EDIT PROFIL
              </Button>
            ) : (
              <>
                <Button className="bg-primary hover:bg-primary/90 gap-2 font-black uppercase tracking-widest h-12 px-8 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                  <MessageSquare className="w-4 h-4" /> PESAN
                </Button>
                <Button variant="outline" className="border-2 border-border font-black uppercase tracking-widest h-12 px-8 rounded-sm hover:bg-muted">IKUTI</Button>
              </>
            )}
          </div>
        </CardContent>
        
        <div className="px-8 pb-8 border-t border-border/30 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-3">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">BIOGRAFI ANGLER</h3>
              <p className="text-sm leading-relaxed text-muted-foreground font-medium italic">
                "{profile.bio || "Angler ini belum membagikan ceritanya. Mungkin terlalu sibuk menarik monster dari kedalaman."}"
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-sm border border-border/50">
                <div className="text-2xl font-black text-primary font-mono">156</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">SUKA</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-sm border border-border/50">
                <div className="text-2xl font-black text-secondary font-mono">42</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">PENGIKUT</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-muted/30 p-1 border-b rounded-none justify-start h-12 overflow-x-auto flex-nowrap">
          <TabsTrigger value="posts" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Fish className="w-4 h-4" /> Tangkapan ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="gear" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Package className="w-4 h-4" /> Kelengkapan ({gear.length})
          </TabsTrigger>
          <TabsTrigger value="spots" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
            <MapIcon className="w-4 h-4" /> Spot Favorit ({spots.length})
          </TabsTrigger>
          <TabsTrigger value="market" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
            <ShoppingBag className="w-4 h-4" /> Pasar ({items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="pt-6 space-y-6">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <PostCard key={`${post.id}-${i}`} post={post} currentUser={session?.user} />
            ))
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border-2 border-dashed border-border">
              <p className="text-muted-foreground font-mono uppercase tracking-widest">Belum ada tangkapan yang dibagikan.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gear" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {gear.length > 0 ? (
              gear.map((g) => (
                <Card key={g.id} className="rugged-card overflow-hidden flex flex-col border-2 border-border/50">
                  <div className="aspect-video bg-muted relative">
                    {g.image_url ? (
                      <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-black uppercase tracking-tight text-lg">{g.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{g.description}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-card rounded-xl border-2 border-dashed border-border">
                <p className="text-muted-foreground font-mono uppercase tracking-widest">Belum ada kelengkapan yang ditambahkan.</p>
                {isOwnProfile && <Button onClick={() => setIsGearOpen(true)} variant="outline" className="mt-4 gap-2 font-black uppercase tracking-widest text-[10px]"><Plus className="w-3 h-3" /> Tambah Alat</Button>}
              </div>
            )}
          </div>
          {isOwnProfile && gear.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={() => setIsGearOpen(true)} className="rugged-btn gap-2">
                <Plus className="w-4 h-4" /> TAMBAH ALAT LAGI
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="spots" className="pt-6 space-y-6">
          {spots.length > 0 ? (
            <>
              <div className="h-[400px] w-full rounded-2xl overflow-hidden border-4 border-primary shadow-xl z-0">
                <MapContainer center={[spots[0].latitude, spots[0].longitude]} zoom={10} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {spots.map((spot) => (
                    <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-black uppercase text-sm">{spot.name}</h4>
                          <p className="text-xs text-muted-foreground">{spot.description}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {spots.map((spot) => (
                  <Card key={spot.id} className="rugged-card p-4 border-2 border-border/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black uppercase tracking-tight">{spot.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{spot.description}</p>
                      </div>
                      <Badge variant="outline" className="font-mono text-[8px]">{spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border-2 border-dashed border-border">
              <p className="text-muted-foreground font-mono uppercase tracking-widest">Belum ada spot favorit yang ditandai.</p>
              {isOwnProfile && <Button onClick={() => setIsSpotOpen(true)} variant="outline" className="mt-4 gap-2 font-black uppercase tracking-widest text-[10px]"><Plus className="w-3 h-3" /> Tandai Spot</Button>}
            </div>
          )}
          {isOwnProfile && spots.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={() => setIsSpotOpen(true)} className="rugged-btn gap-2">
                <Plus className="w-4 h-4" /> TANDAI SPOT BARU
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="market" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {items.length > 0 ? (
              items.map((item, i) => (
                <Card key={`${item.id}-${i}`} className="rugged-card group overflow-hidden flex flex-col border-2 border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img src={item.image_url || ''} alt={item.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <Badge className="absolute top-3 left-3 bg-primary/90 text-white border-none font-black text-[10px] uppercase tracking-tighter rounded-sm">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5 flex-1">
                    <h3 className="font-black uppercase tracking-tight text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="text-2xl font-black text-primary font-mono tracking-tighter">
                      Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </CardContent>
                  <div className="p-5 pt-0">
                    <Button className="w-full bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest h-10 rounded-sm">
                      LIHAT DETAIL
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-card rounded-xl border-2 border-dashed border-border">
                <p className="text-muted-foreground font-mono uppercase tracking-widest">Belum ada alat yang dijual.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {profile && (
        <>
          <EditProfileDialog 
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            profile={profile}
            onSuccess={fetchProfileData}
          />
          <CreateGearDialog 
            isOpen={isGearOpen}
            onClose={() => setIsGearOpen(false)}
            userId={session?.user.id}
            onSuccess={fetchProfileData}
          />
          <CreateSpotDialog 
            isOpen={isSpotOpen}
            onClose={() => setIsSpotOpen(false)}
            userId={session?.user.id}
            onSuccess={fetchProfileData}
          />
        </>
      )}
    </div>
  );
}
