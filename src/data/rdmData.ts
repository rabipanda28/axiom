export type GovernanceStateType = 'pending_signoff' | 'synced_active' | 'review_due';

export interface DatasetItem {
  id: string;
  name: string;
  code: string;
  verified: boolean;
  domain: 'Regulatory' | 'Financial' | 'Accounting' | 'Entity';
  domainCategory: 'Market & Trading' | 'Risk & Compliance' | 'Accounting & GL' | 'Customer & Entity';
  version: string;
  publishedAgo: string;
  publisher: string;
  rowVolume: number;
  governanceState: GovernanceStateType;
  governanceLabel: string;
  pendingCount?: number;
  changeVelocityPrimary: string;
  changeVelocityAccent?: string;
  changeVelocityAccentFirst?: boolean;
  actionType: 'review_staging' | 'open_editor';
  linkedCrId?: string;
  iconType: 'globe_ban' | 'currency' | 'hierarchy' | 'briefcase' | 'tax_doc' | 'calendar';
  ddlSchema: string;
  sampleRecords: Array<Record<string, string | number | boolean>>;
  recentCommits: Array<{
    hash: string;
    version: string;
    author: string;
    checker: string;
    timestamp: string;
    summary: string;
  }>;
}

export interface StagedCellDiff {
  id: string;
  recordKey: string;
  recordSubKey: string;
  isNewEntity?: boolean;
  fieldAttribute: string;
  currentLiveValue: string | null;
  proposedStagedLines: string[];
  impactTitle?: string;
  impactIcon?: 'shield' | 'info' | 'swap' | 'none';
  impactAccentColor?: 'default' | 'indigo';
  impactDescription: string;
}

export interface ChangeRequestItem {
  id: string;
  priority: 'HIGH PRIORITY' | 'NORMAL' | 'CRITICAL';
  submittedAgo: string;
  title: string;
  targetCode: string;
  snippet: string;
  makerRole: string;
  makerName: string;
  makerShortName: string;
  makerTitle: string;
  makerUid: string;
  ticketId: string;
  recordsCount: number;
  mutationsCount: number;
  schemaFrom: string;
  schemaTo: string;
  submissionTimestamp: string;
  businessJustification: string;
  sha256Short: string;
  sha256Full: string;
  stagingCommitTimestamp: string;
  stagingEventId: string;
  stagingEventShortDate: string;
  rulesEvaluated: number;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  assignedToMe: boolean;
  defaultRemarks: string;
  diffs: StagedCellDiff[];
}

export interface StatutoryLogEntry {
  id: string;
  eventId: string;
  timestamp: string;
  relativeTime: string;
  datasetCode: string;
  eventType: 'DUAL_SIGN_COMMIT' | 'SCHEMA_FREEZE_REVOKED' | 'STAGED_BATCH_PUBLISHED' | 'MAKER_STAGING_CREATED' | 'SOD_POLICY_ENFORCED' | 'CHECKER_REJECTION';
  title: string;
  description: string;
  makerPrincipal: string;
  checkerPrincipal: string;
  commitHash: string;
  sha256Signature: string;
  status: 'VERIFIED' | 'UNLOCKED' | 'ENFORCED' | 'REJECTED';
}

export const INITIAL_DATASETS: DatasetItem[] = [
  {
    id: 'ds-1',
    name: 'Country & Sanctions Registry',
    code: 'GEO_SANCTION_MAP',
    verified: true,
    domain: 'Regulatory',
    domainCategory: 'Risk & Compliance',
    version: 'v4.18.2',
    publishedAgo: '20m ago',
    publisher: 'e.rostova',
    rowVolume: 14290,
    governanceState: 'pending_signoff',
    governanceLabel: '2 Pending Sign-Off',
    pendingCount: 2,
    changeVelocityPrimary: '+14 added, ',
    changeVelocityAccent: '2 del',
    actionType: 'review_staging',
    linkedCrId: 'CR-2024-8891',
    iconType: 'globe_ban',
    ddlSchema: `CREATE TABLE MASTER_RDM.GEO_SANCTION_MAP (
  ISO_ALPHA_3 CHAR(3) PRIMARY KEY NOT NULL,
  ISO_NUMERIC CHAR(3) NOT NULL,
  JURISDICTION_NAME VARCHAR(128) NOT NULL,
  OFAC_SANCTION_TIER VARCHAR(32) DEFAULT 'NONE',
  EU_CSDP_RESTRICTED BOOLEAN DEFAULT FALSE,
  FATF_AML_STATUS VARCHAR(24) NOT NULL,
  EFFECTIVE_UTC TIMESTAMP NOT NULL,
  SHA256_ROW_DIGEST CHAR(64) NOT NULL
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY', PARTITION_BY = 'OFAC_SANCTION_TIER');`,
    sampleRecords: [
      { KEY: 'CH', NUM: '756', JURISDICTION: 'Switzerland', OFAC_TIER: 'NONE', FATF_STATUS: 'COMPLIANT', SETTLE_ELIGIBLE: 'TRUE' },
      { KEY: 'SG', NUM: '702', JURISDICTION: 'Singapore', OFAC_TIER: 'NONE', FATF_STATUS: 'COMPLIANT', SETTLE_ELIGIBLE: 'TRUE' },
      { KEY: 'GB', NUM: '826', JURISDICTION: 'United Kingdom', OFAC_TIER: 'NONE', FATF_STATUS: 'COMPLIANT', SETTLE_ELIGIBLE: 'TRUE' },
      { KEY: 'AR', NUM: '032', JURISDICTION: 'Argentina', OFAC_TIER: 'ENHANCED_MON', FATF_STATUS: 'GREY_WATCH', SETTLE_ELIGIBLE: 'RESTRICTED' },
    ],
    recentCommits: [
      { hash: '#48f110c', version: 'v4.18.2', author: 'e.rostova', checker: 'm.keller', timestamp: '2024-10-24 14:02 UTC', summary: 'Updated OFAC SDN annex identifiers for Q4 cross-border screening' },
      { hash: '#39a821d', version: 'v4.18.1', author: 'd.bauer', checker: 'm.keller', timestamp: '2024-10-19 09:15 UTC', summary: 'Synchronized EU consolidated financial sanctions list' },
    ],
  },
  {
    id: 'ds-2',
    name: 'ISO Currency & Precision Units',
    code: 'CURR_REF_V2',
    verified: true,
    domain: 'Financial',
    domainCategory: 'Market & Trading',
    version: 'v9.2.0',
    publishedAgo: '3h ago',
    publisher: 'm.vance',
    rowVolume: 284,
    governanceState: 'synced_active',
    governanceLabel: 'Synced & Active',
    changeVelocityPrimary: 'No deltas (7d)',
    actionType: 'open_editor',
    linkedCrId: 'CR-2024-8891',
    iconType: 'currency',
    ddlSchema: `CREATE TABLE MASTER_RDM.CURR_REF_V2 (
  ISO_ALPHA CHAR(8) PRIMARY KEY NOT NULL,
  ISO_NUMERIC VARCHAR(8) NOT NULL,
  DECIMAL_PRECISION SMALLINT NOT NULL CHECK (DECIMAL_PRECISION BETWEEN 0 AND 8),
  ROUNDING_CONVENTION VARCHAR(32) NOT NULL,
  SETTLEMENT_METHOD VARCHAR(40) NOT NULL,
  IS_DELIVERABLE BOOLEAN DEFAULT TRUE,
  CLS_ELIGIBLE BOOLEAN DEFAULT FALSE
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY', DUAL_CONTROL = 'TIER_2_STRICT');`,
    sampleRecords: [
      { KEY: 'USD', NUM: '840', DECIMAL_PRECISION: 2, ROUNDING_CONVENTION: 'HALF_EVEN', SETTLEMENT_METHOD: 'RTGS_STANDARD', IS_DELIVERABLE: 'TRUE' },
      { KEY: 'EUR', NUM: '978', DECIMAL_PRECISION: 2, ROUNDING_CONVENTION: 'HALF_EVEN', SETTLEMENT_METHOD: 'TARGET2_RTGS', IS_DELIVERABLE: 'TRUE' },
      { KEY: 'JPY', NUM: '392', DECIMAL_PRECISION: 0, ROUNDING_CONVENTION: 'FLOOR_NEAREST', SETTLEMENT_METHOD: 'BOJ_NET_RTGS', IS_DELIVERABLE: 'TRUE' },
      { KEY: 'GBP', NUM: '826', DECIMAL_PRECISION: 2, ROUNDING_CONVENTION: 'HALF_EVEN', SETTLEMENT_METHOD: 'CHAPS_RTGS', IS_DELIVERABLE: 'TRUE' },
      { KEY: 'CHF', NUM: '756', DECIMAL_PRECISION: 2, ROUNDING_CONVENTION: 'HALF_UP_BANKER', SETTLEMENT_METHOD: 'SIC_RTGS', IS_DELIVERABLE: 'TRUE' },
    ],
    recentCommits: [
      { hash: '#71e091b', version: 'v9.2.0', author: 'm.vance', checker: 'a.keller', timestamp: '2024-10-24 11:30 UTC', summary: 'Unlocked CURR_REF_V2 for quarterly ISO 4217 adjustments' },
      { hash: '#60c449a', version: 'v9.1.9', author: 'e.rostova', checker: 'm.keller', timestamp: '2024-10-12 16:40 UTC', summary: 'Aligned CLS PvP settlement window cutoffs for APAC currencies' },
    ],
  },
  {
    id: 'ds-3',
    name: 'GL Sub-Ledger Hierarchy',
    code: 'GL_ACCT_TREE',
    verified: false,
    domain: 'Accounting',
    domainCategory: 'Accounting & GL',
    version: 'v12.0.4',
    publishedAgo: 'Yesterday',
    publisher: 'j.chen',
    rowVolume: 4812,
    governanceState: 'pending_signoff',
    governanceLabel: '1 Pending Sign-Off',
    pendingCount: 1,
    changeVelocityPrimary: '',
    changeVelocityAccent: '3 nodes relocated',
    changeVelocityAccentFirst: true,
    actionType: 'review_staging',
    linkedCrId: 'CR-2024-8889',
    iconType: 'hierarchy',
    ddlSchema: `CREATE TABLE MASTER_RDM.GL_ACCT_TREE (
  GL_NODE_ID VARCHAR(24) PRIMARY KEY NOT NULL,
  PARENT_NODE_ID VARCHAR(24) NOT NULL,
  IFRS_CLASSIFICATION VARCHAR(48) NOT NULL,
  GAAP_MIRROR_ACCT VARCHAR(24) NOT NULL,
  LEGAL_ENTITY_SCOPE VARCHAR(32) NOT NULL,
  RECON_FREQUENCY VARCHAR(16) DEFAULT 'DAILY_EOD'
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY', STATUTORY_LOCK = 'SEMI_ANNUAL');`,
    sampleRecords: [
      { KEY: 'GL-4019-EU', NUM: '4019', PARENT_NODE: 'GL-4000-DERIV', IFRS_CLASS: 'IFRS9_FVTPL', LEGAL_ENTITY: 'AXIOM_EU_GMBH', STATUS: 'ACTIVE' },
      { KEY: 'GL-4022-UK', NUM: '4022', PARENT_NODE: 'GL-4000-DERIV', IFRS_CLASS: 'IFRS9_FVOCI', LEGAL_ENTITY: 'AXIOM_UK_PLC', STATUS: 'ACTIVE' },
      { KEY: 'GL-1104-US', NUM: '1104', PARENT_NODE: 'GL-1000-CASH', IFRS_CLASS: 'IAS7_CASH_EQ', LEGAL_ENTITY: 'AXIOM_US_NA', STATUS: 'ACTIVE' },
    ],
    recentCommits: [
      { hash: '#55d198e', version: 'v12.0.4', author: 'j.chen', checker: 'm.keller', timestamp: '2024-10-23 17:15 UTC', summary: 'Reconciled IFRS-9 hedge accounting sub-ledger rollup nodes' },
    ],
  },
  {
    id: 'ds-4',
    name: 'Trading Desk & Book Mapping',
    code: 'DESK_BOOK_MAPPING',
    verified: true,
    domain: 'Financial',
    domainCategory: 'Market & Trading',
    version: 'v6.4.1',
    publishedAgo: '2d ago',
    publisher: 'k.larson',
    rowVolume: 1104,
    governanceState: 'synced_active',
    governanceLabel: 'Synced & Active',
    changeVelocityPrimary: '+2 books split',
    actionType: 'open_editor',
    linkedCrId: 'CR-2024-8884',
    iconType: 'briefcase',
    ddlSchema: `CREATE TABLE MASTER_RDM.DESK_BOOK_MAPPING (
  BOOK_CODE VARCHAR(20) PRIMARY KEY NOT NULL,
  DESK_IDENTIFIER VARCHAR(32) NOT NULL,
  VOLCKER_EXEMPTION_TAG VARCHAR(24) NOT NULL,
  FRTB_DESK_SCOPE VARCHAR(32) NOT NULL,
  PRIMARY_TRADER_UID VARCHAR(16) NOT NULL,
  REGION_CLUSTER VARCHAR(16) NOT NULL
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
    sampleRecords: [
      { KEY: 'BK_FX_G10_NY', NUM: '101', DESK: 'G10_SPOT_FWD', FRTB_MODEL: 'IMA_APPROVED', REGION: 'AMER', ACTIVE_STATE: 'LIVE' },
      { KEY: 'BK_RATES_LDN', NUM: '204', DESK: 'EUR_SWAPS_MM', FRTB_MODEL: 'IMA_APPROVED', REGION: 'EMEA', ACTIVE_STATE: 'LIVE' },
      { KEY: 'BK_LATAM_FI_04', NUM: '319', DESK: 'EM_LATAM_CREDIT', FRTB_MODEL: 'SA_STANDARD', REGION: 'AMER', ACTIVE_STATE: 'SUNSET_PENDING' },
    ],
    recentCommits: [
      { hash: '#99a221f', version: 'v6.4.1', author: 'k.larson', checker: 'm.keller', timestamp: '2024-10-22 09:10 UTC', summary: 'Published staged batch for FRTB desk boundary split' },
    ],
  },
  {
    id: 'ds-5',
    name: 'Tax Jurisdiction Rates (OECD)',
    code: 'TAX_RATES_GLOBAL',
    verified: false,
    domain: 'Regulatory',
    domainCategory: 'Risk & Compliance',
    version: 'v3.9.0',
    publishedAgo: '3d ago',
    publisher: 'd.bauer',
    rowVolume: 3940,
    governanceState: 'review_due',
    governanceLabel: 'Review Due (48h)',
    changeVelocityPrimary: 'Scheduled re-cert',
    actionType: 'open_editor',
    linkedCrId: 'CR-2024-8879',
    iconType: 'tax_doc',
    ddlSchema: `CREATE TABLE MASTER_RDM.TAX_RATES_GLOBAL (
  JURISDICTION_TAX_ID VARCHAR(24) PRIMARY KEY NOT NULL,
  ISO_COUNTRY CHAR(2) NOT NULL,
  WITHHOLDING_RATE_BPS INTEGER NOT NULL,
  TREATY_REDUCED_BPS INTEGER NOT NULL,
  OECD_PILLAR_2_FLOOR BOOLEAN DEFAULT TRUE,
  STATUTORY_EFFECTIVE_DATE DATE NOT NULL
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
    sampleRecords: [
      { KEY: 'JP_WHT_DIV_15', NUM: '392-A', COUNTRY: 'JP', WHT_RATE_PCT: '15.315%', TREATY_FLOOR: '10.000%', PILLAR2: 'TRUE' },
      { KEY: 'SG_WHT_INT_15', NUM: '702-B', COUNTRY: 'SG', WHT_RATE_PCT: '15.000%', TREATY_FLOOR: '5.000%', PILLAR2: 'TRUE' },
      { KEY: 'DE_KAP_EST_25', NUM: '276-A', COUNTRY: 'DE', WHT_RATE_PCT: '26.375%', TREATY_FLOOR: '15.000%', PILLAR2: 'TRUE' },
    ],
    recentCommits: [
      { hash: '#12b804c', version: 'v3.9.0', author: 'd.bauer', checker: 'a.keller', timestamp: '2024-10-21 15:44 UTC', summary: 'Annual OECD Pillar Two statutory withholding floor certification' },
    ],
  },
  {
    id: 'ds-6',
    name: 'Settlement Holiday Calendars',
    code: 'CAL_HOLIDAY_SETTLE',
    verified: true,
    domain: 'Financial',
    domainCategory: 'Market & Trading',
    version: 'v5.0.0',
    publishedAgo: '5d ago',
    publisher: 'a.keller',
    rowVolume: 12800,
    governanceState: 'pending_signoff',
    governanceLabel: '1 Pending Sign-Off',
    pendingCount: 1,
    changeVelocityPrimary: '+120 CY2026 days',
    actionType: 'review_staging',
    linkedCrId: 'CR-2024-8891',
    iconType: 'calendar',
    ddlSchema: `CREATE TABLE MASTER_RDM.CAL_HOLIDAY_SETTLE (
  CALENDAR_CODE VARCHAR(16) NOT NULL,
  HOLIDAY_DATE DATE NOT NULL,
  MIC_EXCHANGE_CODE CHAR(4) NOT NULL,
  SETTLEMENT_SYSTEM VARCHAR(24) NOT NULL,
  IS_HALF_DAY BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (CALENDAR_CODE, HOLIDAY_DATE)
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
    sampleRecords: [
      { KEY: 'USNY_FED_2026', NUM: '2026-01-01', MIC: 'XNYS', SYSTEM: 'FEDWIRE', OBSERVANCE: 'New Year Day', SETTLE_OPEN: 'FALSE' },
      { KEY: 'GBLO_BOE_2026', NUM: '2026-04-03', MIC: 'XLON', SYSTEM: 'CHAPS', OBSERVANCE: 'Good Friday', SETTLE_OPEN: 'FALSE' },
      { KEY: 'JPTO_BOJ_2026', NUM: '2026-05-04', MIC: 'XTKS', SYSTEM: 'BOJ_NET', OBSERVANCE: 'Greenery Day', SETTLE_OPEN: 'FALSE' },
    ],
    recentCommits: [
      { hash: '#84e190a', version: 'v5.0.0', author: 'a.keller', checker: 'm.keller', timestamp: '2024-10-19 18:05 UTC', summary: 'Ingested SIFMA and ECB TARGET2 CY2026 non-settlement dates' },
    ],
  },
  // Additional datasets for Page 2 & Domain tabs
  {
    id: 'ds-7',
    name: 'Legal Entity Identifier (GLEIF) Hierarchy',
    code: 'LEI_COUNTERPARTY_V4',
    verified: true,
    domain: 'Regulatory',
    domainCategory: 'Customer & Entity',
    version: 'v8.1.2',
    publishedAgo: '6h ago',
    publisher: 's.lindqvist',
    rowVolume: 248910,
    governanceState: 'synced_active',
    governanceLabel: 'Synced & Active',
    changeVelocityPrimary: '+412 LEIs synced',
    actionType: 'open_editor',
    iconType: 'globe_ban',
    ddlSchema: `CREATE TABLE MASTER_RDM.LEI_COUNTERPARTY_V4 (
  LEI_CODE CHAR(20) PRIMARY KEY NOT NULL,
  LEGAL_NAME VARCHAR(255) NOT NULL,
  ULTIMATE_PARENT_LEI CHAR(20),
  JURISDICTION_ISO CHAR(2) NOT NULL,
  REGISTRATION_STATUS VARCHAR(24) NOT NULL
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
    sampleRecords: [
      { KEY: '5493006MHB84DD0ZWV18', NUM: 'LEI-01', LEGAL_NAME: 'Nordic Clearing AB', JURISDICTION: 'SE', STATUS: 'ISSUED' },
      { KEY: '213800D1EI4B9WTWWD28', NUM: 'LEI-02', LEGAL_NAME: 'EuroSwap Clear PLC', JURISDICTION: 'GB', STATUS: 'ISSUED' },
    ],
    recentCommits: [
      { hash: '#c41209f', version: 'v8.1.2', author: 's.lindqvist', checker: 'm.keller', timestamp: '2024-10-24 08:12 UTC', summary: 'Daily GLEIF Golden Copy Level 1 & Level 2 parent tree delta sync' },
    ],
  },
  {
    id: 'ds-8',
    name: 'ISDA Master Netting Set Agreements',
    code: 'ISDA_CSA_NETTING',
    verified: true,
    domain: 'Regulatory',
    domainCategory: 'Customer & Entity',
    version: 'v3.4.0',
    publishedAgo: '1d ago',
    publisher: 'p.patel',
    rowVolume: 8420,
    governanceState: 'synced_active',
    governanceLabel: 'Synced & Active',
    changeVelocityPrimary: '+9 CSA schedules',
    actionType: 'open_editor',
    iconType: 'briefcase',
    ddlSchema: `CREATE TABLE MASTER_RDM.ISDA_CSA_NETTING (
  NETTING_SET_ID VARCHAR(32) PRIMARY KEY NOT NULL,
  COUNTERPARTY_LEI CHAR(20) NOT NULL,
  GOVERNING_LAW VARCHAR(24) NOT NULL,
  VM_THRESHOLD_USD NUMERIC(18,2) NOT NULL
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
    sampleRecords: [
      { KEY: 'NS_ISDA_2024_901', NUM: '901', COUNTERPARTY_LEI: '5493006MHB84DD0ZWV18', LAW: 'ENGLISH_LAW', VM_THRESHOLD: 0 },
    ],
    recentCommits: [
      { hash: '#e09182b', version: 'v3.4.0', author: 'p.patel', checker: 'a.keller', timestamp: '2024-10-23 11:00 UTC', summary: 'Updated UMR Phase 6 initial margin custodial thresholds' },
    ],
  },
  {
    id: 'ds-9',
    name: 'Basel III / FRTB Risk Weight Buckets',
    code: 'FRTB_SBA_WEIGHTS',
    verified: true,
    domain: 'Regulatory',
    domainCategory: 'Risk & Compliance',
    version: 'v2.1.0',
    publishedAgo: '4d ago',
    publisher: 'k.sato',
    rowVolume: 640,
    governanceState: 'synced_active',
    governanceLabel: 'Synced & Active',
    changeVelocityPrimary: 'No deltas (14d)',
    actionType: 'open_editor',
    iconType: 'tax_doc',
    ddlSchema: `CREATE TABLE MASTER_RDM.FRTB_SBA_WEIGHTS (
  RISK_CLASS VARCHAR(24) NOT NULL,
  BUCKET_CODE VARCHAR(12) NOT NULL,
  RISK_WEIGHT_PCT NUMERIC(6,3) NOT NULL,
  CORRELATION_RHO NUMERIC(5,4) NOT NULL,
  PRIMARY KEY (RISK_CLASS, BUCKET_CODE)
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
    sampleRecords: [
      { KEY: 'GIRR_USD_10Y', NUM: 'B-01', RISK_CLASS: 'GIRR', BUCKET: 'CUR_SPEC', RISK_WEIGHT: '1.400%', RHO: '0.9900' },
    ],
    recentCommits: [
      { hash: '#a81203d', version: 'v2.1.0', author: 'k.sato', checker: 'm.keller', timestamp: '2024-10-20 14:20 UTC', summary: 'Certified BCBS d457 Sensitivities-Based Method correlation matrices' },
    ],
  },
  {
    id: 'ds-10',
    name: 'IFRS-9 Expected Credit Loss Staging Matrix',
    code: 'IFRS9_ECL_MATRIX',
    verified: true,
    domain: 'Accounting',
    domainCategory: 'Accounting & GL',
    version: 'v7.0.2',
    publishedAgo: '6d ago',
    publisher: 'j.chen',
    rowVolume: 1920,
    governanceState: 'synced_active',
    governanceLabel: 'Synced & Active',
    changeVelocityPrimary: '+4 macro scalars',
    actionType: 'open_editor',
    iconType: 'hierarchy',
    ddlSchema: `CREATE TABLE MASTER_RDM.IFRS9_ECL_MATRIX (
  STAGE_BUCKET VARCHAR(16) PRIMARY KEY NOT NULL,
  SICR_PD_DELTA_BPS INTEGER NOT NULL,
  LGD_FLOOR_PCT NUMERIC(5,2) NOT NULL
) WITH (STORAGE_ENGINE = 'ARROW_IPC_ZERO_COPY');`,
    sampleRecords: [
      { KEY: 'STAGE_1_PERF', NUM: 'S1', SICR_BPS: 150, LGD_FLOOR: '12.50%', HORIZON: '12_MONTH_ECL' },
    ],
    recentCommits: [
      { hash: '#f01923c', version: 'v7.0.2', author: 'j.chen', checker: 'a.keller', timestamp: '2024-10-18 16:00 UTC', summary: 'Q4 macroeconomic forward-looking PD overlay scalars' },
    ],
  },
];

export const INITIAL_CHANGE_REQUESTS: ChangeRequestItem[] = [
  {
    id: 'CR-2024-8891',
    priority: 'HIGH PRIORITY',
    submittedAgo: '35m ago',
    title: 'ISO Currency Codes (CURR_REF_V2)',
    targetCode: 'CURR_REF_V2',
    snippet: 'Aligning USD precision and JPY rounding rules for upcoming Q4 cross-currency settlement engine...',
    makerRole: 'PS Maker',
    makerName: 'Elena Rostova',
    makerShortName: 'Elena Rost...',
    makerTitle: 'IT PS Lead',
    makerUid: 'UID_77218',
    ticketId: 'INC-94821',
    recordsCount: 4,
    mutationsCount: 4,
    schemaFrom: 'v4.1.2',
    schemaTo: 'v4.2.0',
    submissionTimestamp: 'Oct 24, 2024, 14:22:10 UTC',
    businessJustification: '“Aligning USD precision and JPY rounding rules for upcoming Q4 cross-currency settlement engine release. Incorporating newly authorized Argentine Peso sovereign reference code changes per Central Bank regulatory circular BCRA A-7890.”',
    sha256Short: '8a4f9102c4b8b6e2...901ef47b3',
    sha256Full: '8a4f9102c4b8b6e2d190f8a37c4129b77c65a108f3b2190e44d1901ef47b3',
    stagingCommitTimestamp: '2024-10-24 14:22:10',
    stagingEventId: 'EID_88190-STAGED',
    stagingEventShortDate: 'Oct 24 14:22:10 UTC',
    rulesEvaluated: 28,
    status: 'pending',
    assignedToMe: true,
    defaultRemarks: 'All checksums validated against SWIFT MT103 reference standard.',
    diffs: [
      {
        id: 'diff-1',
        recordKey: 'USD',
        recordSubKey: 'NUM: 840',
        fieldAttribute: 'Decimal Precision',
        currentLiveValue: '2',
        proposedStagedLines: ['+ 4'],
        impactTitle: 'Low Risk',
        impactIcon: 'shield',
        impactAccentColor: 'default',
        impactDescription: 'Validated against downstream trade capture schema (FX_CORE_V2).',
      },
      {
        id: 'diff-2',
        recordKey: 'USD',
        recordSubKey: 'NUM: 840',
        fieldAttribute: 'Settlement Method',
        currentLiveValue: 'RTGS_STANDARD',
        proposedStagedLines: ['+ RTGS_CONTINUOUS_LINKED'],
        impactTitle: 'CLS Group Routing',
        impactIcon: 'info',
        impactAccentColor: 'default',
        impactDescription: 'Enables direct PvP clearing across multi-currency nodes.',
      },
      {
        id: 'diff-3',
        recordKey: 'ARS_OFFSHORE',
        recordSubKey: 'NUM: 032-B',
        isNewEntity: true,
        fieldAttribute: '[Whole Entity Insert]',
        currentLiveValue: null,
        proposedStagedLines: [
          "+ ISO_ALPHA: 'ARS_B'",
          '+ PRECISION: 2',
          '+ IS_DELIVERABLE: FALSE',
        ],
        impactTitle: 'NDF Contract Desk',
        impactIcon: 'swap',
        impactAccentColor: 'indigo',
        impactDescription: 'Non-deliverable forward partition isolation confirmed with Front Office.',
      },
      {
        id: 'diff-4',
        recordKey: 'JPY',
        recordSubKey: 'NUM: 392',
        fieldAttribute: 'Rounding Convention',
        currentLiveValue: 'FLOOR_NEAREST',
        proposedStagedLines: ['+ HALF_UP_BANKER'],
        impactIcon: 'none',
        impactDescription: 'Zero financial discrepancy observed across 10,000 synthetic test runs.',
      },
    ],
  },
  {
    id: 'CR-2024-8889',
    priority: 'NORMAL',
    submittedAgo: '2h ago',
    title: 'GL Sub-Ledger Hierarchy',
    targetCode: 'GL_ACCT_TREE',
    snippet: 'Provisioning GL_ACCT_TREE node for European energy swap synthetic derivatives clearing...',
    makerRole: 'PS Maker',
    makerName: 'Marcus Vance',
    makerShortName: 'Marcus Va...',
    makerTitle: 'VP Accounting Sys',
    makerUid: 'UID_64109',
    ticketId: 'INC-94770',
    recordsCount: 1,
    mutationsCount: 3,
    schemaFrom: 'v12.0.3',
    schemaTo: 'v12.0.4',
    submissionTimestamp: 'Oct 24, 2024, 12:48:05 UTC',
    businessJustification: '“Provisioning GL_ACCT_TREE rollup nodes for European energy swap synthetic derivatives clearing under EMIR Refit reporting mandate. Relocating 3 legacy bilateral clearing child accounts into the central CCP netting partition.”',
    sha256Short: '3f9c8814a02d71b9...412c09a8e',
    sha256Full: '3f9c8814a02d71b9e66201948c77a210f9d4431887b012a44c91412c09a8e',
    stagingCommitTimestamp: '2024-10-24 12:48:05',
    stagingEventId: 'EID_88142-STAGED',
    stagingEventShortDate: 'Oct 24 12:48:05 UTC',
    rulesEvaluated: 34,
    status: 'pending',
    assignedToMe: true,
    defaultRemarks: 'IFRS-9 FVTPL hierarchy parent linkages verified with EMEA Group Controller.',
    diffs: [
      {
        id: 'diff-201',
        recordKey: 'GL-4019-EU',
        recordSubKey: 'NODE: 4019',
        fieldAttribute: 'Parent Node ID',
        currentLiveValue: 'GL-4000-BILAT',
        proposedStagedLines: ['+ GL-4050-CCP-CLEAR'],
        impactTitle: 'SAP S/4HANA Ledger',
        impactIcon: 'info',
        impactAccentColor: 'default',
        impactDescription: 'Re-routes EOD trial balance postings to Frankfurt CCP clearing segment.',
      },
      {
        id: 'diff-202',
        recordKey: 'GL-4019-EU',
        recordSubKey: 'NODE: 4019',
        fieldAttribute: 'EMIR Margin Tag',
        currentLiveValue: 'UNCLEARED_OTC',
        proposedStagedLines: ['+ EUREX_CCP_SEGREGATED'],
        impactTitle: 'Low Risk',
        impactIcon: 'shield',
        impactAccentColor: 'default',
        impactDescription: 'Validated against BaFin & ESMA EMIR Refit XML schema v1.4.',
      },
      {
        id: 'diff-203',
        recordKey: 'GL-4091-SYN',
        recordSubKey: 'NODE: 4091',
        isNewEntity: true,
        fieldAttribute: '[Whole Entity Insert]',
        currentLiveValue: null,
        proposedStagedLines: [
          "+ NODE_CODE: 'GL-4091-SYN'",
          "+ IFRS_CLASS: 'IFRS9_FVTPL_ENERGY'",
          "+ RECON_CYCLE: 'INTRADAY_15M'",
        ],
        impactTitle: 'Commodity Desk',
        impactIcon: 'swap',
        impactAccentColor: 'indigo',
        impactDescription: 'Isolated synthetic swap sub-ledger confirmed with Product Control.',
      },
    ],
  },
  {
    id: 'CR-2024-8884',
    priority: 'CRITICAL',
    submittedAgo: '5h ago',
    title: 'Trading Desk Book Codes',
    targetCode: 'DESK_BOOK_MAPPING',
    snippet: 'DESK_BOOK_MAPPING decommission of decommissioned Latin America fixed-income des...',
    makerRole: 'PS Maker',
    makerName: 'Priya Patel',
    makerShortName: 'Priya Patel',
    makerTitle: 'Market Risk Ops',
    makerUid: 'UID_51902',
    ticketId: 'INC-94612',
    recordsCount: 2,
    mutationsCount: 2,
    schemaFrom: 'v6.4.0',
    schemaTo: 'v6.4.1',
    submissionTimestamp: 'Oct 24, 2024, 09:50:18 UTC',
    businessJustification: '“DESK_BOOK_MAPPING statutory decommission of legacy Latin America fixed-income sovereign credit books following portfolio novation to NY Emerging Markets hub. Enforces hard Trade Capture block on retired book IDs.”',
    sha256Short: 'c190e44b71a209f4...782b11e04',
    sha256Full: 'c190e44b71a209f48812d0934a771b2094f8812e0934c11092a4782b11e04',
    stagingCommitTimestamp: '2024-10-24 09:50:18',
    stagingEventId: 'EID_88095-STAGED',
    stagingEventShortDate: 'Oct 24 09:50:18 UTC',
    rulesEvaluated: 42,
    status: 'pending',
    assignedToMe: true,
    defaultRemarks: 'Zero open positions or unsettled cash legs confirmed in Murex & Calypso.',
    diffs: [
      {
        id: 'diff-301',
        recordKey: 'BK_LATAM_FI_04',
        recordSubKey: 'BOOK: 319',
        fieldAttribute: 'Operational Status',
        currentLiveValue: 'ACTIVE_TRADING',
        proposedStagedLines: ['+ DECOMMISSIONED_LOCKED'],
        impactTitle: 'Trade Capture Gate',
        impactIcon: 'shield',
        impactAccentColor: 'default',
        impactDescription: 'Blocks new FIX order entry on BK_LATAM_FI_04 across all ECNs.',
      },
      {
        id: 'diff-302',
        recordKey: 'BK_LATAM_FI_05',
        recordSubKey: 'BOOK: 320',
        fieldAttribute: 'Novation Target Book',
        currentLiveValue: 'NONE',
        proposedStagedLines: ['+ BK_NY_EM_SOV_01'],
        impactTitle: 'FRTB IMA Desk',
        impactIcon: 'swap',
        impactAccentColor: 'indigo',
        impactDescription: 'Historical VaR backtesting series linked to NY EM Sovereign desk.',
      },
    ],
  },
  {
    id: 'CR-2024-8879',
    priority: 'HIGH PRIORITY',
    submittedAgo: '1d ago',
    title: 'Tax Jurisdiction Rates',
    targetCode: 'TAX_RATES_GLOBAL',
    snippet: 'TAX_RATES_GLOBAL statutory adjustment for APAC financial service withholding rates per OECD...',
    makerRole: 'PS Maker',
    makerName: 'Kenji Sato',
    makerShortName: 'Kenji Sato',
    makerTitle: 'APAC Tax Counsel',
    makerUid: 'UID_39104',
    ticketId: 'INC-94109',
    recordsCount: 6,
    mutationsCount: 2,
    schemaFrom: 'v3.8.9',
    schemaTo: 'v3.9.0',
    submissionTimestamp: 'Oct 23, 2024, 16:10:44 UTC',
    businessJustification: '“TAX_RATES_GLOBAL statutory adjustment for APAC financial service withholding rates per OECD Pillar Two GloBE minimum effective tax directive and bilateral treaty protocol updates for JP and SG.”',
    sha256Short: '7d12a904f88c31e0...55a901c2d',
    sha256Full: '7d12a904f88c31e09941b2847c651092a3847f1092b3847c109255a901c2d',
    stagingCommitTimestamp: '2024-10-23 16:10:44',
    stagingEventId: 'EID_87992-STAGED',
    stagingEventShortDate: 'Oct 23 16:10:44 UTC',
    rulesEvaluated: 19,
    status: 'pending',
    assignedToMe: false,
    defaultRemarks: 'Verified against statutory gazette circular and external tax opinion memo.',
    diffs: [
      {
        id: 'diff-401',
        recordKey: 'SG_WHT_INT_15',
        recordSubKey: 'NUM: 702-B',
        fieldAttribute: 'Treaty Reduced Rate (BPS)',
        currentLiveValue: '750',
        proposedStagedLines: ['+ 500'],
        impactTitle: 'Coupon Engine',
        impactIcon: 'info',
        impactAccentColor: 'default',
        impactDescription: 'Adjusts cross-border bond coupon withholding calculation to 5.00%.',
      },
      {
        id: 'diff-402',
        recordKey: 'JP_WHT_DIV_15',
        recordSubKey: 'NUM: 392-A',
        fieldAttribute: 'OECD Pillar 2 Floor',
        currentLiveValue: 'EXEMPT_LEGACY',
        proposedStagedLines: ['+ ENFORCED_15PCT_MIN'],
        impactTitle: 'Low Risk',
        impactIcon: 'shield',
        impactAccentColor: 'default',
        impactDescription: 'Effective for dividend record dates on or after Nov 01, 2024.',
      },
    ],
  },
  // Approved Today items for filter tab completeness
  {
    id: 'CR-2024-8871',
    priority: 'NORMAL',
    submittedAgo: '3h ago',
    title: 'Country & Sanctions Registry (GEO_SANCTION_MAP)',
    targetCode: 'GEO_SANCTION_MAP',
    snippet: 'OFAC SDN Annex IV identifier synchronization for maritime vessel beneficial owners...',
    makerRole: 'PS Maker',
    makerName: 'Elena Rostova',
    makerShortName: 'Elena Rost...',
    makerTitle: 'IT PS Lead',
    makerUid: 'UID_77218',
    ticketId: 'INC-94501',
    recordsCount: 14,
    mutationsCount: 2,
    schemaFrom: 'v4.18.1',
    schemaTo: 'v4.18.2',
    submissionTimestamp: 'Oct 24, 2024, 11:10:00 UTC',
    businessJustification: '“Immediate ingestion of OFAC SDN Annex IV maritime beneficial ownership identifiers into GEO_SANCTION_MAP production partition.”',
    sha256Short: '48f110c98a12e44d...9012b384c',
    sha256Full: '48f110c98a12e44d991023847a6510928374f10928374c1092839012b384c',
    stagingCommitTimestamp: '2024-10-24 11:10:00',
    stagingEventId: 'EID_87901-COMMITTED',
    stagingEventShortDate: 'Oct 24 11:10:00 UTC',
    rulesEvaluated: 28,
    status: 'approved',
    assignedToMe: true,
    defaultRemarks: 'Signed by Checker m.keller (Risk Ops). Published to US-EAST master partition.',
    diffs: [
      {
        id: 'diff-501',
        recordKey: 'SANCTION_ANNEX_IV',
        recordSubKey: 'NUM: OFAC-88',
        fieldAttribute: 'Screening Block Mode',
        currentLiveValue: 'MANUAL_HOLD',
        proposedStagedLines: ['+ HARD_REJECT_STP'],
        impactTitle: 'Payment Screening',
        impactIcon: 'shield',
        impactAccentColor: 'default',
        impactDescription: 'Enforces automatic STP wire rejection on matched BIC/LEI entities.',
      },
    ],
  },
  // Rejected / Returned item for filter tab completeness
  {
    id: 'CR-2024-8865',
    priority: 'HIGH PRIORITY',
    submittedAgo: '6h ago',
    title: 'Settlement Holiday Calendars (CAL_HOLIDAY_SETTLE)',
    targetCode: 'CAL_HOLIDAY_SETTLE',
    snippet: 'Returned to Maker: Missing TARGET2 half-day Christmas Eve settlement cutoff timestamp...',
    makerRole: 'PS Maker',
    makerName: 'Marcus Vance',
    makerShortName: 'Marcus Va...',
    makerTitle: 'VP Accounting Sys',
    makerUid: 'UID_64109',
    ticketId: 'INC-94388',
    recordsCount: 3,
    mutationsCount: 1,
    schemaFrom: 'v4.9.9',
    schemaTo: 'v5.0.0-rc1',
    submissionTimestamp: 'Oct 24, 2024, 08:15:22 UTC',
    businessJustification: '“Preliminary upload of ECB TARGET2 holiday schedule for CY2026.”',
    sha256Short: '91b023e44c19283a...11029384f',
    sha256Full: '91b023e44c19283a884710928374b10928374c10928374d1092811029384f',
    stagingCommitTimestamp: '2024-10-24 08:15:22',
    stagingEventId: 'EID_87812-REJECTED',
    stagingEventShortDate: 'Oct 24 08:15:22 UTC',
    rulesEvaluated: 22,
    status: 'rejected',
    assignedToMe: false,
    defaultRemarks: 'REJECTED BY CHECKER: Dec 24 cutoff time omitted for EUR RTGS settlement window.',
    diffs: [
      {
        id: 'diff-601',
        recordKey: 'EUTA_TARGET2_2026',
        recordSubKey: 'DATE: 2026-12-24',
        fieldAttribute: 'RTGS Cutoff UTC',
        currentLiveValue: '17:00:00',
        proposedStagedLines: ['+ NULL (UNSPECIFIED)'],
        impactTitle: 'Validation Breach',
        impactIcon: 'info',
        impactAccentColor: 'default',
        impactDescription: 'Returned to Maker for mandatory NOT NULL cutoff specification.',
      },
    ],
  },
];

export const INITIAL_STATUTORY_LOGS: StatutoryLogEntry[] = [
  {
    id: 'log-1',
    eventId: 'AUD-2024-99412',
    timestamp: '2024-10-24 14:04:12 UTC',
    relativeTime: '18m ago',
    datasetCode: 'GEO_SANCTION_MAP',
    eventType: 'DUAL_SIGN_COMMIT',
    title: 'GEO_SANCTION_MAP Updated',
    description: 'Signed by Checker: m.keller (Risk Ops)',
    makerPrincipal: 'e.rostova (UID_77218)',
    checkerPrincipal: 'm.keller (UID_10492)',
    commitHash: '#48f110c',
    sha256Signature: 'ecdsa256:9f84a10c44b891e2749102c884f1902a7481902b',
    status: 'VERIFIED',
  },
  {
    id: 'log-2',
    eventId: 'AUD-2024-99388',
    timestamp: '2024-10-24 12:19:05 UTC',
    relativeTime: '2h ago',
    datasetCode: 'CURR_REF_V2',
    eventType: 'SCHEMA_FREEZE_REVOKED',
    title: 'Schema Freeze Revoked',
    description: 'CURR_REF_V2 unlocked for quarterly ISO 4217 adjustments.',
    makerPrincipal: 'm.vance (UID_64109)',
    checkerPrincipal: 'a.keller (UID_20194)',
    commitHash: '#71e091b',
    sha256Signature: 'ecdsa256:3c9102e884a1902b7481902c38471092a8471092',
    status: 'UNLOCKED',
  },
  {
    id: 'log-3',
    eventId: 'AUD-2024-99310',
    timestamp: '2024-10-24 09:14:50 UTC',
    relativeTime: '5h ago',
    datasetCode: 'DESK_BOOK_MAPPING',
    eventType: 'STAGED_BATCH_PUBLISHED',
    title: 'Staged Batch Signed Off',
    description: 'DESK_BOOK_MAPPING published to core production partition.',
    makerPrincipal: 'k.larson (UID_44812)',
    checkerPrincipal: 'm.keller (UID_10492)',
    commitHash: '#99a221f',
    sha256Signature: 'ecdsa256:7a841092b3847109c28374109d28374109e82734',
    status: 'VERIFIED',
  },
  {
    id: 'log-4',
    eventId: 'AUD-2024-99274',
    timestamp: '2024-10-24 08:15:22 UTC',
    relativeTime: '6h ago',
    datasetCode: 'CAL_HOLIDAY_SETTLE',
    eventType: 'CHECKER_REJECTION',
    title: 'Change Request Returned (CR-2024-8865)',
    description: 'Missing TARGET2 half-day settlement cutoff timestamp on 2026-12-24.',
    makerPrincipal: 'm.vance (UID_64109)',
    checkerPrincipal: 'm.keller (UID_10492)',
    commitHash: '#91b023e',
    sha256Signature: 'ecdsa256:5d901823a7481902b38471092c8471092d847109',
    status: 'REJECTED',
  },
  {
    id: 'log-5',
    eventId: 'AUD-2024-99190',
    timestamp: '2024-10-23 22:00:01 UTC',
    relativeTime: '16h ago',
    datasetCode: 'GL_ACCT_TREE',
    eventType: 'SOD_POLICY_ENFORCED',
    title: 'Segregation of Duties Gate Attested',
    description: 'Zero self-approval exceptions detected across 42 Arrow IPC partitions.',
    makerPrincipal: 'SYSTEM_DAEMON',
    checkerPrincipal: 'HSM_FIPS_140_L3',
    commitHash: '#0x8F9B2C',
    sha256Signature: 'ecdsa256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    status: 'ENFORCED',
  },
];

export interface RoleOption {
  id: 'PS Maker' | 'PS Checker' | 'Auditor Read-Only';
  label: 'PS Maker' | 'PS Checker' | 'Auditor Read-Only';
  principalName: string;
  principalUid: string;
  department: string;
  canEdit: boolean;
  canApprove: boolean;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'PS Maker',
    label: 'PS Maker',
    principalName: 'Elena Rostova',
    principalUid: 'UID_77218',
    department: 'IT PS Lead',
    canEdit: true,
    canApprove: true, // Subject to SoD check on own CRs
  },
  {
    id: 'PS Checker',
    label: 'PS Checker',
    principalName: 'M. Keller',
    principalUid: 'UID_10492',
    department: 'Risk Ops Checker',
    canEdit: false,
    canApprove: true,
  },
  {
    id: 'Auditor Read-Only',
    label: 'Auditor Read-Only',
    principalName: 'S. Lindqvist',
    principalUid: 'UID_90114',
    department: 'External Statutory Audit',
    canEdit: false,
    canApprove: false,
  },
];
