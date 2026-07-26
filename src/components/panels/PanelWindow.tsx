'use client';

import React from 'react';
import { usePanelStore } from '@/stores/usePanelStore';

interface PanelWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
}

export default function PanelWindow({ id, title, children, expandedContent }: PanelWindowProps) {
  const { collapsed, toggleCollapse, expandedPanelId, expandPanel, closeExpanded } = usePanelStore();
  
  const isCollapsed = collapsed[id] || false;
  const isExpanded = expandedPanelId === id;

  // Render expanded overlay if this panel is currently expanded
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="flex flex-col crt-border w-full max-w-4xl max-h-full overflow-hidden" style={{ background: 'var(--crt-bg)' }}>
          {/* Header */}
          <div className="px-3 py-1.5 flex items-center justify-between border-b shrink-0 select-none" style={{ borderColor: 'var(--crt-border)', background: 'var(--crt-dim)' }}>
            <span className="text-xs tracking-widest crt-text-dim">┌ {title} [ EXPANDED ]</span>
            <button 
              onClick={closeExpanded}
              className="text-xs tracking-widest crt-glow hover:bg-white/5 px-2 cursor-pointer transition-colors"
            >
              [ CLOSE ]
            </button>
          </div>
          {/* Content */}
          <div className="p-4 flex-1 overflow-y-auto">
            {expandedContent || children}
          </div>
        </div>
      </div>
    );
  }

  // Normal / Collapsed render in the sidebar
  return (
    <div className="flex flex-col crt-border" style={{ borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
      {/* Header */}
      <div 
        className="px-3 py-1.5 flex items-center justify-between border-b shrink-0 select-none"
        style={{ borderColor: 'var(--crt-border)', background: 'var(--crt-dim)' }}
      >
        <span className="text-xs tracking-widest crt-text-dim">┌ {title}</span>
        <div className="flex gap-2">
          <button 
            onClick={() => toggleCollapse(id)}
            className="text-xs tracking-widest whitespace-nowrap crt-text-dim hover:crt-glow cursor-pointer transition-colors"
          >
            [ {isCollapsed ? '+' : '-'} ]
          </button>
          {!isCollapsed && (
            <button 
              onClick={() => expandPanel(id)}
              className="text-xs tracking-widest whitespace-nowrap crt-text-dim hover:crt-glow cursor-pointer transition-colors"
            >
              [ ⤢ ]
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 flex-1 min-h-[150px] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}
