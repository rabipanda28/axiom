import React, { useState } from 'react';
import {
  Database,
  GitCommit,
  Plus,
  RotateCcw,
  CheckCircle2,
  Edit3,
  ArrowRight,
  Braces,
} from 'lucide-react';
import {
  DatasetItem,
  ChangeRequestItem,
  RoleOption,
} from '../data/rdmData';

interface DataEditorMakerViewProps {
  datasets: DatasetItem[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  currentRole: RoleOption;
  onStageChangeRequest: (newCr: ChangeRequestItem) => void;
  onNavigateToQueue: (crId: string) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const DataEditorMakerView: React.FC<DataEditorMakerViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  currentRole,
  onStageChangeRequest,
  onNavigateToQueue,
  onNotify,
}) => {
  const activeDataset =
    datasets.find((d) => d.id === selectedDatasetId) || datasets[1] || datasets[0];

  const [stagedEdits, setStagedEdits] = useState<
    Record<string, { rowKey: string; colKey: string; oldVal: string; newVal: string }>
  >({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState<string>('');
  const [ticketId, setTicketId] = useState('INC-94902');
  const [priority, setPriority] = useState<'HIGH PRIORITY' | 'NORMAL' | 'CRITICAL'>('HIGH PRIORITY');
  const [justification, setJustification] = useState(
    'Aligning reference partition parameters with Q4 statutory settlement circular.'
  );

  const columns =
    activeDataset.sampleRecords.length > 0
      ? Object.keys(activeDataset.sampleRecords[0])
      : ['KEY', 'NUM', 'STATUS'];

  const editList = Object.values(stagedEdits);

  const handleStartEdit = (rowIdx: number, colKey: string, currentVal: string) => {
    const cellKey = `${activeDataset.id}:${rowIdx}:${colKey}`;
    setEditingCell(cellKey);
    setTempVal(stagedEdits[cellKey]?.newVal ?? currentVal);
  };

  const handleCommitCell = (
    rowIdx: number,
    rowKey: string,
    colKey: string,
    originalVal: string
  ) => {
    const cellKey = `${activeDataset.id}:${rowIdx}:${colKey}`;
    if (tempVal.trim() !== originalVal) {
      setStagedEdits((prev) => ({
        ...prev,
        [cellKey]: {
          rowKey,
          colKey,
          oldVal: originalVal,
          newVal: tempVal.trim(),
        },
      }));
    } else {
      setStagedEdits((prev) => {
        const copy = { ...prev };
        delete copy[cellKey];
        return copy;
      });
    }
    setEditingCell(null);
  };

  const handleStageQuickDemoMutation = () => {
    const firstRow = activeDataset.sampleRecords[0];
    if (!firstRow) return;
    const targetCol = columns[2] || columns[1];
    const origVal = String(firstRow[targetCol]);
    const cellKey = `${activeDataset.id}:0:${targetCol}`;
    setStagedEdits((prev) => ({
      ...prev,
      [cellKey]: {
        rowKey: String(firstRow.KEY || 'ROW_1'),
        colKey: targetCol,
        oldVal: origVal,
        newVal: `${origVal}_V2_STAGED`,
      },
    }));
    onNotify(
      `Staged local Maker delta on ${activeDataset.code} (${String(
        firstRow.KEY
      )} → ${targetCol}).`,
      'info'
    );
  };

  const handleSubmitToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (editList.length === 0) {
      onNotify(
        'Modify at least one cell in the grid (or click "+ Stage Sample Mutation") before submitting to the Dual-Sign Queue.',
        'warning'
      );
      return;
    }

    const crNumber = `CR-2024-${Math.floor(8900 + Math.random() * 99)}`;
    const newCr: ChangeRequestItem = {
      id: crNumber,
      priority,
      submittedAgo: 'Just now',
      title: `${activeDataset.name} (${activeDataset.code})`,
      targetCode: activeDataset.code,
      snippet: justification,
      makerRole: 'PS Maker',
      makerName: currentRole.principalName,
      makerShortName: currentRole.principalName.slice(0, 12),
      makerTitle: currentRole.department,
      makerUid: currentRole.principalUid,
      ticketId: ticketId.trim() || 'INC-94902',
      recordsCount: editList.length,
      mutationsCount: editList.length,
      schemaFrom: activeDataset.version,
      schemaTo: `${activeDataset.version}-next`,
      submissionTimestamp: 'Oct 24, 2024, 15:04:12 UTC',
      businessJustification: `“${justification.trim()}”`,
      sha256Short: 'e419c802a11f49d0...883a12f09',
      sha256Full:
        'e419c802a11f49d077123849a1029384f1029384c1029384d1029384883a12f09',
      stagingCommitTimestamp: '2024-10-24 15:04:12',
      stagingEventId: `EID_${Math.floor(88200 + Math.random() * 700)}-STAGED`,
      stagingEventShortDate: 'Oct 24 15:04:12 UTC',
      rulesEvaluated: 28,
      status: 'pending',
      assignedToMe: true,
      defaultRemarks:
        'Pre-flight deterministic schema & checksum rules passed.',
      diffs: editList.map((ed, idx) => ({
        id: `staged-diff-${idx}`,
        recordKey: ed.rowKey,
        recordSubKey: `PART: ${activeDataset.code}`,
        fieldAttribute: ed.colKey,
        currentLiveValue: ed.oldVal,
        proposedStagedLines: [`+ ${ed.newVal}`],
        impactTitle: 'Low Risk',
        impactIcon: 'shield',
        impactAccentColor: 'default',
        impactDescription: `Validated against ${activeDataset.code} Arrow IPC partition constraints.`,
      })),
    };

    onStageChangeRequest(newCr);
    setStagedEdits({});
    onNavigateToQueue(crNumber);
  };

  return (
    <div className="p-5 max-w-[1380px] space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#5c6f7e]">
            BARCLAYS MAKER STAGING WORKBENCH /{' '}
            <span className="font-bold text-[#0076b6]">
              DETERMINISTIC CELL MUTATION EDITOR
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-[22px] font-bold text-[#00263e] tracking-tight">
              Data Editor &amp; Maker Staging
            </h1>
            <span className="bg-[#e5f4fb] border border-[#b8e1f5] text-[#00395d] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
              MAKER MODE: {currentRole.principalName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeDataset.id}
            onChange={(e) => {
              onSelectDataset(e.target.value);
              setStagedEdits({});
            }}
            aria-label="Select dataset partition"
            className="bg-white border border-[#cbd9e3] rounded-xs px-3 py-1.5 text-xs font-bold text-[#00395d]"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name} ({d.version})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleStageQuickDemoMutation}
            className="bg-[#00395d] hover:bg-[#00263e] border-b-2 border-b-[#00AEEF] text-white text-xs font-semibold px-3 py-1.5 rounded-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#00AEEF]" />
            <span>Stage Sample Mutation</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Editable Reference Partition Table + Staging Commit Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left 2 Columns: Editable Reference Data Grid */}
        <div className="lg:col-span-2 bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs overflow-hidden">
          <div className="bg-[#f2f8fc] border-b border-[#cbd9e3] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0076b6]" />
              <span className="text-xs font-bold text-[#00263e]">
                Active Partition: {activeDataset.code}
              </span>
              <span className="font-mono text-[10.5px] text-[#5c6f7e]">
                ({activeDataset.version} • Click any cell value to stage a Maker mutation)
              </span>
            </div>
            {editList.length > 0 && (
              <button
                type="button"
                onClick={() => setStagedEdits({})}
                className="text-[11px] font-semibold text-[#C8102E] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Discard {editList.length} Draft Edits</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#edf5fa] border-b border-[#cbd9e3] text-[10px] font-bold uppercase tracking-wider text-[#00395d]">
                  {columns.map((col) => (
                    <th key={col} className="py-2.5 px-3.5 font-mono">
                      {col}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">CELL STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4dfe6]">
                {activeDataset.sampleRecords.map((row, rIdx) => {
                  const rowKey = String(row.KEY || `ROW_${rIdx + 1}`);
                  const rowHasEdit = columns.some(
                    (c) => stagedEdits[`${activeDataset.id}:${rIdx}:${c}`]
                  );
                  return (
                    <tr
                      key={rowKey}
                      className={
                        rowHasEdit ? 'bg-[#e5f4fb]/50' : 'hover:bg-[#f4f9fc]'
                      }
                    >
                      {columns.map((colKey) => {
                        const cellKey = `${activeDataset.id}:${rIdx}:${colKey}`;
                        const staged = stagedEdits[cellKey];
                        const origVal = String(row[colKey]);
                        const isEditing = editingCell === cellKey;

                        return (
                          <td
                            key={colKey}
                            className="py-2.5 px-3.5 font-mono text-xs align-middle"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  autoFocus
                                  value={tempVal}
                                  onChange={(e) => setTempVal(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCommitCell(
                                        rIdx,
                                        rowKey,
                                        colKey,
                                        origVal
                                      );
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="border border-[#00AEEF] rounded-xs px-2 py-0.5 text-xs font-mono bg-white text-[#00263e] w-32 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCommitCell(
                                      rIdx,
                                      rowKey,
                                      colKey,
                                      origVal
                                    )
                                  }
                                  className="bg-[#00395d] text-white text-[10px] px-2 py-0.5 rounded-xs"
                                >
                                  Stage
                                </button>
                              </div>
                            ) : staged ? (
                              <div
                                onClick={() =>
                                  handleStartEdit(rIdx, colKey, origVal)
                                }
                                className="cursor-pointer space-y-0.5"
                              >
                                <div className="text-[10px] text-[#C8102E] line-through">
                                  - {staged.oldVal}
                                </div>
                                <div className="text-xs font-bold text-[#006837] bg-[#e6f5ee] px-1.5 py-0.5 rounded-xs inline-block">
                                  + {staged.newVal}
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(rIdx, colKey, origVal)
                                }
                                className="group flex items-center gap-1.5 text-left hover:text-[#0076b6] transition-colors"
                              >
                                <span
                                  className={
                                    colKey === 'KEY'
                                      ? 'font-bold text-[#00263e]'
                                      : 'text-[#33414c]'
                                  }
                                >
                                  {origVal}
                                </span>
                                <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#00AEEF]" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-right">
                        {rowHasEdit ? (
                          <span className="bg-[#00395d] text-[#00AEEF] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs">
                            STAGED DELTA
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-[#008a4b] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>LIVE SYNC</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DDL Preview Footer */}
          <div className="bg-[#001b2e] text-[#e5f4fb] p-3.5 border-t border-[#cbd9e3]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#00AEEF] mb-1.5">
              <Braces className="w-3.5 h-3.5" />
              <span>Bound Partition Schema DDL ({activeDataset.code})</span>
            </div>
            <pre className="font-mono text-[11px] overflow-x-auto leading-relaxed text-[#b3d4e8]">
              {activeDataset.ddlSchema}
            </pre>
          </div>
        </div>

        {/* Right Column: Maker Staging Commit Panel */}
        <form
          onSubmit={handleSubmitToQueue}
          className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#00395d] rounded-xs p-4 space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-[#d4dfe6] pb-2.5">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-[#0076b6]" />
              <h2 className="text-xs font-bold text-[#00263e]">
                Stage Batch for Checker Sign-Off
              </h2>
            </div>
            <span className="bg-[#e5f4fb] text-[#00395d] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs">
              {editList.length} Mutations
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5c6f7e] mb-1">
                Jira / Incident ID *
              </label>
              <input
                type="text"
                required
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full border border-[#cbd9e3] rounded-xs px-2.5 py-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5c6f7e] mb-1">
                Urgency SLA Tier
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value as 'HIGH PRIORITY' | 'NORMAL' | 'CRITICAL'
                  )
                }
                className="w-full border border-[#cbd9e3] rounded-xs px-2 py-1.5 text-xs font-semibold"
              >
                <option value="HIGH PRIORITY">HIGH PRIORITY</option>
                <option value="NORMAL">NORMAL</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5c6f7e] mb-1">
              Business Justification &amp; Statutory Intent *
            </label>
            <textarea
              rows={3}
              required
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full border border-[#cbd9e3] rounded-xs p-2.5 text-xs text-[#00263e]"
            />
          </div>

          {/* Staged Diffs Summary */}
          <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5c6f7e] mb-1.5">
              Uncommitted Maker Diff Buffer
            </div>
            {editList.length === 0 ? (
              <div className="text-[11px] text-[#5c6f7e] italic">
                Click any value in the table or press &ldquo;Stage Sample
                Mutation&rdquo; to populate the diff buffer.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px]">
                {editList.map((ed, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#cbd9e3] rounded-xs p-2"
                  >
                    <div className="font-bold text-[#00263e]">
                      {ed.rowKey} • {ed.colKey}
                    </div>
                    <div className="text-[#C8102E] line-through">
                      - {ed.oldVal}
                    </div>
                    <div className="text-[#006837] font-bold">
                      + {ed.newVal}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#00395d] hover:bg-[#00263e] border-b-2 border-b-[#00AEEF] text-white text-xs font-bold py-2.5 px-4 rounded-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Commit Batch to Dual-Sign Queue</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00AEEF]" />
          </button>
        </form>
      </div>
    </div>
  );
};
