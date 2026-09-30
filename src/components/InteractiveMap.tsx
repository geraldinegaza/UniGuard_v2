import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Flame,
  Droplet,
  Zap,
  Wind,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Barangay, IncidentReport, EvacuationCenter, User } from '../types';
import { storage } from '../services/storage';

interface InteractiveMapProps {
  barangays: Barangay[];
  reports: IncidentReport[];
  evacuationCenters: EvacuationCenter[];
  currentUser: User;
  onSelectReport: (report: IncidentReport) => void;
  onOpenReportModal: () => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  barangays,
  reports,
  evacuationCenters,
  currentUser,
  onSelectReport,
  onOpenReportModal,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedEvacId, setSelectedEvacId] = useState<string | null>(null);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showEvac, setShowEvac] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [corroborateFeedback, setCorroborateFeedback] = useState<string | null>(null);

  // Geographic bounds for Lingayen coordinate translation into SVG space (1000 x 600)
  // Lat: ~16.000 to 16.045, Lng: 120.190 to 120.250
  const latMin = 15.998;
  const latMax = 16.046;
  const lngMin = 120.190;
  const lngMax = 120.252;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 960 + 20;
    // Invert Y because latitude increases North, while SVG Y increases South
    const y = ((latMax - lat) / (latMax - latMin)) * 540 + 30;
    return { x: Math.max(30, Math.min(970, x)), y: Math.max(30, Math.min(570, y)) };
  };

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'Flood':
        return <Droplet className="w-3.5 h-3.5" />;
      case 'Fire':
        return <Flame className="w-3.5 h-3.5" />;
      case 'Downed Powerline':
        return <Zap className="w-3.5 h-3.5" />;
      case 'Storm Surge':
      case 'Typhoon / Strong Winds':
        return <Wind className="w-3.5 h-3.5" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unverified':
        return { bg: 'bg-[#b91c1c]', border: 'border-red-800', ping: 'bg-red-400', text: 'text-[#b91c1c]' };
      case 'verified':
        return { bg: 'bg-red-600', border: 'border-red-700', ping: 'bg-red-300', text: 'text-red-700' };
      case 'dispatched':
        return { bg: 'bg-slate-800', border: 'border-slate-900', ping: 'bg-slate-400', text: 'text-slate-800' };
      case 'resolved':
        return { bg: 'bg-slate-500', border: 'border-slate-600', ping: 'bg-slate-300', text: 'text-slate-600' };
      default:
        return { bg: 'bg-slate-500', border: 'border-slate-600', ping: 'bg-slate-400', text: 'text-slate-600' };
    }
  };

  const activeReport = reports.find((r) => r.id === selectedReportId);
  const activeEvac = evacuationCenters.find((e) => e.id === selectedEvacId);

  const handleCorroborate = (report: IncidentReport) => {
    const res = storage.corroborateReport(report.id, currentUser);
    setCorroborateFeedback(res.message);
    setTimeout(() => setCorroborateFeedback(null), 4000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Map Control Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#b91c1c]" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Lingayen Municipal DRRM Geospatial Radar
          </h3>
          <span className="text-[11px] font-semibold bg-red-50 text-[#b91c1c] px-2 py-0.5 rounded-full border border-red-200">
            Realtime GPS Feed
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 cursor-pointer shadow-2xs hover:bg-slate-50 text-slate-700">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded text-[#b91c1c] focus:ring-[#b91c1c] w-3.5 h-3.5 cursor-pointer"
            />
            <span className="font-medium">Active Hazards ({reports.filter((r) => r.status !== 'resolved').length})</span>
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 cursor-pointer shadow-2xs hover:bg-slate-50 text-slate-700">
            <input
              type="checkbox"
              checked={showEvac}
              onChange={(e) => setShowEvac(e.target.checked)}
              className="rounded text-slate-700 focus:ring-slate-700 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="font-medium">Evacuation Centers ({evacuationCenters.length})</span>
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 cursor-pointer shadow-2xs hover:bg-slate-50 text-slate-700">
            <input
              type="checkbox"
              checked={showRiskZones}
              onChange={(e) => setShowRiskZones(e.target.checked)}
              className="rounded text-[#b91c1c] focus:ring-[#b91c1c] w-3.5 h-3.5 cursor-pointer"
            />
            <span className="font-medium">Coastal Surge Risk Zones</span>
          </label>
        </div>
      </div>

      {/* Main Map Canvas Display */}
      <div className="relative w-full h-[450px] sm:h-[550px] bg-slate-100 overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover"
          style={{ background: 'linear-gradient(180deg, #f1f5f9 0%, #f8fafc 30%, #f1f5f9 31%, #f8fafc 100%)' }}
        >
          {/* Lingayen Gulf Sea Label */}
          <text x="500" y="50" fill="#475569" fontSize="16" fontWeight="bold" opacity="0.6" textAnchor="middle" letterSpacing="4">
            LINGAYEN GULF (SOUTH CHINA SEA)
          </text>
          <text x="500" y="70" fill="#64748b" fontSize="11" opacity="0.6" textAnchor="middle">
            Gale Warning / Storm Surge Monitoring Zone
          </text>

          {/* Sea Wave Lines */}
          <path d="M 50,40 Q 150,20 250,40 T 450,40 T 650,40 T 850,40 T 1000,40" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.6" />
          <path d="M 0,70 Q 100,50 200,70 T 400,70 T 600,70 T 800,70 T 1000,70" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.5" />

          {/* Coastline / Lingayen Bay Beach (Neutral coastal sand) */}
          <path
            d="M 0,140 Q 200,165 400,145 T 750,150 T 1000,135 L 1000,175 Q 750,190 400,185 T 0,180 Z"
            fill="#e2e8f0"
            opacity="0.8"
          />

          {/* Agno River Branch (Flows south and west) */}
          <path
            d="M 120,600 C 180,480 280,460 380,420 C 450,390 520,380 580,390 C 660,400 750,470 820,530 C 860,565 920,600 950,600"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.9"
          />
          <text x="440" y="420" fill="#64748b" fontSize="10" fontWeight="bold" opacity="0.8">
            AGNO RIVER BASIN
          </text>

          {/* Coastal Surge Risk Buffer Zone */}
          {showRiskZones && (
            <path
              d="M 0,140 L 1000,135 L 1000,260 L 0,270 Z"
              fill="#ef4444"
              opacity="0.08"
            />
          )}

          {/* Barangay Territory Boundaries */}
          {/* Maniboc (North West Coast) */}
          <polygon
            points="100,160 380,160 350,290 80,280"
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="2"
            opacity="0.5"
          />
          <text x="210" y="220" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">
            Brgy. Maniboc
          </text>

          {/* Libsong (North East Coast) */}
          <polygon
            points="380,160 880,145 840,310 350,290"
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="2"
            opacity="0.5"
          />
          <text x="600" y="220" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">
            Brgy. Libsong (Flood Prone)
          </text>

          {/* Poblacion (Town Proper & Capitol) */}
          <polygon
            points="350,290 740,300 680,420 310,400"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            opacity="0.8"
          />
          <text x="500" y="340" fill="#0f172a" fontSize="14" fontWeight="800" textAnchor="middle">
            POBLACION (LINGAYEN CENTER)
          </text>
          <text x="500" y="358" fill="#64748b" fontSize="10" textAnchor="middle">
            ★ Provincial Capitol & MDRRMC Command
          </text>

          {/* Baay (South Riverine) */}
          <polygon
            points="310,400 680,420 620,560 250,540"
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="2"
            opacity="0.5"
          />
          <text x="450" y="480" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">
            Brgy. Baay
          </text>

          {/* Domalandan Center (Highland West) */}
          <polygon
            points="30,280 250,300 230,550 30,530"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="2"
            opacity="0.7"
          />
          <text x="120" y="390" fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle">
            Brgy. Domalandan
          </text>
          <text x="120" y="405" fill="#64748b" fontSize="9" textAnchor="middle">
            (High Ground Safe Zone)
          </text>

          {/* User's GPS Pin Marker */}
          <g transform={`translate(${projectToMap(16.0240, 120.2295).x}, ${projectToMap(16.0240, 120.2295).y})`}>
            <circle r="14" fill="#b91c1c" opacity="0.2" className="animate-ping" />
            <circle r="7" fill="#b91c1c" stroke="#ffffff" strokeWidth="2.5" />
            <text x="0" y="-12" fill="#991b1b" fontSize="10" fontWeight="bold" textAnchor="middle">
              You (GPS Tagged)
            </text>
          </g>
        </svg>

        {/* HTML Markers Overlay for Rich Interactivity */}
        {/* 1. Evacuation Centers */}
        {showEvac &&
          evacuationCenters.map((evac) => {
            const pos = projectToMap(evac.latitude, evac.longitude);
            const isFull = evac.status === 'full';
            const isClosed = evac.status === 'closed';

            return (
              <div
                key={evac.id}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                onClick={() => {
                  setSelectedEvacId(evac.id);
                  setSelectedReportId(null);
                }}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-transform hover:scale-125 border-2 ${
                    isFull
                      ? 'bg-red-600 border-white text-white'
                      : isClosed
                      ? 'bg-slate-600 border-white text-white'
                      : 'bg-[#b91c1c] border-white text-white'
                  }`}
                  title={`${evac.name} (${evac.status.toUpperCase()})`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                {/* Tiny badge */}
                <span
                  className={`absolute -bottom-2 -right-1 text-[9px] font-black px-1 rounded-full text-white shadow-xs ${
                    isFull ? 'bg-red-800' : 'bg-slate-800'
                  }`}
                >
                  {Math.round((evac.current_occupancy / evac.capacity) * 100)}%
                </span>
              </div>
            );
          })}

        {/* 2. Hazard Incident Markers */}
        {showIncidents &&
          reports.map((report) => {
            const pos = projectToMap(report.latitude, report.longitude);
            const style = getStatusColor(report.status);
            const isResolved = report.status === 'resolved';

            return (
              <div
                key={report.id}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer ${
                  isResolved ? 'opacity-60' : 'opacity-100'
                }`}
                onClick={() => {
                  setSelectedReportId(report.id);
                  setSelectedEvacId(null);
                  onSelectReport(report);
                }}
              >
                {/* Ripple ring for active unverified/verified */}
                {!isResolved && (
                  <span
                    className={`absolute -inset-1.5 rounded-full ${style.ping} opacity-75 animate-ping`}
                  />
                )}
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-transform hover:scale-125 ${style.bg}`}
                >
                  {getHazardIcon(report.hazard_type)}
                </div>
                {/* Corroboration Count Pill */}
                <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white flex items-center gap-0.5">
                  <Users className="w-2.5 h-2.5 text-red-300" />
                  <span>{report.corroboration_count}</span>
                </div>
              </div>
            );
          })}

        {/* Map Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5 z-10 hidden sm:block max-w-xs">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Map Legend & Stages</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c]"></span>
              <span>1. Unverified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>2. Verified (3+ crowd)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
              <span>3. Dispatched</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>4. Resolved</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-slate-800" />
              <span>Evacuation Center (Live Capacity)</span>
            </div>
          </div>
        </div>

        {/* Quick Report FAB on Map */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={onOpenReportModal}
            className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Pin Hazard at My Location</span>
          </button>
        </div>
      </div>

      {/* Selected Incident Inspector Drawer / Card */}
      {activeReport && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-[250px]">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  Brgy. {activeReport.barangay_id.toUpperCase()}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                    activeReport.status === 'unverified'
                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                      : activeReport.status === 'verified'
                      ? 'bg-red-50 text-[#b91c1c] border border-red-200'
                      : activeReport.status === 'dispatched'
                      ? 'bg-[#b91c1c] text-white border border-[#991b1b]'
                      : 'bg-slate-900 text-white border border-slate-800'
                  }`}
                >
                  {activeReport.status}
                </span>
                <span className="text-xs text-slate-500">
                  Reported by {activeReport.reporter_name}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                <span>{activeReport.hazard_type}:</span>
                <span className="font-normal text-slate-700">{activeReport.description}</span>
              </h4>

              {/* Corroboration progress */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 max-w-xs bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#b91c1c] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (activeReport.corroboration_count / 3) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {activeReport.corroboration_count} / 3 Corroborations
                  {activeReport.corroboration_count >= 3 && ' (Auto-Verified!)'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCorroborate(activeReport)}
                className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+1 Corroborate</span>
              </button>
              <button
                onClick={() => setSelectedReportId(null)}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {corroborateFeedback && (
            <p className="mt-2 text-xs font-bold text-red-800 bg-red-50 p-2 rounded border border-red-200 animate-fadeIn">
              {corroborateFeedback}
            </p>
          )}
        </div>
      )}

      {/* Selected Evacuation Center Inspector Drawer */}
      {activeEvac && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                  EVACUATION SHELTER
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                    activeEvac.status === 'open'
                      ? 'bg-slate-800 text-white'
                      : activeEvac.status === 'full'
                      ? 'bg-[#b91c1c] text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {activeEvac.status}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">{activeEvac.name}</h4>
              <p className="text-xs text-slate-600">{activeEvac.address}</p>
              <p className="text-xs font-medium text-slate-700 mt-1">
                Capacity: {activeEvac.current_occupancy} / {activeEvac.capacity} persons (
                {activeEvac.capacity - activeEvac.current_occupancy} spots remaining)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeEvac.contact_number}`}
                className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <span>Call Center Desk</span>
              </a>
              <button
                onClick={() => setSelectedEvacId(null)}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
