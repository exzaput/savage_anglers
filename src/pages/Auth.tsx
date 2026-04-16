import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Fish, Mail, Lock, User, MapPin, Anchor, Waves, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [fishingStyle, setFishingStyle] = useState('both');
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if we are in a password recovery flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setActiveTab('reset-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message);
    } else {
      toast.success('Selamat datang kembali, Angler!');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Link reset password telah dikirim ke email Anda!');
      setActiveTab('login');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Password tidak cocok!');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password berhasil diperbarui!');
      setActiveTab('login');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          experience_level: experienceLevel,
          fishing_style: fishingStyle,
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex-1 w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-teal-600 overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Circles */}
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-cyan-300/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-card/95 backdrop-blur-sm rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] z-10"
      >
        {/* Left Side: Welcome Section */}
        <div className="relative w-full md:w-[45%] bg-gradient-to-br from-sky-500 to-teal-500 p-12 flex flex-col justify-center items-start text-white overflow-hidden">
          {/* Floating 3D-like Spheres */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-cyan-400 to-sky-600 rounded-full shadow-2xl opacity-80" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400 to-teal-600 rounded-full shadow-2xl opacity-90" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 space-y-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Fish className="w-16 h-16 mb-6 text-white/90" />
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-2">
                HELLO!
              </h2>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 uppercase">
                SAVAGE ANGLERS
              </h3>
            </motion.div>
            
            <motion.p 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-sm md:text-base leading-relaxed max-w-xs font-medium"
            >
              Mari bergabung dalam kegembiraan memancing! Bagikan momen bahagiamu dan temukan teman baru di seluruh perairan Indonesia.
            </motion.p>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="w-full md:w-[55%] p-8 md:p-16 bg-card flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-foreground tracking-tight">
                {activeTab === 'login' ? 'Welcome Back!' : activeTab === 'register' ? 'Join the Fun!' : activeTab === 'forgot-password' ? 'Reset Password' : 'New Password'}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {activeTab === 'login' 
                  ? 'Senang melihatmu lagi! Siap untuk petualangan baru?' 
                  : activeTab === 'register'
                  ? 'Ayo buat akunmu dan mulai petualangan seru hari ini!'
                  : activeTab === 'forgot-password'
                  ? 'Masukkan email Anda untuk menerima link reset password.'
                  : 'Masukkan password baru Anda di bawah ini.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="Email Address" 
                        className="h-14 pl-12 bg-muted border-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-foreground font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="h-14 pl-12 pr-16 bg-muted border-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-foreground font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
                      >
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                      <label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer">Remember me</label>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('forgot-password')}
                      className="text-sm font-bold text-primary hover:text-primary/80"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Let\'s Go!'}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground font-bold">Or</span></div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full h-14 border-2 border-border hover:bg-muted text-foreground font-black text-lg rounded-2xl transition-all"
                  >
                    Sign in with other
                  </Button>
                </motion.form>
              ) : activeTab === 'register' ? (
                <motion.form 
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignUp} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="Username" 
                      className="h-12 bg-muted border-none rounded-xl text-foreground"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <Input 
                      placeholder="Full Name" 
                      className="h-12 bg-muted border-none rounded-xl text-foreground"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger className="h-12 bg-muted border-none rounded-xl text-foreground">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Pemula</SelectItem>
                        <SelectItem value="intermediate">Menengah</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={fishingStyle} onValueChange={setFishingStyle}>
                      <SelectTrigger className="h-12 bg-muted border-none rounded-xl text-foreground">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freshwater">Freshwater</SelectItem>
                        <SelectItem value="saltwater">Saltwater</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    className="h-12 bg-muted border-none rounded-xl text-foreground"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="h-12 bg-muted border-none rounded-xl text-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Start Adventure!'}
                  </Button>
                </motion.form>
              ) : activeTab === 'forgot-password' ? (
                <motion.form 
                  key="forgot-password-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="Email Address" 
                        className="h-14 pl-12 bg-muted border-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-foreground font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <button 
                    type="button" 
                    onClick={() => setActiveTab('login')}
                    className="w-full text-sm font-bold text-primary hover:text-primary/80 text-center"
                  >
                    Back to Login
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="reset-password-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleUpdatePassword} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="New Password" 
                        className="h-14 pl-12 bg-muted border-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-foreground font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="Confirm New Password" 
                        className="h-14 pl-12 bg-muted border-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-foreground font-medium"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="text-center pt-4">
              <p className="text-slate-500 text-sm font-bold">
                {activeTab === 'login' ? "Don't have an account? " : activeTab === 'register' ? "Already have an account? " : ""}
                {(activeTab === 'login' || activeTab === 'register') && (
                  <button 
                    onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                    className="text-primary hover:text-primary/80 underline underline-offset-4"
                  >
                    {activeTab === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
