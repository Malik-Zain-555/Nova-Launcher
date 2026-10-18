import React, { useState, useEffect, useRef } from 'react';
import { FluentIcon } from '../../components/FluentIcon';
import {
  AIEngine,
  AIModel,
  SUPPORTED_MODELS,
  ChatMessage,
  DEFAULT_PERSONAS,
  PersonaConfig
} from './ai-engine';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  modelId: string;
  personaId: string;
}

export const AICopilotModule: React.FC = () => {
  // Chat Sessions & Active State
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'Nova Dock Architecture & Polish',
      createdAt: 'Today',
      modelId: 'claude-3-5-sonnet-20241022',
      personaId: 'staff-eng',
      messages: [
        {
          id: 'm1',
          role: 'assistant',
          content: 'Hello Zain! I am your Nova AI Copilot with staff engineer persona enabled. What desktop subsystem or architectural pattern can we solve today?',
          timestamp: '01:00 AM'
        }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [selectedModelId, setSelectedModelId] = useState<string>('claude-3-5-sonnet-20241022');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('staff-eng');

  // Input & Streaming
  const [inputVal, setInputVal] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [attachedContext, setAttachedContext] = useState<{ type: 'clipboard' | 'screenshot' | 'window' | 'file'; detail: string } | null>(null);

  // API Keys (Encrypted / Local)
  const [apiKeys, setApiKeys] = useState<{ claude: string; openai: string; gemini: string }>({
    claude: '',
    openai: '',
    gemini: ''
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Slash commands menu
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const activeModel = SUPPORTED_MODELS.find(m => m.id === selectedModelId) || SUPPORTED_MODELS[0];
  const activePersona = DEFAULT_PERSONAS.find(p => p.id === selectedPersonaId) || DEFAULT_PERSONAS[0];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isStreaming]);

  // Load API keys from local storage
  useEffect(() => {
    const saved = localStorage.getItem('nova_ai_keys');
    if (saved) {
      try {
        setApiKeys(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveApiKeys = (newKeys: typeof apiKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem('nova_ai_keys', JSON.stringify(newKeys));
    setShowKeyModal(false);
  };

  // Create New Chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      createdAt: 'Just now',
      modelId: selectedModelId,
      personaId: selectedPersonaId,
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Started new conversation using **${activeModel.name}** as **${activePersona.name}**. How can I assist you?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Send Message & Stream Response
  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || isStreaming) return;

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: nowTime,
      contextAttached: attachedContext || undefined
    };

    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: nowTime
    };

    // Update session title on first user message
    const updatedMessages = [...activeSession.messages, userMsg, initialAssistantMsg];
    const newTitle = activeSession.messages.length <= 1 ? text.slice(0, 30) : activeSession.title;

    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: newTitle, messages: updatedMessages } : s));
    setInputVal('');
    setAttachedContext(null);
    setIsStreaming(true);

    let accumulatedContent = '';

    const key = activeModel.provider === 'claude'
      ? apiKeys.claude
      : activeModel.provider === 'openai'
      ? apiKeys.openai
      : apiKeys.gemini;

    await AIEngine.streamCompletion({
      provider: activeModel.provider,
      model: activeModel.id,
      apiKey: key,
      messages: [...activeSession.messages, userMsg],
      systemPrompt: activePersona.systemPrompt,
      onChunk: (chunk: string) => {
        accumulatedContent += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m)
            };
          }
          return s;
        }));
      },
      onError: (errMsg: string) => {
        setIsStreaming(false);
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === assistantMsgId ? { ...m, content: `⚠️ **Error**: ${errMsg}\n\nPlease check your API key in AI Settings.` } : m)
            };
          }
          return s;
        }));
      },
      onComplete: () => {
        setIsStreaming(false);
      }
    });
  };

  // Context Grabbers
  const handleGrabClipboard = () => {
    navigator.clipboard.readText().then(clip => {
      if (clip) {
        setAttachedContext({ type: 'clipboard', detail: clip });
      }
    });
  };

  const handleGrabWindow = () => {
    setAttachedContext({ type: 'window', detail: 'Active Foreground App: Visual Studio Code (nova-dock)' });
  };

  const handleGrabScreenshot = () => {
    setAttachedContext({ type: 'screenshot', detail: 'Primary Screen Capture (1920x1080px)' });
  };

  // Voice Input (Web Speech Recognition)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser engine.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputVal(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Read Aloud
  const handleReadAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_-]/g, ''));
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Markdown Code Block Formatter
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={idx} className="my-2 rounded-xl bg-slate-950/90 border border-white/10 overflow-hidden font-mono text-xs">
            <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between text-[11px] text-white/50">
              <span className="uppercase">{lang || 'CODE'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <FluentIcon name="Copy" size={11} />
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-emerald-300 leading-relaxed custom-scrollbar">
              {code}
            </pre>
          </div>
        );
      }

      // Basic Markdown formatting (bold, headers, bullets)
      return (
        <div key={idx} className="whitespace-pre-wrap leading-relaxed text-xs">
          {part}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex gap-3 text-white">
      {/* Left Sidebar: Saved Chats & Model / Persona Config */}
      <div className="w-60 h-full flex flex-col space-y-2 border-r border-white/10 pr-2">
        {/* Model Switcher Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">AI Model</label>
          <select
            value={selectedModelId}
            onChange={e => setSelectedModelId(e.target.value)}
            className="w-full px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
          >
            {SUPPORTED_MODELS.map(m => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.name} ({m.contextWindow})
              </option>
            ))}
          </select>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">Persona</label>
          <select
            value={selectedPersonaId}
            onChange={e => setSelectedPersonaId(e.target.value)}
            className="w-full px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
          >
            {DEFAULT_PERSONAS.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow"
        >
          <FluentIcon name="Plus" size={13} />
          <span>New Chat</span>
        </button>

        {/* Saved Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                activeSessionId === s.id
                  ? 'bg-white/15 border-white/20 text-white shadow'
                  : 'bg-white/[0.02] border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <div className="truncate flex-1 pr-1">
                <div className="text-xs font-medium truncate">{s.title}</div>
                <div className="text-[10px] text-white/40">{s.messages.length} messages</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (sessions.length > 1) {
                    setSessions(prev => prev.filter(x => x.id !== s.id));
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-white"
              >
                <FluentIcon name="Trash2" size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Keys Button */}
        <button
          onClick={() => setShowKeyModal(true)}
          className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/70 flex items-center justify-center gap-1.5"
        >
          <FluentIcon name="Key" size={12} className="text-amber-400" />
          <span>Configure API Keys</span>
        </button>
      </div>

      {/* Right Column: Chat Stream & Message Input */}
      <div className="flex-1 h-full flex flex-col space-y-2">
        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 custom-scrollbar">
          {activeSession.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[10px] text-white/40">
                <span className="font-semibold text-white/70">{msg.role === 'user' ? 'You' : activeModel.name}</span>
                <span>· {msg.timestamp}</span>
                {msg.role === 'assistant' && msg.content && (
                  <button
                    onClick={() => handleReadAloud(msg.content)}
                    title="Read Aloud"
                    className="hover:text-white ml-1"
                  >
                    <FluentIcon name="Volume2" size={11} />
                  </button>
                )}
              </div>

              {/* Context Tag if attached */}
              {msg.contextAttached && (
                <div className="mb-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-cyan-300 flex items-center gap-1 font-mono">
                  <FluentIcon name="Paperclip" size={10} />
                  <span>{msg.contextAttached.type}: {msg.contextAttached.detail.slice(0, 30)}...</span>
                </div>
              )}

              {/* Content Bubble */}
              <div
                className={`max-w-[85%] p-3 rounded-2xl border ${
                  msg.role === 'user'
                    ? 'bg-[var(--nova-accent,#7c5cff)]/30 border-[var(--nova-accent,#7c5cff)]/40 text-white rounded-br-none shadow'
                    : 'bg-white/[0.05] border-white/10 text-white/95 rounded-bl-none shadow'
                }`}
              >
                {msg.content ? (
                  renderFormattedContent(msg.content)
                ) : (
                  <div className="flex items-center gap-2 text-xs text-white/50 italic py-1">
                    <FluentIcon name="Loader2" size={13} className="animate-spin text-[var(--nova-accent,#7c5cff)]" />
                    <span>Nova is reasoning & streaming...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached Context Preview Pill */}
        {attachedContext && (
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 truncate">
              <FluentIcon name="Paperclip" size={13} />
              <span className="font-semibold uppercase text-[10px]">{attachedContext.type}:</span>
              <span className="truncate text-white/80">{attachedContext.detail}</span>
            </div>
            <button onClick={() => setAttachedContext(null)} className="text-white/40 hover:text-white">
              <FluentIcon name="X" size={12} />
            </button>
          </div>
        )}

        {/* Context Grabbers & Slash Commands Toolbar */}
        <div className="flex items-center justify-between text-xs text-white/60 px-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleGrabClipboard}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] flex items-center gap-1"
            >
              <FluentIcon name="Clipboard" size={11} className="text-amber-400" />
              <span>+ Clipboard</span>
            </button>

            <button
              onClick={handleGrabScreenshot}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] flex items-center gap-1"
            >
              <FluentIcon name="Camera" size={11} className="text-purple-400" />
              <span>+ Screen</span>
            </button>

            <button
              onClick={handleGrabWindow}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] flex items-center gap-1"
            >
              <FluentIcon name="AppWindow" size={11} className="text-blue-400" />
              <span>+ Active Window</span>
            </button>

            {/* Slash Menu Quick Trigger */}
            <button
              onClick={() => setShowSlashMenu(!showSlashMenu)}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] flex items-center gap-1 font-mono text-[var(--nova-accent,#7c5cff)]"
            >
              <span>/ Commands</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming && (
              <button
                onClick={() => AIEngine.cancelStream()}
                className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold"
              >
                Stop Generation
              </button>
            )}
          </div>
        </div>

        {/* Slash Command Dropdown Menu */}
        {showSlashMenu && (
          <div className="p-2 rounded-xl bg-slate-900 border border-white/20 shadow-2xl grid grid-cols-3 gap-1 animate-in fade-in">
            {[
              { cmd: '/explain-error', desc: 'Diagnose error in context' },
              { cmd: '/fix-grammar', desc: 'Polish & proofread text' },
              { cmd: '/code', desc: 'Generate refactored snippet' },
              { cmd: '/summarize', desc: 'Distill into bullet points' },
              { cmd: '/translate', desc: 'Translate into target language' },
              { cmd: '/plan', desc: 'Deconstruct into step-by-step tasks' }
            ].map(item => (
              <button
                key={item.cmd}
                onClick={() => {
                  setInputVal(`${item.cmd} `);
                  setShowSlashMenu(false);
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-left text-[11px]"
              >
                <div className="font-mono font-bold text-[var(--nova-accent,#7c5cff)]">{item.cmd}</div>
                <div className="text-[9px] text-white/50">{item.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2 p-2 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-[var(--nova-accent,#7c5cff)] transition-all">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask ${activeModel.name}, attach context, or type /help... (Shift+Enter for newline)`}
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none resize-none custom-scrollbar leading-relaxed"
          />

          <button
            onClick={toggleVoiceInput}
            title={isListening ? 'Listening...' : 'Voice Input'}
            className={`p-2 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <FluentIcon name={isListening ? 'Mic' : 'MicOff'} size={15} />
          </button>

          <button
            onClick={handleSend}
            disabled={!inputVal.trim() || isStreaming}
            className="px-4 py-2 rounded-xl bg-[var(--nova-accent,#7c5cff)] disabled:opacity-40 text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow"
          >
            Send
          </button>
        </div>
      </div>

      {/* API Keys Configuration Modal */}
      {showKeyModal && (
        <div
          onClick={() => setShowKeyModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-[460px] p-4 rounded-2xl bg-slate-950/95 border border-white/20 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">AI Provider API Keys</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-white/40 hover:text-white">
                <FluentIcon name="X" size={14} />
              </button>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              API keys are stored encrypted locally on your machine. For local models (Ollama, LM Studio), no keys are needed.
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-medium text-white/80 block mb-1">Anthropic Claude Key (sk-ant-...)</label>
                <input
                  type="password"
                  value={apiKeys.claude}
                  onChange={e => setApiKeys({ ...apiKeys, claude: e.target.value })}
                  placeholder="Paste Anthropic API key"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/80 block mb-1">OpenAI Key (sk-proj-...)</label>
                <input
                  type="password"
                  value={apiKeys.openai}
                  onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
                  placeholder="Paste OpenAI API key"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/80 block mb-1">Google Gemini Key (AIzaSy...)</label>
                <input
                  type="password"
                  value={apiKeys.gemini}
                  onChange={e => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                  placeholder="Paste Gemini API key"
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white/70"
              >
                Cancel
              </button>
              <button
                onClick={() => saveApiKeys(apiKeys)}
                className="px-4 py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-xs font-semibold text-white shadow"
              >
                Save Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
