import { WifiOff } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';

export function OfflineBanner() {
  const isOnline = useUiStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div className="bg-advisory/10 border-b border-advisory/20 px-4 py-2 flex items-center gap-2">
      <WifiOff size={14} className="text-advisory flex-shrink-0" />
      <span className="text-xs font-body font-medium text-advisory">
        You are offline. Your work is saved locally and will sync when you reconnect.
      </span>
    </div>
  );
}
