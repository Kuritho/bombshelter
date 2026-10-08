import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

// Import logo
import logo from '../assets/logo.jpg';

// ============================================
// ICONS
// ============================================
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // ← NEW

  // ============================================
  // LOAD SAVED CREDENTIALS ON MOUNT
  // ============================================
  useEffect(() => {
    const savedRemember = localStorage.getItem('rememberMe') === 'true';
    const savedEmail = localStorage.getItem('rememberedEmail') || '';
    const savedPassword = localStorage.getItem('rememberedPassword') || '';
    const savedRole = localStorage.getItem('rememberedRole') || 'customer';

    if (savedRemember) {
      setRememberMe(true);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRole(savedRole);
      // Only show password if it was saved (auto-fill keeps it hidden as dots)
      // Leave showPassword false for security — user can click eye to reveal
    }
  }, []);

  // ============================================
  // SAVE / CLEAR CREDENTIALS
  // ============================================
  const saveCredentials = () => {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPassword', password);
    localStorage.setItem('rememberedRole', role);
  };

  const clearCredentials = () => {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberedRole');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        // ============================================
        // SIGN UP FLOW
        // ============================================
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

        if (!authData.user) {
          throw new Error('Sign up failed. Please try again.');
        }

        console.log('✅ Auth user created:', authData.user.id);

        await new Promise(resolve => setTimeout(resolve, 800));

        let { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

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
            if (insertError.code === '23505') {
              console.log('Profile already exists, continuing...');
            } else {
              console.error('Profile insert error:', insertError);
            }
          }

          existingUser = newUser;
        }

        console.log('🔐 Auto-signing in new user...');

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error('Auto-sign-in failed:', signInError);
          setSuccessMessage('✅ Account created! Please sign in with your new credentials.');
          setIsSignUp(false);
          setPassword('');
          setShowPassword(false);
          setLoading(false);
          return;
        }

        if (signInData.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', signInData.user.id)
            .maybeSingle();

          if (!userData) {
            throw new Error('Profile not found. Please try signing in.');
          }

          // Save credentials if remember me is checked
          if (rememberMe) {
            saveCredentials();
          } else {
            clearCredentials();
          }

          console.log('✅ Signed in as:', userData);
          onLogin(userData.role, userData);
        }
      } else {
        // ============================================
        // SIGN IN FLOW
        // ============================================
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (authData.user) {
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

          if (userData.role !== role) {
            throw new Error(`This account is registered as ${userData.role}. Please select the correct role.`);
          }

          // Save credentials if remember me is checked
          if (rememberMe) {
            saveCredentials();
          } else {
            clearCredentials();
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

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
    if (!isSignUp) {
      setRole('customer');
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
                <div className="input-wrapper password-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'Min 6 characters' : 'Enter your password'}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* ============================================
                  REMEMBER ME CHECKBOX (only on Sign In)
                  ============================================ */}
              {!isSignUp && (
                <div className="form-group">
                  <label className="remember-me-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        setRememberMe(e.target.checked);
                        if (!e.target.checked) {
                          clearCredentials();
                        }
                      }}
                      className="remember-me-checkbox"
                    />
                    <span className="remember-me-custom-checkbox">
                      {rememberMe && <CheckIcon />}
                    </span>
                    <span className="remember-me-text">Remember me</span>
                  </label>
                </div>
              )}

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

              {/* Role Selection - Only during Sign In */}
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

              {/* Sign Up Note */}
              {isSignUp && (
                <div className="signup-note">
                  <span className="note-icon">ℹ️</span>
                  <p>
                    By creating an account, you'll be registered as a <strong>Customer</strong>. 
                    Employee and Owner accounts are managed by the system administrator.
                  </p>
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
                onClick={handleToggleMode}
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

        {/* Decorative right side */}
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
