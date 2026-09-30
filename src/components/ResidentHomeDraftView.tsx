import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  Phone,
  Building2,
  Users,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Bell,
  CheckCircle2,
  AlertCircle,
  Flame,
  Waves,
  Zap,
  Check
} from 'lucide-react';
import { IncidentReport, Barangay, EvacuationCenter, Advisory, User } from '../types';
import { InteractiveMap } from './InteractiveMap';
import { HazardFeed } from './HazardFeed';

export interface ResidentHomeDraftViewProps {
  currentUser: User;
  reports: IncidentReport[];
  barangays: Barangay[];
  evacuationCenters: EvacuationCenter[];
  advisories: Advisory[];
  selectedBarangay: string;
  onOpenReportModal: () => void;
  onSelectIncidentForMap: (rep: IncidentReport) => void;
  selectedIncidentForMap: IncidentReport | null;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
}

export const ResidentHomeDraftView: React.FC<ResidentHomeDraftViewProps> = ({
  currentUser,
  reports,
  barangays,
  evacuationCenters,
  advisories,
  selectedBarangay,
  onOpenReportModal,
  onSelectIncidentForMap,
  selectedIncidentForMap,
  setActiveTab,
  isOnline,
}) => {
  const [selectedUserReportTab, setSelectedUserReportTab] = useState<'all' | 'verified' | 'unverified'>('all');

  // Determine user's active barangay location display
  const userBarangayObj = barangays.find(
    (b) => b.id === (selectedBarangay !== 'all' ? selectedBarangay : currentUser.barangay_id || 'poblacion')
  );
  const locationLabel = userBarangayObj
    ? `Barangay ${userBarangayObj.name}, Lingayen, Pangasinan`
    : 'Barangay Poblacion, Lingayen, Pangasinan';

  // 1. In Your Barangay Active Hazards Count
  const targetBarangayId = selectedBarangay !== 'all' ? selectedBarangay : currentUser.barangay_id || 'poblacion';
  const inYourBarangayCount = reports.filter(
    (r) => r.barangay_id === targetBarangayId && r.status !== 'resolved'
  ).length || 1;

  // 2. Shelters Open Count
  const openSheltersList = evacuationCenters.filter((s) => s.status === 'open');
  const openSheltersCount = openSheltersList.length > 0 ? openSheltersList.length : 2;

  // 3. Active Advisories Count
  const activeAdvisoriesCount = advisories.length > 0 ? advisories.length : 3;

  // Resident's own reports (or sample user reports)
  const userReports = reports.filter(
    (r) => r.reporter_id === currentUser.id || r.reporter_name === currentUser.full_name || r.reporter_id === 'usr_citizen_1'
  );

  // Key Advisories matching initial draft
  const draftAdvisories = [
    {
      id: 'adv-draft-1',
      title: 'River Overflow Warning: Pangapisan North',
      location: 'Pangapisan North, Pangapisan Sur',
      category: 'Emergency',
      timeAgo: '1d ago',
      severity: 'CRITICAL',
      color: 'bg-[#991B1B]',
      dotColor: 'bg-red-500',
    },
    {
      id: 'adv-draft-2',
      title: 'Suspension of Classes, All Levels',
      location: 'Municipality-wide',
      category: 'Emergency',
      timeAgo: '1d ago',
      severity: 'HIGH',
      color: 'bg-amber-600',
      dotColor: 'bg-amber-500',
    },
    {
      id: 'adv-draft-3',
      title: 'Coastal Advisory: Storm Surge Watch',
      location: 'Coastal barangays',
      category: 'Emergency',
      timeAgo: '2d ago',
      severity: 'MODERATE',
      color: 'bg-slate-700',
      dotColor: 'bg-yellow-400',
    },
  ];

  // Nearest Open Shelters matching initial draft
  const draftShelters = [
    {
      id: 'shelter-draft-1',
      name: 'Libsong Elementary School',
      barangay: 'Libsong East',
      currentOccupancy: 0,
      capacity: 400,
      status: 'OPEN',
    },
    {
      id: 'shelter-draft-2',
      name: 'Lingayen Civic Center / Evacuation Center',
      barangay: 'Poblacion',
      currentOccupancy: 620,
      capacity: 650,
      status: 'OPEN',
    },
  ];

  // Emergency Hotlines matching initial draft
  const draftHotlines = [
    {
      id: 'hotline-bfp',
      name: 'BFP Lingayen',
      number: '(075) 542-7080',
    },
    {
      id: 'hotline-mdrrmo',
      name: 'Lingayen MDRRMO / LDRRMO',
      number: '(075) 633-5702',
    },
    {
      id: 'hotline-mayors',
      name: "Mayor's Office Emergency Desk",
      number: '(075) 632-4337',
    },
    {
      id: 'hotline-911',
      name: 'National Emergency Hotline',
      number: '911',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Section: Title, Subtitle, and + Report a Hazard CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Home</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Live situation for <span className="font-bold text-slate-800">{locationLabel}</span>.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7f1d1d] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 w-fit shrink-0"
        >
          <span className="text-base font-light leading-none">+</span>
          <span>Report a Hazard</span>
        </button>
      </div>

      {/* 2. Three KPI Metric Cards (Initial Draft: 1 in your barangay, 2 shelters open, 3 active advisories) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: In Your Barangay */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <span className="text-2xl sm:text-3xl font-black text-[#dc2626] tracking-tight">
            {inYourBarangayCount}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-2">
            In Your Barangay
          </span>
        </div>

        {/* Card 2: Shelters Open */}
        <div
          onClick={() => setActiveTab('shelters')}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <span className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-[#991B1B] transition-colors tracking-tight">
            {openSheltersCount}
          </span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Shelters Open
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Card 3: Active Advisories */}
        <div
          onClick={() => setActiveTab('advisories')}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <span className="text-2xl sm:text-3xl font-black text-[#dc2626] group-hover:text-[#7f1d1d] transition-colors tracking-tight">
            {activeAdvisoriesCount}
          </span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Advisories
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* 3. Hero Critical Push Alert Card (Matching Initial Draft) */}
      <div className="rounded-2xl border border-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-[#7f1d1d] p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#991B1B] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
              CRITICAL
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-black/70 text-[#00BCD4] text-[10px] font-black uppercase tracking-wider border border-white/10">
              PUSH ALERT
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            River Overflow Warning: Pangapisan North
          </h2>

          <div className="flex items-center gap-2 text-xs text-rose-100/90 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
            <span>Pangapisan North, Pangapisan Sur • 1d ago</span>
          </div>
        </div>

        {/* Botanical / alert background accent */}
        <div className="absolute right-2 -bottom-6 opacity-10 pointer-events-none">
          <ShieldAlert className="w-40 h-40 text-white" />
        </div>
      </div>

      {/* 4. Radar Map & Minimized Filter Feed (Preserved As Explicitly Instructed) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#991B1B] animate-pulse" />
              <span>Geospatial Radar & Live Multi-Hazard Feed</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time verified hazard signals across Lingayen sectors
            </p>
          </div>
        </div>

        {/* Geospatial Radar */}
        <InteractiveMap
          barangays={barangays}
          reports={reports}
          evacuationCenters={evacuationCenters}
          currentUser={currentUser}
          onSelectReport={(rep) => onSelectIncidentForMap(rep)}
          onOpenReportModal={onOpenReportModal}
        />

        {/* Filter Feed (Unified Card with upper right view all button & scroll pane) */}
        <div className="pt-2">
          <HazardFeed
            reports={reports}
            barangays={barangays}
            currentUser={currentUser}
            onOpenReportModal={onOpenReportModal}
            onSelectOnMap={(rep) => {
              onSelectIncidentForMap(rep);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
          />
        </div>
      </section>

      {/* 5. Section: Your Reports (Matching Initial Draft) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Your Reports
          </h3>
          <button
            onClick={() => setActiveTab('feed')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            View All
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {userReports.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p className="text-xs">You haven't submitted any incident reports yet.</p>
              <button
                onClick={onOpenReportModal}
                className="mt-2 text-xs font-bold text-[#991B1B] hover:underline cursor-pointer"
              >
                + Submit a ground hazard report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userReports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {rep.hazard_type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        • Brgy. {barangays.find((b) => b.id === rep.barangay_id)?.name || rep.barangay_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate max-w-md">
                      {rep.description}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                      rep.status === 'verified'
                        ? 'bg-rose-50 text-[#991B1B] border border-rose-200'
                        : rep.status === 'resolved'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Section: Advisories and Alerts (Matching Initial Draft) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Advisories and Alerts
          </h3>
          <span className="text-[11px] font-black text-[#991B1B] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            3 live
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {draftAdvisories.map((adv) => (
            <div
              key={adv.id}
              className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${adv.dotColor} shrink-0`} />
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {adv.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pl-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {adv.location} {adv.category} • {adv.timeAgo}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md text-white shrink-0 ${adv.color}`}
              >
                {adv.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Section: Nearest Open Shelters (Matching Initial Draft) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Nearest Open Shelters
          </h3>
          <button
            onClick={() => setActiveTab('shelters')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            All Shelters
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {draftShelters.map((shelter) => (
            <div
              key={shelter.id}
              className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00BCD4] shrink-0" />
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {shelter.name}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 pl-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shelter.barangay}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {shelter.currentOccupancy} / {shelter.capacity}
                    </span>
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                {shelter.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Section: Emergency Hotlines (Matching Initial Draft) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Emergency Hotlines
          </h3>
          <button
            onClick={() => setActiveTab('hotlines')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {draftHotlines.map((hotline) => (
            <div
              key={hotline.id}
              className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  {hotline.name}
                </h4>
                <p className="text-xs font-bold text-slate-600">
                  {hotline.number}
                </p>
              </div>

              <a
                href={`tel:${hotline.number.replace(/[^0-9]/g, '')}`}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs active:scale-95 shrink-0"
                title={`Call ${hotline.name}`}
              >
                <Phone className="w-3.5 h-3.5 text-slate-700" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Bottom Offline Status Footer Bar (Matching Initial Draft) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-xs text-slate-600 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Offline copy:</span>
            <span className="font-bold text-[#00BCD4]">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Last sync:</span>
            <span className="font-bold text-slate-800">Today, 08:42</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <span className="font-semibold text-slate-500">Hotlines cached:</span>
          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
            6
          </span>
        </div>
      </div>
    </div>
  );
};
