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
    <header className="w-full flex items-stretch border-t-2 border-t-[#00AEEF] border-b border-b-[#cbd9e3] bg-white select-none z-40 relative shadow-2xs">
      {/* Main Barclays Deep Navy (#00263E) Top Bar */}
      <div className="flex-1 bg-[#00263e] text-white flex items-center justify-between px-3.5 py-1.5 gap-3 min-w-0">
        {/* Left Barclays Brand & Cluster */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            {/* Barclays Cyan Eagle / Wing Crest Icon */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xs bg-[#00395d] border border-[#00AEEF]/50 flex items-center justify-center shadow-inner">
                <svg
                  className="w-4 h-4 text-[#00AEEF]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3L9.5 7.5L3 5.5L5.5 11.5L2 14L8.5 14.5L10.5 21L12 17.5L13.5 21L15.5 14.5L22 14L18.5 11.5L21 5.5L14.5 7.5L12 3Z" />
                </svg>
              </div>
              <div className="hidden 2xl:flex flex-col leading-none text-[8.5px] font-mono text-[#00AEEF] font-bold tracking-widest pr-2 border-r border-[#004d7a]">
                <span>BARCLAYS</span>
                <span className="text-[#8ab8d6] font-normal">BARX // RDM</span>
              </div>
            </div>

            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold tracking-[0.14em] text-[#00AEEF] uppercase">
                  BARCLAYS
                </span>
                <span className="text-[#006094] text-xs">|</span>
                <span className="text-[14.5px] font-bold tracking-tight text-white group-hover:text-[#00AEEF] transition-colors">
                  Axiom RDM
                </span>
              </div>
              <span className="text-[8.5px] font-mono uppercase tracking-[0.14em] text-[#8ab8d6]">
                CIB ENTERPRISE GOVERNANCE
              </span>
            </div>
          </button>

          {/* PROD - CLUSTER Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#00395d] border border-[#005a8c] rounded-xs px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-[#00AEEF] shrink-0" />
            <span className="font-mono text-[10px] font-semibold tracking-wider text-white whitespace-nowrap">
              PROD - CLUSTER US-EAST
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className={`px-3 py-1.5 rounded-xs text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'catalog'
                ? 'bg-[#00395d] text-white font-bold border-b-2 border-[#00AEEF]'
                : 'text-[#b3d4e8] hover:text-white hover:bg-[#00395d]/60 font-medium'
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
            className={`px-3 py-1.5 rounded-xs text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'editor'
                ? 'bg-[#00395d] text-white font-bold border-b-2 border-[#00AEEF]'
                : 'text-[#b3d4e8] hover:text-white hover:bg-[#00395d]/60 font-medium'
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
            className={`px-3 py-1.5 rounded-xs text-xs transition-colors flex items-center gap-2 leading-tight ${
              activeTab === 'queue'
                ? 'bg-[#00395d] text-white font-bold border-b-2 border-[#00AEEF]'
                : 'text-[#b3d4e8] hover:text-white hover:bg-[#00395d]/60 font-medium'
            }`}
          >
            <span className="text-left">
              Maker-Checker
              <br className="hidden xl:inline" /> Queue
            </span>
            <span className="bg-[#C8102E] text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs leading-tight text-center">
              {pendingQueueCount}
              <span className="block text-[8px] font-sans font-semibold">
                Pending
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('audit')}
            className={`px-3 py-1.5 rounded-xs text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'audit'
                ? 'bg-[#00395d] text-white font-bold border-b-2 border-[#00AEEF]'
                : 'text-[#b3d4e8] hover:text-white hover:bg-[#00395d]/60 font-medium'
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
            className={`px-3 py-1.5 rounded-xs text-xs transition-colors flex items-center gap-1.5 leading-tight ${
              activeTab === 'config'
                ? 'bg-[#00395d] text-white font-bold border-b-2 border-[#00AEEF]'
                : 'text-[#b3d4e8] hover:text-white hover:bg-[#00395d]/60 font-medium'
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
          <div className="flex items-center bg-[#001b2e] border border-[#005a8c] rounded-xs px-2.5 py-1.5 focus-within:border-[#00AEEF]">
            <Search className="w-3.5 h-3.5 text-[#00AEEF] shrink-0 mr-2" />
            <input
              type="text"
              value={globalSearch}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search reference tables, schemas, or audit IDs..."
              className="bg-transparent text-xs text-white placeholder-[#8ab8d6]/80 focus:outline-none w-full"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="text-[10px] text-[#00AEEF] hover:text-white ml-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Live Global Search Dropdown */}
          {searchFocused && trimmedQuery.length > 0 && (
            <div className="absolute right-0 mt-1.5 w-96 bg-white border border-[#00AEEF] rounded-xs shadow-lg text-[#00263e] z-50 max-h-96 overflow-y-auto p-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5c6f7e] px-2 py-1">
                Barclays Global Partition &amp; Audit Search
              </div>
              {matchedDatasets.length === 0 &&
                matchedCrs.length === 0 &&
                matchedLogs.length === 0 && (
                  <div className="px-3 py-4 text-xs text-[#5c6f7e] text-center">
                    No matching datasets, change requests, or audit hashes for &ldquo;{globalSearch}&rdquo;.
                  </div>
                )}

              {matchedDatasets.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-[#00395d] px-2 py-1 bg-[#e5f4fb] rounded-xs">
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
                      className="w-full text-left px-2.5 py-1.5 hover:bg-[#f0f8fc] rounded-xs flex items-center justify-between text-xs mt-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-[#0076b6]" />
                        <span className="font-semibold">{ds.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#5c6f7e]">
                        {ds.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedCrs.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-[#00395d] px-2 py-1 bg-[#e5f4fb] rounded-xs">
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
                      className="w-full text-left px-2.5 py-1.5 hover:bg-[#f0f8fc] rounded-xs flex items-center justify-between text-xs mt-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <GitPullRequest className="w-3.5 h-3.5 text-[#00AEEF]" />
                        <span className="font-mono font-bold">{cr.id}</span>
                        <span className="truncate max-w-[140px]">{cr.title}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#5c6f7e]">
                        {cr.ticketId}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedLogs.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-[#00395d] px-2 py-1 bg-[#e5f4fb] rounded-xs">
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
                      className="w-full text-left px-2.5 py-1.5 hover:bg-[#f0f8fc] rounded-xs flex items-center justify-between text-xs mt-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#008a4b]" />
                        <span className="font-mono font-semibold">{log.commitHash}</span>
                        <span className="truncate max-w-[150px]">{log.title}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#5c6f7e]">
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

      {/* Right Cap: Barclays Role Scope Switcher, Notifications, & Executive Avatar */}
      <div className="bg-white flex items-center gap-2.5 px-3 py-1 shrink-0 border-l border-[#d4dfe6]">
        {/* ROLE SCOPE Selector */}
        <div ref={roleRef} className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen((prev) => !prev)}
            className="bg-[#00395d] hover:bg-[#00263e] border-l-2 border-l-[#00AEEF] text-white rounded-xs px-3 py-1 flex flex-col items-start min-w-[102px] transition-colors"
          >
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-[#00AEEF] font-bold leading-none">
              ROLE SCOPE
            </span>
            <div className="flex items-center justify-between w-full gap-2 mt-0.5">
              <span className="text-xs font-bold whitespace-nowrap">
                {currentRole.label}
              </span>
              <ChevronDown className="w-3 h-3 text-[#00AEEF]" />
            </div>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs shadow-lg p-1.5 z-50">
              <div className="px-2.5 py-1.5 border-b border-[#e2e8f0]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#5c6f7e]">
                  Barclays Authenticated Principal
                </div>
                <div className="text-xs font-bold text-[#00263e] mt-0.5">
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
                      className={`w-full text-left px-2.5 py-2 rounded-xs flex items-start gap-2.5 transition-colors ${
                        isSelected
                          ? 'bg-[#e5f4fb] text-[#00395d] border-l-2 border-l-[#00AEEF]'
                          : 'hover:bg-[#f4f7f9] text-[#00263e]'
                      }`}
                    >
                      {role.id === 'PS Maker' && (
                        <UserCheck className="w-4 h-4 text-[#0076b6] shrink-0 mt-0.5" />
                      )}
                      {role.id === 'PS Checker' && (
                        <ShieldCheck className="w-4 h-4 text-[#008a4b] shrink-0 mt-0.5" />
                      )}
                      {role.id === 'Auditor Read-Only' && (
                        <Eye className="w-4 h-4 text-[#5c6f7e] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{role.label}</span>
                          {isSelected && (
                            <span className="font-mono text-[9px] font-bold bg-[#00395d] text-[#00AEEF] px-1.5 py-0.2 rounded-xs">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#33414c] mt-0.5">
                          {role.principalName} • {role.department}
                        </div>
                        <div className="font-mono text-[10px] text-[#5c6f7e]">
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
            className="relative p-1.5 rounded-xs hover:bg-[#e5f4fb] text-[#33414c] hover:text-[#00395d] transition-colors"
            title="Barclays Statutory Governance Alerts"
          >
            <Bell className="w-4 h-4" />
            {pendingQueueCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C8102E]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs shadow-lg p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                <span className="text-xs font-bold text-[#00263e]">
                  Barclays Governance Alerts
                </span>
                <span className="font-mono text-[10px] text-[#C8102E] font-bold">
                  {pendingQueueCount} SLA Active
                </span>
              </div>
              <div className="divide-y divide-[#e2e8f0] max-h-64 overflow-y-auto">
                <div className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#C8102E]">
                      CR-2024-8891 • SLA &lt; 2H
                    </span>
                    <span className="font-mono text-[10px] text-[#5c6f7e]">35m ago</span>
                  </div>
                  <p className="text-xs font-semibold text-[#00263e] mt-0.5">
                    CURR_REF_V2 awaiting Checker quorum
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onJumpToCr('CR-2024-8891');
                      setNotificationsOpen(false);
                    }}
                    className="text-[11px] font-bold text-[#0076b6] hover:text-[#00AEEF] mt-1"
                  >
                    Inspect Staged Diff →
                  </button>
                </div>
                <div className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#00395d]">
                      STATUTORY FREEZE SCHEDULED
                    </span>
                    <span className="font-mono text-[10px] text-[#5c6f7e]">T-minus 4d</span>
                  </div>
                  <p className="text-xs text-[#33414c] mt-0.5">
                    GL_ACCT_TREE bi-annual statutory ledger lock on Nov 30, 23:59 UTC.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#00AEEF] bg-[#e5f4fb] flex items-center justify-center shrink-0"
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
            <span className="font-mono text-[10px] font-bold text-[#00395d]">
              ER
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
