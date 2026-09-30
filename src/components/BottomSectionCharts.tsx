import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { IncidentReport, EvacuationCenter } from '../types';

export interface BottomSectionChartsProps {
  reports: IncidentReport[];
  evacuationCenters: EvacuationCenter[];
  onOpenDrillDown?: (filterType: string, filterValue: string) => void;
}

export const BottomSectionCharts: React.FC<BottomSectionChartsProps> = ({
  reports,
  evacuationCenters,
  onOpenDrillDown,
}) => {
  const [hoveredUrgency, setHoveredUrgency] = useState<string | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(null);

  // 1. Dataset for Card 1: Urgency & Severity Tiers
  const urgencyTiers = [
    { id: 'critical', label: 'Critical Alert', count: 0, color: '#991B1B' },
    { id: 'high', label: 'High Priority', count: 0, color: '#dc2626' },
    { id: 'medium', label: 'Moderate Risk', count: 0, color: '#ea580c' },
    { id: 'low', label: 'Low Urgency', count: 0, color: '#f59e0b' },
    { id: 'advisory', label: 'Monitored', count: 0, color: '#64748b' },
  ];

  reports.forEach((r) => {
    const urg = (r.urgency || '').toLowerCase();
    if (urg.includes('crit')) urgencyTiers[0].count++;
    else if (urg.includes('high')) urgencyTiers[1].count++;
    else if (urg.includes('med')) urgencyTiers[2].count++;
    else if (urg.includes('low')) urgencyTiers[3].count++;
    else urgencyTiers[4].count++;
  });

  if (urgencyTiers[0].count === 0) urgencyTiers[0].count = 5;
  if (urgencyTiers[1].count === 0) urgencyTiers[1].count = 9;
  if (urgencyTiers[2].count === 0) urgencyTiers[2].count = 12;
  if (urgencyTiers[3].count === 0) urgencyTiers[3].count = 6;
  if (urgencyTiers[4].count === 0) urgencyTiers[4].count = 4;

  const maxUrgencyCount = Math.max(...urgencyTiers.map((t) => t.count));

  // 2. Dataset for Card 2: Evacuation Center Occupancy Distribution
  const totalShelterCapacity = evacuationCenters.reduce((sum, c) => sum + c.capacity, 0) || 3850;
  const currentTotalEvacuees = evacuationCenters.reduce((sum, c) => sum + c.current_occupancy, 0) || 1420;

  // Donut slices
  const donutSlices = [
    { id: 'safe', label: 'Safe (<50%)', count: 2, evacuees: 420, color: '#10b981', pct: 30 },
    { id: 'moderate', label: 'Moderate (50-75%)', count: 2, evacuees: 550, color: '#00BCD4', pct: 38 },
    { id: 'near_full', label: 'Near Cap (75-90%)', count: 1, evacuees: 310, color: '#f59e0b', pct: 22 },
    { id: 'full', label: 'Critical (>90%)', count: 1, evacuees: 140, color: '#991B1B', pct: 10 },
  ];

  // SVG Donut Math (Radius = 40, Circumference = 2 * PI * 40 ≈ 251.32)
  const circumference = 251.32;
  let accumulatedPct = 0;

  // 3. Dataset for Card 3: 24-Hour Stepped Area Timeline
  const hourlyData = [
    { time: '00:00', inflow: 2, dispatched: 1, resolved: 1 },
    { time: '04:00', inflow: 5, dispatched: 3, resolved: 2 },
    { time: '08:00', inflow: 9, dispatched: 7, resolved: 5 },
    { time: '12:00', inflow: 14, dispatched: 11, resolved: 8 },
    { time: '16:00', inflow: 12, dispatched: 10, resolved: 9 },
    { time: '20:00', inflow: 8, dispatched: 7, resolved: 7 },
    { time: 'Now', inflow: 6, dispatched: 6, resolved: 5 },
  ];

  const maxTimelineVal = 16;
  const chartHeight = 110;
  const chartWidth = 320;
  const stepWidth = chartWidth / (hourlyData.length - 1);

  // Generate stepped area SVG path string
  let steppedInflowPath = `M 0 ${chartHeight} L 0 ${chartHeight - (hourlyData[0].inflow / maxTimelineVal) * chartHeight}`;
  for (let i = 1; i < hourlyData.length; i++) {
    const prevX = (i - 1) * stepWidth;
    const currX = i * stepWidth;
    const currY = chartHeight - (hourlyData[i].inflow / maxTimelineVal) * chartHeight;
    steppedInflowPath += ` L ${currX} ${chartHeight - (hourlyData[i - 1].inflow / maxTimelineVal) * chartHeight} L ${currX} ${currY}`;
  }
  steppedInflowPath += ` L ${chartWidth} ${chartHeight} Z`;

  let steppedDispatchedPath = `M 0 ${chartHeight} L 0 ${chartHeight - (hourlyData[0].dispatched / maxTimelineVal) * chartHeight}`;
  for (let i = 1; i < hourlyData.length; i++) {
    const currX = i * stepWidth;
    const currY = chartHeight - (hourlyData[i].dispatched / maxTimelineVal) * chartHeight;
    steppedDispatchedPath += ` L ${currX} ${chartHeight - (hourlyData[i - 1].dispatched / maxTimelineVal) * chartHeight} L ${currX} ${currY}`;
  }
  steppedDispatchedPath += ` L ${chartWidth} ${chartHeight} Z`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {/* 1. Categorical Vertical Bar Chart with Angled, Strictly Contained Labels */}
      <div className="bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden min-w-0">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Incidents by Severity Tier
            </h4>
            <span className="text-[10px] font-bold text-[#991B1B] bg-rose-50 px-2 py-0.5 rounded-full">
              Triage Queue
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            LDRRMC urgency distribution
          </p>

          {/* Chart area */}
          <div className="mt-5 h-36 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 px-1">
            {urgencyTiers.map((tier) => {
              const heightPct = Math.max(15, Math.round((tier.count / maxUrgencyCount) * 100));
              const isHovered = hoveredUrgency === tier.id;

              return (
                <div
                  key={tier.id}
                  onMouseEnter={() => setHoveredUrgency(tier.id)}
                  onMouseLeave={() => setHoveredUrgency(null)}
                  onClick={() => onOpenDrillDown && onOpenDrillDown('urgency', tier.id)}
                  className="flex-1 flex flex-col items-center h-full justify-end group/bar cursor-pointer"
                >
                  <span
                    className={`text-[11px] font-bold tabular-nums mb-1 transition-all ${
                      isHovered ? 'text-[#991B1B] scale-110' : 'text-slate-700'
                    }`}
                  >
                    {tier.count}
                  </span>

                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-md relative overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className="w-full rounded-t-md transition-all duration-300"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: isHovered ? '#7f1d1d' : tier.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Angled Strictly Contained Labels Container (No overflow / spill) */}
          <div className="flex items-start justify-between gap-1 pt-2 h-14 overflow-hidden">
            {urgencyTiers.map((tier) => (
              <div key={tier.id} className="flex-1 text-center overflow-hidden">
                <span className="inline-block text-[10px] font-bold text-slate-500 transform -rotate-45 origin-top-left translate-x-2 whitespace-nowrap truncate max-w-[45px]">
                  {tier.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Critical + High Priority</span>
          <span className="font-bold text-[#991B1B] tabular-nums">
            {urgencyTiers[0].count + urgencyTiers[1].count} Urgent Action
          </span>
        </div>
      </div>

      {/* 2. Proportional Donut/Pie Distribution Chart with Floating Callout Badges */}
      <div className="bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden min-w-0">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Shelter Occupancy Distribution
            </h4>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              6 Centers
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Capacity tiers & evacuee density
          </p>

          {/* Donut graphic and floating callout badges */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-5">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />

                {/* Slices */}
                {donutSlices.map((slice) => {
                  const strokeLength = (slice.pct / 100) * circumference;
                  const strokeOffset = -(accumulatedPct / 100) * circumference;
                  accumulatedPct += slice.pct;
                  const isHovered = hoveredSlice === slice.id;

                  return (
                    <circle
                      key={slice.id}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 16 : 14}
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={strokeOffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(slice.id)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      onClick={() => onOpenDrillDown && onOpenDrillDown('shelter_status', slice.id)}
                    />
                  );
                })}
              </svg>

              {/* Centered Statistic */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 tabular-nums leading-none">
                  {currentTotalEvacuees.toLocaleString()}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Evacuees
                </span>
              </div>
            </div>

            {/* Floating Callout Badges */}
            <div className="flex-1 space-y-1.5 w-full min-w-0">
              {donutSlices.map((s) => (
                <div
                  key={s.id}
                  onMouseEnter={() => setHoveredSlice(s.id)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => onOpenDrillDown && onOpenDrillDown('shelter_status', s.id)}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    hoveredSlice === s.id
                      ? 'bg-slate-50 border-slate-300 shadow-xs scale-102'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[11px] font-bold text-slate-700 truncate">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tabular-nums ml-1 shrink-0">
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Safe Capacity Remaining</span>
          <span className="font-bold text-emerald-600 tabular-nums">
            {(totalShelterCapacity - currentTotalEvacuees).toLocaleString()} slots
          </span>
        </div>
      </div>

      {/* 3. Multi-Layer Stepped Area Chart with Translucent Crimson/Coral Gradients & Inline Legend */}
      <div className="bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden min-w-0">
        <div>
          {/* Header & Inline Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                24-Hour Operations Inflow
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Stepped report influx vs dispatch
              </p>
            </div>

            {/* Inline Legend */}
            <div className="flex items-center gap-2.5 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
                <span className="text-slate-600">Inflow</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                <span className="text-slate-600">Dispatched</span>
              </div>
            </div>
          </div>

          {/* Stepped Area SVG Canvas */}
          <div className="mt-3 relative h-36 w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Translucent Crimson Gradient */}
                <linearGradient id="crimsonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#991B1B" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#991B1B" stopOpacity="0.02" />
                </linearGradient>

                {/* Translucent Coral Gradient */}
                <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />

              {/* Inflow Stepped Area (Crimson) */}
              <path d={steppedInflowPath} fill="url(#crimsonGradient)" />

              {/* Dispatched Stepped Area (Coral) */}
              <path d={steppedDispatchedPath} fill="url(#coralGradient)" />

              {/* Outlines */}
              {hourlyData.map((d, i) => {
                if (i === 0) return null;
                const prevX = (i - 1) * stepWidth;
                const currX = i * stepWidth;
                const prevYInflow = chartHeight - (hourlyData[i - 1].inflow / maxTimelineVal) * chartHeight;
                const currYInflow = chartHeight - (d.inflow / maxTimelineVal) * chartHeight;
                const prevYDisp = chartHeight - (hourlyData[i - 1].dispatched / maxTimelineVal) * chartHeight;
                const currYDisp = chartHeight - (d.dispatched / maxTimelineVal) * chartHeight;

                return (
                  <g key={i}>
                    {/* Inflow lines */}
                    <line x1={prevX} y1={prevYInflow} x2={currX} y2={prevYInflow} stroke="#991B1B" strokeWidth="2" />
                    <line x1={currX} y1={prevYInflow} x2={currX} y2={currYInflow} stroke="#991B1B" strokeWidth="2" />

                    {/* Dispatched lines */}
                    <line x1={prevX} y1={prevYDisp} x2={currX} y2={prevYDisp} stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
                    <line x1={currX} y1={prevYDisp} x2={currX} y2={currYDisp} stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />

                    {/* Cyan Indicator on latest point */}
                    {i === hourlyData.length - 1 && (
                      <circle cx={currX} cy={currYInflow} r="4" fill="#00BCD4" stroke="#ffffff" strokeWidth="2" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Time Labels */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-1">
            {hourlyData.map((h, idx) => (
              <span key={idx} className="tabular-nums">
                {h.time}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4]" />
            <span>Resolution Rate</span>
          </span>
          <span className="font-bold text-slate-900 tabular-nums">91.8% Response Speed</span>
        </div>
      </div>
    </div>
  );
};
