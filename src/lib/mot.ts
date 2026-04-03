import type { MotHistory, MotTest } from '../types/inspection';

const MOT_API_URL = 'https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests';

interface DvsaMotResponse {
  registration: string;
  make: string;
  model: string;
  motTests?: DvsaMotTest[];
}

interface DvsaMotTest {
  completedDate: string;
  expiryDate?: string;
  testResult: string;
  odometerValue: string;
  odometerUnit: string;
  rfrAndComments?: Array<{
    text: string;
    type: string;
  }>;
}

/**
 * Look up MOT history from the DVSA API.
 */
export async function lookupMotHistory(vrm: string): Promise<MotHistory> {
  const apiKey = import.meta.env.VITE_DVLA_API_KEY; // Same key or separate

  if (!apiKey || apiKey === 'your-dvla-api-key') {
    return getMockMotHistory();
  }

  const cleanVrm = vrm.replace(/\s/g, '').toUpperCase();
  const response = await fetch(`${MOT_API_URL}?registration=${cleanVrm}`, {
    headers: {
      'Accept': 'application/json+v6',
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`MOT history lookup failed: ${response.status}`);
  }

  const data: DvsaMotResponse[] = await response.json();
  const vehicle = data[0];

  if (!vehicle?.motTests) {
    return { tests: [], currentExpiryDate: null };
  }

  const tests: MotTest[] = vehicle.motTests.map((test) => ({
    testDate: test.completedDate,
    expiryDate: test.expiryDate || null,
    odometerValue: parseInt(test.odometerValue, 10) || 0,
    odometerUnit: test.odometerUnit,
    testResult: test.testResult,
    advisories: (test.rfrAndComments || [])
      .filter((c) => c.type === 'ADVISORY')
      .map((c) => c.text),
    failures: (test.rfrAndComments || [])
      .filter((c) => c.type === 'FAIL')
      .map((c) => c.text),
  }));

  const latestPass = tests.find((t) => t.testResult === 'PASSED');

  return {
    tests,
    currentExpiryDate: latestPass?.expiryDate || null,
  };
}

/**
 * Check for mileage anomaly by comparing entered mileage against MOT history.
 */
export function checkMileageAnomaly(
  enteredMileage: number,
  motHistory: MotHistory,
): { isAnomaly: boolean; message: string } {
  if (motHistory.tests.length === 0) {
    return { isAnomaly: false, message: '' };
  }

  const latestTest = motHistory.tests[0];
  if (enteredMileage < latestTest.odometerValue) {
    return {
      isAnomaly: true,
      message: `Warning: The entered mileage (${enteredMileage.toLocaleString()}) is lower than the last MOT reading (${latestTest.odometerValue.toLocaleString()} on ${latestTest.testDate}). This may indicate mileage tampering.`,
    };
  }

  return { isAnomaly: false, message: '' };
}

/**
 * Mock MOT history for development/demo mode.
 */
function getMockMotHistory(): MotHistory {
  return {
    tests: [
      {
        testDate: '2024-03-15',
        expiryDate: '2025-03-14',
        odometerValue: 45230,
        odometerUnit: 'mi',
        testResult: 'PASSED',
        advisories: [
          'Front brake disc worn but above legal limit',
          'Offside rear tyre slightly worn',
        ],
        failures: [],
      },
      {
        testDate: '2023-03-10',
        expiryDate: '2024-03-09',
        odometerValue: 33100,
        odometerUnit: 'mi',
        testResult: 'PASSED',
        advisories: ['Nearside front tyre slightly worn'],
        failures: [],
      },
      {
        testDate: '2022-03-08',
        expiryDate: '2023-03-07',
        odometerValue: 21400,
        odometerUnit: 'mi',
        testResult: 'PASSED',
        advisories: [],
        failures: [],
      },
    ],
    currentExpiryDate: '2025-03-14',
  };
}
