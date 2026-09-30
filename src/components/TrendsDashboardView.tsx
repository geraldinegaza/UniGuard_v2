import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  Waves,
  ShieldAlert,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { IncidentReport, Barangay } from '../types';

export interface TrendsDashboardViewProps {
  reports: IncidentReport[];
  barangays: Barangay[];
  onOpenDrillDown?: (type: string, val: string) => void;
}

export const TrendsDashboardView: React.FC<TrendsDashboardViewProps> = ({
  reports,
  barangays,
  onOpenDrillDown,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  // Trend data points over 7 days
  const sevenDayTrends = [
    { day: 'Day 1 (Mon)', reports: 4, surge: 0.4, resolved: 3 },
    { day: 'Day 2 (Tue)', reports: 7, surge: 0.8, resolved: 5 },
    { day: 'Day 3 (Wed)', reports: 12, surge: 1.3, resolved: 8 },
    { day: 'Day 4 (Thu)', reports: 19, surge: 1.85, resolved: 14 },
    { day: 'Day 5 (Fri)', reports: 15, surge: 1.6, resolved: 13 },
    { day: 'Day 6 (Sat)', reports: 9, surge: 1.1, resolved: 8 },
    { day: 'Today (Sun)', reports: 6, surge: 0.7, resolved: 6 },
  ];

  const maxSevenDay = 20;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control */}
      <div className="bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-100 text-[#991B1B]">
              Longitudinal Intelligence
            </span>
            <span className="text-xs font-bold text-slate-400">&bull; LDRRMC Lingayen</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">
            Hazard Velocity & Storm Surge Progression Trends
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-analyzing multi-day ground inflows with PAGASA coastal swell observations
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="bg-slate-100 p-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
          {(['24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedTimeframe === tf
                  ? 'bg-[#991B1B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Trend 1: 7-Day Surge & Inflow Curve */}
        <div className="bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                7-Day Inflow vs Coastal Surge Height (Meters MSL)
              </h4>
              <span className="text-[10px] font-bold text-[#991B1B] bg-rose-50 px-2 py-0.5 rounded-full">
                Peak: +1.85m
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Correlation between storm surge and citizen report submissions
            </p>

            {/* Custom chart */}
            <div className="mt-6 h-48 flex items-end justify-between gap-3 border-b border-slate-100 pb-2 px-1">
              {sevenDayTrends.map((d, i) => {
                const heightPct = Math.round((d.reports / maxSevenDay) * 100);
                const isPeak = d.reports === 19;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <span
                      className={`text-[10px] font-bold tabular-nums mb-1 ${
                        isPeak ? 'text-[#991B1B] font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      {d.reports}
                    </span>

                    <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end h-full">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isPeak ? 'bg-[#991B1B]' : 'bg-rose-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      >
                        {isPeak && <div className="w-full h-1 bg-[#00BCD4]" />}
                      </div>
                    </div>

                    <span className="text-[9px] font-semibold text-slate-500 mt-2 truncate w-full text-center">
                      {d.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
              <span>Report Volume</span>
            </div>
            <span className="font-bold text-slate-700">Tropical Depression Peak on Thursday</span>
          </div>
        </div>

        {/* Trend 2: Corroboration Velocity & Verification Lead Time */}
        <div className="bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Crowd Corroboration Turnaround Speed
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Avg: 8.2 mins
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Minutes elapsed between citizen submission and 3rd verification witness
            </p>

            {/* Time metric bars */}
            <div className="mt-5 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Flooding / Waterlogging</span>
                  <span className="font-bold text-[#991B1B] tabular-nums">6.4 mins</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#991B1B] rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Storm Surge Alerts</span>
                  <span className="font-bold text-red-600 tabular-nums">7.1 mins</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Road Obstructions / Debris</span>
                  <span className="font-bold text-amber-600 tabular-nums">9.8 mins</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Power Outages & Grid Faults</span>
                  <span className="font-bold text-slate-600 tabular-nums">11.3 mins</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Fastest: Poblacion & Libsong</span>
            <span className="font-bold text-[#00BCD4]">Verified by 1,420 Residents</span>
          </div>
        </div>
      </div>
    </div>
  );
};
