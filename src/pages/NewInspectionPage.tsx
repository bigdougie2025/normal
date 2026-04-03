import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Info } from 'lucide-react';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useInspectionStore } from '../stores/inspectionStore';
import { useAuthStore } from '../stores/authStore';
import { lookupVrm } from '../lib/vrm';
import { lookupMotHistory, checkMileageAnomaly } from '../lib/mot';
import { fetchKnownIssues } from '../lib/ai';
import type { VehicleDetails, InspectionType, FuelType, TransmissionType, MotHistory, AiKnownIssue } from '../types/inspection';

type Step = 'vrm' | 'details' | 'config';

export function NewInspectionPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const createInspection = useInspectionStore((s) => s.createInspection);
  const setKnownIssues = useInspectionStore((s) => s.setKnownIssues);

  const [step, setStep] = useState<Step>('vrm');
  const [vrm, setVrm] = useState('');
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [motHistory, setMotHistory] = useState<MotHistory | null>(null);
  const [knownIssues, setKnownIssuesState] = useState<AiKnownIssue[] | null>(null);
  const [mileage, setMileage] = useState('');
  const [mileageAnomaly, setMileageAnomaly] = useState<string | null>(null);
  const [inspectionType, setInspectionType] = useState<InspectionType>('private_purchase');
  const [fuelType, setFuelType] = useState<FuelType | null>(null);
  const [transmissionType, setTransmissionType] = useState<TransmissionType | null>(null);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVrmLookup = async () => {
    if (!vrm.trim()) return;
    setError('');
    setLookupLoading(true);

    try {
      const [vehicleData, motData] = await Promise.all([
        lookupVrm(vrm),
        lookupMotHistory(vrm),
      ]);
      setVehicle(vehicleData);
      setMotHistory(motData);
      if (vehicleData.fuelType) setFuelType(vehicleData.fuelType);
      if (vehicleData.transmissionType) setTransmissionType(vehicleData.transmissionType);
      setStep('details');

      // Fetch AI known issues in background
      setAiLoading(true);
      try {
        const issues = await fetchKnownIssues(vehicleData);
        setKnownIssuesState(issues);
      } catch {
        // Non-critical, ignore
      } finally {
        setAiLoading(false);
      }
    } catch (err) {
      setError('Could not look up this registration. Please check and try again.');
      console.error(err);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleMileageChange = (value: string) => {
    setMileage(value);
    setMileageAnomaly(null);
    if (value && motHistory) {
      const check = checkMileageAnomaly(parseInt(value, 10), motHistory);
      if (check.isAnomaly) setMileageAnomaly(check.message);
    }
  };

  const handleStartInspection = async () => {
    if (!vehicle || !user) return;

    const updatedVehicle = {
      ...vehicle,
      fuelType,
      transmissionType,
    };

    const inspection = await createInspection({
      inspectorId: user.id,
      inspectorName: user.fullName,
      type: inspectionType,
      vehicle: updatedVehicle,
      mileage: mileage ? parseInt(mileage, 10) : null,
      motHistory,
      agreedPurchasePrice: agreedPrice ? parseFloat(agreedPrice) : null,
    });

    if (knownIssues) {
      await setKnownIssues(knownIssues);
    }

    navigate(`/inspection/${inspection.id}`);
  };

  return (
    <div className="min-h-screen bg-surface">
      <TopBar title="NEW INSPECTION" showBack />

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Step 1: VRM Entry */}
        {step === 'vrm' && (
          <div className="space-y-4">
            <h2 className="font-headline text-xl font-black uppercase tracking-tight text-primary">
              ENTER REGISTRATION
            </h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="AB12 CDE"
                  value={vrm}
                  onChange={(e) => setVrm(e.target.value.toUpperCase())}
                  className="!text-xl !font-semibold !tracking-widest !uppercase text-center"
                  maxLength={8}
                  autoFocus
                />
              </div>
              <Button
                variant="accent"
                onClick={handleVrmLookup}
                disabled={lookupLoading || vrm.length < 2}
              >
                <Search size={20} />
              </Button>
            </div>
            {error && <p className="text-sm font-body text-fail">{error}</p>}
          </div>
        )}

        {/* Step 2: Vehicle Details Confirmation */}
        {step === 'details' && vehicle && (
          <div className="space-y-4">
            {/* Vehicle info card */}
            <Card padding="lg">
              <div className="text-center mb-4">
                <p className="font-headline text-3xl font-black uppercase tracking-tight text-primary">
                  {vehicle.vrm}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm font-body">
                <div>
                  <span className="text-muted">Make</span>
                  <p className="font-semibold text-primary">{vehicle.make || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted">Model</span>
                  <Input
                    value={vehicle.model}
                    onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                    placeholder="Enter model"
                    className="mt-1"
                  />
                </div>
                <div>
                  <span className="text-muted">Year</span>
                  <p className="font-semibold text-primary">{vehicle.year || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted">Colour</span>
                  <p className="font-semibold text-primary">{vehicle.colour || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted">Engine</span>
                  <p className="font-semibold text-primary">{vehicle.engineSize || 'Unknown'}</p>
                </div>
              </div>
            </Card>

            {/* MOT History card */}
            {motHistory && motHistory.tests.length > 0 && (
              <Card>
                <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary mb-3">
                  MOT HISTORY
                </h3>
                {motHistory.currentExpiryDate && (
                  <p className="text-sm font-body mb-2">
                    <span className="text-muted">Expires: </span>
                    <span className="font-semibold text-primary">{motHistory.currentExpiryDate}</span>
                  </p>
                )}
                {motHistory.tests[0]?.advisories.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-body text-advisory font-semibold mb-1">Recent advisories:</p>
                    <ul className="space-y-1">
                      {motHistory.tests[0].advisories.map((adv, i) => (
                        <li key={i} className="text-xs font-body text-muted flex items-start gap-1.5">
                          <span className="text-advisory mt-0.5">•</span> {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-body text-muted font-semibold">Mileage progression:</p>
                  {motHistory.tests.slice(0, 5).map((test, i) => (
                    <p key={i} className="text-xs font-body text-muted">
                      {test.testDate}: {test.odometerValue.toLocaleString()} {test.odometerUnit}
                    </p>
                  ))}
                </div>
              </Card>
            )}

            {/* Known Issues card */}
            {aiLoading && (
              <Card>
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-accent/20 rounded w-1/2" />
                  <div className="h-3 bg-accent/10 rounded w-3/4" />
                  <div className="h-3 bg-accent/10 rounded w-2/3" />
                </div>
              </Card>
            )}
            {knownIssues && (
              <Card>
                <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary mb-3 flex items-center gap-2">
                  <Info size={16} className="text-accent" />
                  KNOWN ISSUES FOR THIS MODEL
                </h3>
                <ul className="space-y-2">
                  {knownIssues.map((issue, i) => (
                    <li key={i} className="text-sm font-body">
                      <span className="font-semibold text-primary">{issue.issue}</span>
                      <p className="text-xs text-muted mt-0.5">{issue.detail}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Button variant="accent" fullWidth onClick={() => setStep('config')}>
              Confirm Vehicle Details
            </Button>
          </div>
        )}

        {/* Step 3: Inspection Configuration */}
        {step === 'config' && (
          <div className="space-y-4">
            <h2 className="font-headline text-xl font-black uppercase tracking-tight text-primary">
              INSPECTION SETUP
            </h2>

            {/* Inspection type */}
            <div>
              <label className="block text-sm font-body font-medium text-primary mb-2">Inspection type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setInspectionType('private_purchase')}
                  className={`min-h-[56px] rounded-xl border-2 font-body font-semibold text-sm p-3 text-left transition-all
                    ${inspectionType === 'private_purchase' ? 'border-primary bg-primary text-white' : 'border-border text-muted'}`}
                >
                  Private Purchase Appraisal
                </button>
                <button
                  onClick={() => setInspectionType('pdi')}
                  className={`min-h-[56px] rounded-xl border-2 font-body font-semibold text-sm p-3 text-left transition-all
                    ${inspectionType === 'pdi' ? 'border-primary bg-primary text-white' : 'border-border text-muted'}`}
                >
                  Pre Delivery Inspection
                </button>
              </div>
            </div>

            {/* Fuel type */}
            <div>
              <label className="block text-sm font-body font-medium text-primary mb-2">Fuel type</label>
              <div className="grid grid-cols-4 gap-2">
                {(['petrol', 'diesel', 'hybrid', 'electric'] as FuelType[]).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFuelType(ft)}
                    className={`min-h-[44px] rounded-xl border-2 font-body font-medium text-sm capitalize transition-all
                      ${fuelType === ft ? 'border-primary bg-primary text-white' : 'border-border text-muted'}`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-sm font-body font-medium text-primary mb-2">Transmission</label>
              <div className="grid grid-cols-2 gap-2">
                {(['manual', 'automatic'] as TransmissionType[]).map((tt) => (
                  <button
                    key={tt}
                    onClick={() => setTransmissionType(tt)}
                    className={`min-h-[44px] rounded-xl border-2 font-body font-medium text-sm capitalize transition-all
                      ${transmissionType === tt ? 'border-primary bg-primary text-white' : 'border-border text-muted'}`}
                  >
                    {tt}
                  </button>
                ))}
              </div>
            </div>

            {/* Mileage */}
            <Input
              label="Mileage (odometer reading)"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 45000"
              value={mileage}
              onChange={(e) => handleMileageChange(e.target.value)}
            />
            {mileageAnomaly && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-fail/10 border border-fail/20">
                <AlertTriangle size={18} className="text-fail flex-shrink-0 mt-0.5" />
                <p className="text-sm font-body text-fail">{mileageAnomaly}</p>
              </div>
            )}

            {/* Agreed price (Private Purchase only) */}
            {inspectionType === 'private_purchase' && (
              <Input
                label="Agreed purchase price (GBP)"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 8500"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                helperText="The price agreed with the seller before this inspection"
              />
            )}

            <Button
              variant="accent"
              fullWidth
              onClick={handleStartInspection}
              disabled={!fuelType || !transmissionType}
            >
              Start Inspection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
