import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, Filter, Shield } from 'lucide-react';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { useInspectionStore } from '../stores/inspectionStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import type { InspectionType, Grade, InspectionStatus } from '../types/inspection';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { inspections, loadInspections, loading } = useInspectionStore();

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const [filterType, setFilterType] = useState<InspectionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<InspectionStatus | 'all'>('all');
  const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  const filteredInspections = inspections.filter((i) => {
    if (filterType !== 'all' && i.type !== filterType) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterGrade !== 'all' && i.overallGrade !== filterGrade) return false;
    return true;
  });

  const inProgress = filteredInspections.filter((i) => i.status === 'in_progress' || i.status === 'draft');
  const completed = filteredInspections.filter((i) => i.status === 'submitted' || i.status === 'completed');

  return (
    <div className="min-h-screen bg-primary">
      <TopBar
        title="AUTO INSPECT PRO"
        rightAction={
          <div className="flex items-center gap-3">
            {isManager && (
              <span className="text-[10px] font-body text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-accent/20">
                <Shield size={9} /> Manager
              </span>
            )}
            <button
              onClick={() => {
                useAuthStore.getState().signOut();
                navigate('/login');
              }}
              className="text-xs font-body text-white/30 hover:text-white/60 transition-colors"
            >
              Sign out
            </button>
          </div>
        }
      />

      <div className={`p-4 space-y-8 mx-auto ${isManager ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {/* Welcome */}
        <div className="flex items-start justify-between pt-2">
          <div>
            <h2 className="font-headline text-3xl font-black uppercase tracking-tight text-white">
              {user?.fullName || 'Inspector'}
            </h2>
            <p className="font-body text-sm text-white/30 mt-1">
              {format(new Date(), 'EEEE, d MMMM yyyy')}
            </p>
          </div>
          {isManager && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-medium transition-all duration-[200ms]
                ${showFilters ? 'bg-accent text-primary' : 'bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80'}`}
            >
              <Filter size={14} />
              Filters
            </button>
          )}
        </div>

        {/* Bento-box stats */}
        <div className={`grid gap-3 ${isManager ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <Card variant="glass" className="text-center py-5">
            <div className="text-3xl font-headline font-black text-white">{filteredInspections.length}</div>
            <div className="text-[11px] font-body text-white/30 mt-1 uppercase tracking-wide">Total</div>
          </Card>
          <Card variant="glass" className="text-center py-5">
            <div className="text-3xl font-headline font-black text-advisory">{inProgress.length}</div>
            <div className="text-[11px] font-body text-white/30 mt-1 uppercase tracking-wide">In Progress</div>
          </Card>
          <Card variant="glass" className="text-center py-5">
            <div className="text-3xl font-headline font-black text-pass">{completed.length}</div>
            <div className="text-[11px] font-body text-white/30 mt-1 uppercase tracking-wide">Completed</div>
          </Card>
          {isManager && (
            <Card variant="glass" className="text-center py-5">
              <div className="text-3xl font-headline font-black text-fail">
                {filteredInspections.filter((i) => i.overallGrade === 'fail').length}
              </div>
              <div className="text-[11px] font-body text-white/30 mt-1 uppercase tracking-wide">Failed</div>
            </Card>
          )}
        </div>

        {/* Manager filter bar */}
        {isManager && showFilters && (
          <Card variant="elevated">
            <h3 className="font-headline text-xs font-black uppercase tracking-tight text-white/50 mb-3">FILTERS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-body font-medium text-white/30 mb-1.5 uppercase tracking-wide">Inspection type</label>
                <div className="flex gap-1">
                  {(['all', 'private_purchase', 'pdi'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-body font-medium transition-all duration-[150ms]
                        ${filterType === t ? 'bg-accent text-primary' : 'bg-white/[0.04] text-white/40 hover:text-white/70'}`}
                    >
                      {t === 'all' ? 'All' : t === 'private_purchase' ? 'Private' : 'PDI'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-body font-medium text-white/30 mb-1.5 uppercase tracking-wide">Status</label>
                <div className="flex gap-1">
                  {(['all', 'in_progress', 'submitted'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-body font-medium transition-all duration-[150ms]
                        ${filterStatus === s ? 'bg-accent text-primary' : 'bg-white/[0.04] text-white/40 hover:text-white/70'}`}
                    >
                      {s === 'all' ? 'All' : s === 'in_progress' ? 'Active' : 'Done'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-body font-medium text-white/30 mb-1.5 uppercase tracking-wide">Overall grade</label>
                <div className="flex gap-1">
                  {(['all', 'pass', 'advisory', 'fail'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFilterGrade(g)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-body font-medium capitalize transition-all duration-[150ms]
                        ${filterGrade === g ? 'bg-accent text-primary' : 'bg-white/[0.04] text-white/40 hover:text-white/70'}`}
                    >
                      {g === 'all' ? 'All' : g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* New inspection */}
        <Button variant="accent" fullWidth onClick={() => navigate('/inspection/new')}>
          <Plus size={20} className="mr-2" />
          Start New Inspection
        </Button>

        {/* Manager view */}
        {isManager ? (
          <div>
            <h3 className="font-headline text-xs font-black uppercase tracking-widest text-white/30 mb-4">
              ALL INSPECTIONS
            </h3>
            <div className="space-y-2">
              {filteredInspections.map((inspection) => (
                <Card key={inspection.id} onClick={() => navigate(`/inspection/${inspection.id}`)} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-white text-sm truncate">
                      {inspection.vehicle.vrm} {inspection.vehicle.make} {inspection.vehicle.model}
                    </p>
                    <p className="text-xs font-body text-white/30 mt-0.5">
                      {inspection.inspectorName} · {inspection.type === 'private_purchase' ? 'Private' : 'PDI'} · {format(new Date(inspection.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <StatusPill grade={inspection.overallGrade} size="sm" />
                </Card>
              ))}
              {filteredInspections.length === 0 && !loading && (
                <p className="text-center py-8 font-body text-white/20 text-sm">No inspections match the current filters</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {inProgress.length > 0 && (
              <div>
                <h3 className="font-headline text-xs font-black uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                  <Clock size={14} className="text-advisory" />
                  IN PROGRESS
                </h3>
                <div className="space-y-2">
                  {inProgress.map((inspection) => (
                    <Card key={inspection.id} onClick={() => navigate(`/inspection/${inspection.id}`)} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-advisory/10 flex items-center justify-center flex-shrink-0 border border-advisory/20">
                        <FileText size={16} className="text-advisory" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-white text-sm truncate">
                          {inspection.vehicle.vrm} {inspection.vehicle.make} {inspection.vehicle.model}
                        </p>
                        <p className="text-xs font-body text-white/30">
                          {inspection.type === 'private_purchase' ? 'Private Purchase' : 'PDI'} · {format(new Date(inspection.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h3 className="font-headline text-xs font-black uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
                  <CheckCircle size={14} className="text-pass" />
                  RECENTLY COMPLETED
                </h3>
                <div className="space-y-2">
                  {completed.map((inspection) => (
                    <Card key={inspection.id} onClick={() => navigate(`/inspection/${inspection.id}`)} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pass/10 flex items-center justify-center flex-shrink-0 border border-pass/20">
                        <FileText size={16} className="text-pass" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-white text-sm truncate">
                          {inspection.vehicle.vrm} {inspection.vehicle.make} {inspection.vehicle.model}
                        </p>
                        <p className="text-xs font-body text-white/30">
                          {inspection.type === 'private_purchase' ? 'Private Purchase' : 'PDI'} · {format(new Date(inspection.completedAt || inspection.updatedAt), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <StatusPill grade={inspection.overallGrade} size="sm" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && inspections.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
              <FileText size={24} className="text-white/20" />
            </div>
            <p className="font-body text-white/30 text-sm">No inspections yet</p>
            <p className="font-body text-white/15 text-xs mt-1">Start your first inspection to get going</p>
          </div>
        )}
      </div>
    </div>
  );
}
