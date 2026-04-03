import { useState } from 'react';
import type { DiagramView, BodyDamageMarker, DamageType, DamageSeverity } from '../../types/inspection';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { v4 as uuidv4 } from 'uuid';

interface BodyDiagramProps {
  inspectionId: string;
  markers: BodyDamageMarker[];
  onAddMarker: (marker: BodyDamageMarker) => void;
  onRemoveMarker: (markerId: string) => void;
}

const VIEWS: { key: DiagramView; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'rear', label: 'Rear' },
  { key: 'driver', label: 'Driver Side' },
  { key: 'passenger', label: 'Passenger Side' },
];

const DAMAGE_TYPES: { key: DamageType; label: string }[] = [
  { key: 'dent', label: 'Dent' },
  { key: 'scratch', label: 'Scratch' },
  { key: 'chip', label: 'Chip' },
  { key: 'crack', label: 'Crack' },
  { key: 'rust', label: 'Rust' },
  { key: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS: { key: DamageSeverity; label: string; color: string }[] = [
  { key: 'minor', label: 'Minor', color: 'bg-advisory' },
  { key: 'moderate', label: 'Moderate', color: 'bg-advisory' },
  { key: 'severe', label: 'Severe', color: 'bg-fail' },
];

const severityColor: Record<DamageSeverity, string> = {
  minor: '#F5A623',
  moderate: '#E88B23',
  severe: '#E03434',
};

function VehicleOutline({ view }: { view: DiagramView }) {
  // Simplified SVG outlines for each view
  if (view === 'front' || view === 'rear') {
    return (
      <g>
        {/* Body */}
        <rect x="15" y="30" width="70" height="45" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Roof line */}
        <path d="M25 30 L25 15 Q50 5 75 15 L75 30" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Wheels */}
        <rect x="10" y="65" width="18" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="72" y="65" width="18" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Bumper */}
        <rect x="12" y="75" width="76" height="8" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Headlights/Taillights */}
        <rect x="15" y="32" width="12" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="73" y="32" width="12" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
        {/* View label */}
        <text x="50" y="95" textAnchor="middle" className="text-xs fill-current" fontFamily="Inter">
          {view === 'front' ? 'Front' : 'Rear'}
        </text>
      </g>
    );
  }

  // Side view
  return (
    <g>
      {/* Body */}
      <path d="M10 50 L10 35 Q10 30 15 30 L30 30 L40 15 Q42 12 45 12 L65 12 Q68 12 70 15 L78 30 L85 30 Q90 30 90 35 L90 50 Q90 55 85 55 L15 55 Q10 55 10 50Z"
        fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Windows */}
      <path d="M42 15 L33 28 L67 28 L72 15" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="52" y1="15" x2="52" y2="28" stroke="currentColor" strokeWidth="1" />
      {/* Wheels */}
      <circle cx="25" cy="55" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="25" cy="55" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="75" cy="55" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="75" cy="55" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
      {/* Door handle */}
      <rect x="44" y="33" width="8" height="2" rx="1" fill="currentColor" opacity="0.5" />
      {/* View label */}
      <text x="50" y="80" textAnchor="middle" className="text-xs fill-current" fontFamily="Inter">
        {view === 'driver' ? 'Driver Side' : 'Passenger Side'}
      </text>
    </g>
  );
}

export function BodyDiagram({ inspectionId, markers, onAddMarker, onRemoveMarker }: BodyDiagramProps) {
  const [activeView, setActiveView] = useState<DiagramView>('front');
  const [pendingMarker, setPendingMarker] = useState<{ x: number; y: number } | null>(null);
  const [markerType, setMarkerType] = useState<DamageType>('dent');
  const [markerSeverity, setMarkerSeverity] = useState<DamageSeverity>('minor');
  const [markerNotes, setMarkerNotes] = useState('');

  const viewMarkers = markers.filter((m) => m.view === activeView);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingMarker({ x, y });
    setMarkerType('dent');
    setMarkerSeverity('minor');
    setMarkerNotes('');
  };

  const handleAddMarker = () => {
    if (!pendingMarker) return;
    onAddMarker({
      id: uuidv4(),
      inspectionId,
      view: activeView,
      xPercent: pendingMarker.x,
      yPercent: pendingMarker.y,
      damageType: markerType,
      severity: markerSeverity,
      notes: markerNotes,
      photoId: null,
      createdAt: new Date().toISOString(),
    });
    setPendingMarker(null);
  };

  return (
    <div className="space-y-4">
      {/* View tabs */}
      <div className="flex gap-1 bg-surface rounded-xl p-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-body font-semibold transition-all
              ${activeView === v.key ? 'bg-primary text-white' : 'text-muted hover:text-primary'}`}
          >
            {v.label}
            {markers.filter((m) => m.view === v.key).length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-fail text-white text-[10px]">
                {markers.filter((m) => m.view === v.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SVG Diagram */}
      <div className="relative bg-white rounded-2xl border border-border p-4">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto text-primary cursor-crosshair"
          onClick={handleSvgClick}
        >
          <VehicleOutline view={activeView} />
          {/* Existing markers */}
          {viewMarkers.map((marker, idx) => (
            <g key={marker.id} onClick={(e) => e.stopPropagation()}>
              <circle
                cx={marker.xPercent}
                cy={marker.yPercent}
                r="3"
                fill={severityColor[marker.severity]}
                stroke="white"
                strokeWidth="1"
                className="cursor-pointer"
                onClick={() => onRemoveMarker(marker.id)}
              />
              <text
                x={marker.xPercent}
                y={marker.yPercent + 1}
                textAnchor="middle"
                fontSize="3"
                fill="white"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {idx + 1}
              </text>
            </g>
          ))}
          {/* Pending marker */}
          {pendingMarker && (
            <circle
              cx={pendingMarker.x}
              cy={pendingMarker.y}
              r="3"
              fill="none"
              stroke="#E8FF00"
              strokeWidth="1.5"
              strokeDasharray="2 1"
            />
          )}
        </svg>
        <p className="text-xs text-center text-muted mt-2 font-body">
          Tap on the diagram to mark damage
        </p>
      </div>

      {/* Marker list */}
      {viewMarkers.length > 0 && (
        <div className="space-y-2">
          {viewMarkers.map((marker, idx) => (
            <div key={marker.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: severityColor[marker.severity] }}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-body font-medium text-primary capitalize">
                  {marker.damageType} ({marker.severity})
                </span>
                {marker.notes && (
                  <p className="text-xs font-body text-muted truncate">{marker.notes}</p>
                )}
              </div>
              <button
                onClick={() => onRemoveMarker(marker.id)}
                className="text-xs font-body text-fail hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add marker sheet */}
      <BottomSheet
        open={!!pendingMarker}
        onClose={() => setPendingMarker(null)}
        title="ADD DAMAGE MARKER"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-body font-medium text-primary mb-2">Damage type</label>
            <div className="grid grid-cols-3 gap-2">
              {DAMAGE_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setMarkerType(t.key)}
                  className={`py-2 px-3 rounded-lg text-sm font-body font-medium border transition-all
                    ${markerType === t.key ? 'border-primary bg-primary text-white' : 'border-border text-muted hover:text-primary'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-primary mb-2">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {SEVERITY_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setMarkerSeverity(s.key)}
                  className={`py-2 px-3 rounded-lg text-sm font-body font-medium border transition-all
                    ${markerSeverity === s.key ? 'border-primary bg-primary text-white' : 'border-border text-muted hover:text-primary'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Notes"
            placeholder="Describe the damage..."
            value={markerNotes}
            onChange={(e) => setMarkerNotes(e.target.value)}
          />

          <Button variant="accent" fullWidth onClick={handleAddMarker}>
            Add Marker
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
