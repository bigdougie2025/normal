import type { VehicleDetails } from '../types/inspection';

const DVLA_API_URL = 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';

interface DvlaResponse {
  registrationNumber: string;
  make: string;
  colour: string;
  fuelType: string;
  yearOfManufacture: number;
  engineCapacity: number;
  motStatus: string;
  motExpiryDate?: string;
  taxStatus: string;
  taxDueDate?: string;
}

function mapFuelType(dvlaFuel: string): VehicleDetails['fuelType'] {
  const lower = dvlaFuel.toLowerCase();
  if (lower.includes('petrol')) return 'petrol';
  if (lower.includes('diesel')) return 'diesel';
  if (lower.includes('electric')) return 'electric';
  if (lower.includes('hybrid')) return 'hybrid';
  return null;
}

/**
 * Look up vehicle details from the DVLA API using the registration plate.
 */
export async function lookupVrm(vrm: string): Promise<VehicleDetails> {
  const apiKey = import.meta.env.VITE_DVLA_API_KEY;

  if (!apiKey || apiKey === 'your-dvla-api-key') {
    // Demo mode: return mock data for development
    return getMockVehicle(vrm);
  }

  const response = await fetch(DVLA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ registrationNumber: vrm.replace(/\s/g, '').toUpperCase() }),
  });

  if (!response.ok) {
    throw new Error(`DVLA lookup failed: ${response.status}`);
  }

  const data: DvlaResponse = await response.json();

  return {
    vrm: data.registrationNumber,
    make: data.make,
    model: '', // DVLA doesn't return model
    year: data.yearOfManufacture,
    colour: data.colour,
    fuelType: mapFuelType(data.fuelType),
    transmissionType: null, // Not available from DVLA
    engineSize: data.engineCapacity ? `${data.engineCapacity}cc` : '',
  };
}

/**
 * Mock vehicle data for development/demo mode.
 */
function getMockVehicle(vrm: string): VehicleDetails {
  return {
    vrm: vrm.toUpperCase().replace(/\s/g, ''),
    make: 'Ford',
    model: 'Focus',
    year: 2019,
    colour: 'Blue',
    fuelType: 'petrol',
    transmissionType: 'manual',
    engineSize: '1500cc',
  };
}
