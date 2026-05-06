import { Layers, Moon, Sun, Database, Zap, Terminal, Shield, LogOut, HelpCircle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import UserGuide from '@/components/docs/UserGuide';

export default function TopBar() {
  const { theme, setTheme, openModal } = useUIStore();
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  const navItems = [
    { name: 'Portal', path: '/', icon: <Database size={16} /> },
    { name: 'REST Tester', path: '/tester', icon: <Terminal size={16} /> },
    { name: 'WebSockets', path: '/tester/socket', icon: <Zap size={16} /> },
    { name: 'Admin', path: '/admin', icon: <Shield size={16} /> },
  ];

  return (
    <header className="h-16 border-b flex items-center px-6 justify-between bg-card/50 backdrop-blur-md z-50 sticky top-0">
      <div className="flex items-center gap-8">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Layers size={20} />
          </div>
          <span className="font-black tracking-tighter text-xl">Grelinhealth</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border">
          {navItems.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                  isActive 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/docs')}
          className="p-2.5 hover:bg-muted rounded-2xl transition-all text-muted-foreground hover:text-primary border border-transparent hover:border-border"
          title="Platform Documentation"
        >
          <HelpCircle size={20} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-muted rounded-2xl transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {token && user && (
          <>
            <div className="h-8 w-px bg-border mx-2" />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">{user.name || 'Admin User'}</p>
                <p className="text-[10px] text-primary font-bold">Pro Account</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-xs font-black border-2 border-background shadow-xl hover:scale-110 transition-transform cursor-pointer">
                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'AD'}
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-xl transition-all ml-2"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
