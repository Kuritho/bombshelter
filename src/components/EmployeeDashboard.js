// src/components/EmployeeDashboard.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { supabase } from '../supabaseClient';
import { useOrders, useMenuItems, useCategories } from '../hooks/useSupabase';
import { initStorage, uploadImage as uploadImageUtil, testDirectBucketAccess } from '../utils/storage';
import './EmployeeDashboard.css';
import './EmployeePOS.css';

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

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// ============================================
// CONFIRMATION MODAL
// ============================================
function ConfirmModal({
  isOpen, title, message, confirmText = 'Yes, Confirm', cancelText = 'No, Cancel',
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
// OCR PARSER
// ============================================
const matchReference = (text) => {
  if (!text) return '';
  const cleaned = String(text)
    .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b.*$/i, '')
    .replace(/\b(?:AM|PM)\b.*$/i, '')
    .trim();
  const tokens = cleaned.split(/\s+/);
  const tokenIsAlnumRef = (tok) => /^[A-Z0-9]{3,}$/i.test(tok.replace(/[^\w]/g, ''));

  for (let start = 0; start < tokens.length; start++) {
    let accumulated = '';
    for (let j = start; j < Math.min(start + 5, tokens.length); j++) {
      const raw = tokens[j].replace(/[^\w]/g, '');
      if (!tokenIsAlnumRef(raw)) break;
      accumulated += raw.toUpperCase();
      if (accumulated.length === 12 && /[A-Z]/.test(accumulated) && /\d/.test(accumulated)) return accumulated;
      if (accumulated.length > 12) break;
    }
  }
  for (let start = 0; start < tokens.length; start++) {
    let accumulated = '';
    for (let j = start; j < Math.min(start + 5, tokens.length); j++) {
      const raw = tokens[j].replace(/[^\w]/g, '');
      if (!/^\d+$/.test(raw)) break;
      accumulated += raw;
      if (accumulated.length === 13) return accumulated;
      if (accumulated.length > 13) break;
    }
  }
  const compactUpper = cleaned.replace(/[^\w]/g, ' ').toUpperCase();
  const mayaFallback = compactUpper.match(/\b[A-Z0-9]{12}\b/);
  if (mayaFallback && /[A-Z]/.test(mayaFallback[0]) && /\d/.test(mayaFallback[0])) return mayaFallback[0];
  const gcash13 = cleaned.match(/\d{13}/); if (gcash13) return gcash13[0];
  const gcash12 = cleaned.match(/\d{12}/); if (gcash12) return gcash12[0];
  return '';
};

const matchSender = (lines, compact) => {
  const phoneFlexible = /(\+?63[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}|09\d{2}[\s-]?\d{3}[\s-]?\d{4})/i;
  const numberLabels = /(?:account\s*(?:number|no\.?|#)|mobile\s*(?:number|no\.?|#)|phone\s*(?:number|no\.?|#)|contact\s*(?:number|no\.?|#)|sender|from|gcash|maya)\s*[:\-]?\s*/i;
  for (let i = 0; i < lines.length; i++) {
    if (!numberLabels.test(lines[i])) continue;
    let candidate = lines[i].replace(numberLabels, '').trim();
    if (!candidate && lines[i + 1]) candidate = lines[i + 1].trim();
    const m = candidate.match(phoneFlexible);
    if (m) return { value: m[1].replace(/\s{2,}/g, ' ').trim(), kind: 'phone' };
  }
  const globalPhone = compact.match(/(\+?63[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}|09\d{2}[\s-]?\d{3}[\s-]?\d{4})/);
  if (globalPhone) return { value: globalPhone[1].replace(/\s{2,}/g, ' ').trim(), kind: 'phone' };

  const nameLabel = /(?:^|\s|[-–])\s*(?:from|sender(?:\s*name)?|paid\s*by|sent\s*by)\s*[:\-]?\s*/i;
  for (let i = 0; i < lines.length; i++) {
    if (!nameLabel.test(lines[i])) continue;
    let candidate = lines[i].replace(nameLabel, '').trim().replace(/[^A-Za-zÀ-ÿ\s.'\-]/g, '').trim();
    if (candidate && candidate.length >= 3 && candidate.length <= 80 && /[A-Za-zÀ-ÿ]/.test(candidate)) {
      return { value: candidate, kind: 'name' };
    }
  }
  return { value: '', kind: 'unknown' };
};

const parsePaymentReceiptText = (rawText) => {
  const normalized = String(rawText || '').replace(/\u00a0/g, ' ').replace(/[\t ]+/g, ' ').replace(/\r/g, '\n').replace(/\n{2,}/g, '\n').trim();
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
  const compact = normalized.replace(/\n/g, ' ');

  const labeledAmount = compact.match(/(?:amount(?:\s+(?:sent|paid|transferred|received))?|total\s+amount|amount\s+of|payment\s+amount|you\s+sent|sent\s+amount|sent\s+money)\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  const totalAmount = compact.match(/\btotal\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  const bareAmount = compact.match(/[–\-]\s*(?:PHP|₱|\bP\.?\s*)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/);
  const amountCandidate = labeledAmount || totalAmount || bareAmount;
  let amount = null;
  if (amountCandidate) {
    const parsed = Number(amountCandidate[1].replace(/,/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) amount = parsed;
  }

  let reference = '';
  const refLabel = /(?:reference(?:\s*(?:id|number|no\.?|#))?|ref\.?\s*(?:number|no\.?|#)?|transaction\s*(?:id|number|no\.?|#)|txn\.?\s*(?:id|no\.?|#)|trace\s*(?:id|number|no\.?|#))/i;
  for (let i = 0; i < lines.length && !reference; i++) {
    if (!refLabel.test(lines[i])) continue;
    let candidateText = lines[i].replace(refLabel, '').replace(/^[\s:#\-\.]+/, '').trim();
    reference = matchReference(candidateText);
    if (!reference && candidateText.length < 25 && i + 1 < lines.length) reference = matchReference(lines[i + 1]);
  }
  if (!reference) {
    const mayaFallback = compact.replace(/[^\w]/g, ' ').toUpperCase().match(/\b[A-Z0-9]{12}\b/);
    if (mayaFallback && /[A-Z]/.test(mayaFallback[0]) && /\d/.test(mayaFallback[0])) reference = mayaFallback[0];
  }
  if (!reference) { const g = compact.match(/\d{13}/); if (g) reference = g[0]; }

  const sender = matchSender(lines, compact);

  const dateRegex = /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/i;
  let transactionDate = '';
  const dm = normalized.match(dateRegex); if (dm) transactionDate = dm[1];

  const timeRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\b/;
  let transactionTime = '';
  const tm = normalized.match(timeRegex); if (tm) transactionTime = tm[1];

  return {
    text: normalized, amount, reference,
    accountNumber: sender.value, senderKind: sender.kind,
    transactionDate, transactionTime
  };
};

const recognizePaymentReceipt = async (worker, image) => {
  const candidates = [];
  for (const pageSegMode of ['6', '11']) {
    try { if (worker.setParameters) await worker.setParameters({ tessedit_pageseg_mode: pageSegMode, tessedit_char_whitelist: '' }); } catch {}
    const { data } = await worker.recognize(image);
    const parsed = parsePaymentReceiptText(data?.text || '');
    const score = [parsed.amount != null, !!parsed.reference, !!parsed.accountNumber].filter(Boolean).length * 1000 + Math.min(parsed.text.length, 999);
    candidates.push({ parsed, score });
  }
  try {
    if (worker.setParameters) await worker.setParameters({ tessedit_pageseg_mode: '6', tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. ' });
    const { data } = await worker.recognize(image);
    const parsed = parsePaymentReceiptText(data?.text || '');
    const score = [parsed.amount != null, !!parsed.reference, !!parsed.accountNumber].filter(Boolean).length * 1000 + Math.min(parsed.text.length, 999) + 500;
    candidates.push({ parsed, score });
  } catch {}
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.parsed || parsePaymentReceiptText('');
};

// ============================================
// ROBUST RECEIPT URL FINDER
// ============================================
// Checks many possible field names, nested objects, and scans
// for any key containing "proof" / "receipt" / "screenshot" / "slip"
const getReceiptUrl = (order) => {
  if (!order) return null;

  // 1. Explicit list of known column names (add yours here if you find it)
  const knownFields = [
    'payment_proof_url',
    'payment_receipt_url',
    'receipt_url',
    'payment_proof',
    'proof_of_payment',
    'proof_of_payment_url',
    'payment_proof_image',
    'payment_proof_image_url',
    'payment_image',
    'payment_image_url',
    'payment_screenshot',
    'payment_screenshot_url',
    'receipt_image',
    'receipt_image_url',
    'proof_image',
    'proof_image_url',
    'slip_url',
    'payment_slip',
    'payment_slip_url',
    'gcash_receipt',
    'gcash_receipt_url',
    'maya_receipt',
    'maya_receipt_url',
    'screenshot_url',
    'image_url',
    'proof_url',
  ];

  for (const field of knownFields) {
    const val = order[field];
    if (val && typeof val === 'string' && val.trim()) return val.trim();
  }

  // 2. Also check for a nested `payments` or `payment` object
  const nested = order.payments || order.payment || order.order_payment;
  if (nested && typeof nested === 'object') {
    const nestedUrl = getReceiptUrl(nested);
    if (nestedUrl) return nestedUrl;
  }

  // 3. Last resort: scan every key on the order for one that looks like a proof URL
  try {
    for (const key of Object.keys(order)) {
      const lower = key.toLowerCase();
      if (
        (lower.includes('proof') ||
          lower.includes('receipt') ||
          lower.includes('screenshot') ||
          lower.includes('slip')) &&
        typeof order[key] === 'string' &&
        order[key].trim()
      ) {
        return order[key].trim();
      }
    }
  } catch {}

  return null;
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
  const { categories, loading: categoriesLoading } = useCategories();
  const { orders, updateOrderStatus, updatePaymentStatus, refresh: refreshOrders } = useOrders();

  // ---- POS state ----
  const [posCart, setPosCart] = useState([]);
  const [posOrderType, setPosOrderType] = useState('dine-in');
  const [posPaymentMethod, setPosPaymentMethod] = useState('cash');
  const [posWalkInName, setPosWalkInName] = useState('');
  const [posCategory, setPosCategory] = useState('all');
  const [posSearch, setPosSearch] = useState('');
  const [posSubmitting, setPosSubmitting] = useState(false);
  const [posLastOrder, setPosLastOrder] = useState(null);

  // ---- Add Product state ----
  const [uploadForm, setUploadForm] = useState({ name: '', category_id: '', price: '', description: '', is_available: true });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bucketExists, setBucketExists] = useState(false);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const { addMenuItem } = useMenuItems();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ---- Order Review Modal state ----
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewOcr, setReviewOcr] = useState(null);
  const [reviewOcrRunning, setReviewOcrRunning] = useState(false);
  const [reviewOcrRaw, setReviewOcrRaw] = useState('');
  const [reviewOcrError, setReviewOcrError] = useState('');
  const [receiptViewerUrl, setReceiptViewerUrl] = useState(null);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [reviewStatusMsg, setReviewStatusMsg] = useState(null);

  const ocrWorkerRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', confirmText: 'Yes, Confirm', cancelText: 'No, Cancel',
    onConfirm: null, variant: 'warning', isLoading: false
  });
  const openConfirm = ({ title, message, confirmText, cancelText, onConfirm, variant = 'warning' }) => {
    setConfirmModal({ isOpen: true, title, message, confirmText: confirmText || 'Yes, Confirm', cancelText: cancelText || 'No, Cancel', onConfirm, variant, isLoading: false });
  };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null, isLoading: false }));

  // ---- POS totals (no discount) ----
  const posSubtotal = useMemo(() => posCart.reduce((s, i) => s + i.price * i.qty, 0), [posCart]);
  const posTotal = posSubtotal;
  const posItemCount = useMemo(() => posCart.reduce((s, i) => s + i.qty, 0), [posCart]);

  // ---- POS filter + group ----
  const posVisibleItems = useMemo(() => {
    const q = posSearch.trim().toLowerCase();
    return menuItems.filter(item => {
      if (item.is_available === false) return false;
      if (posCategory !== 'all' && item.category?.slug !== posCategory) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [menuItems, posCategory, posSearch]);

  const posGroupedItems = useMemo(() => {
    const groups = [];
    categories.forEach(cat => {
      const items = posVisibleItems.filter(i => i.category_id === cat.id);
      if (items.length > 0) groups.push({ category: cat, items });
    });
    const orphans = posVisibleItems.filter(i => !categories.some(c => c.id === i.category_id));
    if (orphans.length > 0) {
      groups.push({
        category: { id: '__other__', slug: 'other', name: 'Other Items', icon: '☕', color: '#64748b' },
        items: orphans
      });
    }
    return groups;
  }, [posVisibleItems, categories]);

  // ---- Storage init ----
  useEffect(() => {
    const check = async () => {
      try {
        setStorageInitialized(false); setStorageError(null);
        const ok = await initStorage();
        if (ok) {
          const acc = await testDirectBucketAccess();
          setBucketExists(acc);
          if (!acc) setStorageError('Storage bucket not accessible.');
        } else { setBucketExists(false); setStorageError('Storage bucket "product-images" not found.'); }
        setStorageInitialized(true);
      } catch (e) { setStorageError(e.message || 'Storage init failed'); setStorageInitialized(true); setBucketExists(false); }
    };
    check();
  }, []);

  useEffect(() => () => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  // ---- Cleanup OCR worker on unmount ----
  useEffect(() => () => {
    if (ocrWorkerRef.current) {
      try { ocrWorkerRef.current.terminate(); } catch {}
      ocrWorkerRef.current = null;
    }
  }, []);

  // ---- Realtime: refresh on ANY order change (insert, update, delete) ----
  useEffect(() => {
    const sub = supabase.channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotificationType('success');
            setNotification(
              `📦 New Order from ${
                payload.new?.walk_in_name ||
                payload.new?.users?.name ||
                'Customer'
              }`
            );
            setTimeout(() => setNotification(null), 5000);
          }
          refreshOrders();
        }
      )
      .subscribe();
    return () => sub.unsubscribe();
  }, [refreshOrders]);

  // ============================================
  // ORDER REVIEW / OCR HANDLERS
  // ============================================
  const getOcrWorker = async () => {
    if (ocrWorkerRef.current) return ocrWorkerRef.current;
    const worker = await createWorker('eng');
    ocrWorkerRef.current = worker;
    return worker;
  };

  const runReceiptOcr = async (imageUrl) => {
    if (!imageUrl) return;
    setReviewOcrRunning(true);
    setReviewOcrError('');
    setReviewOcrRaw('');
    try {
      const worker = await getOcrWorker();
      const result = await recognizePaymentReceipt(worker, imageUrl);
      setReviewOcr(result);
      setReviewOcrRaw(result.text || '');
    } catch (e) {
      setReviewOcrError(e.message || 'OCR failed');
      setReviewOcr(null);
    } finally {
      setReviewOcrRunning(false);
    }
  };

  const openOrderReview = (order) => {
    // ---- DEBUG: inspect the actual order shape ----
    console.log('🔍 [OrderReview] Full order object:', order);
    console.log('🔍 [OrderReview] All keys:', Object.keys(order || {}));
    const url = getReceiptUrl(order);
    console.log('🖼️ [OrderReview] Detected receipt URL:', url);
    // ------------------------------------------------

    setReviewOrder(order);
    setReviewOcr(null);
    setReviewOcrRaw('');
    setReviewOcrError('');
    setReviewStatusMsg(null);

    if (url && order.payment_status !== 'confirmed' && order.payment_status !== 'valid') {
      runReceiptOcr(url);
    }
  };

  const closeOrderReview = () => {
    setReviewOrder(null);
    setReviewOcr(null);
    setReviewOcrRaw('');
    setReviewOcrError('');
    setReviewStatusMsg(null);
  };

  const handleReviewPayment = (status) => {
    if (!reviewOrder) return;
    const label = status === 'confirmed' ? 'Accept' : 'Reject';
    openConfirm({
      title: `${label} Payment?`,
      message:
        status === 'confirmed'
          ? `Accept the payment proof for Order #${reviewOrder.order_number || reviewOrder.id.slice(0, 8)}?`
          : `Reject the payment proof for Order #${reviewOrder.order_number || reviewOrder.id.slice(0, 8)}?`,
      confirmText: `Yes, ${label}`,
      cancelText: 'Cancel',
      variant: status === 'confirmed' ? 'warning' : 'danger',
      onConfirm: async () => {
        setConfirmModal((p) => ({ ...p, isLoading: true }));
        setReviewActionLoading(true);
        try {
          await updatePaymentStatus(reviewOrder.id, status);
          setReviewStatusMsg({
            type: status === 'confirmed' ? 'success' : 'error',
            text: status === 'confirmed' ? '✅ Payment accepted.' : '❌ Payment rejected.',
          });
          setReviewOrder((o) => (o ? { ...o, payment_status: status } : o));
          await refreshOrders();
          closeConfirm();
        } catch (e) {
          setConfirmModal((p) => ({ ...p, isLoading: false }));
          setReviewStatusMsg({ type: 'error', text: e.message || 'Update failed' });
        } finally {
          setReviewActionLoading(false);
        }
      },
    });
  };

  const handleReviewOrderStatus = (newStatus) => {
    if (!reviewOrder) return;
    const label =
      { preparing: 'Preparing', processing: 'Processing', completed: 'Completed', declined: 'Declined' }[newStatus] ||
      newStatus;
    const destructive = newStatus === 'declined';
    openConfirm({
      title: `${label} Order?`,
      message: `Mark Order #${reviewOrder.order_number || reviewOrder.id.slice(0, 8)} as "${label}"?`,
      confirmText: `Yes, ${label}`,
      cancelText: 'No',
      variant: destructive ? 'danger' : 'warning',
      onConfirm: async () => {
        setConfirmModal((p) => ({ ...p, isLoading: true }));
        setReviewActionLoading(true);
        try {
          await updateOrderStatus(reviewOrder.id, newStatus);
          setReviewStatusMsg({ type: 'success', text: `✅ Order marked ${label}.` });
          setReviewOrder((o) => (o ? { ...o, status: newStatus } : o));
          await refreshOrders();
          closeConfirm();
          if (newStatus === 'completed' || newStatus === 'declined') {
            setTimeout(() => closeOrderReview(), 700);
          }
        } catch (e) {
          setConfirmModal((p) => ({ ...p, isLoading: false }));
          setReviewStatusMsg({ type: 'error', text: e.message || 'Update failed' });
        } finally {
          setReviewActionLoading(false);
        }
      },
    });
  };

  const downloadReceipt = async (url) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `receipt-${reviewOrder?.order_number || 'order'}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert('Download failed: ' + e.message);
    }
  };

  // ============================================
  // POS HANDLERS
  // ============================================
  const posAddItem = (item) => {
    setPosCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), image_url: item.image_url, qty: 1 }];
    });
  };
  const posIncrease = (id) => setPosCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c));
  const posDecrease = (id) => setPosCart(prev => prev.flatMap(c => {
    if (c.id !== id) return [c];
    if (c.qty <= 1) return [];
    return [{ ...c, qty: c.qty - 1 }];
  }));
  const posRemove = (id) => setPosCart(prev => prev.filter(c => c.id !== id));
  const posClearCart = () => {
    if (posCart.length === 0) return;
    openConfirm({
      title: 'Clear POS Cart?',
      message: 'This will remove all items from the current walk-in order.',
      confirmText: 'Yes, Clear', cancelText: 'No, Keep',
      variant: 'danger',
      onConfirm: () => { closeConfirm(); setPosCart([]); }
    });
  };

  const posPlaceOrder = () => {
    if (posCart.length === 0) { alert('Cart is empty.'); return; }
    const summary = posCart.map(i => `• ${i.qty}x ${i.name} — ₱${(i.price * i.qty).toFixed(2)}`).join('\n');

    openConfirm({
      title: 'Place Walk-in Order?',
      message: `Customer: ${posWalkInName.trim() || 'Walk-in'}\nOrder Type: ${posOrderType === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}\nPayment: 💵 Cash\n\n${summary}\n\nTotal: ₱${posTotal.toFixed(2)}\n\nThis will send the order straight to the kitchen queue.`,
      confirmText: 'Yes, Place Order',
      cancelText: 'No, Review',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        setPosSubmitting(true);
        try {
          const orderData = {
            customer_id: null,
            walk_in_name: posWalkInName.trim() || 'Walk-in',
            status: 'pending',
            payment_status: 'confirmed',
            payment_method: 'cash',
            order_type: posOrderType,
            total_amount: posTotal
          };

          const { data: newOrder, error: orderErr } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

          if (orderErr) throw orderErr;

          const items = posCart.map(i => ({
            order_id: newOrder.id,
            menu_item_id: i.id,
            quantity: i.qty,
            price_at_time: i.price
          }));
          const { error: itemsErr } = await supabase.from('order_items').insert(items);
          if (itemsErr) throw itemsErr;

          setPosLastOrder({
            order: newOrder,
            items: posCart,
            subtotal: posSubtotal,
            total: posTotal,
            walkInName: posWalkInName.trim() || 'Walk-in'
          });
          setPosCart([]);
          setPosWalkInName('');
          await refreshOrders();
          closeConfirm();
        } catch (e) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          alert('❌ Failed to place walk-in order: ' + e.message);
        } finally {
          setPosSubmitting(false);
        }
      }
    });
  };

  const posPrintReceipt = () => {
    if (!posLastOrder) return;
    const { order, items, subtotal, total, walkInName } = posLastOrder;
    const rows = items.map(i =>
      `<div style="display:flex;justify-content:space-between;margin:2px 0"><span>${i.qty}× ${i.name}</span><span>₱${(i.price * i.qty).toFixed(2)}</span></div>`
    ).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title>
      <style>
        body{font-family:'Courier New',monospace;font-size:13px;width:280px;margin:0 auto;padding:12px;color:#000}
        h1{font-size:16px;text-align:center;margin:0 0 4px}
        .sub{text-align:center;font-size:11px;margin-bottom:10px}
        hr{border:none;border-top:1px dashed #000;margin:8px 0}
        .tot{font-weight:700;font-size:14px}
      </style></head><body>
        <h1>1of1 Coffee</h1>
        <div class="sub">Bombshelter Ordering</div>
        <hr>
        <div>Order #: <b>${order.order_number || order.id.slice(0,8)}</b></div>
        <div>Customer: ${walkInName}</div>
        <div>Type: ${order.order_type === 'takeout' ? 'Takeout' : 'Dine In'}</div>
        <div>Date: ${new Date(order.created_at).toLocaleString('en-PH')}</div>
        <hr>
        ${rows}
        <hr>
        <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>₱${subtotal.toFixed(2)}</span></div>
        <div class="tot" style="display:flex;justify-content:space-between;margin-top:6px"><span>TOTAL</span><span>₱${total.toFixed(2)}</span></div>
        <hr>
        <div style="text-align:center;font-size:11px;margin-top:8px">Paid via CASH — Thank you!</div>
      </body></html>`;

    const w = window.open('', '_blank', 'width=380,height=600');
    if (!w) { alert('Please allow pop-ups to print receipts.'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 250);
  };

  // ============================================
  // ADD PRODUCT
  // ============================================
  const handleImageSelect = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!valid.includes(file.type)) { alert('Please select a valid image file.'); e.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); e.target.value = ''; return; }
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file); setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadProduct = (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim() || !uploadForm.category_id || !uploadForm.price || !uploadForm.description.trim() || !selectedImage) {
      alert('Please fill in all fields and select an image.'); return;
    }
    const cat = categories.find(c => c.id === uploadForm.category_id);
    openConfirm({
      title: 'Add New Product?',
      message: `Add "${uploadForm.name}" (${cat?.name || 'category'}) at ₱${uploadForm.price}?`,
      confirmText: 'Yes, Add', cancelText: 'No, Cancel', variant: 'warning',
      onConfirm: async () => {
        closeConfirm(); setUploading(true); setUploadProgress(0);
        try {
          setUploadProgress(20);
          const imageUrl = await uploadImageUtil(selectedImage);
          setUploadProgress(70);
          await addMenuItem({
            name: uploadForm.name.trim(),
            type: cat?.slug || 'other',
            category_id: uploadForm.category_id,
            price: parseFloat(uploadForm.price),
            description: uploadForm.description.trim(),
            image_url: imageUrl,
            is_available: uploadForm.is_available,
            created_by: user.id
          });
          setUploadProgress(100);
          setUploadForm({ name: '', category_id: '', price: '', description: '', is_available: true });
          if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
          setSelectedImage(null); setImagePreview(null);
          await refetchMenuItems();
          alert('✅ Product added!');
          setActiveTab('menu');
        } catch (err) {
          alert('❌ Failed: ' + err.message);
        } finally { setUploading(false); setUploadProgress(0); }
      }
    });
  };

  // ============================================
  // LOGOUT / PROFILE
  // ============================================
  const handleLogout = () => openConfirm({
    title: 'Log Out?', message: 'Are you sure you want to log out?',
    confirmText: 'Yes, Log Out', cancelText: 'No, Stay', variant: 'warning',
    onConfirm: () => { closeConfirm(); onLogout(); }
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (profile.name === user?.name) { alert('No changes to save.'); return; }
    openConfirm({
      title: 'Update Profile?', message: `Change your name to "${profile.name}"?`,
      confirmText: 'Yes, Update', cancelText: 'No, Cancel', variant: 'warning',
      onConfirm: async () => {
        closeConfirm(); setProfileLoading(true); setProfileError(''); setProfileSuccess('');
        try {
          const { error } = await supabase.from('users').update({ name: profile.name }).eq('id', user.id);
          if (error) throw error;
          setProfileSuccess('✅ Profile updated!'); setIsEditingProfile(false); user.name = profile.name;
          setTimeout(() => setProfileSuccess(''), 3000);
        } catch (err) { setProfileError(err.message || 'Update failed'); }
        finally { setProfileLoading(false); }
      }
    });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault(); setProfileError(''); setProfileSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) { setProfileError('Passwords do not match'); return; }
    if (passwordData.newPassword.length < 6) { setProfileError('Min 6 characters'); return; }
    openConfirm({
      title: 'Change Password?', message: 'You will need the new password on next login.',
      confirmText: 'Yes, Change', cancelText: 'No, Cancel', variant: 'warning',
      onConfirm: async () => {
        closeConfirm(); setProfileLoading(true);
        try {
          const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
          if (error) throw error;
          setProfileSuccess('✅ Password updated!');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setTimeout(() => setProfileSuccess(''), 3000);
        } catch (err) { setProfileError(err.message || 'Update failed'); }
        finally { setProfileLoading(false); }
      }
    });
  };

  // ============================================
  // LEGACY ORDER STATUS HELPERS (kept for safety)
  // ============================================
  const handleUpdatePaymentStatus = (orderId, status) => {
    const label = status === 'confirmed' ? 'Accept' : 'Reject';
    openConfirm({
      title: `${label} Payment?`,
      message: status === 'confirmed' ? 'Accept this payment?' : 'Reject this payment?',
      confirmText: `Yes, ${label}`, cancelText: 'No', variant: status === 'confirmed' ? 'warning' : 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updatePaymentStatus(orderId, status);
          if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, payment_status: status });
          refreshOrders();
          setNotificationType('info'); setNotification(`💳 Payment: ${label}`);
          setTimeout(() => setNotification(null), 3000);
          closeConfirm();
        } catch (e) { setConfirmModal(prev => ({ ...prev, isLoading: false })); alert(e.message); }
      }
    });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const label = ({ preparing: 'Preparing', processing: 'Processing', completed: 'Completed', declined: 'Declined' })[newStatus] || newStatus;
    const destructive = newStatus === 'declined';
    openConfirm({
      title: `${label} Order?`, message: `Mark as "${label}"?`,
      confirmText: `Yes, ${label}`, cancelText: 'No',
      variant: destructive ? 'danger' : 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updateOrderStatus(orderId, newStatus);
          if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
          refreshOrders();
          setNotificationType('success'); setNotification(`✅ Order: ${label}`);
          setTimeout(() => setNotification(null), 3000);
          closeConfirm();
          setTimeout(() => setSelectedOrder(null), 600);
        } catch (e) { setConfirmModal(prev => ({ ...prev, isLoading: false })); alert(e.message); }
      }
    });
  };

  const getOrderCount = (status) => orders.filter(o => o.status === status).length;

  const employeeBestSellers = (() => {
    const totals = {};
    orders.filter(o => o.status === 'completed').forEach(o => {
      (o.order_items || []).forEach(it => {
        const p = it.menu_items || {};
        const k = p.id || p.name || 'unknown';
        if (!totals[k]) totals[k] = { name: p.name || 'Unknown', category: p.type || 'Menu', sales: 0 };
        totals[k].sales += Number(it.quantity || 0);
      });
    });
    return Object.values(totals).sort((a, b) => b.sales - a.sales).slice(0, 3);
  })();

  const renderOrderCard = (order) => (
    <div
      key={order.id}
      className={`order-card ${order.payment_status === 'unverified' || !order.payment_status ? 'needs-review' : ''}`}
      onClick={() => openOrderReview(order)}
    >
      <div className="order-card-header">
        <span className="order-id">#{order.order_number || order.id.slice(0, 8)}</span>
        <span className="order-time">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="customer-name">
        <span className="customer-icon">👤</span>
        {order.walk_in_name || order.users?.name || 'Walk-in'}
      </div>
      <div className="order-items-preview">
        {order.order_items?.slice(0, 3).map((it, i) => (
          <span key={i} className="item-tag">{it.quantity}x {it.menu_items?.name || 'Item'}</span>
        ))}
        {order.order_items?.length > 3 && <span className="item-tag more">+{order.order_items.length - 3} more</span>}
      </div>
      <div className="order-card-footer">
        <span className="order-total">₱{order.total_amount}</span>
        <span className={`payment-status-badge ${order.payment_status}`}>
          {(order.payment_status === 'confirmed' || order.payment_status === 'valid') && '✅ Accepted'}
          {order.payment_status === 'rejected' && '❌ Rejected'}
          {(!order.payment_status || order.payment_status === 'unverified') && '⏳ Pending Review'}
        </span>
      </div>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="employee-dashboard">
      {notification && (
        <div className={`notification-toast ${notificationType}`}>
          <span className="notification-icon">{notificationType === 'success' ? '✅' : notificationType === 'info' ? 'ℹ️' : '🔔'}</span>
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

        <button className={`nav-tab ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>
          <span className="employee-nav-emoji">🧾</span><span>POS</span>
          {posCart.length > 0 && <span className="nav-badge">{posItemCount}</span>}
        </button>

        <button className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => { setActiveTab('menu'); refetchMenuItems?.(); }}>
          <span className="employee-nav-emoji">☕</span><span>Menu</span>
        </button>

        <button className={`nav-tab ${activeTab === 'add-product' ? 'active' : ''}`} onClick={() => setActiveTab('add-product')}>
          <UploadIcon /><span>Add Product</span>
        </button>

        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); setProfileError(''); setProfileSuccess(''); }}>
          <UserIcon /><span>Profile</span>
        </button>
      </nav>

      {/* ============ POS TAB ============ */}
      {activeTab === 'pos' && (
        <div className="pos-view">
          <div className="pos-header">
            <div>
              <h2>🧾 Walk-in Order (POS)</h2>
              <p>Take orders for customers at the counter. Cash payment only.</p>
            </div>
            <input
              type="text"
              className="pos-walkin-input"
              placeholder="Customer name / Table (optional)"
              value={posWalkInName}
              onChange={(e) => setPosWalkInName(e.target.value)}
              maxLength={40}
            />
          </div>

          <div className="pos-search-bar">
            <span className="pos-search-icon">🔍</span>
            <input
              type="text"
              className="pos-search-input"
              placeholder="Search menu items…"
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
            />
            {posSearch && (
              <button className="pos-search-clear" onClick={() => setPosSearch('')} title="Clear search">×</button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="pos-category-bar">
              <button
                className={`pos-cat-pill ${posCategory === 'all' ? 'active' : ''}`}
                onClick={() => setPosCategory('all')}
              >🍽️ All</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`pos-cat-pill ${posCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setPosCategory(cat.slug)}
                  style={posCategory === cat.slug ? { background: cat.color, borderColor: cat.color } : undefined}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="pos-layout">
            <div className="pos-menu">
              {menuLoading ? (
                <p className="pos-empty">Loading menu…</p>
              ) : posGroupedItems.length === 0 ? (
                <p className="pos-empty">
                  {posSearch.trim()
                    ? `No items match "${posSearch}".`
                    : 'No items in this category.'}
                </p>
              ) : (
                <div className="pos-category-sections">
                  {posGroupedItems.map(group => (
                    <section key={group.category.id} className="pos-category-section">
                      <div
                        className="pos-category-heading"
                        style={{ '--pos-cat-color': group.category.color || '#d97745' }}
                      >
                        <span className="pos-category-heading-icon">{group.category.icon || '☕'}</span>
                        <h3 className="pos-category-heading-name">{group.category.name}</h3>
                        <span className="pos-category-heading-count">
                          {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                        </span>
                        <div className="pos-category-heading-accent" />
                      </div>

                      <div className="pos-menu-grid">
                        {group.items.map(item => (
                          <button key={item.id} className="pos-menu-card" onClick={() => posAddItem(item)}>
                            {item.image_url
                              ? <img src={item.image_url} alt={item.name} className="pos-menu-img" />
                              : <div className="pos-menu-img pos-menu-placeholder">☕</div>}
                            <div className="pos-menu-info">
                              <span className="pos-menu-name">{item.name}</span>
                              <span className="pos-menu-price">₱{Number(item.price).toFixed(2)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <aside className="pos-cart">
              <div className="pos-cart-header">
                <h3>Current Order</h3>
                {posCart.length > 0 && (
                  <button className="pos-clear-btn" onClick={posClearCart}>Clear</button>
                )}
              </div>

              <div className="pos-type-row">
                <button
                  className={`pos-type-btn ${posOrderType === 'dine-in' ? 'active' : ''}`}
                  onClick={() => setPosOrderType('dine-in')}
                >🍽️ Dine In</button>
                <button
                  className={`pos-type-btn ${posOrderType === 'takeout' ? 'active' : ''}`}
                  onClick={() => setPosOrderType('takeout')}
                >📦 Takeout</button>
              </div>

              <div className="pos-cart-items">
                {posCart.length === 0 ? (
                  <p className="pos-empty">Tap items on the left to add them.</p>
                ) : posCart.map(item => (
                  <div key={item.id} className="pos-cart-row">
                    <div className="pos-cart-row-info">
                      <span className="pos-cart-name">{item.name}</span>
                      <span className="pos-cart-price">₱{item.price.toFixed(2)}</span>
                    </div>
                    <div className="pos-cart-row-qty">
                      <button className="pos-qty-btn" onClick={() => posDecrease(item.id)}>−</button>
                      <span>{item.qty}</span>
                      <button className="pos-qty-btn" onClick={() => posIncrease(item.id)}>+</button>
                    </div>
                    <button className="pos-remove-btn" onClick={() => posRemove(item.id)}>×</button>
                  </div>
                ))}
              </div>

              <div className="pos-totals">
                <div className="pos-total-row"><span>Subtotal</span><span>₱{posSubtotal.toFixed(2)}</span></div>
                <div className="pos-total-row pos-grand"><span>TOTAL</span><span>₱{posTotal.toFixed(2)}</span></div>
              </div>

              <button
                className="pos-place-btn"
                disabled={posCart.length === 0 || posSubmitting}
                onClick={posPlaceOrder}
              >
                {posSubmitting ? 'Placing…' : `💵 Place Order — ₱${posTotal.toFixed(2)}`}
              </button>
              <p className="pos-note">Payment: <strong>Cash</strong> at the counter.</p>
            </aside>
          </div>
        </div>
      )}

      {/* ============ MENU TAB ============ */}
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
            <div className="employee-menu-empty">Loading menu…</div>
          ) : menuItems.length === 0 ? (
            <div className="employee-menu-empty"><span>☕</span><h3>No menu items</h3><p>Items added by owner/staff will appear here.</p></div>
          ) : (
            <div className="employee-menu-category-list">
              {categories.filter(c => menuItems.some(i => i.category_id === c.id)).map(cat => {
                const items = menuItems.filter(i => i.category_id === cat.id);
                return (
                  <section className="employee-menu-category" key={cat.id}>
                    <div className="employee-menu-category-title" style={{ '--employee-category-color': cat.color || '#d97745' }}>
                      <span className="employee-menu-category-icon">{cat.icon || '☕'}</span>
                      <div><h3>{cat.name}</h3><span>{items.length} item{items.length !== 1 ? 's' : ''}</span></div>
                    </div>
                    <div className="employee-menu-grid">
                      {items.map(item => (
                        <article className="employee-menu-card" key={item.id}>
                          {item.image_url ? <img className="employee-menu-image" src={item.image_url} alt={item.name} loading="lazy" /> : <div className="employee-menu-image employee-menu-image-placeholder">☕</div>}
                          <div className="employee-menu-card-content">
                            <div className="employee-menu-name-price">
                              <h4>{item.name}</h4><strong>₱{Number(item.price || 0).toFixed(2)}</strong>
                            </div>
                            <p className="employee-menu-description">{item.description || 'No description.'}</p>
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

      {/* ============ ADD PRODUCT TAB ============ */}
      {activeTab === 'add-product' && (
        <div className="add-product-section">
          <div className="add-product-container">
            <h2>Add New Product</h2>
            {!storageInitialized ? <div className="storage-loading">⏳ Initializing storage…</div> :
              !bucketExists && (
                <div className="storage-warning">
                  <strong>⚠️ Storage bucket not found.</strong>
                  <p>Ask the owner to create it in Supabase.</p>
                  {storageError && <p>Error: {storageError}</p>}
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
                          <img src={imagePreview} alt="preview" className="image-preview" />
                          <button type="button" className="remove-image-btn" onClick={() => {
                            if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                            setSelectedImage(null); setImagePreview(null);
                          }}>×</button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <UploadIcon /><p>Click to upload product image</p>
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
                    <input type="text" required value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select required value={uploadForm.category_id} onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}>
                        <option value="">— Select —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₱) *</label>
                      <input type="number" min="0" step="0.01" required value={uploadForm.price} onChange={(e) => setUploadForm({ ...uploadForm, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea rows="4" required value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={uploadForm.is_available} onChange={(e) => setUploadForm({ ...uploadForm, is_available: e.target.checked })} />
                      Available for order
                    </label>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="upload-progress">
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress}%` }} /></div>
                      <span className="progress-text">{uploadProgress}%</span>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary btn-large submit-product-btn" disabled={uploading || !bucketExists}>
                    {uploading ? 'Uploading…' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ ORDERS TAB ============ */}
      {activeTab === 'orders' && (
        <>
          <div className="stats-overview">
            {[
              { k: 'pending', icon: '⏳', label: 'Pending', cls: 'pending-stat' },
              { k: 'preparing', icon: '📦', label: 'Preparing', cls: 'preparing-stat' },
              { k: 'completed', icon: '✅', label: 'Completed', cls: 'completed-stat' },
              { k: 'declined', icon: '❌', label: 'Declined', cls: 'declined-stat' }
            ].map(s => (
              <div key={s.k} className={`stat-card ${s.cls}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-info"><span className="stat-number">{getOrderCount(s.k)}</span><span className="stat-label">{s.label}</span></div>
              </div>
            ))}
          </div>

          <section className="employee-best-sellers">
            <div className="employee-best-sellers-heading">
              <div><span className="employee-best-sellers-eyebrow">SALES HIGHLIGHTS</span><h2>🏆 Top Best Sellers</h2><p>Ranked by quantity sold in completed orders.</p></div>
            </div>
            {employeeBestSellers.length === 0 ? (
              <div className="employee-best-sellers-empty">No completed sales yet.</div>
            ) : (
              <div className="employee-best-sellers-grid">
                {employeeBestSellers.map((p, i) => (
                  <article className={`employee-best-seller-card rank-${i + 1}`} key={i}>
                    <span className="employee-best-seller-rank">#{i + 1}</span>
                    <div className="employee-best-seller-icon">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                    <div className="employee-best-seller-info"><h3>{p.name}</h3><p>{p.category}</p></div>
                    <strong>{p.sales} sold</strong>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="kanban-board">
            {[
              { k: 'pending', icon: <ClockIcon />, label: 'Pending' },
              { k: 'preparing', icon: <PackageIcon />, label: 'Preparing' },
              { k: 'completed', icon: <CheckIcon />, label: 'Completed' },
              { k: 'declined', icon: <XIcon />, label: 'Declined' }
            ].map(col => (
              <div className="kanban-column" key={col.k}>
                <div className={`column-header ${col.k}`}>
                  <span className="column-title">{col.icon} {col.label}</span>
                  <span className="order-count">{getOrderCount(col.k)}</span>
                </div>
                <div className="column-content">
                  {orders.filter(o => o.status === col.k).length === 0 ? (
                    <div className="empty-column"><span className="empty-icon">✅</span><p>No orders</p></div>
                  ) : orders.filter(o => o.status === col.k).map(renderOrderCard)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============ PROFILE TAB ============ */}
      {activeTab === 'profile' && (
        <div className="profile-view">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar"><span className="avatar-icon">👨‍🍳</span></div>
              <div className="profile-title"><h2>Employee Profile</h2><p>Manage your account settings</p></div>
            </div>
            {profileSuccess && <div className="profile-success"><span>✅</span>{profileSuccess}</div>}
            {profileError && <div className="profile-error"><span>❌</span>{profileError}</div>}
            <div className="profile-grid">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3><span className="card-icon">📝</span> Profile</h3>
                  {!isEditingProfile && <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}><EditIcon /> Edit</button>}
                </div>
                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-group"><label>Full Name</label><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></div>
                    <div className="form-group"><label>Email</label><input type="email" value={profile.email} disabled className="disabled-input" /></div>
                    <div className="profile-actions">
                      <button type="button" className="btn-cancel" onClick={() => { setIsEditingProfile(false); setProfile({ ...profile, name: user?.name || '' }); }}>Cancel</button>
                      <button type="submit" className="btn-save" disabled={profileLoading}>{profileLoading ? 'Saving…' : <><SaveIcon /> Save</>}</button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-display">
                    <div className="profile-field"><span className="field-label">Name</span><span className="field-value">{profile.name}</span></div>
                    <div className="profile-field"><span className="field-label">Email</span><span className="field-value">{profile.email}</span></div>
                    <div className="profile-field"><span className="field-label">Role</span><span className="field-value role-badge employee">Employee</span></div>
                  </div>
                )}
              </div>
              <div className="profile-card">
                <div className="profile-card-header"><h3><span className="card-icon">🔒</span> Change Password</h3></div>
                <form onSubmit={handlePasswordUpdate} className="profile-form">
                  <div className="form-group"><label>Current Password</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required /></div>
                  <div className="form-group"><label>New Password</label><input type="password" minLength={6} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required /></div>
                  <div className="form-group"><label>Confirm New Password</label><input type="password" minLength={6} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required /></div>
                  <button type="submit" className="btn-save-password" disabled={profileLoading}>{profileLoading ? 'Updating…' : 'Update Password'}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ORDER REVIEW MODAL ============ */}
      {reviewOrder && (
        <div className="modal-overlay" onClick={closeOrderReview}>
          <div className="modal-content review-order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-order-header">
              <div className="modal-title">
                <span className="modal-icon">🧾</span>
                <div>
                  <h2>Order Review</h2>
                  <span className="modal-subtitle">
                    #{reviewOrder.order_number || reviewOrder.id.slice(0, 8)} ·{' '}
                    {new Date(reviewOrder.created_at).toLocaleString('en-PH')}
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={closeOrderReview}>×</button>
            </div>

            <div className="review-order-body">
              {/* LEFT COLUMN */}
              <div className="review-col">
                <div className="review-block">
                  <h4 className="review-block-title">👤 Customer Information</h4>
                  <div className="review-info-grid">
                    <div className="review-info-row">
                      <span className="review-info-label">Name</span>
                      <span className="review-info-value">
                        {reviewOrder.walk_in_name ||
                          reviewOrder.users?.name ||
                          reviewOrder.customer_name ||
                          'Guest'}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Email</span>
                      <span className="review-info-value">
                        {reviewOrder.users?.email || reviewOrder.customer_email || '—'}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Phone</span>
                      <span className="review-info-value">
                        {reviewOrder.users?.phone || reviewOrder.customer_phone || '—'}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Order Type</span>
                      <span className="review-info-value">
                        {reviewOrder.order_type === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Payment Method</span>
                      <span className="review-info-value">
                        {reviewOrder.payment_method?.toUpperCase() || '—'}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Payment Status</span>
                      <span className={`payment-status-badge ${reviewOrder.payment_status}`}>
                        {(reviewOrder.payment_status === 'confirmed' || reviewOrder.payment_status === 'valid') && '✅ Accepted'}
                        {reviewOrder.payment_status === 'rejected' && '❌ Rejected'}
                        {(!reviewOrder.payment_status || reviewOrder.payment_status === 'unverified') && '⏳ Pending Review'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <h4 className="review-block-title">🛍️ Order Items</h4>
                  <div className="review-items-table">
                    <div className="review-items-header">
                      <span>Item</span>
                      <span>Qty</span>
                      <span>Price</span>
                      <span>Subtotal</span>
                    </div>
                    {reviewOrder.order_items?.map((it, i) => (
                      <div key={i} className="review-items-row">
                        <span className="review-item-name">{it.menu_items?.name || 'Item'}</span>
                        <span className="review-item-qty">{it.quantity}</span>
                        <span className="review-item-price">₱{Number(it.price_at_time).toFixed(2)}</span>
                        <span className="review-item-subtotal">₱{(Number(it.price_at_time) * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="review-items-total">
                      <span style={{ gridColumn: '1 / 4' }}>TOTAL</span>
                      <span>₱{Number(reviewOrder.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="review-col">
                <div className="review-block">
                  <h4 className="review-block-title">💳 Payment Proof (GCash / Maya)</h4>

                  {(() => {
                    const url = getReceiptUrl(reviewOrder);
                    if (url) {
                      return (
                        <div className="review-proof-container">
                          <img
                            src={url}
                            alt="Payment receipt"
                            className="review-proof-image"
                            onClick={() => setReceiptViewerUrl(url)}
                            onError={(e) => {
                              console.error('❌ Failed to load receipt image:', url);
                              e.currentTarget.style.border = '2px solid #ef4444';
                              e.currentTarget.style.opacity = '0.4';
                            }}
                          />
                          <p className="review-proof-hint">Click image to enlarge</p>

                          <div className="ocr-tool-buttons">
                            <button
                              type="button"
                              className="btn-ocr-rerun"
                              onClick={() => runReceiptOcr(url)}
                              disabled={reviewOcrRunning}
                            >
                              {reviewOcrRunning ? '⏳ Running OCR…' : '🔍 Re-run OCR'}
                            </button>
                            <button
                              type="button"
                              className="btn-ocr-download"
                              onClick={() => downloadReceipt(url)}
                            >
                              ⬇️ Download
                            </button>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ocr-download"
                              style={{ textDecoration: 'none' }}
                            >
                              🔗 Open in new tab
                            </a>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="review-proof-placeholder">
                        <span className="placeholder-icon">🖼️</span>
                        <p>No payment proof uploaded by the customer.</p>
                        <details style={{ marginTop: '0.75rem', width: '100%' }}>
                          <summary
                            style={{
                              cursor: 'pointer',
                              color: '#94a3b8',
                              fontSize: '0.78rem',
                            }}
                          >
                            🔍 Debug: show order fields
                          </summary>
                          <pre
                            style={{
                              marginTop: '0.5rem',
                              maxHeight: '200px',
                              overflow: 'auto',
                              background: '#0f172a',
                              padding: '0.6rem',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              color: '#cbd5e1',
                              textAlign: 'left',
                            }}
                          >
                            {JSON.stringify(
                              Object.fromEntries(
                                Object.entries(reviewOrder || {}).filter(
                                  ([k]) =>
                                    !k.includes('items') &&
                                    !k.includes('users') &&
                                    typeof reviewOrder[k] !== 'object'
                                )
                              ),
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      </div>
                    );
                  })()}
                </div>

                <div className="review-block">
                  <h4 className="review-block-title">🤖 OCR Analysis</h4>

                  {reviewOcrRunning && (
                    <p className="ocr-disclaimer">⏳ Reading receipt with OCR…</p>
                  )}
                  {reviewOcrError && (
                    <p className="ocr-warning">⚠️ {reviewOcrError}</p>
                  )}

                  {reviewOcr && !reviewOcrRunning && (
                    <>
                      <div className="review-info-grid">
                        <div className="review-info-row">
                          <span className="review-info-label">Amount</span>
                          <span className="review-info-value">
                            {reviewOcr.amount != null ? `₱${Number(reviewOcr.amount).toFixed(2)}` : '—'}
                          </span>
                        </div>
                        <div className="review-info-row">
                          <span className="review-info-label">Reference #</span>
                          <span className="review-info-value">{reviewOcr.reference || '—'}</span>
                        </div>
                        <div className="review-info-row">
                          <span className="review-info-label">
                            Sender{reviewOcr.senderKind === 'phone' ? ' (Phone)' : reviewOcr.senderKind === 'name' ? ' (Name)' : ''}
                          </span>
                          <span className="review-info-value">{reviewOcr.accountNumber || '—'}</span>
                        </div>
                        <div className="review-info-row">
                          <span className="review-info-label">Date</span>
                          <span className="review-info-value">{reviewOcr.transactionDate || '—'}</span>
                        </div>
                        <div className="review-info-row">
                          <span className="review-info-label">Time</span>
                          <span className="review-info-value">{reviewOcr.transactionTime || '—'}</span>
                        </div>
                      </div>

                      {reviewOcr.amount != null &&
                        Number(reviewOcr.amount) !== Number(reviewOrder.total_amount) && (
                          <div className="review-warning" style={{ marginTop: '0.75rem' }}>
                            <span>⚠️</span>
                            <p>
                              OCR amount (₱{Number(reviewOcr.amount).toFixed(2)}) does not
                              match order total (₱{Number(reviewOrder.total_amount).toFixed(2)}).
                              Verify manually before accepting.
                            </p>
                          </div>
                        )}

                      <details className="ocr-details">
                        <summary>View raw OCR text</summary>
                        <pre>{reviewOcrRaw || '(no text extracted)'}</pre>
                      </details>
                    </>
                  )}

                  {!reviewOcr && !reviewOcrRunning && !reviewOcrError && (
                    <p className="ocr-disclaimer">
                      {getReceiptUrl(reviewOrder)
                        ? 'OCR has not been run yet. Click "Re-run OCR" above.'
                        : 'Upload a payment proof to enable OCR analysis.'}
                    </p>
                  )}

                  <p className="ocr-disclaimer">
                    ⚠️ OCR results are best-effort and may be inaccurate. Always visually
                    verify the receipt before accepting payment.
                  </p>
                </div>

                <div className="review-block">
                  <h4 className="review-block-title">⚡ Actions</h4>

                  {reviewStatusMsg && (
                    <div className={`review-status-message ${reviewStatusMsg.type}`}>
                      <span>{reviewStatusMsg.type === 'success' ? '✅' : '❌'}</span>
                      <p>{reviewStatusMsg.text}</p>
                    </div>
                  )}

                  {reviewOrder.payment_status !== 'confirmed' &&
                    reviewOrder.payment_status !== 'valid' &&
                    reviewOrder.payment_status !== 'rejected' && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div className="review-warning">
                          <span>🔎</span>
                          <p>Review the receipt above, then accept or reject the payment.</p>
                        </div>
                        <div className="payment-decision-buttons">
                          <button
                            className="btn-accept"
                            onClick={() => handleReviewPayment('confirmed')}
                            disabled={reviewActionLoading}
                          >
                            ✅ Accept Payment
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReviewPayment('rejected')}
                            disabled={reviewActionLoading}
                          >
                            ❌ Reject Payment
                          </button>
                        </div>
                      </div>
                    )}

                  <div className="review-actions-row">
                    {reviewOrder.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-primary"
                          disabled={
                            reviewOrder.payment_status !== 'confirmed' &&
                            reviewOrder.payment_status !== 'valid'
                          }
                          onClick={() => handleReviewOrderStatus('preparing')}
                        >
                          📦 Start Preparing
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReviewOrderStatus('declined')}
                        >
                          ❌ Decline Order
                        </button>
                      </>
                    )}
                    {reviewOrder.status === 'preparing' && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleReviewOrderStatus('completed')}
                      >
                        ✅ Mark Completed
                      </button>
                    )}
                    {(reviewOrder.status === 'completed' || reviewOrder.status === 'declined') && (
                      <p className="ocr-disclaimer">
                        This order is already <strong>{reviewOrder.status}</strong>.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ RECEIPT VIEWER OVERLAY ============ */}
      {receiptViewerUrl && (
        <div className="receipt-viewer-overlay" onClick={() => setReceiptViewerUrl(null)}>
          <div className="receipt-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="receipt-viewer-close" onClick={() => setReceiptViewerUrl(null)}>×</button>
            <h3 className="receipt-viewer-title">Payment Receipt</h3>
            <img src={receiptViewerUrl} alt="Payment receipt enlarged" className="receipt-viewer-image" />
          </div>
        </div>
      )}

      {/* Receipt modal after POS order */}
      {posLastOrder && (
        <div className="modal-overlay" onClick={() => setPosLastOrder(null)}>
          <div className="modal-content pos-receipt-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title"><span className="modal-icon">🧾</span><h2>Order Placed</h2></div>
              <button className="close-btn" onClick={() => setPosLastOrder(null)}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ color: '#34d399', fontWeight: 600, marginBottom: '1rem' }}>
                ✅ Order #{posLastOrder.order.order_number || posLastOrder.order.id.slice(0, 8)} sent to kitchen.
              </p>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: 10, color: '#e2e8f0', fontSize: '0.9rem' }}>
                {posLastOrder.items.map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{i.qty}× {i.name}</span><span>₱{(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <hr style={{ borderColor: '#334155', margin: '0.6rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₱{posLastOrder.subtotal.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.5rem' }}>
                  <span>TOTAL</span><span>₱{posLastOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPosLastOrder(null)}>Done</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={posPrintReceipt}>🖨️ Print Receipt</button>
              </div>
            </div>
          </div>
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
