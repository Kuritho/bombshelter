// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import CustomerDashboard from './components/CustomerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import OwnerDashboard from './components/OwnerDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authInProgressRef = useRef(false);

  // 🔒 When true, the auth listener is completely disabled.
  //    Nothing — not signIn, not signOut, not token refresh —
  //    can change the current user state.
  const userLockedRef = useRef(false);

  useEffect(() => {
    window.__setAuthInProgress = (val) => {
      authInProgressRef.current = val;
    };
    window.__setSigningUp = window.__setAuthInProgress;

    // 🔒 Lock controls exposed to hooks
    window.__lockUser = () => {
      userLockedRef.current = true;
      console.log('🔒 User locked — auth listener disabled');
    };
    window.__unlockUser = () => {
      userLockedRef.current = false;
      console.log('🔓 User unlocked — auth listener enabled');
    };

    return () => {
      delete window.__setAuthInProgress;
      delete window.__setSigningUp;
      delete window.__lockUser;
      delete window.__unlockUser;
    };
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session && session.user) {
          if (!session.user.email_confirmed_at) {
            console.warn('⚠️ Unverified email in session — signing out');
            await supabase.auth.signOut();
            return;
          }

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!userError && userData) {
            setIsAuthenticated(true);
            setUserRole(userData.role);
            setCurrentUser(userData);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 🛑 1. Ignore during login flow
        if (authInProgressRef.current) {
          console.log('🚫 Ignoring auth event during login flow:', event);
          return;
        }

        // 🛑 2. HARD LOCK — nothing gets through
        if (userLockedRef.current) {
          console.log('🔒 Ignoring auth event — user is locked:', event);
          return;
        }

        if (session && session.user) {
          if (!session.user.email_confirmed_at) {
            console.warn('⚠️ Unverified — signing out');
            await supabase.auth.signOut();
            return;
          }

          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && userData) {
            setIsAuthenticated(true);
            setUserRole(userData.role);
            setCurrentUser(userData);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setCurrentUser(null);
          localStorage.removeItem('userRole');
          localStorage.removeItem('currentUser');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (role, userData) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentUser(userData);
    localStorage.setItem('userRole', role);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    // Unlock before signing out, otherwise the listener ignores SIGNED_OUT
    userLockedRef.current = false;
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* ============ PUBLIC LANDING ============ */}
          <Route
            path="/"
            element={
              <LandingPageWrapper
                currentUser={currentUser}
                isAuthenticated={isAuthenticated}
                userRole={userRole}
              />
            }
          />

          {/* ============ LOGIN ============ */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={`/${userRole}`} />
              ) : (
                <LoginPageWrapper onLogin={handleLogin} />
              )
            }
          />

          {/* ============ DASHBOARDS ============ */}
          <Route
            path="/customer"
            element={
              isAuthenticated && userRole === 'customer' ? (
                <CustomerDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/employee"
            element={
              isAuthenticated && userRole === 'employee' ? (
                <EmployeeDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/owner"
            element={
              isAuthenticated && userRole === 'owner' ? (
                <OwnerDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ============ FALLBACK ============ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

// ============================================
// WRAPPER COMPONENTS — give LandingPage + Login
// access to useNavigate() (must be inside Router)
// ============================================

function LandingPageWrapper({ currentUser, isAuthenticated, userRole }) {
  const navigate = useNavigate();

  const handleNavigateToAuth = (mode) => {
    // Only mode is 'login' now (your Login component handles both)
    navigate('/login');
  };

  const handleNavigateToDashboard = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (userRole === 'owner') return navigate('/owner');
    if (userRole === 'employee') return navigate('/employee');
    return navigate('/customer');
  };

  return (
    <LandingPage
      currentUser={isAuthenticated ? currentUser : null}
      onNavigateToAuth={handleNavigateToAuth}
      onNavigateToDashboard={handleNavigateToDashboard}
    />
  );
}

function LoginPageWrapper({ onLogin }) {
  const navigate = useNavigate();

  return (
    <Login
      onLogin={(role, userData) => {
        onLogin(role, userData);
        // After login, redirect to correct dashboard
        if (role === 'owner') navigate('/owner');
        else if (role === 'employee') navigate('/employee');
        else navigate('/customer');
      }}
      onBack={() => navigate('/')}
    />
  );
}

export default App;
