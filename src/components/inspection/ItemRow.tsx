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
    <div className="py-4 border-b border-border last:border-b-0">
      {/* Item header */}
      <div className="mb-2">
        <div className="flex items-start gap-2">
          <h4 className="font-body font-semibold text-primary text-base flex-1">
            {item.label}
          </h4>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-surface flex items-center justify-center"
            aria-label="Show hint"
          >
            <Info size={14} className="text-muted" />
          </button>
        </div>
        <p className="text-sm font-body text-muted mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Hint panel */}
      {showHint && (
        <div className="mb-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
          <p className="text-sm font-body text-primary leading-relaxed">{hint}</p>
        </div>
      )}

      {/* Grading buttons */}
      <div className="mb-3">
        <GradingButtons grade={item.grade} onChange={onGrade} />
      </div>

      {/* Tyre depth fields */}
      {hasTyreDepths && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Input
            label="NSF (mm)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="15"
            value={item.tyreDepths?.nsf ?? ''}
            onChange={(e) =>
              onTyreDepthsChange?.({
                ...item.tyreDepths || { nsf: null, osf: null, nsr: null, osr: null },
                nsf: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="0.0"
          />
          <Input
            label="OSF (mm)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="15"
            value={item.tyreDepths?.osf ?? ''}
            onChange={(e) =>
              onTyreDepthsChange?.({
                ...item.tyreDepths || { nsf: null, osf: null, nsr: null, osr: null },
                osf: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="0.0"
          />
          <Input
            label="NSR (mm)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="15"
            value={item.tyreDepths?.nsr ?? ''}
            onChange={(e) =>
              onTyreDepthsChange?.({
                ...item.tyreDepths || { nsf: null, osf: null, nsr: null, osr: null },
                nsr: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="0.0"
          />
          <Input
            label="OSR (mm)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="15"
            value={item.tyreDepths?.osr ?? ''}
            onChange={(e) =>
              onTyreDepthsChange?.({
                ...item.tyreDepths || { nsf: null, osf: null, nsr: null, osr: null },
                osr: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="0.0"
          />
        </div>
      )}

      {/* Expanded detail area for Advisory/Fail */}
      {showDetails && (
        <div className="space-y-3 animate-slide-down">
          {/* Notes with voice */}
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

          {/* Photos */}
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

      {/* Show photo capture even for Pass if photos required */}
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

      {/* Photo requirement indicator */}
      {requiredPhotos && item.photos.length === 0 && item.grade !== null && (
        <p className="text-xs font-body text-advisory mt-2 flex items-center gap-1">
          <ChevronDown size={12} />
          Photo required for this item
        </p>
      )}
    </div>
  );
}
