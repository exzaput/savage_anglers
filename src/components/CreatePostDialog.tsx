import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fish, MapPin, Settings2, Trophy, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { PostType } from '@/src/types';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess: () => void;
}

export default function CreatePostDialog({ isOpen, onClose, userId, onSuccess }: CreatePostDialogProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<PostType>('general');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Spot fields
  const [spotName, setSpotName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [waterCondition, setWaterCondition] = useState('');
  const [bestTime, setBestTime] = useState('');

  // Gear fields
  const [rod, setRod] = useState('');
  const [reel, setReel] = useState('');
  const [line, setLine] = useState('');
  const [lure, setLure] = useState('');
  const [technique, setTechnique] = useState('');

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // 1. Create Post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ user_id: userId, content, image_url: imageUrl || null, type }])
        .select()
        .single();

      if (postError) throw postError;

      // 2. Create Type-specific data
      if (type === 'spot') {
        const { error: spotError } = await supabase
          .from('fishing_spots')
          .insert([{ 
            post_id: postData.id, 
            name: spotName, 
            location_name: locationName,
            water_condition: waterCondition,
            best_time: bestTime
          }]);
        if (spotError) throw spotError;
      } else if (type === 'gear') {
        const { error: gearError } = await supabase
          .from('gear_setups')
          .insert([{ 
            post_id: postData.id, 
            rod, reel, line, lure, technique
          }]);
        if (gearError) throw gearError;
      }

      toast.success('Postingan berhasil dibagikan!');
      onSuccess();
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setImageUrl('');
    setType('general');
    setSpotName('');
    setLocationName('');
    setWaterCondition('');
    setBestTime('');
    setRod('');
    setReel('');
    setLine('');
    setLure('');
    setTechnique('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-2 border-border p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2">
            <Fish className="w-6 h-6" /> BAGIKAN TANGKAPAN
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full" onValueChange={(v) => setType(v as any)}>
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 px-6">
            <TabsTrigger value="general" className="gap-2 text-xs font-bold uppercase tracking-wider">
              <Fish className="w-3 h-3" /> Umum
            </TabsTrigger>
            <TabsTrigger value="catch" className="gap-2 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3 h-3" /> Tangkapan
            </TabsTrigger>
            <TabsTrigger value="spot" className="gap-2 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3 h-3" /> Spot
            </TabsTrigger>
            <TabsTrigger value="gear" className="gap-2 text-xs font-bold uppercase tracking-wider">
              <Settings2 className="w-3 h-3" /> Setup
            </TabsTrigger>
          </TabsList>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deskripsi</Label>
              <Textarea 
                placeholder="Ceritakan kisahnya..." 
                className="min-h-[100px] bg-muted/20 border-border focus:border-primary"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Gambar</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://images.unsplash.com/..." 
                  className="bg-muted/20 border-border"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
              {imageUrl && (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-border aspect-video">
                  <img src={imageUrl} alt="Pratinjau" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => setImageUrl('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="spot" className="space-y-4 pt-4 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Spot</Label>
                  <Input placeholder="Danau Rahasia" value={spotName} onChange={(e) => setSpotName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input placeholder="Kota, Provinsi" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Kondisi Air</Label>
                  <Input placeholder="Jernih / Keruh" value={waterCondition} onChange={(e) => setWaterCondition(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Waktu Terbaik</Label>
                  <Input placeholder="Pagi Buta" value={bestTime} onChange={(e) => setBestTime(e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gear" className="space-y-4 pt-4 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Joran</Label>
                  <Input placeholder="Merek/Model" value={rod} onChange={(e) => setRod(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reel</Label>
                  <Input placeholder="Merek/Model" value={reel} onChange={(e) => setReel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Senar</Label>
                  <Input placeholder="PE 2.0 / Nylon" value={line} onChange={(e) => setLine(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Umpan</Label>
                  <Input placeholder="Soft Frog / Minnow" value={lure} onChange={(e) => setLure(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Teknik</Label>
                  <Input placeholder="Casting / Jigging" value={technique} onChange={(e) => setTechnique(e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-6 pt-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Batal</Button>
          <Button 
            className="bg-primary hover:bg-primary/90 min-w-[120px]" 
            onClick={handleSubmit}
            disabled={loading || (!content && !imageUrl)}
          >
            {loading ? 'Membagikan...' : 'Posting ke Beranda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
