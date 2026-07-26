import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel({ sandboxId }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);

  const initTerminal = useCallback(() => {
    if (!containerRef.current || termRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: '#0a0a0f',
        foreground: '#e2e8f0',
        cursor: '#818cf8',
        cursorAccent: '#0a0a0f',
        black: '#1e1e32',
        red: '#f43f5e',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#6366f1',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#e2e8f0',
        brightBlack: '#383860',
        brightRed: '#fb7185',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#818cf8',
        brightMagenta: '#a78bfa',
        brightCyan: '#22d3ee',
        brightWhite: '#f8fafc',
      },
      allowTransparency: true,
      scrollback: 5000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(containerRef.current);

    setTimeout(() => {
      try { fitAddon.fit(); } catch {}
    }, 100);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;34m╭──────────────────────────────────────╮\x1b[0m');
    term.writeln('\x1b[1;34m│  \x1b[1;35mSandboxAI Terminal\x1b[1;34m                   │\x1b[0m');
    term.writeln('\x1b[1;34m│  \x1b[0;36mConnecting to sandbox...\x1b[1;34m             │\x1b[0m');
    term.writeln('\x1b[1;34m╰──────────────────────────────────────╯\x1b[0m');
    term.writeln('');

    return term;
  }, []);

  const connectSocket = useCallback((term) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socketUrl = `http://${sandboxId}.agent.localhost`;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      term.writeln('\x1b[1;32m✓ Connected to sandbox terminal\x1b[0m');
      term.writeln('');
    });

    socket.on('disconnect', () => {
      term.writeln('\r\n\x1b[1;33m⚠ Terminal disconnected. Attempting to reconnect...\x1b[0m');
    });

    socket.on('connect_error', (err) => {
      term.writeln(`\r\n\x1b[1;31m✗ Connection error: ${err.message}\x1b[0m`);
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // Send user input to the server
    term.onData((data) => {
      socket.emit('terminal-input', data);
    });

    socketRef.current = socket;
  }, [sandboxId]);

  useEffect(() => {
    const term = initTerminal();
    if (term) {
      connectSocket(term);
    }

    const handleResize = () => {
      try { fitAddonRef.current?.fit(); } catch {}
    };
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      socketRef.current?.disconnect();
      termRef.current?.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sandboxId, initTerminal, connectSocket]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Terminal toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-[#0f0f1a]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          bash — {sandboxId.slice(0, 8)}…
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      {/* Terminal container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0"
        style={{ padding: '8px' }}
      />
    </div>
  );
}
