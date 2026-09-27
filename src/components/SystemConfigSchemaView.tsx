import React, { useState } from 'react';
import {
  Braces,
  Shield,
  Server,
  CheckCircle2,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import { DatasetItem } from '../data/rdmData';

interface SystemConfigSchemaViewProps {
  datasets: DatasetItem[];
  onNotify: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SystemConfigSchemaView: React.FC<SystemConfigSchemaViewProps> = ({
  datasets,
  onNotify,
}) => {
  const [selectedDsId, setSelectedDsId] = useState(datasets[0]?.id || 'ds-1');
  const [copied, setCopied] = useState(false);
  const [strictSodEnabled, setStrictSodEnabled] = useState(true);
  const [ecdsaHardwareEnforced, setEcdsaHardwareEnforced] = useState(true);
  const [zeroCopyIpcEnabled, setZeroCopyIpcEnabled] = useState(true);

  const selectedDs =
    datasets.find((d) => d.id === selectedDsId) || datasets[0];

  return (
    <div className="p-5 max-w-[1380px] space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.06em] text-[#5c6f7e]">
            BARCLAYS SYSTEM CONFIGURATION &amp; DDL REGISTRY /{' '}
            <span className="font-bold text-[#0076b6]">
              PARTITION POLICIES &amp; ENGINES
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-[22px] font-bold text-[#00263e] tracking-tight">
              DDL &amp; Statutory Governance Policies
            </h1>
            <span className="bg-[#00395d] text-[#00AEEF] font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
              ENGINE: BARX-v4.18
            </span>
          </div>
        </div>
      </div>

      {/* Policy Controls & DDL Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Column: Governance Policy Controls */}
        <div className="bg-white border border-[#cbd9e3] border-t-2 border-t-[#00395d] rounded-xs p-4 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-[#d4dfe6] pb-2.5">
            <Shield className="w-4 h-4 text-[#0076b6]" />
            <h2 className="text-xs font-bold text-[#00263e]">
              Cluster-Wide Statutory Controls
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-[#00263e]">
                  Tier-2 Segregation of Duties (SoD)
                </div>
                <div className="text-[11px] text-[#33414c] mt-0.5">
                  Blocks any principal UID from approving mutations authored by
                  the same principal.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStrictSodEnabled((v) => !v);
                  onNotify('Updated Tier-2 SoD enforcement state.', 'info');
                }}
                className={`px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold shrink-0 ${
                  strictSodEnabled
                    ? 'bg-[#006837] text-white'
                    : 'bg-[#fde8eb] text-[#9e0b22]'
                }`}
              >
                {strictSodEnabled ? 'STRICT' : 'ADVISORY'}
              </button>
            </div>

            <div className="p-3 bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-[#00263e]">
                  HSM-FIPS-140-L3 Signer Gate
                </div>
                <div className="text-[11px] text-[#33414c] mt-0.5">
                  Requires hardware ECDSA-256 signature on all production
                  partition commits.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEcdsaHardwareEnforced((v) => !v);
                  onNotify('Updated HSM hardware signer requirement.', 'info');
                }}
                className={`px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold shrink-0 ${
                  ecdsaHardwareEnforced
                    ? 'bg-[#006837] text-white'
                    : 'bg-[#d4dfe6] text-[#33414c]'
                }`}
              >
                {ecdsaHardwareEnforced ? 'ENFORCED' : 'BYPASSED'}
              </button>
            </div>

            <div className="p-3 bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-[#00263e]">
                  Arrow IPC Zero-Copy Replication
                </div>
                <div className="text-[11px] text-[#33414c] mt-0.5">
                  Streams committed partitions to Kafka and Snowflake replicas.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setZeroCopyIpcEnabled((v) => !v);
                  onNotify('Updated Arrow IPC replication stream.', 'info');
                }}
                className={`px-2.5 py-1 rounded-xs font-mono text-[10px] font-bold shrink-0 ${
                  zeroCopyIpcEnabled
                    ? 'bg-[#00395d] text-[#00AEEF]'
                    : 'bg-[#d4dfe6] text-[#33414c]'
                }`}
              >
                {zeroCopyIpcEnabled ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#d4dfe6] font-mono text-[10.5px] text-[#5c6f7e] space-y-1">
            <div className="flex items-center justify-between">
              <span>Statutory Lock Window:</span>
              <span className="font-bold text-[#C8102E]">Nov 30, 23:59 UTC</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Validation Rulebook:</span>
              <span className="font-bold text-[#00263e]">ISO-20022 v4.18</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Partition DDL & Schema Explorer */}
        <div className="lg:col-span-2 bg-white border border-[#cbd9e3] border-t-2 border-t-[#00AEEF] rounded-xs overflow-hidden">
          <div className="bg-[#f2f8fc] border-b border-[#cbd9e3] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Braces className="w-4 h-4 text-[#0076b6]" />
              <span className="text-xs font-bold text-[#00263e]">
                Master Partition DDL Specification
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDs.id}
                onChange={(e) => setSelectedDsId(e.target.value)}
                aria-label="Select dataset DDL"
                className="bg-white border border-[#cbd9e3] rounded-xs px-2.5 py-1 text-xs font-mono font-bold text-[#00395d]"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} ({d.version})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedDs.ddlSchema);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-[#e5f4fb] hover:bg-[#cbe9f7] border border-[#b8e1f5] text-[#00395d] text-xs font-semibold px-2.5 py-1 rounded-xs flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#008a4b]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy DDL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <pre className="bg-[#001b2e] text-[#e5f4fb] font-mono text-xs p-4 rounded-xs overflow-x-auto leading-relaxed border-l-2 border-l-[#00AEEF]">
              {selectedDs.ddlSchema}
            </pre>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3">
                <div className="text-[10px] text-[#5c6f7e]">STORAGE ENGINE</div>
                <div className="font-bold text-[#00263e] mt-0.5 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#0076b6]" />
                  <span>Arrow IPC Zero-Copy</span>
                </div>
              </div>
              <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3">
                <div className="text-[10px] text-[#5c6f7e]">DUAL-CONTROL GATE</div>
                <div className="font-bold text-[#006837] mt-0.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Tier-2 Quorum</span>
                </div>
              </div>
              <div className="bg-[#f2f8fc] border border-[#cbd9e3] rounded-xs p-3">
                <div className="text-[10px] text-[#5c6f7e]">SCHEMA INTEGRITY</div>
                <div className="font-bold text-[#00395d] mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#008a4b]" />
                  <span>SHA-256 Deterministic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
