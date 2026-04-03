import type { AiKnownIssue, AiRepairSummary, InspectionItem, VehicleDetails } from '../types/inspection';
import { supabase } from './supabase';

/**
 * Fetch known issues for a vehicle via the Supabase Edge Function.
 */
export async function fetchKnownIssues(vehicle: VehicleDetails): Promise<AiKnownIssue[]> {
  const { data, error } = await supabase.functions.invoke('ai-known-issues', {
    body: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      engineSize: vehicle.engineSize,
      fuelType: vehicle.fuelType,
    },
  });

  if (error) {
    console.error('Failed to fetch known issues:', error);
    // Return demo data in development
    return getDemoKnownIssues(vehicle);
  }

  return data.issues as AiKnownIssue[];
}

/**
 * Fetch repair cost estimates via the Supabase Edge Function.
 */
export async function fetchRepairEstimate(
  vehicle: VehicleDetails,
  mileage: number,
  agreedPrice: number,
  faultItems: InspectionItem[],
): Promise<AiRepairSummary> {
  const { data, error } = await supabase.functions.invoke('ai-repair-costs', {
    body: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      mileage,
      agreedPrice,
      faults: faultItems.map((item) => ({
        key: item.itemKey,
        label: item.label,
        grade: item.grade,
        notes: item.notes,
      })),
    },
  });

  if (error) {
    console.error('Failed to fetch repair estimates:', error);
    return getDemoRepairEstimate(agreedPrice, faultItems);
  }

  return data as AiRepairSummary;
}

// Demo data for development without Supabase
function getDemoKnownIssues(vehicle: VehicleDetails): AiKnownIssue[] {
  return [
    {
      issue: 'EGR valve carbon buildup',
      detail: `Common on ${vehicle.year || ''} ${vehicle.make} ${vehicle.model} models. Can cause rough idle and reduced power. Listen for the engine hunting at idle.`,
    },
    {
      issue: 'Rear wheel bearing wear',
      detail: 'These models are known for rear wheel bearing failures around 50,000 to 70,000 miles. Listen for a humming noise that changes with speed.',
    },
    {
      issue: 'Door lock actuator failure',
      detail: 'The driver door lock actuator is a known weak point. The door may fail to lock or unlock with the central locking.',
    },
    {
      issue: 'DPF regeneration issues',
      detail: 'Diesel models are prone to DPF warning lights if used mainly for short journeys. Check the DPF status on the OBD2 scan.',
    },
  ];
}

function getDemoRepairEstimate(agreedPrice: number, items: InspectionItem[]): AiRepairSummary {
  const estimates = items.map((item) => ({
    itemKey: item.itemKey,
    itemLabel: item.label,
    notes: item.notes,
    estimatedCostLow: 100,
    estimatedCostHigh: 350,
  }));

  const totalLow = estimates.reduce((sum, e) => sum + e.estimatedCostLow, 0);
  const totalHigh = estimates.reduce((sum, e) => sum + e.estimatedCostHigh, 0);

  return {
    estimates,
    totalCostLow: totalLow,
    totalCostHigh: totalHigh,
    revisedOfferPrice: agreedPrice - Math.round((totalLow + totalHigh) / 2),
  };
}
