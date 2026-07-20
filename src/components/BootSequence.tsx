'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   Boot Sequence Configuration
   Each line has the text to type and a preDelay (ms to wait before the line
   starts typing). The CHAR_DELAY controls per-character typing speed.
   ═══════════════════════════════════════════════════════════════════════════ */

interface BootLine {
  text: string;
  preDelay: number;
}

const BOOT_LINES: BootLine[] = [
  { text: '', preDelay: 400 },
  { text: 'ORION SYSTEMS TERMINAL v0.1', preDelay: 200 },
  { text: 'BUILD 2187.04 — CORELLIAN ENGINEERING', preDelay: 60 },
  { text: '', preDelay: 350 },
  { text: 'INITIALIZING...', preDelay: 300 },
  { text: '', preDelay: 500 },
  { text: '> ORBITAL DATA LINK .............. OK', preDelay: 120 },
  { text: '> SENSOR ARRAY ................... OK', preDelay: 120 },
  { text: '', preDelay: 400 },
  { text: 'ALL SYSTEMS ACTIVE', preDelay: 300 },
  { text: 'ENTERING MAIN TERMINAL...', preDelay: 200 },
];

const CHAR_DELAY = 28; // ms per character
const POST_COMPLETE_DELAY = 700; // ms after last line before signaling done

/* ═══════════════════════════════════════════════════════════════════════════
   Pre-computed Timeline
   We flatten all lines + chars into an array of timed state snapshots.
   This lets us set up all timeouts at mount time and cancel them cleanly.
   ═══════════════════════════════════════════════════════════════════════════ */

interface DisplayState {
  completedLines: string[];
  currentLine: string;
}

interface FrameState extends DisplayState {
  time: number;
}

function buildTimeline(): { frames: FrameState[]; totalTime: number } {
  const frames: FrameState[] = [];
  let time = 0;
  const completedSoFar: string[] = [];

  for (const line of BOOT_LINES) {
    time += line.preDelay;

    if (line.text === '') {
      // Empty line — just push it as a completed line (blank spacer)
      completedSoFar.push('');
      frames.push({
        time,
        completedLines: [...completedSoFar],
        currentLine: '',
      });
    } else {
      // Type each character one at a time
      for (let i = 0; i <= line.text.length; i++) {
        frames.push({
          time,
          completedLines: [...completedSoFar],
          currentLine: line.text.slice(0, i),
        });
        if (i < line.text.length) {
          time += CHAR_DELAY;
        }
      }
      completedSoFar.push(line.text);
    }
  }

  return { frames, totalTime: time };
}

const { frames: TIMELINE_FRAMES, totalTime: TIMELINE_TOTAL } = buildTimeline();

// Final state — used by the skip handler
const FINAL_STATE: DisplayState = {
  completedLines: BOOT_LINES.map((l) => l.text),
  currentLine: '',
};

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [displayState, setDisplayState] = useState<DisplayState>({
    completedLines: [],
    currentLine: '',
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isCompleteRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Signal completion: fade out → call onComplete
  const triggerComplete = useCallback(() => {
    if (isCompleteRef.current) return;
    isCompleteRef.current = true;
    setIsComplete(true);

    // Clear any remaining timeouts
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];

    // Show final state, then fade
    setDisplayState(FINAL_STATE);

    // Small delay so user sees "ALL SYSTEMS ACTIVE" before fade
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);

      const completeTimer = setTimeout(() => {
        onComplete();
      }, 450); // matches CSS fade-out duration
      timeoutIdsRef.current.push(completeTimer);
    }, POST_COMPLETE_DELAY);
    timeoutIdsRef.current.push(fadeTimer);
  }, [onComplete]);

  // Skip handler — fast-forward everything
  const skip = useCallback(() => {
    if (isCompleteRef.current) return;
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
    triggerComplete();
  }, [triggerComplete]);

  // Set up the timeline on mount
  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];

    for (const frame of TIMELINE_FRAMES) {
      ids.push(
        setTimeout(() => {
          setDisplayState({
            completedLines: frame.completedLines,
            currentLine: frame.currentLine,
          });
        }, frame.time),
      );
    }

    // After all frames, trigger complete
    ids.push(
      setTimeout(() => {
        triggerComplete();
      }, TIMELINE_TOTAL + POST_COMPLETE_DELAY),
    );

    timeoutIdsRef.current = ids;

    return () => {
      ids.forEach(clearTimeout);
    };
  }, [triggerComplete]);

  // Skip on click or keypress
  useEffect(() => {
    const handleKey = () => skip();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skip]);

  // Auto-scroll to bottom as text types
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayState]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col justify-end p-6 sm:p-10 overflow-hidden cursor-pointer ${
        isFadingOut ? 'boot-fade-out' : ''
      }`}
      onClick={skip}
      style={{ background: 'var(--crt-bg)' }}
      role="presentation"
      aria-label="System boot sequence — click or press any key to skip"
    >
      {/* Typed-out lines */}
      <div className="font-mono text-sm sm:text-base leading-relaxed select-none max-w-3xl">
        {displayState.completedLines.map((line, i) => (
          <div key={i} className="min-h-[1.5em]">
            {line === '' ? (
              '\u00A0' /* non-breaking space for blank lines */
            ) : (
              <span
                className={
                  line === 'ORION SYSTEMS TERMINAL v0.1' ||
                  line === 'ALL SYSTEMS ACTIVE'
                    ? 'crt-glow font-bold'
                    : line.startsWith('>')
                      ? 'crt-text-dim'
                      : ''
                }
              >
                {line}
              </span>
            )}
          </div>
        ))}

        {/* Currently typing line + cursor */}
        {displayState.currentLine !== '' && (
          <div className="min-h-[1.5em]">
            <span>{displayState.currentLine}</span>
            <span className="crt-cursor" />
          </div>
        )}

        {/* Cursor on empty new line when between lines */}
        {displayState.currentLine === '' && !isComplete && (
          <div className="min-h-[1.5em]">
            <span className="crt-cursor" />
          </div>
        )}
      </div>

      {/* Skip hint */}
      {!isFadingOut && (
        <div className="absolute bottom-4 right-6 text-xs crt-text-dim select-none opacity-60">
          PRESS ANY KEY TO SKIP
        </div>
      )}
    </div>
  );
}
