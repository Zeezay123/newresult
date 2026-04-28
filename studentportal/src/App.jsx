import React from "react"
import {useState} from 'react'
import { BrowserRouter, Link, Route, Routes, Navigate } from "react-router-dom"
import { useSelector } from 'react-redux'

// Auth Pages
import Login from "./pages/auth/Login.jsx"
import Signout from "./pages/auth/Signout.jsx"
import Layout from "./components/Layout/Layout.jsx"

// HOD Pages
import HodDashboard from './pages/hod/Dashboard.jsx'
import AssignCourse from './pages/hod/AssignCourse.jsx'
import Lecturers from './pages/hod/Lecturers.jsx'
import LevelResult from './pages/hod/LevelResult.jsx'
import LectureReport from './pages/hod/LectureReport.jsx'
import StudentReport from './pages/hod/StudentReport.jsx'

// Lecturer Pages
import LecturerDashboard from './pages/lecturer/Dashboard.jsx'

//Advisor Pages
import AdvisorDashboard from './pages/Advisors/Dashboard.jsx'
import AdvisorCourseAssignments from './pages/Advisors/CourseAssignments.jsx'
import AdvisorStudents from './pages/Advisors/Students.jsx'
import AdvisorResults from './pages/Advisors/Results.jsx'

//Senate Pages
import SenateDashboard from './pages/senate/Dashboard.jsx'
import SenatePendingResults from './pages/senate/PendingResults.jsx'
import SenateApprovedResults from './pages/senate/ApprovedResults.jsx'
import SenateDepartments from './pages/senate/Departments.jsx'

// Protected Routes
import RoleRoute from './routes/RoleRoute.jsx'
import Dashboard from "./pages/student/Dashboard.jsx"
import StudentCourses from "./pages/student/Courses.jsx"
import AssignToLecturer from "./pages/hod/AssignToLecturer.jsx"
import ResultsDashboard from "./pages/hod/ResultsDashboard.jsx"
import TestResults from "./pages/lecturer/TestResult.jsx"
import ExamResults from "./pages/lecturer/ExamResults.jsx"
import ReviewExamResult from "./components/Layout/hod/Results/ReviewExamResult.jsx"
import ReviewTestResult from "./components/Layout/hod/Results/ReviewTestResult.jsx"
import ReviewTestResults from "./pages/hod/ReviewTestResults.jsx"
import ReviewExamResults from "./pages/hod/ReviewExamResults.jsx"
import Courses from "./pages/lecturer/Courses.jsx"
import UploadedResults from "./pages/lecturer/UploadedResults.jsx"
import AssignAdvisors from "./pages/hod/AssignAdvisors.jsx"
import StudentLogin from "./pages/auth/StudentLogin.jsx"
import StaffLogin from "./pages/auth/StaffLogin.jsx"
import SetScore from "./pages/hod/SetScore.jsx"
import DeanDashboard from './pages/dean/Dashboard.jsx'
import DeanLevelResults from './pages/dean/LevelResults.jsx'
import DeanLecturerResubmission from './pages/dean/LecturerResubmission.jsx'
import DeanStudentReport from './pages/dean/StudentReport.jsx'


function App() {
  return (
  <BrowserRouter basename="/">
   <Routes>
    {/* <Route path="/" element={<Signup/>} /> */}
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/staff-login" element={<StaffLogin/>} />
      <Route path="/signout" element={<Signout/>} />
      {/* Default Route - Redirect based on role */}
      <Route path="/redirect" element={<RoleBasedRedirect />} />

      {/* HOD Routes - Only accessible by HOD */}
      <Route element={<RoleRoute allowedRoles={['Admin']} />}>
       <Route element={<Layout/>} > 
        <Route path="/hod/dashboard" element={<HodDashboard />} />
        <Route path="/hod/assign-course" element={<AssignCourse />} />
        <Route path="/hod/assign-course/lecturer" element={<AssignToLecturer />} />
        <Route path="/hod/results" element={<ResultsDashboard/>} />
        <Route path="/hod/lecturers" element={<Lecturers />} />
        <Route path="/hod/test-results" element={<ReviewTestResults/>} />
        <Route path="/hod/exam-results" element={<ReviewExamResults/>} />
        <Route path="/hod/review-exam-results" element={<ReviewExamResult/>} />
        <Route path="/hod/review-test-results" element={<ReviewTestResult/>} />
        <Route path="/hod/assign-advisors" element={<AssignAdvisors />} />
        <Route path="/hod/level-results" element={<LevelResult />} />
        <Route path="/hod/lecturer-report" element={<LectureReport />} />
        <Route path="/hod/student-report" element={<StudentReport />} />
        <Route path="/hod/scoretpy" element={<SetScore />} />
        </Route>
      </Route>

      {/* Lecturer Routes - Only accessible by Lecturer */}
      <Route element={<RoleRoute allowedRoles={['Lecturer']} />}>
      <Route element={<Layout/>} >
        <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
        {/* <Route path="/lecturer/submit-results" element={<SubmitResults/>} /> */}
        <Route path="/lecturer/courses" element={<Courses/>} />
        {/* <Route path="/lecturer/exam-results" element={<ExamResults />} /> */}
        <Route path="/lecturer/test-results" element={<TestResults />} />
        <Route path="/lecturer/uploaded-results" element={<UploadedResults />} />
        </Route>
      </Route>

      {/* Student Routes - Only accessible by Student */}
      <Route element={<RoleRoute allowedRoles={['Student']} />}>
      <Route element={<Layout/>} >
        <Route path="/student/dashboard" element={<Dashboard/>} />
        <Route path="/student/courses" element={<StudentCourses/>} />
        </Route>
      </Route>

      {/* Advisor Routes - Only accessible by Advisor */}
      <Route element={<RoleRoute allowedRoles={['Advisor']} />}>
      <Route element={<Layout/>} >
        <Route path="/advisor/dashboard" element={<AdvisorDashboard/>} />
        <Route path="/advisor/course-assignments" element={<AdvisorCourseAssignments/>} />
        <Route path="/advisor/students" element={<AdvisorStudents/>} />
        <Route path="/advisor/results" element={<AdvisorResults/>} />
        </Route>
      </Route>

      {/* Senate Routes - Only accessible by Senate */}
      <Route element={<RoleRoute allowedRoles={['Senate']} />}>
      <Route element={<Layout/>} >
        <Route path="/senate/dashboard" element={<SenateDashboard/>} />
        <Route path="/senate/results" element={<SenatePendingResults/>} />
        <Route path="/senate/results/pending" element={<SenatePendingResults/>} />
        <Route path="/senate/results/approved" element={<SenateApprovedResults/>} />
        <Route path="/senate/departments" element={<SenateDepartments/>} />
        </Route>
      </Route>

      {/* Dean Routes - Only accessible by Dean */}
      <Route element={<RoleRoute allowedRoles={['Dean']} />}>
      <Route element={<Layout/>} >
        <Route path="/dean/dashboard" element={<DeanDashboard/>} />
        <Route path="/dean/level-results" element={<DeanLevelResults/>} />
        <Route path="/dean/lecturer-resubmission" element={<DeanLecturerResubmission/>} />
        <Route path="/dean/student-report" element={<DeanStudentReport/>} />
        </Route>
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
   </Routes>
   
   </BrowserRouter>
  )
}

// Component to redirect based on user role
function RoleBasedRedirect() {
  const { role, isAuthenticated } = useSelector((state) => state.user);

  console.log('RoleBasedRedirect - isAuthenticated:', isAuthenticated, 'role:', role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const newRole = role.toLowerCase();
  

  // Redirect based on role
  switch(newRole) {
    case 'admin':
      return <Navigate to="/hod/dashboard" replace />;
    case 'lecturer':
      return <Navigate to="/lecturer/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    case 'advisor':
      return <Navigate to="/advisor/dashboard" replace />;
    case 'senate':
      return <Navigate to="/senate/dashboard" replace />;
    case 'dean':
      return <Navigate to="/dean/dashboard" replace />;
    default:
      console.log('Unknown role:', role);
      return <Navigate to="/login" replace />;
  }
}

export default App