import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Client } = pg;
import { supabase } from './db.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from 'multer';
import { sendEmail } from './mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, '.env') });

// S3 Client Initialization
const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

// Multer Config for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running and connected to Supabase.' });
});

// ============================================
// SQL INITIALIZATION ENDPOINT (uses pg)
// ============================================

app.post('/api/admin/init-db', async (req, res) => {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST || process.env.VITE_SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT || process.env.VITE_SUPABASE_DB_PORT || '5432', 10),
    database: process.env.SUPABASE_DB_DATABASE || process.env.VITE_SUPABASE_DB_DATABASE || 'postgres',
    user: process.env.SUPABASE_DB_USERNAME || process.env.VITE_SUPABASE_DB_USERNAME || 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || process.env.VITE_SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  let logs = [];
  try {
    const rawSqlPath = path.resolve(__dirname, '../supabase_schema.sql');
    const sqlScript = fs.readFileSync(rawSqlPath, 'utf8');

    logs.push('Connecting to native Postgres backend...');
    await client.connect();
    
    logs.push('Executing massive SQL configuration script...');
    await client.query(sqlScript);

    logs.push('✅ Postgres schema built successfully!');
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('SQL init failed:', error);
    res.status(500).json({ success: false, error: error.message, logs });
  } finally {
    await client.end();
  }
});

// ============================================
// FULL SYSTEM DATA ENDPOINT
// ============================================
app.get('/api/data', async (req, res) => {
  try {
    // We fetch all dynamic data from our Postgres Supabase instance 
    // Securely via the service_role key to act as admin.
    const [
      { data: employees },
      { data: modules },
      { data: enrollments },
      { data: learningPaths },
      { data: announcements },
      { data: notifications },
      { data: quizAttempts },
      { data: componentProgress },
      { data: employeeCertificates },
      { data: learningPathEnrollments },
      { data: moduleEvaluations },
      { data: calendarEvents },
      { data: roles },
      { data: settingsSections },
      { data: messages },
      { data: certificates }
    ] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('modules').select('*'),
      supabase.from('enrollments').select('*'),
      supabase.from('learning_paths').select('*'),
      supabase.from('announcements').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('quiz_attempts').select('*'),
      supabase.from('component_progress').select('*'),
      supabase.from('employee_certificates').select('*'),
      supabase.from('learning_path_enrollments').select('*'),
      supabase.from('module_evaluations').select('*'),
      supabase.from('calendar_events').select('*'),
      supabase.from('roles').select('*'),
      supabase.from('settings_sections').select('*'),
      supabase.from('messages').select('*').order('timestamp', { ascending: true }),
      supabase.from('certificates').select('*')
    ]);

    // Format fields slightly back to frontend camelCase expectations where necessary
    const formatModules = (modules || []).map(m => ({ ...m, studentsEnrolled: m.students_enrolled, lastUpdated: m.last_updated }));
    const formatEnrollments = (enrollments || []).map(e => ({ 
      ...e, employeeId: e.employee_id, moduleId: e.module_id, enrolledDate: e.enrolled_date,
      lastAccessedDate: e.last_accessed_date, completedDate: e.completed_date, 
      currentSectionId: e.current_section_id, currentComponentId: e.current_component_id,
      retakeCount: e.retake_count, evaluatorNote: e.evaluator_note, 
      submittedForEvaluationDate: e.submitted_for_evaluation_date, evaluatedDate: e.evaluated_date
    }));
    const formatPaths = (learningPaths || []).map(p => ({ ...p, moduleCount: p.module_count, enrolledCount: p.enrolled_count, targetAudience: p.target_audience }));
    const formatNotifications = (notifications || []).map(n => ({ ...n, userId: n.user_id }));
    const formatQuizAttempts = (quizAttempts || []).map(q => ({ ...q, employeeId: q.employee_id, moduleId: q.module_id, totalQuestions: q.total_questions, correctAnswers: q.correct_answers, attemptNumber: q.attempt_number }));
    const formatCompProgress = (componentProgress || []).map(cp => ({ ...cp, employeeId: cp.employee_id, moduleId: cp.module_id, sectionId: cp.section_id, componentId: cp.component_id, completedDate: cp.completed_date, timeSpentMinutes: cp.time_spent_minutes, time_spent_seconds: cp.time_spent_seconds, started_date: cp.started_date, lastAccessedDate: cp.last_accessed_date }));
    const formatCerts = (employeeCertificates || []).map(c => ({ ...c, employeeId: c.employee_id, certificateTemplateId: c.certificate_template_id, moduleId: c.module_id, issuedDate: c.issued_date, certificateNumber: c.certificate_number }));
    const formatPathEnrollments = (learningPathEnrollments || []).map(pe => ({ ...pe, employeeId: pe.employee_id, pathId: pe.path_id, enrolledDate: pe.enrolled_date, completedDate: pe.completed_date }));
    const formatModuleEvals = (moduleEvaluations || []).map(me => ({ ...me, enrollmentId: me.enrollment_id, employeeId: me.employee_id, moduleId: me.module_id, submittedDate: me.submitted_date, retakeCount: me.retake_count, evaluatorNote: me.evaluator_note, evaluatedDate: me.evaluated_date }));
    const formatMessages = (messages || []).map(m => ({ ...m, senderId: m.sender_id, receiverId: m.receiver_id }));
    const formatCertTemplates = (certificates || []).map(ct => ({ ...ct, businessUnit: ct.business_unit, moduleType: ct.module_type, primaryColor: ct.primary_color, backgroundImage: ct.background_image, lastIssued: ct.last_issued }));

    res.status(200).json({
      success: true,
      data: {
        employees: employees || [],
        modules: formatModules,
        enrollments: formatEnrollments,
        learningPaths: formatPaths,
        announcements: announcements || [],
        quizAttempts: formatQuizAttempts,
        componentProgress: formatCompProgress,
        employeeCertificates: formatCerts,
        learningPathEnrollments: formatPathEnrollments,
        moduleEvaluations: formatModuleEvals,
        notifications: formatNotifications,
        calendarEvents: calendarEvents || [],
        roles: roles || [],
        settingsSections: settingsSections || [],
        messages: formatMessages,
        certificates: formatCertTemplates
      }
    });

  } catch (error) {
    console.error('Data Fetch Error:', error.message);
    res.status(500).json({ success: false, error: 'Database fetch failed' });
  }
});

// ============================================
// DYNAMIC CRUD ROUTES FOR SUPABASE
// ============================================
const formatKeysToSnakeCase = (obj) => {
  // Convert basic frontend camelCase fields back to snake_case for Supabase
  const newObj = { ...obj };
  const mapping = {
    studentsEnrolled: 'students_enrolled',
    lastUpdated: 'last_updated',
    employeeId: 'employee_id',
    moduleId: 'module_id',
    enrolledDate: 'enrolled_date',
    userId: 'user_id',
    lastAccessedDate: 'last_accessed_date',
    completedDate: 'completed_date',
    currentSectionId: 'current_section_id',
    currentComponentId: 'current_component_id',
    retakeCount: 'retake_count',
    evaluatorNote: 'evaluator_note',
    submittedForEvaluationDate: 'submitted_for_evaluation_date',
    evaluated_date: 'evaluatedDate',
    moduleCount: 'module_count',
    enrolledCount: 'enrolled_count',
    targetAudience: 'target_audience',
    totalQuestions: 'total_questions',
    correctAnswers: 'correct_answers',
    attemptNumber: 'attempt_number',
    sectionId: 'section_id',
    componentId: 'component_id',
    timeSpentMinutes: 'time_spent_minutes',
    timeSpentSeconds: 'time_spent_seconds',
    startedDate: 'started_date',
    certificateTemplateId: 'certificate_template_id',
    issuedDate: 'issued_date',
    certificateNumber: 'certificate_number',
    pathId: 'path_id',
    enrollmentId: 'enrollment_id',
    submittedDate: 'submitted_date',
    evaluatedDate: 'evaluated_date',
    senderId: 'sender_id',
    receiverId: 'receiver_id'
  };

  Object.keys(mapping).forEach(key => {
    if (key in newObj) {
      newObj[mapping[key]] = newObj[key];
      delete newObj[key];
    }
  });

  return newObj;
};

app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  const payload = formatKeysToSnakeCase(req.body);
  try {
    const { data, error } = await supabase.from(table).insert([payload]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error(`POST /api/${table} error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const payload = formatKeysToSnakeCase(req.body);
  try {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(`PUT /api/${table}/${id} error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    const { data, error } = await supabase.from(table).delete().eq('id', id).select();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(`DELETE /api/${table}/${id} error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// AWS S3 UPLOAD ENDPOINT
// ============================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { folder = 'general' } = req.body; // Allow dynamic subfolders
    const file = req.file;
    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/\s+/g, '-');
    const s3Path = `Brigada Learning System/${folder}/${timestamp}-${cleanFileName}`;
    const bucketName = process.env.S3_BUCKET_NAME;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Path,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    const url = `https://${bucketName}.s3.${process.env.S3_REGION}.amazonaws.com/${encodeURIComponent(s3Path)}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url,
      path: s3Path,
      fileName: cleanFileName
    });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload file to S3' });
  }
});

// ============================================
// EMAIL ENDPOINTS
// ============================================
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html, text } = req.body;
  try {
    const result = await sendEmail({ to, subject, html, text });
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// MIGRATION ENDPOINT (from data/db.json)
// ============================================
app.post('/api/admin/migrate', async (req, res) => {
  res.status(410).json({ success: false, error: 'Migration endpoint decommissioned. Data is now fully live on Supabase and local db.json has been removed.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Express Backend Server is running on port ${PORT}`);
});
