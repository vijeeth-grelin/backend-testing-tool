import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Zap, Trash2, Power, PowerOff, Activity, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';

interface Message {
  id: string;
  type: 'sent' | 'received' | 'system';
  event: string;
  data: any;
  timestamp: Date;
}

export default function WebSocketPage() {
  const [url, setUrl] = useState('http://localhost:3000');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [event, setEvent] = useState('message');
  const [payload, setPayload] = useState('{\n  "hello": "world"\n}');
  const [isConnecting, setIsConnecting] = useState(false);

  const bridgeSocketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connect = () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    const socket = io('http://localhost:3001');
    bridgeSocketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('ws:connect', { url, options: { transports: ['websocket'] } });
    });

    socket.on('ws:connected', (data) => {
      setIsConnected(true);
      setIsConnecting(false);
      addMessage('system', 'Connected', `Connected to target: ${data.id}`);
      showToast.success('WebSocket Connected');
    });

    socket.on('ws:message', ({ event, data }) => {
      addMessage('received', event, data);
    });

    socket.on('ws:disconnected', () => {
      handleDisconnect();
    });

    socket.on('ws:error', (err) => {
      showToast.error('WebSocket Error', err.message);
      handleDisconnect();
    });

    socket.on('disconnect', () => {
      handleDisconnect();
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsConnecting(false);
    addMessage('system', 'Disconnected', 'Disconnected from server');
    if (bridgeSocketRef.current) {
      bridgeSocketRef.current.disconnect();
      bridgeSocketRef.current = null;
    }
  };

  const disconnect = () => {
    if (bridgeSocketRef.current) {
      bridgeSocketRef.current.emit('ws:disconnect');
      handleDisconnect();
    }
  };

  const sendMessage = () => {
    if (!bridgeSocketRef.current || !isConnected) return;

    try {
      const data = JSON.parse(payload);
      bridgeSocketRef.current.emit('ws:send', { event, data });
      addMessage('sent', event, data);
    } catch (e) {
      showToast.error('Invalid JSON payload');
    }
  };

  const addMessage = (type: Message['type'], event: string, data: any) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      event,
      data,
      timestamp: new Date()
    }]);
  };

  const clearMessages = () => setMessages([]);

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Header / Connection Panel */}
        <header className="bg-card border rounded-[2rem] p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Zap size={24} />
          </div>
          <div className="flex-1 flex gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ws://example.com/socket.io"
              className="flex-1 bg-muted/20 border rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              disabled={isConnected}
            />
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className={cn(
                "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                isConnected 
                  ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" 
                  : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
              )}
            >
              {isConnecting ? (
                <Activity size={18} className="animate-spin" />
              ) : isConnected ? (
                <><PowerOff size={18} /> Disconnect</>
              ) : (
                <><Power size={18} /> Connect</>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Messages Panel */}
          <section className="lg:col-span-7 bg-card border rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl">
            <div className="p-6 border-b flex items-center justify-between bg-muted/5">
              <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Message Log
              </h3>
              <button onClick={clearMessages} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-destructive">
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-20 italic text-sm">
                  Waiting for events...
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col max-w-[90%]",
                  msg.type === 'sent' ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <div className="flex items-center gap-2 mb-1 px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                      {msg.event}
                    </span>
                    <span className="text-[9px] opacity-30">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className={cn(
                    "p-4 rounded-3xl text-sm font-mono whitespace-pre-wrap overflow-x-auto",
                    msg.type === 'sent' ? "bg-primary text-primary-foreground rounded-tr-sm" : 
                    msg.type === 'received' ? "bg-muted border rounded-tl-sm" : 
                    "bg-orange-500/10 text-orange-500 italic text-[10px] w-full"
                  )}>
                    {typeof msg.data === 'object' ? JSON.stringify(msg.data, null, 2) : msg.data}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </section>

          {/* Send Panel */}
          <section className="lg:col-span-5 bg-card border rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl">
            <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Send size={18} className="text-primary" />
              Emit Event
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Event Name</label>
              <input 
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full bg-muted/20 border rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. chat-message"
              />
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Payload (JSON)</label>
              <textarea 
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="flex-1 w-full bg-muted/20 border rounded-3xl px-6 py-4 text-xs font-mono focus:ring-1 focus:ring-primary outline-none resize-none"
                placeholder='{ "type": "text", "content": "..." }'
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!isConnected}
              className="w-full bg-foreground text-background font-black py-4 rounded-[2rem] shadow-lg shadow-black/10 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98]"
            >
              <Send size={18} />
              EMIT MESSAGE
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
