import React, { useState } from 'react';
import {
  Download,
  Upload,
  PlusSquare,
  Database,
  Server,
  ClipboardList,
  ShieldCheck,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  History,
  Braces,
  Share2,
  AlertTriangle,
  Ban,
  CircleDollarSign,
  Network,
  Briefcase,
  FileSpreadsheet,
  Calendar,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { DatasetItem, StatutoryLogEntry } from '../data/rdmData';

interface DatasetCatalogViewProps {
  datasets: DatasetItem[];
  pendingQueueCount: number;
  statutoryLogs: StatutoryLogEntry[];
  onReviewStaging: (crId: string) => void;
  onOpenEditor: (datasetId: string) => void;
  onGoToQueue: () => void;
  onGoToAuditLogs: () => void;
  onCreateDataset: (newDs: DatasetItem) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const DatasetCatalogView: React.FC<DatasetCatalogViewProps> = ({
  datasets,
  pendingQueueCount,
  statutoryLogs,
  onReviewStaging,
  onOpenEditor,
  onGoToQueue,
  onGoToAuditLogs,
  onCreateDataset,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainTab, setDomainTab] = useState<string>('All Domains');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [compactGrid, setCompactGrid] = useState<boolean>(false);

  // Modals
  const [schemaModalDataset, setSchemaModalDataset] = useState<DatasetItem | null>(null);
  const [historyModalDataset, setHistoryModalDataset] = useState<DatasetItem | null>(null);
  const [newDatasetModalOpen, setNewDatasetModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [freezeImpactModalOpen, setFreezeImpactModalOpen] = useState(false);
  const [copiedDdl, setCopiedDdl] = useState(false);

  // New Dataset Form State
  const [newDsName, setNewDsName] = useState('');
  const [newDsCode, setNewDsCode] = useState('');
  const [newDsDomain, setNewDsDomain] = useState<'Regulatory' | 'Financial' | 'Accounting'>('Regulatory');
  const [newDsCategory, setNewDsCategory] = useState<
    'Market & Trading' | 'Risk & Compliance' | 'Accounting & GL' | 'Customer & Entity'
  >('Risk & Compliance');

  // Filter logic
  const filteredDatasets = datasets.filter((ds) => {
    const matchesSearch =
      !searchQuery.trim() ||
      ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.publisher.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || ds.governanceState === statusFilter;

    const matchesDomain =
      domainTab === 'All Domains' || ds.domainCategory === domainTab;

    return matchesSearch && matchesStatus && matchesDomain;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredDatasets.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDatasets = filteredDatasets.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleExportMetadata = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      cluster: 'PROD-CLUSTER-US-EAST',
      storageEngine: 'Arrow IPC Zero-Copy',
      totalRegisteredDatasets: 42,
      datasets: datasets.map((d) => ({
        code: d.code,
        name: d.name,
        domain: d.domain,
        version: d.version,
        rowVolume: d.rowVolume,
        governanceState: d.governanceLabel,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'axiom_rdm_catalog_metadata_v4.18.json';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported deterministic catalog metadata JSON (SHA-256 attested).', 'success');
  };

  const handleCreateDatasetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDsName.trim() || !newDsCode.trim()) return;
    const formattedCode = newDsCode.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const created: DatasetItem = {
      id: `ds-${Date.now()}`,
      name: newDsName.trim(),
      code: formattedCode,
      verified: true,
      domain: newDsDomain,
      domainCategory: newDsCategory,
      version: 'v1.0.0',
      publishedAgo: 'Just now',
      publisher: 'e.rostova',
      rowVolume: 0,
      governanceState: 'synced_active',
      governanceLabel: 'Synced & Active',
      changeVelocityPrimary: 'Initial DDL bound',
      actionType: 'open_editor',
      iconType: 'globe_ban',
      ddlSchema: `CREATE TABLE MASTER_RDM.${formattedCode} (\n  ENTITY_KEY VARCHAR(32) PRIMARY KEY NOT NULL,\n  ATTRIBUTE_PAYLOAD JSONB NOT NULL,\n  EFFECTIVE_UTC TIMESTAMP NOT NULL\n) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
      sampleRecords: [
        { KEY: 'INIT_001', NUM: '100', STATUS: 'ACTIVE', VERIFIED: 'TRUE' },
      ],
      recentCommits: [
        {
          hash: '#a109f8c',
          version: 'v1.0.0',
          author: 'e.rostova',
          checker: 'm.keller',
          timestamp: 'Just now',
          summary: 'Initial dataset partition registered in Master Partition Store',
        },
      ],
    };
    onCreateDataset(created);
    setNewDsName('');
    setNewDsCode('');
    setNewDatasetModalOpen(false);
    onNotify(`Registered new dataset definition ${formattedCode} in FIN_REG_CORE.`, 'success');
  };

  const renderDatasetIcon = (iconType: DatasetItem['iconType']) => {
    switch (iconType) {
      case 'globe_ban':
        return <Ban className="w-4 h-4 text-[#01284b]" />;
      case 'currency':
        return <CircleDollarSign className="w-4 h-4 text-[#01284b]" />;
      case 'hierarchy':
        return <Network className="w-4 h-4 text-[#01284b]" />;
      case 'briefcase':
        return <Briefcase className="w-4 h-4 text-[#01284b]" />;
      case 'tax_doc':
        return <FileSpreadsheet className="w-4 h-4 text-[#01284b]" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-[#01284b]" />;
    }
  };

  return (
    <div className="p-5 max-w-[1380px] space-y-5">
      {/* Top Breadcrumb & Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#64748b]">
            ENTERPRISE REFERENCE ARCHITECTURE /{' '}
            <span className="font-bold text-[#01284b]">
              MASTER PARTITION STORE
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-[22px] font-bold text-[#0d1c2f] tracking-tight leading-tight">
              Reference Dataset Catalog
            </h1>
            <span className="bg-[#00462f] text-[#85f8c4] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              STATE: DETERMINISTIC
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportMetadata}
            className="bg-[#e6eeff] hover:bg-[#d5e3fd] text-[#01284b] text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Metadata</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="bg-[#e6eeff] hover:bg-[#d5e3fd] text-[#01284b] text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV/JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setNewDatasetModalOpen(true)}
            className="bg-[#01284b] hover:bg-[#1e3e62] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <PlusSquare className="w-3.5 h-3.5" />
            <span>New Dataset Def</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1 */}
        <div className="bg-white border border-[#e2e8f0] rounded p-3.5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] leading-snug">
                TOTAL REFERENCE
                <br />
                DATASETS
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-[28px] font-bold text-[#0d1c2f] leading-none tabular-nums">
                  {datasets.length + 32}
                </span>
                <span className="text-xs font-semibold text-[#059669]">
                  Active &amp; Bound
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-[#e6eeff] text-[#01284b] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center gap-3 font-mono text-[10.5px] text-[#64748b]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#01284b]" />
              28 Fin
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4b41e1]" />8 Geo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />6 Reg
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#e2e8f0] rounded p-3.5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] leading-snug">
                ACTIVE RECORDS MANAGED
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[28px] font-bold text-[#0d1c2f] leading-none tabular-nums">
                  1.84M
                </span>
                <span className="font-mono text-[11px] text-[#64748b]">
                  Rows in Sync
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-[#e6eeff] text-[#01284b] flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between font-mono text-[10.5px]">
            <span className="text-[#059669] font-semibold leading-tight">
              ↑ +14.2k this
              <br />
              week
            </span>
            <span className="text-[#64748b] text-right leading-tight">
              42 Parquet
              <br />
              Partitions
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#e2e8f0] rounded p-3.5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] leading-snug">
                PENDING DUAL-CONTROL
                <br />
                SIGN-OFF
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-[28px] font-bold text-[#ba1a1a] leading-none tabular-nums">
                  {pendingQueueCount}
                </span>
                <span className="text-xs font-semibold text-[#ba1a1a]">
                  Change Batches
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
            <span className="text-[#43474e]">Checker quorum pending</span>
            <button
              type="button"
              onClick={onGoToQueue}
              className="font-mono font-bold text-[#4b41e1] hover:underline flex items-center gap-0.5"
            >
              Queue →
            </button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[#e2e8f0] rounded p-3.5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] leading-snug">
                AUDITED CHANGES (30D)
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-[28px] font-bold text-[#0d1c2f] leading-none tabular-nums">
                  1,289
                </span>
                <span className="font-mono text-[10.5px] font-bold text-[#059669]">
                  100% SHA-256
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-[#e6eeff] text-[#01284b] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between">
            <span className="font-mono text-[10.5px] text-[#64748b] leading-tight">
              Zero delta
              <br />
              deviations
            </span>
            <span className="bg-[#e6eeff] text-[#01284b] font-mono text-[10px] font-bold px-2.5 py-1 rounded leading-tight text-center">
              SOC-1/2
              <br />
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Domain Tabs Container */}
      <div className="bg-white border border-[#e2e8f0] rounded p-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="flex-1 flex items-center bg-[#eff4ff]/80 border border-[#d5e3fd] rounded px-3 py-1.5 focus-within:border-[#01284b]">
            <Search className="w-3.5 h-3.5 text-[#64748b] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter datasets by name, code, domain, or schema..."
              className="w-full bg-transparent text-xs text-[#0d1c2f] placeholder-[#64748b] focus:outline-none"
            />
          </div>

          {/* Right Select & View Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by governance status"
              className="bg-[#eff4ff] border border-[#d5e3fd] rounded px-3 py-1.5 text-xs font-medium text-[#0d1c2f] focus:outline-none focus:border-[#01284b]"
            >
              <option value="all">Status: All (42)</option>
              <option value="pending_signoff">Status: Pending Sign-Off</option>
              <option value="synced_active">Status: Synced &amp; Active</option>
              <option value="review_due">Status: Review Due (48h)</option>
            </select>

            <button
              type="button"
              onClick={() => setCompactGrid((prev) => !prev)}
              title={compactGrid ? 'Switch to standard density' : 'Switch to condensed density'}
              className={`p-1.5 rounded border transition-colors ${
                compactGrid
                  ? 'bg-[#01284b] text-white border-[#01284b]'
                  : 'bg-[#eff4ff] text-[#0d1c2f] border-[#d5e3fd] hover:bg-[#d5e3fd]'
              }`}
            >
              {compactGrid ? (
                <List className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Domain Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'All Domains', label: 'All Domains (42)' },
            { id: 'Market & Trading', label: 'Market & Trading (14)' },
            { id: 'Risk & Compliance', label: 'Risk & Compliance (12)' },
            { id: 'Accounting & GL', label: 'Accounting & GL (9)' },
            { id: 'Customer & Entity', label: 'Customer & Entity (7)' },
          ].map((tab) => {
            const isActive = domainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setDomainTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#01284b] text-white font-semibold'
                    : 'bg-[#eff4ff] text-[#0d1c2f] hover:bg-[#d5e3fd] font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Reference Datasets Table */}
      <div className="bg-white border border-[#e2e8f0] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/80 border-b border-[#e2e8f0] text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                <th className="py-2.5 px-3.5">DATASET IDENTIFIER</th>
                <th className="py-2.5 px-3">DOMAIN</th>
                <th className="py-2.5 px-3">
                  VERSION &amp;
                  <br />
                  PUBLISHER
                </th>
                <th className="py-2.5 px-3 text-right">
                  ROW
                  <br />
                  VOLUME
                </th>
                <th className="py-2.5 px-3">
                  GOVERNANCE
                  <br />
                  STATE
                </th>
                <th className="py-2.5 px-3">
                  CHANGE
                  <br />
                  VELOCITY
                </th>
                <th className="py-2.5 px-3.5 text-right">OPERATIONAL ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {paginatedDatasets.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-xs text-[#64748b]"
                  >
                    No reference datasets match your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedDatasets.map((ds) => (
                  <tr
                    key={ds.id}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >
                    {/* DATASET IDENTIFIER */}
                    <td
                      className={`${
                        compactGrid ? 'py-2' : 'py-3'
                      } px-3.5 align-middle`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded bg-[#eff4ff] flex items-center justify-center shrink-0 mt-0.5">
                            {renderDatasetIcon(ds.iconType)}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-[#0d1c2f] leading-snug">
                              {ds.name}
                            </div>
                            <div className="font-mono text-[10.5px] text-[#64748b] mt-0.5">
                              {ds.code}
                            </div>
                          </div>
                        </div>
                        {ds.verified && (
                          <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* DOMAIN */}
                    <td
                      className={`${
                        compactGrid ? 'py-2' : 'py-3'
                      } px-3 align-middle`}
                    >
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                          ds.domain === 'Accounting'
                            ? 'bg-[#e2dfff] text-[#3323cc]'
                            : 'bg-[#eff4ff] text-[#01284b]'
                        }`}
                      >
                        {ds.domain}
                      </span>
                    </td>

                    {/* VERSION & PUBLISHER */}
                    <td
                      className={`${
                        compactGrid ? 'py-2' : 'py-3'
                      } px-3 align-middle`}
                    >
                      <div className="font-mono text-[11.5px] font-bold text-[#0d1c2f]">
                        {ds.version}
                      </div>
                      <div className="text-[11px] text-[#64748b]">
                        {ds.publishedAgo} by {ds.publisher}
                      </div>
                    </td>

                    {/* ROW VOLUME */}
                    <td
                      className={`${
                        compactGrid ? 'py-2' : 'py-3'
                      } px-3 align-middle text-right font-mono text-xs font-bold text-[#0d1c2f] tabular-nums`}
                    >
                      {ds.rowVolume.toLocaleString()}
                    </td>

                    {/* GOVERNANCE STATE */}
                    <td
                      className={`${
                        compactGrid ? 'py-2' : 'py-3'
                      } px-3 align-middle`}
                    >
                      {ds.governanceState === 'pending_signoff' && (
                        <div className="inline-flex items-center gap-2 bg-[#ffdad6]/80 text-[#93000a] text-[11px] font-bold px-2.5 py-1 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
                          <span className="leading-tight">
                            {ds.pendingCount} Pending
                            <br />
                            Sign-Off
                          </span>
                        </div>
                      )}
                      {ds.governanceState === 'synced_active' && (
                        <div className="inline-flex items-center gap-2 bg-[#d5e3fd]/80 text-[#01284b] text-[11px] font-bold px-2.5 py-1 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#01284b] shrink-0" />
                          <span className="leading-tight">
                            Synced &amp;
                            <br />
                            Active
                          </span>
                        </div>
                      )}
                      {ds.governanceState === 'review_due' && (
                        <div className="inline-flex items-center gap-2 bg-[#d5e3fd]/80 text-[#01284b] text-[11px] font-bold px-2.5 py-1 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#01284b] shrink-0" />
                          <span className="leading-tight">
                            Review Due
                            <br />
                            (48h)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* CHANGE VELOCITY */}
                    <td
                      className={`${
                        compactGrid ? 'py-2' : 'py-3'
                      } px-3 align-middle font-mono text-[11px]`}
                    >
                      {ds.changeVelocityAccentFirst ? (
                        <span className="text-[#4b41e1] font-medium">
                          {ds.changeVelocityAccent}
                        </span>
                      ) : (
                        <>
                          <span className="text-[#64748b]">
                            {ds.changeVelocityPrimary}
                          </span>
                          {ds.changeVelocityAccent && (
                            <span className="text-[#4b41e1] font-medium">
                              {ds.changeVelocityAccent}
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    {/* OPERATIONAL ACTIONS */}
                    <td
                      className={`${
                        compactGrid ? 'py-2' : 'py-3'
                      } px-3.5 align-middle text-right`}
                    >
                      <div className="inline-flex items-center justify-end gap-2">
                        {ds.actionType === 'review_staging' ? (
                          <button
                            type="button"
                            onClick={() =>
                              onReviewStaging(ds.linkedCrId || 'CR-2024-8891')
                            }
                            className="bg-[#01284b] hover:bg-[#1e3e62] text-white text-[11px] font-semibold px-3 py-1 rounded leading-tight text-center transition-colors"
                          >
                            Review
                            <br />
                            Staging
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenEditor(ds.id)}
                            className="bg-[#eff4ff] hover:bg-[#d5e3fd] text-[#0d1c2f] text-[11px] font-semibold px-3 py-1.5 rounded whitespace-nowrap transition-colors"
                          >
                            Open Editor
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setHistoryModalDataset(ds)}
                          title="Inspect Commit History"
                          className="p-1.5 rounded hover:bg-[#eff4ff] text-[#43474e] hover:text-[#01284b] transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSchemaModalDataset(ds)}
                          title="Inspect DDL & Partition Schema"
                          className="p-1.5 rounded hover:bg-[#eff4ff] text-[#43474e] hover:text-[#01284b] transition-colors"
                        >
                          <Braces className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#eff4ff]/50 border-t border-[#e2e8f0] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-[#43474e]">
            <span className="font-semibold text-[#0d1c2f]">
              Showing {paginatedDatasets.length} of 42 Registered Datasets
            </span>
            <span className="text-[#cbd5e1]">|</span>
            <span className="font-mono text-[10.5px] text-[#64748b]">
              Storage Engine: Arrow IPC Zero-Copy
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2.5 py-1 rounded bg-white border border-[#e2e8f0] text-[#43474e] hover:bg-[#eff4ff] disabled:opacity-50 text-[11px] font-medium"
            >
              Previous
            </button>
            {[1, 2, 3].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-6 h-6 rounded text-[11px] font-mono font-bold flex items-center justify-center transition-colors ${
                  safePage === pageNum
                    ? 'bg-[#01284b] text-white'
                    : 'bg-[#eff4ff] text-[#0d1c2f] hover:bg-[#d5e3fd]'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              disabled={safePage === 3}
              className="px-2.5 py-1 rounded bg-[#eff4ff] text-[#0d1c2f] hover:bg-[#d5e3fd] disabled:opacity-50 text-[11px] font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Downstream Lineage & Ingestion Sync Status */}
      <div className="bg-white border border-[#e2e8f0] rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#01284b]" />
            <h2 className="text-xs font-bold text-[#0d1c2f]">
              Downstream Lineage &amp; Ingestion Sync Status
            </h2>
          </div>
          <span className="font-mono text-[10.5px] text-[#64748b]">
            Cluster Hash: #0x8F9B2C1A
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Kafka */}
          <div className="bg-[#eff4ff]/70 border border-[#d5e3fd] rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0d1c2f]">
                Kafka Topic Ingest
              </span>
              <span className="font-mono text-[10.5px] font-bold text-[#059669]">
                Active
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#64748b] mt-0.5">
              pubsub.rdm.entity.updates
            </div>
            <div className="w-full h-1.5 bg-[#cbd5e1] rounded-full overflow-hidden my-2.5">
              <div className="w-[84%] h-full bg-[#10b981] rounded-full" />
            </div>
            <div className="font-mono text-[10.5px] text-[#64748b]">
              Throughput: 4,820 msg/sec
            </div>
          </div>

          {/* Snowflake */}
          <div className="bg-[#eff4ff]/70 border border-[#d5e3fd] rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0d1c2f]">
                Snowflake Warehouse Replica
              </span>
              <span className="font-mono text-[10.5px] font-bold text-[#00462f]">
                Synced
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#64748b] mt-0.5">
              CORP_REF_DB.PUBLIC
            </div>
            <div className="w-full h-1.5 bg-[#cbd5e1] rounded-full overflow-hidden my-2.5">
              <div className="w-full h-full bg-[#10b981] rounded-full" />
            </div>
            <div className="font-mono text-[10.5px] text-[#64748b]">
              Latency: 4.2 sec (Real-Time)
            </div>
          </div>

          {/* Regulatory Reporting Mart */}
          <div className="bg-[#eff4ff]/70 border border-[#d5e3fd] rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0d1c2f]">
                Regulatory Reporting Mart
              </span>
              <span className="font-mono text-[10.5px] font-bold text-[#4b41e1]">
                Staging
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#64748b] mt-0.5">
              MAS610 / FRTB Engines
            </div>
            <div className="w-full h-1.5 bg-[#cbd5e1] rounded-full overflow-hidden my-2.5">
              <div className="w-[62%] h-full bg-[#4b41e1] rounded-full" />
            </div>
            <div className="font-mono text-[10.5px] text-[#64748b]">
              Pending {pendingQueueCount} dual-sign checks
            </div>
          </div>
        </div>
      </div>

      {/* AUDITOR READINESS */}
      <div className="bg-white border border-[#e2e8f0] rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
            AUDITOR READINESS
          </span>
          <span className="bg-[#00462f] text-[#85f8c4] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
            99.8%
          </span>
        </div>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#10b981] bg-[#eff4ff] flex items-center justify-center shrink-0">
            <span className="font-mono text-xs font-bold text-[#0d1c2f]">
              99%
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-[#0d1c2f]">
              Audit Compliance
            </div>
            <div className="text-xs text-[#64748b] mt-0.5">
              Zero unapproved delta exceptions across 42 active tables.
            </div>
          </div>
        </div>

        <div className="bg-[#eff4ff]/80 rounded p-3 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#43474e]">Dual-Sign Enforcement</span>
            <span className="font-bold text-[#0d1c2f]">STRICT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#43474e]">Cryptographic Hashing</span>
            <span className="font-bold text-[#00462f]">ENABLED (SHA256)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#43474e]">Unapproved Outliers</span>
            <span className="font-bold text-[#0d1c2f]">0 Records</span>
          </div>
        </div>
      </div>

      {/* GOVERNANCE ACTIVITY */}
      <div className="bg-white border border-[#e2e8f0] rounded p-4">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748b]">
            GOVERNANCE ACTIVITY
          </span>
          <span className="font-mono text-[11px] text-[#4b41e1]">Live Feed</span>
        </div>

        <div className="space-y-4 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-[#d5e3fd]">
          {statutoryLogs.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-start gap-3 relative">
              <div className="w-5 h-5 rounded-full bg-[#eff4ff] border border-[#d5e3fd] flex items-center justify-center shrink-0 mt-0.5 z-10">
                <CheckCircle2 className="w-3 h-3 text-[#01284b]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0d1c2f]">
                  {item.title}
                </div>
                <div className="text-xs text-[#43474e] mt-0.5">
                  {item.description}
                </div>
                <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                  {item.relativeTime} • Commit {item.commitHash}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#f1f5f9] text-center">
          <button
            type="button"
            onClick={onGoToAuditLogs}
            className="text-xs font-bold text-[#4b41e1] hover:underline"
          >
            View All Statutory Logs
          </button>
        </div>
      </div>

      {/* MAINTENANCE & FREEZES */}
      <div className="bg-[#fff5f5] border border-[#ffdad6] border-l-4 border-l-[#ba1a1a] rounded p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a]">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>MAINTENANCE &amp; FREEZES</span>
        </div>
        <p className="text-xs text-[#0d1c2f] mt-1.5">
          <span className="font-bold">GL_ACCT_TREE</span> scheduled for bi-annual
          statutory ledger lock on{' '}
          <span className="font-bold">Nov 30, 23:59 UTC</span>.
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-[10.5px] text-[#64748b]">
            T-minus 4 days
          </span>
          <button
            type="button"
            onClick={() => setFreezeImpactModalOpen(true)}
            className="bg-white hover:bg-[#ffdad6]/40 border border-[#ffdad6] text-[#93000a] text-[11px] font-bold px-3 py-1 rounded transition-colors"
          >
            Review Impact
          </button>
        </div>
      </div>

      {/* DDL / Schema Modal */}
      {schemaModalDataset && (
        <div className="fixed inset-0 bg-[#0b192c]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#94a3b8] rounded-md shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="bg-[#01284b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Braces className="w-4 h-4 text-[#85f8c4]" />
                <span className="text-xs font-bold">
                  Partition DDL &amp; Arrow IPC Schema — {schemaModalDataset.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSchemaModalDataset(null)}
                className="text-[#aac9f4] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0d1c2f]">
                    {schemaModalDataset.name}
                  </span>{' '}
                  <span className="font-mono text-[#64748b]">
                    ({schemaModalDataset.version})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(schemaModalDataset.ddlSchema);
                    setCopiedDdl(true);
                    setTimeout(() => setCopiedDdl(false), 2000);
                  }}
                  className="bg-[#eff4ff] hover:bg-[#d5e3fd] text-[#01284b] text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1"
                >
                  {copiedDdl ? (
                    <>
                      <Check className="w-3 h-3 text-[#059669]" />
                      <span>Copied DDL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy DDL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-[#0d1c2f] text-[#e6eeff] font-mono text-xs p-3.5 rounded overflow-x-auto leading-relaxed">
                {schemaModalDataset.ddlSchema}
              </pre>
              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-[11px] text-[#64748b]">
                  Partition Format: Apache Arrow IPC • Checksum: ECDSA-256
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const id = schemaModalDataset.id;
                    setSchemaModalDataset(null);
                    onOpenEditor(id);
                  }}
                  className="bg-[#01284b] text-white text-xs font-semibold px-3.5 py-1.5 rounded"
                >
                  Open in Data Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commit History Modal */}
      {historyModalDataset && (
        <div className="fixed inset-0 bg-[#0b192c]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#94a3b8] rounded-md shadow-xl max-w-xl w-full overflow-hidden">
            <div className="bg-[#01284b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#85f8c4]" />
                <span className="text-xs font-bold">
                  Attested Version Lineage — {historyModalDataset.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalDataset(null)}
                className="text-[#aac9f4] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {historyModalDataset.recentCommits.map((c) => (
                <div
                  key={c.hash}
                  className="border border-[#e2e8f0] rounded p-3 bg-[#f8fafc]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#01284b]">
                      {c.version} • Commit {c.hash}
                    </span>
                    <span className="font-mono text-[10.5px] text-[#64748b]">
                      {c.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#0d1c2f] mt-1 font-medium">
                    {c.summary}
                  </p>
                  <div className="font-mono text-[10.5px] text-[#64748b] mt-1.5">
                    Maker: {c.author} • Attested by Checker: {c.checker}
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setHistoryModalDataset(null)}
                  className="bg-[#eff4ff] text-[#01284b] text-xs font-semibold px-3.5 py-1.5 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Dataset Definition Modal */}
      {newDatasetModalOpen && (
        <div className="fixed inset-0 bg-[#0b192c]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#94a3b8] rounded-md shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#01284b] text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold">
                Register New Reference Dataset Definition
              </span>
              <button
                type="button"
                onClick={() => setNewDatasetModalOpen(false)}
                className="text-[#aac9f4] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDatasetSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0d1c2f] mb-1">
                  Dataset Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDsName}
                  onChange={(e) => setNewDsName(e.target.value)}
                  placeholder="e.g., MiFID II Instrument Classification Taxonomy"
                  className="w-full border border-[#cbd5e1] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#01284b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1c2f] mb-1">
                  Canonical Partition Code (Monospace ID) *
                </label>
                <input
                  type="text"
                  required
                  value={newDsCode}
                  onChange={(e) => setNewDsCode(e.target.value)}
                  placeholder="e.g., MIFID_CFI_TAXONOMY"
                  className="w-full border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-[#01284b]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d1c2f] mb-1">
                    Governance Domain
                  </label>
                  <select
                    value={newDsDomain}
                    onChange={(e) =>
                      setNewDsDomain(
                        e.target.value as 'Regulatory' | 'Financial' | 'Accounting'
                      )
                    }
                    className="w-full border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="Regulatory">Regulatory</option>
                    <option value="Financial">Financial</option>
                    <option value="Accounting">Accounting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0d1c2f] mb-1">
                    Partition Category
                  </label>
                  <select
                    value={newDsCategory}
                    onChange={(e) =>
                      setNewDsCategory(
                        e.target.value as
                          | 'Market & Trading'
                          | 'Risk & Compliance'
                          | 'Accounting & GL'
                          | 'Customer & Entity'
                      )
                    }
                    className="w-full border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="Risk & Compliance">Risk &amp; Compliance</option>
                    <option value="Market & Trading">Market &amp; Trading</option>
                    <option value="Accounting & GL">Accounting &amp; GL</option>
                    <option value="Customer & Entity">Customer &amp; Entity</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setNewDatasetModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#cbd5e1] text-xs font-semibold text-[#43474e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#01284b] text-white text-xs font-semibold"
                >
                  Bind Partition &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV / JSON Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-[#0b192c]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#94a3b8] rounded-md shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#01284b] text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold">
                Import Reference Payload (CSV / JSON / Parquet)
              </span>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="text-[#aac9f4] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-[#43474e]">
                All imported batches are routed through the deterministic staging gate
                and require Tier-2 Checker sign-off before production commit.
              </p>
              <div className="border-2 border-dashed border-[#cbd5e1] bg-[#eff4ff]/50 rounded p-5 text-center">
                <Upload className="w-6 h-6 text-[#01284b] mx-auto mb-1.5" />
                <div className="text-xs font-bold text-[#0d1c2f]">
                  ISO_4217_Q4_DELTA_BATCH.json
                </div>
                <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                  Pre-validated against CURR_REF_V2 schema • 0 schema violations
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#cbd5e1] text-xs font-semibold text-[#43474e]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false);
                    onNotify(
                      'Staged batch ISO_4217_Q4_DELTA_BATCH routed to Maker-Checker Queue.',
                      'success'
                    );
                  }}
                  className="px-4 py-1.5 rounded bg-[#01284b] text-white text-xs font-semibold"
                >
                  Stage Payload for Sign-Off
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Freeze Impact Modal */}
      {freezeImpactModalOpen && (
        <div className="fixed inset-0 bg-[#0b192c]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#94a3b8] rounded-md shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#93000a] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold">
                  Statutory Freeze Window Assessment — GL_ACCT_TREE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFreezeImpactModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="bg-[#fff5f5] border border-[#ffdad6] rounded p-3">
                <div className="font-bold text-[#93000a]">
                  Lock Effective: Nov 30, 23:59 UTC — Dec 03, 06:00 UTC
                </div>
                <div className="text-[#43474e] mt-1">
                  During the bi-annual statutory close, DDL schema mutations and node
                  relocations on <span className="font-mono font-bold">GL_ACCT_TREE</span>{' '}
                  require emergency CFO + Chief Risk Officer dual override tokens.
                </div>
              </div>
              <div className="font-mono text-[11px] space-y-1 bg-[#f8fafc] p-3 rounded border border-[#e2e8f0]">
                <div>• In-Flight Change Request: CR-2024-8889 (1 Pending Sign-Off)</div>
                <div>• Downstream Consumers: SAP S/4HANA Ledger, FRTB Mart</div>
                <div>• Recommendation: Complete Checker attestation prior to Nov 30.</div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFreezeImpactModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#cbd5e1] font-semibold text-[#43474e]"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFreezeImpactModalOpen(false);
                    onReviewStaging('CR-2024-8889');
                  }}
                  className="px-3.5 py-1.5 rounded bg-[#01284b] text-white font-semibold"
                >
                  Review CR-2024-8889 Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
