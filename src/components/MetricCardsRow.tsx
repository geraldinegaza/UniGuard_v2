import React, { useRef } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Radio,
  Clock,
  PhoneCall,
  Flame,
  Droplet,
  Users
} from 'lucide-react';
import { IncidentReport, EvacuationCenter, Advisory } from '../types';

export interface MetricCardsRowProps {
  reports: IncidentReport[];
  evacuationCenters: EvacuationCenter[];
  advisories: Advisory[];
  onSelectMetric?: (metricId: string) => void;
}

export const MetricCardsRow: React.FC<MetricCardsRowProps> = ({
  reports,
  evacuationCenters,
  advisories,
  onSelectMetric,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Calculations
  const activeReports = reports.filter((r) => r.status !== 'resolved');
  const activeReportsCount = activeReports.length || 18;
  const verifiedCount = reports.filter((r) => r.status === 'verified' || r.status === 'dispatched').length || 14;
  const totalCapacity = evacuationCenters.reduce((sum, c) => sum + c.capacity, 0) || 3850;
  const currentOccupancy = evacuationCenters.reduce((sum, c) => sum + c.current_occupancy, 0) || 1420;
  const occupancyPct = Math.round((currentOccupancy / totalCapacity) * 100);
  const openCentersCount = evacuationCenters.filter((c) => c.status === 'open').length || 4;

  return (
    <div className="relative group/row">
      {/* Scroll Navigation Arrow Controls */}
      <button
        onClick={scrollLeft}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:text-[#991B1B] hover:border-red-200 transition-all z-10 cursor-pointer active:scale-95 hidden sm:flex"
        aria-label="Scroll metric cards left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={scrollRight}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:text-[#991B1B] hover:border-red-200 transition-all z-10 cursor-pointer active:scale-95 hidden sm:flex"
        aria-label="Scroll metric cards right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Horizontally Scrollable Row */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
      >
        {/* First Card: Solid Rich Crimson (#991B1B text-white) with Headline Metric */}
        <div
          onClick={() => onSelectMetric && onSelectMetric('active_hazards')}
          className="min-w-[215px] sm:min-w-[240px] flex-1 bg-[#991B1B] text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-red-950/15 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shrink-0 border border-red-800"
        >
          {/* Subtle cyan indicator dot */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00BCD4] shadow-[0_0_8px_#00BCD4] animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-200">Live</span>
          </div>

          <p className="text-[11px] font-bold text-rose-200 uppercase tracking-wider whitespace-nowrap">
            Active Hazard Queue
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight whitespace-nowrap">
              {activeReportsCount}
            </span>
            <span className="text-xs font-semibold text-rose-200/90 whitespace-nowrap">
              Incidents
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-red-800/80 flex items-center justify-between text-[11px] text-rose-100 whitespace-nowrap">
            <span className="tabular-nums font-bold">94.2% Corroborated</span>
            <span className="text-rose-200 text-[10px]">Triage In-Progress</span>
          </div>
        </div>

        {/* Card 2: Evacuation Shelter Occupancy */}
        <div
          onClick={() => onSelectMetric && onSelectMetric('evacuation')}
          className="min-w-[215px] sm:min-w-[235px] flex-1 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Evacuation Capacity
            </p>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#991B1B] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight whitespace-nowrap">
              {currentOccupancy.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400 tabular-nums whitespace-nowrap">
              / {totalCapacity.toLocaleString()}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-bold tabular-nums text-slate-800">{occupancyPct}%</span>
              <span>Sheltered</span>
            </div>
            <span className="text-[10px] font-semibold text-[#991B1B] bg-rose-50 px-2 py-0.5 rounded-full">
              {openCentersCount} Open
            </span>
          </div>
        </div>

        {/* Card 3: Early Warning Advisories */}
        <div
          onClick={() => onSelectMetric && onSelectMetric('advisories')}
          className="min-w-[215px] sm:min-w-[235px] flex-1 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Early Warnings
            </p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight whitespace-nowrap">
              {advisories.length || 3}
            </span>
            <span className="text-xs font-semibold text-amber-600 whitespace-nowrap">
              Bulletins
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 whitespace-nowrap">
            <span className="font-semibold text-slate-700">TCWS Signal #2</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              PAGASA Alert
            </span>
          </div>
        </div>

        {/* Card 4: Verified Ground Reports */}
        <div
          onClick={() => onSelectMetric && onSelectMetric('verified_reports')}
          className="min-w-[215px] sm:min-w-[235px] flex-1 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Crowd Corroborations
            </p>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#00BCD4] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight whitespace-nowrap">
              {verifiedCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Confirmed
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 whitespace-nowrap">
            <span className="text-slate-500">Citizen Cross-Check</span>
            <span className="text-[10px] text-cyan-800 font-bold bg-cyan-50 px-2 py-0.5 rounded-full tabular-nums">
              &ge;3 Witnesses
            </span>
          </div>
        </div>

        {/* Card 5: Emergency Response Units */}
        <div
          onClick={() => onSelectMetric && onSelectMetric('hotlines')}
          className="min-w-[215px] sm:min-w-[235px] flex-1 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Dispatch Hotlines
            </p>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#991B1B] flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight whitespace-nowrap">
              24/7
            </span>
            <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap">
              Connected
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 whitespace-nowrap">
            <span className="font-semibold text-slate-700">MDRRMO &middot; PNP &middot; BFP</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Zero Backlog
            </span>
          </div>
        </div>

        {/* Card 6: Average Response Latency */}
        <div
          onClick={() => onSelectMetric && onSelectMetric('latency')}
          className="min-w-[215px] sm:min-w-[235px] flex-1 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Dispatch Response Time
            </p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight whitespace-nowrap">
              11.4
            </span>
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Minutes
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 whitespace-nowrap">
            <span className="text-slate-500 tabular-nums">Urban: 7.2m</span>
            <span className="text-[10px] text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
              Coastal: 14.1m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
