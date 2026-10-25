// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

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

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// ============================================
// EMAIL VERIFICATION MODAL
// ============================================
function VerifyEmailModal({ isOpen, email, onClose, onResend }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (!isOpen) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content verify-email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-icon verify-email-icon">
          <MailIcon />
        </div>

        <h3 className="success-modal-title">Verify Your Email</h3>

        <p className="success-modal-message">
          We've sent a verification link to
          <br />
          <span className="success-modal-email">{email}</span>
          <br /><br />
          Click the link in the email to activate your account.
          <br />
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', display: 'block' }}>
            Don't see it? Check your spam folder.
          </span>
        </p>

        {resent && (
          <div style={{
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            ✅ Verification email resent!
          </div>
        )}

        <div className="success-modal-actions verify-email-actions">
          <button 
            className="verify-secondary-btn" 
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? '⏳ Sending...' : '📧 Resend Email'}
          </button>
          <button className="success-modal-btn" onClick={onClose}>
            Back to Log In
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ROLE LABEL HELPER
// ============================================
const getRoleLabel = (roleKey) => {
  switch (roleKey) {
    case 'customer': return 'Customer';
    case 'employee': return 'Employee';
    case 'owner': return 'Owner';
    case 'driver': return 'Driver';
    default: return roleKey;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
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
  const [rememberMe, setRememberMe] = useState(false);

  // Email verification modal state
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');

  // ============================================
  // LOAD SAVED CREDENTIALS + clear stale session
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
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (!session.user.email_confirmed_at) {
          supabase.auth.signOut();
        }
      }
    });
  }, []);

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

  const setAuthInProgress = (val) => {
    if (typeof window.__setAuthInProgress === 'function') {
      window.__setAuthInProgress(val);
    } else if (typeof window.__setSigningUp === 'function') {
      window.__setSigningUp(val);
    }
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setAuthInProgress(true);

    try {
      if (isSignUp) {
        // ============================================
        // SIGN UP FLOW
        // ============================================
        const signUpRole = 'customer'; // Always sign up as customer by default

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
              role: signUpRole
            },
            emailRedirectTo: window.location.origin
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

        // Sign out any auto-created session
        await supabase.auth.signOut();

        // Show verification modal
        setPendingVerifyEmail(email);
        setShowVerifyEmail(true);

        // Reset form
        setName('');
        setPassword('');
        setShowPassword(false);

      } else {
        // ============================================
        // SIGN IN FLOW
        // ============================================
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          if (
            signInError.message.toLowerCase().includes('email not confirmed') ||
            signInError.message.toLowerCase().includes('email not verified')
          ) {
            setPendingVerifyEmail(email);
            setShowVerifyEmail(true);
            throw new Error('Please verify your email first. Check your inbox for the verification link.');
          }
          throw signInError;
        }

        if (!authData.user) {
          throw new Error('Sign in failed. Please try again.');
        }

        if (!authData.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setPendingVerifyEmail(email);
          setShowVerifyEmail(true);
          throw new Error('Please verify your email before signing in.');
        }

        // ✅ FETCH ROLE FROM DATABASE (Source of truth)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError || !userData) {
          console.error('Database error fetching profile:', userError);
          await supabase.auth.signOut();
          throw new Error('Could not retrieve user profile. Please contact support.');
        }

        const actualRole = userData.role;

        // ✅ ROLE VALIDATION (Compare DB role with selected dropdown)
        if (actualRole !== role) {
          await supabase.auth.signOut();
          const selectedLabel = getRoleLabel(role);
          const actualLabel = getRoleLabel(actualRole);
          throw new Error(
            `This account is registered as "${actualLabel}", but you selected "${selectedLabel}". Please select "${actualLabel}" in the dropdown and try again.`
          );
        }

        if (rememberMe) saveCredentials();
        else clearCredentials();

        setAuthInProgress(false);
        
        // Pass the database user object to App.js
        onLogin(actualRole, userData);
        return;
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
      setAuthInProgress(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
    if (!isSignUp) setRole('customer');
  };

  const handleResendVerification = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingVerifyEmail,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) {
      alert('Failed to resend: ' + error.message);
      throw error;
    }
  };

  const handleCloseVerifyModal = () => {
    setShowVerifyEmail(false);
    setIsSignUp(false);
    setRole('customer');
    setError('');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="login-container">
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
          <div className="brand-section">
            <div className="brand-logo-container">
              <img src={logo} alt="1of1 Coffee" className="brand-logo-image" />
            </div>
            <h1 className="brand-name">1of1 Coffee</h1>
            <p className="brand-tagline">Bombshelter Ordering System</p>
            <p className="brand-subtitle">Premium Coffee Experience</p>
          </div>

          <div className="auth-section">
            <div className="auth-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-subtitle">
                {isSignUp ? 'Join our coffee community' : 'Sign in to continue your coffee journey'}
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
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="form-group">
                  <label className="remember-me-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        setRememberMe(e.target.checked);
                        if (!e.target.checked) clearCredentials();
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

              {!isSignUp && (
                <div className="form-group">
                  <label>I am a...</label>
                  <div className="role-select-wrapper">
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
                      <option value="customer">☕ Customer</option>
                      <option value="employee">👨‍🍳 Employee</option>
                      <option value="driver">🛵 Driver</option>
                      <option value="owner">👑 Owner</option>
                    </select>
                  </div>
                </div>
              )}

              {isSignUp && (
                <div className="signup-note">
                  <span className="note-icon">ℹ️</span>
                  <p>
                    By creating an account, you'll be registered as a <strong>Customer</strong>.
                    You'll need to <strong>verify your email</strong> before signing in.
                  </p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    Processing...
                  </span>
                ) : (
                  <span>{isSignUp ? '✨ Create Account' : '☕ Sign In'}</span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <button className="toggle-auth-btn" onClick={handleToggleMode}>
                {isSignUp ? (
                  <span>Already have an account? <strong>Sign In</strong></span>
                ) : (
                  <span>New to 1of1 Coffee? <strong>Create Account</strong></span>
                )}
              </button>
            </div>
          </div>
        </div>

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
              <div className="art-feature"><span>✦</span><span>Premium Beans</span></div>
              <div className="art-feature"><span>✦</span><span>Expertly Roasted</span></div>
              <div className="art-feature"><span>✦</span><span>Perfectly Brewed</span></div>
            </div>
          </div>
        </div>
      </div>

      <VerifyEmailModal
        isOpen={showVerifyEmail}
        email={pendingVerifyEmail}
        onClose={handleCloseVerifyModal}
        onResend={handleResendVerification}
      />
    </div>
  );
};

export default Login;
