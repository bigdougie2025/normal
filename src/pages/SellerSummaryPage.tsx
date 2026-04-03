import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { useInspectionStore } from '../stores/inspectionStore';

export function SellerSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentInspection, loadInspection } = useInspectionStore();
  const [pinInput, setPinInput] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (id && !currentInspection) loadInspection(id);
  }, [id, currentInspection, loadInspection]);

  const inspection = currentInspection;
  if (!inspection) return null;

  const faultItems = inspection.sections
    .flatMap((s) => s.items)
    .filter((i) => i.grade === 'advisory' || i.grade === 'fail');

  const handleExitPresentation = () => {
    if (pinInput === inspection.sellerPin) {
      navigate(`/inspection/${id}/summary`);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  return (
    <div className="min-h-screen bg-surface select-none" style={{ touchAction: 'manipulation' }}>
      {/* PIN prompt overlay */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-50 bg-primary/90 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-headline text-lg font-black uppercase text-primary text-center mb-4">
              ENTER PIN
            </h3>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              className="w-full text-center text-3xl tracking-[0.5em] font-body font-bold py-4 border-2 border-border rounded-xl focus:outline-none focus:border-primary"
              autoFocus
            />
            {pinError && (
              <p className="text-sm font-body text-fail text-center mt-2">Incorrect PIN</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowPinPrompt(false); setPinInput(''); setPinError(false); }}
                className="flex-1 min-h-[48px] rounded-xl border border-border font-body font-semibold text-sm text-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleExitPresentation}
                className="flex-1 min-h-[48px] rounded-xl bg-primary text-white font-body font-semibold text-sm"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-2xl mx-auto pb-20">
        {/* Vehicle hero */}
        <div className="text-center pt-6">
          <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tight text-primary leading-none">
            {inspection.vehicle.make} {inspection.vehicle.model}
          </h1>
          <p className="font-body text-lg text-muted mt-2">
            {inspection.vehicle.year} · {inspection.vehicle.vrm} · {inspection.mileage?.toLocaleString()} miles
          </p>
        </div>

        {/* Overall status */}
        <div className="text-center py-4">
          <StatusPill grade={inspection.overallGrade} />
        </div>

        {/* Faults found */}
        {faultItems.length > 0 && (
          <Card>
            <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary mb-3">
              CONDITION REPORT
            </h3>
            <div className="space-y-3">
              {faultItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusPill grade={item.grade} size="sm" />
                      <span className="text-sm font-body font-semibold text-primary">{item.label}</span>
                    </div>
                    {item.notes && <p className="text-xs font-body text-muted mt-1">{item.notes}</p>}
                  </div>
                  {inspection.aiRepairSummary && (
                    <div className="text-right flex-shrink-0">
                      {(() => {
                        const est = inspection.aiRepairSummary?.estimates.find((e) => e.itemKey === item.itemKey);
                        if (!est) return null;
                        return (
                          <span className="text-sm font-body font-semibold text-primary">
                            {'\u00A3'}{est.estimatedCostLow} {'\u2013'} {'\u00A3'}{est.estimatedCostHigh}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Price summary */}
        {inspection.type === 'private_purchase' && inspection.aiRepairSummary && (
          <div className="bg-primary rounded-2xl p-6 text-center">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-body">
                <span className="text-white/60">Agreed price</span>
                <span className="text-white font-semibold">{'\u00A3'}{inspection.agreedPurchasePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-white/60">Estimated repair costs</span>
                <span className="text-white font-semibold">
                  {'\u00A3'}{inspection.aiRepairSummary.totalCostLow} {'\u2013'} {'\u00A3'}{inspection.aiRepairSummary.totalCostHigh}
                </span>
              </div>
            </div>
            <div className="border-t border-white/20 pt-6">
              <p className="text-sm font-body text-accent font-semibold mb-2">REVISED OFFER PRICE</p>
              <p className="font-headline text-6xl md:text-7xl font-black text-accent leading-none">
                {'\u00A3'}{inspection.aiRepairSummary.revisedOfferPrice.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* No faults message */}
        {faultItems.length === 0 && (
          <Card padding="lg" className="text-center">
            <div className="text-5xl mb-3">✓</div>
            <h3 className="font-headline text-xl font-black uppercase text-pass">ALL CHECKS PASSED</h3>
            <p className="text-sm font-body text-muted mt-2">
              No issues were found during this inspection.
            </p>
          </Card>
        )}
      </div>

      {/* Hidden exit button */}
      <button
        onClick={() => setShowPinPrompt(true)}
        className="fixed bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-10 hover:opacity-30 transition-opacity"
        aria-label="Exit presentation mode"
      >
        <Lock size={14} className="text-muted" />
      </button>
    </div>
  );
}
