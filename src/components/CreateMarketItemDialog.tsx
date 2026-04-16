import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Image as ImageIcon, MapPin, X, Tag, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { MarketplaceCategory } from '@/src/types';

interface CreateMarketItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess: () => void;
}

export default function CreateMarketItemDialog({ isOpen, onClose, userId, onSuccess }: CreateMarketItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('Joran');
  const [locationName, setLocationName] = useState('');
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

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      let finalImageUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `marketplace/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Using avatars bucket for now, or create 'marketplace'
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('marketplace_items')
        .insert([{ 
          user_id: userId, 
          title, 
          price: parseFloat(price), 
          description, 
          category, 
          image_url: finalImageUrl || null,
          location_name: locationName
        }]);

      if (error) throw error;

      toast.success('Alat berhasil didaftarkan!');
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
    setTitle('');
    setPrice('');
    setDescription('');
    setCategory('Joran');
    setImageFile(null);
    setImagePreview('');
    setLocationName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-border p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> JUAL ALAT ANDA
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Foto Barang</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden bg-muted/10"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Klik untuk ambil foto / galeri</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Judul Barang</Label>
            <Input 
              placeholder="misal: Shimano Stella SW 8000HG" 
              className="bg-muted/20 border-border rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Harga (Rp)</Label>
              <Input 
                type="number" 
                placeholder="5000000" 
                className="bg-muted/20 border-border rounded-xl"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger className="bg-muted/20 border-border rounded-xl">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Joran">Joran (Rods)</SelectItem>
                  <SelectItem value="Reel">Reel</SelectItem>
                  <SelectItem value="Senar">Senar (Lines)</SelectItem>
                  <SelectItem value="Umpan">Umpan (Lures)</SelectItem>
                  <SelectItem value="Aksesoris">Aksesoris</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deskripsi</Label>
            <Textarea 
              placeholder="Jelaskan kondisi, spesifikasi, dll." 
              className="min-h-[100px] bg-muted/20 border-border rounded-xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lokasi (Wajib)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Kota, Provinsi" 
                className="pl-10 bg-muted/20 border-border rounded-xl"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Batal</Button>
          <Button 
            className="bg-primary hover:bg-primary/90 min-w-[120px] font-black uppercase tracking-widest rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" 
            onClick={handleSubmit}
            disabled={loading || !title || !price || !locationName}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Jual Barang'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
