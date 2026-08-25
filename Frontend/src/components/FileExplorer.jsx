import { useState, useEffect, useCallback } from 'react';
import { listFiles, readFiles } from '../services/api';

function FileIcon({ name }) {
  const ext = name.split('.').pop().toLowerCase();
  const colors = {
    jsx: 'text-cyan-400',
    js: 'text-amber-400',
    ts: 'text-blue-400',
    tsx: 'text-cyan-400',
    css: 'text-purple-400',
    html: 'text-orange-400',
    json: 'text-yellow-300',
    md: 'text-slate-400',
    svg: 'text-emerald-400',
    png: 'text-rose-400',
    jpg: 'text-rose-400',
    gif: 'text-rose-400',
  };

  const color = colors[ext] || 'text-slate-500';

  const icons = {
    jsx: '⚛',
    tsx: '⚛',
    js: 'JS',
    ts: 'TS',
    css: '🎨',
    html: '🌐',
    json: '{}',
    md: '📝',
    svg: '🖼',
  };

  return (
    <span className={`text-[11px] font-mono font-extrabold w-4 text-center ${color}`}>
      {icons[ext] || '·'}
    </span>
  );
}

function buildTree(files) {
  const tree = {};
  files.forEach(f => {
    const parts = f.split('/');
    let node = tree;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        node[part] = { __file: true, __path: f };
      } else {
        node[part] = node[part] || {};
        node = node[part];
      }
    });
  });
  return tree;
}

function TreeNode({ name, node, depth = 0, onSelect, selectedFile }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isFile = node.__file;
  const isSelected = isFile && node.__path === selectedFile;

  if (isFile) {
    return (
      <button
        onClick={() => onSelect(node.__path)}
        title={node.__path}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-mono transition-all duration-150 cursor-pointer
          ${isSelected
            ? 'bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
        style={{ paddingLeft: `${10 + depth * 12}px` }}
      >
        <FileIcon name={name} />
        <span className="truncate">{name}</span>
      </button>
    );
  }

  const children = Object.entries(node).sort(([a, na], [b, nb]) => {
    const aDir = !na.__file;
    const bDir = !nb.__file;
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.localeCompare(b);
  });

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-150 cursor-pointer"
        style={{ paddingLeft: `${10 + depth * 12}px` }}
      >
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90 text-cyan-400' : 'text-slate-500'}`}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400/80 flex-shrink-0">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
        </svg>
        <span className="truncate">{name}</span>
      </button>
      {expanded && (
        <div>
          {children.map(([childName, childNode]) => (
            <TreeNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
              onSelect={handleSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ sandboxId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listFiles(sandboxId);
      setFiles(res.files || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sandboxId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleSelectFile = useCallback(async (path) => {
    setSelectedFile(path);
    setContentLoading(true);
    setFileContent(null);
    try {
      const res = await readFiles(sandboxId, [path]);
      const content = res.results?.[0]?.[`/${path}`] || res.results?.[0]?.[path] || '';
      setFileContent(content);
    } catch (err) {
      setFileContent(`Error reading file: ${err.message}`);
    } finally {
      setContentLoading(false);
    }
  }, [sandboxId]);

  const tree = buildTree(files);

  return (
    <div className="flex h-full bg-[#020617] overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 flex flex-col border-r border-indigo-500/15 bg-[#051424]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-indigo-500/15">
          <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">Explorer</span>
          <button
            onClick={fetchFiles}
            title="Refresh files"
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
            </svg>
          </button>
        </div>

        {/* File tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading && (
            <div className="space-y-2 px-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 rounded-md shimmer" style={{ width: `${60 + Math.random() * 30}%` }} />
              ))}
            </div>
          )}
          {error && (
            <p className="px-3 py-2 text-xs text-rose-400">{error}</p>
          )}
          {!loading && !error && Object.entries(tree).sort(([a, na], [b, nb]) => {
            const aDir = !na.__file;
            const bDir = !nb.__file;
            if (aDir !== bDir) return aDir ? -1 : 1;
            return a.localeCompare(b);
          }).map(([name, node]) => (
            <TreeNode
              key={name}
              name={name}
              node={node}
              depth={0}
              onSelect={handleSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        {selectedFile ? (
          <>
            {/* File tab */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-indigo-500/15 bg-[#051424]/80">
              <FileIcon name={selectedFile} />
              <span className="text-xs text-cyan-300 font-mono truncate">{selectedFile}</span>
            </div>
            {/* Code content */}
            <div className="flex-1 overflow-auto bg-[#020617] p-4">
              {contentLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              ) : (
                <pre className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap break-all">
                  {fileContent}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-xs font-mono">Select a file from the explorer to view code</p>
          </div>
        )}
      </div>
    </div>
  );
}
