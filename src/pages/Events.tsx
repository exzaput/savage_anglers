import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Event, Profile } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import CreateEventDialog from '@/src/components/CreateEventDialog';

interface EventsProps {
  session: Session | null;
}

export default function Events({ session }: EventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      toast.error('Gagal mengambil data event');
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const checkAdmin = async () => {
    if (!session) return;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    setIsAdmin(data?.role === 'admin');
  };

  useEffect(() => {
    fetchEvents();
    checkAdmin();
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event ini?')) return;
    
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus event');
    } else {
      toast.success('Event dihapus');
      fetchEvents();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-primary flex items-center gap-3">
            <Calendar className="w-10 h-10" /> EVENT ANGLER
          </h1>
          <p className="text-muted-foreground font-medium">Turnamen, gathering, dan workshop memancing.</p>
        </div>
        
        {isAdmin && (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 gap-2 font-black uppercase tracking-widest h-12 px-8 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            <Plus className="w-4 h-4" /> BUAT EVENT
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={`event-skeleton-${i}`} className="rugged-card h-96 animate-pulse bg-muted/20"></Card>
          ))
        ) : events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="rugged-card group overflow-hidden flex flex-col border-none shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img 
                  src={event.image_url || 'https://picsum.photos/seed/fishing-event/800/450'} 
                  alt={event.title} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-white border-none font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg">
                    {event.event_date ? format(new Date(event.event_date), 'dd MMM yyyy', { locale: localeID }) : 'TBA'}
                  </Badge>
                </div>
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-sm bg-white/80 backdrop-blur-sm hover:bg-white">
                      <Edit className="w-4 h-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-sm" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-6 flex-1 space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground font-medium line-clamp-3 leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                  <MapPin className="w-4 h-4" /> {event.location_name || 'LOKASI MISTERIUS'}
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full bg-primary hover:bg-primary/90 font-black uppercase tracking-widest h-12 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                  IKUTI EVENT
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-32 bg-card rounded-2xl border-2 border-dashed border-border">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground font-mono uppercase tracking-widest">Belum ada event yang direncanakan.</p>
          </div>
        )}
      </div>

      <CreateEventDialog 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userId={session?.user.id}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
