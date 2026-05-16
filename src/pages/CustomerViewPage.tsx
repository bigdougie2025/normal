import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import type { Inspection } from '../types/inspection';
import { supabase } from '../lib/supabase';
import { getAllInspections } from '../lib/db';

export function CustomerViewPage() {
  const { token } = useParams<{ token: string }>();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInspection() {
      try {
        // Try Supabase first
        const { data } = await supabase
          .from('inspections')
          .select('*')
          .eq('public_token', token)
          .single();

        if (data) {
          setInspection(data as unknown as Inspection);
          setLoading(false);
          return;
        }
      } catch {
        // Supabase not available, try local
      }

      // Fallback: search local IndexedDB
      try {
        const allInspections = await getAllInspections();
        const found = allInspections.find((i) => i.publicToken === token);
        if (found) {
          setInspection(found);
        } else {
          setError('Inspection not found. The link may be invalid or expired.');
        }
      } catch {
        setError('Could not load inspection.');
      }
      setLoading(false);
    }

    fetchInspection();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="h-4 skeleton rounded w-40 mx-auto mb-2" />
          <p className="font-body text-white/30">Loading inspection...</p>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-headline text-2xl font-black uppercase text-white">NOT FOUND</h1>
          <p className="font-body text-white/40 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const faultItems = inspection.sections
    .flatMap((s) => s.items)
    .filter((i) => i.grade === 'advisory' || i.grade === 'fail');

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-primary border-b border-white/[0.06] text-white px-4 py-4">
        <p className="font-headline text-xs font-black uppercase tracking-widest text-accent">AUTO INSPECT PRO</p>
        <h1 className="font-headline text-2xl font-black uppercase tracking-tight mt-1">
          {inspection.vehicle.make} {inspection.vehicle.model}
        </h1>
        <p className="font-body text-sm text-white/40 mt-1">
          {inspection.vehicle.vrm} · {inspection.vehicle.year} · {inspection.mileage?.toLocaleString()} miles
        </p>
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Overall grade */}
        <Card padding="lg" className="text-center">
          <StatusPill grade={inspection.overallGrade} />
          <div className="flex items-center justify-center gap-6 mt-4">
            <div>
              <span className="text-2xl font-headline font-black text-pass">{inspection.passCounts}</span>
              <p className="text-xs font-body text-white/30">Pass</p>
            </div>
            <div>
              <span className="text-2xl font-headline font-black text-advisory">{inspection.advisoryCounts}</span>
              <p className="text-xs font-body text-white/30">Advisory</p>
            </div>
            <div>
              <span className="text-2xl font-headline font-black text-fail">{inspection.failCounts}</span>
              <p className="text-xs font-body text-white/30">Fail</p>
            </div>
          </div>
        </Card>

        {/* Section results */}
        {inspection.sections.map((section) => (
          <Card key={section.id}>
            <h3 className="font-headline text-xs font-black uppercase tracking-widest text-white/30 mb-2">
              {section.sectionKey.replace(/_/g, ' ')}
            </h3>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1">
                  <span className="text-sm font-body text-white">{item.label}</span>
                  <StatusPill grade={item.grade} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Faults detail */}
        {faultItems.length > 0 && (
          <Card>
            <h3 className="font-headline text-xs font-black uppercase tracking-widest text-white/30 mb-3">
              ISSUES FOUND
            </h3>
            {faultItems.map((item) => (
              <div key={item.id} className="py-2 border-b border-white/[0.06] last:border-b-0">
                <div className="flex items-center gap-2">
                  <StatusPill grade={item.grade} size="sm" />
                  <span className="text-sm font-body font-semibold text-white">{item.label}</span>
                </div>
                {item.notes && <p className="text-xs font-body text-white/40 mt-1 ml-[70px]">{item.notes}</p>}
              </div>
            ))}
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs font-body text-white/30">
            Inspected by {inspection.inspectorName} · Auto Inspect Pro
          </p>
          <p className="text-xs font-body text-white/30">
            Really Easy Car Credit
          </p>
        </div>
      </div>
    </div>
  );
}
