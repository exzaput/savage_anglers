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
import { Calendar, MapPin, Loader2, Camera } from 'lucide-react';
import MapPicker from './MapPicker';

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  onSuccess: () => void;
}

export default function CreateEventDialog({ isOpen, onClose, userId, onSuccess }: CreateEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Using avatars bucket for now
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title,
          description,
          location_name: locationName,
          event_date: eventDate,
          latitude: lat,
          longitude: lng,
          image_url: imageUrl,
          created_by: userId,
        });

      if (error) throw error;

      toast.success('Event berhasil dibuat!');
      onSuccess();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setLocationName('');
      setEventDate('');
      setLat(null);
      setLng(null);
      setImageFile(null);
      setImagePreview('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rugged-card border-4 border-primary rounded-[30px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-primary">Buat Event Baru</DialogTitle>
          <DialogDescription className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
            Hanya admin yang dapat membuat event resmi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Judul Event</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rugged-input"
              placeholder="Contoh: Turnamen Casting Gabus 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Deskripsi</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="rugged-input min-h-[100px]"
              placeholder="Detail event, hadiah, syarat, dll..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-widest text-[10px]">Tanggal Event</Label>
              <Input 
                type="datetime-local"
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                className="rugged-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-widest text-[10px]">Foto Event</Label>
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rugged-btn-outline w-full gap-2"
                  onClick={() => document.getElementById('event-image')?.click()}
                >
                  <Camera className="w-4 h-4" /> {imageFile ? 'Ganti Foto' : 'Unggah Foto'}
                </Button>
                <input id="event-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              {imagePreview && (
                <div className="mt-2 aspect-video rounded-xl overflow-hidden border-2 border-border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Lokasi Event</Label>
            <Input 
              value={locationName} 
              onChange={(e) => setLocationName(e.target.value)} 
              className="rugged-input mb-2"
              placeholder="Nama lokasi (misal: Waduk Gajah Mungkur)"
              required
            />
            <MapPicker lat={lat} lng={lng} onChange={(lat, lng) => { setLat(lat); setLng(lng); }} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rugged-btn-outline">Batal</Button>
            <Button type="submit" disabled={loading} className="rugged-btn">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Publikasikan Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
