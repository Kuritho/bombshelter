import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { supabase } from '../supabaseClient';
import { useOrders } from '../hooks/useSupabase';
import './EmployeeDashboard.css';

// Import logo
import logo from '../assets/logo.jpg';

// ============================================
// ICONS
// ============================================
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ============================================
// CONFIRMATION MODAL COMPONENT
// ============================================
function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Yes, Confirm', 
  cancelText = 'No, Cancel',
  onConfirm, 
  onCancel,
  isLoading = false,
  variant = 'warning'
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div 
        className={`confirm-modal-content confirm-modal-${variant}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-icon">
          <WarningIcon />
        </div>
        
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        
        <div className="confirm-modal-actions">
          <button 
            className="confirm-btn confirm-btn-no"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn confirm-btn-yes confirm-btn-yes-${variant}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Flexible parser for common GCash / Maya receipt layouts. OCR is advisory only.
const parsePaymentReceiptText = (rawText) => {
  const normalized = String(rawText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t ]+/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);
  const compact = normalized.replace(/\n/g, ' ');
  const amountPattern = /(?:PHP|₱|\bP\.?\s*)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi;
  const currencyAmounts = [...compact.matchAll(amountPattern)]
    .map(match => Number(match[1].replace(/,/g, '')))
    .filter(value => Number.isFinite(value) && value > 0);
  const labeledAmount = compact.match(/(?:amount(?:\s+(?:sent|paid|transferred|received))?|total\s+amount|amount\s+of|payment\s+amount|you\s+sent|sent\s+amount)\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  const totalAmount = compact.match(/\btotal\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  let amount = null;
  const amountCandidate = labeledAmount || totalAmount;
  if (amountCandidate) {
    const parsed = Number(amountCandidate[1].replace(/,/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) amount = parsed;
  } else if (currencyAmounts.length) amount = currencyAmounts[0];

  // Reference labels often appear on one line and the value on the next.
  let reference = '';
  const refLabel = /(?:reference(?:\s*(?:number|no\.?|#))?|ref\.?\s*(?:number|no\.?|#)?|transaction\s*(?:id|number|no\.?|#)|txn\.?\s*(?:id|no\.?|#)|trace\s*(?:id|number|no\.?|#))/i;
  for (let i = 0; i < lines.length && !reference; i++) {
    if (!refLabel.test(lines[i])) continue;
    let candidate = lines[i].replace(refLabel, '').replace(/^\s*(?:number|no\.?|id|#)?\s*[:#\-]?\s*/i, '').trim();
    if (!candidate && lines[i + 1]) candidate = lines[i + 1].trim();
    candidate = candidate.replace(/^(?:number|no\.?|id|#)\s*[:#\-]?\s*/i, '').trim();
    const token = candidate.match(/[A-Z0-9][A-Z0-9\-]{3,}/i);
    if (token && !/^(reference|transaction|number|success|completed|payment)$/i.test(token[0])) reference = token[0].replace(/[.,:;]+$/, '');
  }
  if (!reference) {
    const fallbackRef = compact.match(/\b(?:reference|ref|transaction|txn|trace)\s*(?:number|no\.?|id|#)?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\-]{5,})/i);
    if (fallbackRef) reference = fallbackRef[1].replace(/[.,:;]+$/, '');
  }

  let accountName = '';
  const nameLabels = /(?:account\s*(?:holder\s*)?name|sender\s*name|sender|paid\s*by|sent\s*by|from\s*name|transfer\s*from|account\s*holder|\bfrom)\s*[:\-]?\s*/i;
  for (let i = 0; i < lines.length && !accountName; i++) {
    if (!nameLabels.test(lines[i])) continue;
    let candidate = lines[i].replace(nameLabels, '').trim();
    if (!candidate && lines[i + 1]) candidate = lines[i + 1].trim();
    candidate = candidate.replace(/\s{2,}/g, ' ').replace(/[|•]+$/g, '').trim();
    if (candidate && candidate.length >= 2 && !/^(date|time|amount|reference|transaction|successful|completed|details)$/i.test(candidate)) accountName = candidate.slice(0, 100);
  }

  const dateRegex = /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/i;
  let transactionDate = '';
  for (let i = 0; i < lines.length && !transactionDate; i++) {
    if (/\b(date|transaction date|paid on|sent on|completed on)\b/i.test(lines[i])) {
      const match = lines[i].match(dateRegex) || (lines[i + 1] || '').match(dateRegex);
      if (match) transactionDate = match[1];
    }
  }
  if (!transactionDate) {
    const match = normalized.match(dateRegex);
    if (match) transactionDate = match[1];
  }
  return { text: normalized, amount, reference, accountName, transactionDate };
};

// Try two Tesseract page layouts because mobile-wallet receipts vary widely.
// Keep the result that yields the most recognizable fields and useful text.
const recognizePaymentReceipt = async (worker, image) => {
  const candidates = [];
  for (const pageSegMode of ['6', '11']) {
    try {
      if (worker.setParameters) await worker.setParameters({ tessedit_pageseg_mode: pageSegMode });
    } catch (parameterError) {
      console.debug('Could not set Tesseract page segmentation mode:', parameterError);
    }
    const { data } = await worker.recognize(image);
    const parsed = parsePaymentReceiptText(data?.text || '');
    const fieldCount = [parsed.amount != null, !!parsed.reference, !!parsed.accountName, !!parsed.transactionDate].filter(Boolean).length;
    const score = fieldCount * 1000 + Math.min(parsed.text.length, 999);
    candidates.push({ parsed, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.parsed || parsePaymentReceiptText('');
};

// ============================================
// MAIN COMPONENT
// ============================================
function EmployeeDashboard({ user, onLogout }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ocrLoadingOrderId, setOcrLoadingOrderId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('info');
  const [activeTab, setActiveTab] = useState('orders');
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Yes, Confirm',
    cancelText: 'No, Cancel',
    onConfirm: null,
    variant: 'warning',
    isLoading: false
  });

  const openConfirm = ({ 
    title, message, confirmText, cancelText, onConfirm, variant = 'warning' 
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText: confirmText || 'Yes, Confirm',
      cancelText: cancelText || 'No, Cancel',
      onConfirm,
      variant,
      isLoading: false
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null, isLoading: false }));
  };
  
  // ⚠️ IMPORTANT: useOrders returns `refresh`, not `refetch`
  const { 
    orders, 
    updateOrderStatus, 
    updatePaymentStatus, 
    refresh: refreshOrders 
  } = useOrders();

  // Real-time subscription for new orders
  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setNotificationType('success');
          setNotification(`📦 New Order Received from ${payload.new.users?.name || 'Customer'}`);
          refreshOrders();
          setTimeout(() => setNotification(null), 5000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: 'status=eq.pending' },
        () => { refreshOrders(); }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [refreshOrders]);

  // ============================================
  // LOGOUT — WITH CONFIRMATION
  // ============================================
  const handleLogout = () => {
    openConfirm({
      title: 'Log Out?',
      message: 'Are you sure you want to log out of your account?',
      confirmText: 'Yes, Log Out',
      cancelText: 'No, Stay',
      variant: 'warning',
      onConfirm: () => {
        closeConfirm();
        onLogout();
      }
    });
  };

  // ============================================
  // PROFILE HANDLERS — WITH CONFIRMATION
  // ============================================
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    if (profile.name === user?.name) {
      alert('No changes to save.');
      return;
    }

    openConfirm({
      title: 'Update Profile?',
      message: `Are you sure you want to change your name to "${profile.name}"?`,
      confirmText: 'Yes, Update',
      cancelText: 'No, Cancel',
      variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

        try {
          const { error: updateError } = await supabase
            .from('users')
            .update({ name: profile.name })
            .eq('id', user.id);

          if (updateError) throw updateError;

          setProfileSuccess('✅ Profile updated successfully!');
          setIsEditingProfile(false);
          user.name = profile.name;
          
          setTimeout(() => setProfileSuccess(''), 3000);
        } catch (err) {
          setProfileError(err.message || 'Failed to update profile');
        } finally {
          setProfileLoading(false);
        }
      }
    });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setProfileError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setProfileError('New password must be at least 6 characters');
      return;
    }

    openConfirm({
      title: 'Change Password?',
      message: 'Are you sure you want to change your account password? You will need to use the new password on your next login.',
      confirmText: 'Yes, Change Password',
      cancelText: 'No, Cancel',
      variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        setProfileLoading(true);

        try {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: passwordData.newPassword
          });

          if (passwordError) throw passwordError;

          setProfileSuccess('✅ Password updated successfully!');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          
          setTimeout(() => setProfileSuccess(''), 3000);
        } catch (err) {
          setProfileError(err.message || 'Failed to update password');
        } finally {
          setProfileLoading(false);
        }
      }
    });
  };

  const downloadOcrReport = (order) => {
    const report = [
      'PAYMENT RECEIPT OCR REPORT',
      `Order: ${order.order_number || order.id}`,
      `Customer: ${order.users?.name || 'Unknown'}`,
      `Order total: PHP ${Number(order.total_amount || 0).toFixed(2)}`,
      `Payment method: ${order.payment_method || 'Unknown'}`,
      `Detected amount: ${order.ocr_detected_amount != null ? `PHP ${Number(order.ocr_detected_amount).toFixed(2)}` : 'Not detected'}`,
      `Reference / transaction number: ${order.ocr_reference_number || 'Not detected'}`,
      `Account / sender name: ${order.ocr_account_name || 'Not detected'}`,
      `Transaction date: ${order.ocr_transaction_date || 'Not detected'}`,
      `Payment decision: ${order.payment_status || 'unverified'}`,
      `Generated at: ${new Date().toLocaleString()}`,
      '',
      'FULL EXTRACTED TEXT',
      order.ocr_extracted_text || 'No OCR text is saved for this order.',
      '',
      'NOTE: OCR results are estimates only. This report is not proof that a payment was made. Verify the original receipt and transaction manually.'
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `payment-ocr-${String(order.order_number || order.id).replace(/[^a-z0-9_-]/gi, '_')}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const runOcrForSelectedOrder = async (order) => {
    if (!order?.proof_image_url) return;
    setOcrLoadingOrderId(order.id);
    let worker;
    try {
      const response = await fetch(order.proof_image_url, { mode: 'cors' });
      if (!response.ok) throw new Error(`Could not load receipt image (HTTP ${response.status}).`);
      const imageBlob = await response.blob();
      worker = await createWorker('eng');
      const extracted = await recognizePaymentReceipt(worker, imageBlob);
      const update = {
        ocr_detected_amount: extracted.amount,
        ocr_reference_number: extracted.reference || null,
        ocr_account_name: extracted.accountName || null,
        ocr_transaction_date: extracted.transactionDate || null,
        ocr_extracted_text: extracted.text || null
      };
      const { error } = await supabase.from('orders').update(update).eq('id', order.id);
      if (error) throw error;
      const updatedOrder = { ...order, ...update };
      setSelectedOrder(updatedOrder);
      await refreshOrders();
      setNotificationType('success');
      setNotification(extracted.text ? 'OCR extraction updated. Please review the results manually.' : 'OCR could not read text from this image. Please inspect the receipt manually.');
      setTimeout(() => setNotification(null), 4500);
    } catch (error) {
      console.error('Employee receipt OCR failed:', error);
      alert(`Could not run OCR on this receipt. ${error.message || 'Check the image URL, network, and Supabase Storage CORS settings.'}`);
    } finally {
      if (worker) await worker.terminate();
      setOcrLoadingOrderId(null);
    }
  };

  // ============================================
  // PAYMENT STATUS — WITH CONFIRMATION
  // ============================================
  const handleUpdatePaymentStatus = (orderId, status) => {
    const statusLabels = { confirmed: 'Accept', rejected: 'Reject' };
    const label = statusLabels[status] || status;

    openConfirm({
      title: `${label} Payment?`,
      message: status === 'confirmed'
        ? 'Accept this payment after checking the original receipt and transaction in the payment app?'
        : 'Reject this payment? The customer will see that the payment was rejected.',
      confirmText: `Yes, ${label}`,
      cancelText: 'No, Cancel',
      variant: status === 'confirmed' ? 'warning' : 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          await updatePaymentStatus(orderId, status);
          
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, payment_status: status });
          }
          refreshOrders();
          
          setNotificationType('info');
          setNotification(`💳 Payment status updated to: ${label}`);
          setTimeout(() => setNotification(null), 3000);
          
          closeConfirm();
        } catch (error) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          alert('❌ Failed to update payment status: ' + error.message);
        }
      }
    });
  };

  // ============================================
  // ORDER STATUS — WITH CONFIRMATION
  // ============================================
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const statusLabels = {
      preparing: 'Preparing',
      processing: 'Processing',
      completed: 'Completed',
      declined: 'Declined'
    };
    const label = statusLabels[newStatus] || newStatus;
    const isDestructive = newStatus === 'declined';

    openConfirm({
      title: `${label} Order?`,
      message: isDestructive
        ? `Are you sure you want to decline this order? The customer will be notified and cannot recover the order.`
        : `Are you sure you want to mark this order as "${label}"?`,
      confirmText: `Yes, Mark as ${label}`,
      cancelText: 'No, Cancel',
      variant: isDestructive ? 'danger' : 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          await updateOrderStatus(orderId, newStatus);
          
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
          }
          refreshOrders();
          
          setNotificationType('success');
          setNotification(`✅ Order status updated to: ${label}`);
          setTimeout(() => setNotification(null), 3000);
          
          closeConfirm();
          // Close the modal after successful update
          setTimeout(() => setSelectedOrder(null), 800);
        } catch (error) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          alert('❌ Failed to update order status: ' + error.message);
        }
      }
    });
  };

  const getOrderCount = (status) => {
    return orders.filter(o => o.status === status).length;
  };

  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
      <div className="order-card-header">
        <span className="order-id">#{order.order_number || order.id.slice(0, 8)}</span>
        <span className="order-time">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="customer-name">
        <span className="customer-icon">👤</span>
        {order.users?.name || 'Guest'}
      </div>
      <div className="order-items-preview">
        {order.order_items?.slice(0, 3).map((item, idx) => (
          <span key={idx} className="item-tag">
            {item.quantity}x {item.menu_items?.name || 'Item'}
          </span>
        ))}
        {order.order_items?.length > 3 && (
          <span className="item-tag more">+{order.order_items.length - 3} more</span>
        )}
      </div>
      <div className="order-card-footer">
        <span className="order-total">₱{order.total_amount}</span>
        <span className={`payment-status-badge ${order.payment_status}`}>
          {(order.payment_status === 'confirmed' || order.payment_status === 'valid') && '✅ Accepted'}
          {order.payment_status === 'rejected' && '❌ Rejected'}
          {(order.payment_status === 'unverified' || order.payment_status === 'underpayment' || order.payment_status === 'overpayment' || !order.payment_status) && '⏳ Pending Review'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="employee-dashboard">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notificationType}`}>
          <span className="notification-icon">
            {notificationType === 'success' ? '✅' : notificationType === 'info' ? 'ℹ️' : '🔔'}
          </span>
          <span className="notification-message">{notification}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="brand-logo">
            <img src={logo} alt="1of1 Coffee" className="brand-logo-image" />
            <div className="brand-text">
              <h1>1of1 Coffee</h1>
              <span className="brand-subtitle">Employee Portal</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.name || 'Staff'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOutIcon /> Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <OrdersIcon />
          <span>Orders</span>
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <span className="nav-badge">
              {orders.filter(o => o.status === 'pending').length}
            </span>
          )}
        </button>
        <button 
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('profile');
            setProfileError('');
            setProfileSuccess('');
          }}
        >
          <UserIcon />
          <span>Profile</span>
        </button>
      </nav>

      {/* Stats Overview */}
      {activeTab === 'orders' && (
        <>
          <div className="stats-overview">
            <div className="stat-card pending-stat">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-number">{getOrderCount('pending')}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            <div className="stat-card preparing-stat">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <span className="stat-number">{getOrderCount('preparing')}</span>
                <span className="stat-label">Preparing</span>
              </div>
            </div>
            <div className="stat-card completed-stat">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">{getOrderCount('completed')}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="stat-card declined-stat">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <span className="stat-number">{getOrderCount('declined')}</span>
                <span className="stat-label">Declined</span>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="kanban-board">
            <div className="kanban-column">
              <div className="column-header pending">
                <span className="column-title"><ClockIcon /> Pending</span>
                <span className="order-count">{getOrderCount('pending')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'pending').length === 0 ? (
                  <div className="empty-column">
                    <span className="empty-icon">✅</span>
                    <p>No pending orders</p>
                  </div>
                ) : (
                  orders.filter(o => o.status === 'pending').map(renderOrderCard)
                )}
              </div>
            </div>

            <div className="kanban-column">
              <div className="column-header preparing">
                <span className="column-title"><PackageIcon /> Preparing</span>
                <span className="order-count">{getOrderCount('preparing')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'preparing').length === 0 ? (
                  <div className="empty-column">
                    <span className="empty-icon">📦</span>
                    <p>No orders preparing</p>
                  </div>
                ) : (
                  orders.filter(o => o.status === 'preparing').map(renderOrderCard)
                )}
              </div>
            </div>

            <div className="kanban-column">
              <div className="column-header completed">
                <span className="column-title"><CheckIcon /> Completed</span>
                <span className="order-count">{getOrderCount('completed')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'completed').length === 0 ? (
                  <div className="empty-column">
                    <span className="empty-icon">📋</span>
                    <p>No completed orders</p>
                  </div>
                ) : (
                  orders.filter(o => o.status === 'completed').map(renderOrderCard)
                )}
              </div>
            </div>

            <div className="kanban-column">
              <div className="column-header declined">
                <span className="column-title"><XIcon /> Declined</span>
                <span className="order-count">{getOrderCount('declined')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'declined').length === 0 ? (
                  <div className="empty-column">
                    <span className="empty-icon">👍</span>
                    <p>No declined orders</p>
                  </div>
                ) : (
                  orders.filter(o => o.status === 'declined').map(renderOrderCard)
                )}
              </div>
            </div>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-title">
                    <span className="modal-icon">📋</span>
                    <h2>Order Details</h2>
                  </div>
                  <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                </div>
                
                <div className="modal-body">
                  <div className="modal-body-left">
                    {/* Order Info */}
                    <div className="detail-section">
                      <div className="section-header">
                        <span className="section-icon">📄</span>
                        <h3>Order Information</h3>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Order #</span>
                        <span className="detail-value">{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status</span>
                        <span className={`order-status-badge ${selectedOrder.status}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Payment</span>
                        <span className={`payment-status-badge ${selectedOrder.payment_status}`}>
                          {selectedOrder.payment_status === 'confirmed' || selectedOrder.payment_status === 'valid'
                            ? 'Accepted'
                            : selectedOrder.payment_status === 'rejected'
                              ? 'Rejected'
                              : 'Pending Review'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Order Type</span>
                        <span className="detail-value">
                          {selectedOrder.order_type === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Customer</span>
                        <span className="detail-value">
                          <strong>{selectedOrder.users?.name || 'Guest'}</strong>
                          {selectedOrder.users?.email && (
                            <span style={{color: '#94a3b8', fontSize: '0.85rem', marginLeft: '0.5rem'}}>
                              ({selectedOrder.users.email})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Ordered</span>
                        <span className="detail-value">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="detail-section">
                      <div className="section-header">
                        <span className="section-icon">🛍️</span>
                        <h3>Order Items</h3>
                      </div>
                      {selectedOrder.order_items?.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <span className="item-name">{item.quantity}x {item.menu_items?.name || 'Item'}</span>
                          <span className="item-price">₱{item.price_at_time * item.quantity}</span>
                        </div>
                      ))}
                      <div className="item-row total">
                        <span>Total</span>
                        <span>₱{selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-body-right">
                    {/* Payment Proof */}
                    <div className="detail-section">
                      <div className="section-header">
                        <span className="section-icon">💳</span>
                        <h3>Payment Proof</h3>
                      </div>
                      {selectedOrder.proof_image_url ? (
                        <div className="proof-container">
                          <img src={selectedOrder.proof_image_url} alt="Payment Proof" className="proof-image" />
                        </div>
                      ) : (
                        <div className="proof-placeholder">
                          <span className="placeholder-icon">📷</span>
                          <p>No payment proof uploaded</p>
                        </div>
                      )}

                      <div className="detail-section ocr-review-section" style={{ marginTop: '1rem' }}>
                        <div className="section-header">
                          <span className="section-icon">🔎</span>
                          <h3>OCR Extraction (Review Manually)</h3>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Detected Amount</span>
                          <span className="detail-value">
                            {selectedOrder.ocr_detected_amount !== null && selectedOrder.ocr_detected_amount !== undefined
                              ? `₱${Number(selectedOrder.ocr_detected_amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : 'Not detected'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Reference / Transaction No.</span>
                          <span className="detail-value" style={{ overflowWrap: 'anywhere' }}>
                            {selectedOrder.ocr_reference_number || 'Not detected'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Account / Sender Name</span>
                          <span className="detail-value">{selectedOrder.ocr_account_name || 'Not detected'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Transaction Date</span>
                          <span className="detail-value">{selectedOrder.ocr_transaction_date || 'Not detected'}</span>
                        </div>
                        {selectedOrder.ocr_detected_amount !== null && selectedOrder.ocr_detected_amount !== undefined &&
                          Math.abs(Number(selectedOrder.ocr_detected_amount) - Number(selectedOrder.total_amount)) > 0.009 && (
                            <p style={{ color: '#fbbf24', margin: '0.5rem 0', lineHeight: 1.5 }}>
                              ⚠️ OCR amount differs from the order total. Check the original receipt.
                            </p>
                          )}
                        <details style={{ marginTop: '0.65rem' }}>
                          <summary style={{ cursor: 'pointer' }}>View full extracted text</summary>
                          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: '220px', overflow: 'auto', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            {selectedOrder.ocr_extracted_text || 'No OCR text was saved for this order.'}
                          </pre>
                        </details>
                        <div className="ocr-tool-buttons">
                          <button
                            type="button"
                            className="btn btn-ocr-download"
                            onClick={() => downloadOcrReport(selectedOrder)}
                          >
                            ⬇ Download OCR Report (.txt)
                          </button>
                          {selectedOrder.proof_image_url && (
                            <button
                              type="button"
                              className="btn btn-ocr-rerun"
                              disabled={ocrLoadingOrderId === selectedOrder.id}
                              onClick={() => runOcrForSelectedOrder(selectedOrder)}
                            >
                              {ocrLoadingOrderId === selectedOrder.id ? '⏳ Reading receipt…' : '🔄 Run OCR Again'}
                            </button>
                          )}
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.5, marginTop: '0.65rem' }}>
                          OCR can misread receipts and does not confirm that a transfer occurred. Verify the image and transaction manually before updating payment status.
                        </p>
                      </div>
                      
                      <div className="payment-actions">
                        <h4>Payment Decision</h4>
                        <div className="action-buttons payment-decision-buttons">
                          <button
                            type="button"
                            className="btn btn-accept"
                            onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'confirmed')}
                          >
                            ✓ Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-reject"
                            onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'rejected')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="detail-section actions-section">
                      <div className="section-header">
                        <span className="section-icon">⚡</span>
                        <h3>Order Actions</h3>
                      </div>
                      {selectedOrder.status === 'pending' && (
                        <>
                          <div className="action-warning">
                            {selectedOrder.payment_status !== 'confirmed' && selectedOrder.payment_status !== 'valid' && (
                              <p className="warning-text">⚠️ Payment must be accepted before preparing.</p>
                            )}
                          </div>
                          <div className="order-actions">
                            <button 
                              className="btn btn-primary"
                              disabled={selectedOrder.payment_status !== 'confirmed' && selectedOrder.payment_status !== 'valid'}
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'preparing')}
                            >
                              📦 Start Preparing
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'declined')}
                            >
                              ❌ Decline Order
                            </button>
                          </div>
                        </>
                      )}
                      {selectedOrder.status === 'preparing' && (
                        <button 
                          className="btn btn-success"
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                        >
                          ✅ Mark as Completed
                        </button>
                      )}
                      {selectedOrder.status === 'completed' && (
                        <div className="status-message success">
                          <span>✅</span>
                          <p>This order is completed.</p>
                        </div>
                      )}
                      {selectedOrder.status === 'declined' && (
                        <div className="status-message error">
                          <span>❌</span>
                          <p>This order was declined.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="profile-view">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                <span className="avatar-icon">👨‍🍳</span>
              </div>
              <div className="profile-title">
                <h2>Employee Profile</h2>
                <p>Manage your account settings</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="profile-success">
                <span>✅</span>
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="profile-error">
                <span>❌</span>
                {profileError}
              </div>
            )}

            <div className="profile-grid">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3><span className="card-icon">📝</span> Profile Information</h3>
                  {!isEditingProfile && (
                    <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
                      <EditIcon /> Edit
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="Enter your full name" required />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={profile.email} disabled className="disabled-input" />
                      <span className="input-hint">Email cannot be changed</span>
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input type="text" value="Employee" disabled className="disabled-input" />
                    </div>
                    <div className="profile-actions">
                      <button type="button" className="btn-cancel" onClick={() => {
                        setIsEditingProfile(false);
                        setProfile({...profile, name: user?.name || ''});
                      }}>Cancel</button>
                      <button type="submit" className="btn-save" disabled={profileLoading}>
                        {profileLoading ? 'Saving...' : <><SaveIcon /> Save Changes</>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-display">
                    <div className="profile-field">
                      <span className="field-label">Name</span>
                      <span className="field-value">{profile.name}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Email</span>
                      <span className="field-value">{profile.email}</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Role</span>
                      <span className="field-value role-badge employee">Employee</span>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Member Since</span>
                      <span className="field-value">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-card">
                <div className="profile-card-header">
                  <h3><span className="card-icon">🔒</span> Change Password</h3>
                </div>

                <form onSubmit={handlePasswordUpdate} className="profile-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="Enter current password" required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Min 6 characters" required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password" required minLength={6} />
                  </div>
                  <button type="submit" className="btn-save-password" disabled={profileLoading}>
                    {profileLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}

export default EmployeeDashboard;
