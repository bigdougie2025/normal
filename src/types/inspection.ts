export type InspectionType = 'private_purchase' | 'pdi';
export type Grade = 'pass' | 'advisory' | 'fail';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type TransmissionType = 'manual' | 'automatic';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'submitted' | 'amended';
export type DamageType = 'dent' | 'scratch' | 'chip' | 'crack' | 'rust' | 'other';
export type DamageSeverity = 'minor' | 'moderate' | 'severe';
export type DiagramView = 'front' | 'rear' | 'driver' | 'passenger';

export interface VehicleDetails {
  vrm: string;
  make: string;
  model: string;
  year: number | null;
  colour: string;
  fuelType: FuelType | null;
  transmissionType: TransmissionType | null;
  engineSize: string;
}

export interface MotTest {
  testDate: string;
  expiryDate: string | null;
  odometerValue: number;
  odometerUnit: string;
  testResult: string;
  advisories: string[];
  failures: string[];
}

export interface MotHistory {
  tests: MotTest[];
  currentExpiryDate: string | null;
}

export interface TyreDepths {
  nsf: number | null; // Nearside front
  osf: number | null; // Offside front
  nsr: number | null; // Nearside rear
  osr: number | null; // Offside rear
}

export interface InspectionPhoto {
  id: string;
  inspectionId: string;
  itemId: string | null;
  markerId: string | null;
  blob?: Blob;
  storagePath: string | null;
  thumbnailDataUrl: string | null;
  caption: string;
  brightnessScore: number | null;
  resolutionOk: boolean;
  createdAt: string;
  syncStatus: SyncStatus;
}

export interface BodyDamageMarker {
  id: string;
  inspectionId: string;
  view: DiagramView;
  xPercent: number;
  yPercent: number;
  damageType: DamageType;
  severity: DamageSeverity;
  notes: string;
  photoId: string | null;
  createdAt: string;
}

export interface InspectionItem {
  id: string;
  sectionId: string;
  itemKey: string;
  label: string;
  grade: Grade | null;
  notes: string;
  tyreDepths?: TyreDepths;
  photos: InspectionPhoto[];
  itemOrder: number;
  updatedAt: string;
}

export interface InspectionSection {
  id: string;
  inspectionId: string;
  sectionKey: string;
  sectionOrder: number;
  items: InspectionItem[];
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface AiKnownIssue {
  issue: string;
  detail: string;
}

export interface AiRepairEstimate {
  itemKey: string;
  itemLabel: string;
  notes: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
}

export interface AiRepairSummary {
  estimates: AiRepairEstimate[];
  totalCostLow: number;
  totalCostHigh: number;
  revisedOfferPrice: number;
}

export interface Inspection {
  id: string;
  inspectorId: string;
  inspectorName: string;
  type: InspectionType;
  status: InspectionStatus;
  vehicle: VehicleDetails;
  mileage: number | null;
  motHistory: MotHistory | null;
  agreedPurchasePrice: number | null;
  finalAgreedPrice: number | null;
  sections: InspectionSection[];
  bodyDamageMarkers: BodyDamageMarker[];
  overallGrade: Grade | null;
  passCounts: number;
  advisoryCounts: number;
  failCounts: number;
  aiKnownIssues: AiKnownIssue[] | null;
  aiRepairSummary: AiRepairSummary | null;
  publicToken: string | null;
  sellerPin: string;
  isReinspection: boolean;
  originalInspectionId: string | null;
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  offlineId: string;
}
