import { useState, useCallback } from 'react';
import { Mic } from 'lucide-react';
import { isVoiceSupported, startVoiceRecognition, stopVoiceRecognition } from '../../lib/voice';

interface VoiceNoteButtonProps {
  onTranscript: (text: string) => void;
  onInterim?: (text: string) => void;
}

export function VoiceNoteButton({ onTranscript, onInterim }: VoiceNoteButtonProps) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = isVoiceSupported();

  const toggle = useCallback(() => {
    if (recording) {
      stopVoiceRecognition();
      setRecording(false);
      return;
    }

    setError(null);
    setRecording(true);

    startVoiceRecognition(
      (transcript, isFinal) => {
        if (isFinal) {
          onTranscript(transcript);
        } else {
          onInterim?.(transcript);
        }
      },
      (err) => {
        setError(err);
        setRecording(false);
      },
      () => {
        setRecording(false);
      },
    );
  }, [recording, onTranscript, onInterim]);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-all
          ${recording
            ? 'bg-fail text-white animate-pulse'
            : 'bg-border/50 text-muted hover:bg-border active:scale-95'
          }
        `}
        aria-label={recording ? 'Stop recording' : 'Start voice note'}
      >
        <Mic size={18} />
      </button>
      {recording && (
        <span className="text-xs font-body text-fail font-medium">Recording...</span>
      )}
      {error && (
        <span className="text-xs font-body text-fail">{error}</span>
      )}
    </div>
  );
}
