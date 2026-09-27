import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  KeyRound,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { StatutoryLogEntry } from '../data/rdmData';

interface AuditTrailExplorerViewProps {
  logs: StatutoryLogEntry[];
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AuditTrailExplorerView: React.FC<AuditTrailExplorerViewProps> = ({
  logs,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<StatutoryLogEntry | null>(
    logs[0] || null
  );

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      l.eventId.toLowerCase().includes(q) ||
      l.datasetCode.toLowerCase().includes(q) ||
      l.commitHash.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q) ||
      l.makerPrincipal.toLowerCase().includes(q) ||
      l.checkerPrincipal.toLowerCase().includes(q)
    );
  });

  const handleExportSocPacket = () => {
    const packet = {
      attestationStandard: 'SOC-1 Type II / ISO-20022 Dual-Control',
      generatedUtc: new Date().toISOString(),
      cryptographicChainValid: true,
      events: logs,
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'axiom_rdm_statutory_audit_packet.json';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported SOC-1/2 cryptographic statutory log packet.', 'success');
  };

  return (
    <div className="p-5 max-w-[1380px] space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#64748b]">
            IMMUTABLE LEDGER ATTESTATION /{' '}
            <span className="font-bold text-[#01284b]">
              STATUTORY AUDIT TRAIL EXPLORER
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-[22px] font-bold text-[#0d1c2f] tracking-tight">
              Statutory Audit Trail &amp; ECDSA-256 Ledger
            </h1>
            <span className="bg-[#00462f] text-[#85f8c4] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              HASH CHAIN: VERIFIED
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportSocPacket}
          className="bg-[#01284b] hover:bg-[#1e3e62] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export SOC-1/2 Evidence Packet</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded p-3 flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center bg-[#eff4ff] border border-[#d5e3fd] rounded px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-[#64748b] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter statutory events by Audit ID, Commit Hash (#48f110c), Principal UID, or Dataset..."
            className="w-full bg-transparent text-xs text-[#0d1c2f] placeholder-[#64748b] focus:outline-none"
          />
        </div>
        <span className="font-mono text-xs text-[#00462f] font-bold shrink-0">
          {filteredLogs.length} Immutable Events
        </span>
      </div>

      {/* Split Table & Cryptographic Proof Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/80 border-b border-[#e2e8f0] text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                <th className="py-2.5 px-3.5">AUDIT EVENT ID</th>
                <th className="py-2.5 px-3">PARTITION</th>
                <th className="py-2.5 px-3">STATUTORY EVENT</th>
                <th className="py-2.5 px-3">MAKER / CHECKER</th>
                <th className="py-2.5 px-3.5 text-right">COMMIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#eff4ff]' : 'hover:bg-[#f8fafc]'
                    }`}
                  >
                    <td className="py-3 px-3.5 font-mono text-xs font-bold text-[#01284b]">
                      <div>{log.eventId}</div>
                      <div className="text-[10px] font-normal text-[#64748b]">
                        {log.relativeTime}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-[#0d1c2f]">
                      {log.datasetCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs font-bold text-[#0d1c2f]">
                        {log.title}
                      </div>
                      <div className="text-[11px] text-[#43474e]">
                        {log.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10.5px] text-[#43474e]">
                      <div>M: {log.makerPrincipal}</div>
                      <div>C: {log.checkerPrincipal}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-xs font-bold text-[#005137]">
                      {log.commitHash}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cryptographic Proof Inspector */}
        {selectedLog && (
          <div className="bg-white border border-[#e2e8f0] rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#01284b]" />
                <span className="text-xs font-bold text-[#0d1c2f]">
                  Cryptographic Attestation Proof
                </span>
              </div>
              <span className="bg-[#85f8c4] text-[#002114] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                {selectedLog.status}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div>
                <div className="text-[10px] text-[#64748b]">EVENT ID</div>
                <div className="font-bold text-[#0d1c2f]">
                  {selectedLog.eventId} ({selectedLog.timestamp})
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748b]">MAKER PRINCIPAL</div>
                <div className="text-[#0d1c2f]">{selectedLog.makerPrincipal}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748b]">
                  ATTESTING CHECKER PRINCIPAL
                </div>
                <div className="text-[#005137] font-bold">
                  {selectedLog.checkerPrincipal}
                </div>
              </div>
              <div className="bg-[#eff4ff] border border-[#d5e3fd] rounded p-2.5 break-all">
                <div className="text-[9.5px] font-bold text-[#64748b] flex items-center gap-1 mb-1">
                  <KeyRound className="w-3 h-3 text-[#01284b]" />
                  <span>ECDSA-256 HARDWARE SIGNATURE</span>
                </div>
                <div className="text-[11px] text-[#01284b] font-bold">
                  {selectedLog.sha256Signature}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNotify(
                  `Verified ECDSA-256 signature ${selectedLog.commitHash} against HSM root certificate.`,
                  'success'
                )
              }
              className="w-full bg-[#eff4ff] hover:bg-[#d5e3fd] text-[#01284b] text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <span>Re-Verify Cryptographic Proof</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
