import { BookOpen, Search, ArrowRight, Play, Terminal, Zap, Shield } from 'lucide-react';

export default function UserGuide() {
  const steps = [
    {
      title: 'Explore the Portal',
      description: 'Visit the Team Portal to discover all available internal services and API versions maintained by the engineering team.',
      icon: <Search className="text-blue-500" size={20} />,
    },
    {
      title: 'Import Collections',
      description: 'Find the service you need and click "Open in Tester". This safely imports the entire API structure into your personal workspace.',
      icon: <ArrowRight className="text-green-500" size={20} />,
    },
    {
      title: 'Build Your Request',
      description: 'Select an endpoint from the sidebar. You can easily customize query parameters, HTTP headers, and JSON payloads in the editor.',
      icon: <Terminal className="text-purple-500" size={20} />,
    },
    {
      title: 'Execute & Analyze',
      description: 'Click "Send" to trigger the request. View real-time responses, headers, and performance metrics like latency and payload size.',
      icon: <Play className="text-primary" size={20} />,
    },
    {
      title: 'Real-time Testing',
      description: 'Need event-based testing? Use the WebSockets tab to connect to socket servers and emit events through our secure bridge.',
      icon: <Zap className="text-orange-500" size={20} />,
    },
  ];

  return (
    <div className="space-y-8 p-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Shield size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Testing Environment</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Welcome to the Grelinhealth API platform. Follow these steps to start testing and documenting your services.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-2xl bg-muted/50 border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              {i !== steps.length - 1 && <div className="w-px h-full bg-border my-2" />}
            </div>
            <div className="pt-1 pb-4">
              <h4 className="font-black text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="flex gap-3">
          <BookOpen className="text-primary shrink-0" size={18} />
          <p className="text-[10px] text-primary/80 font-medium leading-normal">
            <strong>Pro Tip:</strong> Your workspace is automatically saved to your browser. You can refresh or return later without losing your active test configurations.
          </p>
        </div>
      </div>
    </div>
  );
}
