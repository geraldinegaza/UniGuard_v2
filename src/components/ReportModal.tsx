import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Camera,
  AlertTriangle,
  Upload,
  Check,
  Compass,
  WifiOff,
  Flame,
  Droplet,
  Zap,
  Wind,
  Truck,
  Building,
  Info
} from 'lucide-react';
import { User, Barangay, HazardType, IncidentReport } from '../types';
import { storage } from '../services/storage';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  barangays: Barangay[];
  isOnline: boolean;
  onReportSubmitted: (report: IncidentReport) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Knee-Deep Flood',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    hazard: 'Flood',
  },
  {
    label: 'Snapped Electric Line',
    url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    hazard: 'Downed Powerline',
  },
  {
    label: 'Fallen Tree on Road',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    hazard: 'Road Obstruction',
  },
  {
    label: 'Coastal Storm Surge',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
    hazard: 'Storm Surge',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  barangays,
  isOnline,
  onReportSubmitted,
}) => {
  const [hazardType, setHazardType] = useState<HazardType>('Flood');
  const [barangayId, setBarangayId] = useState<string>(currentUser.barangay_id || 'libsong');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(16.0315);
  const [longitude, setLongitude] = useState<number>(120.2412);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [nearbyDuplicates, setNearbyDuplicates] = useState<IncidentReport[]>([]);

  // Update default coordinates when barangay changes
  const handleBarangayChange = (bId: string) => {
    setBarangayId(bId);
    const target = barangays.find((b) => b.id === bId);
    if (target) {
      setLatitude(target.latitude);
      setLongitude(target.longitude);
    }
  };

  // Check for nearby duplicates dynamically
  useEffect(() => {
    if (latitude && longitude && hazardType) {
      const nearby = storage.findNearbySimilarReports(hazardType, latitude, longitude, 1000);
      setNearbyDuplicates(nearby);
    }
  }, [hazardType, latitude, longitude]);

  // Request browser geolocation
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationSuccess(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(Number(position.coords.latitude.toFixed(6)));
          setLongitude(Number(position.coords.longitude.toFixed(6)));
          setIsLocating(false);
          setLocationSuccess(true);
          setTimeout(() => setLocationSuccess(false), 3000);
        },
        (error) => {
          console.warn('Geolocation failed or permission denied, using barangay default center.', error);
          const target = barangays.find((b) => b.id === barangayId);
          if (target) {
            setLatitude(target.latitude + (Math.random() - 0.5) * 0.005);
            setLongitude(target.longitude + (Math.random() - 0.5) * 0.005);
          }
          setIsLocating(false);
          setLocationSuccess(true);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Handle local image upload as data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const report = storage.submitReport({
      hazard_type: hazardType,
      barangay_id: barangayId,
      description: description.trim(),
      photo_url: photoUrl || undefined,
      latitude,
      longitude,
      reporter: currentUser,
      isOffline: !isOnline,
    });

    onReportSubmitted(report);
    onClose();

    // Reset fields
    setDescription('');
    setPhotoUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Submit Ground Hazard Report
              </h3>
              <p className="text-xs text-slate-500">
                Reporting as <span className="font-semibold text-slate-700">{currentUser.full_name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Warning Banner if disconnected */}
        {!isOnline && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-950">
            <WifiOff className="w-4 h-4 text-[#b91c1c] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Offline Resilience Active (PWA Caching)</p>
              <p className="text-red-900 text-[11px]">
                Your report will be safely saved in the device's local outbox and automatically uploaded to the central DRRM operations center as soon as connectivity resumes.
              </p>
            </div>
          </div>
        )}

        {/* Proximity / Duplicate Warning Banner */}
        {nearbyDuplicates.length > 0 && (
          <div className="mt-3 bg-slate-100 border border-slate-300 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-900">
            <Info className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">
                Existing {hazardType} Report Detected Nearby! ({nearbyDuplicates.length} active)
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                A matching hazard is already active in this area. You may still proceed with an independent report, or close and click <strong>"+1 Corroborate"</strong> on the existing report to help reach the 3-citizen threshold faster!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Hazard Category Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hazard Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'Flood' as HazardType, label: 'Flood', icon: <Droplet className="w-3.5 h-3.5" /> },
                { type: 'Downed Powerline' as HazardType, label: 'Powerline', icon: <Zap className="w-3.5 h-3.5" /> },
                { type: 'Road Obstruction' as HazardType, label: 'Road Block', icon: <Truck className="w-3.5 h-3.5" /> },
                { type: 'Storm Surge' as HazardType, label: 'Storm Surge', icon: <Wind className="w-3.5 h-3.5" /> },
                { type: 'Fire' as HazardType, label: 'Fire Incident', icon: <Flame className="w-3.5 h-3.5" /> },
                { type: 'Medical Emergency' as HazardType, label: 'Medical Aid', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                { type: 'Typhoon / Strong Winds' as HazardType, label: 'Gale Winds', icon: <Wind className="w-3.5 h-3.5" /> },
                { type: 'Landslide' as HazardType, label: 'Landslide', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setHazardType(item.type)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    hazardType === item.type
                      ? 'bg-red-50 border-[#b91c1c] text-[#b91c1c] ring-2 ring-red-500/20 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={hazardType === item.type ? 'text-[#b91c1c]' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location & GPS Coordinate Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Affected Barangay <span className="text-red-500">*</span>
              </label>
              <select
                value={barangayId}
                onChange={(e) => handleBarangayChange(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#b91c1c] focus:outline-hidden"
              >
                {barangays.map((b) => (
                  <option key={b.id} value={b.id}>
                    Brgy. {b.name} (Lingayen)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precise GPS Telemetry
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-100 rounded-lg px-2.5 py-2 text-[11px] font-mono text-slate-700 border border-slate-200 flex items-center justify-between">
                  <span>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                  {locationSuccess && <Check className="w-3.5 h-3.5 text-[#b91c1c]" />}
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="bg-[#b91c1c] hover:bg-[#991b1b] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                  title="Detect GPS from device"
                >
                  <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Get GPS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hazard Observation Details <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe landmark, severity, depth of water, road passability, or affected households..."
              rows={3}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#b91c1c] focus:outline-hidden"
            />
          </div>

          {/* Photographic Evidence Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Photographic Evidence (Optional)
            </label>

            {/* Custom File / Camera Input */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>Snap / Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-slate-400">or select situational preset:</span>
            </div>

            {/* Situation Presets for Prototyping */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPhotoUrl(preset.url);
                    setHazardType(preset.hazard as HazardType);
                  }}
                  className={`text-left rounded-lg overflow-hidden border transition text-[11px] cursor-pointer ${
                    photoUrl === preset.url
                      ? 'border-[#b91c1c] ring-2 ring-red-500/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-14 object-cover" />
                  <div className="p-1 bg-slate-50 font-medium text-slate-700 truncate">
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>

            {photoUrl && (
              <div className="mt-2 relative inline-block">
                <img
                  src={photoUrl}
                  alt="Selected preview"
                  className="w-24 h-16 object-cover rounded-md border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 text-xs shadow-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Broadcast Hazard Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
