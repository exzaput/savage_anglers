import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Profile } from '@/src/types';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, MapPin, Loader2 } from 'lucide-react';
import MapPicker from './MapPicker';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onSuccess: () => void;
}

export default function EditProfileDialog({ isOpen, onClose, profile, onSuccess }: EditProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || 'beginner');
  const [fishingStyle, setFishingStyle] = useState(profile.fishing_style || 'both');
  const [lat, setLat] = useState<number | null>(profile.latitude);
  const [lng, setLng] = useState<number | null>(profile.longitude);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(profile.cover_url || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.cover_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar-${profile.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrl;
      }

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `cover-${profile.id}-${Math.random()}.${fileExt}`;
        const filePath = `covers/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, coverFile); // Using avatars bucket for simplicity or create 'covers'
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        coverUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio,
          location: location,
          experience_level: experienceLevel,
          fishing_style: fishingStyle,
          latitude: lat,
          longitude: lng,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profil berhasil diperbarui!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rugged-card border-4 border-primary rounded-[30px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-primary">Edit Profil Angler</DialogTitle>
          <DialogDescription className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
            Perbarui identitas dan preferensi memancingmu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Cover & Avatar Upload */}
          <div className="space-y-4">
            <div className="relative h-48 w-full rounded-2xl overflow-hidden border-4 border-primary bg-muted group">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-black uppercase tracking-widest">
                  Foto Sampul (Thumbnail)
                </div>
              )}
              <label htmlFor="cover-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>

            <div className="flex flex-col items-center -mt-16 relative z-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl bg-muted">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-black text-4xl">
                      {username.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Klik ikon kamera untuk ganti foto</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-widest text-[10px]">Username</Label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="rugged-input"
                placeholder="Username unikmu"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-widest text-[10px]">Nama Lengkap</Label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="rugged-input"
                placeholder="Nama aslimu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Biografi</Label>
            <Textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              className="rugged-input min-h-[100px]"
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-widest text-[10px]">Level Pengalaman</Label>
              <Select value={experienceLevel} onValueChange={(v: any) => setExperienceLevel(v)}>
                <SelectTrigger className="rugged-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Pemula</SelectItem>
                  <SelectItem value="intermediate">Menengah</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-widest text-[10px]">Gaya Memancing</Label>
              <Select value={fishingStyle || 'both'} onValueChange={(v: any) => setFishingStyle(v)}>
                <SelectTrigger className="rugged-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freshwater">Air Tawar (Freshwater)</SelectItem>
                  <SelectItem value="saltwater">Air Laut (Saltwater)</SelectItem>
                  <SelectItem value="both">Keduanya (Both)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-black uppercase tracking-widest text-[10px]">Lokasi Utama / Spot Favorit</Label>
            <Input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className="rugged-input mb-2"
              placeholder="Nama daerah atau spot..."
            />
            <MapPicker lat={lat} lng={lng} onChange={(lat, lng) => { setLat(lat); setLng(lng); }} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rugged-btn-outline">Batal</Button>
            <Button type="submit" disabled={loading} className="rugged-btn">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
