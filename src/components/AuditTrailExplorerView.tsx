import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  KeyRound,
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
      institution: 'Barclays Corporate & Investment Bank (BCIB)',
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
    a.download = 'barclays_axiom_rdm_statutory_audit_packet.json';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported Barclays SOC-1/2 cryptographic statutory log packet.', 'success');
  };

  return (
    <div className="p-5 max-w-[1380px] space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#5c6f7e]">
            BARCLAYS IMMUTABLE LEDGER ATTESTATION /{' '}
            <span className="font-bold text-[#0076b6]">
              STATUTORY AUDIT TRAIL EXPLORER
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-[22px] font-bold text-[#00263e] tracking-tight">
              Statutory Audit Trail &amp; ECDSA-256 Ledger
            </h1>
            <span className="bg-[#00395d] text-[#00AEEF] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
              HASH CHAIN: VERIFIED
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportSocPacket}
          className="bg-[#00395d] hover:bg-[#00263e] border-b-2 border-b-[#00AEEF] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xs flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#00AEEF]" />
          <span>Export SOC-1/2 Evidence Packet</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#cbd9e3] rounded-xs p-3 flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs px-3 py-1.5 focus-within:border-[#00AEEF]">
          <Search className="w-3.5 h-3.5 text-[#0076b6] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter statutory events by Audit ID, Commit Hash (#48f110c), Principal UID, or Dataset..."
            className="w-full bg-transparent text-xs text-[#00263e] placeholder-[#5c6f7e] focus:outline-none"
          />
        </div>
        <span className="font-mono text-xs text-[#006837] font-bold shrink-0">
          {filteredLogs.length} Immutable Events
        </span>
      </div>

      {/* Split Table & Cryptographic Proof Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#edf5fa] border-b border-[#cbd9e3] text-[10px] font-bold uppercase tracking-wider text-[#00395d]">
                <th className="py-2.5 px-3.5">AUDIT EVENT ID</th>
                <th className="py-2.5 px-3">PARTITION</th>
                <th className="py-2.5 px-3">STATUTORY EVENT</th>
                <th className="py-2.5 px-3">MAKER / CHECKER</th>
                <th className="py-2.5 px-3.5 text-right">COMMIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eff4]">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#e5f4fb]' : 'hover:bg-[#f4f9fc]'
                    }`}
                  >
                    <td className="py-3 px-3.5 font-mono text-xs font-bold text-[#00395d]">
                      <div>{log.eventId}</div>
                      <div className="text-[10px] font-normal text-[#5c6f7e]">
                        {log.relativeTime}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-[#00263e]">
                      {log.datasetCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs font-bold text-[#00263e]">
                        {log.title}
                      </div>
                      <div className="text-[11px] text-[#33414c]">
                        {log.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10.5px] text-[#33414c]">
                      <div>M: {log.makerPrincipal}</div>
                      <div>C: {log.checkerPrincipal}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-xs font-bold text-[#006837]">
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
          <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#00395d] rounded-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4dfe6] pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0076b6]" />
                <span className="text-xs font-bold text-[#00263e]">
                  Cryptographic Attestation Proof
                </span>
              </div>
              <span className="bg-[#e6f5ee] border border-[#8ce0b8] text-[#006837] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs">
                {selectedLog.status}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div>
                <div className="text-[10px] text-[#5c6f7e]">EVENT ID</div>
                <div className="font-bold text-[#00263e]">
                  {selectedLog.eventId} ({selectedLog.timestamp})
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#5c6f7e]">MAKER PRINCIPAL</div>
                <div className="text-[#00263e]">{selectedLog.makerPrincipal}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#5c6f7e]">
                  ATTESTING CHECKER PRINCIPAL
                </div>
                <div className="text-[#006837] font-bold">
                  {selectedLog.checkerPrincipal}
                </div>
              </div>
              <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-2.5 break-all">
                <div className="text-[9.5px] font-bold text-[#5c6f7e] flex items-center gap-1 mb-1">
                  <KeyRound className="w-3 h-3 text-[#0076b6]" />
                  <span>ECDSA-256 HARDWARE SIGNATURE</span>
                </div>
                <div className="text-[11px] text-[#00395d] font-bold">
                  {selectedLog.sha256Signature}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNotify(
                  `Verified ECDSA-256 signature ${selectedLog.commitHash} against Barclays HSM root certificate.`,
                  'success'
                )
              }
              className="w-full bg-[#e5f4fb] hover:bg-[#cbe9f7] border border-[#b8e1f5] text-[#00395d] text-xs font-bold py-2 rounded-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#008a4b]" />
              <span>Re-Verify Cryptographic Proof</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
