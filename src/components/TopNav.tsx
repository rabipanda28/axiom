import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  ShieldCheck,
  UserCheck,
  Eye,
  Database,
  GitPullRequest,
  FileText,
} from 'lucide-react';
import {
  RoleOption,
  ROLE_OPTIONS,
  DatasetItem,
  ChangeRequestItem,
  StatutoryLogEntry,
} from '../data/rdmData';
import avatarImg from '../assets/images/avatar_elena_rostova_1790477866815.jpg';

export type ActiveTabId =
  | 'catalog'
  | 'editor'
  | 'queue'
  | 'audit'
  | 'config';

interface TopNavProps {
  activeTab: ActiveTabId;
  onSelectTab: (tab: ActiveTabId) => void;
  pendingQueueCount: number;
  currentRole: RoleOption;
  onSelectRole: (role: RoleOption) => void;
  datasets: DatasetItem[];
  changeRequests: ChangeRequestItem[];
  statutoryLogs: StatutoryLogEntry[];
  onJumpToDataset: (datasetId: string) => void;
  onJumpToCr: (crId: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  pendingQueueCount,
  currentRole,
  onSelectRole,
  datasets,
  changeRequests,
  statutoryLogs,
  onJumpToDataset,
  onJumpToCr,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmedQuery = globalSearch.trim().toLowerCase();
  const matchedDatasets = trimmedQuery
    ? datasets.filter(
        (d) =>
          d.name.toLowerCase().includes(trimmedQuery) ||
          d.code.toLowerCase().includes(trimmedQuery) ||
          d.domain.toLowerCase().includes(trimmedQuery)
      )
    : [];
  const matchedCrs = trimmedQuery
    ? changeRequests.filter(
        (c) =>
          c.id.toLowerCase().includes(trimmedQuery) ||
          c.title.toLowerCase().includes(trimmedQuery) ||
          c.targetCode.toLowerCase().includes(trimmedQuery) ||
          c.ticketId.toLowerCase().includes(trimmedQuery)
      )
    : [];
  const matchedLogs = trimmedQuery
    ? statutoryLogs.filter(
        (l) =>
          l.eventId.toLowerCase().includes(trimmedQuery) ||
          l.commitHash.toLowerCase().includes(trimmedQuery) ||
          l.datasetCode.toLowerCase().includes(trimmedQuery)
      )
    : [];

  return (
    <header className="w-full flex items-stretch border-b border-[#d5e3fd] bg-white select-none z-40 relative">
      {/* Main Dark Navy Top Bar */}
      <div className="flex-1 bg-[#01284b] text-white flex items-center justify-between px-3 py-1.5 gap-3 min-w-0">
        {/* Left Brand & Cluster */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            {/* Brand mark matching screenshot */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-[#0c355f] border border-[#235284] flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-[#5294e2]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <polygon points="12 2 22 12 12 22 2 12 12 2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="hidden 2xl:flex flex-col leading-none text-[8px] font-mono text-[#3d648f] tracking-tighter pr-1 border-r border-[#1a4068]">
                <span>AXIOM</span>
                <span>RDM &amp; GOVERNA</span>
              </div>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-white group-hover:text-[#aac9f4] transition-colors">
                Axiom RDM
              </span>
              <span className="text-[8.5px] font-mono uppercase tracking-[0.14em] text-[#8ba9d3]">
                ENTERPRISE GOVERNANCE
              </span>
            </div>
          </button>

          {/* PROD - CLUSTER US-EAST Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#0d3359] border border-[#1d4b78] rounded px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-[#34d399] shrink-0" />
            <span className="font-mono text-[10px] font-semibold tracking-wider text-white whitespace-nowrap">
              PROD - CLUSTER US-EAST
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="flex items-center gap-1 xl:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className={`px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'catalog'
                ? 'bg-[#1e3e62] text-white font-bold border-b-2 border-[#8ba9d3]'
                : 'text-[#aac9f4] hover:text-white hover:bg-[#0d3359]/60 font-medium'
            }`}
          >
            <span className="text-left">
              Dataset
              <br className="hidden xl:inline" /> Catalog
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('editor')}
            className={`px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'editor'
                ? 'bg-[#1e3e62] text-white font-bold border-b-2 border-[#8ba9d3]'
                : 'text-[#aac9f4] hover:text-white hover:bg-[#0d3359]/60 font-medium'
            }`}
          >
            <span className="text-left">
              Data Editor &amp;
              <br className="hidden xl:inline" /> Maker
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('queue')}
            className={`px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-2 leading-tight ${
              activeTab === 'queue'
                ? 'bg-[#1e3e62] text-white font-bold border-b-2 border-[#8ba9d3]'
                : 'text-[#aac9f4] hover:text-white hover:bg-[#0d3359]/60 font-medium'
            }`}
          >
            <span className="text-left">
              Maker-Checker
              <br className="hidden xl:inline" /> Queue
            </span>
            <span className="bg-[#dc2626] text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-tight text-center">
              {pendingQueueCount}
              <span className="block text-[8px] font-sans font-semibold">
                Pending
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('audit')}
            className={`px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'audit'
                ? 'bg-[#1e3e62] text-white font-bold border-b-2 border-[#8ba9d3]'
                : 'text-[#aac9f4] hover:text-white hover:bg-[#0d3359]/60 font-medium'
            }`}
          >
            <span className="text-left">
              Audit Trail
              <br className="hidden xl:inline" /> Explorer
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('config')}
            className={`px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'config'
                ? 'bg-[#1e3e62] text-white font-bold border-b-2 border-[#8ba9d3]'
                : 'text-[#aac9f4] hover:text-white hover:bg-[#0d3359]/60 font-medium'
            }`}
          >
            <span className="text-left">
              System Config
              <br className="hidden xl:inline" /> &amp; Schema
            </span>
          </button>
        </nav>

        {/* Global Search Input */}
        <div ref={searchRef} className="relative w-56 xl:w-72 shrink-0">
          <div className="flex items-center bg-[#103458] border border-[#254f7a] rounded px-2.5 py-1.5 focus-within:border-[#8ba9d3]">
            <Search className="w-3.5 h-3.5 text-[#8ba9d3] shrink-0 mr-2" />
            <input
              type="text"
              value={globalSearch}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search reference tables, schemas, or audit IDs..."
              className="bg-transparent text-xs text-white placeholder-[#8ba9d3]/80 focus:outline-none w-full"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="text-[10px] text-[#8ba9d3] hover:text-white ml-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Live Global Search Dropdown */}
          {searchFocused && trimmedQuery.length > 0 && (
            <div className="absolute right-0 mt-1.5 w-96 bg-white border border-[#cbd5e1] rounded shadow-lg text-[#0d1c2f] z-50 max-h-96 overflow-y-auto p-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 py-1">
                Global Partition &amp; Audit Search
              </div>
              {matchedDatasets.length === 0 &&
                matchedCrs.length === 0 &&
                matchedLogs.length === 0 && (
                  <div className="px-3 py-4 text-xs text-[#64748b] text-center">
                    No matching datasets, change requests, or audit hashes for &ldquo;{globalSearch}&rdquo;.
                  </div>
                )}

              {matchedDatasets.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-semibold text-[#01284b] px-2 py-1 bg-[#eff4ff] rounded">
                    Reference Datasets ({matchedDatasets.length})
                  </div>
                  {matchedDatasets.map((ds) => (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => {
                        onJumpToDataset(ds.id);
                        setSearchFocused(false);
                        setGlobalSearch('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-[#eff4ff] rounded flex items-center justify-between text-xs mt-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-[#01284b]" />
                        <span className="font-semibold">{ds.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#64748b]">
                        {ds.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedCrs.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-semibold text-[#01284b] px-2 py-1 bg-[#eff4ff] rounded">
                    Maker-Checker Queue ({matchedCrs.length})
                  </div>
                  {matchedCrs.map((cr) => (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => {
                        onJumpToCr(cr.id);
                        setSearchFocused(false);
                        setGlobalSearch('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-[#eff4ff] rounded flex items-center justify-between text-xs mt-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <GitPullRequest className="w-3.5 h-3.5 text-[#4b41e1]" />
                        <span className="font-mono font-bold">{cr.id}</span>
                        <span className="truncate max-w-[140px]">{cr.title}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#64748b]">
                        {cr.ticketId}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedLogs.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-[#01284b] px-2 py-1 bg-[#eff4ff] rounded">
                    Statutory Audit Logs ({matchedLogs.length})
                  </div>
                  {matchedLogs.map((log) => (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => {
                        onSelectTab('audit');
                        setSearchFocused(false);
                        setGlobalSearch('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-[#eff4ff] rounded flex items-center justify-between text-xs mt-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#059669]" />
                        <span className="font-mono font-semibold">{log.commitHash}</span>
                        <span className="truncate max-w-[150px]">{log.title}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#64748b]">
                        {log.datasetCode}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Cap: Role Scope Switcher, Notifications, & Executive Avatar */}
      <div className="bg-white flex items-center gap-2.5 px-3 py-1 shrink-0">
        {/* ROLE SCOPE Selector */}
        <div ref={roleRef} className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen((prev) => !prev)}
            className="bg-[#1e3e62] hover:bg-[#01284b] text-white rounded px-3 py-1 flex flex-col items-start min-w-[98px] transition-colors"
          >
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-[#aac9f4] leading-none">
              ROLE SCOPE
            </span>
            <div className="flex items-center justify-between w-full gap-2 mt-0.5">
              <span className="text-xs font-bold whitespace-nowrap">
                {currentRole.label}
              </span>
              <ChevronDown className="w-3 h-3 text-[#aac9f4]" />
            </div>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#cbd5e1] rounded shadow-lg p-1.5 z-50">
              <div className="px-2.5 py-1.5 border-b border-[#e2e8f0]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                  Active Governance Principal
                </div>
                <div className="text-xs font-bold text-[#0d1c2f] mt-0.5">
                  {currentRole.principalName} ({currentRole.principalUid})
                </div>
              </div>
              <div className="py-1 space-y-0.5">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = role.id === currentRole.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        onSelectRole(role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded flex items-start gap-2.5 transition-colors ${
                        isSelected
                          ? 'bg-[#eff4ff] text-[#01284b]'
                          : 'hover:bg-[#f8fafc] text-[#0d1c2f]'
                      }`}
                    >
                      {role.id === 'PS Maker' && (
                        <UserCheck className="w-4 h-4 text-[#4b41e1] shrink-0 mt-0.5" />
                      )}
                      {role.id === 'PS Checker' && (
                        <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      )}
                      {role.id === 'Auditor Read-Only' && (
                        <Eye className="w-4 h-4 text-[#64748b] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{role.label}</span>
                          {isSelected && (
                            <span className="font-mono text-[9px] font-bold bg-[#01284b] text-white px-1.5 py-0.2 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#43474e] mt-0.5">
                          {role.principalName} • {role.department}
                        </div>
                        <div className="font-mono text-[10px] text-[#64748b]">
                          {role.principalUid}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-1.5 rounded hover:bg-[#eff4ff] text-[#43474e] hover:text-[#01284b] transition-colors"
            title="Statutory Governance Alerts"
          >
            <Bell className="w-4 h-4" />
            {pendingQueueCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white border border-[#cbd5e1] rounded shadow-lg p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                <span className="text-xs font-bold text-[#0d1c2f]">
                  Statutory Governance Alerts
                </span>
                <span className="font-mono text-[10px] text-[#ba1a1a] font-semibold">
                  {pendingQueueCount} SLA Active
                </span>
              </div>
              <div className="divide-y divide-[#e2e8f0] max-h-64 overflow-y-auto">
                <div className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#ba1a1a]">
                      CR-2024-8891 • SLA &lt; 2H
                    </span>
                    <span className="font-mono text-[10px] text-[#64748b]">35m ago</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0d1c2f] mt-0.5">
                    CURR_REF_V2 awaiting Checker quorum
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onJumpToCr('CR-2024-8891');
                      setNotificationsOpen(false);
                    }}
                    className="text-[11px] font-semibold text-[#4b41e1] hover:underline mt-1"
                  >
                    Inspect Staged Diff →
                  </button>
                </div>
                <div className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#01284b]">
                      STATUTORY FREEZE SCHEDULED
                    </span>
                    <span className="font-mono text-[10px] text-[#64748b]">T-minus 4d</span>
                  </div>
                  <p className="text-xs text-[#43474e] mt-0.5">
                    GL_ACCT_TREE bi-annual statutory ledger lock on Nov 30, 23:59 UTC.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          className="w-7 h-7 rounded-full overflow-hidden border border-[#cbd5e1] bg-[#eff4ff] flex items-center justify-center shrink-0"
          title={`${currentRole.principalName} (${currentRole.principalUid})`}
        >
          {!avatarError ? (
            <img
              src={avatarImg}
              alt={currentRole.principalName}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-mono text-[10px] font-bold text-[#01284b]">
              ER
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
