import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';
import { TopBar } from '../components/ui/TopBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { useInspectionStore } from '../stores/inspectionStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { inspections, loadInspections, loading } = useInspectionStore();

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  const inProgress = inspections.filter((i) => i.status === 'in_progress' || i.status === 'draft');
  const completed = inspections.filter((i) => i.status === 'submitted' || i.status === 'completed');

  return (
    <div className="min-h-screen bg-surface">
      <TopBar
        title="AUTO INSPECT PRO"
        rightAction={
          <button
            onClick={() => {
              useAuthStore.getState().signOut();
              navigate('/login');
            }}
            className="text-xs font-body text-white/60 hover:text-white"
          >
            Sign out
          </button>
        }
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Welcome */}
        <div>
          <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">
            {user?.fullName || 'Inspector'}
          </h2>
          <p className="font-body text-sm text-muted">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <div className="text-2xl font-headline font-black text-primary">{inspections.length}</div>
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
        </div>

        {/* New inspection button */}
        <Button variant="accent" fullWidth onClick={() => navigate('/inspection/new')}>
          <Plus size={20} className="mr-2" />
          Start New Inspection
        </Button>

        {/* In progress */}
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

        {/* Completed */}
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
