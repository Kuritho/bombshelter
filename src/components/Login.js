import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

// Import logo
import logo from '../assets/logo.jpg'; // If in src/assets/
// OR if in public folder:
// const logo = '/logo.png';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        // SIGN UP FLOW - Force role to customer
        const signUpRole = 'customer';
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
              role: signUpRole
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw signUpError;
        }

        if (authData.user) {
          console.log('Auth user created:', authData.user.id);
          
          // Wait a moment for auth to fully process
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to get existing profile
          let { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          // If no profile exists, create one manually
          if (!existingUser) {
            console.log('Creating user profile manually...');
            
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: authData.user.id,
                  email: authData.user.email,
                  name: name || authData.user.email.split('@')[0],
                  role: signUpRole
                }
              ])
              .select()
              .maybeSingle();

            if (insertError) {
              console.error('Insert error:', insertError);
              // Check if it's a duplicate key error (profile already exists)
              if (insertError.code === '23505') { // PostgreSQL unique violation
                setSuccessMessage('✅ Account already exists! Please check your email for confirmation and try signing in.');
                setLoading(false);
                return;
              }
              // Check if it's a foreign key violation or other error
              setSuccessMessage('📧 Account created! Please check your email for confirmation, then sign in.');
              setLoading(false);
              return;
            }

            if (newUser) {
              console.log('Profile created successfully:', newUser);
              setSuccessMessage('✅ Account created successfully! Please check your email for confirmation, then sign in.');
              setLoading(false);
              // Don't auto-login, let user confirm email first
              return;
            }
          } else {
            // Profile already exists
            console.log('Profile already exists:', existingUser);
            setSuccessMessage('✅ Welcome back! Please check your email for confirmation, then sign in.');
            setLoading(false);
            return;
          }
        }
      } else {
        // SIGN IN FLOW - Allow all roles to sign in
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (authData.user) {
          // Get user profile
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (userError) {
            console.error('Profile fetch error:', userError);
            throw new Error('Could not retrieve user profile.');
          }

          if (!userData) {
            throw new Error('User profile not found. Please contact support.');
          }

          // Verify role matches
          if (userData.role !== role) {
            throw new Error(`This account is registered as ${userData.role}. Please select the correct role.`);
          }
          
          onLogin(role, userData);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Decorative coffee beans background */}
      <div className="coffee-bg-decoration">
        <span className="coffee-bean">☕</span>
        <span className="coffee-bean">☕</span>
        <span className="coffee-bean">☕</span>
        <span className="coffee-bean">☕</span>
        <span className="coffee-bean">☕</span>
        <span className="coffee-bean">☕</span>
        <span className="coffee-bean">☕</span>
        <span className="coffee-bean">☕</span>
      </div>

      <div className="login-wrapper">
        <div className="login-card">
          {/* Logo/Brand Section */}
          <div className="brand-section">
            <div className="brand-logo-container">
              <img 
                src={logo}
                alt="1of1 Coffee" 
                className="brand-logo-image"
              />
            </div>
            <h1 className="brand-name">1of1 Coffee</h1>
            <p className="brand-tagline">Bombshelter Ordering System</p>
            <p className="brand-subtitle">Premium Coffee Experience</p>
          </div>

          <div className="auth-section">
            <div className="auth-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-subtitle">
                {isSignUp 
                  ? 'Join our coffee community' 
                  : 'Sign in to continue your coffee journey'}
              </p>
            </div>
            
            {successMessage && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'Min 6 characters' : 'Enter your password'}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Role Selection - Only show during Sign In */}
              {!isSignUp && (
                <div className="form-group">
                  <label>I am a...</label>
                  <div className="role-select-wrapper">
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      className="role-select"
                    >
                      <option value="customer">☕ Customer</option>
                      <option value="employee">👨‍🍳 Employee</option>
                      <option value="owner">👑 Owner</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Sign Up Note - Only show during Sign Up */}
              {isSignUp && (
                <div className="signup-note">
                  <span className="note-icon">ℹ️</span>
                  <p>By creating an account, you'll be registered as a <strong>Customer</strong>. 
                  Employee and Owner accounts are managed by the system administrator.</p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    Processing...
                  </span>
                ) : (
                  <span>
                    {isSignUp ? '✨ Create Account' : '☕ Sign In'}
                  </span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <button 
                className="toggle-auth-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMessage('');
                  // Reset role to customer when switching to sign up
                  if (!isSignUp) {
                    setRole('customer');
                  }
                }}
              >
                {isSignUp ? (
                  <span>Already have an account? <strong>Sign In</strong></span>
                ) : (
                  <span>New to 1of1 Coffee? <strong>Create Account</strong></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative right side - Coffee Art */}
        <div className="login-art">
          <div className="art-content">
            <div className="art-icon">☕</div>
            <h3>Fresh Brewed</h3>
            <p>Every cup tells a story</p>
            <div className="art-decoration">
              <span className="art-line"></span>
              <span className="art-dot">●</span>
              <span className="art-line"></span>
            </div>
            <div className="art-features">
              <div className="art-feature">
                <span>✦</span>
                <span>Premium Beans</span>
              </div>
              <div className="art-feature">
                <span>✦</span>
                <span>Expertly Roasted</span>
              </div>
              <div className="art-feature">
                <span>✦</span>
                <span>Perfectly Brewed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;