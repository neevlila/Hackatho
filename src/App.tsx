import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import TimetableViewer from './components/TimetableViewer';
import ClassroomManagement from './components/ClassroomManagement';
import SubjectManagement from './components/SubjectManagement';
import FacultyManagement from './components/FacultyManagement';
import BatchManagement from './components/BatchManagement';
import BreakManagement from './components/BreakManagement';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="timetables" element={<TimetableViewer />} />
              <Route path="classrooms" element={<ClassroomManagement />} />
              <Route path="subjects" element={<SubjectManagement />} />
              <Route path="faculty" element={<FacultyManagement />} />
              <Route path="batches" element={<BatchManagement />} />
              <Route path="breaks" element={<BreakManagement />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
