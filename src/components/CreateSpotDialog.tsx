import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin, Loader2 } from 'lucide-react';
import MapPicker from './MapPicker';

interface CreateSpotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  onSuccess: () => void;
}

export default function CreateSpotDialog({ isOpen, onClose, userId, onSuccess }: CreateSpotDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || lat === null || lng === null) {
      toast.error('Pilih lokasi di peta terlebih dahulu');
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_favorite_spots')
        .insert({
          user_id: userId,
          name,
          description,
          latitude: lat,
          longitude: lng,
        });

      if (error) throw error;

      toast.success('Spot favorit berhasil ditandai!');
      onSuccess();
      onClose();
      // Reset
      setName('');
      setDescription('');
      setLat(null);
      setLng(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menandai spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rugged-card border-4 border-primary rounded-[30px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary flex items-center gap-2">
            <MapPin className="w-6 h-6" /> TANDAI SPOT FAVORIT
          </DialogTitle>
          <DialogDescription className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
            Bagikan lokasi memancing andalanmu di peta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Nama Spot</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="rugged-input"
              placeholder="Contoh: Dermaga Cinta"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Deskripsi Spot</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="rugged-input"
              placeholder="Apa yang spesial dari spot ini? Ikan apa yang banyak di sini?"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Pilih Lokasi di Peta</Label>
            <MapPicker lat={lat} lng={lng} onChange={(lat, lng) => { setLat(lat); setLng(lng); }} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rugged-btn-outline">Batal</Button>
            <Button type="submit" disabled={loading} className="rugged-btn">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan Spot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
