import React, { useState } from 'react';
import {
  IncidentReport,
  Barangay,
  Advisory,
  EvacuationCenter,
  EmergencyHotline,
  User,
  HazardType,
  UrgencyLevel
} from '../types';
import { storage } from '../services/storage';
import {
  Home,
  AlertTriangle,
  Volume2,
  Building2,
  PhoneCall,
  Bell,
  Download,
  Phone,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Compass,
  Check,
  X,
  Camera,
  ShieldAlert,
  Flame,
  Waves,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCheck,
  Info
} from 'lucide-react';
import { AdvisoryCenter } from './AdvisoryCenter';
import { OfflineSyncCenter } from './OfflineSyncCenter';
import { ResidentNotificationsView } from './ResidentNotificationsView';

interface ResidentPortalViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  reports: IncidentReport[];
  barangays: Barangay[];
  advisories: Advisory[];
  shelters: EvacuationCenter[];
  hotlines: EmergencyHotline[];
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingOutboxCount: number;
  onReportSubmitted: (report: IncidentReport) => void;
  onAdvisoryPublished: (advisory: Advisory) => void;
  onSyncCompleted: () => void;
}

export const ResidentPortalView: React.FC<ResidentPortalViewProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  reports,
  barangays,
  advisories,
  shelters,
  hotlines,
  isOnline,
  setIsOnline,
  pendingOutboxCount,
  onReportSubmitted,
  onAdvisoryPublished,
  onSyncCompleted,
}) => {
  // Notification Read State
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [shelterFilter, setShelterFilter] = useState<'all' | 'open' | 'full' | 'closed'>('all');
  const [copiedHotlineId, setCopiedHotlineId] = useState<string | null>(null);
  const [savedOfflineNotice, setSavedOfflineNotice] = useState<string | null>(null);

  // Report Form State (Matching Screenshot 6)
  const [reportType, setReportType] = useState<HazardType>('Flood');
  const [reportBarangay, setReportBarangay] = useState<string>('Aliwekwek');
  const [reportUrgency, setReportUrgency] = useState<'minor' | 'getting_worse' | 'people_at_risk'>('minor');
  const [reportDescription, setReportDescription] = useState('');
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [gpsAcquired, setGpsAcquired] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessNotice, setReportSuccessNotice] = useState<string | null>(null);

  // Acquire GPS simulation
  const handleAcquireGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsAcquired(true);
        },
        () => {
          // fallback to Lingayen coordinates
          setGpsCoords({ lat: 16.0216, lng: 120.2319 });
          setGpsAcquired(true);
        }
      );
    } else {
      setGpsCoords({ lat: 16.0216, lng: 120.2319 });
      setGpsAcquired(true);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    setIsSubmittingReport(true);

    const b = barangays.find((brgy) => brgy.name.toLowerCase() === reportBarangay.toLowerCase()) || barangays[0];

    const newReport = storage.submitReport({
      hazard_type: reportType,
      barangay_id: b.id,
      description: reportDescription.trim(),
      latitude: gpsCoords?.lat || b.latitude,
      longitude: gpsCoords?.lng || b.longitude,
      photo_url: reportPhoto || undefined,
      reporter: currentUser,
    });

    onReportSubmitted(newReport);
    setIsSubmittingReport(false);
    setReportSuccessNotice('Report submitted successfully! Reaching barangay queue for corroboration.');
    setReportDescription('');
    setReportPhoto(null);
    setGpsAcquired(false);

    setTimeout(() => {
      setReportSuccessNotice(null);
      setActiveTab('home');
    }, 2000);
  };

  // Hotlines listed in Screenshot 3
  const residentHotlinesList = [
    {
      id: 'hotline_bfp',
      category: 'FIRE AND RESCUE',
      name: 'BFP Lingayen',
      number: '(075) 542-7080',
    },
    {
      id: 'hotline_mdrrmo',
      category: '',
      name: 'Lingayen MDRRMO / LDRRMO',
      number: '(075) 633-5702',
    },
    {
      id: 'hotline_mayors',
      category: '',
      name: "Mayor's Office Emergency Desk",
      number: '(075) 632-4337',
    },
    {
      id: 'hotline_national',
      category: '',
      name: 'National Emergency Hotline',
      number: '911',
    },
    {
      id: 'hotline_pdrrmo',
      category: 'PROVINCIAL SUPPORT',
      name: 'Pangasinan PDRRMO',
      number: '0998-584-6867',
    },
    {
      id: 'hotline_pnp',
      category: 'POLICE ASSISTANCE',
      name: 'PNP Lingayen',
      number: '(075) 206-0042',
    },
    {
      id: 'hotline_pho',
      category: 'MEDICAL AND RELIEF',
      name: 'Provincial Health Office',
      number: '0933-813-8623',
    },
  ];

  // Shelters listed in Screenshot 4
  const residentSheltersList = [
    {
      id: 'sh_libsong_elem',
      name: 'Libsong Elementary School',
      status: 'closed' as const,
      barangay: 'Libsong East',
      occupied: 0,
      capacity: 400,
      notes: 'Coordinates are estimated (barangay centroid) — reconfirm with MDRRMO GIS before relying on for routing.',
    },
    {
      id: 'sh_lingayen_civic',
      name: 'Lingayen Civic Center / Evacuation Center',
      status: 'open' as const,
      barangay: 'Poblacion',
      occupied: 620,
      capacity: 650,
      notes: 'Coordinates sourced from OpenStreetMap-aligned data.',
    },
    {
      id: 'sh_pagcor_mpec',
      name: 'PAGCOR Multi-Purpose Evacuation Center (MPEC)',
      status: 'full' as const,
      barangay: 'Pangapisan North',
      occupied: 0,
      capacity: 1000,
      notes: 'Coordinates are estimated (barangay centroid) — reconfirm with MDRRMO GIS before relying on for routing.',
    },
    {
      id: 'sh_pangapisan_elem',
      name: 'Pangapisan Elementary School',
      status: 'closed' as const,
      barangay: 'Pangapisan Sur',
      occupied: 0,
      capacity: 400,
      notes: 'Coordinates sourced from OpenStreetMap-aligned data.',
    },
    {
      id: 'sh_pangasinan_training',
      name: 'Pangasinan Training Center / Disaster Evacuation Facility',
      status: 'closed' as const,
      barangay: 'Poblacion',
      occupied: 0,
      capacity: 600,
      notes: 'Coordinates reported as verified by source; still recommend a spot-check.',
    },
  ];

  const filteredShelters = residentSheltersList.filter((s) => {
    if (shelterFilter === 'all') return true;
    return s.status === shelterFilter;
  });

  // User's submitted reports
  const userReports = reports.filter(
    (r) => r.reporter_name === currentUser.full_name || r.source === 'citizen'
  );

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* SCREEN 1: RESIDENT HOME (Screenshot 1)                         */}
      {/* ============================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Header: Home title + "+ Report a Hazard" button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Home</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Live situation for Barangay Bonuan Gueset, Dagupan City.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('report_hazard')}
              className="bg-[#b91c1c] hover:bg-[#991b1b] text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <span>+ Report a Hazard</span>
            </button>
          </div>

          {/* 3 Metric Stat Counters (Screenshot 1 top row) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Box 1 */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5">
              <span className="text-3xl font-black text-amber-500 font-mono block">1</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mt-1 block">
                IN YOUR BARANGAY
              </span>
            </div>

            {/* Box 2 */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5">
              <span className="text-3xl font-black text-red-600 font-mono block">3</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mt-1 block">
                ACTIVE ADVISORIES
              </span>
            </div>

            {/* Box 3 */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5">
              <span className="text-3xl font-black text-emerald-600 font-mono block">1</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mt-1 block">
                SHELTERS OPEN
              </span>
            </div>
          </div>

          {/* Two-Column Grid: Left Column (Feed & Advisories) | Right Column (Shelters, Hotlines, Offline) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Alert Featured Banner (Screenshot 1) */}
              <div
                onClick={() => setActiveTab('advisories')}
                className="bg-white rounded-2xl border-2 border-red-500 shadow-xs p-6 space-y-4 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-[#b91c1c] text-white tracking-wider">
                    EMERGENCY
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 tracking-wider">
                    PUSH ALERT
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-red-700 transition-colors">
                    River Overflow Warning: Bonuan Gueset
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Bonuan Gueset, Bonuan Boquig · 9/19/2026</span>
                  </p>
                </div>
              </div>

              {/* Your Reports Card */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-50">
                  <h3 className="text-sm font-black text-slate-900">Your Reports</h3>
                  <button
                    onClick={() => setActiveTab('report_hazard')}
                    className="text-xs font-bold text-red-700 hover:text-red-800 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {userReports.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active hazard reports submitted by you yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userReports.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-red-50/30 border border-red-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 uppercase">
                            {r.hazard_type.replace('_', ' ')}
                          </span>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">
                            {r.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {r.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advisories and Alerts List (Screenshot 1) */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-50">
                  <h3 className="text-sm font-black text-slate-900">Advisories and Alerts</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    3 live
                  </span>
                </div>

                <div className="divide-y divide-red-50">
                  {/* Item 1 */}
                  <div
                    onClick={() => setActiveTab('advisories')}
                    className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-red-50/30 px-2 rounded-xl transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug">
                          River Overflow Warning: Bonuan Gueset
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Bonuan Gueset, Bonuan Boquig · Emergency · 9/19/2026
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white shrink-0">
                      EMERGENCY
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div
                    onClick={() => setActiveTab('advisories')}
                    className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-red-50/30 px-2 rounded-xl transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug">
                          Suspension of Classes, All Levels
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Citywide · Emergency · 9/19/2026
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 shrink-0">
                      WARNING
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div
                    onClick={() => setActiveTab('advisories')}
                    className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-red-50/30 px-2 rounded-xl transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug">
                          Coastal Advisory: Storm Surge Watch
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Coastal barangays · Emergency · 9/19/2026
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 shrink-0">
                      ADVISORY
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Nearest Open Shelters Card */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-50">
                  <h3 className="text-sm font-black text-slate-900">Nearest Open Shelters</h3>
                  <button
                    onClick={() => setActiveTab('shelters')}
                    className="text-xs font-bold text-red-700 hover:text-red-800 hover:underline cursor-pointer"
                  >
                    All Shelters
                  </button>
                </div>

                <div
                  onClick={() => setActiveTab('shelters')}
                  className="p-3.5 rounded-xl bg-red-50/20 border border-red-100 flex items-center justify-between cursor-pointer hover:bg-red-50/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-black text-slate-900">
                        Lingayen Civic Center / Evacuation Center
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 pl-3.5">
                      <span>📍 Poblacion</span>
                      <span>•</span>
                      <span>👥 620 / 650</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    OPEN
                  </span>
                </div>
              </div>

              {/* Emergency Hotlines Card */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-50">
                  <h3 className="text-sm font-black text-slate-900">Emergency Hotlines</h3>
                  <button
                    onClick={() => setActiveTab('hotlines')}
                    className="text-xs font-bold text-red-700 hover:text-red-800 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {residentHotlinesList.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-red-50/20 border border-red-100 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{h.name}</h4>
                        <span className="font-mono text-xs font-bold text-red-700">
                          {h.number}
                        </span>
                      </div>
                      <a
                        href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                        className="p-2 rounded-xl bg-[#b91c1c] text-white hover:bg-[#991b1b] transition cursor-pointer shadow-2xs"
                        title={`Call ${h.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offline Copy Status Mini-Card */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-red-50">
                  <span className="text-slate-500 font-medium">Offline copy</span>
                  <span className="font-bold text-emerald-600">Ready</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-red-50">
                  <span className="text-slate-500 font-medium">Last sync</span>
                  <span className="font-mono font-bold text-slate-700">Today, 08:42</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Hotlines cached</span>
                  <span className="font-mono font-bold text-red-700">6</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 2: REPORT A HAZARD (Screenshot 6)                       */}
      {/* ============================================================== */}
      {activeTab === 'report_hazard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {reportSuccessNotice && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-xs font-bold text-red-800 flex items-center justify-between animate-in zoom-in-95">
              <span>{reportSuccessNotice}</span>
              <Check className="w-4 h-4 text-red-600" />
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-red-100">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report a Hazard</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-Hazard Reporting. Your report reaches your barangay queue with its timestamp and position.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-red-50/50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Hazard Details */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-red-100 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <h3 className="text-sm font-black text-slate-900">Hazard Details</h3>
                <span className="text-xs font-mono text-slate-400">Step 1 of 2</span>
              </div>

              {/* Hazard Type & Barangay Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    HAZARD TYPE
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as HazardType)}
                    className="w-full text-xs font-semibold text-slate-800 bg-red-50/20 border border-red-200 rounded-xl p-3 focus:bg-white focus:border-red-500 outline-hidden cursor-pointer"
                  >
                    <option value="flood">Flash Flood</option>
                    <option value="storm_surge">Storm Surge</option>
                    <option value="road_blocked">Road Blockage</option>
                    <option value="structural_damage">Structural Damage</option>
                    <option value="power_outage">Power Outage</option>
                    <option value="medical_emergency">Medical Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    BARANGAY JURISDICTION
                  </label>
                  <select
                    value={reportBarangay}
                    onChange={(e) => setReportBarangay(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-red-50/20 border border-red-200 rounded-xl p-3 focus:bg-white focus:border-red-500 outline-hidden cursor-pointer"
                  >
                    <option value="Aliwekwek">Aliwekwek</option>
                    <option value="Bonuan Gueset">Bonuan Gueset</option>
                    <option value="Bonuan Boquig">Bonuan Boquig</option>
                    <option value="Libsong East">Libsong East</option>
                    <option value="Libsong West">Libsong West</option>
                    <option value="Poblacion">Poblacion</option>
                    <option value="Pangapisan North">Pangapisan North</option>
                    <option value="Pangapisan Sur">Pangapisan Sur</option>
                    {barangays.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* How Urgent Does It Look */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  HOW URGENT DOES IT LOOK
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReportUrgency('minor')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reportUrgency === 'minor'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-red-50/30 text-slate-700 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <span>Looks Minor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportUrgency('getting_worse')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reportUrgency === 'getting_worse'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-red-50/30 text-slate-700 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <span>Getting Worse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportUrgency('people_at_risk')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      reportUrgency === 'people_at_risk'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-red-50/30 text-slate-700 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <span>People at Risk</span>
                  </button>
                </div>
              </div>

              {/* Description and Hazard Details */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  DESCRIPTION AND HAZARD DETAILS
                </label>
                <textarea
                  required
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe what you are seeing: water depth (knee or waist high), affected roads, trapped families, or nearby landmarks."
                  className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 bg-red-50/20 border border-red-200 rounded-xl p-3.5 focus:bg-white focus:border-red-500 outline-hidden transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Landmark references help responders find the exact spot.
                </p>
              </div>
            </div>

            {/* Right Column: Photo Evidence & Incident Coordinates */}
            <div className="lg:col-span-5 space-y-6">
              {/* Photo Evidence Card */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-50">
                  <h3 className="text-sm font-black text-slate-900">Photo Evidence</h3>
                  <span className="text-xs text-slate-400">Optional</span>
                </div>

                <label className="border-2 border-dashed border-red-200 hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-red-50/10 hover:bg-red-50/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {reportPhoto ? (
                    <div className="space-y-2">
                      <img
                        src={reportPhoto}
                        alt="Evidence preview"
                        className="max-h-36 rounded-xl object-cover mx-auto shadow-xs"
                      />
                      <span className="text-xs text-red-600 font-bold block">
                        Tap to change photo
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2 shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Tap to Attach a Hazard Photo</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG or PNG up to 10 MB</p>
                    </>
                  )}
                </label>
              </div>

              {/* Incident Coordinates Card */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 space-y-3.5">
                <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-red-50">
                  Incident Coordinates
                </h3>

                <div className="p-3.5 rounded-xl bg-red-50/30 border border-red-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-slate-600 font-medium">
                      {gpsAcquired ? 'GPS coordinates acquired ✓' : 'Not acquired GPS tagging attaches your position to the report'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAcquireGps}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition cursor-pointer shrink-0"
                  >
                    Acquire
                  </button>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Barangay queue</span>
                    <span className="font-bold text-slate-800">Bonuan Gueset</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Verification</span>
                    <span className="font-bold text-amber-600">3 corroborations</span>
                  </div>
                </div>

                {/* Submit Report Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white py-3 rounded-xl font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit Report</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Reports stay editable for 15 minutes after submission.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 3: ADVISORIES (Screenshot 5)                            */}
      {/* ============================================================== */}
      {activeTab === 'advisories' && (
        <AdvisoryCenter
          advisories={advisories}
          currentUser={currentUser}
          barangays={barangays}
          onAdvisoryPublished={onAdvisoryPublished}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* ============================================================== */}
      {/* SCREEN 4: SHELTERS (Screenshot 4)                              */}
      {/* ============================================================== */}
      {activeTab === 'shelters' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shelters</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Evacuation Center Directory with live availability for Dagupan City, Pangasinan.
              </p>
            </div>

            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
              <span>≈</span>
              <span>This list works without a connection</span>
            </span>
          </div>

          {/* Filter Pills: All 5 | Open 1 | Full 1 | Closed 3 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShelterFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                shelterFilter === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] font-mono">5</span>
            </button>

            <button
              onClick={() => setShelterFilter('open')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                shelterFilter === 'open'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>Open</span>
              <span className="text-[10px] font-mono">1</span>
            </button>

            <button
              onClick={() => setShelterFilter('full')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                shelterFilter === 'full'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>Full</span>
              <span className="text-[10px] font-mono">1</span>
            </button>

            <button
              onClick={() => setShelterFilter('closed')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                shelterFilter === 'closed'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-red-200 text-slate-700 hover:bg-red-50'
              }`}
            >
              <span>Closed</span>
              <span className="text-[10px] font-mono">3</span>
            </button>
          </div>

          {/* Shelters Grid (Screenshot 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShelters.map((s) => {
              const percent = s.capacity > 0 ? Math.round((s.occupied / s.capacity) * 100) : 0;

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {s.name}
                      </h3>

                      {s.status === 'open' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white shrink-0">
                          OPEN
                        </span>
                      )}
                      {s.status === 'full' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-white shrink-0">
                          FULL
                        </span>
                      )}
                      {s.status === 'closed' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white shrink-0">
                          CLOSED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span>{s.barangay}</span>
                      </span>
                      <span>•</span>
                      <span>
                        👥 {s.occupied} of {s.capacity} slots
                      </span>
                    </p>

                    {s.status === 'open' && (
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {s.notes}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-red-50 flex items-center gap-2">
                    <button
                      onClick={() => {
                        window.open(
                          `https://waze.com/ul?q=${encodeURIComponent(
                            s.name + ' Lingayen Pangasinan'
                          )}&navigate=yes`,
                          '_blank'
                        );
                      }}
                      className="flex-1 bg-[#991B1B] hover:bg-[#7f1d1d] text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Navigate with Waze</span>
                    </button>

                    <button
                      onClick={() => {
                        setSavedOfflineNotice(`Saved ${s.name} coordinates to offline map cache!`);
                        setTimeout(() => setSavedOfflineNotice(null), 3000);
                      }}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                      title="Download offline coordinates"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {savedOfflineNotice && (
            <div className="fixed bottom-4 right-4 bg-white border border-red-200 text-red-700 px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold animate-in slide-in-from-bottom-2">
              {savedOfflineNotice}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 5: HOTLINES (Screenshot 3)                              */}
      {/* ============================================================== */}
      {activeTab === 'hotlines' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hotlines</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Emergency Hotline Directory for barangay and municipal offices.
              </p>
            </div>

            <button
              onClick={() => {
                setSavedOfflineNotice('All 7 emergency hotlines cached locally on device storage!');
                setTimeout(() => setSavedOfflineNotice(null), 3500);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-red-600" />
              <span>Save Offline</span>
            </button>
          </div>

          {savedOfflineNotice && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center justify-between animate-in fade-in">
              <span>{savedOfflineNotice}</span>
              <Check className="w-4 h-4 text-red-600" />
            </div>
          )}

          {/* 7 Hotline Cards Grid (Screenshot 3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {residentHotlinesList.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-red-400 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {h.category ? (
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {h.category}
                      </span>
                    ) : (
                      <span />
                    )}
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug">
                    {h.name}
                  </h3>

                  <p className="font-mono text-base font-bold text-red-700">
                    {h.number}
                  </p>
                </div>

                <a
                  href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                  className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>

          {/* Bottom Information Callout (Screenshot 3) */}
          <div className="p-4 rounded-xl bg-red-50/40 border border-red-200 flex items-start gap-2.5 text-xs text-slate-700">
            <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p>
              If a line is busy, keep the call short and state your barangay, landmark and number of people needing help.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN 6: NOTIFICATIONS (Screenshot)                           */}
      {/* ============================================================== */}
      {activeTab === 'notifications' && (
        <ResidentNotificationsView
          onNavigateTab={setActiveTab}
        />
      )}

      {/* ============================================================== */}
      {/* SCREEN 7: OFFLINE SYNC (Screenshot Offline Readiness)           */}
      {/* ============================================================== */}
      {activeTab === 'offline_sync' && (
        <OfflineSyncCenter
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          pendingOutboxCount={pendingOutboxCount}
          hotlines={hotlines}
          evacuationCenters={shelters}
          advisories={advisories}
          currentUser={currentUser}
          onSyncCompleted={onSyncCompleted}
          onNavigateTab={setActiveTab}
        />
      )}
    </div>
  );
};
