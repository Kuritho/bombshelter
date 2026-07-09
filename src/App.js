import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import OwnerDashboard from './components/OwnerDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const user = localStorage.getItem('currentUser');
    
    if (token && role && user) {
      setIsAuthenticated(true);
      setUserRole(role);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (role, userData) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentUser(userData);
    localStorage.setItem('authToken', 'dummy-token-' + Date.now());
    localStorage.setItem('userRole', role);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

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