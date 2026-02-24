export enum UserRole {
  ADMIN = 'Admin',
  INSTRUCTOR = 'Instructor',
  STUDENT = 'Student',
  SUPER_ADMIN = 'Super Admin',
  EMPLOYEE = 'Employee'
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name?: string; // Keep for backward compatibility if needed
  email: string;
  password?: string;
  department: string;
  business_unit: string;
  role: string;
  admin_role: string;
  employee_status: string;
  image_url: string;
  avatar?: string; // Keep for backward compatibility
  created_at: string;
  last_active: string;
  employment_status: string;
  transfer_status: string;
  contract_type: string;
  band_id: string;
  position: string;
}

export interface Module {
  id: string;
  title: string;
  category?: string;
  description: string;
  instructor: string;
  studentsEnrolled: number;
  status: 'Published' | 'Draft' | 'Archived';
  lastUpdated: string;
  thumbnail: string;
  duration: string;
  sections?: Section[];
  settings?: ModuleSettings;
}

export interface Section {
  id: string;
  title: string;
  isExpanded: boolean;
  components: ModuleComponent[];
}

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export interface VideoResolution {
  label: string; 
  url: string;
  size?: string;
}

export interface ModuleComponent {
  id: string;
  type: 'reading' | 'video' | 'lecture' | 'podcast' | 'narrative' | 'quiz';
  category: 'learning' | 'assessment';
  title: string;
  content: any;
  fileUrl?: string;
  externalUrl?: string;
  minWords?: number;
  resolutions?: VideoResolution[];
  isTranscoding?: boolean;
  transcodingProgress?: number;
}

export interface ModuleSettings {
  availability: 'always' | 'range';
  assignmentType: string;
  selectedAudience: string[];
  prerequisites: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Contact {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  avatar: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: string;
}

export interface Evaluation {
  id: string;
  studentName: string;
  moduleTitle: string;
  assignmentTitle: string;
  submissionDate: string;
  status: 'Pending' | 'Graded' | 'Passed' | 'Failed';
  score?: number;
  aiAnalysis?: {
    summary: string;
    narrativeFeedback: string;
    narrativeScore: number;
    overallScore: number;
  };
  instructorFeedback?: string;
}

export interface DashboardStat {
  totalEmployees: string;
  activeModules: string;
  avgQuizScore: string;
  learningHours: string;
  currentMonthHours: string;
}

export interface TrainingEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  subtitle: string;
  time: string;
  type: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  content: string;
  audience: string;
  date: string;
  pinned: boolean;
  priority: string;
  status: string;
  author: string;
  reads: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  moduleCount: number;
  enrolledCount: number;
  duration: string;
  status: string;
  targetAudience: string;
  modules: string[];
}

export interface Signatory {
  name: string;
  title: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  issued: number;
  template: string;
  businessUnit: string;
  moduleType: string;
  signatoryName?: string; // Legacy support
  signatoryTitle?: string; // Legacy support
  signatories?: Signatory[]; // New: supports up to 4
  primaryColor: string;
  backgroundImage?: string;
  lastIssued: string;
}

export interface RestrictedProfile {
  id: string;
  name: string;
  avatar: string;
  module: string;
  attempts: number;
  lastScore: number;
  status: string;
  date: string;
}

export interface CalendarEvent {
  id: string;
  day: number;
  month: string;
  title: string;
  subtitle?: string;
  time: string;
  type?: string;
  location: string;
  attendees: number;
  color: string;
  date: string;
}

export interface ReportsData {
  activityTrend: Array<{ name: string; active: number; completions: number }>;
  completionRates: Array<{ name: string; completion: number }>;
  certifiedCompletions: Array<{
    id: string;
    employee: { name: string; avatar: string; dept: string };
    module: string;
    completedDate: string;
    score: number;
    certificateId: string;
  }>;
}

// ─── Authentication Types ───
export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  role: string;
  admin_role: string;
  image_url: string;
  avatar: string;
  department: string;
  position: string;
}

// ─── Employee Portal Data Types ───
export interface Enrollment {
  id: string;
  employeeId: string;
  moduleId: string;
  enrolledDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'under_evaluation' | 'passed' | 'failed' | 'rejected';
  progress: number;
  lastAccessedDate: string;
  completedDate?: string;
  currentSectionId?: string;
  currentComponentId?: string;
  retakeCount?: number;
  evaluatorNote?: string;
  submittedForEvaluationDate?: string;
  evaluatedDate?: string;
}

export interface ModuleEvaluation {
  id: string;
  enrollmentId: string;
  employeeId: string;
  moduleId: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  retakeCount: number;
  evaluatorNote?: string;
  evaluatedDate?: string;
}

export interface QuizAttempt {
  id: string;
  employeeId: string;
  moduleId: string;
  componentId: string;
  answers: { questionId: string; selectedOptionId: string; isCorrect: boolean }[];
  score: number;
  attemptNumber: number;
  submittedDate: string;
  passed: boolean;
}

export interface ComponentProgress {
  id: string;
  employeeId: string;
  moduleId: string;
  sectionId: string;
  componentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedDate?: string;
  timeSpentMinutes: number;
  timeSpentSeconds?: number; // More granular time tracking
  startedDate?: string; // When the component was first accessed
  lastAccessedDate?: string; // Last time the component was accessed
}

export interface EmployeeCertificate {
  id: string;
  employeeId: string;
  certificateTemplateId: string;
  moduleId: string;
  issuedDate: string;
  certificateNumber: string;
  score: number;
}

export interface LearningPathEnrollment {
  id: string;
  employeeId: string;
  learningPathId: string;
  enrolledDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface DBStructure {
  systemBranding: { name: string; logo: string; tagline: string };
  navigation: { 
    groups: Array<{ title: string; items: Array<{ name: string; path: string; icon: string }> }>;
    reports: Array<{ name: string; path: string; icon: string }>;
  };
  currentUser: { name: string; role: string; avatar: string };
  modules: Module[];
  learningPaths: LearningPath[];
  announcements: Announcement[];
  restrictedProfiles: RestrictedProfile[];
  calendarEvents: CalendarEvent[];
  trainingSchedule: TrainingEvent[];
  evaluations: Evaluation[];
  detailedSubmissions: Record<string, any>;
  roles: Array<{ id: string; name: string; members: number; permissions: string; created: string }>;
  contacts: Contact[];
  settingsSections: Array<{ id: string; title: string; description: string; options: Array<{ name: string; desc: string }> }>;
  employees: User[];
  dashboardData: {
    areaChart: any[];
    barChart: any[];
    radarChart: any[];
    pieChart: any[];
    stats: DashboardStat;
  };
  reportsData: ReportsData;
  certificates: CertificateTemplate[];
  commonData: {
    departments: string[];
    positions: string[];
    ranks: string[];
    statuses: string[];
    businessUnits: string[];
    contractTypes: string[];
    employmentStatuses: string[];
    firstNames: string[];
    lastNames: string[];
    avatars?: string[];
  };
  enrollments: Enrollment[];
  quizAttempts: QuizAttempt[];
  componentProgress: ComponentProgress[];
  employeeCertificates: EmployeeCertificate[];
  learningPathEnrollments: LearningPathEnrollment[];
  moduleEvaluations?: ModuleEvaluation[];
  notifications: Notification[];
  messages: Message[];
}