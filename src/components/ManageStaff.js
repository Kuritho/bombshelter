// src/components/ManageStaff.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ManageStaff.css';

export default function ManageStaff({ currentUser }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employee'); // 'employee' or 'driver'
  
  // Create Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch all staff (employees + drivers)
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['employee', 'driver'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter list based on active tab
  const filteredStaff = staff.filter(s => s.role === activeTab);

  // Handle Account Creation
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Create Auth User using Supabase Auth API
      // Note: We use a secondary client to avoid logging out the current Owner
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          }
        }
      });

      if (authError) throw authError;

      // 2. Insert into public.users table
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            role: formData.role
          }]);

        if (dbError) throw dbError;
      }

      setMessage({ type: 'success', text: `✅ Successfully created ${formData.role} account!` });
      setFormData({ name: '', email: '', password: '', role: activeTab });
      fetchStaff();
    } catch (err) {
      setMessage({ type: 'error', text: '❌ ' + (err.message || 'Failed to create account') });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Role Switch
  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      fetchStaff(); // Refresh list
      setMessage({ type: 'success', text: '✅ Role updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to update role: ' + err.message });
    }
  };

  return (
    <div className="manage-staff-container">
      <div className="staff-header">
        <div>
          <h2>Manage Accounts</h2>
          <p>Create and manage employee and driver access.</p>
        </div>
      </div>

      {message.text && (
        <div className={`staff-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* TABS */}
      <div className="staff-tabs">
        <button 
          className={`staff-tab ${activeTab === 'employee' ? 'active' : ''}`}
          onClick={() => { setActiveTab('employee'); setFormData({ ...formData, role: 'employee' }); }}
        >
          👨‍🍳 Employees ({staff.filter(s => s.role === 'employee').length})
        </button>
        <button 
          className={`staff-tab ${activeTab === 'driver' ? 'active' : ''}`}
          onClick={() => { setActiveTab('driver'); setFormData({ ...formData, role: 'driver' }); }}
        >
          🛵 Drivers ({staff.filter(s => s.role === 'driver').length})
        </button>
      </div>

      <div className="staff-content-grid">
        {/* LEFT: LIST */}
        <div className="staff-list-section">
          <h3>{activeTab === 'employee' ? 'Employee' : 'Driver'} List</h3>
          {loading ? (
            <p className="staff-loading">Loading...</p>
          ) : filteredStaff.length === 0 ? (
            <p className="staff-empty">No {activeTab}s found.</p>
          ) : (
            <div className="staff-list">
              {filteredStaff.map(user => (
                <div key={user.id} className="staff-card">
                  <div className="staff-avatar">
                    {activeTab === 'employee' ? '👨‍🍳' : '🛵'}
                  </div>
                  <div className="staff-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                  <div className="staff-actions">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="employee">Employee</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: CREATE FORM */}
        <div className="staff-create-section">
          <h3>Create New {activeTab === 'employee' ? 'Employee' : 'Driver'}</h3>
          <form onSubmit={handleCreateAccount} className="staff-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Juan Dela Cruz"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. juan@1of1coffee.com"
              />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input 
                type="password" 
                required 
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="role-select"
              >
                <option value="employee">Employee</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            
            <button type="submit" className="btn-create-account" disabled={isCreating}>
              {isCreating ? 'Creating Account...' : `Create ${formData.role === 'employee' ? 'Employee' : 'Driver'} Account`}
            </button>
            
            <p className="form-hint">
              ⚠️ Make sure to give the email and password to the {formData.role}. They will be prompted to change it upon their first login.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}