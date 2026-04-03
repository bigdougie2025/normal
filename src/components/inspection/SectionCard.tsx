import { ChevronRight } from 'lucide-react';
import * as icons from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';
import type { InspectionSection } from '../../types/inspection';
import { SECTION_DEFS } from '../../lib/sectionConfig';

interface SectionCardProps {
  section: InspectionSection;
  onClick: () => void;
}

export function SectionCard({ section, onClick }: SectionCardProps) {
  const def = SECTION_DEFS.find((d) => d.key === section.sectionKey);
  const gradedCount = section.items.filter((i) => i.grade !== null).length;
  const totalCount = section.items.length;
  const overallGrade = section.items.some((i) => i.grade === 'fail')
    ? 'fail' as const
    : section.items.some((i) => i.grade === 'advisory')
      ? 'advisory' as const
      : gradedCount === totalCount && totalCount > 0
        ? 'pass' as const
        : null;

  // Dynamic icon lookup
  const IconComponent = def?.icon ? (icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[def.icon] : null;

  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      {IconComponent && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
          <IconComponent size={20} className="text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-headline text-sm font-black uppercase tracking-tight text-primary truncate">
          {def?.label || section.sectionKey}
        </h3>
        <p className="text-xs font-body text-muted mt-0.5">
          {gradedCount} of {totalCount} items
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {section.status === 'completed' && <StatusPill grade={overallGrade} size="sm" />}
        <ChevronRight size={18} className="text-muted" />
      </div>
    </Card>
  );
}
