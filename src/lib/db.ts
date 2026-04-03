import { openDB, type IDBPDatabase } from 'idb';
import type { Inspection, InspectionPhoto } from '../types/inspection';

const DB_NAME = 'auto-inspect-pro';
const DB_VERSION = 1;

interface SyncQueueEntry {
  id: string;
  type: 'inspection' | 'photo' | 'delete';
  entityId: string;
  timestamp: number;
  retries: number;
}

interface AutoInspectDB {
  inspections: {
    key: string;
    value: Inspection;
    indexes: { 'by-status': string; 'by-updated': string };
  };
  photos: {
    key: string;
    value: InspectionPhoto & { blob?: Blob };
    indexes: { 'by-inspection': string; 'by-item': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueEntry;
    indexes: { 'by-timestamp': number };
  };
}

let dbInstance: IDBPDatabase<AutoInspectDB> | null = null;

export async function getDb(): Promise<IDBPDatabase<AutoInspectDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<AutoInspectDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Inspections store
      const inspectionStore = db.createObjectStore('inspections', { keyPath: 'id' });
      inspectionStore.createIndex('by-status', 'status');
      inspectionStore.createIndex('by-updated', 'updatedAt');

      // Photos store
      const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
      photoStore.createIndex('by-inspection', 'inspectionId');
      photoStore.createIndex('by-item', 'itemId');

      // Sync queue store
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('by-timestamp', 'timestamp');
    },
  });

  return dbInstance;
}

// Inspection operations
export async function saveInspection(inspection: Inspection): Promise<void> {
  const db = await getDb();
  await db.put('inspections', inspection);
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  const db = await getDb();
  return db.get('inspections', id);
}

export async function getAllInspections(): Promise<Inspection[]> {
  const db = await getDb();
  const all = await db.getAll('inspections');
  return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function deleteInspection(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('inspections', id);
}

// Photo operations
export async function savePhoto(photo: InspectionPhoto & { blob?: Blob }): Promise<void> {
  const db = await getDb();
  await db.put('photos', photo);
}

export async function getPhoto(id: string): Promise<(InspectionPhoto & { blob?: Blob }) | undefined> {
  const db = await getDb();
  return db.get('photos', id);
}

export async function getPhotosByInspection(inspectionId: string): Promise<(InspectionPhoto & { blob?: Blob })[]> {
  const db = await getDb();
  return db.getAllFromIndex('photos', 'by-inspection', inspectionId);
}

export async function getPhotosByItem(itemId: string): Promise<(InspectionPhoto & { blob?: Blob })[]> {
  const db = await getDb();
  return db.getAllFromIndex('photos', 'by-item', itemId);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('photos', id);
}

// Sync queue operations
export async function addToSyncQueue(entry: SyncQueueEntry): Promise<void> {
  const db = await getDb();
  await db.put('syncQueue', entry);
}

export async function getSyncQueue(): Promise<SyncQueueEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex('syncQueue', 'by-timestamp');
}

export async function removeSyncQueueEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('syncQueue', id);
}
