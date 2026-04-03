import { useEffect } from 'react';
import { AppRouter } from './routes';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { useUiStore } from './stores/uiStore';
import { useAuthStore } from './stores/authStore';
import { startSync } from './lib/sync';

function App() {
  const initOnlineListener = useUiStore((s) => s.initOnlineListener);
  const initialize = useAuthStore((s) => s.initialize);
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  useEffect(() => {
    initialize();
    const cleanup = initOnlineListener();
    startSync();
    return cleanup;
  }, [initialize, initOnlineListener]);

  return (
    <div className="min-h-screen bg-surface font-body text-primary">
      <OfflineBanner />
      <AppRouter />

      {/* Toast notifications */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md mx-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg font-body text-sm text-white
              ${toast.type === 'success' ? 'bg-pass' : toast.type === 'error' ? 'bg-fail' : 'bg-primary'}`}
            onClick={() => removeToast(toast.id)}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
