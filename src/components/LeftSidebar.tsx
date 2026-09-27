import React, { useState } from 'react';
import {
  FolderTree,
  GitBranch,
  CheckSquare,
  ScrollText,
  Network,
  Check,
} from 'lucide-react';
import { ActiveTabId } from './TopNav';

interface LeftSidebarProps {
  activeTab: ActiveTabId;
  onSelectTab: (tab: ActiveTabId) => void;
  pendingQueueCount: number;
  activeDomainScope: {
    code: string;
    version: string;
    label: string;
  };
  onChangeDomainScope: (scope: { code: string; version: string; label: string }) => void;
}

const DOMAIN_SCOPES = [
  {
    code: 'FIN_REG_CORE',
    version: 'v4.18',
    label: 'Global Regulatory Taxonomy',
  },
  {
    code: 'MKT_DERIV_FRTB',
    version: 'v3.09',
    label: 'Basel III Trading Book Scope',
  },
  {
    code: 'GL_STATUTORY_IFRS',
    version: 'v12.0',
    label: 'Consolidated Ledger Schema',
  },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingQueueCount,
  activeDomainScope,
  onChangeDomainScope,
}) => {
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);

  const navItems: Array<{
    id: ActiveTabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'catalog',
      label: 'Entities & Nodes',
      icon: <FolderTree className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'editor',
      label: 'Staging Workflows',
      icon: <GitBranch className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'queue',
      label: 'Dual-Sign Queue',
      icon: <CheckSquare className="w-4 h-4 shrink-0" />,
      badge: pendingQueueCount,
    },
    {
      id: 'audit',
      label: 'Statutory Logs',
      icon: <ScrollText className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'config',
      label: 'DDL & Policies',
      icon: <Network className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside className="w-[216px] shrink-0 bg-[#eff4ff] border-r border-[#d5e3fd] flex flex-col justify-between min-h-[calc(100vh-45px)] select-none">
      {/* Top & Middle Sections */}
      <div className="p-3">
        {/* ACTIVE DOMAIN SCOPE */}
        <div className="relative">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#64748b] mb-2 px-1">
            ACTIVE DOMAIN SCOPE
          </div>

          <button
            type="button"
            onClick={() => setScopeMenuOpen((prev) => !prev)}
            className="w-full text-left bg-white border border-[#e2e8f0] hover:border-[#aac9f4] rounded p-2.5 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-[#0d1c2f] tracking-tight">
                {activeDomainScope.code}
              </span>
              <span className="bg-[#85f8c4] text-[#002114] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                {activeDomainScope.version}
              </span>
            </div>
            <div className="text-[11px] text-[#64748b] mt-1 truncate">
              {activeDomainScope.label}
            </div>
          </button>

          {scopeMenuOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#cbd5e1] rounded shadow-md p-1 z-30">
              {DOMAIN_SCOPES.map((sc) => {
                const isSelected = sc.code === activeDomainScope.code;
                return (
                  <button
                    key={sc.code}
                    type="button"
                    onClick={() => {
                      onChangeDomainScope(sc);
                      setScopeMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#eff4ff] text-[#01284b] font-semibold'
                        : 'hover:bg-[#f8fafc] text-[#0d1c2f]'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-[11px] font-bold">
                        {sc.code}
                      </div>
                      <div className="text-[10px] text-[#64748b]">{sc.label}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#01284b]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* REFERENCE PARTITIONS */}
        <div className="mt-5">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#64748b] mb-2 px-1">
            REFERENCE PARTITIONS
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-r text-xs transition-colors ${
                    isActive
                      ? 'bg-[#d5e3fd] text-[#01284b] font-bold border-l-[3px] border-[#01284b]'
                      : 'text-[#43474e] hover:bg-[#e6eeff] hover:text-[#0d1c2f] font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={
                        isActive ? 'text-[#01284b]' : 'text-[#43474e]'
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>

                  {typeof item.badge === 'number' && (
                    <span className="bg-[#e2dfff] text-[#4b41e1] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Engine Latency Indicator */}
      <div className="p-3">
        <div className="bg-[#e6eeff]/80 border border-[#d5e3fd] rounded p-2.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-[#0d1c2f]">Engine Latency</span>
            <span className="font-mono font-bold text-[#0d1c2f]">12ms</span>
          </div>
          <div className="w-full h-1 bg-[#cbd5e1] rounded-full overflow-hidden my-1.5">
            <div className="w-1/3 h-full bg-[#4b41e1] rounded-full" />
          </div>
          <div className="font-mono text-[9.5px] text-[#64748b]">
            Signatures: ECDSA-256 Valid
          </div>
        </div>
      </div>
    </aside>
  );
};
