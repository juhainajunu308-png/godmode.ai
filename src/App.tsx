import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Cpu, 
  Terminal, 
  Zap, 
  Layers, 
  History, 
  Settings, 
  Plus, 
  Bot, 
  User,
  ChevronRight,
  ShieldCheck,
  Activity,
  Maximize2,
  Trash2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { Message, ChatSession, ModelType } from './types';
import { getAIResponse } from './services/chatManager';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages, isLoading]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Neural Link',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, userMessage] };
      }
      return s;
    });

    setSessions(updatedSessions);
    setInput('');
    setIsLoading(true);

    try {
      const responses = await getAIResponse(
        selectedModel,
        input,
        currentSession?.messages || []
      );

      const assistantMessages: Message[] = responses.map((resp, idx) => ({
        id: (Date.now() + idx + 1).toString(),
        role: 'assistant',
        content: resp.content,
        model: resp.model,
        timestamp: Date.now(),
      }));

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          // Update title if it's the first message
          const newTitle = s.messages.length === 0 ? input.substring(0, 30) + (input.length > 30 ? '...' : '') : s.title;
          return { 
            ...s, 
            title: newTitle,
            messages: [...s.messages, userMessage, ...assistantMessages] 
          };
        }
        return s;
      }));
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(sessions.find(s => s.id !== id)?.id || null);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-god-bg text-god-text selection:bg-god-accent/30">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 flex-shrink-0 bg-god-surface/50 border-r border-god-border flex flex-col z-20"
          >
            <div className="p-4 border-b border-god-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-god-accent/10 flex items-center justify-center border border-god-accent/30">
                  <Cpu className="w-5 h-5 text-god-accent animate-pulse" />
                </div>
                <span className="font-mono font-bold tracking-tighter text-lg god-glow">AETHERIS</span>
              </div>
              <button 
                onClick={createNewSession}
                className="p-1.5 rounded hover:bg-god-accent/10 text-god-muted hover:text-god-accent transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <div className="px-2 py-2 text-[10px] font-mono text-god-muted uppercase tracking-widest flex items-center gap-2">
                <History className="w-3 h-3" />
                Neural Archives
              </div>
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between group transition-all duration-200 border border-transparent",
                    currentSessionId === session.id 
                      ? "bg-god-accent/10 border-god-accent/20 text-god-accent" 
                      : "hover:bg-white/5 text-god-muted hover:text-god-text"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Terminal className={cn("w-4 h-4 flex-shrink-0", currentSessionId === session.id ? "text-god-accent" : "text-god-muted")} />
                    <span className="truncate text-sm font-mono">{session.title}</span>
                  </div>
                  <Trash2 
                    onClick={(e) => deleteSession(session.id, e)}
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity" 
                  />
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-god-border bg-god-bg/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-god-accent/20 border border-god-accent/40 flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-god-accent" />
                </div>
                <div>
                  <div className="text-xs font-mono text-god-text">GOD_OPERATOR</div>
                  <div className="text-[10px] font-mono text-god-accent flex items-center gap-1">
                    <Activity className="w-2 h-2" />
                    SYSTEM_ONLINE
                  </div>
                </div>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono transition-colors">
                <Settings className="w-4 h-4" />
                CORE_SETTINGS
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-god-border flex items-center justify-between px-6 bg-god-surface/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded hover:bg-white/5 text-god-muted"
            >
              <ChevronRight className={cn("w-5 h-5 transition-transform", isSidebarOpen ? "rotate-180" : "")} />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-god-accent" />
              <span className="text-xs font-mono tracking-widest text-god-muted uppercase">Secure Neural Link Established</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-god-bg/50 p-1 rounded-lg border border-god-border">
            {(['gemini', 'gpt', 'claude', 'combined'] as ModelType[]).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={cn(
                  "px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-tighter transition-all",
                  selectedModel === m 
                    ? "bg-god-accent text-god-bg font-bold shadow-[0_0_10px_rgba(0,242,255,0.5)]" 
                    : "text-god-muted hover:text-god-text hover:bg-white/5"
                )}
              >
                {m === 'combined' ? (
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    GOD_MODE
                  </span>
                ) : m}
              </button>
            ))}
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth"
        >
          {currentSession?.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-2xl bg-god-accent/10 border border-god-accent/30 flex items-center justify-center"
              >
                <Cpu className="w-10 h-10 text-god-accent animate-pulse" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-mono font-bold tracking-tighter god-glow uppercase">Initiate Neural Link</h2>
                <p className="text-god-muted font-mono text-sm max-w-md">
                  Select your processing core and transmit your query to the global intelligence matrix.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                {[
                  { icon: Zap, label: "Quantum Reasoning", desc: "Complex problem solving" },
                  { icon: Terminal, label: "Code Synthesis", desc: "Advanced programming" },
                  { icon: Layers, label: "Multi-Model Fusion", desc: "Triangulated accuracy" },
                  { icon: Maximize2, label: "Creative Expansion", desc: "Ideation & storytelling" }
                ].map((item, i) => (
                  <button key={i} className="p-4 rounded-lg bg-god-surface/50 border border-god-border hover:border-god-accent/50 transition-all text-left group">
                    <item.icon className="w-5 h-5 text-god-accent mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-mono font-bold mb-1">{item.label}</div>
                    <div className="text-[10px] font-mono text-god-muted">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentSession?.messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "flex gap-4 max-w-4xl mx-auto",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded flex-shrink-0 flex items-center justify-center border",
                message.role === 'user' 
                  ? "bg-white/5 border-white/10" 
                  : "bg-god-accent/10 border-god-accent/30"
              )}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-god-accent" />}
              </div>
              
              <div className={cn(
                "flex-1 space-y-2",
                message.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className="flex items-center gap-2 text-[10px] font-mono text-god-muted uppercase tracking-widest">
                  {message.role === 'user' ? 'Operator' : (message.model || 'System')}
                  <span className="opacity-30">•</span>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <div className={cn(
                  "p-4 rounded-lg god-panel",
                  message.role === 'user' ? "bg-white/5 border-white/10" : ""
                )}>
                  <div className="markdown-body">
                    <Markdown>{message.content}</Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="w-10 h-10 rounded bg-god-accent/10 border border-god-accent/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-god-accent animate-spin" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-[10px] font-mono text-god-accent uppercase tracking-widest animate-pulse">
                  Processing Neural Stream...
                </div>
                <div className="h-12 w-full bg-god-accent/5 border border-god-accent/10 rounded-lg animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-god-bg to-transparent">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute -top-8 left-0 flex items-center gap-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-god-accent animate-ping" />
                <span className="text-[10px] font-mono text-god-accent uppercase tracking-widest">Core Status: Optimal</span>
              </div>
              <div className="text-[10px] font-mono text-god-muted uppercase tracking-widest">
                Active Model: {selectedModel === 'combined' ? 'GOD_MODE_FUSION' : selectedModel.toUpperCase()}
              </div>
            </div>

            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Transmit neural query..."
                className="w-full bg-god-surface/50 border border-god-border focus:border-god-accent/50 rounded-xl p-4 pr-16 min-h-[60px] max-h-[200px] resize-none font-mono text-sm focus:outline-none transition-all duration-300 backdrop-blur-md"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-300",
                  input.trim() && !isLoading 
                    ? "bg-god-accent text-god-bg shadow-[0_0_15px_rgba(0,242,255,0.4)] hover:scale-105" 
                    : "bg-white/5 text-god-muted cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex justify-between items-center px-2">
              <div className="text-[9px] font-mono text-god-muted uppercase tracking-widest">
                Shift + Enter for multi-line transmission
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[9px] font-mono text-god-muted">GPT_5.4</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  <span className="text-[9px] font-mono text-god-muted">CLAUDE_4.6</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-cyan-500" />
                  <span className="text-[9px] font-mono text-god-muted">GEMINI_3.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Info Panel (Optional/Hidden on small screens) */}
      <div className="hidden xl:flex w-64 flex-shrink-0 bg-god-surface/30 border-l border-god-border flex-col p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono text-god-accent uppercase tracking-[0.2em] border-b border-god-accent/20 pb-2">System Diagnostics</h3>
          <div className="space-y-3">
            {[
              { label: "Neural Latency", value: "14ms", color: "text-green-500" },
              { label: "Core Load", value: "24%", color: "text-god-accent" },
              { label: "Matrix Sync", value: "Stable", color: "text-green-500" },
              { label: "Encryption", value: "AES-4096", color: "text-god-accent" }
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-god-muted">{stat.label}</span>
                <span className={cn("text-[10px] font-mono font-bold", stat.color)}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-mono text-god-accent uppercase tracking-[0.2em] border-b border-god-accent/20 pb-2">Active Protocols</h3>
          <div className="space-y-2">
            {['HEURISTIC_ANALYSIS', 'SEMANTIC_MAPPING', 'CONTEXT_RETENTION', 'GOD_MODE_FUSION'].map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-god-accent animate-pulse" />
                <span className="text-[9px] font-mono text-god-text truncate">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-god-border">
          <div className="p-3 rounded-lg bg-god-accent/5 border border-god-accent/20">
            <div className="text-[9px] font-mono text-god-accent mb-1 uppercase">Vercel Deployment Ready</div>
            <div className="text-[8px] font-mono text-god-muted leading-tight">
              Optimized for edge runtime and global distribution via Vercel Pro network.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
