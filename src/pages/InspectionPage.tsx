import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { TopBar } from '../components/ui/TopBar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionCard } from '../components/inspection/SectionCard';
import { useInspectionStore } from '../stores/inspectionStore';

export function InspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentInspection, loadInspection, loading } = useInspectionStore();

  useEffect(() => {
    if (id) loadInspection(id);
  }, [id, loadInspection]);

  if (loading || !currentInspection) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar title="LOADING..." showBack />
        <div className="p-4 animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-border/30 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalItems = currentInspection.sections.reduce((sum, s) => sum + s.items.length, 0);
  const gradedItems = currentInspection.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.grade !== null).length,
    0,
  );
  const allGraded = gradedItems === totalItems && totalItems > 0;

  return (
    <div className="min-h-screen bg-surface">
      <TopBar
        title={`${currentInspection.vehicle.vrm}`}
        showBack
        onBack={() => navigate('/')}
      />

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Vehicle header */}
        <Card padding="lg">
          <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">
            {currentInspection.vehicle.make} {currentInspection.vehicle.model}
          </h2>
          <p className="text-sm font-body text-muted mt-1">
            {currentInspection.vehicle.year} · {currentInspection.vehicle.colour} · {currentInspection.mileage?.toLocaleString() || 'N/A'} miles
          </p>
          <p className="text-xs font-body text-muted mt-1">
            {currentInspection.type === 'private_purchase' ? 'Private Purchase Appraisal' : 'Pre Delivery Inspection'}
          </p>
        </Card>

        {/* Progress */}
        <ProgressBar current={gradedItems} total={totalItems} />

        {/* Sections */}
        <div className="space-y-2">
          {currentInspection.sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onClick={() => navigate(`/inspection/${currentInspection.id}/section/${section.sectionKey}`)}
            />
          ))}
        </div>

        {/* Body diagram link */}
        <Card
          onClick={() => navigate(`/inspection/${currentInspection.id}/body-diagram`)}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary">
              BODY DAMAGE DIAGRAM
            </h3>
            <p className="text-xs font-body text-muted">
              {currentInspection.bodyDamageMarkers.length} markers placed
            </p>
          </div>
        </Card>

        {/* Summary / Submit */}
        <Button
          variant={allGraded ? 'accent' : 'ghost'}
          fullWidth
          onClick={() => navigate(`/inspection/${currentInspection.id}/summary`)}
          disabled={!allGraded}
        >
          {allGraded ? 'View Summary and Submit' : `Complete all items to submit (${gradedItems}/${totalItems})`}
        </Button>
      </div>
    </div>
  );
}
