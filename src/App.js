import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import OwnerDashboard from './components/OwnerDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 NEW: Flag to suppress auto-login during signup flow
  const isSigningUpRef = useRef(false);

  // 🔄 NEW: Expose a way for Login.js to set/clear the flag
  useEffect(() => {
    window.__setSigningUp = (val) => {
      isSigningUpRef.current = val;
      console.log('🔒 isSigningUp flag set to:', val);
    };
    return () => {
      delete window.__setSigningUp;
    };
  }, []);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        // 🔄 NEW: Ignore SIGNED_IN while signup is in progress
        if (isSigningUpRef.current && event === 'SIGNED_IN') {
          console.log('🚫 Ignoring auto SIGNED_IN during signup');
          return;
        }

        if (session && session.user) {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (role, userData) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentUser(userData);
    localStorage.setItem('userRole', role);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = async () => {
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
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to={`/${userRole}`} />
              )
            } 
          />
          <Route 
            path="/customer" 
            element={
              isAuthenticated && userRole === 'customer' ? (
                <CustomerDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/employee" 
            element={
              isAuthenticated && userRole === 'employee' ? (
                <EmployeeDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/owner" 
            element={
              isAuthenticated && userRole === 'owner' ? (
                <OwnerDashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;