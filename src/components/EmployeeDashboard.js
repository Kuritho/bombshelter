import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { supabase } from '../supabaseClient';
import { useOrders, useMenuItems, useCategories } from '../hooks/useSupabase';
import {
  initStorage,
  uploadImage as uploadImageUtil,
  testDirectBucketAccess
} from '../utils/storage';
import './EmployeeDashboard.css';

import logo from '../assets/logo.jpg';

// ============================================
// ICONS (all your existing icons unchanged)
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

// ➕ NEW: upload icon
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// ============================================
// CONFIRMATION MODAL (unchanged)
// ============================================
function ConfirmModal({
  isOpen, title, message,
  confirmText = 'Yes, Confirm', cancelText = 'No, Cancel',
  onConfirm, onCancel, isLoading = false, variant = 'warning'
}) {
  if (!isOpen) return null;
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className={`confirm-modal-content confirm-modal-${variant}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon"><WarningIcon /></div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-btn confirm-btn-no" onClick={onCancel} disabled={isLoading}>{cancelText}</button>
          <button className={`confirm-btn confirm-btn-yes confirm-btn-yes-${variant}`} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '⏳ Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OCR PARSER (improved — see section 4 below)
// ============================================
const parsePaymentReceiptText = (rawText) => {
  const normalized = String(rawText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t ]+/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
  const compact = normalized.replace(/\n/g, ' ');

  const amountPattern = /(?:PHP|₱|\bP\.?\s*)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/gi;
  const currencyAmounts = [...compact.matchAll(amountPattern)]
    .map(m => Number(m[1].replace(/,/g, '')))
    .filter(v => Number.isFinite(v) && v > 0);
  const labeledAmount = compact.match(/(?:amount(?:\s+(?:sent|paid|transferred|received))?|total\s+amount|amount\s+of|payment\s+amount|you\s+sent|sent\s+amount)\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  const totalAmount = compact.match(/\btotal\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  let amount = null;
  const amountCandidate = labeledAmount || totalAmount;
  if (amountCandidate) {
    const parsed = Number(amountCandidate[1].replace(/,/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) amount = parsed;
  } else if (currencyAmounts.length) amount = currencyAmounts[0];

  // --- Reference number ---
  let reference = '';
  const refLabel = /(?:reference(?:\s*(?:number|no\.?|#))?|ref\.?\s*(?:number|no\.?|#)?|transaction\s*(?:id|number|no\.?|#)|txn\.?\s*(?:id|no\.?|#)|trace\s*(?:id|number|no\.?|#))/i;
  for (let i = 0; i < lines.length && !reference; i++) {
    if (!refLabel.test(lines[i])) continue;
    let candidate = lines[i].replace(refLabel, '').replace(/^\s*(?:number|no\.?|id|#)?\s*[:#\-]?\s*/i, '').trim();
    if (!candidate && lines[i + 1]) candidate = lines[i + 1].trim();
    candidate = candidate.replace(/^(?:number|no\.?|id|#)\s*[:#\-]?\s*/i, '').trim();
    const token = candidate.match(/[A-Z0-9][A-Z0-9\-]{3,}/i);
    if (token && !/^(reference|transaction|number|success|completed|payment)$/i.test(token[0])) {
      reference = token[0].replace(/[.,:;]+$/, '');
    }
  }
  if (!reference) {
    const fallbackRef = compact.match(/\b(?:reference|ref|transaction|txn|trace)\s*(?:number|no\.?|id|#)?\s*[:#\-]?\s*([A-Z0-9][A-Z0-9\-]{5,})/i);
    if (fallbackRef) reference = fallbackRef[1].replace(/[.,:;]+$/, '');
  }

  // --- ➕ NEW: Account/sender name (permissive, accepts *, ., -) ---
  let accountName = '';
  const nameLabels = /(?:account\s*(?:holder\s*)?name|sender\s*name|sender|paid\s*by|sent\s*by|from\s*name|transfer\s*from|account\s*holder|\bfrom|\bname)\s*[:\-]?\s*/i;
  for (let i = 0; i < lines.length && !accountName; i++) {
    if (!nameLabels.test(lines[i])) continue;
    let candidate = lines[i].replace(nameLabels, '').trim();
    if (!candidate && lines[i + 1]) candidate = lines[i + 1].trim();
    // Keep letters, digits, spaces, and the obfuscation characters * . - ' ,
    candidate = candidate.replace(/[^A-Za-z0-9À-ÿ*.\-,'\s]/g, '').trim();
    if (
      candidate &&
      candidate.length >= 2 &&
      candidate.length <= 80 &&
      /[A-Za-zÀ-ÿ]/.test(candidate) &&                    // must contain at least one letter
      !/^(date|time|amount|reference|transaction|successful|completed|details|total|fee|balance|status)$/i.test(candidate)
    ) {
      accountName = candidate;
    }
  }

  // --- ➕ NEW: Recipient name (your account) ---
  let recipientName = '';
  const recipientLabels = /(?:recipient(?:\s*name)?|receiver(?:\s*name)?|to\s*name|paid\s*to|sent\s*to|transfer\s*to|\bto)\s*[:\-]?\s*/i;
  for (let i = 0; i < lines.length && !recipientName; i++) {
    if (!recipientLabels.test(lines[i])) continue;
    let candidate = lines[i].replace(recipientLabels, '').trim();
    if (!candidate && lines[i + 1]) candidate = lines[i + 1].trim();
    candidate = candidate.replace(/[^A-Za-z0-9À-ÿ*.\-,'\s]/g, '').trim();
    if (
      candidate &&
      candidate.length >= 2 &&
      candidate.length <= 80 &&
      /[A-Za-zÀ-ÿ]/.test(candidate) &&
      !/^(date|time|amount|reference|transaction|successful|completed|details|total|fee|balance|status)$/i.test(candidate)
    ) {
      recipientName = candidate;
    }
  }

  // --- Date ---
  const dateRegex = /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/i;
  let transactionDate = '';
  for (let i = 0; i < lines.length && !transactionDate; i++) {
    if (/\b(date|transaction date|paid on|sent on|completed on)\b/i.test(lines[i])) {
      const m = lines[i].match(dateRegex) || (lines[i + 1] || '').match(dateRegex);
      if (m) transactionDate = m[1];
    }
  }
  if (!transactionDate) {
    const m = normalized.match(dateRegex);
    if (m) transactionDate = m[1];
  }

  // --- ➕ NEW: Time ---
  const timeRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\b/;
  let transactionTime = '';
  for (let i = 0; i < lines.length && !transactionTime; i++) {
    if (/\b(time|transaction time|paid at|sent at|completed at)\b/i.test(lines[i])) {
      const m = lines[i].match(timeRegex) || (lines[i + 1] || '').match(timeRegex);
      if (m) transactionTime = m[1];
    }
  }
  if (!transactionTime) {
    const m = normalized.match(timeRegex);
    if (m) transactionTime = m[1];
  }

  // --- ➕ NEW: Transaction status ---
  let transactionStatus = '';
  const statusMatch = compact.match(/\b(successful|success|completed|complete|failed|pending|processing)\b/i);
  if (statusMatch) transactionStatus = statusMatch[1];

  return {
    text: normalized,
    amount,
    reference,
    accountName,
    recipientName,
    transactionDate,
    transactionTime,
    transactionStatus
  };
};

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
    const fieldCount = [
      parsed.amount != null,
      !!parsed.reference,
      !!parsed.accountName,
      !!parsed.recipientName,
      !!parsed.transactionDate,
      !!parsed.transactionTime
    ].filter(Boolean).length;
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

  const { items: menuItems, loading: menuLoading, refetch: refetchMenuItems } = useMenuItems();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();
  // ➕ NEW: addMenuItem from the hook
  const { addMenuItem } = useMenuItems();

  // ➕ NEW: Add Product form state
  const [uploadForm, setUploadForm] = useState({
    name: '', category_id: '', price: '', description: '', is_available: true
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bucketExists, setBucketExists] = useState(false);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [storageError, setStorageError] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '',
    confirmText: 'Yes, Confirm', cancelText: 'No, Cancel',
    onConfirm: null, variant: 'warning', isLoading: false
  });

  const openConfirm = ({ title, message, confirmText, cancelText, onConfirm, variant = 'warning' }) => {
    setConfirmModal({
      isOpen: true, title, message,
      confirmText: confirmText || 'Yes, Confirm',
      cancelText: cancelText || 'No, Cancel',
      onConfirm, variant, isLoading: false
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null, isLoading: false }));
  };

  const {
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    refresh: refreshOrders
  } = useOrders();

  // ➕ NEW: check storage bucket on mount
  useEffect(() => {
    const checkStorage = async () => {
      try {
        setStorageInitialized(false);
        setStorageError(null);
        const initialized = await initStorage();
        if (initialized) {
          const accessible = await testDirectBucketAccess();
          setBucketExists(accessible);
          if (!accessible) setStorageError('Storage bucket is not accessible.');
        } else {
          setBucketExists(false);
          setStorageError('Storage bucket "product-images" not found.');
        }
        setStorageInitialized(true);
      } catch (error) {
        setStorageError(error.message || 'Failed to initialize storage');
        setStorageInitialized(true);
        setBucketExists(false);
      }
    };
    checkStorage();
  }, []);

  // ➕ NEW: blob URL cleanup
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Real-time subscription for new orders
  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setNotificationType('success');
        setNotification(`📦 New Order Received from ${payload.new.users?.name || 'Customer'}`);
        refreshOrders();
        setTimeout(() => setNotification(null), 5000);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: 'status=eq.pending' }, () => {
        refreshOrders();
      })
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [refreshOrders]);

  // ============================================
  // ➕ NEW: Add Product handlers
  // ============================================
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, WEBP, or GIF)');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file) => uploadImageUtil(file);

  const handleUploadProduct = (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) { alert('Please enter a product name'); return; }
    if (!uploadForm.category_id) { alert('Please select a category'); return; }
    if (!uploadForm.price || parseFloat(uploadForm.price) <= 0) { alert('Please enter a valid price'); return; }
    if (!uploadForm.description.trim()) { alert('Please enter a product description'); return; }
    if (!selectedImage) { alert('Please select an image for the product'); return; }

    const selectedCat = categories.find(c => c.id === uploadForm.category_id);

    openConfirm({
      title: 'Add New Product?',
      message: `Add "${uploadForm.name}" (${selectedCat?.name || 'Unknown category'}) at ₱${uploadForm.price}?`,
      confirmText: 'Yes, Add Product',
      cancelText: 'No, Cancel',
      variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        setUploading(true);
        setUploadProgress(0);
        try {
          setUploadProgress(20);
          const imageUrl = await uploadImage(selectedImage);
          setUploadProgress(70);

          const productData = {
            name: uploadForm.name.trim(),
            type: selectedCat?.slug || 'other',
            category_id: uploadForm.category_id,
            price: parseFloat(uploadForm.price),
            description: uploadForm.description.trim(),
            image_url: imageUrl,
            is_available: uploadForm.is_available,
            created_by: user.id
          };

          await addMenuItem(productData);
          setUploadProgress(100);

          setUploadForm({ name: '', category_id: '', price: '', description: '', is_available: true });
          if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
          setSelectedImage(null);
          setImagePreview(null);
          const fileInput = document.getElementById('employee-product-image-input');
          if (fileInput) fileInput.value = '';

          await refetchMenuItems();
          alert('✅ Product added successfully!');
          setActiveTab('menu');
        } catch (error) {
          alert('❌ Failed to add product: ' + error.message);
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    });
  };

  // ============================================
  // Existing handlers (logout, profile, payment, order status) — unchanged
  // ============================================
  const handleLogout = () => {
    openConfirm({
      title: 'Log Out?', message: 'Are you sure you want to log out of your account?',
      confirmText: 'Yes, Log Out', cancelText: 'No, Stay', variant: 'warning',
      onConfirm: () => { closeConfirm(); onLogout(); }
    });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (profile.name === user?.name) { alert('No changes to save.'); return; }
    openConfirm({
      title: 'Update Profile?',
      message: `Are you sure you want to change your name to "${profile.name}"?`,
      confirmText: 'Yes, Update', cancelText: 'No, Cancel', variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');
        try {
          const { error: updateError } = await supabase
            .from('users').update({ name: profile.name }).eq('id', user.id);
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
      setProfileError('New passwords do not match'); return;
    }
    if (passwordData.newPassword.length < 6) {
      setProfileError('New password must be at least 6 characters'); return;
    }
    openConfirm({
      title: 'Change Password?',
      message: 'Are you sure you want to change your account password? You will need to use the new password on your next login.',
      confirmText: 'Yes, Change Password', cancelText: 'No, Cancel', variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        setProfileLoading(true);
        try {
          const { error: passwordError } = await supabase.auth.updateUser({ password: passwordData.newPassword });
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
      `Recipient name: ${order.ocr_recipient_name || 'Not detected'}`,
      `Transaction date: ${order.ocr_transaction_date || 'Not detected'}`,
      `Transaction time: ${order.ocr_transaction_time || 'Not detected'}`,
      `Transaction status: ${order.ocr_transaction_status || 'Not detected'}`,
      `Payment decision: ${order.payment_status || 'unverified'}`,
      `Generated at: ${new Date().toLocaleString()}`,
      '',
      'FULL EXTRACTED TEXT',
      order.ocr_extracted_text || 'No OCR text is saved for this order.',
      '',
      'NOTE: OCR results are estimates only. This report is not proof that a payment was made.'
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
        ocr_recipient_name: extracted.recipientName || null,
        ocr_transaction_date: extracted.transactionDate || null,
        ocr_transaction_time: extracted.transactionTime || null,
        ocr_transaction_status: extracted.transactionStatus || null,
        ocr_extracted_text: extracted.text || null
      };
      const { error } = await supabase.from('orders').update(update).eq('id', order.id);
      if (error) throw error;
      const updatedOrder = { ...order, ...update };
      setSelectedOrder(updatedOrder);
      await refreshOrders();
      setNotificationType('success');
      setNotification(extracted.text ? 'OCR extraction updated. Please review the results manually.' : 'OCR could not read text from this image.');
      setTimeout(() => setNotification(null), 4500);
    } catch (error) {
      console.error('Employee receipt OCR failed:', error);
      alert(`Could not run OCR on this receipt. ${error.message || ''}`);
    } finally {
      if (worker) await worker.terminate();
      setOcrLoadingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = (orderId, status) => {
    const statusLabels = { confirmed: 'Accept', rejected: 'Reject' };
    const label = statusLabels[status] || status;
    openConfirm({
      title: `${label} Payment?`,
      message: status === 'confirmed'
        ? 'Accept this payment after checking the original receipt and transaction in the payment app?'
        : 'Reject this payment? The customer will see that the payment was rejected.',
      confirmText: `Yes, ${label}`, cancelText: 'No, Cancel',
      variant: status === 'confirmed' ? 'warning' : 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updatePaymentStatus(orderId, status);
          if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder({ ...selectedOrder, payment_status: status });
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

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const statusLabels = { preparing: 'Preparing', processing: 'Processing', completed: 'Completed', declined: 'Declined' };
    const label = statusLabels[newStatus] || newStatus;
    const isDestructive = newStatus === 'declined';
    openConfirm({
      title: `${label} Order?`,
      message: isDestructive
        ? `Are you sure you want to decline this order? The customer will be notified and cannot recover the order.`
        : `Are you sure you want to mark this order as "${label}"?`,
      confirmText: `Yes, Mark as ${label}`, cancelText: 'No, Cancel',
      variant: isDestructive ? 'danger' : 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updateOrderStatus(orderId, newStatus);
          if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
          refreshOrders();
          setNotificationType('success');
          setNotification(`✅ Order status updated to: ${label}`);
          setTimeout(() => setNotification(null), 3000);
          closeConfirm();
          setTimeout(() => setSelectedOrder(null), 800);
        } catch (error) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          alert('❌ Failed to update order status: ' + error.message);
        }
      }
    });
  };

  const getOrderCount = (status) => orders.filter(o => o.status === status).length;

  const employeeBestSellers = (() => {
    const totals = {};
    orders.filter(order => order.status === 'completed').forEach(order => {
      (order.order_items || []).forEach(item => {
        const product = item.menu_items || {};
        const key = product.id || product.name || 'unknown';
        if (!totals[key]) totals[key] = { name: product.name || 'Unknown item', category: product.type || product.category || 'Menu item', sales: 0 };
        totals[key].sales += Number(item.quantity || 0);
      });
    });
    return Object.values(totals).sort((a, b) => b.sales - a.sales).slice(0, 3);
  })();

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
          <span key={idx} className="item-tag">{item.quantity}x {item.menu_items?.name || 'Item'}</span>
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
      {notification && (
        <div className={`notification-toast ${notificationType}`}>
          <span className="notification-icon">
            {notificationType === 'success' ? '✅' : notificationType === 'info' ? 'ℹ️' : '🔔'}
          </span>
          <span className="notification-message">{notification}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

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
          <button className="logout-btn" onClick={handleLogout}><LogOutIcon /> Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <OrdersIcon /><span>Orders</span>
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <span className="nav-badge">{orders.filter(o => o.status === 'pending').length}</span>
          )}
        </button>
        <button className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => { setActiveTab('menu'); if (typeof refetchMenuItems === 'function') refetchMenuItems(); }}>
          <span className="employee-nav-emoji">☕</span><span>Menu</span>
        </button>

        {/* ➕ NEW: Add Product tab */}
        <button className={`nav-tab ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}>
          <UploadIcon /><span>Add Product</span>
        </button>

        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); setProfileError(''); setProfileSuccess(''); }}>
          <UserIcon /><span>Profile</span>
        </button>
      </nav>

      {/* MENU VIEW (unchanged) */}
      {activeTab === 'menu' && (
        <section className="employee-menu-view">
          <div className="employee-menu-heading">
            <div>
              <p className="employee-menu-eyebrow">1of1 Coffee</p>
              <h2>Our Menu</h2>
              <p>Browse the products and categories currently listed for customers.</p>
            </div>
            <div className="employee-menu-total">{menuItems.length} menu item{menuItems.length !== 1 ? 's' : ''}</div>
          </div>
          {(menuLoading || categoriesLoading) ? (
            <div className="employee-menu-empty">Loading menu...</div>
          ) : menuItems.length === 0 ? (
            <div className="employee-menu-empty">
              <span>☕</span><h3>No menu items available</h3>
              <p>Menu items added by the owner or staff will appear here.</p>
            </div>
          ) : (
            <div className="employee-menu-category-list">
              {categories.filter(category => menuItems.some(item => item.category_id === category.id)).map(category => {
                const categoryItems = menuItems.filter(item => item.category_id === category.id);
                return (
                  <section className="employee-menu-category" key={category.id}>
                    <div className="employee-menu-category-title" style={{ '--employee-category-color': category.color || '#d97745' }}>
                      <span className="employee-menu-category-icon">{category.icon || '☕'}</span>
                      <div><h3>{category.name}</h3><span>{categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}</span></div>
                    </div>
                    <div className="employee-menu-grid">
                      {categoryItems.map(item => (
                        <article className="employee-menu-card" key={item.id}>
                          {item.image_url ? <img className="employee-menu-image" src={item.image_url} alt={item.name} loading="lazy" /> : <div className="employee-menu-image employee-menu-image-placeholder">☕</div>}
                          <div className="employee-menu-card-content">
                            <div className="employee-menu-name-price">
                              <h4>{item.name}</h4>
                              <strong>₱{Number(item.price || 0).toFixed(2)}</strong>
                            </div>
                            <p className="employee-menu-description">{item.description || 'No description available.'}</p>
                            <div className="employee-menu-card-footer">
                              <span className={`employee-menu-availability ${item.is_available === false ? 'unavailable' : 'available'}`}>{item.is_available === false ? 'Unavailable' : 'Available'}</span>
                              {Number(item.avg_rating) > 0 && <span className="employee-menu-rating">★ {Number(item.avg_rating).toFixed(1)} ({item.review_count || 0})</span>}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ➕ NEW: ADD PRODUCT VIEW */}
      {activeTab === 'add-product' && (
        <div className="add-product-section">
          <div className="add-product-container">
            <h2>Add New Product</h2>

            {!storageInitialized ? (
              <div className="storage-loading">⏳ Initializing storage...</div>
            ) : !bucketExists && (
              <div className="storage-warning">
                <strong>⚠️ Storage bucket not found!</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Ask the owner to create it in Supabase.</p>
                {storageError && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Error: {storageError}</p>}
              </div>
            )}

            <form className="product-form" onSubmit={handleUploadProduct}>
              <div className="form-grid">
                <div className="form-left">
                  <div className="form-group image-upload-group">
                    <label>Product Image *</label>
                    <div className="image-upload-area">
                      {imagePreview ? (
                        <div className="image-preview-container">
                          <img src={imagePreview} alt="Product preview" className="image-preview" />
                          <button type="button" className="remove-image-btn" onClick={() => {
                            if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                            setSelectedImage(null); setImagePreview(null);
                            const fileInput = document.getElementById('employee-product-image-input');
                            if (fileInput) fileInput.value = '';
                          }}>×</button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <UploadIcon />
                          <p>Click to upload product image</p>
                          <span className="upload-hint">JPG, PNG, WEBP (Max 5MB)</span>
                        </div>
                      )}
                      <input id="employee-product-image-input" type="file" accept="image/*" onChange={handleImageSelect} className="image-input" required />
                    </div>
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" placeholder="e.g., Mocha Frappuccino" required
                      value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select required value={uploadForm.category_id}
                        onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}>
                        <option value="">— Select category —</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₱) *</label>
                      <input type="number" placeholder="0.00" required min="0" step="0.01"
                        value={uploadForm.price} onChange={(e) => setUploadForm({ ...uploadForm, price: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea placeholder="Describe your product..." rows="4" required
                      value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={uploadForm.is_available}
                        onChange={(e) => setUploadForm({ ...uploadForm, is_available: e.target.checked })} />
                      Available for order
                    </label>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span className="progress-text">{uploadProgress}%</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-large submit-product-btn"
                    disabled={uploading || !bucketExists}>
                    {uploading ? 'Uploading...' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDERS VIEW (unchanged — your full existing code) */}
      {activeTab === 'orders' && (
        <>
          <div className="stats-overview">
            <div className="stat-card pending-stat">
              <div className="stat-icon">⏳</div>
              <div className="stat-info"><span className="stat-number">{getOrderCount('pending')}</span><span className="stat-label">Pending</span></div>
            </div>
            <div className="stat-card preparing-stat">
              <div className="stat-icon">📦</div>
              <div className="stat-info"><span className="stat-number">{getOrderCount('preparing')}</span><span className="stat-label">Preparing</span></div>
            </div>
            <div className="stat-card completed-stat">
              <div className="stat-icon">✅</div>
              <div className="stat-info"><span className="stat-number">{getOrderCount('completed')}</span><span className="stat-label">Completed</span></div>
            </div>
            <div className="stat-card declined-stat">
              <div className="stat-icon">❌</div>
              <div className="stat-info"><span className="stat-number">{getOrderCount('declined')}</span><span className="stat-label">Declined</span></div>
            </div>
          </div>

          <section className="employee-best-sellers" aria-label="Top best-selling products">
            <div className="employee-best-sellers-heading">
              <div><span className="employee-best-sellers-eyebrow">SALES HIGHLIGHTS</span><h2>🏆 Top Best Sellers</h2><p>Ranked by quantity sold in completed orders.</p></div>
            </div>
            {employeeBestSellers.length === 0 ? (
              <div className="employee-best-sellers-empty">No completed sales yet.</div>
            ) : (
              <div className="employee-best-sellers-grid">
                {employeeBestSellers.map((product, index) => (
                  <article className={`employee-best-seller-card rank-${index + 1}`} key={`${product.name}-${index}`}>
                    <span className="employee-best-seller-rank">#{index + 1}</span>
                    <div className="employee-best-seller-icon">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                    <div className="employee-best-seller-info"><h3>{product.name}</h3><p>{product.category}</p></div>
                    <strong>{product.sales} sold</strong>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="kanban-board">
            <div className="kanban-column">
              <div className="column-header pending">
                <span className="column-title"><ClockIcon /> Pending</span>
                <span className="order-count">{getOrderCount('pending')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'pending').length === 0 ? (
                  <div className="empty-column"><span className="empty-icon">✅</span><p>No pending orders</p></div>
                ) : orders.filter(o => o.status === 'pending').map(renderOrderCard)}
              </div>
            </div>

            <div className="kanban-column">
              <div className="column-header preparing">
                <span className="column-title"><PackageIcon /> Preparing</span>
                <span className="order-count">{getOrderCount('preparing')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'preparing').length === 0 ? (
                  <div className="empty-column"><span className="empty-icon">📦</span><p>No orders preparing</p></div>
                ) : orders.filter(o => o.status === 'preparing').map(renderOrderCard)}
              </div>
            </div>

            <div className="kanban-column">
              <div className="column-header completed">
                <span className="column-title"><CheckIcon /> Completed</span>
                <span className="order-count">{getOrderCount('completed')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'completed').length === 0 ? (
                  <div className="empty-column"><span className="empty-icon">📋</span><p>No completed orders</p></div>
                ) : orders.filter(o => o.status === 'completed').map(renderOrderCard)}
              </div>
            </div>

            <div className="kanban-column">
              <div className="column-header declined">
                <span className="column-title"><XIcon /> Declined</span>
                <span className="order-count">{getOrderCount('declined')}</span>
              </div>
              <div className="column-content">
                {orders.filter(o => o.status === 'declined').length === 0 ? (
                  <div className="empty-column"><span className="empty-icon">👍</span><p>No declined orders</p></div>
                ) : orders.filter(o => o.status === 'declined').map(renderOrderCard)}
              </div>
            </div>
          </div>

          {/* Order Details Modal — keep your existing one.
              It reads selectedOrder.ocr_* fields; with the new columns,
              you can additionally display recipientName / time / status. */}
          {selectedOrder && (
            <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* ... your existing modal content ... */}
                {/* Inside OCR Extraction section, add: */}
                {/* 
                <div className="detail-row">
                  <span className="detail-label">Recipient Name</span>
                  <span className="detail-value">{selectedOrder.ocr_recipient_name || 'Not detected'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transaction Time</span>
                  <span className="detail-value">{selectedOrder.ocr_transaction_time || 'Not detected'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transaction Status</span>
                  <span className="detail-value">{selectedOrder.ocr_transaction_status || 'Not detected'}</span>
                </div>
                */}
              </div>
            </div>
          )}
        </>
      )}

      {/* PROFILE TAB (unchanged) */}
      {activeTab === 'profile' && (
        <div className="profile-view">
          {/* ... your existing profile JSX ... */}
        </div>
      )}

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
