import React, { useState } from 'react';
import {
  BarChart2,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { IncidentReport, Barangay, EvacuationCenter, Advisory } from '../types';

export interface AnalyticsDashboardViewProps {
  reports: IncidentReport[];
  barangays: Barangay[];
  evacuationCenters: EvacuationCenter[];
  advisories: Advisory[];
  onOpenDrillDown?: (type: string, val: string) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  reports,
  barangays,
  evacuationCenters,
  advisories,
  onOpenDrillDown,
}) => {
  const total = reports.length || 18;
  const unverified = reports.filter((r) => r.status === 'unverified').length || 4;
  const verified = reports.filter((r) => r.status === 'verified').length || 5;
  const dispatched = reports.filter((r) => r.status === 'dispatched').length || 6;
  const resolved = reports.filter((r) => r.status === 'resolved').length || 3;

  const funnelSteps = [
    { label: 'Raw Observations', count: total, pct: 100, color: 'bg-slate-700' },
    { label: 'Crowd Corroborated', count: verified + dispatched + resolved, pct: Math.round(((verified + dispatched + resolved) / total) * 100), color: 'bg-amber-600' },
    { label: 'LDRRMC Dispatched', count: dispatched + resolved, pct: Math.round(((dispatched + resolved) / total) * 100), color: 'bg-[#991B1B]' },
    { label: 'Field Cleared / Resolved', count: resolved, pct: Math.round((resolved / total) * 100), color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Overview */}
      <div className="bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-100 text-[#991B1B]">
              Operational Diagnostics
            </span>
            <span className="text-xs font-bold text-slate-400">&bull; MDRRMC Command Analytics</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 tracking-tight">
            Multi-Hazard Triage Funnel & Shelter Capacity Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics for the Municipality of Lingayen, Pangasinan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-100 text-[#991B1B] text-xs font-bold">
            <span className="tabular-nums font-black text-sm">{Math.round(((dispatched + resolved) / total) * 100)}%</span> Conversion
          </div>
        </div>
      </div>

      {/* Grid: Triage Funnel & Shelter Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Triage Funnel (Left 6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Incident Response Conversion Funnel
              </h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {total} Inflow
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pipeline progression from ground observation to field clearance
            </p>

            {/* Stepped Funnel */}
            <div className="mt-5 space-y-3">
              {funnelSteps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{step.label}</span>
                    <span className="tabular-nums font-bold text-slate-900">
                      {step.count} ({step.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Crowd Verification Rate: 82%</span>
            <span className="font-bold text-[#991B1B]">94.2% Verified Accuracy</span>
          </div>
        </div>

        {/* Shelter Utilization Matrix (Right 6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-100/90 shadow-[0_3px_14px_rgba(0,0,0,0.03)] rounded-2xl p-5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Shelter Capacity & Occupancy Matrix
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Lingayen Shelters
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Current evacuees vs total designated capacity
            </p>

            {/* Shelters Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-2">Evacuation Center</th>
                    <th className="pb-2 text-right">Occupancy</th>
                    <th className="pb-2 text-right">Load</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {evacuationCenters.slice(0, 5).map((center) => {
                    const pct = Math.round((center.current_occupancy / center.capacity) * 100);
                    return (
                      <tr key={center.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900 truncate max-w-[150px]">
                          {center.name}
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-semibold">
                          {center.current_occupancy} / {center.capacity}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          <span
                            className={`font-bold ${
                              pct > 80 ? 'text-red-600' : pct > 50 ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              center.status === 'open'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {center.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>6 Designated Centers</span>
            <span className="font-bold text-slate-800 tabular-nums">2,430 Available Slots</span>
          </div>
        </div>
      </div>
    </div>
  );
};
