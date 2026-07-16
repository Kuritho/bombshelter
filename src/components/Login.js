import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

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
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          let { data: existingUser, error: fetchError } = await supabase
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
              console.error('Insert error:', insertError);
              throw new Error('Account created but couldn\'t create profile. Please try signing in.');
            }

            if (newUser) {
              console.log('Profile created successfully:', newUser);
              onLogin(signUpRole, newUser);
              setSuccessMessage('Account created successfully! Logging you in...');
            }
          } else {
            console.log('Profile already exists:', existingUser);
            onLogin(signUpRole, existingUser);
            setSuccessMessage('Account created successfully! Logging you in...');
          }
        }
      } else {
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
      {/* Decorative food icons background */}
      <div className="food-bg-decoration">
        <span className="food-icon">🍔</span>
        <span className="food-icon">🍕</span>
        <span className="food-icon">🌮</span>
        <span className="food-icon">🍣</span>
        <span className="food-icon">🥗</span>
        <span className="food-icon">🍝</span>
        <span className="food-icon">🥘</span>
        <span className="food-icon">🍰</span>
        <span className="food-icon">🥤</span>
        <span className="food-icon">🍩</span>
        <span className="food-icon">🌯</span>
        <span className="food-icon">🍜</span>
      </div>

      <div className="login-wrapper">
        <div className="login-card">
          {/* Logo/Brand Section */}
          <div className="brand-section">
            <div className="brand-icon">🍽️</div>
            <h1 className="brand-name">Bombshelter</h1>
            <p className="brand-tagline">Ordering System</p>
            <p className="brand-subtitle">Delicious food delivered to your doorstep</p>
          </div>

          <div className="auth-section">
            <div className="auth-header">
              <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-subtitle">
                {isSignUp 
                  ? 'Join us and start ordering your favorites' 
                  : 'Sign in to continue ordering'}
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
                    <span className="input-icon">👤</span>
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

              <div className="form-group">
                <label>I am a...</label>
                <div className="role-select-wrapper">
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="role-select"
                  >
                    <option value="customer">🍽️ Customer</option>
                    <option value="employee">👨‍🍳 Employee</option>
                    <option value="owner">👑 Owner</option>
                  </select>
                </div>
                {isSignUp && (
                  <p className="role-note">
                    ℹ️ Only Customer accounts can be created here. 
                    Employee accounts are created by the Owner.
                  </p>
                )}
              </div>

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
                    {isSignUp ? '✨ Create Account' : '🍽️ Sign In'}
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
                }}
              >
                {isSignUp ? (
                  <span>Already have an account? <strong>Sign In</strong></span>
                ) : (
                  <span>New to Bombshelter? <strong>Create Account</strong></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative right side - Food Art */}
        <div className="login-art">
          <div className="art-content">
            <div className="art-icon-grid">
              <span className="art-food-icon">🍔</span>
              <span className="art-food-icon">🍕</span>
              <span className="art-food-icon">🌮</span>
              <span className="art-food-icon">🍣</span>
              <span className="art-food-icon">🥗</span>
              <span className="art-food-icon">🍝</span>
            </div>
            <h3>Order Anything</h3>
            <p>From burgers to sushi, we've got you covered</p>
            <div className="art-decoration">
              <span className="art-line"></span>
              <span className="art-dot">●</span>
              <span className="art-line"></span>
            </div>
            <div className="art-features">
              <div className="art-feature">
                <span>✦</span>
                <span>Wide Variety</span>
              </div>
              <div className="art-feature">
                <span>✦</span>
                <span>Quick Delivery</span>
              </div>
              <div className="art-feature">
                <span>✦</span>
                <span>Best Quality</span>
              </div>
              <div className="art-feature">
                <span>✦</span>
                <span>Affordable Prices</span>
              </div>
            </div>
            <div className="art-order-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Food Items</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;