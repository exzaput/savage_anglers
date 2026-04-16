import { useState } from 'react';
import { Post } from '@/src/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share2, MapPin, Settings2, Trophy, MoreHorizontal, Anchor } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: Post;
  currentUser?: any;
  key?: string | number;
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [liked, setLiked] = useState(post.likes?.some(l => l.user_id === currentUser?.id) || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Silakan masuk untuk menyukai postingan');
      return;
    }

    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
      await supabase.from('likes').delete().match({ post_id: post.id, user_id: currentUser.id });
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      await supabase.from('likes').insert({ post_id: post.id, user_id: currentUser.id });
    }
  };

  const spot = post.fishing_spots?.[0];
  const gear = post.gear_setups?.[0];

  return (
    <Card className="rugged-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user_id}`}>
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage src={post.profiles?.avatar_url || ''} />
              <AvatarFallback>{post.profiles?.username?.substring(0, 2).toUpperCase() || 'A'}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.user_id}`} className="font-bold hover:text-primary transition-colors">
                {post.profiles?.username || 'Angler Misterius'}
              </Link>
              {post.profiles?.experience_level === 'pro' && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black uppercase">PRO</span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {formatDistanceToNow(new Date(post.created_at))} yang lalu
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {post.content && (
          <div className="px-4 pb-4 text-sm leading-relaxed">
            {post.content}
          </div>
        )}

        {post.image_url && (
          <div className="relative aspect-video bg-muted overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Konten postingan" 
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
            {post.type === 'catch' && (
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg border border-white/20 uppercase tracking-tighter">
                <Trophy className="w-3 h-3" /> TANGKAPAN MONSTER
              </div>
            )}
          </div>
        )}

        {/* Special Post Details */}
        {(spot || gear) && (
          <div className="p-4 bg-muted/30 border-y border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-5">
              <Anchor className="w-24 h-24 rotate-12" />
            </div>
            
            {spot && (
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  <MapPin className="w-3 h-3" /> KOORDINAT SPOT
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black uppercase tracking-tight">{spot.name}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase">{spot.location_name}</div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Kondisi Air</span>
                    <span className="text-[10px] font-mono font-bold text-primary">{spot.water_condition}</span>
                  </div>
                  <div className="w-px h-6 bg-border/50 mx-1" />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Waktu Terbaik</span>
                    <span className="text-[10px] font-mono font-bold text-primary">{spot.best_time}</span>
                  </div>
                </div>
              </div>
            )}
            {gear && (
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-[0.2em]">
                  <Settings2 className="w-3 h-3" /> KONFIGURASI ALAT
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Joran</span>
                    <span className="text-[10px] font-mono font-bold truncate">{gear.rod}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Reel</span>
                    <span className="text-[10px] font-mono font-bold truncate">{gear.reel}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Senar</span>
                    <span className="text-[10px] font-mono font-bold truncate">{gear.line}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Umpan</span>
                    <span className="text-[10px] font-mono font-bold truncate">{gear.lure}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-2 flex items-center justify-between border-t border-border/30">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 ${liked ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold">{likesCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold">{post.comments?.length || 0}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
