import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../utils/toast';
import { Shield, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { loginSchema, handleZodError } from '../utils/validation';
import { z } from 'zod';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email, password });
      
      setIsLoading(true);
      const response = await axios.post('http://127.0.0.1:3001/api/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data;
      setAuth(user, token);
      showToast.success('Login successful', `Welcome back, ${user.name || user.email}`);
      navigate(from, { replace: true });
    } catch (error: any) {
      handleZodError(error, error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20">
            <Shield size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Grelinhealth Admin
          </h1>
          <p className="text-muted-foreground text-sm">Secure access to API management</p>
        </div>

        <div className="bg-card border shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grelinhealth.ai"
                  className="w-full bg-muted/30 border rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted/30 border rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Protected by Grelinhealth Shield™<br/>
              Enterprise-grade encryption enabled
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; 2026 Grelinhealth AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
