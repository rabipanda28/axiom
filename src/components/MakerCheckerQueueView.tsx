import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  UserCheck,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckSquare,
  FileText,
  Info,
  ArrowLeftRight,
  Download,
  RotateCcw,
  Gavel,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ChangeRequestItem,
  RoleOption,
  ROLE_OPTIONS,
} from '../data/rdmData';

interface MakerCheckerQueueViewProps {
  changeRequests: ChangeRequestItem[];
  selectedCrId: string;
  onSelectCr: (crId: string) => void;
  currentRole: RoleOption;
  onSwitchRole: (role: RoleOption) => void;
  onUpdateCrStatus: (
    crId: string,
    newStatus: 'approved' | 'rejected' | 'revision_requested',
    remarks: string,
    signerRole?: RoleOption
  ) => void;
  onOpenAuditExplorer: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const MakerCheckerQueueView: React.FC<MakerCheckerQueueViewProps> = ({
  changeRequests,
  selectedCrId,
  onSelectCr,
  currentRole,
  onSwitchRole,
  onUpdateCrStatus,
  onOpenAuditExplorer,
  onNotify,
}) => {
  const [queueFilterTab, setQueueFilterTab] = useState<
    'pending' | 'approved' | 'rejected' | 'assigned'
  >('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [reAuthModalOpen, setReAuthModalOpen] = useState(false);
  const [sodGateModalOpen, setSodGateModalOpen] = useState(false);
  const [tokenPin, setTokenPin] = useState('849201');
  const [tokenSessionTime, setTokenSessionTime] = useState('14m 52s');

  const pendingItems = changeRequests.filter((c) => c.status === 'pending');
  const approvedCount =
    12 + changeRequests.filter((c) => c.status === 'approved').length - 1;
  const rejectedCount =
    2 +
    changeRequests.filter(
      (c) => c.status === 'rejected' || c.status === 'revision_requested'
    ).length -
    1;
  const assignedCount = changeRequests.filter(
    (c) => c.status === 'pending' && c.assignedToMe
  ).length;

  const filteredQueue = changeRequests.filter((cr) => {
    const matchesTab =
      (queueFilterTab === 'pending' && cr.status === 'pending') ||
      (queueFilterTab === 'approved' && cr.status === 'approved') ||
      (queueFilterTab === 'rejected' &&
        (cr.status === 'rejected' || cr.status === 'revision_requested')) ||
      (queueFilterTab === 'assigned' &&
        cr.status === 'pending' &&
        cr.assignedToMe);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      cr.id.toLowerCase().includes(q) ||
      cr.title.toLowerCase().includes(q) ||
      cr.targetCode.toLowerCase().includes(q) ||
      cr.makerName.toLowerCase().includes(q) ||
      cr.ticketId.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const selectedCr =
    changeRequests.find((c) => c.id === selectedCrId) ||
    filteredQueue[0] ||
    changeRequests[0];

  useEffect(() => {
    if (selectedCr && remarksMap[selectedCr.id] === undefined) {
      setRemarksMap((prev) => ({
        ...prev,
        [selectedCr.id]: selectedCr.defaultRemarks,
      }));
    }
  }, [selectedCr, remarksMap]);

  const currentRemarks = selectedCr
    ? remarksMap[selectedCr.id] ?? selectedCr.defaultRemarks
    : '';

  const handleRemarksChange = (val: string) => {
    if (!selectedCr) return;
    setRemarksMap((prev) => ({
      ...prev,
      [selectedCr.id]: val.slice(0, 500),
    }));
  };

  const handleDownloadSig = () => {
    if (!selectedCr) return;
    const sigContent = [
      '-----BEGIN BARCLAYS AXIOM RDM DETERMINISTIC AUDIT SIGNATURE-----',
      `CHANGE_REQUEST_ID: ${selectedCr.id}`,
      `TARGET_PARTITION: ${selectedCr.targetCode}`,
      `SCHEMA_TRANSITION: ${selectedCr.schemaFrom} -> ${selectedCr.schemaTo}`,
      `PRINCIPAL_MAKER: ${selectedCr.makerName} (${selectedCr.makerUid})`,
      `STAGING_COMMIT_UTC: ${selectedCr.stagingCommitTimestamp}`,
      `SHA256_PAYLOAD_DIGEST: ${selectedCr.sha256Full}`,
      `HSM_SIGNER: HSM-FIPS-140-L3-US-EAST`,
      '-----END BARCLAYS AXIOM RDM DETERMINISTIC AUDIT SIGNATURE-----',
    ].join('\n');

    const blob = new Blob([sigContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCr.id}_${selectedCr.targetCode}_pre_approval.sig`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(
      `Downloaded cryptographic pre-approval signature (${selectedCr.id}.sig).`,
      'info'
    );
  };

  const handleApproveClick = () => {
    if (!selectedCr) return;
    if (!currentRemarks.trim()) {
      onNotify(
        'Mandatory Reviewer Audit Narrative is required prior to production sign-off.',
        'warning'
      );
      return;
    }
    if (selectedCr.makerUid === currentRole.principalUid) {
      setSodGateModalOpen(true);
      return;
    }
    onUpdateCrStatus(selectedCr.id, 'approved', currentRemarks, currentRole);
  };

  const handleSwitchToCheckerAndApprove = () => {
    if (!selectedCr) return;
    const checkerRole =
      ROLE_OPTIONS.find((r) => r.id === 'PS Checker') || ROLE_OPTIONS[1];
    onSwitchRole(checkerRole);
    onUpdateCrStatus(selectedCr.id, 'approved', currentRemarks, checkerRole);
    setSodGateModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Dark Barclays Segregation of Duties (SoD) Banner */}
      <div className="bg-[#001b2e] text-white px-5 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#004d7a]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-[#00395d] border border-[#00AEEF]/60 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[13.5px] font-bold text-white tracking-tight">
                Enforcing Segregation of Duties (SoD)
              </span>
              <span className="bg-[#00AEEF] text-[#001b2e] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                DUAL-CONTROL TIER 2
              </span>
            </div>
            <p className="text-xs text-[#b3d4e8] mt-0.5">
              As a designated Checker, you cannot approve or sign mutations
              authored by your own authenticated principal ID (
              <span className="font-mono text-white underline decoration-[#00AEEF]">
                {currentRole.principalName} / {currentRole.principalUid}
              </span>
              ).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
          <div className="text-right">
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#8ab8d6]">
              HARDWARE TOKEN SIGNER
            </div>
            <div className="font-mono text-[11px] font-bold text-[#00AEEF]">
              HSM-FIPS-140-L3 [ONLINE]
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReAuthModalOpen(true)}
            className="bg-[#00395d] hover:bg-[#004d7a] border border-[#00AEEF]/60 text-white text-xs font-semibold px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#00AEEF]" />
            <span>Re-Auth Token</span>
          </button>
        </div>
      </div>

      {/* Main Queue Content Area */}
      <div className="p-5 max-w-[1380px] w-full space-y-4">
        {/* Title & 4 Compact KPI Cards */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#5c6f7e]">
                STATUTORY DUAL-SIGN OFF ENGINE
              </span>
              <span className="bg-[#e5f4fb] border border-[#b8e1f5] text-[#00395d] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs">
                ISO-20022 COMPLIANT
              </span>
            </div>
            <h1 className="text-[23px] font-bold text-[#00263e] tracking-tight mt-1">
              Maker-Checker Governance Queue
            </h1>
            <p className="text-xs text-[#33414c] mt-1 leading-relaxed">
              Multi-party statutory sign-off gate for live market feeds, ledger
              taxonomies, and reference partition schemas. Changes are
              non-repudiable once cryptographically attested by a checker.
            </p>
          </div>

          {/* 4 Compact Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {/* Box 1 */}
            <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e] leading-tight">
                PENDING
                <br />
                SLA &lt; 2H
              </div>
              <div className="text-2xl font-bold text-[#00263e] mt-1 tabular-nums">
                {pendingItems.length}
              </div>
              <div className="font-mono text-[10px] text-[#C8102E] mt-1 flex items-center gap-1 leading-tight">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>
                  1 High
                  <br />
                  Priority
                </span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#008a4b] rounded-xs p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e] leading-tight">
                APPROVED
                <br />
                TODAY
              </div>
              <div className="text-2xl font-bold text-[#008a4b] mt-1 tabular-nums">
                {approvedCount}
              </div>
              <div className="font-mono text-[10px] text-[#5c6f7e] mt-1 leading-tight">
                100%
                <br />
                Attested
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#C8102E] rounded-xs p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e] leading-tight">
                RETURNED /
                <br />
                REJECT
              </div>
              <div className="text-2xl font-bold text-[#C8102E] mt-1 tabular-nums">
                {rejectedCount}
              </div>
              <div className="font-mono text-[10px] text-[#5c6f7e] mt-1 leading-tight">
                Maker
                <br />
                Remediation
              </div>
            </div>

            {/* Box 4 */}
            <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#0076b6] rounded-xs p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e] leading-tight">
                MY
                <br />
                ASSIGNMENTS
              </div>
              <div className="text-2xl font-bold text-[#0076b6] mt-1 tabular-nums">
                {assignedCount}
              </div>
              <div className="font-mono text-[10px] text-[#5c6f7e] mt-1 leading-tight">
                Eligible
                <br />
                Signer
              </div>
            </div>
          </div>
        </div>

        {/* Queue Filter & Search Bar */}
        <div className="bg-white border border-[#cbd9e3] rounded-xs p-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setQueueFilterTab('pending')}
              className={`px-3 py-1.5 rounded-xs text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                queueFilterTab === 'pending'
                  ? 'bg-[#00395d] text-white font-semibold border-b-2 border-b-[#00AEEF]'
                  : 'text-[#33414c] hover:bg-[#e5f4fb] font-medium'
              }`}
            >
              <span>Pending Approval</span>
              <span className="bg-[#C8102E] text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                {pendingItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQueueFilterTab('approved')}
              className={`px-3 py-1.5 rounded-xs text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                queueFilterTab === 'approved'
                  ? 'bg-[#00395d] text-white font-semibold border-b-2 border-b-[#00AEEF]'
                  : 'text-[#33414c] hover:bg-[#e5f4fb] font-medium'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved Today ({approvedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setQueueFilterTab('rejected')}
              className={`px-3 py-1.5 rounded-xs text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                queueFilterTab === 'rejected'
                  ? 'bg-[#00395d] text-white font-semibold border-b-2 border-b-[#00AEEF]'
                  : 'text-[#33414c] hover:bg-[#e5f4fb] font-medium'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected / Returned ({rejectedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setQueueFilterTab('assigned')}
              className={`px-3 py-1.5 rounded-xs text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                queueFilterTab === 'assigned'
                  ? 'bg-[#00395d] text-white font-semibold border-b-2 border-b-[#00AEEF]'
                  : 'text-[#33414c] hover:bg-[#e5f4fb] font-medium'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Assigned Reviews ({assignedCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs px-2.5 py-1 w-full md:w-56 focus-within:border-[#00AEEF]">
              <Filter className="w-3 h-3 text-[#0076b6] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter ticket, maker, entity..."
                className="bg-transparent text-xs text-[#00263e] placeholder-[#5c6f7e] focus:outline-none w-full"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onNotify(
                  'Synchronized Queue MCR-US-EAST-09 with Arrow IPC Master Partition.',
                  'info'
                )
              }
              title="Refresh Queue"
              className="p-1.5 rounded-xs hover:bg-[#e5f4fb] text-[#33414c] hover:text-[#00395d] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Split-Pane Workspace: Queue In-Flight List (Left) + Active Inspector (Right) */}
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* Left Column: Queue In-Flight */}
          <div className="w-full lg:w-[276px] shrink-0 space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00263e] leading-tight">
                  Queue In-
                  <br />
                  Flight
                </span>
                <span className="bg-[#e5f4fb] border border-[#b8e1f5] text-[#00395d] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs leading-tight text-center">
                  {filteredQueue.length}
                  <br />
                  Items
                </span>
              </div>
              <span className="text-[10px] text-[#5c6f7e] text-right leading-tight">
                Sorted by: Urgency /
                <br />
                Age
              </span>
            </div>

            {filteredQueue.length === 0 ? (
              <div className="bg-white border border-[#cbd9e3] rounded-xs p-6 text-center text-xs text-[#5c6f7e]">
                No change requests match this filter view.
              </div>
            ) : (
              filteredQueue.map((cr) => {
                const isSelected = selectedCr?.id === cr.id;
                return (
                  <div
                    key={cr.id}
                    onClick={() => onSelectCr(cr.id)}
                    className={`bg-white rounded-xs p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border border-[#0076b6] border-l-4 border-l-[#00AEEF] shadow-xs'
                        : 'border border-[#cbd9e3] hover:border-[#00AEEF]'
                    }`}
                  >
                    {/* Card Top Metadata Row */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#00263e]">
                          {cr.id}
                        </span>
                        {cr.priority === 'HIGH PRIORITY' && (
                          <span className="bg-[#fde8eb] text-[#9e0b22] font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                            HIGH PRIORITY
                          </span>
                        )}
                        {cr.priority === 'NORMAL' && (
                          <span className="bg-[#e5f4fb] text-[#00395d] font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                            NORMAL
                          </span>
                        )}
                        {cr.priority === 'CRITICAL' && (
                          <span className="bg-[#C8102E] text-white font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#5c6f7e]">
                        {cr.submittedAgo}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="text-[12.5px] font-bold text-[#00263e] mt-1.5 leading-snug">
                      {cr.title}
                    </div>

                    {/* Snippet */}
                    <p className="text-[11px] text-[#33414c] mt-1 line-clamp-2 leading-relaxed">
                      {cr.snippet}
                    </p>

                    {/* Bottom Maker & Ticket Strip */}
                    <div className="mt-2.5 bg-[#f2f8fc] border border-[#d4dfe6] rounded-xs px-2 py-1.5 flex items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="bg-[#00395d] text-[#00AEEF] font-bold px-1.5 py-0.5 rounded-xs leading-tight shrink-0">
                          PS
                          <br />
                          Maker
                        </span>
                        <span className="font-semibold text-[#00263e] truncate">
                          {cr.makerShortName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[9.5px] shrink-0">
                        <span className="text-[#5c6f7e]">{cr.ticketId}</span>
                        <span className="font-bold text-[#00395d]">
                          • {cr.recordsCount}{' '}
                          {cr.recordsCount === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Queue Footer */}
            <div className="pt-2 border-t border-[#cbd9e3] flex items-center justify-between font-mono text-[9.5px] text-[#5c6f7e] px-0.5">
              <span>Queue ID: MCR-US-EAST-09</span>
              <span>Auto-refresh in 42s</span>
            </div>
          </div>

          {/* Right Column: Active Change Request Inspector */}
          {selectedCr && (
            <div className="flex-1 min-w-0 space-y-4 w-full">
              <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs overflow-hidden">
                {/* Top Inspector Header */}
                <div className="bg-[#f2f8fc] border-b border-[#cbd9e3] p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#00263e] text-white font-mono text-xs font-bold px-2.5 py-1 rounded-xs">
                          {selectedCr.id}
                        </span>
                        <span className="bg-[#00395d] border-l-2 border-l-[#00AEEF] text-white font-mono text-xs font-semibold px-2.5 py-1 rounded-xs">
                          Target: {selectedCr.targetCode}
                        </span>
                        {selectedCr.status === 'approved' && (
                          <span className="bg-[#008a4b] text-white font-mono text-[10px] font-bold px-2 py-1 rounded-xs uppercase">
                            ATTESTED &amp; PUBLISHED
                          </span>
                        )}
                        {selectedCr.status === 'rejected' && (
                          <span className="bg-[#C8102E] text-white font-mono text-[10px] font-bold px-2 py-1 rounded-xs uppercase">
                            REJECTED
                          </span>
                        )}
                        {selectedCr.status === 'revision_requested' && (
                          <span className="bg-[#fde8eb] text-[#9e0b22] font-mono text-[10px] font-bold px-2 py-1 rounded-xs uppercase">
                            REVISION REQUESTED
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-[#5c6f7e] mt-1.5">
                        Schema Transition: {selectedCr.schemaFrom} →{' '}
                        <span className="font-bold text-[#00263e]">
                          {selectedCr.schemaTo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#006837] font-medium">
                      <CheckSquare className="w-4 h-4 text-[#008a4b] shrink-0" />
                      <span className="leading-tight">
                        Pre-Flight Integrity
                        <br />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* 3-Column Submitter & Ticket Metadata */}
                  <div className="mt-4 pt-3 border-t border-[#d4dfe6] grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                        TICKET REFERENCE
                      </div>
                      <div className="font-mono text-xs font-bold text-[#0076b6] mt-0.5 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>Jira: {selectedCr.ticketId}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                        PRINCIPAL SUBMITTER
                      </div>
                      <div className="text-xs mt-0.5">
                        <span className="font-bold text-[#00263e]">
                          {selectedCr.makerName}
                        </span>{' '}
                        <span className="font-mono text-[11px] text-[#5c6f7e]">
                          ({selectedCr.makerTitle})
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                        SUBMISSION TIMESTAMP
                      </div>
                      <div className="font-mono text-xs text-[#33414c] mt-0.5">
                        {selectedCr.submissionTimestamp}
                      </div>
                    </div>
                  </div>

                  {/* Business Justification Box */}
                  <div className="mt-3.5 bg-white border border-[#cbd9e3] border-l-2 border-l-[#00AEEF] rounded-xs p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                      BUSINESS JUSTIFICATION &amp; STATUTORY INTENT
                    </div>
                    <p className="text-xs italic text-[#00263e] mt-1 leading-relaxed">
                      {selectedCr.businessJustification}
                    </p>
                  </div>
                </div>

                {/* Staged Cell Changes Header */}
                <div className="px-4 py-3 border-b border-[#cbd9e3]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-sm font-bold text-[#00263e]">
                      Staged Cell Changes
                    </h2>
                    <span className="bg-[#fde8eb] border border-[#f8b4be] text-[#9e0b22] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs">
                      - Removed / Live
                    </span>
                    <span className="bg-[#e6f5ee] border border-[#8ce0b8] text-[#006837] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs">
                      + Staged Addition
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#5c6f7e] mt-1">
                    View Mode: Side-by-Side • {selectedCr.mutationsCount}{' '}
                    mutations detected across 2 records
                  </div>
                </div>

                {/* Staged Diff Inspection Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#edf5fa] border-b border-[#cbd9e3] text-[10px] font-bold uppercase tracking-wider text-[#00395d]">
                        <th className="py-2.5 px-3.5 w-[18%]">RECORD KEY</th>
                        <th className="py-2.5 px-3 w-[16%]">
                          FIELD /
                          <br />
                          ATTRIBUTE
                        </th>
                        <th className="py-2.5 px-3 w-[22%]">
                          CURRENT LIVE
                          <br />
                          VALUE
                        </th>
                        <th className="py-2.5 px-3 w-[25%]">
                          PROPOSED STAGED VALUE
                        </th>
                        <th className="py-2.5 px-3.5 w-[19%]">
                          REGULATORY /
                          <br />
                          DOWNSTREAM
                          <br />
                          IMPACT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d4dfe6]">
                      {selectedCr.diffs.map((diff) => (
                        <tr key={diff.id} className="align-top">
                          {/* RECORD KEY */}
                          <td className="p-3.5 bg-white">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  diff.isNewEntity
                                    ? 'text-[#006837]'
                                    : 'text-[#00263e]'
                                }`}
                              >
                                {diff.recordKey}
                              </span>
                              {diff.isNewEntity && (
                                <span className="bg-[#006837] text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-xs">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-[#5c6f7e] mt-0.5">
                              {diff.recordSubKey}
                            </div>
                          </td>

                          {/* FIELD / ATTRIBUTE */}
                          <td className="p-3 bg-white text-xs font-medium text-[#00263e]">
                            {diff.fieldAttribute}
                          </td>

                          {/* CURRENT LIVE VALUE */}
                          <td
                            className={`p-3 font-mono text-xs ${
                              diff.currentLiveValue === null
                                ? 'bg-[#f4f7f9] text-[#5c6f7e] italic text-[11px]'
                                : 'bg-[#fde8eb]/70 text-[#C8102E]'
                            }`}
                          >
                            {diff.currentLiveValue === null ? (
                              <span>
                                (None - Newly
                                <br />
                                created entity
                                <br />
                                record)
                              </span>
                            ) : (
                              <span>
                                -{' '}
                                <span className="line-through">
                                  {diff.currentLiveValue}
                                </span>
                              </span>
                            )}
                          </td>

                          {/* PROPOSED STAGED VALUE */}
                          <td className="p-3 bg-[#e6f5ee] font-mono text-[11.5px] font-bold text-[#006837] space-y-0.5">
                            {diff.proposedStagedLines.map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </td>

                          {/* REGULATORY / DOWNSTREAM IMPACT */}
                          <td className="p-3.5 bg-white text-[11px] text-[#33414c] leading-snug">
                            {diff.impactTitle && (
                              <div
                                className={`font-bold flex items-center gap-1 mb-0.5 ${
                                  diff.impactAccentColor === 'indigo'
                                    ? 'text-[#0076b6]'
                                    : 'text-[#00263e]'
                                }`}
                              >
                                {diff.impactIcon === 'shield' && (
                                  <FileText className="w-3 h-3 shrink-0" />
                                )}
                                {diff.impactIcon === 'info' && (
                                  <Info className="w-3 h-3 shrink-0" />
                                )}
                                {diff.impactIcon === 'swap' && (
                                  <ArrowLeftRight className="w-3 h-3 shrink-0" />
                                )}
                                <span>{diff.impactTitle}</span>
                              </div>
                            )}
                            <div>{diff.impactDescription}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* DETERMINISTIC CRYPTOGRAPHIC HASH Bar */}
                <div className="bg-[#f2f8fc] border-y border-[#cbd9e3] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xs bg-white border border-[#cbd9e3] flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4 text-[#0076b6]" />
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                        DETERMINISTIC CRYPTOGRAPHIC HASH
                      </div>
                      <div className="font-mono text-xs font-bold text-[#00263e]">
                        SHA256: {selectedCr.sha256Short}
                      </div>
                      <div className="font-mono text-[10px] text-[#5c6f7e]">
                        Generated automatically at Staging Commit (
                        {selectedCr.stagingCommitTimestamp})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadSig}
                    className="bg-white hover:bg-[#e5f4fb] border border-[#cbd9e3] text-[#00263e] text-xs font-bold px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-center"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0076b6]" />
                    <span>Download Pre-Approval Audit Hash (.sig)</span>
                  </button>
                </div>

                {/* Mandatory Reviewer Audit Narrative & Sign-Off Controls */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="audit-narrative-input"
                      className="text-xs font-bold text-[#00263e]"
                    >
                      Mandatory Reviewer Audit Narrative / Condition Remarks{' '}
                      <span className="text-[#C8102E]">*</span>
                    </label>
                    <span className="font-mono text-[10.5px] text-[#5c6f7e]">
                      {currentRemarks.length} / 500 characters
                    </span>
                  </div>

                  <textarea
                    id="audit-narrative-input"
                    rows={2}
                    value={currentRemarks}
                    onChange={(e) => handleRemarksChange(e.target.value)}
                    placeholder="Enter statutory verification notes, external circular reference, or rejection reason..."
                    className="w-full bg-[#f2f8fc] border border-[#cbd9e3] focus:border-[#00AEEF] rounded-xs p-3 text-xs text-[#00263e] focus:outline-none"
                  />

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="flex flex-col items-start gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCrStatus(
                            selectedCr.id,
                            'revision_requested',
                            currentRemarks
                          )
                        }
                        className="bg-[#e5f4fb] hover:bg-[#cbe9f7] border border-[#b8e1f5] text-[#00395d] text-xs font-bold px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Maker Revision</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCrStatus(
                            selectedCr.id,
                            'rejected',
                            currentRemarks
                          )
                        }
                        className="bg-[#C8102E] hover:bg-[#9e0b22] text-white text-xs font-bold px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Reject Change Request</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleApproveClick}
                      className="bg-[#006837] hover:bg-[#004d29] border-b-2 border-b-[#00AEEF] text-white text-xs font-bold px-6 py-3 rounded-xs flex items-center justify-center gap-2.5 transition-colors shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#85f8c4]" />
                      <span className="text-left leading-tight">
                        Approve &amp; Publish to
                        <br />
                        PROD
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dual-Control Audit Trail Trailhead */}
              <div className="bg-white border border-[#cbd9e3] rounded-xs p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0076b6]" />
                    <h3 className="text-xs font-bold text-[#00263e]">
                      Dual-Control Audit Trail Trailhead
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuditExplorer}
                    className="text-[11px] font-bold text-[#0076b6] hover:text-[#00AEEF] hover:underline"
                  >
                    Open Statutory Log Explorer →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                      MAKER STAGING EVENT
                    </div>
                    <div className="font-mono text-[11px] font-bold text-[#00263e] mt-1">
                      {selectedCr.stagingEventId}
                    </div>
                    <div className="font-mono text-[10px] text-[#5c6f7e] mt-0.5">
                      {selectedCr.stagingEventShortDate} by{' '}
                      {selectedCr.makerName}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                      AUTOMATED RULE ENGINE
                    </div>
                    <div className="font-mono text-[11px] font-bold text-[#006837] mt-1">
                      PASS: 0 Violations ({selectedCr.rulesEvaluated} rules)
                    </div>
                    <div className="font-mono text-[10px] text-[#5c6f7e] mt-0.5">
                      Executed via Barclays BARX Engine v4.18
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5c6f7e]">
                      CHECKER DUAL GATE
                    </div>
                    {selectedCr.status === 'approved' ? (
                      <>
                        <div className="font-mono text-[11px] font-bold text-[#006837] mt-1">
                          ATTESTED: ECDSA-256 SIGNED
                        </div>
                        <div className="font-mono text-[10px] text-[#5c6f7e] mt-0.5">
                          Committed by Checker M. Keller
                        </div>
                      </>
                    ) : selectedCr.status === 'rejected' ? (
                      <>
                        <div className="font-mono text-[11px] font-bold text-[#C8102E] mt-1">
                          REJECTED BY CHECKER
                        </div>
                        <div className="font-mono text-[10px] text-[#5c6f7e] mt-0.5">
                          Returned to Maker Queue
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-mono text-[11px] font-bold text-[#C8102E] mt-1">
                          AWAITING SECOND SIGNATURE
                        </div>
                        <div className="font-mono text-[10px] text-[#5c6f7e] mt-0.5">
                          Requires Checker Authorization
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Segregation of Duties (SoD) Enforcement & Quick Role Hand-off Modal */}
      {sodGateModalOpen && selectedCr && (
        <div className="fixed inset-0 bg-[#001b2e]/65 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#00263e] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00AEEF]" />
                <span className="text-xs font-bold">
                  Barclays Segregation of Duties (SoD) — Tier-2 Dual-Control Gate
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSodGateModalOpen(false)}
                className="text-[#8ab8d6] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="bg-[#fde8eb] border border-[#f8b4be] rounded-xs p-3 text-[#9e0b22]">
                <div className="font-bold">
                  Self-Approval Blocked by Statutory Policy (ISO-20022 / SOC-1)
                </div>
                <p className="mt-1 text-[#00263e]">
                  Change Request <span className="font-mono font-bold">{selectedCr.id}</span>{' '}
                  was authored by your current active principal{' '}
                  <span className="font-mono font-bold">
                    {selectedCr.makerName} ({selectedCr.makerUid})
                  </span>
                  .
                </p>
              </div>
              <p className="text-[#33414c]">
                To complete cryptographic sign-off and publish this batch to{' '}
                <span className="font-mono font-bold">{selectedCr.targetCode}</span>,
                switch your active session scope to a designated Checker principal.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setSodGateModalOpen(false)}
                  className="px-3 py-1.5 rounded-xs border border-[#cbd9e3] font-semibold text-[#33414c]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToCheckerAndApprove}
                  className="px-4 py-1.5 rounded-xs bg-[#006837] hover:bg-[#004d29] text-white font-bold flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#85f8c4]" />
                  <span>Switch to Checker (M. Keller) &amp; Approve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Token Re-Auth Modal */}
      {reAuthModalOpen && (
        <div className="fixed inset-0 bg-[#001b2e]/65 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#00263e] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00AEEF]" />
                <span className="text-xs font-bold">
                  HSM-FIPS-140-L3 Hardware Signer Re-Authentication
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReAuthModalOpen(false)}
                className="text-[#8ab8d6] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3 font-mono text-[11px] space-y-1">
                <div>DEVICE: Barclays-HSM-2 FIPS (Serial #8841-US-EAST)</div>
                <div>KEY_SLOT: 0x04 (ECDSA-P256-SHA256)</div>
                <div>SESSION_TTL: {tokenSessionTime}</div>
              </div>
              <div>
                <label className="block font-bold text-[#00263e] mb-1">
                  Hardware Token Challenge OTP
                </label>
                <input
                  type="text"
                  value={tokenPin}
                  onChange={(e) => setTokenPin(e.target.value)}
                  className="w-full border border-[#cbd9e3] rounded-xs px-3 py-1.5 font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReAuthModalOpen(false)}
                  className="px-3 py-1.5 rounded-xs border border-[#cbd9e3] font-semibold text-[#33414c]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTokenSessionTime('60m 00s');
                    setReAuthModalOpen(false);
                    onNotify(
                      'Hardware Token Signer HSM-FIPS-140-L3 session renewed for 60 minutes.',
                      'success'
                    );
                  }}
                  className="px-4 py-1.5 rounded-xs bg-[#00395d] text-white font-semibold"
                >
                  Verify &amp; Renew Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
