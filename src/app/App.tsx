import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Subscriptions from './components/Subscriptions';
import Footer from './components/Footer';
import AboutSystem from './components/AboutSystem';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import CookiesPolicy from './pages/CookiesPolicy';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import FacultyDashboard from './pages/dashboard/FacultyDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import QuizPage from './pages/QuizPage';
import LessonsPage from './pages/LessonsPage';
import LessonContent from './pages/LessonContent';
import BudgetPage from './pages/BudgetPage';
import BadgesPage from './pages/BadgesPage';
import ForumPage from './pages/ForumPage';
import BlogPage from './pages/BlogPage';
import TemplatesPage from './pages/TemplatesPage';
import StudentModulesPage from './pages/StudentModulesPage';
import CheckoutPage from './pages/CheckoutPage';
import StudentPaymentsPage from './pages/student/StudentPaymentsPage';

import FacultyStudentsPage from './pages/faculty/FacultyStudentsPage';
import FacultyContentPage from './pages/faculty/FacultyContentPage';
import FacultyDiscussionsPage from './pages/faculty/FacultyDiscussionsPage';

import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import UserProfilePage from './pages/UserProfilePage';
import GcashPortal from './pages/GcashPortal';

import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

function LandingPage() {
  return (
    <div className="font-sans antialiased text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300 selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <main className="flex flex-col gap-24 md:gap-32 pb-20">
        <Hero />
        <AboutSystem />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <Subscriptions />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/cookies" element={<CookiesPolicy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/gateway/gcash" element={<GcashPortal />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/dashboard/student" element={<StudentDashboard />} />
              <Route path="/dashboard/student/quiz/:quizId" element={<QuizPage />} />
              <Route path="/dashboard/student/lessons" element={<LessonsPage />} />
              <Route path="/dashboard/student/lessons/:moduleId" element={<LessonContent />} />
              <Route path="/dashboard/student/modules" element={<StudentModulesPage />} />
              <Route path="/dashboard/student/budget" element={<BudgetPage />} />
              <Route path="/dashboard/student/badges" element={<BadgesPage />} />
              <Route path="/dashboard/student/forum" element={<ForumPage />} />
              <Route path="/dashboard/student/blog" element={<BlogPage role="student" />} />
              <Route path="/dashboard/student/templates" element={<TemplatesPage role="student" />} />
              <Route path="/dashboard/student/payments" element={<StudentPaymentsPage />} />
              <Route path="/dashboard/student/profile" element={<UserProfilePage role="student" />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/dashboard/faculty" element={<FacultyDashboard />} />
              <Route path="/dashboard/faculty/students" element={<FacultyStudentsPage />} />
              <Route path="/dashboard/faculty/content" element={<FacultyContentPage />} />
              <Route path="/dashboard/faculty/discussions" element={<FacultyDiscussionsPage />} />
              <Route path="/dashboard/faculty/blog" element={<BlogPage role="teacher" />} />
              <Route path="/dashboard/faculty/templates" element={<TemplatesPage role="teacher" />} />
              <Route path="/dashboard/faculty/profile" element={<UserProfilePage role="teacher" />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/users" element={<AdminUsersPage />} />
              <Route path="/dashboard/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/dashboard/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
