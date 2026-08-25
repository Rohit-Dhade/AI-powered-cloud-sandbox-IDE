import { useState, useRef, useEffect, useCallback } from 'react';
import { invokeAI } from '../services/api';

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 rounded-full text-xs text-slate-400 glass">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3.5 mb-4 animate-fade-slide-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm
        ${isUser
          ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 text-white shadow-indigo-500/30'
          : 'bg-gradient-to-br from-cyan-400 to-indigo-600 text-white shadow-cyan-400/30'}`}>
        {isUser ? 'U' : '✦'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'text-white rounded-tr-sm shadow-md shadow-indigo-500/20'
            : 'text-slate-200 rounded-tl-sm glass-card border border-indigo-500/20 shadow-inner'}`}
          style={isUser ? { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' } : {}}>
          {msg.content}
        </div>
        {msg.type === 'tool' && (
          <span className="mt-1.5 px-3 py-1 rounded-full text-[11px] text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 font-mono shadow-sm">
            ⚙ {msg.toolName || 'tool call'}
          </span>
        )}
        <span className="mt-1 px-1 text-[10px] font-mono text-slate-500">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3.5 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-cyan-400 to-indigo-600 text-white flex-shrink-0 shadow-sm shadow-cyan-400/30">
        ✦
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm glass-card border border-indigo-500/20 flex items-center gap-1.5">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

export default function ChatPanel({ sandboxId, onToolLog, onClearLogs }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI Frontend Engineer. Describe the UI you want to build and I'll generate the code for you.",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const updateLastAssistantMessage = useCallback((content) => {
    setMessages(prev => {
      const newMsgs = [...prev];
      const lastIdx = newMsgs.length - 1;
      if (newMsgs[lastIdx]?.role === 'assistant' && newMsgs[lastIdx]?.streaming) {
        newMsgs[lastIdx] = { ...newMsgs[lastIdx], content, streaming: true };
      }
      return newMsgs;
    });
  }, []);

  const finalizeAssistantMessage = useCallback(() => {
    setMessages(prev => {
      const newMsgs = [...prev];
      const lastIdx = newMsgs.length - 1;
      if (newMsgs[lastIdx]?.role === 'assistant' && newMsgs[lastIdx]?.streaming) {
        newMsgs[lastIdx] = { ...newMsgs[lastIdx], streaming: false };
      }
      return newMsgs;
    });
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    setIsStreaming(true);

    // Clear previous agent logs when a new message is sent
    onClearLogs?.();

    const userMsgId = `user-${Date.now()}`;
    addMessage({ id: userMsgId, role: 'user', content: text, timestamp: Date.now() });

    const streamMsgId = `ai-${Date.now()}`;
    let streamContent = '';

    const streamMsg = { id: streamMsgId, role: 'assistant', content: '', streaming: true, timestamp: Date.now() };
    setMessages(prev => [...prev, streamMsg]);

    try {
      await invokeAI(text, sandboxId, (chunk, type) => {
        if (type === 'tool') {
          onToolLog?.(chunk, 'tool');
          setMessages(prev => {
            const newMsgs = [...prev];
            const toolMsg = {
              id: `tool-${Date.now()}`,
              role: 'assistant',
              content: chunk,
              type: 'tool',
              toolName: chunk.split('\n')[0],
              streaming: false,
              timestamp: Date.now(),
            };
            const streamIdx = newMsgs.findIndex(m => m.id === streamMsgId);
            if (streamIdx > -1) {
              newMsgs.splice(streamIdx, 0, toolMsg);
            }
            return newMsgs;
          });
        } else if (type === 'error') {
          onToolLog?.(chunk, 'error');
          streamContent += chunk;
          updateLastAssistantMessage(streamContent);
        } else {
          streamContent += chunk;
          updateLastAssistantMessage(streamContent);
        }
      });
      finalizeAssistantMessage();
    } catch (err) {
      onToolLog?.(err.message, 'error');
      setMessages(prev => {
        const newMsgs = [...prev];
        const idx = newMsgs.findIndex(m => m.id === streamMsgId);
        if (idx > -1) {
          newMsgs[idx] = {
            ...newMsgs[idx],
            content: `⚠️ Error: ${err.message}`,
            streaming: false,
          };
        }
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, sandboxId, addMessage, updateLastAssistantMessage, finalizeAssistantMessage, onClearLogs, onToolLog]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full bg-[#051424]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-indigo-500/15 bg-[#0d1c2d]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-gradient-to-br from-cyan-400 to-indigo-600 text-white shadow-md shadow-cyan-400/20">
          ✦
        </div>
        <div>
          <p className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">AI Engineer</p>
          <p className="text-[11px] text-cyan-400/80 font-mono">Mistral AI</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-[#051424] border border-indigo-500/20">
          <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]' : 'bg-emerald-400'}`} />
          <span className={`text-[11px] font-mono font-medium ${isStreaming ? 'text-cyan-300' : 'text-emerald-400'}`}>
            {isStreaming ? 'Generating…' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-2 bg-[#020617]/50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isStreaming && !messages.find(m => m.streaming) && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 sm:p-5 border-t border-indigo-500/15 bg-[#0d1c2d]">
        {/* Quick suggestions */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {['Dark hero section', 'Add navbar', 'Pricing cards', 'Footer links'].map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 bg-[#051424] border border-indigo-500/30 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-200 cursor-pointer shadow-sm"
            >
              + {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the UI you want to build… (Enter to send)"
              rows={1}
              disabled={isStreaming}
              className="w-full px-4 py-3 rounded-2xl text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-[#051424] border border-slate-700/60 shadow-inner leading-relaxed"
              style={{
                fontFamily: 'inherit',
                minHeight: '48px',
                maxHeight: '160px',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
            />
          </div>
          <button
            id="send-message-btn"
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 luminous-btn-primary text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {isStreaming ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-cyan-300 rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" fill="white" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2.5 text-[11px] font-mono text-slate-500 text-center">
          Shift+Enter for line break · Enter to generate
        </p>
      </div>
    </div>
  );
}
