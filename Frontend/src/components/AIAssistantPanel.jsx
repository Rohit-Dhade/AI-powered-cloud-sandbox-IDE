import { useState, useRef, useEffect } from 'react';

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'How can I assist you with your workspace today? I can help scaffold components or debug.',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Please create a new React component for the user profile card.',
    },
    {
      id: 3,
      sender: 'assistant',
      text: "Generating component... done. I've placed it in your active editor.",
    },
  ]);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userQuery = input.trim();
    setInput('');

    // Mock AI response
    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: `Understood. Processing "${userQuery}"... Updated component structure in your active workspace.`,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  return (
    <section className="h-full flex flex-col bg-surface border border-white/10 rounded-lg overflow-hidden relative">
      {/* Header */}
      <div className="h-10 border-b border-white/10 flex items-center px-4 bg-surface-container-low shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">
          smart_toy
        </span>
        <h2 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
          AI Assistant
        </h2>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-body-md text-body-md">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 max-w-[90%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start'
              }`}
          >
            <span className="text-xs text-on-surface-variant font-label-sm">
              {msg.sender === 'user' ? 'You' : 'SandboxAI'}
            </span>
            <div
              className={
                msg.sender === 'user'
                  ? 'bg-white text-black p-3 rounded-lg border border-transparent font-medium'
                  : 'bg-surface-container-high border border-white/10 p-3 rounded-lg text-on-surface'
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-white/10 shrink-0 bg-surface">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask SandboxAI..."
            className="w-full bg-[#0a0a0a] border border-white/10 text-on-surface font-body-md text-body-md px-4 py-2 rounded focus:outline-none focus:border-white transition-colors duration-150 pr-10 placeholder:text-on-surface-variant/50"
          />
          <button
            type="submit"
            aria-label="Send Message"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors duration-150 p-1 rounded hover:bg-white/5 active:scale-95 border-0 bg-transparent cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </section>
  );
}
