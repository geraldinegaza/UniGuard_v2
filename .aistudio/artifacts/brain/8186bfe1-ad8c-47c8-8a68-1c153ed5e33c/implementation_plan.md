# UniGuard: Unified DRRM System Implementation Plan

## Executive Overview
**UniGuard** is an offline-resilient, role-based Disaster Risk Reduction and Management (DRRM) Progressive Web Application conceptualized for Local Disaster Risk Reduction and Management Councils (LDRRMC), specifically pre-configured for the Municipality of **Lingayen, Pangasinan**.

The system bridges grassroots citizen reports with area-scoped Barangay response units and city-wide LGU/LDRRMO oversight. It features automated **Crowd Corroboration** (auto-verifying incidents when 3+ independent reports match), sequential incident status tracking, offline PWA caching via IndexedDB and Service Workers, a dual-advisory broadcast system, and interactive evacuation and emergency directory management.

---

## 1. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                           Presentation Layer (PWA / React)                        |
|  - Citizen View (Mobile-First Hazard Reporting, Realtime Map, Evac & Hotline Hub)  |
|  - Barangay Official View (Jurisdiction-Scoped Report Queue, Local Triage & Evac) |
|  - LGU / LDRRMO Admin View (City-wide Analytics, Alert Broadcast, Cross-Barangay) |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                        Application & Business Logic Layer                         |
|  - Crowd Corroboration Engine (Haversine spatial proximity & 3+ corroboration)   |
|  - Incident Lifecycle State Machine (Reported -> Verified -> Dispatched -> Closed)|
|  - Dual-Advisory Engine (Critical Emergency Push Alerts vs Preparedness Drills)   |
|  - Role-Based Access Control (RBAC) & Active Persona Switcher                    |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                     Hybrid Offline & Persistence Layer                            |
|  - Offline-First Storage: Local IndexedDB / LocalStorage with Auto-Sync Queue     |
|  - Supabase Cloud Integration Client (Configurable URL/AnonKey with mock fallback)|
|  - Service Worker Cache: Evacuation directory & Emergency hotlines offline cache  |
|  - Geolocation API: Real-time GPS tagging with fallback Lingayen coordinate pins |
+-----------------------------------------------------------------------------------+
```

---

## 2. User Roles & RBAC Matrix

| Capability | Citizen | Barangay Official | LGU / LDRRMO Admin |
| :--- | :---: | :---: | :---: |
| **Submit Hazard Reports** (Photo, GPS, Details) | Yes | Yes | Yes |
| **Corroborate Existing Incident** (1-tap "+1 me too") | Yes | Yes | Yes |
| **View Live Hazard Feed & Interactive Map** | Yes | Yes | Yes |
| **Browse Evacuation Centers & Emergency Hotlines** | Yes (Offline) | Yes (Offline) | Yes (Offline) |
| **Area-Scoped Report Triage & Status Dispatching** | No | Yes (Assigned Barangay) | Yes (All Barangays) |
| **Manage Local Evacuation Center Status & Capacity**| No | Yes (Assigned Barangay) | Yes (All Barangays) |
| **Publish Official Emergency Alert Broadcast** | No | No | Yes (City-wide / Target) |
| **Post Disaster Preparedness Guides & Drills** | No | Yes (Local) | Yes (City-wide) |
| **Access City-Wide DRRM Analytics & Export Logs** | No | No | Yes |

---

## 3. Database Schema (Normalized 7 Core Entities)

1. **`users`**
   - `id`: UUID (PK)
   - `full_name`: Text
   - `email`: Text (Unique)
   - `role`: `'citizen' | 'barangay' | 'lgu_admin'`
   - `barangay_id`: FK -> `barangays.id` (nullable for LGU admin)
   - `created_at`: Timestamp

2. **`barangays`**
   - `id`: Text / UUID (PK) (e.g., `poblacion`, `maniboc`, `libsong`, `domalandan-east`, `domalandan-west`, `pangapisan-north`, `baay`)
   - `name`: Text
   - `city`: Text (Default: "Lingayen")
   - `coordinates`: `{ lat: number, lng: number }`

3. **`reports`**
   - `id`: UUID (PK)
   - `reporter_id`: FK -> `users.id`
   - `reporter_name`: Text
   - `barangay_id`: FK -> `barangays.id`
   - `hazard_type`: `'Flood' | 'Fire' | 'Landslide' | 'Storm Surge' | 'Downed Powerline' | 'Road Blockage' | 'Medical'`
   - `description`: Text
   - `photo_url`: Text (Supabase storage URL / DataURI / Curated situational photography)
   - `latitude`: Float
   - `longitude`: Float
   - `status`: `'unverified' | 'verified' | 'dispatched' | 'resolved'`
   - `corroboration_count`: Integer (Auto-incremented)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

4. **`corroborations`**
   - `id`: UUID (PK)
   - `report_id`: FK -> `reports.id`
   - `user_id`: FK -> `users.id`
   - `comment`: Text (Optional)
   - `created_at`: Timestamp

5. **`advisories`**
   - `id`: UUID (PK)
   - `author_id`: FK -> `users.id`
   - `author_name`: Text
   - `title`: Text
   - `content`: Text
   - `type`: `'emergency_alert' | 'preparedness'`
   - `severity`: `'low' | 'medium' | 'high' | 'critical'`
   - `target_barangay_id`: FK -> `barangays.id` (null = city-wide)
   - `created_at`: Timestamp

6. **`evacuation_centers`**
   - `id`: UUID (PK)
   - `barangay_id`: FK -> `barangays.id`
   - `name`: Text
   - `address`: Text
   - `capacity`: Integer
   - `current_occupancy`: Integer
   - `status`: `'open' | 'full' | 'closed'`
   - `facilities`: String[] (e.g. "Medical Clinic", "Generator Set", "Kitchen")
   - `contact_person`: Text
   - `contact_number`: Text

7. **`emergency_hotlines`**
   - `id`: UUID (PK)
   - `barangay_id`: FK -> `barangays.id` (null = Municipal/Provincial)
   - `agency_name`: Text
   - `contact_number`: Text
   - `alt_number`: Text
   - `scope`: `'Municipal' | 'Barangay' | 'Police' | 'Fire' | 'Hospital' | 'Red Cross'`
   - `priority`: Integer

---

## 4. Core Business Logic & Algorithms

### A. Crowd Corroboration Engine (Auto-Verification)
1. When a citizen submits a new report:
   - System checks existing active `unverified` reports of the **same `hazard_type`** in the **same `barangay_id`** or within **500 meters** (calculated via Haversine distance formula) reported within the last **3 hours**.
   - If an existing report matches, user is prompted: *"A similar hazard was recently reported nearby. Did you mean to corroborate this report?"* or they can submit an independent corroboration.
2. In-Feed Corroboration:
   - Any citizen within proximity can click **"Corroborate / I Can Confirm This"** (+1 validation).
   - If `corroboration_count >= 3`, the status automatically upgrades from `unverified` $\rightarrow$ `verified` immediately.
   - Logs an audit entry: *"System auto-verified via 3 independent citizen confirmations."*

### B. Incident State Machine
- `unverified` $\rightarrow$ `verified` (via Crowd Corroboration or Barangay/LGU Admin manual verification)
- `verified` $\rightarrow$ `dispatched` (Barangay or LGU assigns team, e.g. BDRRMC Quick Response Unit or Bureau of Fire Protection)
- `dispatched` $\rightarrow$ `resolved` (Incident cleared with resolution notes and timestamp)

### C. Offline Resilience & Service Worker PWA
- Uses IndexedDB (with `localStorage` fallback) to store cached copies of:
  - All Evacuation Centers & current capacity
  - Complete Lingayen Emergency Hotline Directory
  - Latest advisories & active alerts
- Offline Report Queuing: If a citizen submits a report without network access, it is stored in the local `outbox_reports` store with GPS telemetry and synced automatically once connection is restored.
- In-app Service Worker registration with PWA install banner.

---

## 5. User Interface & Design System

- **Visual Theme:** Clean modern civic portal light theme with high-contrast emergency banners (Red for Critical, Amber for Severe, Blue for Info, Green for Open/Safe).
- **Navigation Structure:**
  1. **Top Bar:** Municipal crest / UniGuard logo ("Lingayen DRRMC"), emergency broadcast ticker, network connection indicator (`Online` / `Offline Cached`), and Persona Switcher (quick toggle between *Citizen (Juan)*, *Barangay Official (Poblacion)*, *LDRRMO Admin (City Officer)*).
  2. **Main Tabs:**
     - 🚨 **Live Feed & Map:** Real-time incident list with filtering (hazard type, status, barangay), interactive radar/map with pins, and instant report modal.
     - 📢 **Advisories & Alerts:** Official warning bulletins, signal warning levels, and disaster preparedness guides (typhoon prep, earthquake drill schedule).
     - 🏫 **Evacuation Centers:** Live center card grid with progress bars for occupancy, filter by open/available, turn-by-turn directions trigger.
     - 📞 **Hotlines:** One-touch direct dialing cards categorized by Municipal DRRM, PNP Lingayen, BFP Fire Station, Provincial Hospital, and Barangay desks.
     - 📊 **Command & Analytics (Admin view):** Triage queue, status dispatcher, corroboration audits, and incident breakdown charts.

---

## 6. Implementation Stages & Next Steps

1. **Phase 1: Foundation & Data Stores**
   - Set up TypeScript definitions for all 7 ERD entities.
   - Pre-populate rich mock datasets for Lingayen, Pangasinan (Poblacion, Maniboc, Libsong, Domalandan, Pangapisan, Baay) with realistic hotlines, evacuation shelters, and reports.
   - Implement IndexedDB/Local storage engine with offline sync capabilities.

2. **Phase 2: Core Components & Logic Modules**
   - Incident Reporting form with live GPS retrieval, photo attachment/preview, and hazard classification.
   - Crowd Corroboration Engine with Haversine radius matching and automated status promotion.
   - Sequential Incident Status Tracking modal for barangay/LGU officials.

3. **Phase 3: Advisory Broadcast & Evacuation Directory**
   - Dual-advisory creation modal for LGU personnel (Emergency Broadcast vs Preparedness Advice).
   - High-visibility emergency alert banners and simulated push notifications.
   - Evacuation center capacity management & hotline directory with instant search/filter.

4. **Phase 4: Admin Dashboard & PWA Manifest**
   - City-wide DRRM Analytics dashboard with incident frequency metrics, response times, and status distributions.
   - PWA manifest, service worker registration, and offline readiness banner.

---

*Please click **Proceed** to authorize starting development based on this blueprint.*
