import React, { useState, useRef } from 'react';
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
import { Package, Camera, Loader2 } from 'lucide-react';

interface CreateGearDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  onSuccess: () => void;
}

export default function CreateGearDialog({ isOpen, onClose, userId, onSuccess }: CreateGearDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const filePath = `gear/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('user_gear')
        .insert({
          user_id: userId,
          name,
          description,
          image_url: imageUrl,
        });

      if (error) throw error;

      toast.success('Alat pancing berhasil ditambahkan!');
      onSuccess();
      onClose();
      // Reset
      setName('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan alat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rugged-card border-4 border-primary rounded-[30px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary flex items-center gap-2">
            <Package className="w-6 h-6" /> TAMBAH KELENGKAPAN
          </DialogTitle>
          <DialogDescription className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
            Pamerkan senjata andalanmu saat memancing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Foto Alat</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden bg-muted/10"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Klik untuk ambil foto</span>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Nama Alat</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="rugged-input"
              placeholder="Contoh: Reel Shimano Stella"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Deskripsi Singkat</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="rugged-input"
              placeholder="Spesifikasi atau alasan kenapa ini andalanmu..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rugged-btn-outline">Batal</Button>
            <Button type="submit" disabled={loading} className="rugged-btn">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan Alat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
