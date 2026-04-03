import { getSyncQueue, removeSyncQueueEntry, getInspection, getPhoto } from './db';
import { supabase } from './supabase';

let syncInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the background sync process.
 */
export function startSync(): void {
  if (syncInterval) return;

  // Sync every 30 seconds when online
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  }, 30_000);

  // Also sync immediately when coming back online
  window.addEventListener('online', processSyncQueue);
}

export function stopSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  window.removeEventListener('online', processSyncQueue);
}

async function processSyncQueue(): Promise<void> {
  const queue = await getSyncQueue();

  for (const entry of queue) {
    try {
      if (entry.type === 'inspection') {
        await syncInspection(entry.entityId);
      } else if (entry.type === 'photo') {
        await syncPhoto(entry.entityId);
      }
      await removeSyncQueueEntry(entry.id);
    } catch (err) {
      console.error(`Sync failed for ${entry.type} ${entry.entityId}:`, err);
      // Will retry on next cycle
    }
  }
}

async function syncInspection(id: string): Promise<void> {
  const inspection = await getInspection(id);
  if (!inspection) return;

  const { error } = await supabase
    .from('inspections')
    .upsert({
      id: inspection.id,
      inspector_id: inspection.inspectorId,
      type: inspection.type,
      status: inspection.status,
      vrm: inspection.vehicle.vrm,
      vehicle_make: inspection.vehicle.make,
      vehicle_model: inspection.vehicle.model,
      vehicle_year: inspection.vehicle.year,
      vehicle_color: inspection.vehicle.colour,
      vehicle_fuel_type: inspection.vehicle.fuelType,
      mileage: inspection.mileage,
      agreed_purchase_price: inspection.agreedPurchasePrice,
      final_agreed_price: inspection.finalAgreedPrice,
      overall_grade: inspection.overallGrade,
      ai_known_issues: inspection.aiKnownIssues,
      ai_repair_estimate: inspection.aiRepairSummary,
      public_token: inspection.publicToken,
      seller_pin: inspection.sellerPin,
      notes: inspection.notes,
      completed_at: inspection.completedAt,
      updated_at: inspection.updatedAt,
      offline_id: inspection.offlineId,
    });

  if (error) throw error;
}

async function syncPhoto(id: string): Promise<void> {
  const photo = await getPhoto(id);
  if (!photo || !photo.blob) return;

  const filePath = `inspections/${photo.inspectionId}/${photo.id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('inspection-photos')
    .upload(filePath, photo.blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Update the photo record with the storage path
  const { error: dbError } = await supabase
    .from('inspection_photos')
    .upsert({
      id: photo.id,
      inspection_id: photo.inspectionId,
      item_id: photo.itemId,
      storage_path: filePath,
      caption: photo.caption,
      brightness_score: photo.brightnessScore,
      resolution_ok: photo.resolutionOk,
    });

  if (dbError) throw dbError;
}

/**
 * Trigger an immediate sync attempt.
 */
export async function syncNow(): Promise<void> {
  if (navigator.onLine) {
    await processSyncQueue();
  }
}
