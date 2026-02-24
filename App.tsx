import React from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import ModuleCreation from "./pages/ModuleCreation";
import ModuleManagement from "./pages/ModuleManagement";
import UsersPage from "./pages/Users";
import Messages from "./pages/Messages";
import EvaluationPage from "./pages/Evaluation";
import Reports from "./pages/Reports";
import ManageRole from "./pages/ManageRole";
import CalendarPage from "./pages/CalendarPage";
import Announcements from "./pages/Announcements";
import LearningPaths from "./pages/LearningPaths";
import Settings from "./pages/Settings";
import AccessRestrictions from "./pages/AccessRestrictions";
import Certificates from "./pages/Certificates";
import Login from "./pages/Login";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingShapes from "./components/FloatingShapes";

// Employee imports
import EmployeeLayout from "./employee/EmployeeLayout";
import EmployeeDashboard from "./employee/pages/EmployeeDashboard";
import MyCourses from "./employee/pages/MyCourses";
import CourseViewer from "./employee/pages/CourseViewer";
import MyLearningPaths from "./employee/pages/MyLearningPaths";
import EmployeeAnnouncements from "./employee/pages/EmployeeAnnouncements";
import EmployeeCalendar from "./employee/pages/EmployeeCalendar";
import MyCertificates from "./employee/pages/MyCertificates";
import EmployeeMessages from "./employee/pages/EmployeeMessages";
import MyProfile from "./employee/pages/MyProfile";
import EvaluationStatus from "./employee/pages/EvaluationStatus";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-main-bg text-main-text transition-colors duration-300">
      <FloatingShapes />
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden transition-all duration-200">
        <Header toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="mx-auto w-full p-4 fade-in min-h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const RoleBasedRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-main-bg">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin' : '/employee'} replace />;
};

const App = () => {
  return (
    <HashRouter>
      <DataProvider>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Instructor']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="create-module" element={<ModuleCreation />} />
                <Route path="edit-module/:id" element={<ModuleCreation />} />
                <Route path="modules" element={<ModuleManagement />} />
                <Route path="employees" element={<UsersPage />} />
                <Route path="manage-role" element={<ManageRole />} />
                <Route path="messages" element={<Messages />} />
                <Route path="evaluation" element={<EvaluationPage />} />
                <Route path="reports" element={<Reports />} />
                <Route path="restricted" element={<AccessRestrictions />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="learning-paths" element={<LearningPaths />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Employee Routes */}
              <Route path="/employee" element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }>
                <Route index element={<EmployeeDashboard />} />
                <Route path="courses" element={<MyCourses />} />
                <Route path="courses/:moduleId" element={<CourseViewer />} />
                <Route path="learning-paths" element={<MyLearningPaths />} />
                <Route path="announcements" element={<EmployeeAnnouncements />} />
                <Route path="calendar" element={<EmployeeCalendar />} />
                <Route path="certificates" element={<MyCertificates />} />
                <Route path="messages" element={<EmployeeMessages />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="evaluations" element={<EvaluationStatus />} />
              </Route>

              {/* Root */}
              <Route path="/" element={<RoleBasedRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </DataProvider>
    </HashRouter>
  );
};

export default App;
