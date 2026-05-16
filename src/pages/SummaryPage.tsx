import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle, XCircle, FileDown, Eye } from 'lucide-react';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { Input } from '../components/ui/Input';
import { useInspectionStore } from '../stores/inspectionStore';
import { fetchRepairEstimate } from '../lib/ai';
import { generatePdf } from '../lib/pdf';
import type { AiRepairSummary } from '../types/inspection';

export function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentInspection, loadInspection, setRepairSummary, setFinalAgreedPrice, submitInspection } = useInspectionStore();
  const [repairLoading, setRepairLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id && !currentInspection) loadInspection(id);
  }, [id, currentInspection, loadInspection]);

  const inspection = currentInspection;
  if (!inspection) {
    return (
      <div className="min-h-screen bg-primary">
        <TopBar title="LOADING..." showBack />
      </div>
    );
  }

  const faultItems = inspection.sections
    .flatMap((s) => s.items)
    .filter((i) => i.grade === 'advisory' || i.grade === 'fail');

  const handleGetRepairEstimate = async () => {
    if (!inspection.agreedPurchasePrice) return;
    setRepairLoading(true);
    try {
      const estimate: AiRepairSummary = await fetchRepairEstimate(
        inspection.vehicle,
        inspection.mileage || 0,
        inspection.agreedPurchasePrice,
        faultItems,
      );
      await setRepairSummary(estimate);
    } catch (err) {
      console.error(err);
    } finally {
      setRepairLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const doc = generatePdf(inspection);
      doc.save(`inspection-${inspection.vehicle.vrm}-${inspection.id.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmit = async () => {
    await submitInspection();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-primary">
      <TopBar title="INSPECTION SUMMARY" showBack onBack={() => navigate(`/inspection/${id}`)} />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Vehicle */}
        <div className="text-center">
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight text-white">
            {inspection.vehicle.make} {inspection.vehicle.model}
          </h2>
          <p className="font-body text-white/40 text-sm">
            {inspection.vehicle.vrm} · {inspection.vehicle.year} · {inspection.mileage?.toLocaleString()} miles
          </p>
        </div>

        {/* Overall grade */}
        <Card padding="lg" className="text-center">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-headline font-black text-pass">{inspection.passCounts}</div>
              <div className="text-xs font-body text-white/30 flex items-center gap-1 justify-center">
                <CheckCircle size={12} className="text-pass" /> Pass
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-headline font-black text-advisory">{inspection.advisoryCounts}</div>
              <div className="text-xs font-body text-white/30 flex items-center gap-1 justify-center">
                <AlertTriangle size={12} className="text-advisory" /> Advisory
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-headline font-black text-fail">{inspection.failCounts}</div>
              <div className="text-xs font-body text-white/30 flex items-center gap-1 justify-center">
                <XCircle size={12} className="text-fail" /> Fail
              </div>
            </div>
          </div>
          <div className="mt-4">
            <StatusPill grade={inspection.overallGrade} />
          </div>
          {inspection.overallGrade === 'fail' && (
            <p className="text-xs font-body text-fail mt-2">
              This inspection has failures that require review before a decision is made.
            </p>
          )}
        </Card>

        {/* Section breakdown */}
        <Card>
          <h3 className="font-headline text-sm font-black uppercase tracking-widest text-white/30 mb-3">
            SECTION BREAKDOWN
          </h3>
          <div className="space-y-2">
            {inspection.sections.map((section) => {
              const sectionFails = section.items.filter((i) => i.grade === 'fail').length;
              const sectionAdvisories = section.items.filter((i) => i.grade === 'advisory').length;
              return (
                <div
                  key={section.id}
                  className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-b-0 cursor-pointer hover:bg-white/[0.04] -mx-4 px-4"
                  onClick={() => navigate(`/inspection/${id}/section/${section.sectionKey}`)}
                >
                  <span className="text-sm font-body text-white">{section.sectionKey.replace(/_/g, ' ')}</span>
                  <div className="flex gap-2">
                    {sectionFails > 0 && (
                      <span className="text-xs font-body font-semibold text-fail">{sectionFails} fail</span>
                    )}
                    {sectionAdvisories > 0 && (
                      <span className="text-xs font-body font-semibold text-advisory">{sectionAdvisories} advisory</span>
                    )}
                    {sectionFails === 0 && sectionAdvisories === 0 && (
                      <span className="text-xs font-body font-semibold text-pass">All pass</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Fault details */}
        {faultItems.length > 0 && (
          <Card>
            <h3 className="font-headline text-sm font-black uppercase tracking-widest text-white/30 mb-3">
              FAULTS FOUND
            </h3>
            <div className="space-y-3">
              {faultItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <StatusPill grade={item.grade} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-body font-semibold text-white">{item.label}</p>
                    {item.notes && <p className="text-xs font-body text-white/40 mt-0.5">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Repair cost estimator (Private Purchase only) */}
        {inspection.type === 'private_purchase' && faultItems.length > 0 && (
          <>
            {!inspection.aiRepairSummary && (
              <Button
                variant="primary"
                fullWidth
                onClick={handleGetRepairEstimate}
                disabled={repairLoading || !inspection.agreedPurchasePrice}
              >
                {repairLoading ? 'Estimating repair costs...' : 'Get AI Repair Cost Estimate'}
              </Button>
            )}

            {inspection.aiRepairSummary && (
              <Card className="!bg-primary text-white">
                <h3 className="font-headline text-sm font-black uppercase tracking-tight text-accent mb-4">
                  REPAIR COST ESTIMATE
                </h3>
                <div className="space-y-2 mb-4">
                  {inspection.aiRepairSummary.estimates.map((est, i) => (
                    <div key={i} className="flex justify-between items-center py-1">
                      <span className="text-sm font-body text-white/80">{est.itemLabel}</span>
                      <span className="text-sm font-body font-semibold text-white">
                        {'£'}{est.estimatedCostLow} {'–'} {'£'}{est.estimatedCostHigh}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/20 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-body text-white/60">Agreed price</span>
                    <span className="text-sm font-body text-white">{'£'}{inspection.agreedPurchasePrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-body text-white/60">Total repair costs</span>
                    <span className="text-sm font-body text-white">
                      {'£'}{inspection.aiRepairSummary.totalCostLow} {'–'} {'£'}{inspection.aiRepairSummary.totalCostHigh}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/20">
                    <span className="text-sm font-body text-accent font-semibold">Revised offer price</span>
                    <span className="font-headline text-4xl font-black text-accent">
                      {'£'}{inspection.aiRepairSummary.revisedOfferPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Actions */}
        {!submitted ? (
          <div className="space-y-3">
            {inspection.type === 'private_purchase' && (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate(`/inspection/${id}/seller`)}
              >
                <Eye size={18} className="mr-2" />
                Show Seller Summary
              </Button>
            )}

            {/* Final agreed price */}
            {inspection.type === 'private_purchase' && (
              <Input
                label="Final agreed price (GBP)"
                type="number"
                inputMode="numeric"
                placeholder="Enter final agreed price"
                value={inspection.finalAgreedPrice?.toString() || ''}
                onChange={(e) => setFinalAgreedPrice(e.target.value ? parseFloat(e.target.value) : 0)}
                helperText="The price actually agreed after negotiation"
              />
            )}

            <Button variant="accent" fullWidth onClick={handleSubmit}>
              Submit Inspection
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 bg-pass/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-pass" />
              </div>
              <h3 className="font-headline text-xl font-black uppercase text-white">INSPECTION SUBMITTED</h3>
              <p className="text-sm font-body text-white/40 mt-2">
                PDF report has been generated. Share the link below with the customer.
              </p>
            </Card>

            <Button variant="primary" fullWidth onClick={handleDownloadPdf} disabled={pdfLoading}>
              <FileDown size={18} className="mr-2" />
              {pdfLoading ? 'Generating PDF...' : 'Download PDF Report'}
            </Button>

            <Button variant="ghost" fullWidth onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
