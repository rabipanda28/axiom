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
    code: 'BARX_MKT_FRTB',
    version: 'v3.09',
    label: 'Barclays CIB Trading Book',
  },
  {
    code: 'BCIB_GL_IFRS',
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
    <aside className="w-[220px] shrink-0 bg-[#eef4f8] border-r border-[#cbd9e3] flex flex-col justify-between min-h-[calc(100vh-47px)] select-none">
      {/* Top & Middle Sections */}
      <div className="p-3">
        {/* ACTIVE DOMAIN SCOPE */}
        <div className="relative">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#5c6f7e] mb-2 px-1">
            ACTIVE DOMAIN SCOPE
          </div>

          <button
            type="button"
            onClick={() => setScopeMenuOpen((prev) => !prev)}
            className="w-full text-left bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] hover:border-[#0076b6] rounded-xs p-2.5 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-[#00263e] tracking-tight">
                {activeDomainScope.code}
              </span>
              <span className="bg-[#e6f5ee] border border-[#008a4b]/30 text-[#006837] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs leading-none">
                {activeDomainScope.version}
              </span>
            </div>
            <div className="text-[11px] text-[#5c6f7e] mt-1 truncate">
              {activeDomainScope.label}
            </div>
          </button>

          {scopeMenuOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs shadow-md p-1 z-30">
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
                    className={`w-full text-left px-2 py-1.5 rounded-xs text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#e5f4fb] text-[#00395d] font-semibold'
                        : 'hover:bg-[#f4f7f9] text-[#00263e]'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-[11px] font-bold">
                        {sc.code}
                      </div>
                      <div className="text-[10px] text-[#5c6f7e]">{sc.label}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#00AEEF]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* REFERENCE PARTITIONS */}
        <div className="mt-5">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#5c6f7e] mb-2 px-1">
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-r-xs text-xs transition-colors ${
                    isActive
                      ? 'bg-[#d9f0fa] text-[#00263e] font-bold border-l-[3px] border-[#00AEEF]'
                      : 'text-[#33414c] hover:bg-[#e3eff6] hover:text-[#00263e] font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={
                        isActive ? 'text-[#0076b6]' : 'text-[#5c6f7e]'
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>

                  {typeof item.badge === 'number' && (
                    <span className="bg-[#00395d] text-[#00AEEF] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs leading-none">
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
        <div className="bg-[#e3eff6] border border-[#cbd9e3] rounded-xs p-2.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-[#00263e]">Engine Latency</span>
            <span className="font-mono font-bold text-[#00395d]">12ms</span>
          </div>
          <div className="w-full h-1 bg-[#cbd9e3] rounded-full overflow-hidden my-1.5">
            <div className="w-1/3 h-full bg-[#00AEEF] rounded-full" />
          </div>
          <div className="font-mono text-[9.5px] text-[#5c6f7e]">
            Signatures: ECDSA-256 Valid
          </div>
        </div>
      </div>
    </aside>
  );
};
