import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Users,
  ShieldAlert,
  Radio,
  Layers,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  Navigation,
  RefreshCw,
  ExternalLink,
  Flame,
  Droplet,
  Zap,
  Wind,
  Building2,
  Truck,
  Plus,
  Minus,
  Maximize2,
  X,
  FileText,
  Send,
  AlertCircle
} from 'lucide-react';
import { Barangay, IncidentReport, EvacuationCenter, Advisory, User, HazardType } from '../types';
import { storage } from '../services/storage';

interface OperationsDashboardProps {
  reports: IncidentReport[];
  barangays: Barangay[];
  evacuationCenters: EvacuationCenter[];
  advisories: Advisory[];
  currentUser: User;
  onSelectReport?: (report: IncidentReport) => void;
  onOpenReportModal?: () => void;
  onNavigateTab?: (tab: string) => void;
  onDataChanged?: () => void;
}

// Generate consistent standardized incident code like UG-2026-0002
function formatIncidentCode(reportId: string, index: number): string {
  // If ID has digits like rep_101 -> extract or fall back to index
  const match = reportId.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `UG-2026-${String(num).padStart(4, '0')}`;
  }
  return `UG-2026-${String(index + 1).padStart(4, '0')}`;
}

// Format relative time (e.g., "10h 51m ago", "15m ago")
function formatRelativeTime(dateString: string): string {
  const diffMs = Math.max(0, Date.now() - new Date(dateString).getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) {
    const remMinutes = diffMinutes % 60;
    return `${diffHours}h ${remMinutes > 0 ? `${remMinutes}m ` : ''}ago`;
  }
  return `${diffDays}d ago`;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  reports,
  barangays,
  evacuationCenters,
  advisories,
  currentUser,
  onSelectReport,
  onOpenReportModal,
  onNavigateTab,
  onDataChanged,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedAdvisory, setSelectedAdvisory] = useState<Advisory | null>(null);

  // Layer Visibility
  const [layers, setLayers] = useState({
    hazards: true,
    perimeters: true,
    units: true,
    shelters: true,
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onDataChanged) onDataChanged();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Metrics Calculations matching the 4 stat cards in screenshot
  const activeIncidents = useMemo(() => {
    return reports.filter((r) => r.status !== 'resolved');
  }, [reports]);

  // Units deployed: incidents with assigned teams or active response crews
  const unitsDeployed = useMemo(() => {
    return reports.filter((r) => r.assigned_team && r.status !== 'resolved').length;
  }, [reports]);

  // Critical areas: high-severity hazards (SOS, Flooding, Storm Surge, Fire) that are not resolved
  const criticalAreas = useMemo(() => {
    return reports.filter(
      (r) =>
        r.status !== 'resolved' &&
        (r.hazard_type === 'Emergency SOS' ||
          r.hazard_type === 'Flood' ||
          r.hazard_type === 'Storm Surge' ||
          r.hazard_type === 'Fire')
    ).length;
  }, [reports]);

  // Sort newest first
  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reports]);

  // Selected incident object
  const activeSelectedIncident = useMemo(() => {
    return reports.find((r) => r.id === selectedIncidentId) || null;
  }, [reports, selectedIncidentId]);

  // Helper to get Barangay Name
  const getBarangayName = (barangayId: string) => {
    const b = barangays.find((brgy) => brgy.id === barangayId);
    return b ? b.name : 'Lingayen';
  };

  // Hazard Type count distribution for "Incidents by Hazard Type"
  const hazardDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach((r) => {
      const type = r.hazard_type.toUpperCase();
      map[type] = (map[type] || 0) + 1;
    });

    const total = reports.length || 1;
    return Object.entries(map)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // Readiness Metrics
  const openSheltersCount = useMemo(() => {
    return evacuationCenters.filter((c) => c.status === 'open').length;
  }, [evacuationCenters]);

  const shelterCapacityRate = useMemo(() => {
    const total = evacuationCenters.reduce((acc, c) => acc + c.capacity, 0);
    const occupied = evacuationCenters.reduce((acc, c) => acc + c.current_occupancy, 0);
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  }, [evacuationCenters]);

  const corroborationRate = useMemo(() => {
    if (reports.length === 0) return 100;
    const verifiedOrDispatched = reports.filter(
      (r) => r.status === 'verified' || r.status === 'dispatched' || r.status === 'resolved'
    ).length;
    return Math.round((verifiedOrDispatched / reports.length) * 100);
  }, [reports]);

  // Geographic mapping projection into SVG coordinate space (1000 x 560)
  const latMin = 15.998;
  const latMax = 16.046;
  const lngMin = 120.190;
  const lngMax = 120.252;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 940 + 30;
    const y = ((latMax - lat) / (latMax - latMin)) * 500 + 30;
    return {
      x: Math.max(30, Math.min(970, x)),
      y: Math.max(30, Math.min(530, y)),
    };
  };

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'Emergency SOS':
        return <AlertTriangle className="w-3.5 h-3.5" />;
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
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-red-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Operations Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              COMMAND CENTER
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time monitoring and incident command overview for Lingayen, Pangasinan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-2xs cursor-pointer"
            title="Refresh real-time queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Report Incident</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Cards from Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ACTIVE INCIDENTS */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                ACTIVE INCIDENTS
              </p>
              <p className="text-3xl sm:text-4xl font-black text-red-700 mt-1 tracking-tight">
                {activeIncidents.length}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>Live from the incident queue</span>
          </div>
        </div>

        {/* Card 2: UNITS DEPLOYED */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                UNITS DEPLOYED
              </p>
              <p className="text-3xl sm:text-4xl font-black text-red-700 mt-1 tracking-tight">
                {unitsDeployed}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Assigned responders</span>
          </div>
        </div>

        {/* Card 3: CRITICAL AREAS */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                CRITICAL AREAS
              </p>
              <p className="text-3xl sm:text-4xl font-black text-red-700 mt-1 tracking-tight">
                {criticalAreas}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>Emergency severity, not resolved</span>
          </div>
        </div>

        {/* Card 4: SYSTEM STATUS */}
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs hover:border-red-300 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                SYSTEM STATUS
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-red-700 tracking-tight">
                  LIVE
                </span>
                <span className="inline-flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Realtime connection active</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Live Operations Map (Wide Left) + Recent Incidents (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Operations Map (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-red-100 shadow-xs overflow-hidden flex flex-col">
          {/* Map Header */}
          <div className="px-5 py-4 border-b border-red-100 flex flex-wrap items-center justify-between gap-3 bg-red-50/20">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Live Operations Map</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active incident perimeters and deployed units
              </p>
            </div>

            {/* Controls: Realtime button + Layers toggle */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setIsRealtimeActive((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isRealtimeActive
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRealtimeActive ? 'bg-red-600 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>Realtime</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLayersDropdown((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-red-50/60 border border-red-200 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-red-600" />
                  <span>Layers</span>
                </button>

                {/* Layer Menu Dropdown */}
                {showLayersDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-red-100 p-2 z-30 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                      Map Layers
                    </p>
                    <label className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-red-50/50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={layers.hazards}
                        onChange={(e) =>
                          setLayers((prev) => ({ ...prev, hazards: e.target.checked }))
                        }
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span>Active Incidents</span>
                    </label>

                    <label className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-red-50/50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={layers.perimeters}
                        onChange={(e) =>
                          setLayers((prev) => ({ ...prev, perimeters: e.target.checked }))
                        }
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span>Hazard Risk Perimeters</span>
                    </label>

                    <label className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-red-50/50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={layers.units}
                        onChange={(e) =>
                          setLayers((prev) => ({ ...prev, units: e.target.checked }))
                        }
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span>Deployed Units</span>
                    </label>

                    <label className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-red-50/50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={layers.shelters}
                        onChange={(e) =>
                          setLayers((prev) => ({ ...prev, shelters: e.target.checked }))
                        }
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span>Evacuation Centers</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Map Canvas */}
          <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-50 overflow-hidden select-none">
            {/* Zoom Controls (Leaflet style + / - in red accent) */}
            <div className="absolute top-4 right-4 z-20 flex flex-col shadow-sm rounded-lg overflow-hidden border border-red-200 bg-white">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-red-700 hover:bg-red-50 border-b border-red-100 transition-colors cursor-pointer"
                title="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                title="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Map Canvas with Red Design Elements */}
            <svg
              viewBox="0 0 1000 560"
              className="w-full h-full object-cover transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 40%, #fafafa 100%)',
              }}
            >
              <defs>
                {/* Coastal Surge Grid Pattern */}
                <pattern id="redHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.25" />
                </pattern>
              </defs>

              {/* Waterway / Lingayen Gulf Coastal Coast */}
              <path
                d="M 0,0 L 1000,0 L 1000,105 Q 750,130 500,115 T 0,110 Z"
                fill="#fee2e2"
                opacity="0.6"
              />
              <text x="500" y="45" fill="#991b1b" fontSize="13" fontWeight="bold" opacity="0.7" textAnchor="middle" letterSpacing="3">
                LINGAYEN GULF COASTAL WATERS
              </text>
              <text x="500" y="65" fill="#b91c1c" fontSize="10" opacity="0.6" textAnchor="middle">
                Tide Monitoring & Storm Surge Risk Line
              </text>

              {/* Coastal Shoreline Line */}
              <path
                d="M 0,110 Q 250,125 500,115 T 1000,105"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="6 3"
                opacity="0.7"
              />

              {/* Agno River Branch (River system in red tones) */}
              <path
                d="M 100,560 C 180,450 280,430 380,390 C 460,360 540,360 620,380 C 700,410 800,480 880,560"
                fill="none"
                stroke="#fca5a5"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.8"
              />
              <text x="500" y="380" fill="#991b1b" fontSize="11" fontWeight="bold" opacity="0.8" textAnchor="middle">
                AGNO RIVER BASIN OVERFLOW WATCH
              </text>

              {/* Hazard Perimeters (Coastal Surge & River Overflow) */}
              {layers.perimeters && (
                <>
                  {/* High Risk Coastal Perimeter */}
                  <polygon
                    points="0,110 1000,105 1000,210 0,225"
                    fill="url(#redHatch)"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.9"
                  />
                  <text x="80" y="150" fill="#991b1b" fontSize="10" fontWeight="bold">
                    [PERIMETER: COASTAL SURGE ZONE A]
                  </text>

                  {/* Riverine Flood Perimeter */}
                  <path
                    d="M 320,360 Q 500,330 680,350 L 740,430 Q 500,400 260,420 Z"
                    fill="#fee2e2"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.75"
                  />
                  <text x="420" y="415" fill="#b91c1c" fontSize="9" fontWeight="bold">
                    [PERIMETER: RIVER OVERFLOW BASIN]
                  </text>
                </>
              )}

              {/* Barangay Boundaries & Labels */}
              {/* Libsong (Coastal East) */}
              <polygon
                points="480,115 950,105 920,270 450,260"
                fill="#fff"
                stroke="#fecaca"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <text x="700" y="185" fill="#7f1d1d" fontSize="12" fontWeight="800" textAnchor="middle">
                Brgy. Libsong / Bonuan Sector
              </text>

              {/* Maniboc (Coastal West) */}
              <polygon
                points="50,110 480,115 450,260 50,250"
                fill="#fff"
                stroke="#fecaca"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <text x="250" y="185" fill="#7f1d1d" fontSize="12" fontWeight="800" textAnchor="middle">
                Brgy. Maniboc Coastal Sector
              </text>

              {/* Poblacion Center */}
              <polygon
                points="250,260 750,260 700,370 280,365"
                fill="#fef2f2"
                stroke="#f87171"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.8"
              />
              <text x="500" y="305" fill="#991b1b" fontSize="13" fontWeight="900" textAnchor="middle">
                POBLACION (TOWN CENTER & LDRRMC COMMAND)
              </text>
              <text x="500" y="322" fill="#b91c1c" fontSize="9" textAnchor="middle">
                ★ Incident Command Post & Staging Area
              </text>

              {/* Baay & Riverine Barangays */}
              <polygon
                points="280,365 700,370 660,530 220,510"
                fill="#fff"
                stroke="#fecaca"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <text x="460" y="470" fill="#7f1d1d" fontSize="12" fontWeight="800" textAnchor="middle">
                Brgy. Baay Riverine Sector
              </text>

              {/* Evacuation Shelters Layer */}
              {layers.shelters &&
                evacuationCenters.map((evac) => {
                  const { x, y } = projectToMap(evac.latitude, evac.longitude);
                  return (
                    <g key={evac.id} className="cursor-pointer">
                      <circle cx={x} cy={y} r="10" fill="#ffffff" stroke="#b91c1c" strokeWidth="2" />
                      <circle cx={x} cy={y} r="4" fill="#b91c1c" />
                      <text x={x} y={y - 14} fill="#991b1b" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {evac.name.substring(0, 18)}...
                      </text>
                    </g>
                  );
                })}

              {/* Deployed Responder Units Layer */}
              {layers.units &&
                reports
                  .filter((r) => r.assigned_team && r.status !== 'resolved')
                  .map((rep, idx) => {
                    const { x, y } = projectToMap(rep.latitude + 0.002, rep.longitude - 0.002);
                    return (
                      <g key={`unit_${rep.id}`} className="cursor-pointer">
                        <circle cx={x} cy={y} r="14" fill="#991b1b" stroke="#ffffff" strokeWidth="2.5" />
                        <text x={x} y={y + 4} fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">
                          QRU
                        </text>
                        {/* Unit Callout Tag */}
                        <rect x={x + 16} y={y - 10} width="115" height="18" rx="4" fill="#ffffff" stroke="#b91c1c" strokeWidth="1" />
                        <text x={x + 22} y={y + 2} fill="#991b1b" fontSize="8" fontWeight="bold">
                          Unit: {rep.assigned_team?.substring(0, 16)}...
                        </text>
                      </g>
                    );
                  })}

              {/* Active Incidents Hazard Markers */}
              {layers.hazards &&
                sortedReports
                  .filter((r) => r.status !== 'resolved')
                  .map((rep, idx) => {
                    const { x, y } = projectToMap(rep.latitude, rep.longitude);
                    const isSelected = selectedIncidentId === rep.id;
                    const isEmergency =
                      rep.hazard_type === 'Emergency SOS' ||
                      rep.hazard_type === 'Flood' ||
                      rep.hazard_type === 'Storm Surge';

                    return (
                      <g
                        key={rep.id}
                        className="cursor-pointer transition-transform"
                        onClick={() => setSelectedIncidentId(rep.id)}
                      >
                        {/* Radar Pulse Effect */}
                        {isEmergency && (
                          <circle cx={x} cy={y} r="22" fill="#ef4444" opacity="0.3" className="animate-ping" />
                        )}

                        {/* Outer Pin Halo */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? '16' : '13'}
                          fill={isEmergency ? '#dc2626' : '#b91c1c'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          className="shadow-md"
                        />

                        {/* Center Icon Indicator */}
                        <circle cx={x} cy={y} r="5" fill="#ffffff" />

                        {/* Code Callout Badge */}
                        <rect
                          x={x - 34}
                          y={y + 16}
                          width="68"
                          height="16"
                          rx="4"
                          fill={isSelected ? '#7f1d1d' : '#991b1b'}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={y + 27}
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {formatIncidentCode(rep.id, idx)}
                        </text>
                      </g>
                    );
                  })}
            </svg>

            {/* Map Floating Incident Inspector Popup (When an incident is selected) */}
            {activeSelectedIncident && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-red-500 shadow-xl p-4 z-20 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="font-mono text-xs font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {formatIncidentCode(activeSelectedIncident.id, 0)}
                    </span>
                    <span className="text-xs font-black text-slate-900 uppercase">
                      {activeSelectedIncident.hazard_type}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedIncidentId(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 mt-2 line-clamp-2">
                  {activeSelectedIncident.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="truncate">{getBarangayName(activeSelectedIncident.barangay_id)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{activeSelectedIncident.corroboration_count} corroborations</span>
                  </div>
                </div>

                {activeSelectedIncident.assigned_team && (
                  <div className="mt-2 bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-2 text-xs text-red-800 font-bold">
                    <Truck className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="truncate">Unit: {activeSelectedIncident.assigned_team}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('incidents')}
                      className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Command Triage</span>
                    </button>
                  )}
                  {onSelectReport && (
                    <button
                      onClick={() => onSelectReport(activeSelectedIncident)}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Incidents Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-red-100 shadow-xs overflow-hidden flex flex-col h-[525px] sm:h-[585px]">
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-red-100 bg-red-50/20 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>Recent Incidents</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Newest first, all barangays
              </p>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-mono">
              {sortedReports.length}
            </span>
          </div>

          {/* Incident List */}
          <div className="flex-1 overflow-y-auto divide-y divide-red-50 p-3 space-y-2">
            {sortedReports.map((report, index) => {
              const isSelected = selectedIncidentId === report.id;
              const isEmergency =
                report.hazard_type === 'Emergency SOS' ||
                report.hazard_type === 'Flood' ||
                report.hazard_type === 'Storm Surge';

              return (
                <div
                  key={report.id}
                  onClick={() => {
                    setSelectedIncidentId(report.id);
                    if (onSelectReport) onSelectReport(report);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-50/80 border-red-400 shadow-xs ring-1 ring-red-400'
                      : 'bg-white hover:bg-red-50/30 border-slate-100 hover:border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Red Status Dot */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          report.status === 'resolved'
                            ? 'bg-slate-400'
                            : isEmergency
                            ? 'bg-red-600 animate-pulse'
                            : 'bg-red-500'
                        }`}
                      />

                      {/* Hazard Type in All Caps */}
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                        {report.hazard_type}
                      </h3>
                    </div>

                    {/* Incident Code Badge */}
                    <span className="font-mono text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded shrink-0">
                      {formatIncidentCode(report.id, index)}
                    </span>
                  </div>

                  {/* Location Line */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="font-medium truncate">
                      {getBarangayName(report.barangay_id)}, Pangasinan
                    </span>
                  </div>

                  {/* Meta: Time Ago & Corroborations */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500 shrink-0" />
                      <span>{formatRelativeTime(report.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-red-700">
                      <Shield className="w-3 h-3 text-red-600 shrink-0" />
                      <span>{report.corroboration_count} corroborations</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section (3 Cards from Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Incidents by Hazard Type */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Incidents by Hazard Type
              </h2>
              <span className="font-mono text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                {reports.length} ON RECORD
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {hazardDistribution.map((item) => (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 tracking-wide">
                      {item.type}
                    </span>
                    <span className="font-mono font-bold text-red-700">{item.count}</span>
                  </div>
                  {/* Proportional Red Bar */}
                  <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-5 pt-3 border-t border-slate-100">
            Automated aggregation across all municipal hazard channels.
          </p>
        </div>

        {/* Card 2: Active Advisories */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Active Advisories
              </h2>
              <span className="font-mono text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                {advisories.length} live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {advisories.slice(0, 3).map((advisory) => {
                const isEmergency =
                  advisory.severity === 'critical' || advisory.severity === 'high';
                return (
                  <div
                    key={advisory.id}
                    onClick={() => {
                      setSelectedAdvisory(advisory);
                      if (onNavigateTab) onNavigateTab('advisories');
                    }}
                    className="p-3 rounded-xl border border-red-100 hover:border-red-300 hover:bg-red-50/30 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isEmergency ? 'bg-red-600' : 'bg-red-400'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {advisory.title}
                        </h4>
                      </div>

                      {/* Severity Pill in Red */}
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                          isEmergency
                            ? 'bg-red-600 text-white border-red-700'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {isEmergency ? 'EMERGENCY' : 'WARNING'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                      <span className="truncate">
                        {advisory.target_barangay_id
                          ? getBarangayName(advisory.target_barangay_id)
                          : 'Municipality of Lingayen & Coastal Sectors'}
                      </span>
                      <span>•</span>
                      <span>{new Date(advisory.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('advisories')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-red-600 hover:text-red-700 flex items-center justify-between w-full cursor-pointer"
            >
              <span>View all emergency bulletins</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Card 3: Readiness */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Readiness
              </h2>
              <span className="font-mono text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                Operational
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {/* Metric 1: Shelters Open */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Shelters open</span>
                  <span className="font-mono font-bold text-slate-900">
                    {openSheltersCount} / {evacuationCenters.length} ({shelterCapacityRate}% full)
                  </span>
                </div>
                <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{
                      width: `${Math.round(
                        (openSheltersCount / Math.max(1, evacuationCenters.length)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Metric 2: Units Assigned */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Units assigned</span>
                  <span className="font-mono font-bold text-slate-900">
                    {unitsDeployed} active {unitsDeployed === 1 ? 'crew' : 'crews'}
                  </span>
                </div>
                <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, unitsDeployed * 35))}%` }}
                  />
                </div>
              </div>

              {/* Metric 3: Corroboration Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Corroboration rate</span>
                  <span className="font-mono font-bold text-red-700">
                    {corroborationRate}% verified
                  </span>
                </div>
                <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${corroborationRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LDRRMC Readiness Status Banner */}
          <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-red-900">Code Red - Alert Level 3</p>
              <p className="text-[10px] text-red-700">Command Post & Rapid Responders on standby</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
