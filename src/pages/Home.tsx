import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Post, Profile } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Image as ImageIcon, MapPin, Settings2, Fish, Trophy, Anchor, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import PostCard from '@/src/components/PostCard';
import CreatePostDialog from '@/src/components/CreatePostDialog';

interface HomeProps {
  session: Session | null;
}

export default function Home({ session }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState<'latest' | 'popular'>('latest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles (*),
        fishing_spots (*),
        gear_setups (*),
        likes (user_id),
        comments (id)
      `);

    if (filter === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Gagal mengambil postingan');
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const seedDemoData = async () => {
    if (!session?.user) {
      toast.error('Silakan masuk untuk mengisi data demo');
      return;
    }
    setSeeding(true);
    try {
      const demoPosts = [
        {
          user_id: session.user.id,
          content: 'Strike Toman monster di rawa Sumatera! Tarikannya luar biasa, joran hampir patah. #SavageAnglers #Toman #Sumatera',
          image_url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1000&auto=format&fit=crop',
          type: 'catch'
        },
        {
          user_id: session.user.id,
          content: 'Spot rahasia di pesisir Bali. Air sangat jernih, banyak GT (Giant Trevally) berkeliaran. Waktu terbaik saat air pasang sore hari.',
          image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop',
          type: 'spot'
        },
        {
          user_id: session.user.id,
          content: 'Setup andalan untuk casting gabus: Joran 7-15lb, Reel 2000, Line PE 1.5, Lure Soft Frog. Siap tempur!',
          image_url: 'https://images.unsplash.com/photo-1611095777215-83d534f9a5d5?q=80&w=1000&auto=format&fit=crop',
          type: 'gear'
        }
      ];

      const { data: insertedPosts, error: postError } = await supabase
        .from('posts')
        .insert(demoPosts)
        .select();

      if (postError) throw postError;

      const spotPost = insertedPosts.find(p => p.content.includes('Bali'));
      if (spotPost) {
        await supabase.from('fishing_spots').insert([{
          post_id: spotPost.id,
          name: 'Pantai Melasti',
          location_name: 'Ungasan, Bali',
          water_condition: 'Sangat Jernih',
          best_time: 'Sore Hari'
        }]);
      }

      toast.success('Data demo berhasil ditambahkan!');
      fetchPosts();
    } catch (error: any) {
      toast.error('Gagal mengisi data: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Real-time subscription
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar - Stats/Profile Summary */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
        {session && (
          <Card className="rugged-card overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-primary to-secondary"></div>
            <CardContent className="relative pt-12 text-center">
              <Avatar className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 border-4 border-card">
                <AvatarImage src={session.user.user_metadata.avatar_url} />
                <AvatarFallback className="bg-muted text-primary text-xl">
                  {session.user.email?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg">{session.user.user_metadata.username || 'Angler'}</h3>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="font-bold text-primary">12</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Tangkapan</div>
                </div>
                <div>
                  <div className="font-bold text-secondary">5</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Spot</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rugged-card">
          <CardHeader className="pb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Spot Populer</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'spot-1', name: 'Danau Toba', type: 'Air Tawar', icon: Anchor },
              { id: 'spot-2', name: 'Pantai Selatan', type: 'Air Laut', icon: Fish },
              { id: 'spot-3', name: 'Waduk Gajah Mungkur', type: 'Air Tawar', icon: Trophy },
            ].map((spot) => (
              <div key={spot.id} className="flex items-center gap-3 group cursor-pointer">
                <div className="bg-muted p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <spot.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold group-hover:text-primary transition-colors">{spot.name}</div>
                  <div className="text-[10px] text-muted-foreground">{spot.type}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-6 space-y-6">
        {/* Create Post Trigger */}
        {session && (
          <Card className="rugged-card p-4">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user.user_metadata.avatar_url} />
                <AvatarFallback>{session.user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-muted-foreground bg-muted/50 hover:bg-muted border-border"
                onClick={() => setIsCreateOpen(true)}
              >
                Apa tangkapan hari ini, {session.user.user_metadata.username || 'Angler'}?
              </Button>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10" onClick={() => setIsCreateOpen(true)}>
                <Trophy className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold">Tangkapan</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10" onClick={() => setIsCreateOpen(true)}>
                <MapPin className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-bold">Spot</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10" onClick={() => setIsCreateOpen(true)}>
                <Settings2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold">Setup</span>
              </Button>
            </div>
          </Card>
        )}

        {/* Feed Controls */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="latest" className="w-auto" onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="latest" className="text-xs font-bold uppercase tracking-wider">Terbaru</TabsTrigger>
              <TabsTrigger value="popular" className="text-xs font-bold uppercase tracking-wider">Populer</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="sm" onClick={fetchPosts}>
            Segarkan
          </Button>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={`post-skeleton-${i}`} className="rugged-card h-64 animate-pulse bg-muted/20"></Card>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, i) => (
              <PostCard key={`${post.id}-${i}`} post={post} currentUser={session?.user} />
            ))
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border-2 border-dashed border-border">
              <Fish className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-mono uppercase tracking-widest">Tidak ada tangkapan di perairan ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Community/Marketplace Preview */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
        {/* Live Activity Marquee */}
        <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl overflow-hidden py-3">
          <div className="flex animate-marquee whitespace-nowrap gap-12 text-[11px] font-bold uppercase tracking-widest text-sky-600">
            <span>🐟 Angler_Budi baru saja mengunggah tangkapan 5kg Kakap Merah</span>
            <span>🌊 Spot Pantai Selatan sedang ramai</span>
            <span>⚓ Reel Shimano Stella diskon 20% di pasar</span>
            <span>💎 Angler_Savage membagikan setup pro baru</span>
          </div>
        </div>

        <Card className="rugged-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">LEADERBOARD</h3>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { id: 'leader-1', name: 'Savage_King', level: 'PRO', catches: 124 },
              { id: 'leader-2', name: 'Sea_Monster', level: 'PRO', catches: 89 },
              { id: 'leader-3', name: 'Budi_Angler', level: 'MENENGAH', catches: 56 },
            ].map((angler, i) => (
              <div key={angler.id} className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary transition-colors">
                      <AvatarFallback className="font-black">A{i+1}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -left-1 bg-background border border-border rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">
                      {i+1}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight">{angler.name}</div>
                    <div className="text-[10px] font-bold text-primary">{angler.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black">{angler.catches}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-bold">Tangkapan</div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 bg-muted/20">
            <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-8 border-border/50">
              Lihat Semua Angler
            </Button>
          </div>
        </Card>

        <Card className="rugged-card bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2">Butuh Alat Baru?</h3>
            <p className="text-xs text-muted-foreground mb-4">Cek joran dan reel terbaru di pasar.</p>
            <Button className="w-full bg-primary hover:bg-primary/90">Kunjungi Pasar</Button>
          </CardContent>
        </Card>

        {session && posts.length === 0 && (
          <Card className="rugged-card border-dashed border-primary/50 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <Anchor className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Website Terlihat Sepi?</h3>
              <p className="text-xs text-muted-foreground mb-4">Klik tombol di bawah untuk mengisi beranda dengan postingan demo pemancing Indonesia.</p>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={seedDemoData}
                disabled={seeding}
              >
                {seeding ? 'Mengisi...' : 'Isi Data Demo'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreatePostDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        userId={session?.user.id}
        onSuccess={fetchPosts}
      />
    </div>
  );
}
