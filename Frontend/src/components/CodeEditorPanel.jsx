import { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

const FILES = {
  'ProfileCard.tsx': {
    name: 'ProfileCard.tsx',
    icon: 'description',
    iconColor: '#519aba',
    code: `import React from 'react';

export const ProfileCard = ({ user }) => {
  return (
    <div className="p-4 border border-white/10 bg-surface rounded">
      <h3 className="text-lg text-primary font-bold">
        {user.name}
      </h3>
      <p className="text-on-surface-variant text-sm">
        {user.role}
      </p>
    </div>
  );
};`,
  },
  'utils.ts': {
    name: 'utils.ts',
    icon: 'javascript',
    iconColor: '#cbcb41',
    code: `export function formatUserName(user: { name: string; role: string }): string {
  return \`\${user.name} (\${user.role})\`;
}

export function calculateStats(items: number[]): number {
  return items.reduce((acc, curr) => acc + curr, 0);
}`,
  },
};

export default function CodeEditorPanel() {
  const [activeFile, setActiveFile] = useState('ProfileCard.tsx');

  const currentFile = FILES[activeFile] || FILES['ProfileCard.tsx'];
  const lines = useMemo(() => currentFile.code.split('\n'), [currentFile]);

  const highlightedCode = useMemo(() => {
    const lang = Prism.languages.tsx || Prism.languages.javascript;
    return Prism.highlight(currentFile.code, lang, 'tsx');
  }, [currentFile]);

  return (
    <section className="h-full flex flex-col bg-surface border border-white/10 rounded-lg overflow-hidden relative shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]">
      {/* File Tabs */}
      <div className="h-10 border-b border-white/10 flex items-center px-2 bg-surface-container-low shrink-0 gap-1 overflow-x-auto no-scrollbar">
        {Object.values(FILES).map((file) => {
          const isActive = file.name === activeFile;
          return (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className={`flex items-center gap-2 px-3 py-1 text-label-sm font-label-sm min-w-max rounded-t-md transition-colors cursor-pointer border-0 bg-transparent ${
                isActive
                  ? 'bg-surface border border-white/10 text-primary border-b-0 font-medium'
                  : 'text-on-surface-variant hover:bg-white/5 border-transparent'
              }`}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ color: file.iconColor }}
              >
                {file.icon}
              </span>
              <span>{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 overflow-auto bg-surface-dim p-4 font-code-md text-code-md leading-relaxed text-on-surface flex">
        {/* Line Numbers */}
        <div className="flex flex-col text-on-surface-variant/40 pr-4 select-none text-right border-r border-white/5 mr-4 font-code-md">
          {lines.map((_, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </div>

        {/* Highlighted Code */}
        <pre className="flex-1 whitespace-pre-wrap font-code-md text-code-md m-0">
          <code
            className="language-tsx font-code-md"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </section>
  );
}
