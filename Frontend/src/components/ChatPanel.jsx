import { useState, useRef, useEffect, useCallback } from 'react';
import { invokeAI } from '../services/api';

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 rounded-full text-xs text-slate-500 glass">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 animate-fade-slide-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${isUser
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
          : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'}`}>
        {isUser ? 'U' : '✦'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'text-white rounded-tr-sm'
            : 'text-slate-200 rounded-tl-sm glass border border-white/5'}`}
          style={isUser ? { background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' } : {}}>
          {msg.content}
        </div>
        {msg.type === 'tool' && (
          <span className="mt-1 px-2 py-0.5 rounded text-xs text-amber-400 bg-amber-400/10 font-mono">
            {msg.toolName || 'tool call'}
          </span>
        )}
        <span className="mt-1 text-xs text-slate-600">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex-shrink-0">
        ✦
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm glass border border-white/5 flex items-center gap-1.5">
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
      content: "Hello! I'm your AI Frontend Engineer. Describe the UI you want to build and I'll generate the code for you. Try something like:\n\n• \"Make the homepage have a dark hero section with a gradient title\"\n• \"Add a navigation bar with a logo and 3 menu items\"\n• \"Create a pricing section with 3 cards\"",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState(null);
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
    setCurrentStreamId(streamMsgId);
    let streamContent = '';

    const streamMsg = { id: streamMsgId, role: 'assistant', content: '', streaming: true, timestamp: Date.now() };
    setMessages(prev => [...prev, streamMsg]);

    try {
      await invokeAI(text, sandboxId, (chunk, type) => {
        if (type === 'tool') {
          // Push tool log to the Logs panel
          onToolLog?.(chunk, 'tool');
          // Also show tool calls inline in chat
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
            // Insert before streaming message
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
      setCurrentStreamId(null);
    }
  }, [input, isStreaming, sandboxId, addMessage, updateLastAssistantMessage, finalizeAssistantMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0f0f1a]">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)' }}>
          ✦
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">AI Frontend Engineer</p>
          <p className="text-xs text-slate-500">Powered by Gemini</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className={`text-xs ${isStreaming ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isStreaming ? 'Thinking…' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isStreaming && !messages.find(m => m.streaming) && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/5 bg-[#0f0f1a]">
        {/* Quick suggestions */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {['Dark hero section', 'Add navbar', 'Pricing cards', 'Footer with links'].map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs text-slate-400 glass hover:text-slate-200 hover:border-indigo-500/30 transition-all duration-200"
            >
              {s}
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
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-slate-200 placeholder-slate-600 resize-none focus-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'inherit',
                lineHeight: '1.5',
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
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
          >
            {isStreaming ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" fill="white" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-700 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
