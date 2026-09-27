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
      '-----BEGIN AXIOM RDM DETERMINISTIC AUDIT SIGNATURE-----',
      `CHANGE_REQUEST_ID: ${selectedCr.id}`,
      `TARGET_PARTITION: ${selectedCr.targetCode}`,
      `SCHEMA_TRANSITION: ${selectedCr.schemaFrom} -> ${selectedCr.schemaTo}`,
      `PRINCIPAL_MAKER: ${selectedCr.makerName} (${selectedCr.makerUid})`,
      `STAGING_COMMIT_UTC: ${selectedCr.stagingCommitTimestamp}`,
      `SHA256_PAYLOAD_DIGEST: ${selectedCr.sha256Full}`,
      `HSM_SIGNER: HSM-FIPS-140-L3-US-EAST`,
      '-----END AXIOM RDM DETERMINISTIC AUDIT SIGNATURE-----',
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
    // Check Segregation of Duties (SoD) if current principal authored this CR
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
      {/* Top Dark Segregation of Duties (SoD) Banner */}
      <div className="bg-[#07192f] text-white px-5 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#163252]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#102a49] border border-[#1e4976] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[#8ba9d3]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[13.5px] font-bold text-white tracking-tight">
                Enforcing Segregation of Duties (SoD)
              </span>
              <span className="bg-[#68dba9] text-[#002114] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                DUAL-CONTROL TIER 2
              </span>
            </div>
            <p className="text-xs text-[#aac9f4] mt-0.5">
              As a designated Checker, you cannot approve or sign mutations
              authored by your own authenticated principal ID (
              <span className="font-mono text-white underline decoration-[#8ba9d3]/60">
                {currentRole.principalName} / {currentRole.principalUid}
              </span>
              ).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
          <div className="text-right">
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#8ba9d3]">
              HARDWARE TOKEN SIGNER
            </div>
            <div className="font-mono text-[11px] font-bold text-[#68dba9]">
              HSM-FIPS-140-L3 [ONLINE]
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReAuthModalOpen(true)}
            className="bg-[#163252] hover:bg-[#1e3e62] border border-[#29486d] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#8ba9d3]" />
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
              <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#43474e]">
                STATUTORY DUAL-SIGN OFF ENGINE
              </span>
              <span className="bg-[#d5e3fd] text-[#01284b] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                ISO-20022 COMPLIANT
              </span>
            </div>
            <h1 className="text-[23px] font-bold text-[#0d1c2f] tracking-tight mt-1">
              Maker-Checker Governance Queue
            </h1>
            <p className="text-xs text-[#43474e] mt-1 leading-relaxed">
              Multi-party statutory sign-off gate for live market feeds, ledger
              taxonomies, and reference partition schemas. Changes are
              non-repudiable once cryptographically attested by a checker.
            </p>
          </div>

          {/* 4 Compact Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {/* Box 1 */}
            <div className="bg-white border border-[#e2e8f0] rounded p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b] leading-tight">
                PENDING
                <br />
                SLA &lt; 2H
              </div>
              <div className="text-2xl font-bold text-[#0d1c2f] mt-1 tabular-nums">
                {pendingItems.length}
              </div>
              <div className="font-mono text-[10px] text-[#ba1a1a] mt-1 flex items-center gap-1 leading-tight">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>
                  1 High
                  <br />
                  Priority
                </span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-[#e2e8f0] rounded p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b] leading-tight">
                APPROVED
                <br />
                TODAY
              </div>
              <div className="text-2xl font-bold text-[#059669] mt-1 tabular-nums">
                {approvedCount}
              </div>
              <div className="font-mono text-[10px] text-[#64748b] mt-1 leading-tight">
                100%
                <br />
                Attested
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-[#e2e8f0] rounded p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b] leading-tight">
                RETURNED /
                <br />
                REJECT
              </div>
              <div className="text-2xl font-bold text-[#ba1a1a] mt-1 tabular-nums">
                {rejectedCount}
              </div>
              <div className="font-mono text-[10px] text-[#64748b] mt-1 leading-tight">
                Maker
                <br />
                Remediation
              </div>
            </div>

            {/* Box 4 */}
            <div className="bg-white border border-[#e2e8f0] rounded p-3 min-w-[118px]">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b] leading-tight">
                MY
                <br />
                ASSIGNMENTS
              </div>
              <div className="text-2xl font-bold text-[#4b41e1] mt-1 tabular-nums">
                {assignedCount}
              </div>
              <div className="font-mono text-[10px] text-[#64748b] mt-1 leading-tight">
                Eligible
                <br />
                Signer
              </div>
            </div>
          </div>
        </div>

        {/* Queue Filter & Search Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded p-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setQueueFilterTab('pending')}
              className={`px-3 py-1.5 rounded text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                queueFilterTab === 'pending'
                  ? 'bg-[#01284b] text-white font-semibold'
                  : 'text-[#43474e] hover:bg-[#eff4ff] font-medium'
              }`}
            >
              <span>Pending Approval</span>
              <span className="bg-[#ba1a1a] text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded">
                {pendingItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQueueFilterTab('approved')}
              className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                queueFilterTab === 'approved'
                  ? 'bg-[#01284b] text-white font-semibold'
                  : 'text-[#43474e] hover:bg-[#eff4ff] font-medium'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved Today ({approvedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setQueueFilterTab('rejected')}
              className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                queueFilterTab === 'rejected'
                  ? 'bg-[#01284b] text-white font-semibold'
                  : 'text-[#43474e] hover:bg-[#eff4ff] font-medium'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected / Returned ({rejectedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setQueueFilterTab('assigned')}
              className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                queueFilterTab === 'assigned'
                  ? 'bg-[#01284b] text-white font-semibold'
                  : 'text-[#43474e] hover:bg-[#eff4ff] font-medium'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Assigned Reviews ({assignedCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#eff4ff] border border-[#d5e3fd] rounded px-2.5 py-1 w-full md:w-56">
              <Filter className="w-3 h-3 text-[#64748b] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter ticket, maker, entity..."
                className="bg-transparent text-xs text-[#0d1c2f] placeholder-[#64748b] focus:outline-none w-full"
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
              className="p-1.5 rounded hover:bg-[#eff4ff] text-[#43474e] hover:text-[#01284b] transition-colors"
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
                <span className="text-xs font-bold text-[#0d1c2f] leading-tight">
                  Queue In-
                  <br />
                  Flight
                </span>
                <span className="bg-[#d5e3fd] text-[#01284b] font-mono text-[10px] font-bold px-2 py-0.5 rounded leading-tight text-center">
                  {filteredQueue.length}
                  <br />
                  Items
                </span>
              </div>
              <span className="text-[10px] text-[#64748b] text-right leading-tight">
                Sorted by: Urgency /
                <br />
                Age
              </span>
            </div>

            {filteredQueue.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded p-6 text-center text-xs text-[#64748b]">
                No change requests match this filter view.
              </div>
            ) : (
              filteredQueue.map((cr) => {
                const isSelected = selectedCr?.id === cr.id;
                return (
                  <div
                    key={cr.id}
                    onClick={() => onSelectCr(cr.id)}
                    className={`bg-white rounded p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border border-[#94a3b8] border-l-4 border-l-[#01284b] shadow-xs'
                        : 'border border-[#e2e8f0] hover:border-[#aac9f4]'
                    }`}
                  >
                    {/* Card Top Metadata Row */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#0d1c2f]">
                          {cr.id}
                        </span>
                        {cr.priority === 'HIGH PRIORITY' && (
                          <span className="bg-[#ffdad6] text-[#93000a] font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase">
                            HIGH PRIORITY
                          </span>
                        )}
                        {cr.priority === 'NORMAL' && (
                          <span className="bg-[#d5e3fd] text-[#01284b] font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase">
                            NORMAL
                          </span>
                        )}
                        {cr.priority === 'CRITICAL' && (
                          <span className="bg-[#ba1a1a] text-white font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-[#64748b]">
                        {cr.submittedAgo}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="text-[12.5px] font-bold text-[#0d1c2f] mt-1.5 leading-snug">
                      {cr.title}
                    </div>

                    {/* Snippet */}
                    <p className="text-[11px] text-[#43474e] mt-1 line-clamp-2 leading-relaxed">
                      {cr.snippet}
                    </p>

                    {/* Bottom Maker & Ticket Pill Strip */}
                    <div className="mt-2.5 bg-[#eff4ff] rounded px-2 py-1.5 flex items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="bg-[#e2dfff] text-[#3323cc] font-bold px-1.5 py-0.5 rounded leading-tight shrink-0">
                          PS
                          <br />
                          Maker
                        </span>
                        <span className="font-semibold text-[#0d1c2f] truncate">
                          {cr.makerShortName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[9.5px] shrink-0">
                        <span className="text-[#64748b]">{cr.ticketId}</span>
                        <span className="font-bold text-[#01284b]">
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
            <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between font-mono text-[9.5px] text-[#64748b] px-0.5">
              <span>Queue ID: MCR-US-EAST-09</span>
              <span>Auto-refresh in 42s</span>
            </div>
          </div>

          {/* Right Column: Active Change Request Inspector */}
          {selectedCr && (
            <div className="flex-1 min-w-0 space-y-4 w-full">
              <div className="bg-white border border-[#e2e8f0] rounded overflow-hidden">
                {/* Top Inspector Header */}
                <div className="bg-[#f4f7fe] border-b border-[#e2e8f0] p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#01284b] text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
                          {selectedCr.id}
                        </span>
                        <span className="bg-[#1e3e62] text-white font-mono text-xs font-semibold px-2.5 py-1 rounded">
                          Target: {selectedCr.targetCode}
                        </span>
                        {selectedCr.status === 'approved' && (
                          <span className="bg-[#00462f] text-[#85f8c4] font-mono text-[10px] font-bold px-2 py-1 rounded uppercase">
                            ATTESTED &amp; PUBLISHED
                          </span>
                        )}
                        {selectedCr.status === 'rejected' && (
                          <span className="bg-[#ba1a1a] text-white font-mono text-[10px] font-bold px-2 py-1 rounded uppercase">
                            REJECTED
                          </span>
                        )}
                        {selectedCr.status === 'revision_requested' && (
                          <span className="bg-[#ffdad6] text-[#93000a] font-mono text-[10px] font-bold px-2 py-1 rounded uppercase">
                            REVISION REQUESTED
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-[#64748b] mt-1.5">
                        Schema Transition: {selectedCr.schemaFrom} →{' '}
                        <span className="font-bold text-[#0d1c2f]">
                          {selectedCr.schemaTo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#00462f] font-medium">
                      <CheckSquare className="w-4 h-4 text-[#00462f] shrink-0" />
                      <span className="leading-tight">
                        Pre-Flight Integrity
                        <br />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* 3-Column Submitter & Ticket Metadata */}
                  <div className="mt-4 pt-3 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                        TICKET REFERENCE
                      </div>
                      <div className="font-mono text-xs font-bold text-[#01284b] mt-0.5 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>Jira: {selectedCr.ticketId}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                        PRINCIPAL SUBMITTER
                      </div>
                      <div className="text-xs mt-0.5">
                        <span className="font-bold text-[#0d1c2f]">
                          {selectedCr.makerName}
                        </span>{' '}
                        <span className="font-mono text-[11px] text-[#64748b]">
                          ({selectedCr.makerTitle})
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                        SUBMISSION TIMESTAMP
                      </div>
                      <div className="font-mono text-xs text-[#43474e] mt-0.5">
                        {selectedCr.submissionTimestamp}
                      </div>
                    </div>
                  </div>

                  {/* Business Justification Box */}
                  <div className="mt-3.5 bg-[#eff4ff] border border-[#d5e3fd] rounded p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                      BUSINESS JUSTIFICATION &amp; STATUTORY INTENT
                    </div>
                    <p className="text-xs italic text-[#0d1c2f] mt-1 leading-relaxed">
                      {selectedCr.businessJustification}
                    </p>
                  </div>
                </div>

                {/* Staged Cell Changes Header */}
                <div className="px-4 py-3 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-sm font-bold text-[#0d1c2f]">
                      Staged Cell Changes
                    </h2>
                    <span className="bg-[#ffdad6] text-[#93000a] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      - Removed / Live
                    </span>
                    <span className="bg-[#85f8c4] text-[#002114] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      + Staged Addition
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#64748b] mt-1">
                    View Mode: Side-by-Side • {selectedCr.mutationsCount}{' '}
                    mutations detected across 2 records
                  </div>
                </div>

                {/* Staged Diff Inspection Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#eff4ff]/70 border-b border-[#e2e8f0] text-[10px] font-bold uppercase tracking-wider text-[#0d1c2f]">
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
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {selectedCr.diffs.map((diff) => (
                        <tr key={diff.id} className="align-top">
                          {/* RECORD KEY */}
                          <td className="p-3.5 bg-white">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  diff.isNewEntity
                                    ? 'text-[#005137]'
                                    : 'text-[#0d1c2f]'
                                }`}
                              >
                                {diff.recordKey}
                              </span>
                              {diff.isNewEntity && (
                                <span className="bg-[#00462f] text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                              {diff.recordSubKey}
                            </div>
                          </td>

                          {/* FIELD / ATTRIBUTE */}
                          <td className="p-3 bg-white text-xs font-medium text-[#0d1c2f]">
                            {diff.fieldAttribute}
                          </td>

                          {/* CURRENT LIVE VALUE */}
                          <td
                            className={`p-3 font-mono text-xs ${
                              diff.currentLiveValue === null
                                ? 'bg-[#f8fafc] text-[#64748b] italic text-[11px]'
                                : 'bg-[#fff5f5] text-[#ba1a1a]'
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
                          <td className="p-3 bg-[#e6faee] font-mono text-[11.5px] font-bold text-[#005137] space-y-0.5">
                            {diff.proposedStagedLines.map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </td>

                          {/* REGULATORY / DOWNSTREAM IMPACT */}
                          <td className="p-3.5 bg-white text-[11px] text-[#43474e] leading-snug">
                            {diff.impactTitle && (
                              <div
                                className={`font-bold flex items-center gap-1 mb-0.5 ${
                                  diff.impactAccentColor === 'indigo'
                                    ? 'text-[#4b41e1]'
                                    : 'text-[#0d1c2f]'
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
                <div className="bg-[#eff4ff] border-y border-[#d5e3fd] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white border border-[#d5e3fd] flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4 text-[#01284b]" />
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                        DETERMINISTIC CRYPTOGRAPHIC HASH
                      </div>
                      <div className="font-mono text-xs font-bold text-[#0d1c2f]">
                        SHA256: {selectedCr.sha256Short}
                      </div>
                      <div className="font-mono text-[10px] text-[#64748b]">
                        Generated automatically at Staging Commit (
                        {selectedCr.stagingCommitTimestamp})
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadSig}
                    className="bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-[#0d1c2f] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Pre-Approval Audit Hash (.sig)</span>
                  </button>
                </div>

                {/* Mandatory Reviewer Audit Narrative & Sign-Off Controls */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="audit-narrative-input"
                      className="text-xs font-bold text-[#0d1c2f]"
                    >
                      Mandatory Reviewer Audit Narrative / Condition Remarks{' '}
                      <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <span className="font-mono text-[10.5px] text-[#64748b]">
                      {currentRemarks.length} / 500 characters
                    </span>
                  </div>

                  <textarea
                    id="audit-narrative-input"
                    rows={2}
                    value={currentRemarks}
                    onChange={(e) => handleRemarksChange(e.target.value)}
                    placeholder="Enter statutory verification notes, external circular reference, or rejection reason..."
                    className="w-full bg-[#eff4ff]/60 border border-[#d5e3fd] focus:border-[#01284b] rounded p-3 text-xs text-[#0d1c2f] focus:outline-none"
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
                        className="bg-[#e6eeff] hover:bg-[#d5e3fd] text-[#0d1c2f] text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors"
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
                        className="bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Reject Change Request</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleApproveClick}
                      className="bg-[#00462f] hover:bg-[#002e1d] text-white text-xs font-bold px-6 py-3 rounded flex items-center justify-center gap-2.5 transition-colors shadow-xs"
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
              <div className="bg-white border border-[#e2e8f0] rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#01284b]" />
                    <h3 className="text-xs font-bold text-[#0d1c2f]">
                      Dual-Control Audit Trail Trailhead
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuditExplorer}
                    className="text-[11px] font-bold text-[#01284b] hover:underline"
                  >
                    Open Statutory Log Explorer →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="bg-[#eff4ff]/70 border border-[#d5e3fd] rounded p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                      MAKER STAGING EVENT
                    </div>
                    <div className="font-mono text-[11px] font-bold text-[#0d1c2f] mt-1">
                      {selectedCr.stagingEventId}
                    </div>
                    <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                      {selectedCr.stagingEventShortDate} by{' '}
                      {selectedCr.makerName}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-[#eff4ff]/70 border border-[#d5e3fd] rounded p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                      AUTOMATED RULE ENGINE
                    </div>
                    <div className="font-mono text-[11px] font-bold text-[#005137] mt-1">
                      PASS: 0 Violations ({selectedCr.rulesEvaluated} rules)
                    </div>
                    <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                      Executed via Axiom Engine v4.18
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-[#eff4ff]/70 border border-[#d5e3fd] rounded p-3">
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748b]">
                      CHECKER DUAL GATE
                    </div>
                    {selectedCr.status === 'approved' ? (
                      <>
                        <div className="font-mono text-[11px] font-bold text-[#005137] mt-1">
                          ATTESTED: ECDSA-256 SIGNED
                        </div>
                        <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                          Committed by Checker M. Keller
                        </div>
                      </>
                    ) : selectedCr.status === 'rejected' ? (
                      <>
                        <div className="font-mono text-[11px] font-bold text-[#ba1a1a] mt-1">
                          REJECTED BY CHECKER
                        </div>
                        <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                          Returned to Maker Queue
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-mono text-[11px] font-bold text-[#ba1a1a] mt-1">
                          AWAITING SECOND SIGNATURE
                        </div>
                        <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
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
        <div className="fixed inset-0 bg-[#0b192c]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#94a3b8] rounded-md shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#07192f] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#68dba9]" />
                <span className="text-xs font-bold">
                  Segregation of Duties (SoD) — Tier-2 Dual-Control Gate
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSodGateModalOpen(false)}
                className="text-[#8ba9d3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="bg-[#fff5f5] border border-[#ffdad6] rounded p-3 text-[#93000a]">
                <div className="font-bold">
                  Self-Approval Blocked by Statutory Policy (ISO-20022 / SOC-1)
                </div>
                <p className="mt-1 text-[#0d1c2f]">
                  Change Request <span className="font-mono font-bold">{selectedCr.id}</span>{' '}
                  was authored by your current active principal{' '}
                  <span className="font-mono font-bold">
                    {selectedCr.makerName} ({selectedCr.makerUid})
                  </span>
                  .
                </p>
              </div>
              <p className="text-[#43474e]">
                To complete cryptographic sign-off and publish this batch to{' '}
                <span className="font-mono font-bold">{selectedCr.targetCode}</span>,
                switch your active session scope to a designated Checker principal.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setSodGateModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#cbd5e1] font-semibold text-[#43474e]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToCheckerAndApprove}
                  className="px-4 py-1.5 rounded bg-[#00462f] hover:bg-[#002e1d] text-white font-bold flex items-center gap-1.5"
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
        <div className="fixed inset-0 bg-[#0b192c]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#94a3b8] rounded-md shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#01284b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#68dba9]" />
                <span className="text-xs font-bold">
                  HSM-FIPS-140-L3 Hardware Signer Re-Authentication
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReAuthModalOpen(false)}
                className="text-[#aac9f4] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="bg-[#eff4ff] border border-[#d5e3fd] rounded p-3 font-mono text-[11px] space-y-1">
                <div>DEVICE: YubiHSM-2 FIPS (Serial #8841-US-EAST)</div>
                <div>KEY_SLOT: 0x04 (ECDSA-P256-SHA256)</div>
                <div>SESSION_TTL: {tokenSessionTime}</div>
              </div>
              <div>
                <label className="block font-bold text-[#0d1c2f] mb-1">
                  Hardware Token Challenge OTP
                </label>
                <input
                  type="text"
                  value={tokenPin}
                  onChange={(e) => setTokenPin(e.target.value)}
                  className="w-full border border-[#cbd5e1] rounded px-3 py-1.5 font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReAuthModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#cbd5e1] font-semibold text-[#43474e]"
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
                  className="px-4 py-1.5 rounded bg-[#01284b] text-white font-semibold"
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
