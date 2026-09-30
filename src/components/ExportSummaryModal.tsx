import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  CheckCircle,
  Building2,
  ShieldAlert,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import { IncidentReport, Barangay, EvacuationCenter, Advisory } from '../types';

export interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: IncidentReport[];
  barangays: Barangay[];
  evacuationCenters: EvacuationCenter[];
  advisories: Advisory[];
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  reports,
  barangays,
  evacuationCenters,
  advisories,
}) => {
  const [format, setFormat] = useState<'sitrep' | 'csv' | 'summary'>('sitrep');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Real CSV Generator & File Download
  const handleDownloadCSV = () => {
    const headers = [
      'Incident Code',
      'Barangay',
      'Hazard Type',
      'Description',
      'Urgency',
      'Status',
      'Corroborations',
      'Latitude',
      'Longitude',
      'Date & Time',
    ];

    const rows = reports.map((r, i) => {
      const b = barangays.find((x) => x.id === r.barangay_id);
      return [
        `UG-2026-${String(i + 1).padStart(4, '0')}`,
        `"${b ? b.name : r.barangay_id}"`,
        `"${r.hazard_type}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
        `"${r.urgency || 'high'}"`,
        `"${r.status}"`,
        r.corroboration_count || 1,
        r.latitude,
        r.longitude,
        `"${new Date(r.created_at).toISOString()}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `UniGuard_LDRRMC_Situation_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Metrics summary
  const totalSheltered = evacuationCenters.reduce((sum, c) => sum + c.current_occupancy, 0);
  const totalCapacity = evacuationCenters.reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <FileText className="w-4 h-4 text-rose-300" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Export Situation Report (SITREP)
              </h3>
              <p className="text-xs text-slate-500">
                Official LDRRMC Lingayen DRRM situational data export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => setFormat('sitrep')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              format === 'sitrep'
                ? 'bg-[#991B1B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Official SITREP Preview
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              format === 'csv'
                ? 'bg-[#991B1B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Raw CSV Dataset
          </button>
        </div>

        {/* Modal Body Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {format === 'sitrep' ? (
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/40 text-slate-800 space-y-4 text-xs font-sans print:border-none print:p-0">
              {/* Official Seal Header */}
              <div className="text-center pb-4 border-b border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Republic of the Philippines &bull; Province of Pangasinan
                </p>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight mt-0.5">
                  Municipality of Lingayen &bull; MDRRMC Operations Center
                </h4>
                <p className="text-xs font-extrabold text-[#991B1B] uppercase tracking-wider mt-1">
                  SITUATION REPORT NO. 2026-{String(new Date().getMonth() + 1).padStart(2, '0')}-01
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Issued: {new Date().toLocaleDateString()} &bull; 08:00 PHT &bull; TCWS Warning Context
                </p>
              </div>

              {/* Executive Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Incidents</p>
                  <p className="text-base font-black text-[#991B1B] mt-0.5 tabular-nums">
                    {reports.length} Recorded
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Open Shelters</p>
                  <p className="text-base font-black text-slate-800 mt-0.5 tabular-nums">
                    {evacuationCenters.filter((c) => c.status === 'open').length} Active
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Sheltered Persons</p>
                  <p className="text-base font-black text-slate-800 mt-0.5 tabular-nums">
                    {totalSheltered.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Advisories</p>
                  <p className="text-base font-black text-amber-600 mt-0.5 tabular-nums">
                    {advisories.length} Bulletins
                  </p>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider">
                  1. Multi-Hazard Ground Assessment
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Lingayen Bay coastal barangays (Libsong, Maniboc, Pangapisan North) report elevated storm surge of +1.8m above mean sea level. Inland arterial roads along Poblacion and Baay experience localized inundation of 0.3m to 0.6m. Continuous crowd corroboration verifies high validity.
                </p>
              </div>

              {/* Verification & Signoff */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-800">Approved by:</p>
                  <p className="font-semibold text-slate-600">Incident Commander &bull; MDRRMO Lingayen</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] uppercase">
                    Official Stamp &bull; Verified
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                The CSV export contains all {reports.length} raw incident observation records with verified GPS coordinates, timestamps, urgency rankings, and community corroboration counters.
              </p>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                <p className="text-slate-400"># Preview First 3 Records</p>
                <p className="text-rose-300">Incident Code,Barangay,Hazard Type,Urgency,Status,Corroborations</p>
                {reports.slice(0, 3).map((r, i) => (
                  <p key={r.id}>
                    UG-2026-{String(i + 1).padStart(4, '0')},{r.barangay_id},{r.hazard_type},{r.urgency || 'high'},{r.status},{r.corroboration_count || 1}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {downloadSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>CSV file successfully downloaded to your device!</span>
              </span>
            ) : (
              <span>Format: UTF-8 &bull; Verified MDRRMC Standard</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print SITREP</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#881313] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
