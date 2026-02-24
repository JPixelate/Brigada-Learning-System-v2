<div align="center">
  <img width="1200" height="475" alt="BLS Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1>Brigada Learning System v2</h1>
  <p>MIS-Grade Learning Management System — Admin Panel & Employee Portal</p>
</div>

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Requirements](#3-system-requirements)
4. [Environment Variables](#4-environment-variables)
5. [Local Development Setup](#5-local-development-setup)
6. [Staging Deployment](#6-staging-deployment)
7. [Production Deployment](#7-production-deployment)
8. [Database Initialization](#8-database-initialization)
9. [External Services Setup](#9-external-services-setup)
10. [Roles & Permissions](#10-roles--permissions)
11. [Feature Reference](#11-feature-reference)
12. [API Reference](#12-api-reference)

---

## 1. System Overview

The **Brigada Learning System v2** is an enterprise-grade Learning Management System (LMS) designed for managing workforce training, evaluations, certifications, and reporting across multiple business units.

The system is split into two user-facing portals:

| Portal | Path | Audience |
|---|---|---|
| Admin Panel | `/admin/*` | Super Admin, Instructor |
| Employee Portal | `/employee/*` | Employee |

The backend is a standalone **Express.js** server that communicates with **Supabase** (PostgreSQL) for all persistent data and **AWS S3** for file/media storage.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Routing | React Router DOM v7 |
| UI Components | Lucide React, custom components |
| Charts & Analytics | Recharts |
| Drag & Drop | dnd-kit |
| Video Processing | FFmpeg (WASM) |
| AI Module Generation | Google Gemini API (`@google/genai`) |
| Backend | Express.js 5 (Node.js ESM) |
| Database | Supabase (PostgreSQL) |
| File Storage | AWS S3 |
| Email | Nodemailer (SMTP) |
| Process Manager (dev) | Nodemon |
| Process Manager (prod) | PM2 _(recommended)_ |

---

## 3. System Requirements

### Minimum Server Specs (Production)

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPUs | 4 vCPUs |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### Runtime Dependencies

| Dependency | Version | Notes |
|---|---|---|
| Node.js | >= 18.x | LTS recommended; v20+ preferred |
| npm | >= 9.x | Bundled with Node.js |
| Git | any | For deployment via repository |

### External Service Accounts Required

| Service | Purpose | Required? |
|---|---|---|
| **Supabase** | Primary database (PostgreSQL) | **Yes** |
| **AWS S3** | File & media storage (videos, images, docs) | **Yes** |
| **Google Gemini API** | AI-powered module generation | **Yes** |
| **SMTP Provider** | Email notifications (e.g., Gmail, Zoho, Resend) | **Yes** |

### Network / Firewall Requirements

| Port | Direction | Purpose |
|---|---|---|
| 3000 | Inbound | Vite dev server (dev only) |
| 5000 | Inbound | Express backend API |
| 80 / 443 | Inbound | Nginx reverse proxy (staging/prod) |
| 5432 | Outbound | Supabase PostgreSQL direct connection |
| 465 or 587 | Outbound | SMTP email sending |

---

## 4. Environment Variables

There are **two separate `.env` files** — one for the frontend (root) and one for the backend server.

---

### 4.1 Root `.env` — Frontend (Vite)

Create a file named `.env` in the **project root**:

```env
# Google Gemini API (AI Module Generation)
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** Vite exposes this via `process.env.GEMINI_API_KEY` in the frontend build. Never put Supabase service role keys here.

---

### 4.2 `server/.env` — Backend (Express)

Create a file named `.env` inside the **`server/`** directory:

```env
# ── Server ────────────────────────────────────────────
PORT=5000

# ── Supabase (JS Client — service role for admin bypass) ──
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ── Supabase Direct PostgreSQL (used for schema init) ──
SUPABASE_DB_HOST=db.your-project-id.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_DATABASE=postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your_supabase_db_password

# ── AWS S3 (File Storage) ──────────────────────────────
S3_REGION=ap-southeast-1
S3_BUCKET_NAME=your-s3-bucket-name
S3_ACCESS_KEY_ID=your_aws_access_key_id
S3_SECRET_ACCESS_KEY=your_aws_secret_access_key

# ── Email / SMTP ───────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

> **Security:** The `server/.env` file contains the Supabase **service role key** which bypasses Row Level Security. It must **never** be committed, exposed in logs, or served to the frontend.

---

## 5. Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/JPixelate/Brigada-Learning-System-v2.git
cd Brigada-Learning-System-v2

# 2. Install frontend dependencies
npm install

# 3. Install backend server dependencies
cd server && npm install && cd ..

# 4. Create environment files (see Section 4)
cp .env.example .env
cp server/.env.example server/.env
# → Fill in your credentials

# 5. Run both frontend and backend concurrently
npm run dev:all
```

| Script | What it runs |
|---|---|
| `npm run dev:client` | Vite frontend only → http://localhost:3000 |
| `npm run dev:server` | Express backend only → http://localhost:5000 |
| `npm run dev:all` | Both concurrently via `concurrently` |

> On first run, initialize the database schema. See [Section 8](#8-database-initialization).

---

## 6. Staging Deployment

Staging mirrors production but uses **separate Supabase project** and **S3 bucket** to avoid polluting live data.

### 6.1 Server Setup

```bash
# Install Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Clone the repository
git clone https://github.com/JPixelate/Brigada-Learning-System-v2.git
cd Brigada-Learning-System-v2

# Install all dependencies
npm install
cd server && npm install && cd ..
```

### 6.2 Configure Environment

Create `.env` (root) and `server/.env` with staging credentials (separate Supabase project, separate S3 bucket).

### 6.3 Build the Frontend

```bash
npm run build
# Output: dist/ folder (static assets)
```

### 6.4 Start the Backend with PM2

```bash
cd server
pm2 start server.js --name "bls-backend-staging" --env staging
pm2 save
pm2 startup
```

### 6.5 Serve Frontend via Nginx

Install Nginx and create a site config:

```nginx
server {
    listen 80;
    server_name staging.yourdomain.com;

    # Serve the built React app
    root /path/to/Brigada-Learning-System-v2/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Express backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. Production Deployment

Production follows the same steps as staging with these additional hardening steps.

### 7.1 Enable HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 7.2 Nginx Production Config

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /path/to/Brigada-Learning-System-v2/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 7.3 Start Backend with PM2

```bash
cd server
pm2 start server.js --name "bls-backend-prod"
pm2 save
pm2 startup
```

### 7.4 Update Vite Base URL (if deploying to a subdirectory)

Edit `vite.config.ts` and add `base: '/your-path/'` if not deploying at the domain root.

### 7.5 CI/CD Deployment Script (Optional)

```bash
#!/bin/bash
# deploy.sh — run on the server after a git pull

git pull origin main
npm install
cd server && npm install && cd ..
npm run build
pm2 restart bls-backend-prod
echo "✅ Deployment complete"
```

---

## 8. Database Initialization

The database schema is defined in `supabase_schema.sql`. On a fresh deployment, run the schema via the built-in admin endpoint:

```bash
# Ensure the backend server is running first
curl -X POST http://localhost:5000/api/admin/init-db
```

This will:
1. Connect directly to your Supabase PostgreSQL instance via `pg`
2. Execute the full `supabase_schema.sql` script
3. Create all tables, indexes, and RLS policies

> **Warning:** This endpoint is destructive if run on an existing database. Only use on a fresh Supabase project. Protect or remove this endpoint after initial setup.

### Tables Created

| Table | Description |
|---|---|
| `employees` | All users (admin, instructor, employee) |
| `modules` | Training modules/courses |
| `enrollments` | Employee-to-module enrollments with progress |
| `learning_paths` | Curated sequences of modules |
| `learning_path_enrollments` | Employee learning path progress |
| `component_progress` | Granular per-component completion tracking |
| `quiz_attempts` | Quiz scores and attempt history |
| `module_evaluations` | Instructor evaluations per enrollment |
| `announcements` | System-wide announcements |
| `notifications` | Per-user notifications |
| `messages` | Internal messaging between users |
| `calendar_events` | Scheduled learning events |
| `roles` | Role definitions and permissions |
| `settings_sections` | Admin-configurable system settings |
| `certificates` | Certificate templates |
| `employee_certificates` | Issued certificates per employee |

---

## 9. External Services Setup

### 9.1 Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings → Database** and copy:
   - Host → `SUPABASE_DB_HOST`
   - Password → `SUPABASE_DB_PASSWORD`

### 9.2 AWS S3

1. Create an S3 bucket in your preferred region
2. Set bucket policy to allow `PutObject` for your IAM user
3. Create an IAM user with `AmazonS3FullAccess` (or scoped policy)
4. Copy **Access Key ID** and **Secret Access Key** into `server/.env`
5. Files are uploaded under the path: `Brigada Learning System/{folder}/{timestamp}-{filename}`

### 9.3 Google Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. Add it to the root `.env` as `GEMINI_API_KEY`
4. Used for AI-assisted module content generation

### 9.4 SMTP Email

The system sends emails via Nodemailer on port 465 (SSL).

**Gmail example:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password** under Security → App Passwords
3. Use that app password as `SMTP_PASS` (not your real password)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_16_char_app_password
```

---

## 10. Roles & Permissions

| Role | Access Level | Capabilities |
|---|---|---|
| **Super Admin** | Full Access | All admin features, user management, settings, DB init |
| **Instructor** | Elevated | Create & grade modules, view evaluations, manage enrolled employees |
| **Employee** | Restricted | View & complete enrolled modules, take quizzes, download certificates |

Role assignments are managed in the **Admin Panel → Manage Role** page and stored in the `roles` table in Supabase.

---

## 11. Feature Reference

### Admin Panel (`/admin/*`)

| Feature | Route | Description |
|---|---|---|
| Dashboard | `/admin` | KPI stats, charts, activity trends |
| Learning Paths | `/admin/learning-paths` | Create and manage module sequences |
| Create Module | `/admin/create-module` | AI-assisted module builder with video support |
| Manage Modules | `/admin/modules` | View, edit, publish modules |
| Certificates | `/admin/certificates` | Certificate template management |
| Employees | `/admin/employees` | User directory and management |
| Manage Role | `/admin/manage-role` | Role-based access configuration |
| Access Restrictions | `/admin/restricted` | Restrict specific employee profiles |
| Messages | `/admin/messages` | Internal messaging system |
| Announcements | `/admin/announcements` | Broadcast announcements to employees |
| Calendar | `/admin/calendar` | Schedule learning events |
| Progress Report | `/admin/reports/progress` | Employee learning progress analytics |
| Retake Report | `/admin/reports/retake` | Module retake statistics |
| Completion Report | `/admin/reports/completion` | Completion rates by module/department |
| Settings | `/admin/settings` | System-wide configuration |

### Employee Portal (`/employee/*`)

| Feature | Description |
|---|---|
| Dashboard | Personal learning stats and activity |
| My Courses | Enrolled modules with progress |
| My Learning Paths | Curated path progress |
| Course Viewer | Interactive module player (video, quiz, reading) |
| Evaluation Status | View evaluation results from instructors |
| My Certificates | Download issued certificates |
| Announcements | View system announcements |
| Messages | Internal messaging |
| Calendar | View scheduled events |
| My Profile | Edit personal information |

---

## 12. API Reference

The Express backend exposes the following endpoints at `http://localhost:5000`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — confirms backend is running |
| `GET` | `/api/data` | Fetch all system data from Supabase |
| `POST` | `/api/:table` | Insert a record into any Supabase table |
| `PUT` | `/api/:table/:id` | Update a record by ID |
| `DELETE` | `/api/:table/:id` | Delete a record by ID |
| `POST` | `/api/upload` | Upload a file to AWS S3 (max 50MB) |
| `POST` | `/api/send-email` | Send an email via SMTP |
| `POST` | `/api/admin/init-db` | Initialize database schema from SQL file |

---

<div align="center">
  <p>Brigada Learning System v2 &mdash; Built for the Brigada Corp MIS Team</p>
</div>
