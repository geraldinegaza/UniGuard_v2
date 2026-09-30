import React, { useState, useEffect } from 'react';
import { AlertTriangle, BellRing, ChevronRight, X, Volume2 } from 'lucide-react';
import { Advisory } from '../types';

interface EmergencyAlertBannerProps {
  advisories: Advisory[];
  onViewAdvisories: () => void;
  isAudioAlertEnabled: boolean;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  advisories,
  onViewAdvisories,
  isAudioAlertEnabled,
}) => {
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  // Find most critical active emergency advisory
  const criticalAdvisory = advisories.find(
    (a) => a.type === 'emergency_alert' && (a.severity === 'critical' || a.severity === 'high') && a.id !== dismissedId
  );

  // Play emergency chime when a critical alert first appears
  useEffect(() => {
    if (criticalAdvisory && isAudioAlertEnabled && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch {
        // Audio policy ignore
      }
    }
  }, [criticalAdvisory?.id, isAudioAlertEnabled]);

  if (!criticalAdvisory) return null;

  const isCritical = criticalAdvisory.severity === 'critical';

  return (
    <div
      className="border-b transition-all duration-300 bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#7f1d1d] text-white border-red-900 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="p-1.5 rounded-lg flex-shrink-0 animate-bounce bg-black/25 text-white">
              <AlertTriangle className="w-5 h-5 text-white" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/30">
                  {criticalAdvisory.severity.toUpperCase()} ALERT
                </span>
                <span className="text-xs font-semibold text-white/90">
                  {criticalAdvisory.target_barangay_id
                    ? `Scope: Brgy. ${criticalAdvisory.target_barangay_id.toUpperCase()}`
                    : 'Scope: MUNICIPALITY-WIDE LINGAYEN'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold truncate text-white mt-0.5">
                {criticalAdvisory.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onViewAdvisories}
              className="text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-md shadow-xs flex items-center gap-1 transition cursor-pointer"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDismissedId(criticalAdvisory.id)}
              className="p-1.5 rounded-md hover:bg-black/20 text-white/80 hover:text-white transition cursor-pointer"
              title="Dismiss alert banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
