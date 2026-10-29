# Spark Radar — Fleet Compliance & Renewal Management Platform

> **Vehicle-Centric Fleet Compliance Management SaaS for Indian Transport Operators**
> Built for Travel Agencies, Tourist Transports, Lorry/Goods Fleets, Tempo Travellers, and Taxi Fleets.

---

## 1. Product Architecture & Principles

- **Vehicle-Centric, Not Document-Centric**: Every vehicle workspace consolidates all its associated documents (RC, Insurance, PUC, Fitness Form 38, State/AITP Permits, Road Tax, Speed Governor), FASTag records, maintenance history, assigned drivers, and open renewal tasks.
- **Racing Sunset Brand Design System (Mandatory Pure Black Standard)**:
  - Golden Hour (Primary Brand & Navigation): `#E6B23C`
  - Sunlit Sand (Secondary Warm Accent): `#C7B394`
  - Steel Gray (Deep Solid Black): `#000000`
  - Shadow Black (Deep Solid Black): `#000000`
  - Graphite Drive (Subtle Dark Surface Contrast): `#1F2226`
  - Racing Stripe (Critical & Overdue Alerts): `#B41E2D`
  - Warm Ivory (Readable Light Surfaces): `#F7F6F0`
  - White (Card Elevation): `#FFFFFF`
  - Soft Neutral Border: `#E5E8E3`
  - Strictly prohibits navy, violet, purple, indigo, or neon colors. No emojis anywhere (Lucide SVG vector icons, GSAP animated typography, and original Tamil Nadu commercial vehicle illustrations exclusively).
- **GSAP & ScrollTrigger Cinematic Motion**:
  - Hero commercial red lorry reveal with coordinated typography timelines.
  - Interactive winding SVG road with scroll-linked dash progress and milestone storytelling.
  - Category showcase featuring Tamil Nadu goods lorries, auto-rickshaws, Tempo Travellers, tourist taxis, and coaches.
- **Five Primary Application Sections**:
  1. **Overview** (`/dashboard`): Persisted fleet compliance health, live overdue/due counts, and prioritized urgent actions.
  2. **Vehicles** (`/vehicles`): Card and table views, search, category filters, and single-click access to the Vehicle Workspace.
  3. **Renewals** (`/renewals`): Fleet-wide task queue, responsible assignees, and audit-preserving completion workflow.
  4. **Drivers** (`/drivers`): Driver profiles, commercial licence validity, PSV badge numbers, and vehicle assignments.
  5. **Settings** (`/settings`): Workspace customization, business types, RTO jurisdictions, and configurable warning thresholds (30, 15, 7, 1 days).

---

## 2. Production Security & Multi-Tenancy Architecture

Spark Radar is audited for multi-tenant isolation, data integrity, and strict access control:
- **Tenant Isolation**: Workspace context is established from `X-Workspace-Id` (or authorized query token on file downloads) and verified against the user's active database membership before any query executes. All resource queries (vehicles, documents, drivers, tasks, fastags, maintenance) enforce workspace filters.
- **Cross-Workspace Injection Defense**: Tasks and document attachments reject foreign `vehicle_id`, `driver_id`, or `document_id` references from outside the caller's workspace with HTTP 404.
- **File Upload Security & Magic Byte Validation**: Uploads are restricted to PDF, JPEG, and PNG under 10MB. File content is strictly verified against authentic binary magic byte signatures (`%PDF-`, `\xff\xd8\xff`, `\x89PNG\r\n\x1a\n`) rather than trusting extensions alone. Uploaded files have path sanitization and are checked against path traversal (`os.path.commonpath`).
- **Private Document Downloads**: Files are stored outside the public web root. File downloads require bearer token authorization (or cryptographically signed query token with workspace membership validation).
- **Rate Limiting**: In-memory sliding window rate limiter protects `/register`, `/login`, and `/forgot-password` against brute-force attacks (60 requests/minute per client IP).
- **Role-Based Authorization**: Hierarchical roles (`owner`, `admin`, `manager`, `staff`) enforced at the API route layer with custom dependency guards.

---

## 3. Expiry Engine & Renewal Workflow

- **Boundary Calculations**:
  - `delta > 30 days`: Valid (`ACTIVE`)
  - `0 < delta <= 30 days`: Approaching expiry (`DUE_SOON` / Amber warning badge)
  - `delta == 0`: Exact day of expiration (`"Expires today"`)
  - `delta == -1`: Overdue by 1 day (`"Expired 1 day ago"`)
  - `delta < -1`: Overdue (`"Expired X days ago"` / Red critical badge)
- **Superseded & Archived Records**:
  - Uploading a new document with `replaces_document_id` marks the antecedent document `is_superseded = True` and links `superseded_by_id`, preserving full historical audit trails while excluding old certificates from active obligations.
  - Archived vehicles are completely excluded from dashboard counts and active renewal alerts.
- **No False Validity**: Documents uploaded without an expiry date are marked `NO_EXPIRY` and never falsely categorized as compliant for mandatory compliance categories.

---

## 4. Quick Start (Local Development)

### Prerequisites
- Python 3.11+ (CPython 3.13 / 3.14 verified)
- Node.js 18+ (Node 24 verified)

### Starting the Backend
```bash
cd backend
# 1. Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python -m alembic upgrade head

# 4. Seed realistic Indian fleet demo data
python scripts\seed_demo.py

# 5. Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/api/v1/docs`

### Starting the Frontend
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
Web application: `http://localhost:5173`

---

## 5. Demo Credentials

The seeded database contains a fully populated operational transport business:
- **Email:** `demo@sparkradar.in`
- **Password:** `SparkRadar2026!`
- **Workspace:** Sahyadri Tourist Transports (Pune / Maharashtra)
- **Fleet:** 5 commercial vehicles (Force Tempo Traveller 3050, Toyota Innova Crysta, Tata Winger, Ashok Leyland Oyster 32-seater Bus, Maruti Ertiga CNG)
- **Active States:** Overdue insurance, PUC expiring in 8 days, valid AITP permits, FASTag records, and scheduled maintenance.

---

## 6. Automated Test Suite & Quality Verification

Run backend test suite with Pytest:
```bash
cd backend
.venv\Scripts\python -m pytest tests -v
```
*Current test suite: 12 tests across 8 test suites passing in ~11s.*

Build and type-check frontend:
```bash
cd frontend
npm.cmd run build
```
*Vite build: 0 errors, strict TypeScript mode.*

---

## 7. Backup, Restore & PostgreSQL Migration Path

### Database Backup (SQLite)
To generate an atomic, non-locking hot backup of the production database:
```bash
sqlite3 spark_radar.db "VACUUM INTO 'spark_radar_backup_$(date +%Y%m%d_%H%M%S).db';"
```
Back up the document storage folder in tandem:
```bash
tar -czf storage_backup_$(date +%Y%m%d).tar.gz backend/storage/
```

### PostgreSQL Migration Path
Spark Radar uses standard SQLAlchemy 2.0 and Alembic ORM mappings compatible with PostgreSQL:
1. Provision a PostgreSQL instance.
2. In `backend/.env`, set:
   ```env
   DATABASE_URL="postgresql+psycopg2://user:password@hostname:5432/spark_radar_db"
   ```
3. Run migrations on the new database:
   ```bash
   python -m alembic upgrade head
   ```
4. Transfer existing records using `pgloader` or export/import scripts.
