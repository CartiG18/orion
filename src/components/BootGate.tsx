'use client';

import { useBootStore } from '@/stores/useBootStore';
import BootSequence from '@/components/BootSequence';
import DashboardShell from '@/components/DashboardShell';

/**
 * BootGate — orchestrator component.
 * Shows the boot sequence on first visit; once complete, shows the dashboard.
 * Uses Zustand (in-memory) so the boot replays on full page reload but
 * is skipped on in-app navigation within the same session.
 */
export default function BootGate() {
  const hasBooted = useBootStore((s) => s.hasBooted);
  const markBooted = useBootStore((s) => s.markBooted);

  if (!hasBooted) {
    return <BootSequence onComplete={markBooted} />;
  }

  return (
    <div className="dashboard-fade-in flex flex-col h-screen">
      <DashboardShell />
    </div>
  );
}
