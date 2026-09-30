import React, { useState, useEffect, useMemo } from 'react';
import { storage } from './services/storage';
import { User, IncidentReport, EvacuationCenter, Advisory, Barangay } from './types';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { MetricCardsRow } from './components/MetricCardsRow';
import { MiddleSectionCharts } from './components/MiddleSectionCharts';
import { BottomSectionCharts } from './components/BottomSectionCharts';
import { DrillDownModal } from './components/DrillDownModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { TrendsDashboardView } from './components/TrendsDashboardView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { EmergencyAlertBanner } from './components/EmergencyAlertBanner';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { InteractiveMap } from './components/InteractiveMap';
import { HazardFeed } from './components/HazardFeed';
import { AdvisoryCenter } from './components/AdvisoryCenter';
import { EvacuationDirectory } from './components/EvacuationDirectory';
import { HotlineDirectory } from './components/HotlineDirectory';
import { AdminTriage } from './components/AdminTriage';
import { ReportModal } from './components/ReportModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { UnifiedAuthPortal } from './components/UnifiedAuthPortal';
import { AuthProfile } from './lib/supabaseClient';
import { OfflineSyncCenter } from './components/OfflineSyncCenter';
import { UsersDirectory } from './components/UsersDirectory';
import { AuditLogView } from './components/AuditLogView';
import { ResidentReliefView, ResidentGuidesView, ResidentFaqsView } from './components/ResidentContentTabs';
import { ResidentNotificationsView } from './components/ResidentNotificationsView';
import { ResidentHomeDraftView } from './components/ResidentHomeDraftView';
import { Radio, AlertTriangle, ShieldAlert, Heart, Info, X } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getActiveUser());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [topView, setTopView] = useState<'Overview' | 'Trends' | 'Analytics'>('Overview');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isAudioAlertEnabled, setIsAudioAlertEnabled] = useState<boolean>(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Drill Down Modal State
  const [drillDownState, setDrillDownState] = useState<{
    isOpen: boolean;
    filterType: string;
    filterValue: string;
  }>({
    isOpen: false,
    filterType: 'all',
    filterValue: 'all',
  });

  const [selectedIncidentForMap, setSelectedIncidentForMap] = useState<IncidentReport | null>(null);

  // Core Data State
  const [barangays, setBarangays] = useState(() => storage.getBarangays());
  const [reports, setReports] = useState(() => storage.getReports());
  const [advisories, setAdvisories] = useState(() => storage.getAdvisories());
  const [evacuationCenters, setEvacuationCenters] = useState(() => storage.getEvacuationCenters());
  const [hotlines, setHotlines] = useState(() => storage.getHotlines());
  const [outbox, setOutbox] = useState(() => storage.getOutbox());

  // Reload data from local storage whenever events fire
  const refreshData = () => {
    setBarangays(storage.getBarangays());
    setReports(storage.getReports());
    setAdvisories(storage.getAdvisories());
    setEvacuationCenters(storage.getEvacuationCenters());
    setHotlines(storage.getHotlines());
    setOutbox(storage.getOutbox());
    setCurrentUser(storage.getActiveUser());
  };

  useEffect(() => {
    const handleDataChange = () => refreshData();

    const handleOnline = () => {
      setIsOnline(true);
      storage.syncOutbox();
      refreshData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('uniguard_data_changed', handleDataChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('uniguard_data_changed', handleDataChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoginSuccess = (profile: AuthProfile) => {
    const updatedUser: User = {
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      role: profile.role,
      barangay_id: profile.barangayId || undefined,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    setActiveTab('overview');
    setTopView('Overview');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  // Open drill-down modal helper
  const handleOpenDrillDown = (filterType: string, filterValue: string) => {
    setDrillDownState({
      isOpen: true,
      filterType,
      filterValue,
    });
  };

  // Filtered reports by selected barangay if applicable
  const displayedReports = useMemo(() => {
    if (selectedBarangay === 'all') return reports;
    return reports.filter((r) => r.barangay_id === selectedBarangay);
  }, [reports, selectedBarangay]);

  // Filtered evacuation centers by selected barangay if applicable
  const displayedShelters = useMemo(() => {
    if (selectedBarangay === 'all') return evacuationCenters;
    return evacuationCenters.filter((c) => c.barangay_id === selectedBarangay);
  }, [evacuationCenters, selectedBarangay]);

  // GATEWAY LOGIN PORTAL (Phase 1 Gateway Screen - "dont change anything from the portal")
  if (!isAuthenticated) {
    return <UnifiedAuthPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#500A0F] via-[#5C0C12] to-[#630E14] text-slate-800 p-2 sm:p-4 lg:p-6 flex flex-col items-center justify-center font-sans antialiased selection:bg-[#991B1B] selection:text-white">
      {/* Primary Surface Frame: Large rounded container housing sidebar and workspace */}
      <div className="rounded-[32px] sm:rounded-[36px] bg-white shadow-2xl flex flex-col lg:flex-row w-full max-w-[1680px] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-3rem)] overflow-hidden border border-rose-950/20 relative">
        {/* Desktop Signature "Scooped" Navigation Sidebar */}
        <div className="hidden lg:flex shrink-0">
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'overview') setTopView('Overview');
            }}
            currentUser={currentUser}
            onUserChange={setCurrentUser}
            isOnline={isOnline}
            setIsOnline={setIsOnline}
            pendingOutboxCount={outbox.length}
            onSignOut={handleSignOut}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        </div>

        {/* Mobile Slide-Out Drawer Navigation Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sidebar drawer content */}
            <div className="relative w-72 max-w-[85vw] h-full flex flex-col z-10 animate-in slide-in-from-left duration-250">
              <DashboardSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileSidebarOpen(false);
                  if (tab === 'overview') setTopView('Overview');
                }}
                currentUser={currentUser}
                onUserChange={setCurrentUser}
                isOnline={isOnline}
                setIsOnline={setIsOnline}
                pendingOutboxCount={outbox.length}
                onSignOut={handleSignOut}
                onOpenReportModal={() => {
                  setIsMobileSidebarOpen(false);
                  setIsReportModalOpen(true);
                }}
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <div className="flex-1 min-w-0 bg-white flex flex-col overflow-y-auto">
          {/* Header Architecture */}
          <DashboardHeader
            topView={topView}
            setTopView={(view) => {
              setTopView(view);
              setActiveTab('overview');
            }}
            selectedBarangay={selectedBarangay}
            setSelectedBarangay={setSelectedBarangay}
            barangays={barangays}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
            isOnline={isOnline}
            totalActiveHazards={displayedReports.filter((r) => r.status !== 'resolved').length}
            currentUser={currentUser}
            onSignOut={handleSignOut}
            onUserChange={setCurrentUser}
            setActiveTab={setActiveTab}
          />

          {/* Emergency Alert Banner */}
          <EmergencyAlertBanner
            advisories={advisories}
            onViewAdvisories={() => {
              setActiveTab('advisories');
            }}
            isAudioAlertEnabled={isAudioAlertEnabled}
          />

          {/* Offline Sync Buffer Banner */}
          <OfflineSyncBanner
            isOnline={isOnline}
            pendingCount={outbox.length}
            onSyncCompleted={refreshData}
            onOpenOfflineCenter={() => setActiveTab('offline_sync')}
          />

          {/* Workspace Body Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* View 1: Main Dashboard (when activeTab is 'overview' or 'home') */}
            {(activeTab === 'overview' || activeTab === 'home') && (
              <>
                {currentUser.role === 'citizen' ? (
                  <ResidentHomeDraftView
                    currentUser={currentUser}
                    reports={displayedReports}
                    barangays={barangays}
                    evacuationCenters={displayedShelters}
                    advisories={advisories}
                    selectedBarangay={selectedBarangay}
                    onOpenReportModal={() => setIsReportModalOpen(true)}
                    onSelectIncidentForMap={(rep) => setSelectedIncidentForMap(rep)}
                    selectedIncidentForMap={selectedIncidentForMap}
                    setActiveTab={setActiveTab}
                    isOnline={isOnline}
                  />
                ) : (
                  <>
                    {topView === 'Overview' && (
                      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
                        {/* Top Row: Metric KPI Cards */}
                        <section aria-label="Key Performance Indicators">
                          <MetricCardsRow
                            reports={displayedReports}
                            evacuationCenters={displayedShelters}
                            advisories={advisories}
                            onSelectMetric={(metricId) => {
                              if (metricId === 'active_hazards') handleOpenDrillDown('active_hazards', 'all');
                              else if (metricId === 'verified_reports') handleOpenDrillDown('verified_reports', 'all');
                              else if (metricId === 'evacuation') setActiveTab('shelters');
                              else if (metricId === 'advisories') setActiveTab('advisories');
                              else if (metricId === 'hotlines') setActiveTab('hotlines');
                            }}
                          />
                        </section>

                        {/* Middle Section: Landscape Spotlight, Categorical Horizontal Bar, Vertical Column */}
                        <section aria-label="Pattern & Categorical Breakdowns">
                          <MiddleSectionCharts
                            reports={displayedReports}
                            barangays={barangays}
                            onSelectCategory={(cat) => handleOpenDrillDown('hazard', cat)}
                            onSelectBarangay={(bId) => {
                              setSelectedBarangay(bId);
                              handleOpenDrillDown('barangay', bId);
                            }}
                            onOpenDrillDown={handleOpenDrillDown}
                          />
                        </section>

                        {/* Bottom Section: 3 Equal-Width Structured Cards */}
                        <section aria-label="Structured Tier Distributions">
                          <BottomSectionCharts
                            reports={displayedReports}
                            evacuationCenters={displayedShelters}
                            onOpenDrillDown={handleOpenDrillDown}
                          />
                        </section>

                        {/* Geospatial Radar Map & Live Incident Triage Console */}
                        <section className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                <Radio className="w-5 h-5 text-[#991B1B] animate-pulse" />
                                <span>Geospatial Radar & Live Multi-Hazard Feed</span>
                              </h3>
                              <p className="text-xs text-slate-500">
                                Verified ground intelligence across all 18 Lingayen barangays
                              </p>
                            </div>
                          </div>

                          <InteractiveMap
                            barangays={barangays}
                            reports={displayedReports}
                            evacuationCenters={displayedShelters}
                            currentUser={currentUser}
                            onSelectReport={(rep) => setSelectedIncidentForMap(rep)}
                            onOpenReportModal={() => setIsReportModalOpen(true)}
                          />

                          <div className="pt-4">
                            <HazardFeed
                              reports={displayedReports}
                              barangays={barangays}
                              currentUser={currentUser}
                              onOpenReportModal={() => setIsReportModalOpen(true)}
                              onSelectOnMap={(rep) => {
                                setSelectedIncidentForMap(rep);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                            />
                          </div>
                        </section>
                      </div>
                    )}

                    {/* Top View: Trends */}
                    {topView === 'Trends' && (
                      <TrendsDashboardView
                        reports={displayedReports}
                        barangays={barangays}
                        onOpenDrillDown={handleOpenDrillDown}
                      />
                    )}

                    {/* Top View: Analytics */}
                    {topView === 'Analytics' && (
                      <AnalyticsDashboardView
                        reports={displayedReports}
                        barangays={barangays}
                        evacuationCenters={displayedShelters}
                        advisories={advisories}
                        onOpenDrillDown={handleOpenDrillDown}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {/* View 2: Dedicated Hazard Intelligence & Triage */}
            {activeTab === 'incidents' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <AdminTriage
                  reports={reports}
                  barangays={barangays}
                  currentUser={currentUser}
                  onReportsUpdated={refreshData}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectReport={(rep) => {
                    setSelectedIncidentForMap(rep);
                    setActiveTab('overview');
                  }}
                />
              </div>
            )}

            {/* View 3: Early Warning Advisories */}
            {activeTab === 'advisories' && (
              <div className="animate-in fade-in duration-200">
                <AdvisoryCenter
                  advisories={advisories}
                  currentUser={currentUser}
                  barangays={barangays}
                  onAdvisoryPublished={refreshData}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              </div>
            )}

            {/* View 4: Evacuation Centers */}
            {activeTab === 'shelters' && (
              <div className="animate-in fade-in duration-200">
                <EvacuationDirectory
                  evacuationCenters={evacuationCenters}
                  currentUser={currentUser}
                  barangays={barangays}
                  isOnline={isOnline}
                  onSelectOnMap={(center) => {
                    setActiveTab('overview');
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {/* View 5: Emergency Hotlines */}
            {activeTab === 'hotlines' && (
              <div className="animate-in fade-in duration-200">
                <HotlineDirectory
                  hotlines={hotlines}
                  barangays={barangays}
                  isOnline={isOnline}
                />
              </div>
            )}

            {/* View: Notifications */}
            {activeTab === 'notifications' && (
              <ResidentNotificationsView
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* View: Relief Goods & Distribution */}
            {activeTab === 'relief' && (
              <ResidentReliefView barangays={barangays} currentUser={currentUser} />
            )}

            {/* View: Emergency Preparedness Guides */}
            {activeTab === 'guides' && (
              <ResidentGuidesView />
            )}

            {/* View: Community FAQs */}
            {activeTab === 'faqs' && (
              <ResidentFaqsView />
            )}

            {/* View 6: Offline Sync Center */}
            {activeTab === 'offline_sync' && (
              <div className="animate-in fade-in duration-200">
                <OfflineSyncCenter
                  isOnline={isOnline}
                  setIsOnline={setIsOnline}
                  pendingOutboxCount={outbox.length}
                  hotlines={hotlines}
                  evacuationCenters={evacuationCenters}
                  advisories={advisories}
                  currentUser={currentUser}
                  onSyncCompleted={refreshData}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              </div>
            )}

            {/* View 7: Users & Personnel Directory */}
            {activeTab === 'users' && (
              <div className="animate-in fade-in duration-200">
                <UsersDirectory currentUser={currentUser} barangays={barangays} />
              </div>
            )}

            {/* View 8: Audit Log Trail */}
            {activeTab === 'audit_log' && (
              <div className="animate-in fade-in duration-200">
                <AuditLogView currentUser={currentUser} />
              </div>
            )}
          </main>

          {/* Refined Civic Workspace Footer */}
          <footer className="mt-auto border-t border-slate-100 py-4 px-6 sm:px-8 text-xs text-slate-500 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">UniGuard LDRRMC</span>
              <span>&bull;</span>
              <span className="text-[11px] text-slate-500">
                Lingayen Disaster Risk Reduction & Management Hub
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>PWA Offline-Ready</span>
              </span>
              <span>&bull;</span>
              <span>Province of Pangasinan</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Drill-Down Inspection Modal */}
      <DrillDownModal
        isOpen={drillDownState.isOpen}
        onClose={() => setDrillDownState({ ...drillDownState, isOpen: false })}
        filterType={drillDownState.filterType}
        filterValue={drillDownState.filterValue}
        reports={reports}
        barangays={barangays}
        onReportUpdated={refreshData}
      />

      {/* Export SITREP Summary Modal */}
      <ExportSummaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        reports={displayedReports}
        barangays={barangays}
        evacuationCenters={displayedShelters}
        advisories={advisories}
      />

      {/* Ground Report Submission Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        barangays={barangays}
        isOnline={isOnline}
        onReportSubmitted={refreshData}
      />

      {/* Supabase Hybrid Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* PWA In-App Install Prompt Banner */}
      <PWAInstallPrompt />
    </div>
  );
}
