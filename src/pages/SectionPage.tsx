import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../components/ui/TopBar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ItemRow } from '../components/inspection/ItemRow';
import { useInspectionStore } from '../stores/inspectionStore';
import { SECTION_DEFS } from '../lib/sectionConfig';

export function SectionPage() {
  const { id, sectionKey } = useParams<{ id: string; sectionKey: string }>();
  const navigate = useNavigate();
  const { currentInspection, loadInspection, gradeItem, updateItemNotes, updateTyreDepths, addPhotoToItem, removePhotoFromItem } = useInspectionStore();

  useEffect(() => {
    if (id && !currentInspection) loadInspection(id);
  }, [id, currentInspection, loadInspection]);

  const section = currentInspection?.sections.find((s) => s.sectionKey === sectionKey);
  const sectionDef = SECTION_DEFS.find((d) => d.key === sectionKey);

  const sectionIndex = currentInspection?.sections.findIndex((s) => s.sectionKey === sectionKey) ?? -1;
  const totalSections = currentInspection?.sections.length ?? 0;

  const itemDefs = useMemo(() => {
    if (!sectionDef) return {};
    const map: Record<string, typeof sectionDef.items[0]> = {};
    for (const item of sectionDef.items) {
      map[item.key] = item;
    }
    return map;
  }, [sectionDef]);

  if (!currentInspection || !section || !sectionDef) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar title="LOADING..." showBack />
      </div>
    );
  }

  const gradedCount = section.items.filter((i) => i.grade !== null).length;

  const handleNext = () => {
    if (sectionIndex < totalSections - 1) {
      const nextSection = currentInspection.sections[sectionIndex + 1];
      navigate(`/inspection/${id}/section/${nextSection.sectionKey}`, { replace: true });
    } else {
      navigate(`/inspection/${id}`);
    }
  };

  const handlePrev = () => {
    if (sectionIndex > 0) {
      const prevSection = currentInspection.sections[sectionIndex - 1];
      navigate(`/inspection/${id}/section/${prevSection.sectionKey}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <TopBar
        title={sectionDef.label}
        showBack
        onBack={() => navigate(`/inspection/${id}`)}
      />

      {/* Section progress */}
      <div className="bg-primary px-4 pb-3">
        <ProgressBar current={sectionIndex + 1} total={totalSections} className="[&_*]:!text-white/60 [&_span:last-child]:!text-white" />
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Item list */}
        <div className="bg-white rounded-2xl border border-border px-4">
          {section.items.map((item) => {
            const def = itemDefs[item.itemKey];
            return (
              <ItemRow
                key={item.id}
                item={item}
                inspectionId={currentInspection.id}
                sectionKey={sectionKey!}
                description={def?.description || ''}
                hint={def?.hint || ''}
                photoPrompt={def?.photoPrompt || ''}
                requiredPhotos={def?.requiredPhotos || false}
                hasTyreDepths={def?.hasTyreDepths}
                onGrade={(grade) => gradeItem(sectionKey!, item.itemKey, grade)}
                onNotesChange={(notes) => updateItemNotes(sectionKey!, item.itemKey, notes)}
                onTyreDepthsChange={(depths) => updateTyreDepths(sectionKey!, item.itemKey, depths)}
                onPhotoAdded={(photo) => addPhotoToItem(sectionKey!, item.itemKey, photo)}
                onPhotoRemoved={(photoId) => removePhotoFromItem(sectionKey!, item.itemKey, photoId)}
              />
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {sectionIndex > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 min-h-[48px] rounded-xl border border-border font-body font-semibold text-sm text-muted hover:text-primary transition-colors"
            >
              Previous Section
            </button>
          )}
          <button
            onClick={handleNext}
            className={`flex-1 min-h-[48px] rounded-xl font-body font-semibold text-sm transition-all
              ${gradedCount === section.items.length
                ? 'bg-accent text-primary active:scale-95'
                : 'bg-primary text-white active:scale-95'
              }`}
          >
            {sectionIndex < totalSections - 1 ? 'Next Section' : 'Back to Overview'}
          </button>
        </div>
      </div>
    </div>
  );
}
