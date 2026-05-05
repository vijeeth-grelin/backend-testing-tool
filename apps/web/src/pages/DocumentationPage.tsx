import { 
  Book, CheckCircle2, Shield, Zap, Terminal, Database, Play, 
  ArrowRight, Sparkles, Code2, Globe, Cpu, Layout, Layers, HelpCircle
} from 'lucide-react';
import { cn } from '../utils/cn';
import UserGuide from '../components/docs/UserGuide';
import { useNavigate } from 'react-router-dom';

export default function DocumentationPage() {
  const navigate = useNavigate();

  const sections = [
    { id: 'overview', name: 'Platform Overview', icon: <Globe size={14} /> },
    { id: 'workflow', name: 'Testing Workflow', icon: <Zap size={14} /> },
    { id: 'architecture', name: 'Core Architecture', icon: <Cpu size={14} /> },
    { id: 'security', name: 'Security Baseline', icon: <Shield size={14} /> },
    { id: 'best-practices', name: 'Best Practices', icon: <Sparkles size={14} /> },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r bg-muted/5 hidden lg:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Book className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight">Docs</h2>
            <p className="text-[9px] text-primary font-bold uppercase tracking-widest">Platform Guide</p>
          </div>
        </div>

        <nav className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all group"
            >
              <span className="opacity-50 group-hover:opacity-100">{s.icon}</span>
              {s.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t">
          <button 
            onClick={() => navigate('/tester')}
            className="w-full bg-foreground text-background py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            Launch Tester <ArrowRight size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Top Floating Banner */}
        <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-24">
          
          {/* Section: Overview */}
          <section id="overview" className="space-y-8 pt-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
                <HelpCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Welcome</span>
              </div>
              <h1 className="text-7xl font-black tracking-tighter leading-none">
                How we test <br />
                <span className="text-primary">Grelinhealth APIs.</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                A unified environment for high-fidelity API auditing, documentation, and real-time event testing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-8 bg-card border rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-l-4 border-l-primary">
                <h3 className="font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Terminal size={18} className="text-primary" />
                  What it is
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A internal tool combining **Postman** (for request building) and **Swagger** (for structured discovery). It serves as the single source of truth for all engineering teams.
                </p>
              </div>
              <div className="p-8 bg-card border rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-l-4 border-l-orange-500">
                <h3 className="font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap size={18} className="text-orange-500" />
                  Why we use it
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To eliminate scattered collections, bypass CORS restrictions via internal proxying, and ensure every developer tests against the **latest published snapshots**.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Workflow */}
          <section id="workflow" className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">The Workflow</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="bg-muted/30 border rounded-[3rem] p-10 lg:p-16">
              <UserGuide />
            </div>
          </section>

          {/* Section: Architecture */}
          <section id="architecture" className="space-y-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight">Core Architecture</h2>
              <p className="text-muted-foreground font-medium">How the system handles your data under the hood.</p>
            </div>

            <div className="space-y-6">
              <div className="group bg-card border rounded-[2.5rem] p-8 hover:border-primary/50 transition-all flex gap-8 items-start">
                <div className="p-4 bg-primary/5 text-primary rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                  <Database size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-lg">Snapshot Persistence</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Unlike traditional tools, Grelinhealth uses **Versioned Snapshots**. When an admin publishes a collection, it is frozen in time. When you import it, you get an exact copy of that verified state.
                  </p>
                </div>
              </div>

              <div className="group bg-card border rounded-[2.5rem] p-8 hover:border-blue-500/50 transition-all flex gap-8 items-start">
                <div className="p-4 bg-blue-500/5 text-blue-500 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                  <Layers size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-lg">Secure Proxy Bridge</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To bypass browser CORS security and access internal non-public microservices, all requests are routed through our **Node.js Proxy Bridge** at `http://localhost:3001`.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Best Practices */}
          <section id="best-practices" className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-black tracking-tight leading-none">Best <br /> Practices.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Follow these conventions to ensure your testing is accurate and secure across the entire engineering stack.
              </p>
              <div className="p-6 bg-foreground text-background rounded-3xl shadow-xl">
                <div className="flex gap-4 items-center mb-4">
                  <Code2 size={24} className="text-primary" />
                  <span className="font-black uppercase text-xs tracking-widest">Syntax Tip</span>
                </div>
                <p className="text-xs leading-relaxed opacity-70 italic">
                  "Always use dynamic variables like {"{{baseUrl}}"} to make your collections portable across dev, staging, and production environments."
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Variable Interpolation', desc: 'Use double curly braces for environment and collection-level variables.', icon: <Layout size={16} /> },
                { title: 'JSON Beautification', desc: 'Use the built-in formatter to ensure payloads are valid and readable.', icon: <Terminal size={16} /> },
                { title: 'Local-First Persistence', desc: 'Your personal edits are stored locally. Only "Published" versions are shared.', icon: <Shield size={16} /> }
              ].map((item, i) => (
                <div key={i} className="p-6 border rounded-[2rem] bg-muted/20 flex gap-4">
                  <div className="text-primary pt-1">{item.icon}</div>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-widest mb-1">{item.title}</h5>
                    <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-24 pb-12 text-center space-y-4 border-t">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Grelinhealth Engineering • 2026</p>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => navigate('/')} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">TEAM PORTAL</button>
              <button onClick={() => navigate('/tester')} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">API TESTER</button>
              <button onClick={() => navigate('/tester/socket')} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">WS BRIDGE</button>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
