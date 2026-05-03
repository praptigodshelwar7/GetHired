import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { UserProvider, useUser } from './context/UserContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import DSATracker from './pages/DSATracker';
import RoadmapDetailed from './pages/RoadmapDetailed';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-spin-slow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent' }}></div>
    </div>
  );
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!isLanding && !isAuthPage && <Navbar />}
      <main style={{ minHeight: isLanding ? '100vh' : 'calc(100vh - 64px)' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute><Analysis /></ProtectedRoute>
            } />
            <Route path="/dsa" element={
              <ProtectedRoute><DSATracker /></ProtectedRoute>
            } />
            <Route path="/roadmap" element={
              <ProtectedRoute><RoadmapDetailed /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
