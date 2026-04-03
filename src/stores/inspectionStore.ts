import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Inspection,
  InspectionType,
  Grade,
  InspectionSection,
  VehicleDetails,
  MotHistory,
  BodyDamageMarker,
  InspectionPhoto,
  AiKnownIssue,
  AiRepairSummary,
  TyreDepths,
} from '../types/inspection';
import { saveInspection, getAllInspections, getInspection, deleteInspection as deleteFromDb } from '../lib/db';
import { getSectionsForInspection, type SectionDef } from '../lib/sectionConfig';

interface InspectionStore {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  loading: boolean;

  // Load all inspections from IndexedDB
  loadInspections: () => Promise<void>;

  // Create a new inspection
  createInspection: (params: {
    inspectorId: string;
    inspectorName: string;
    type: InspectionType;
    vehicle: VehicleDetails;
    mileage: number | null;
    motHistory: MotHistory | null;
    agreedPurchasePrice: number | null;
  }) => Promise<Inspection>;

  // Load a specific inspection
  loadInspection: (id: string) => Promise<void>;

  // Update grade for an item
  gradeItem: (sectionKey: string, itemKey: string, grade: Grade) => Promise<void>;

  // Update notes for an item
  updateItemNotes: (sectionKey: string, itemKey: string, notes: string) => Promise<void>;

  // Update tyre depths
  updateTyreDepths: (sectionKey: string, itemKey: string, depths: TyreDepths) => Promise<void>;

  // Add photo to an item
  addPhotoToItem: (sectionKey: string, itemKey: string, photo: InspectionPhoto) => Promise<void>;

  // Remove photo from an item
  removePhotoFromItem: (sectionKey: string, itemKey: string, photoId: string) => Promise<void>;

  // Add body damage marker
  addDamageMarker: (marker: BodyDamageMarker) => Promise<void>;

  // Remove body damage marker
  removeDamageMarker: (markerId: string) => Promise<void>;

  // Set AI known issues
  setKnownIssues: (issues: AiKnownIssue[]) => Promise<void>;

  // Set AI repair summary
  setRepairSummary: (summary: AiRepairSummary) => Promise<void>;

  // Set final agreed price
  setFinalAgreedPrice: (price: number) => Promise<void>;

  // Submit inspection
  submitInspection: () => Promise<void>;

  // Delete inspection
  deleteInspection: (id: string) => Promise<void>;
}

function buildSections(sectionDefs: SectionDef[], inspectionId: string): InspectionSection[] {
  return sectionDefs.map((def) => ({
    id: uuidv4(),
    inspectionId,
    sectionKey: def.key,
    sectionOrder: def.order,
    status: 'not_started',
    items: def.items.map((item, idx) => ({
      id: uuidv4(),
      sectionId: '',
      itemKey: item.key,
      label: item.label,
      grade: null,
      notes: '',
      photos: [],
      itemOrder: idx,
      updatedAt: new Date().toISOString(),
    })),
  }));
}

function computeGrades(inspection: Inspection): { overallGrade: Grade | null; passCounts: number; advisoryCounts: number; failCounts: number } {
  let pass = 0, advisory = 0, fail = 0;
  for (const section of inspection.sections) {
    for (const item of section.items) {
      if (item.grade === 'pass') pass++;
      else if (item.grade === 'advisory') advisory++;
      else if (item.grade === 'fail') fail++;
    }
  }

  let overallGrade: Grade | null = null;
  if (fail > 0) overallGrade = 'fail';
  else if (advisory > 0) overallGrade = 'advisory';
  else if (pass > 0) overallGrade = 'pass';

  return { overallGrade, passCounts: pass, advisoryCounts: advisory, failCounts: fail };
}

function updateSectionStatus(section: InspectionSection): InspectionSection {
  const graded = section.items.filter((i) => i.grade !== null).length;
  let status: InspectionSection['status'] = 'not_started';
  if (graded === section.items.length && graded > 0) status = 'completed';
  else if (graded > 0) status = 'in_progress';
  return { ...section, status };
}

async function persistInspection(inspection: Inspection): Promise<void> {
  const grades = computeGrades(inspection);
  const updated = {
    ...inspection,
    ...grades,
    updatedAt: new Date().toISOString(),
  };
  await saveInspection(updated);
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  inspections: [],
  currentInspection: null,
  loading: false,

  loadInspections: async () => {
    set({ loading: true });
    const inspections = await getAllInspections();
    set({ inspections, loading: false });
  },

  createInspection: async (params) => {
    const id = uuidv4();
    const sectionDefs = getSectionsForInspection(
      params.type,
      params.vehicle.fuelType,
      params.vehicle.transmissionType,
    );
    const sections = buildSections(sectionDefs, id);

    const inspection: Inspection = {
      id,
      inspectorId: params.inspectorId,
      inspectorName: params.inspectorName,
      type: params.type,
      status: 'in_progress',
      vehicle: params.vehicle,
      mileage: params.mileage,
      motHistory: params.motHistory,
      agreedPurchasePrice: params.agreedPurchasePrice,
      finalAgreedPrice: null,
      sections,
      bodyDamageMarkers: [],
      overallGrade: null,
      passCounts: 0,
      advisoryCounts: 0,
      failCounts: 0,
      aiKnownIssues: null,
      aiRepairSummary: null,
      publicToken: uuidv4().slice(0, 8),
      sellerPin: String(Math.floor(1000 + Math.random() * 9000)),
      isReinspection: false,
      originalInspectionId: null,
      notes: '',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      offlineId: id,
    };

    await saveInspection(inspection);
    set((state) => ({
      inspections: [inspection, ...state.inspections],
      currentInspection: inspection,
    }));
    return inspection;
  },

  loadInspection: async (id) => {
    set({ loading: true });
    const inspection = await getInspection(id);
    set({ currentInspection: inspection || null, loading: false });
  },

  gradeItem: async (sectionKey, itemKey, grade) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const sections = currentInspection.sections.map((section) => {
      if (section.sectionKey !== sectionKey) return section;
      const items = section.items.map((item) => {
        if (item.itemKey !== itemKey) return item;
        return { ...item, grade, updatedAt: new Date().toISOString() };
      });
      return updateSectionStatus({ ...section, items });
    });

    const updated = { ...currentInspection, sections };
    await persistInspection(updated);
    set({ currentInspection: { ...updated, ...computeGrades(updated) } });
  },

  updateItemNotes: async (sectionKey, itemKey, notes) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const sections = currentInspection.sections.map((section) => {
      if (section.sectionKey !== sectionKey) return section;
      const items = section.items.map((item) => {
        if (item.itemKey !== itemKey) return item;
        return { ...item, notes, updatedAt: new Date().toISOString() };
      });
      return { ...section, items };
    });

    const updated = { ...currentInspection, sections };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  updateTyreDepths: async (sectionKey, itemKey, depths) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const sections = currentInspection.sections.map((section) => {
      if (section.sectionKey !== sectionKey) return section;
      const items = section.items.map((item) => {
        if (item.itemKey !== itemKey) return item;
        return { ...item, tyreDepths: depths, updatedAt: new Date().toISOString() };
      });
      return { ...section, items };
    });

    const updated = { ...currentInspection, sections };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  addPhotoToItem: async (sectionKey, itemKey, photo) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const sections = currentInspection.sections.map((section) => {
      if (section.sectionKey !== sectionKey) return section;
      const items = section.items.map((item) => {
        if (item.itemKey !== itemKey) return item;
        return { ...item, photos: [...item.photos, photo] };
      });
      return { ...section, items };
    });

    const updated = { ...currentInspection, sections };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  removePhotoFromItem: async (sectionKey, itemKey, photoId) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const sections = currentInspection.sections.map((section) => {
      if (section.sectionKey !== sectionKey) return section;
      const items = section.items.map((item) => {
        if (item.itemKey !== itemKey) return item;
        return { ...item, photos: item.photos.filter((p) => p.id !== photoId) };
      });
      return { ...section, items };
    });

    const updated = { ...currentInspection, sections };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  addDamageMarker: async (marker) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const updated = {
      ...currentInspection,
      bodyDamageMarkers: [...currentInspection.bodyDamageMarkers, marker],
    };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  removeDamageMarker: async (markerId) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const updated = {
      ...currentInspection,
      bodyDamageMarkers: currentInspection.bodyDamageMarkers.filter((m) => m.id !== markerId),
    };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  setKnownIssues: async (issues) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const updated = { ...currentInspection, aiKnownIssues: issues };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  setRepairSummary: async (summary) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const updated = { ...currentInspection, aiRepairSummary: summary };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  setFinalAgreedPrice: async (price) => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const updated = { ...currentInspection, finalAgreedPrice: price };
    await persistInspection(updated);
    set({ currentInspection: updated });
  },

  submitInspection: async () => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const now = new Date().toISOString();
    const updated = {
      ...currentInspection,
      status: 'submitted' as const,
      completedAt: now,
      updatedAt: now,
    };
    await saveInspection(updated);
    set((state) => ({
      currentInspection: updated,
      inspections: state.inspections.map((i) => (i.id === updated.id ? updated : i)),
    }));
  },

  deleteInspection: async (id) => {
    await deleteFromDb(id);
    set((state) => ({
      inspections: state.inspections.filter((i) => i.id !== id),
      currentInspection: state.currentInspection?.id === id ? null : state.currentInspection,
    }));
  },
}));
