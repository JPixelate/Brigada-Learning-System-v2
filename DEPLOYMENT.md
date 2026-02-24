# Brigada Learning System v2 — Server Deployment Guide

> **Audience:** IT / MIS Team responsible for setting up the server.
> **Goal:** Get the system fully running on a Linux server from scratch.

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Server Requirements](#2-server-requirements)
3. [Step 1 — Prepare the Server (Ubuntu)](#step-1--prepare-the-server-ubuntu)
4. [Step 2 — Install Node.js](#step-2--install-nodejs)
5. [Step 3 — Install PM2 (Process Manager)](#step-3--install-pm2-process-manager)
6. [Step 4 — Install Nginx (Web Server)](#step-4--install-nginx-web-server)
7. [Step 5 — Install Git](#step-5--install-git)
8. [Step 6 — Configure Firewall (UFW)](#step-6--configure-firewall-ufw)
9. [Step 7 — Clone the Repository](#step-7--clone-the-repository)
10. [Step 8 — Install Dependencies](#step-8--install-dependencies)
11. [Step 9 — Configure Environment Variables](#step-9--configure-environment-variables)
12. [Step 10 — Initialize the Database](#step-10--initialize-the-database)
13. [Step 11 — Build the Frontend](#step-11--build-the-frontend)
14. [Step 12 — Start the Backend Server](#step-12--start-the-backend-server)
15. [Step 13 — Configure Nginx](#step-13--configure-nginx)
16. [Step 14 — Enable HTTPS (SSL)](#step-14--enable-https-ssl)
17. [Step 15 — Verify Everything is Running](#step-15--verify-everything-is-running)
18. [External Service Accounts Required](#external-service-accounts-required)
19. [Updating the System (Re-deployment)](#updating-the-system-re-deployment)
20. [Useful Commands Reference](#useful-commands-reference)
21. [Troubleshooting](#troubleshooting)

---

## 1. Pre-Deployment Checklist

Before starting, make sure you have the following ready:

- [ ] A Linux server (Ubuntu 22.04 or 24.04 LTS) with **SSH access**
- [ ] A **domain name** pointed to your server's IP (e.g., `lms.brigada.com`)
- [ ] **Supabase project** created — URL and service role key available
- [ ] **AWS S3 bucket** created — access key and secret key available
- [ ] **Google Gemini API key** obtained
- [ ] **SMTP email credentials** (e.g., Gmail App Password)
- [ ] Port **80** and **443** open on the server/firewall/cloud security group

---

## 2. Server Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPUs | 4 vCPUs |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Internet | Required | Stable connection |

> **Note:** The system uses cloud services (Supabase, AWS S3, Gemini). The server itself does **not** need a local database or storage — it just needs internet access to reach these services.

---

## Step 1 — Prepare the Server (Ubuntu)

SSH into your server, then update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

Install essential utilities:

```bash
sudo apt install -y curl wget git unzip build-essential
```

---

## Step 2 — Install Node.js

The system requires **Node.js v20 (LTS)**. Install it via the official NodeSource setup script:

```bash
# Download and run the NodeSource setup for Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs
```

Verify the installation:

```bash
node -v     # Should output: v20.x.x
npm -v      # Should output: 10.x.x or higher
```

---

## Step 3 — Install PM2 (Process Manager)

**PM2** keeps the backend server running in the background and auto-restarts it if it crashes.

```bash
sudo npm install -g pm2
```

Verify:

```bash
pm2 -v    # Should output a version number like 5.x.x
```

---

## Step 4 — Install Nginx (Web Server)

**Nginx** serves the frontend files and proxies API requests to the backend.

```bash
sudo apt install -y nginx
```

Start and enable Nginx to run on boot:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

Verify:

```bash
sudo systemctl status nginx    # Should show: active (running)
```

---

## Step 5 — Install Git

Git should already be installed from Step 1. Confirm:

```bash
git --version    # Should output: git version 2.x.x
```

If not installed:

```bash
sudo apt install -y git
```

---

## Step 6 — Configure Firewall (UFW)

Allow only the necessary ports:

```bash
# Allow SSH (so you don't lock yourself out)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS for the web server
sudo ufw allow 'Nginx Full'

# Enable the firewall
sudo ufw enable

# Confirm rules
sudo ufw status
```

Expected output:
```
Status: active
To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

> **Do NOT expose port 5000 (the backend) directly.** Nginx will proxy requests to it internally.

---

## Step 7 — Clone the Repository

Create a directory for the application and clone the code:

```bash
# Create the app directory
sudo mkdir -p /var/www/brigada-lms
sudo chown $USER:$USER /var/www/brigada-lms

# Clone the repository
git clone https://github.com/JPixelate/Brigada-Learning-System-v2.git /var/www/brigada-lms

# Move into the project directory
cd /var/www/brigada-lms
```

---

## Step 8 — Install Dependencies

Install dependencies for both the **frontend** and the **backend server**:

```bash
# Install frontend dependencies (React, Vite, etc.)
npm install

# Install backend server dependencies (Express, Supabase, AWS SDK, etc.)
cd server && npm install && cd ..
```

---

## Step 9 — Configure Environment Variables

There are **two separate `.env` files** you must create manually.

### 9.1 — Root `.env` (Frontend)

```bash
nano /var/www/brigada-lms/.env
```

Paste the following and fill in your values:

```env
# Google Gemini API Key (for AI Module Generation)
GEMINI_API_KEY=paste_your_gemini_api_key_here
```

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

---

### 9.2 — `server/.env` (Backend)

```bash
nano /var/www/brigada-lms/server/.env
```

Paste the following and fill in your values:

```env
# ── Server Port ────────────────────────────────────────
PORT=5000

# ── Supabase ───────────────────────────────────────────
# From: Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# From: Supabase Dashboard → Settings → Database
SUPABASE_DB_HOST=db.your-project-id.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_DATABASE=postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your_database_password_here

# ── AWS S3 ─────────────────────────────────────────────
# From: AWS Console → IAM → Your User → Security Credentials
S3_REGION=ap-southeast-1
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your_aws_access_key_id
S3_SECRET_ACCESS_KEY=your_aws_secret_access_key

# ── Email / SMTP ───────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password_here
```

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

> **Security Reminder:** These files contain secret credentials. Never share them or commit them to Git. They are already excluded in `.gitignore`.

---

## Step 10 — Initialize the Database

The database schema must be set up once on a fresh Supabase project.

First, start the backend temporarily:

```bash
cd /var/www/brigada-lms/server
node server.js &
```

Then trigger the database initialization:

```bash
curl -X POST http://localhost:5000/api/admin/init-db
```

Expected response:
```json
{"success": true, "logs": ["Connecting to native Postgres backend...", "Executing massive SQL configuration script...", "✅ Postgres schema built successfully!"]}
```

Stop the temporary server:

```bash
kill %1
```

> **This step only needs to be done ONCE** on a fresh deployment. Do not run it again on a database that already has data.

---

## Step 11 — Build the Frontend

Compile the React application into static files:

```bash
cd /var/www/brigada-lms
npm run build
```

This creates a `dist/` folder with all the production-ready HTML, CSS, and JavaScript files. This is what Nginx will serve.

---

## Step 12 — Start the Backend Server

Use PM2 to start the Express backend as a managed background process:

```bash
cd /var/www/brigada-lms/server
pm2 start server.js --name "bls-backend"
```

Save the PM2 process list so it survives a server reboot:

```bash
pm2 save
pm2 startup
```

PM2 will output a command to run. Copy and run that command (it looks like):

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Verify the backend is running:

```bash
pm2 status
# Should show: bls-backend | online
```

Test it:

```bash
curl http://localhost:5000/api/health
# Expected: {"status":"OK","message":"Backend is running and connected to Supabase."}
```

---

## Step 13 — Configure Nginx

Create a new Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/brigada-lms
```

Paste the following (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve the built React frontend
    root /var/www/brigada-lms/dist;
    index index.html;

    # Handle React Router — always serve index.html for unknown paths
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy all /api/ requests to the Express backend
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

        # Allow large file uploads (videos, documents)
        client_max_body_size 50M;
    }
}
```

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

Enable the site and test the configuration:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/brigada-lms /etc/nginx/sites-enabled/

# Remove the default Nginx page
sudo rm -f /etc/nginx/sites-enabled/default

# Test the config for errors
sudo nginx -t

# Apply the config
sudo systemctl reload nginx
```

---

## Step 14 — Enable HTTPS (SSL)

Install Certbot and get a free SSL certificate from Let's Encrypt:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get and install the SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email address
- Agree to the Terms of Service
- Choose whether to receive emails from Let's Encrypt (optional)
- Select **option 2** to redirect all HTTP traffic to HTTPS

Certbot will automatically update your Nginx config to use HTTPS.

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## Step 15 — Verify Everything is Running

Run these checks to confirm the full system is operational:

```bash
# 1. Check Nginx is running
sudo systemctl status nginx

# 2. Check the backend is running
pm2 status

# 3. Test the backend health endpoint
curl http://localhost:5000/api/health

# 4. Test via your domain (HTTP → should redirect to HTTPS)
curl -I http://yourdomain.com

# 5. Test via HTTPS
curl -I https://yourdomain.com
```

Then open a browser and navigate to `https://yourdomain.com`. You should see the Brigada Learning System login page.

---

## External Service Accounts Required

The server itself does not run a database or file storage — those are cloud services. Here is where to get each credential:

### Supabase (Database)

| What you need | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key |
| `SUPABASE_DB_HOST` | Supabase Dashboard → Settings → Database → Host |
| `SUPABASE_DB_PASSWORD` | Set during project creation (or reset in Database settings) |

> Create an account at [supabase.com](https://supabase.com) → New Project → Free tier is available.

---

### AWS S3 (File Storage)

| What you need | Where to find it |
|---|---|
| `S3_BUCKET_NAME` | AWS Console → S3 → Create Bucket → note the bucket name |
| `S3_REGION` | Select during bucket creation (e.g., `ap-southeast-1` for Singapore) |
| `S3_ACCESS_KEY_ID` | AWS Console → IAM → Users → Your User → Security Credentials → Create Access Key |
| `S3_SECRET_ACCESS_KEY` | Shown only once when creating the access key — save it immediately |

Bucket permissions needed:
- **ACL:** Disabled (use bucket policy instead)
- **Block Public Access:** Keep enabled (files are served via signed URLs or direct S3 links from the backend)
- **CORS:** Add a CORS rule allowing `GET` and `PUT` from your domain

---

### Google Gemini API (AI Features)

| What you need | Where to find it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) → Get API Key |

> Free tier is available with usage limits. For production use, consider enabling billing.

---

### SMTP Email (Notifications)

The system sends email notifications via Nodemailer. **Gmail** is the simplest option:

**Steps for Gmail App Password:**
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** if not already on
3. Go to **Security → 2-Step Verification → App passwords**
4. Select App: `Mail`, Device: `Other (Custom name)` → type `BLS Server`
5. Copy the 16-character password — use it as `SMTP_PASS`

| Setting | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | The 16-character app password |

---

## Updating the System (Re-deployment)

When a new version of the code is pushed to GitHub, update the server like this:

```bash
cd /var/www/brigada-lms

# Pull the latest code
git pull origin main

# Install any new dependencies
npm install
cd server && npm install && cd ..

# Rebuild the frontend
npm run build

# Restart the backend
pm2 restart bls-backend

echo "✅ Update complete"
```

---

## Useful Commands Reference

### PM2 (Backend Process)

```bash
pm2 status                    # Show all running processes
pm2 logs bls-backend          # View real-time backend logs
pm2 logs bls-backend --lines 100  # View last 100 log lines
pm2 restart bls-backend       # Restart the backend
pm2 stop bls-backend          # Stop the backend
pm2 start bls-backend         # Start the backend
```

### Nginx

```bash
sudo nginx -t                         # Test config for syntax errors
sudo systemctl reload nginx           # Apply config changes
sudo systemctl restart nginx          # Full restart
sudo systemctl status nginx           # Check status
sudo tail -f /var/log/nginx/error.log # View error logs
```

### SSL Certificate

```bash
sudo certbot renew              # Manually renew certificate
sudo certbot renew --dry-run    # Test renewal without making changes
```

### System Monitoring

```bash
htop                  # Live CPU/RAM monitor (install: sudo apt install htop)
df -h                 # Check disk space
free -m               # Check memory usage
pm2 monit             # PM2 live monitoring dashboard
```

---

## Troubleshooting

### Problem: Cannot connect to Supabase

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `server/.env`
- Check that port 5432 is not blocked outbound on your server firewall
- Run: `curl -X GET http://localhost:5000/api/health`

### Problem: File uploads failing (S3)

- Confirm `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` are correct
- Confirm the IAM user has `s3:PutObject` permission on the bucket
- Check `S3_BUCKET_NAME` and `S3_REGION` match exactly

### Problem: Emails not sending

- For Gmail: make sure you're using an **App Password**, not your regular password
- Check `SMTP_PORT=465` with `secure: true` (already configured in the code)
- Test with: `curl -X POST http://localhost:5000/api/send-email -H "Content-Type: application/json" -d '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'`

### Problem: Backend crashes on startup

```bash
pm2 logs bls-backend    # Check the error message
```

Common causes:
- Missing or incorrect `server/.env` values
- `node_modules` not installed in `server/` folder — run `cd server && npm install`

### Problem: Frontend shows blank page or 404

- Confirm `npm run build` was run and `dist/` folder exists
- Confirm Nginx `root` points to the correct `dist/` path
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Problem: Cannot access the site after reboot

```bash
pm2 resurrect    # Restore saved PM2 processes
sudo systemctl restart nginx
```

If PM2 processes are not saved, run `pm2 save` after starting the backend.

---

*For application-level documentation, see [README.md](README.md).*
