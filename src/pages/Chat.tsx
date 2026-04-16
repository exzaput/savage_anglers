import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Message, Profile } from '@/src/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, User, Fish, MoreVertical, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ChatProps {
  session: Session;
}

export default function Chat({ session }: ChatProps) {
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch users who have messaged or been messaged by the current user
  const fetchConversations = async () => {
    // For simplicity in this demo, we'll just fetch all other users
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', session.user.id)
      .limit(20);

    if (error) toast.error('Gagal mengambil daftar percakapan');
    else setConversations(data || []);
    setLoading(false);
  };

  const fetchMessages = async (otherUserId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true });

    if (error) toast.error('Gagal mengambil pesan');
    else setMessages(data || []);
  };

  useEffect(() => {
    fetchConversations();

    // Real-time subscription for messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${session.user.id}`
      }, (payload) => {
        const msg = payload.new as Message;
        if (selectedUser && msg.sender_id === selectedUser.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        } else {
          toast.info('Pesan baru diterima!');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: session.user.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim()
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      toast.error('Gagal mengirim pesan');
    } else {
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setNewMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      {/* Conversations List */}
      <Card className={`rugged-card w-full md:w-80 flex flex-col overflow-hidden ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-black tracking-tighter text-xl text-primary mb-4 flex items-center gap-2">
            <Fish className="w-5 h-5" /> PESAN
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari angler..." className="pl-10 bg-background" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                  selectedUser?.id === user.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                }`}
              >
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="font-bold truncate">{user.username}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    {user.experience_level === 'beginner' ? 'Pemula' : user.experience_level === 'intermediate' ? 'Menengah' : 'Pro'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Window */}
      <Card className={`rugged-card flex-1 flex flex-col overflow-hidden ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                  <Fish className="w-5 h-5 rotate-180" />
                </Button>
                <Avatar className="h-10 w-10 border border-primary/20">
                  <AvatarImage src={selectedUser.avatar_url || ''} />
                  <AvatarFallback>{selectedUser.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{selectedUser.username}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span> Aktif
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => {
                  const isMine = msg.sender_id === session.user.id;
                  return (
                    <div key={`${msg.id}-${i}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] space-y-1`}>
                        <div className={`p-3 rounded-2xl text-sm ${
                          isMine 
                            ? 'bg-primary text-white rounded-tr-none shadow-[4px_4px_0px_0px_rgba(14,165,233,0.2)]' 
                            : 'bg-muted text-foreground rounded-tl-none border border-border'
                        }`}>
                          {msg.content}
                        </div>
                        <div className={`text-[10px] text-muted-foreground font-bold px-1 ${isMine ? 'text-right' : 'text-left'}`}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/30 flex gap-2">
              <Input 
                placeholder="Ketik pesan Anda..." 
                className="bg-background border-border focus:border-primary"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-muted p-6 rounded-full mb-6">
              <MessageSquare className="w-12 h-12 text-muted-foreground opacity-20" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-primary mb-2">PILIH SALURAN</h2>
            <p className="text-muted-foreground max-w-xs font-medium">Pilih angler dari daftar untuk mulai berbagi taktik dan tips alat.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
