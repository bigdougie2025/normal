import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TopBar } from '../components/ui/TopBar';
import { BodyDiagram } from '../components/inspection/BodyDiagram';
import { useInspectionStore } from '../stores/inspectionStore';

export function BodyDiagramPage() {
  const { id } = useParams<{ id: string }>();
  const { currentInspection, loadInspection, addDamageMarker, removeDamageMarker } = useInspectionStore();

  useEffect(() => {
    if (id && !currentInspection) loadInspection(id);
  }, [id, currentInspection, loadInspection]);

  if (!currentInspection) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar title="LOADING..." showBack />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar title="BODY DAMAGE DIAGRAM" showBack />
      <div className="p-4 max-w-2xl mx-auto">
        <BodyDiagram
          inspectionId={currentInspection.id}
          markers={currentInspection.bodyDamageMarkers}
          onAddMarker={addDamageMarker}
          onRemoveMarker={removeDamageMarker}
        />
      </div>
    </div>
  );
}
