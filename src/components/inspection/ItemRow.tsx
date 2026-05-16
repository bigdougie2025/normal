import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { GradingButtons } from './GradingButtons';
import { PhotoCapture } from './PhotoCapture';
import { VoiceNoteButton } from './VoiceNoteButton';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import type { Grade, InspectionItem, InspectionPhoto, TyreDepths } from '../../types/inspection';

interface ItemRowProps {
  item: InspectionItem;
  inspectionId: string;
  sectionKey: string;
  description: string;
  hint: string;
  photoPrompt: string;
  requiredPhotos: boolean;
  hasTyreDepths?: boolean;
  onGrade: (grade: Grade) => void;
  onNotesChange: (notes: string) => void;
  onTyreDepthsChange?: (depths: TyreDepths) => void;
  onPhotoAdded: (photo: InspectionPhoto) => void;
  onPhotoRemoved: (photoId: string) => void;
}

export function ItemRow({
  item,
  inspectionId,
  sectionKey: _sectionKey,
  description,
  hint,
  photoPrompt,
  requiredPhotos,
  hasTyreDepths,
  onGrade,
  onNotesChange,
  onTyreDepthsChange,
  onPhotoAdded,
  onPhotoRemoved,
}: ItemRowProps) {
  const [showHint, setShowHint] = useState(false);
  const showDetails = item.grade === 'advisory' || item.grade === 'fail';

  return (
    <div className="py-5 border-b border-white/[0.06] last:border-b-0">
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <h4 className="font-body font-semibold text-white text-base flex-1">
            {item.label}
          </h4>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            aria-label="Show hint"
          >
            <Info size={13} className="text-muted" />
          </button>
        </div>
        <p className="text-sm font-body text-white/40 mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      {showHint && (
        <div className="mb-4 p-3 rounded-xl bg-accent/[0.06] border border-accent/[0.1]">
          <p className="text-sm font-body text-white/70 leading-relaxed">{hint}</p>
        </div>
      )}

      <div className="mb-3">
        <GradingButtons grade={item.grade} onChange={onGrade} />
      </div>

      {hasTyreDepths && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {(['nsf', 'osf', 'nsr', 'osr'] as const).map((pos) => (
            <Input
              key={pos}
              label={`${pos.toUpperCase()} (mm)`}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="15"
              value={item.tyreDepths?.[pos] ?? ''}
              onChange={(e) =>
                onTyreDepthsChange?.({
                  ...item.tyreDepths || { nsf: null, osf: null, nsr: null, osr: null },
                  [pos]: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              placeholder="0.0"
            />
          ))}
        </div>
      )}

      {showDetails && (
        <div className="space-y-3 mt-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <TextArea
                label="Notes"
                placeholder="Describe the issue..."
                value={item.notes}
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </div>
            <div className="pt-7">
              <VoiceNoteButton
                onTranscript={(text) => onNotesChange(item.notes + (item.notes ? ' ' : '') + text)}
              />
            </div>
          </div>

          <PhotoCapture
            inspectionId={inspectionId}
            itemId={item.id}
            photos={item.photos}
            onPhotoAdded={onPhotoAdded}
            onPhotoRemoved={onPhotoRemoved}
            prompt={photoPrompt}
          />
        </div>
      )}

      {item.grade === 'pass' && requiredPhotos && (
        <div className="mt-3">
          <PhotoCapture
            inspectionId={inspectionId}
            itemId={item.id}
            photos={item.photos}
            onPhotoAdded={onPhotoAdded}
            onPhotoRemoved={onPhotoRemoved}
            prompt={photoPrompt}
          />
        </div>
      )}

      {requiredPhotos && item.photos.length === 0 && item.grade !== null && (
        <p className="text-xs font-body text-advisory mt-2 flex items-center gap-1">
          <ChevronDown size={12} />
          Photo required for this item
        </p>
      )}
    </div>
  );
}
