import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  // Mock user database
  const users = {
    'customer@test.com': { 
      password: 'customer123', 
      role: 'customer', 
      name: 'John Doe',
      id: 1
    },
    'employee@test.com': { 
      password: 'employee123', 
      role: 'employee', 
      name: 'Jane Smith',
      id: 2,
      employeeId: 'EMP001'
    },
    'owner@test.com': { 
      password: 'owner123', 
      role: 'owner', 
      name: 'Bob Johnson',
      id: 3,
      restaurantName: 'Bob\'s Diner'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Find user by email
    const user = users[email];
    
    if (!user) {
      setError('User not found. Please check your email.');
      return;
    }

    if (user.password !== password) {
      setError('Invalid password. Please try again.');
      return;
    }

    if (user.role !== role) {
      setError(`Invalid role. This account is registered as ${user.role}.`);
      return;
    }

    // Remove password before storing
    const { password: _, ...userData } = user;
    onLogin(role, userData);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🍽️ Order System</h2>
        <p className="login-subtitle">Login to your account</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label>Login as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials:</p>
          <div className="demo-creds">
            <div><strong>Customer:</strong> customer@test.com / customer123</div>
            <div><strong>Employee:</strong> employee@test.com / employee123</div>
            <div><strong>Owner:</strong> owner@test.com / owner123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;