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

  const IconComponent = def?.icon ? (icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[def.icon] : null;
  const progress = totalCount > 0 ? (gradedCount / totalCount) * 100 : 0;

  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      {IconComponent && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
          <IconComponent size={18} className="text-white/50" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-headline text-xs font-black uppercase tracking-tight text-white/90 truncate">
          {def?.label || section.sectionKey}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent/60 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-body text-muted flex-shrink-0">
            {gradedCount}/{totalCount}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {section.status === 'completed' && <StatusPill grade={overallGrade} size="sm" />}
        <ChevronRight size={16} className="text-white/20" />
      </div>
    </Card>
  );
}
