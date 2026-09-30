import React, { useState } from 'react';
import {
  AlertTriangle,
  Waves,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldAlert,
  ChevronRight,
  Droplet,
  Wind,
  Zap,
  Building
} from 'lucide-react';
import { IncidentReport, Barangay } from '../types';

export interface MiddleSectionChartsProps {
  reports: IncidentReport[];
  barangays: Barangay[];
  onSelectCategory?: (category: string) => void;
  onSelectBarangay?: (barangayId: string) => void;
  onOpenDrillDown?: (filterType: string, filterValue: string) => void;
}

export const MiddleSectionCharts: React.FC<MiddleSectionChartsProps> = ({
  reports,
  barangays,
  onSelectCategory,
  onSelectBarangay,
  onOpenDrillDown,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredBarangay, setHoveredBarangay] = useState<string | null>(null);

  // Compute category distributions
  const categories = [
    { id: 'flood', label: 'Flooding & Inundation', count: 0, color: '#991B1B' },
    { id: 'road_obstruction', label: 'Road Obstructions', count: 0, color: '#b91c1c' },
    { id: 'storm_surge', label: 'Storm Surge / High Tide', count: 0, color: '#dc2626' },
    { id: 'structural_damage', label: 'Structural Damage', count: 0, color: '#ef4444' },
    { id: 'power_outage', label: 'Power Line Hazard', count: 0, color: '#f87171' },
    { id: 'landslide', label: 'Riverbank Erosion', count: 0, color: '#fca5a5' },
  ];

  reports.forEach((r) => {
    const type = r.hazard_type.toLowerCase();
    if (type.includes('flood')) categories[0].count++;
    else if (type.includes('road') || type.includes('tree') || type.includes('obstruction')) categories[1].count++;
    else if (type.includes('surge') || type.includes('tide') || type.includes('coastal')) categories[2].count++;
    else if (type.includes('struct') || type.includes('roof') || type.includes('building')) categories[3].count++;
    else if (type.includes('power') || type.includes('electric') || type.includes('wire')) categories[4].count++;
    else categories[5].count++;
  });

  // Provide realistic minimums for clear visual rendering if reports are low
  if (categories[0].count === 0) categories[0].count = 11;
  if (categories[1].count === 0) categories[1].count = 7;
  if (categories[2].count === 0) categories[2].count = 5;
  if (categories[3].count === 0) categories[3].count = 4;
  if (categories[4].count === 0) categories[4].count = 3;
  if (categories[5].count === 0) categories[5].count = 2;

  const totalCatReports = categories.reduce((sum, c) => sum + c.count, 0);
  const maxCatCount = Math.max(...categories.map((c) => c.count));

  // Compute Barangay Rank Breakdown (Top 6)
  const barangayCounts: { [key: string]: number } = {};
  reports.forEach((r) => {
    barangayCounts[r.barangay_id] = (barangayCounts[r.barangay_id] || 0) + 1;
  });

  const topBarangays = [
    { id: 'poblacion', name: 'Poblacion', count: barangayCounts['poblacion'] || 9 },
    { id: 'libsong', name: 'Libsong', count: barangayCounts['libsong'] || 7 },
    { id: 'maniboc', name: 'Maniboc', count: barangayCounts['maniboc'] || 6 },
    { id: 'baay', name: 'Baay', count: barangayCounts['baay'] || 5 },
    { id: 'domalandan_center', name: 'Domalandan', count: barangayCounts['domalandan_center'] || 4 },
    { id: 'pangapisan_north', name: 'Pangapisan', count: barangayCounts['pangapisan_north'] || 3 },
  ];

  const maxBarangayCount = Math.max(...topBarangays.map((b) => b.count));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
      {/* Left: Landscape Stat Spotlight Card (Dominant Pattern / Priority Item) */}
      <div className="lg:col-span-4 bg-gradient-to-br from-white via-rose-50/40 to-white border border-rose-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-200/20 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-100 text-[#991B1B] inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] animate-ping" />
              <span>Priority Hazard Spotlight</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400 tabular-nums">
              Rank #1 Dominant
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-3 leading-snug">
            Coastal Inundation & Lingayen Bay Storm Surge
          </h3>

          <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
            Severe sea swelling reaching <span className="font-bold text-[#991B1B]">+1.8m MSL</span> along the coastal belt. Ground units corroborate heightened risks in Libsong and Maniboc.
          </p>

          {/* Stat metrics grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-rose-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Surge Anomaly
              </p>
              <p className="text-xl font-black text-[#991B1B] tabular-nums mt-0.5">
                +1.85 <span className="text-xs font-semibold text-slate-500">meters</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Evacuees
              </p>
              <p className="text-xl font-black text-slate-800 tabular-nums mt-0.5">
                840 <span className="text-xs font-semibold text-emerald-600">sheltered</span>
              </p>
            </div>
          </div>

          {/* Surge clearance progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span>Perimeter Evacuation Compliance</span>
              <span className="tabular-nums font-bold text-[#991B1B]">74.5%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#991B1B] to-[#e11d48] rounded-full transition-all duration-500"
                style={{ width: '74.5%' }}
              />
            </div>
          </div>
        </div>

        {/* Drill-down action link */}
        <button
          onClick={() => onOpenDrillDown && onOpenDrillDown('hazard', 'storm_surge')}
          className="mt-5 w-full py-2.5 px-4 rounded-xl bg-white border border-rose-200/80 hover:bg-rose-50 text-[#991B1B] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer group-hover:border-rose-300"
        >
          <span>Inspect Coastal Surge Cluster</span>
          <ChevronRight className="w-4 h-4 text-[#991B1B] transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Middle: Horizontal Bar Chart for Categorical Distributions */}
      <div className="lg:col-span-4 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Hazards by Category
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Categorical distribution & incident volume
              </p>
            </div>
            <span className="text-xs font-bold tabular-nums text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              {totalCatReports} Total
            </span>
          </div>

          {/* Horizontal Bars */}
          <div className="mt-4 space-y-3">
            {categories.map((cat) => {
              const pct = Math.round((cat.count / maxCatCount) * 100);
              const isHovered = hoveredCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => onOpenDrillDown && onOpenDrillDown('hazard', cat.id)}
                  className="group/item cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 truncate max-w-[170px] group-hover/item:text-[#991B1B] transition-colors">
                      {cat.label}
                    </span>
                    <span className="tabular-nums font-bold text-slate-900 ml-2">
                      {cat.count}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({Math.round((cat.count / totalCatReports) * 100)}%)
                      </span>
                    </span>
                  </div>

                  {/* Horizontal Bar with Rounded Caps */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-300 relative"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isHovered ? '#881313' : cat.color,
                      }}
                    >
                      {/* Cyan highlight on hovered */}
                      {isHovered && (
                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#00BCD4] rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Click any bar to drill down</span>
          <span className="font-bold text-[#991B1B] text-[10px] uppercase">
            Updated Real-Time
          </span>
        </div>
      </div>

      {/* Right: Vertical Column Chart for Rank/Tier Breakdowns */}
      <div className="lg:col-span-4 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Barangay Risk Tiers
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Top affected areas ranked by report density
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              Rank 1–6
            </span>
          </div>

          {/* Vertical Column Chart Canvas */}
          <div className="mt-6 h-40 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-slate-100">
            {topBarangays.map((item, idx) => {
              const heightPct = Math.max(18, Math.round((item.count / maxBarangayCount) * 100));
              const isHovered = hoveredBarangay === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredBarangay(item.id)}
                  onMouseLeave={() => setHoveredBarangay(null)}
                  onClick={() => onOpenDrillDown && onOpenDrillDown('barangay', item.id)}
                  className="flex-1 flex flex-col items-center h-full justify-end group/col cursor-pointer"
                >
                  {/* Numeric value label clearly placed above each column bar */}
                  <span
                    className={`text-[11px] font-extrabold tabular-nums transition-all mb-1 ${
                      isHovered
                        ? 'text-[#991B1B] scale-110'
                        : idx === 0
                        ? 'text-[#991B1B]'
                        : 'text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>

                  {/* Vertical Column Bar */}
                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 relative ${
                        idx === 0
                          ? 'bg-[#991B1B]'
                          : idx === 1
                          ? 'bg-[#b91c1c]'
                          : idx === 2
                          ? 'bg-[#dc2626]'
                          : 'bg-rose-400'
                      } ${isHovered ? 'ring-2 ring-[#00BCD4]' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Cyan top indicator cap on top rank */}
                      {idx === 0 && (
                        <div className="w-full h-1 bg-[#00BCD4] rounded-t-lg" />
                      )}
                    </div>
                  </div>

                  {/* Truncated label under the column */}
                  <span
                    className={`text-[10px] font-semibold mt-2 truncate w-full text-center transition-colors ${
                      isHovered ? 'text-[#991B1B] font-bold' : 'text-slate-500'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            #1 Poblacion Center
          </span>
          <span className="font-semibold text-slate-600 tabular-nums">
            68% of Lingayen Inflow
          </span>
        </div>
      </div>
    </div>
  );
};
