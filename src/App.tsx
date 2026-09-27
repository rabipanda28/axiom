/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_DATASETS,
  INITIAL_CHANGE_REQUESTS,
  INITIAL_STATUTORY_LOGS,
  ROLE_OPTIONS,
  DatasetItem,
  ChangeRequestItem,
  StatutoryLogEntry,
  RoleOption,
} from './data/rdmData';
import { TopNav, ActiveTabId } from './components/TopNav';
import { LeftSidebar } from './components/LeftSidebar';
import { DatasetCatalogView } from './components/DatasetCatalogView';
import { MakerCheckerQueueView } from './components/MakerCheckerQueueView';
import { DataEditorMakerView } from './components/DataEditorMakerView';
import { AuditTrailExplorerView } from './components/AuditTrailExplorerView';
import { SystemConfigSchemaView } from './components/SystemConfigSchemaView';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabId>('catalog');
  const [datasets, setDatasets] = useState<DatasetItem[]>(INITIAL_DATASETS);
  const [changeRequests, setChangeRequests] = useState<ChangeRequestItem[]>(
    INITIAL_CHANGE_REQUESTS
  );
  const [statutoryLogs, setStatutoryLogs] = useState<StatutoryLogEntry[]>(
    INITIAL_STATUTORY_LOGS
  );
  const [currentRole, setCurrentRole] = useState<RoleOption>(ROLE_OPTIONS[0]);
  const [selectedCrId, setSelectedCrId] = useState<string>('CR-2024-8891');
  const [selectedEditorDatasetId, setSelectedEditorDatasetId] =
    useState<string>('ds-2');

  const [activeDomainScope, setActiveDomainScope] = useState({
    code: 'FIN_REG_CORE',
    version: 'v4.18',
    label: 'Global Regulatory Taxonomy',
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const triggerToast = (
    message: string,
    type: 'success' | 'info' | 'warning' = 'info'
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const pendingQueueCount = changeRequests.filter(
    (c) => c.status === 'pending'
  ).length;

  const handleReviewStagingFromCatalog = (crId: string) => {
    setSelectedCrId(crId);
    setActiveTab('queue');
  };

  const handleOpenEditorFromCatalog = (datasetId: string) => {
    setSelectedEditorDatasetId(datasetId);
    setActiveTab('editor');
  };

  const handleUpdateCrStatus = (
    crId: string,
    newStatus: 'approved' | 'rejected' | 'revision_requested',
    remarks: string,
    signerRole?: RoleOption
  ) => {
    const activeSigner = signerRole || currentRole;
    const targetCr = changeRequests.find((c) => c.id === crId);
    if (!targetCr) return;

    setChangeRequests((prev) =>
      prev.map((cr) =>
        cr.id === crId
          ? {
              ...cr,
              status: newStatus,
              defaultRemarks: remarks || cr.defaultRemarks,
            }
          : cr
      )
    );

    if (newStatus === 'approved') {
      // Update corresponding dataset governance status
      setDatasets((prev) =>
        prev.map((ds) =>
          ds.code === targetCr.targetCode
            ? {
                ...ds,
                version: targetCr.schemaTo,
                publishedAgo: 'Just now',
                publisher: activeSigner.principalName
                  .toLowerCase()
                  .replace(/\s+/g, '.'),
                governanceState: 'synced_active',
                governanceLabel: 'Synced & Active',
                pendingCount: undefined,
                actionType: 'open_editor',
              }
            : ds
        )
      );

      // Prepend statutory log entry
      const newLog: StatutoryLogEntry = {
        id: `log-${Date.now()}`,
        eventId: `AUD-2024-${Math.floor(99500 + Math.random() * 499)}`,
        timestamp: '2024-10-24 15:10:00 UTC',
        relativeTime: 'Just now',
        datasetCode: targetCr.targetCode,
        eventType: 'DUAL_SIGN_COMMIT',
        title: `${targetCr.targetCode} Published (${targetCr.id})`,
        description: `Signed by Checker: ${activeSigner.principalName} (${activeSigner.department})`,
        makerPrincipal: `${targetCr.makerName} (${targetCr.makerUid})`,
        checkerPrincipal: `${activeSigner.principalName} (${activeSigner.principalUid})`,
        commitHash: `#${targetCr.sha256Short.slice(0, 7)}`,
        sha256Signature: `ecdsa256:${targetCr.sha256Full.slice(0, 40)}`,
        status: 'VERIFIED',
      };
      setStatutoryLogs((prev) => [newLog, ...prev]);

      triggerToast(
        `Attested & Published ${crId} (${targetCr.targetCode} → ${targetCr.schemaTo}) to PROD.`,
        'success'
      );
    } else if (newStatus === 'rejected') {
      triggerToast(
        `Rejected Change Request ${crId}. Returned to Maker (${targetCr.makerName}) with audit remarks.`,
        'warning'
      );
    } else {
      triggerToast(
        `Requested Maker revision on ${crId} (${targetCr.targetCode}).`,
        'info'
      );
    }
  };

  const handleStageNewChangeRequest = (newCr: ChangeRequestItem) => {
    setChangeRequests((prev) => [newCr, ...prev]);
    setDatasets((prev) =>
      prev.map((ds) =>
        ds.code === newCr.targetCode
          ? {
              ...ds,
              governanceState: 'pending_signoff',
              governanceLabel: '1 Pending Sign-Off',
              pendingCount: (ds.pendingCount || 0) + 1,
              actionType: 'review_staging',
              linkedCrId: newCr.id,
            }
          : ds
      )
    );
    triggerToast(
      `Committed batch ${newCr.id} (${newCr.targetCode}) to Maker-Checker Governance Queue.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0d1c2f]">
      {/* Top Navigation Chrome */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingQueueCount={pendingQueueCount}
        currentRole={currentRole}
        onSelectRole={(role) => {
          setCurrentRole(role);
          triggerToast(
            `Switched active governance role scope to ${role.label} (${role.principalName} / ${role.principalUid}).`,
            'info'
          );
        }}
        datasets={datasets}
        changeRequests={changeRequests}
        statutoryLogs={statutoryLogs}
        onJumpToDataset={(dsId) => {
          setSelectedEditorDatasetId(dsId);
          setActiveTab('editor');
        }}
        onJumpToCr={(crId) => {
          setSelectedCrId(crId);
          setActiveTab('queue');
        }}
      />

      {/* Main Body Layout: Left Sidebar + Active Workspace Viewport */}
      <div className="flex-1 flex items-stretch min-w-0">
        <LeftSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingQueueCount={pendingQueueCount}
          activeDomainScope={activeDomainScope}
          onChangeDomainScope={(sc) => {
            setActiveDomainScope(sc);
            triggerToast(
              `Switched Active Domain Scope to ${sc.code} (${sc.version}).`,
              'info'
            );
          }}
        />

        <main className="flex-1 min-w-0 overflow-x-hidden">
          {activeTab === 'catalog' && (
            <DatasetCatalogView
              datasets={datasets}
              pendingQueueCount={pendingQueueCount}
              statutoryLogs={statutoryLogs}
              onReviewStaging={handleReviewStagingFromCatalog}
              onOpenEditor={handleOpenEditorFromCatalog}
              onGoToQueue={() => setActiveTab('queue')}
              onGoToAuditLogs={() => setActiveTab('audit')}
              onCreateDataset={(newDs) =>
                setDatasets((prev) => [newDs, ...prev])
              }
              onNotify={triggerToast}
            />
          )}

          {activeTab === 'queue' && (
            <MakerCheckerQueueView
              changeRequests={changeRequests}
              selectedCrId={selectedCrId}
              onSelectCr={setSelectedCrId}
              currentRole={currentRole}
              onSwitchRole={setCurrentRole}
              onUpdateCrStatus={handleUpdateCrStatus}
              onOpenAuditExplorer={() => setActiveTab('audit')}
              onNotify={triggerToast}
            />
          )}

          {activeTab === 'editor' && (
            <DataEditorMakerView
              datasets={datasets}
              selectedDatasetId={selectedEditorDatasetId}
              onSelectDataset={setSelectedEditorDatasetId}
              currentRole={currentRole}
              onStageChangeRequest={handleStageNewChangeRequest}
              onNavigateToQueue={(crId) => {
                setSelectedCrId(crId);
                setActiveTab('queue');
              }}
              onNotify={triggerToast}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailExplorerView
              logs={statutoryLogs}
              onNotify={triggerToast}
            />
          )}

          {activeTab === 'config' && (
            <SystemConfigSchemaView
              datasets={datasets}
              onNotify={triggerToast}
            />
          )}
        </main>
      </div>

      {/* Level 4 Institutional Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 max-w-md bg-white rounded px-4 py-3 shadow-lg border flex items-start gap-2.5 text-xs ${
            toast.type === 'success'
              ? 'border-[#059669]'
              : toast.type === 'warning'
              ? 'border-[#ba1a1a]'
              : 'border-[#01284b]'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
          )}
          {toast.type === 'warning' && (
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-[#01284b] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-[#0d1c2f] font-medium leading-snug">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#64748b] hover:text-[#0d1c2f]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
