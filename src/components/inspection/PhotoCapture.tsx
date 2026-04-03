import { useRef, useState } from 'react';
import { Camera, X, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { checkPhotoQuality, compressPhoto, createThumbnail } from '../../lib/photo';
import { savePhoto as savePhotoToDb } from '../../lib/db';
import type { InspectionPhoto } from '../../types/inspection';

interface PhotoCaptureProps {
  inspectionId: string;
  itemId: string | null;
  photos: InspectionPhoto[];
  onPhotoAdded: (photo: InspectionPhoto) => void;
  onPhotoRemoved: (photoId: string) => void;
  prompt?: string;
}

export function PhotoCapture({
  inspectionId,
  itemId,
  photos,
  onPhotoAdded,
  onPhotoRemoved,
  prompt,
}: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProcessing(true);

    try {
      // Quality check
      const quality = await checkPhotoQuality(file);
      if (!quality.ok) {
        setError(quality.message);
        setProcessing(false);
        return;
      }

      // Compress
      const compressed = await compressPhoto(file);
      const thumbnail = await createThumbnail(compressed);

      const photo: InspectionPhoto = {
        id: uuidv4(),
        inspectionId,
        itemId,
        markerId: null,
        storagePath: null,
        thumbnailDataUrl: thumbnail,
        caption: '',
        brightnessScore: quality.brightness,
        resolutionOk: true,
        createdAt: new Date().toISOString(),
        syncStatus: 'pending',
      };

      // Save blob to IndexedDB
      await savePhotoToDb({ ...photo, blob: compressed });

      onPhotoAdded(photo);
    } catch (err) {
      setError('Failed to process photo. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
      // Reset input
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {prompt && (
        <p className="text-xs font-body text-muted">{prompt}</p>
      )}

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo) => (
            <div key={photo.id} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-border/30">
              {photo.thumbnailDataUrl && (
                <img
                  src={photo.thumbnailDataUrl}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => onPhotoRemoved(photo.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-primary/70 rounded-full flex items-center justify-center"
                aria-label="Remove photo"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Capture button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-dashed border-border text-muted font-body text-sm hover:bg-border/20 active:scale-95 transition-all disabled:opacity-50"
      >
        <Camera size={18} />
        {processing ? 'Processing...' : 'Take photo'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-fail/10 border border-fail/20">
          <AlertCircle size={16} className="text-fail flex-shrink-0 mt-0.5" />
          <p className="text-sm font-body text-fail">{error}</p>
        </div>
      )}
    </div>
  );
}
