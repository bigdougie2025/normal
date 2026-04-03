import type { InspectionType, FuelType, TransmissionType } from '../types/inspection';

export interface ItemDef {
  key: string;
  label: string;
  description: string;
  hint: string;
  requiredPhotos: boolean;
  photoPrompt: string;
  /** Only show this item when fuel type matches */
  fuelTypeFilter?: FuelType[];
  /** Only show this item when transmission matches */
  transmissionFilter?: TransmissionType[];
  /** If true, this item has tyre depth fields */
  hasTyreDepths?: boolean;
}

export interface SectionDef {
  key: string;
  label: string;
  icon: string;
  order: number;
  /** Which inspection types this section appears in */
  applicableTo: InspectionType[];
  items: ItemDef[];
}

export const SECTION_DEFS: SectionDef[] = [
  {
    key: 'vehicle_identity',
    label: 'VEHICLE IDENTITY AND DOCUMENTATION',
    icon: 'FileText',
    order: 1,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'v5c_present',
        label: 'V5C present and verified',
        description: 'Does the seller have the V5C? Does the name and address on the V5C match the seller? Does the VIN on the V5C match the VIN plate on the car?',
        hint: 'The VIN plate is usually visible on the dashboard through the windscreen or inside the driver door frame. Compare the full VIN character by character.',
        requiredPhotos: true,
        photoPrompt: 'Photo of V5C document and VIN plate',
      },
      {
        key: 'mot_status',
        label: 'MOT status',
        description: 'Is the MOT current and what is the expiry date? Check the DVSA history for any recent advisories.',
        hint: 'Run a free check at check.mot.gov.uk. Note the expiry date and any advisories from the most recent test.',
        requiredPhotos: false,
        photoPrompt: 'Screenshot of MOT check if needed',
      },
      {
        key: 'timing_belt',
        label: 'Timing belt status',
        description: 'Ask the seller when the timing belt was last changed. If unknown or overdue (over 5 years or 60,000 miles since last change) this is flagged.',
        hint: 'Typically due every 5 years or 60,000 miles, whichever comes first. If the seller does not know when it was last changed, mark as Advisory at minimum.',
        requiredPhotos: false,
        photoPrompt: 'Service receipt if available',
      },
      {
        key: 'both_keys',
        label: 'Both keys present',
        description: 'Does the seller have both keys? A missing second key is an Advisory.',
        hint: 'A replacement key can cost between 100 and 400 pounds depending on the vehicle. This should be factored into any price negotiation.',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'locking_wheel_nut',
        label: 'Locking wheel nut key',
        description: 'Is the locking wheel nut key present? If yes, note where it is stored.',
        hint: 'Common locations: glovebox, boot storage, under the spare wheel, or in a door pocket. Without this key the wheels cannot be removed for tyre changes or brake work.',
        requiredPhotos: false,
        photoPrompt: '',
      },
    ],
  },
  {
    key: 'exterior',
    label: 'EXTERIOR CONDITION',
    icon: 'Car',
    order: 2,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'exterior_condition',
        label: 'Overall exterior condition',
        description: 'Walk around the car and assess bodywork, paint, panel alignment, rust, dents, scratches, and any signs of previous accident repair such as mismatched paint, uneven panel gaps, or overspray on rubber seals.',
        hint: 'Look along the body panels at a shallow angle to spot dents and ripples. Check where panels meet for uneven gaps. Run your hand along under door sills to feel for filler. Check the boot floor and spare wheel well for signs of repair.',
        requiredPhotos: true,
        photoPrompt: 'One photo per side of the vehicle (front, rear, driver side, passenger side) plus a photo for each damage marker',
      },
    ],
  },
  {
    key: 'glass_lights',
    label: 'GLASS AND LIGHTS',
    icon: 'Lightbulb',
    order: 3,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'glass_lights_condition',
        label: 'Glass and lights condition',
        description: 'Check all glass (windscreen, side windows, rear screen) for chips, cracks, and scratches. Check all exterior lights (headlights, taillights, indicators, fog lights, reversing lights) for function and condition.',
        hint: 'Windscreen chips in the driver line of sight are an MOT failure. Check all lights with ignition on and a walk-around. Do not forget reversing lights (select reverse gear briefly).',
        requiredPhotos: false,
        photoPrompt: 'Photo of any damage found',
      },
    ],
  },
  {
    key: 'tyres_wheels',
    label: 'TYRES AND WHEELS',
    icon: 'Circle',
    order: 4,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'tyre_condition',
        label: 'Tyre condition and tread',
        description: 'Overall condition of all four tyres including tread depth. Enter a reading in millimetres for each tyre. Legal minimum in the UK is 1.6mm. Below 3mm is an Advisory. Uneven wear may indicate alignment or suspension issues.',
        hint: 'Use a tread depth gauge or the 20p coin test. Measure at three points across the width of each tyre to check for uneven wear. NSF = nearside front, OSF = offside front, NSR = nearside rear, OSR = offside rear.',
        requiredPhotos: true,
        photoPrompt: 'Tread depth gauge or coin against tread, and any damage',
        hasTyreDepths: true,
      },
    ],
  },
  {
    key: 'brakes',
    label: 'BRAKES',
    icon: 'Disc',
    order: 5,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'brake_condition',
        label: 'Overall brake condition',
        description: 'Visual inspection of brake discs where visible through alloy spokes, and test drive assessment of braking performance. Check for scoring, lipping, or blue discolouration on discs.',
        hint: 'Look through the wheel spokes at the disc surface. Heavy scoring or a visible lip on the edge means the discs are worn. Blue marks mean the brakes have overheated. During the test drive, brake firmly from 30mph and check the car pulls up straight.',
        requiredPhotos: true,
        photoPrompt: 'Discs where visible through wheels',
      },
    ],
  },
  {
    key: 'under_bonnet',
    label: 'UNDER BONNET',
    icon: 'Wrench',
    order: 6,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'fluid_levels',
        label: 'Fluid levels and condition',
        description: 'Check engine oil level and colour (should be golden brown, not black or sludgy), coolant level and colour (should be green or orange, not milky or rusty), brake fluid level, screenwash level. Check underside of oil filler cap for creamy or mayonnaise like residue.',
        hint: 'Creamy residue under the oil filler cap is a major red flag for head gasket failure and is an automatic Fail. Black sludgy oil suggests the car has not been serviced regularly.',
        requiredPhotos: true,
        photoPrompt: 'Engine bay overview, oil dipstick, oil filler cap underside',
      },
      {
        key: 'visual_leaks',
        label: 'Visual leaks and condition',
        description: 'Use a phone torch to check under the car for fresh fluid patches on the ground or on components. Check for any obvious leaks from hoses, the radiator, or around the engine.',
        hint: 'Fresh oil is dark brown or black and slippery. Coolant is typically green or orange and has a sweet smell. Power steering fluid is red or light brown. Any active drip is a concern.',
        requiredPhotos: true,
        photoPrompt: 'Any leaks or concerns found',
      },
      {
        key: 'engine_bay_condition',
        label: 'General engine bay condition',
        description: 'Overall cleanliness, any signs of poor or non standard repairs, loose or frayed wiring, or significant corrosion.',
        hint: 'Look for cable ties holding things together, loose wiring, aftermarket parts that look poorly fitted, or heavy corrosion on battery terminals or brackets.',
        requiredPhotos: true,
        photoPrompt: 'Engine bay overview',
      },
    ],
  },
  {
    key: 'interior',
    label: 'INTERIOR',
    icon: 'Armchair',
    order: 7,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'interior_condition',
        label: 'Interior condition',
        description: 'Overall condition of seats, upholstery, dashboard, door cards, headlining, floor mats, and boot area. Check boot floor for signs of water ingress.',
        hint: 'Lift the boot floor carpet and feel for dampness. Check the headlining for sagging. Run your hand across seats to check for tears hidden by covers. Check all seatbelts retract smoothly.',
        requiredPhotos: true,
        photoPrompt: 'Interior overview, any specific damage or concerns',
      },
      {
        key: 'smells',
        label: 'Smells',
        description: 'Note any unusual smells on entering the vehicle. A musty or damp smell may indicate water ingress or flood damage. A burning smell may indicate oil or electrical issues. A sweet or fruity smell may indicate a coolant leak.',
        hint: 'Open the car and stand back for a moment before getting in. First impressions matter. A damp smell combined with misted windows or watermarks on seats is a serious concern.',
        requiredPhotos: false,
        photoPrompt: 'Any evidence of water damage or source of smell',
      },
    ],
  },
  {
    key: 'electrics_hvac',
    label: 'ELECTRICS AND HVAC',
    icon: 'Zap',
    order: 8,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'dashboard_warnings',
        label: 'Dashboard warning lights',
        description: 'Turn ignition to ON without starting the engine. All warning lights should illuminate briefly then go off when the engine starts. Note any light that remains on: engine management, ABS, airbag, oil pressure, battery, DPF (diesel only), hybrid system warning (hybrid only).',
        hint: 'With the ignition on but engine off, all warning lights should be lit. This confirms the bulbs work. Start the engine and note any that stay on. An engine management light is the most common and can indicate anything from a minor sensor fault to a serious engine issue.',
        requiredPhotos: true,
        photoPrompt: 'Dashboard warning lights on ignition before start, any specific fault',
        fuelTypeFilter: undefined,
      },
      {
        key: 'electrical_systems',
        label: 'Electrical systems and HVAC',
        description: 'Test air conditioning, heating, electric windows, central locking, infotainment system, horn, wipers and washers. One broad grade covering all of these with notes on anything that does not function.',
        hint: 'Test every window up and down. Check the air conditioning blows cold (not just ambient). Test all wiper speeds and the rear wiper if fitted. Check the horn. Try every button on the infotainment system.',
        requiredPhotos: false,
        photoPrompt: 'Any specific fault found',
      },
    ],
  },
  {
    key: 'mechanical_drive',
    label: 'MECHANICAL AND DRIVE',
    icon: 'Gauge',
    order: 9,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'engine_startup',
        label: 'Engine startup and idle',
        description: 'Does the engine start cleanly? Is the idle smooth? Note any visible smoke from the exhaust on startup. Blue smoke indicates burning oil. White smoke on a warm day indicates coolant burning. Black smoke indicates a fuelling issue.',
        hint: 'Ask the seller not to start the car before you arrive. A cold start reveals more than a warm engine. Watch the exhaust for the first 30 seconds after startup.',
        requiredPhotos: false,
        photoPrompt: 'Exhaust smoke if visible',
      },
      {
        key: 'clutch',
        label: 'Clutch',
        description: 'Assess biting point position during test drive. A very high biting point suggests a worn clutch nearing end of life. Note any slipping under acceleration, juddering on pull away, or noise on pedal operation.',
        hint: 'Find the biting point on a hill. If it is near the top of the pedal travel the clutch is worn. Try accelerating hard in a high gear at low speed. If the revs rise without matching speed increase, the clutch is slipping.',
        requiredPhotos: false,
        photoPrompt: '',
        transmissionFilter: ['manual'],
      },
      {
        key: 'gearbox',
        label: 'Gearbox',
        description: 'Manual: all gears engage cleanly without crunching, no difficulty selecting any gear, no jumping out of gear. Automatic: smoothness of gear changes, any hesitation or jerking between ratios, any delay when selecting drive or reverse.',
        hint: 'For manual, try every gear including reverse. For automatic, from standstill select drive and reverse to check for clunks or delays. During driving, note if the gearbox hunts between gears on hills.',
        requiredPhotos: false,
        photoPrompt: '',
      },
      {
        key: 'steering_suspension_temp',
        label: 'Steering, suspension, and temperature',
        description: 'Does the car drive in a straight line on a flat road without input? Any pulling, knocking, vibration, or unusual noise from the suspension over bumps. Temperature gauge settles in the middle and stays there during the drive.',
        hint: 'Find a straight flat road and briefly let go of the wheel. The car should track straight. Drive over speed bumps and listen for knocks from the suspension. Keep an eye on the temperature gauge throughout the drive.',
        requiredPhotos: false,
        photoPrompt: 'Any relevant concerns noted during the drive',
      },
    ],
  },
  {
    key: 'obd2',
    label: 'OBD2 DIAGNOSTIC SCAN',
    icon: 'Cpu',
    order: 10,
    applicableTo: ['private_purchase', 'pdi'],
    items: [
      {
        key: 'active_fault_codes',
        label: 'Active fault codes',
        description: 'Connect the Bluetooth OBD2 dongle to the diagnostic port and read active fault codes. If any active codes are present, this is an automatic Fail.',
        hint: 'The OBD2 port is usually under the dashboard on the driver side, near the steering column. Connect your dongle and use your OBD2 app to read codes. Photograph the results screen.',
        requiredPhotos: true,
        photoPrompt: 'OBD2 scan results screen (mandatory)',
      },
      {
        key: 'pending_fault_codes',
        label: 'Pending fault codes',
        description: 'Are there any pending (stored but not yet active) fault codes? If yes, this is an automatic Advisory.',
        hint: 'Pending codes are faults that have been detected but have not occurred enough times to trigger the warning light. They still indicate a developing problem.',
        requiredPhotos: true,
        photoPrompt: 'OBD2 scan results screen',
      },
      {
        key: 'readiness_monitors',
        label: 'Readiness monitors',
        description: 'Are all readiness monitors complete? If multiple monitors show as Not Ready on a car with significant mileage, this is an automatic Fail as it strongly indicates codes were recently cleared to hide faults.',
        hint: 'After codes are cleared, the car needs to be driven through specific drive cycles for monitors to reset. If a car with 50,000 miles shows multiple monitors as Not Ready, someone has recently cleared the codes.',
        requiredPhotos: true,
        photoPrompt: 'OBD2 readiness monitor screen',
      },
    ],
  },
  {
    key: 'valeting',
    label: 'VALETING AND PRESENTATION',
    icon: 'Sparkles',
    order: 11,
    applicableTo: ['pdi'],
    items: [
      {
        key: 'presentation_standard',
        label: 'Overall presentation standard',
        description: 'Is the vehicle clean inside and out, glass clear, tyres dressed, engine bay presentable, and ready for retail?',
        hint: 'Check for water spots on paintwork, streaks on glass, dust on the dashboard, and that all trim pieces are properly fitted. The car should look its absolute best for the customer.',
        requiredPhotos: true,
        photoPrompt: 'Exterior overview, interior overview',
      },
    ],
  },
];

/**
 * Get sections applicable to the given inspection type, filtered by vehicle config.
 */
export function getSectionsForInspection(
  inspectionType: InspectionType,
  fuelType: FuelType | null,
  transmissionType: TransmissionType | null,
): SectionDef[] {
  return SECTION_DEFS
    .filter((s) => s.applicableTo.includes(inspectionType))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.fuelTypeFilter && fuelType && !item.fuelTypeFilter.includes(fuelType)) {
          return false;
        }
        if (item.transmissionFilter && transmissionType && !item.transmissionFilter.includes(transmissionType)) {
          return false;
        }
        return true;
      }),
    }));
}
