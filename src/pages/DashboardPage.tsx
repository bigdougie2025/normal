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

  // Manager filters
  const [filterType, setFilterType] = useState<InspectionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<InspectionStatus | 'all'>('all');
  const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // Apply filters for manager view
  const filteredInspections = inspections.filter((i) => {
    if (filterType !== 'all' && i.type !== filterType) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterGrade !== 'all' && i.overallGrade !== filterGrade) return false;
    return true;
  });

  const inProgress = filteredInspections.filter((i) => i.status === 'in_progress' || i.status === 'draft');
  const completed = filteredInspections.filter((i) => i.status === 'submitted' || i.status === 'completed');

  return (
    <div className="min-h-screen bg-surface">
      <TopBar
        title="AUTO INSPECT PRO"
        rightAction={
          <div className="flex items-center gap-3">
            {isManager && (
              <span className="text-xs font-body text-accent bg-accent/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield size={10} /> Manager
              </span>
            )}
            <button
              onClick={() => {
                useAuthStore.getState().signOut();
                navigate('/login');
              }}
              className="text-xs font-body text-white/60 hover:text-white"
            >
              Sign out
            </button>
          </div>
        }
      />

      <div className={`p-4 space-y-6 mx-auto ${isManager ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">
              {user?.fullName || 'Inspector'}
            </h2>
            <p className="font-body text-sm text-muted">
              {format(new Date(), 'EEEE, d MMMM yyyy')}
            </p>
          </div>
          {isManager && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-medium transition-all
                ${showFilters ? 'bg-primary text-white' : 'bg-white border border-border text-muted hover:text-primary'}`}
            >
              <Filter size={14} />
              Filters
            </button>
          )}
        </div>

        {/* Stats */}
        <div className={`grid gap-3 ${isManager ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <Card className="text-center">
            <div className="text-2xl font-headline font-black text-primary">{filteredInspections.length}</div>
            <div className="text-xs font-body text-muted mt-1">Total</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-headline font-black text-advisory">{inProgress.length}</div>
            <div className="text-xs font-body text-muted mt-1">In Progress</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-headline font-black text-pass">{completed.length}</div>
            <div className="text-xs font-body text-muted mt-1">Completed</div>
          </Card>
          {isManager && (
            <Card className="text-center">
              <div className="text-2xl font-headline font-black text-fail">
                {filteredInspections.filter((i) => i.overallGrade === 'fail').length}
              </div>
              <div className="text-xs font-body text-muted mt-1">Failed</div>
            </Card>
          )}
        </div>

        {/* Manager filter bar */}
        {isManager && showFilters && (
          <Card>
            <h3 className="font-headline text-xs font-black uppercase tracking-tight text-primary mb-3">FILTERS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-body font-medium text-muted mb-1.5">Inspection type</label>
                <div className="flex gap-1.5">
                  {(['all', 'private_purchase', 'pdi'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-body font-medium transition-all
                        ${filterType === t ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-primary'}`}
                    >
                      {t === 'all' ? 'All' : t === 'private_purchase' ? 'Private' : 'PDI'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-muted mb-1.5">Status</label>
                <div className="flex gap-1.5">
                  {(['all', 'in_progress', 'submitted'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-body font-medium transition-all
                        ${filterStatus === s ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-primary'}`}
                    >
                      {s === 'all' ? 'All' : s === 'in_progress' ? 'Active' : 'Done'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-muted mb-1.5">Overall grade</label>
                <div className="flex gap-1.5">
                  {(['all', 'pass', 'advisory', 'fail'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFilterGrade(g)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-body font-medium capitalize transition-all
                        ${filterGrade === g ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-primary'}`}
                    >
                      {g === 'all' ? 'All' : g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* New inspection button */}
        <Button variant="accent" fullWidth onClick={() => navigate('/inspection/new')}>
          <Plus size={20} className="mr-2" />
          Start New Inspection
        </Button>

        {/* Manager: table-style list */}
        {isManager ? (
          <div>
            <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary mb-3">
              ALL INSPECTIONS
            </h3>

            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_100px_120px_100px_80px] gap-2 px-4 py-2 text-xs font-body font-semibold text-muted uppercase">
              <span>Vehicle</span>
              <span>Inspector</span>
              <span>Type</span>
              <span>Date</span>
              <span>Grade</span>
              <span>Status</span>
            </div>

            <div className="space-y-2">
              {filteredInspections.map((inspection) => (
                <Card
                  key={inspection.id}
                  onClick={() => navigate(`/inspection/${inspection.id}`)}
                  className="md:!rounded-xl"
                >
                  {/* Mobile layout */}
                  <div className="md:hidden flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-primary text-sm truncate">
                        {inspection.vehicle.vrm} {inspection.vehicle.make} {inspection.vehicle.model}
                      </p>
                      <p className="text-xs font-body text-muted">
                        {inspection.inspectorName} · {inspection.type === 'private_purchase' ? 'Private' : 'PDI'} · {format(new Date(inspection.createdAt), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <StatusPill grade={inspection.overallGrade} size="sm" />
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[1fr_120px_100px_120px_100px_80px] gap-2 items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="text-muted flex-shrink-0" />
                      <span className="font-body font-semibold text-primary text-sm truncate">
                        {inspection.vehicle.vrm} {inspection.vehicle.make} {inspection.vehicle.model}
                      </span>
                    </div>
                    <span className="text-xs font-body text-muted truncate">{inspection.inspectorName}</span>
                    <span className="text-xs font-body text-muted">
                      {inspection.type === 'private_purchase' ? 'Private' : 'PDI'}
                    </span>
                    <span className="text-xs font-body text-muted">
                      {format(new Date(inspection.createdAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                    <StatusPill grade={inspection.overallGrade} size="sm" />
                    <span className={`text-xs font-body font-medium capitalize ${
                      inspection.status === 'submitted' ? 'text-pass' : 'text-advisory'
                    }`}>
                      {inspection.status === 'in_progress' ? 'Active' : inspection.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            {filteredInspections.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="font-body text-muted text-sm">No inspections match the current filters</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Inspector: In progress */}
            {inProgress.length > 0 && (
              <div>
                <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-advisory" />
                  IN PROGRESS
                </h3>
                <div className="space-y-2">
                  {inProgress.map((inspection) => (
                    <Card
                      key={inspection.id}
                      onClick={() => navigate(`/inspection/${inspection.id}`)}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-advisory/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-advisory" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-primary text-sm truncate">
                          {inspection.vehicle.vrm} {inspection.vehicle.make} {inspection.vehicle.model}
                        </p>
                        <p className="text-xs font-body text-muted">
                          {inspection.type === 'private_purchase' ? 'Private Purchase' : 'PDI'} · {format(new Date(inspection.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Inspector: Completed */}
            {completed.length > 0 && (
              <div>
                <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-pass" />
                  RECENTLY COMPLETED
                </h3>
                <div className="space-y-2">
                  {completed.map((inspection) => (
                    <Card
                      key={inspection.id}
                      onClick={() => navigate(`/inspection/${inspection.id}`)}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-pass/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-pass" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-primary text-sm truncate">
                          {inspection.vehicle.vrm} {inspection.vehicle.make} {inspection.vehicle.model}
                        </p>
                        <p className="text-xs font-body text-muted">
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-border/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-muted" />
            </div>
            <p className="font-body text-muted text-sm">No inspections yet</p>
            <p className="font-body text-muted text-xs mt-1">Start your first inspection to get going</p>
          </div>
        )}
      </div>
    </div>
  );
}
