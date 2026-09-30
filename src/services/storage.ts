import {
  Barangay,
  User,
  IncidentReport,
  Corroboration,
  Advisory,
  EvacuationCenter,
  EmergencyHotline,
  SystemAuditLog,
  IncidentStatus,
  EvacuationStatus,
  AdvisorySeverity,
  AdvisoryType,
  HazardType
} from '../types';
import {
  INITIAL_BARANGAYS,
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_CORROBORATIONS,
  INITIAL_ADVISORIES,
  INITIAL_EVACUATION_CENTERS,
  INITIAL_HOTLINES,
  INITIAL_AUDIT_LOGS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'uniguard_users_v1',
  BARANGAYS: 'uniguard_barangays_v1',
  REPORTS: 'uniguard_reports_v1',
  CORROBORATIONS: 'uniguard_corroborations_v1',
  ADVISORIES: 'uniguard_advisories_v1',
  EVACUATION_CENTERS: 'uniguard_evac_v1',
  HOTLINES: 'uniguard_hotlines_v1',
  AUDIT_LOGS: 'uniguard_audit_logs_v1',
  OUTBOX: 'uniguard_offline_outbox_v1',
  CURRENT_USER_ID: 'uniguard_active_user_id',
  SUPABASE_CONFIG: 'uniguard_supabase_config',
};

// Haversine formula to compute distance in meters between two lat/lng points
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

class StorageService {
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.BARANGAYS)) {
      localStorage.setItem(STORAGE_KEYS.BARANGAYS, JSON.stringify(INITIAL_BARANGAYS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CORROBORATIONS)) {
      localStorage.setItem(STORAGE_KEYS.CORROBORATIONS, JSON.stringify(INITIAL_CORROBORATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADVISORIES)) {
      localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(INITIAL_ADVISORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVACUATION_CENTERS)) {
      localStorage.setItem(STORAGE_KEYS.EVACUATION_CENTERS, JSON.stringify(INITIAL_EVACUATION_CENTERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOTLINES)) {
      localStorage.setItem(STORAGE_KEYS.HOTLINES, JSON.stringify(INITIAL_HOTLINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OUTBOX)) {
      localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr_citizen_1');
    }

    this.isInitialized = true;
  }

  public resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.BARANGAYS, JSON.stringify(INITIAL_BARANGAYS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    localStorage.setItem(STORAGE_KEYS.CORROBORATIONS, JSON.stringify(INITIAL_CORROBORATIONS));
    localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(INITIAL_ADVISORIES));
    localStorage.setItem(STORAGE_KEYS.EVACUATION_CENTERS, JSON.stringify(INITIAL_EVACUATION_CENTERS));
    localStorage.setItem(STORAGE_KEYS.HOTLINES, JSON.stringify(INITIAL_HOTLINES));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr_citizen_1');
    this.notifyChange();
  }

  private notifyChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('uniguard_data_changed'));
    }
  }

  // --- Users & Current Active Persona ---
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  public getActiveUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr_citizen_1';
  }

  public setActiveUserId(userId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    this.notifyChange();
  }

  public getActiveUser(): User {
    const users = this.getUsers();
    const id = this.getActiveUserId();
    return users.find((u) => u.id === id) || users[0];
  }

  // --- Barangays ---
  public getBarangays(): Barangay[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BARANGAYS);
    if (!raw) return INITIAL_BARANGAYS;
    try {
      const parsed: Barangay[] = JSON.parse(raw);
      const existingIds = new Set(parsed.map((b) => b.id));
      const missing = INITIAL_BARANGAYS.filter((b) => !existingIds.has(b.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEYS.BARANGAYS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_BARANGAYS;
    }
  }

  // --- Incident Reports ---
  public getReports(): IncidentReport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) return INITIAL_REPORTS;
    try {
      const parsed: IncidentReport[] = JSON.parse(raw);
      const existingIds = new Set(parsed.map((r) => r.id));
      const missing = INITIAL_REPORTS.filter((r) => !existingIds.has(r.id));
      if (missing.length > 0) {
        const merged = [...missing, ...parsed];
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_REPORTS;
    }
  }

  public getReportById(id: string): IncidentReport | undefined {
    return this.getReports().find((r) => r.id === id);
  }

  // Check for nearby matching unverified reports (for duplicate detection & crowd corroboration prompts)
  public findNearbySimilarReports(hazardType: HazardType, lat: number, lng: number, maxMeters = 800): IncidentReport[] {
    const reports = this.getReports();
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;

    return reports.filter((r) => {
      if (r.status === 'resolved') return false;
      if (r.hazard_type !== hazardType) return false;
      const reportTime = new Date(r.created_at).getTime();
      if (reportTime < threeHoursAgo) return false;
      const dist = calculateDistanceMeters(lat, lng, r.latitude, r.longitude);
      return dist <= maxMeters;
    });
  }

  public submitReport(reportData: {
    hazard_type: HazardType;
    barangay_id: string;
    description: string;
    photo_url?: string;
    latitude: number;
    longitude: number;
    reporter: User;
    isOffline?: boolean;
  }): IncidentReport {
    const newReport: IncidentReport = {
      id: `rep_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      reporter_id: reportData.reporter.id,
      reporter_name: reportData.reporter.full_name,
      barangay_id: reportData.barangay_id,
      hazard_type: reportData.hazard_type,
      description: reportData.description,
      photo_url: reportData.photo_url,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      status: 'unverified',
      corroboration_count: 1, // First report counts as 1
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_offline_synced: !reportData.isOffline,
    };

    if (reportData.isOffline) {
      // Add to offline outbox
      const outbox = this.getOutbox();
      outbox.push(newReport);
      localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(outbox));
      this.notifyChange();
      return newReport;
    }

    // Normal save
    const reports = this.getReports();
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Register initial corroboration
    this.addCorroborationEntry(newReport.id, reportData.reporter.id, reportData.reporter.full_name, 'Primary incident report logged with GPS coordinates.');

    this.notifyChange();
    return newReport;
  }

  // --- Crowd Corroboration Engine ---
  public getCorroborations(): Corroboration[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CORROBORATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public getCorroborationsForReport(reportId: string): Corroboration[] {
    return this.getCorroborations().filter((c) => c.report_id === reportId);
  }

  private addCorroborationEntry(reportId: string, userId: string, userName: string, comment?: string) {
    const list = this.getCorroborations();
    list.push({
      id: `corrob_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      report_id: reportId,
      user_id: userId,
      user_name: userName,
      created_at: new Date().toISOString(),
      comment,
    });
    localStorage.setItem(STORAGE_KEYS.CORROBORATIONS, JSON.stringify(list));
  }

  public corroborateReport(
    reportId: string,
    user: User,
    comment?: string
  ): { success: boolean; newCount: number; autoVerified: boolean; message: string } {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) {
      return { success: false, newCount: 0, autoVerified: false, message: 'Report not found' };
    }

    const report = reports[index];
    const existing = this.getCorroborationsForReport(reportId);
    const alreadyCorroborated = existing.some((c) => c.user_id === user.id);

    if (alreadyCorroborated) {
      return {
        success: false,
        newCount: report.corroboration_count,
        autoVerified: false,
        message: 'You have already corroborated this incident report.',
      };
    }

    // Add corroboration record
    this.addCorroborationEntry(reportId, user.id, user.full_name, comment || 'Citizen verified condition on site.');

    // Increment count
    report.corroboration_count += 1;
    report.updated_at = new Date().toISOString();

    let autoVerified = false;
    // CROWD CORROBORATION RULE: 3+ independent citizens automatically upgrades status to 'verified'
    if (report.status === 'unverified' && report.corroboration_count >= 3) {
      report.status = 'verified';
      autoVerified = true;

      // Add audit log
      this.addAuditLog({
        event_type: 'crowd_corroboration_auto_verify',
        actor_name: 'Crowd Corroboration Engine',
        description: `Hazard #${report.id.substring(0, 8)} (${report.hazard_type}) automatically verified after reaching ${report.corroboration_count} citizen confirmations in ${report.barangay_id}.`,
        target_id: report.id,
      });
    }

    reports[index] = report;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    this.notifyChange();

    return {
      success: true,
      newCount: report.corroboration_count,
      autoVerified,
      message: autoVerified
        ? 'Report successfully corroborated and auto-verified by 3 citizen confirmations!'
        : 'Thank you for corroborating this report.',
    };
  }

  // --- Incident Status State Machine Transitions ---
  public updateIncidentStatus(
    reportId: string,
    newStatus: IncidentStatus,
    actor: User,
    metadata?: {
      assigned_team?: string;
      dispatch_notes?: string;
      resolution_notes?: string;
    }
  ): { success: boolean; message: string } {
    const reports = this.getReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) return { success: false, message: 'Report not found' };

    const report = reports[index];
    report.status = newStatus;
    report.updated_at = new Date().toISOString();

    if (metadata?.assigned_team) report.assigned_team = metadata.assigned_team;
    if (metadata?.dispatch_notes) report.dispatch_notes = metadata.dispatch_notes;
    if (metadata?.resolution_notes) {
      report.resolution_notes = metadata.resolution_notes;
      report.resolved_at = new Date().toISOString();
    }

    // Log audit
    let eventType: SystemAuditLog['event_type'] = 'status_dispatch';
    if (newStatus === 'resolved') eventType = 'status_resolve';

    this.addAuditLog({
      event_type: eventType,
      actor_name: `${actor.full_name} (${actor.role.toUpperCase()})`,
      description: `Transitioned Report #${report.id.substring(0, 8)} to ${newStatus.toUpperCase()}.${
        metadata?.assigned_team ? ` Assigned to: ${metadata.assigned_team}.` : ''
      }`,
      target_id: report.id,
    });

    reports[index] = report;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    this.notifyChange();

    return { success: true, message: `Status updated to ${newStatus}` };
  }

  // --- Advisories ---
  public getAdvisories(): Advisory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ADVISORIES);
    if (!raw) return INITIAL_ADVISORIES;
    try {
      const parsed: Advisory[] = JSON.parse(raw);
      const existingIds = new Set(parsed.map((a) => a.id));
      const missing = INITIAL_ADVISORIES.filter((a) => !existingIds.has(a.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_ADVISORIES;
    }
  }

  public publishAdvisory(data: {
    title: string;
    content: string;
    type: AdvisoryType;
    severity: AdvisorySeverity;
    target_barangay_id: string | null;
    author: User;
  }): Advisory {
    const advisories = this.getAdvisories();
    const newAdv: Advisory = {
      id: `adv_${Date.now().toString(36)}`,
      author_id: data.author.id,
      author_name: data.author.full_name,
      title: data.title,
      content: data.content,
      type: data.type,
      severity: data.severity,
      target_barangay_id: data.target_barangay_id,
      created_at: new Date().toISOString(),
    };

    advisories.unshift(newAdv);
    localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(advisories));

    // Audit log
    this.addAuditLog({
      event_type: 'emergency_broadcast',
      actor_name: data.author.full_name,
      description: `Broadcasted ${data.severity.toUpperCase()} advisory: "${data.title}" (${
        data.target_barangay_id ? `Target: Brgy. ${data.target_barangay_id}` : 'City-wide Lingayen'
      })`,
      target_id: newAdv.id,
    });

    this.notifyChange();
    return newAdv;
  }

  // --- Evacuation Centers ---
  public getEvacuationCenters(): EvacuationCenter[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EVACUATION_CENTERS);
    if (!raw) return INITIAL_EVACUATION_CENTERS;
    try {
      const parsed: EvacuationCenter[] = JSON.parse(raw);
      // Ensure the official 5 draft shelters are prioritized and have their updated metadata
      const hasUpdatedDraft = parsed.some((c) => c.name === 'Libsong Elementary School');
      if (!hasUpdatedDraft) {
        localStorage.setItem(STORAGE_KEYS.EVACUATION_CENTERS, JSON.stringify(INITIAL_EVACUATION_CENTERS));
        return INITIAL_EVACUATION_CENTERS;
      }
      return parsed;
    } catch {
      return INITIAL_EVACUATION_CENTERS;
    }
  }

  public addEvacuationCenter(center: Omit<EvacuationCenter, 'id'>): EvacuationCenter {
    const centers = this.getEvacuationCenters();
    const newCenter: EvacuationCenter = {
      id: `evac_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      ...center,
    };
    centers.unshift(newCenter);
    localStorage.setItem(STORAGE_KEYS.EVACUATION_CENTERS, JSON.stringify(centers));

    this.addAuditLog({
      event_type: 'offline_sync',
      actor_name: 'LDRRMO Command Center',
      description: `Registered new evacuation shelter: "${newCenter.name}" in Brgy. ${newCenter.barangay_id} (Capacity: ${newCenter.capacity})`,
      target_id: newCenter.id,
    });

    this.notifyChange();
    return newCenter;
  }

  public updateEvacuationCenter(
    id: string,
    updates: Partial<Pick<EvacuationCenter, 'status' | 'current_occupancy' | 'capacity'>>
  ): boolean {
    const centers = this.getEvacuationCenters();
    const index = centers.findIndex((c) => c.id === id);
    if (index === -1) return false;

    centers[index] = { ...centers[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EVACUATION_CENTERS, JSON.stringify(centers));
    this.notifyChange();
    return true;
  }

  // --- Emergency Hotlines ---
  public getHotlines(): EmergencyHotline[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HOTLINES);
    if (!raw) return INITIAL_HOTLINES;
    try {
      const parsed: EmergencyHotline[] = JSON.parse(raw);
      const hasDraftHotlines = parsed.some((h) => h.agency_name === 'BFP Lingayen');
      if (!hasDraftHotlines || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.HOTLINES, JSON.stringify(INITIAL_HOTLINES));
        return INITIAL_HOTLINES;
      }
      return parsed.map((h) => {
        if (h.tag && h.tag.toUpperCase() === 'CITYWIDE') {
          const { tag, ...rest } = h;
          return rest;
        }
        return h;
      });
    } catch {
      return INITIAL_HOTLINES;
    }
  }

  // --- Audit Logs ---
  public getAuditLogs(): SystemAuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public addAuditLog(entry: Omit<SystemAuditLog, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
    this.notifyChange();
  }

  // --- Offline Outbox Management ---
  public getOutbox(): IncidentReport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OUTBOX);
    return raw ? JSON.parse(raw) : [];
  }

  public syncOutbox(): { syncedCount: number } {
    const outbox = this.getOutbox();
    if (outbox.length === 0) return { syncedCount: 0 };

    const reports = this.getReports();
    for (const item of outbox) {
      item.is_offline_synced = true;
      reports.unshift(item);
      this.addCorroborationEntry(item.id, item.reporter_id, item.reporter_name, 'Synced from citizen offline cache.');
    }

    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify([]));

    this.addAuditLog({
      event_type: 'offline_sync',
      actor_name: 'Service Worker Sync Agent',
      description: `Flushed ${outbox.length} offline incident report(s) from local storage to live feed.`,
      target_id: 'outbox_batch',
    });

    this.notifyChange();
    return { syncedCount: outbox.length };
  }

  // --- Supabase Config Helper ---
  public getSupabaseConfig(): { url: string; anonKey: string; isConnected: boolean } {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (!raw) {
      return {
        url: '',
        anonKey: '',
        isConnected: false,
      };
    }
    return JSON.parse(raw);
  }

  public setSupabaseConfig(config: { url: string; anonKey: string; isConnected: boolean }) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
    this.notifyChange();
  }
}

export const storage = new StorageService();
