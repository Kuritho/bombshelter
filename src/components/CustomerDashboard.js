// src/components/CustomerDashboard.js
import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { supabase } from '../supabaseClient';
import {
  useMenuItems,
  useOrders,
  useCategories,
  useBestSellers,
  useProductRatings
} from '../hooks/useSupabase';
import './CustomerDashboard.css';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import logo from '../assets/logo.jpg';
import gcashQR from '../assets/gcash-qr.png';
import paymayaQR from '../assets/paymaya-qr.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// ============================================
// ICONS
// ============================================
const ShoppingCartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>);
const LogOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const OrdersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const CoffeeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>);
const WarningIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const XCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const MinusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>);
const ReceiptIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>);
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const GCashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>);
const PayMayaIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>);
const MapPinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const TruckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);

// ============================================
// RATING STARS
// ============================================
function RatingStars({ value = 0, count = 0, size = 14 }) {
  const stars = [1, 2, 3, 4, 5];
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="rating-stars" aria-label={`Rating: ${value} of 5`}>
      {stars.map(s => {
        const filled = rounded >= s;
        const half = !filled && rounded >= s - 0.5;
        return (
          <span key={s} className={`rating-star ${filled ? 'filled' : half ? 'half' : ''}`} style={{ fontSize: size }}>
            {filled ? '★' : half ? '⯨' : '☆'}
          </span>
        );
      })}
      <span className="rating-count">{count > 0 ? `${value.toFixed(1)} (${count})` : 'No reviews yet'}</span>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================
const getPaymentStatusInfo = (status) => {
  switch (status) {
    case 'confirmed': return { label: '✅ Confirmed', className: 'confirmed' };
    case 'rejected': return { label: '❌ Rejected', className: 'rejected' };
    case 'unverified':
    default: return { label: '⏳ Awaiting Verification', className: 'unverified' };
  }
};

// OCR Parser (unchanged from your original)
const matchReference = (text) => { if (!text) return ''; const cleaned = String(text).replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b.*$/i, '').replace(/\b(?:AM|PM)\b.*$/i, '').trim(); const tokens = cleaned.split(/\s+/); const tokenIsAlnumRef = (tok) => /^[A-Z0-9]{3,}$/i.test(tok.replace(/[^\w]/g, '')); for (let start = 0; start < tokens.length; start++) { let accumulated = ''; for (let j = start; j < Math.min(start + 5, tokens.length); j++) { const raw = tokens[j].replace(/[^\w]/g, ''); if (!tokenIsAlnumRef(raw)) break; accumulated += raw.toUpperCase(); if (accumulated.length === 12 && /[A-Z]/.test(accumulated) && /\d/.test(accumulated)) return accumulated; if (accumulated.length > 12) break; } } for (let start = 0; start < tokens.length; start++) { let accumulated = ''; for (let j = start; j < Math.min(start + 5, tokens.length); j++) { const raw = tokens[j].replace(/[^\w]/g, ''); if (!/^\d+$/.test(raw)) break; accumulated += raw; if (accumulated.length === 13) return accumulated; if (accumulated.length > 13) break; } } const compactUpper = cleaned.replace(/[^\w]/g, ' ').toUpperCase(); const mayaFallback = compactUpper.match(/\b[A-Z0-9]{12}\b/); if (mayaFallback && /[A-Z]/.test(mayaFallback[0]) && /\d/.test(mayaFallback[0])) return mayaFallback[0]; const gcash13 = cleaned.match(/\d{13}/); if (gcash13) return gcash13[0]; const gcash12 = cleaned.match(/\d{12}/); if (gcash12) return gcash12[0]; return ''; };
const matchSender = (lines, compact) => { const phoneFlexible = /(\+?63[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}|09\d{2}[\s-]?\d{3}[\s-]?\d{4})/i; const numberLabels = /(?:account\s*(?:number|no\.?|#)|mobile\s*(?:number|no\.?|#)|phone\s*(?:number|no\.?|#)|contact\s*(?:number|no\.?|#)|sender|from|gcash|maya)\s*[:\-]?\s*/i; for (let i = 0; i < lines.length; i++) { if (!numberLabels.test(lines[i])) continue; let candidate = lines[i].replace(numberLabels, '').trim(); if (!candidate && lines[i + 1]) candidate = lines[i + 1].trim(); const m = candidate.match(phoneFlexible); if (m) return { value: m[1].replace(/\s{2,}/g, ' ').trim(), kind: 'phone' }; } const globalPhone = compact.match(/(\+?63[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}|09\d{2}[\s-]?\d{3}[\s-]?\d{4})/); if (globalPhone) return { value: globalPhone[1].replace(/\s{2,}/g, ' ').trim(), kind: 'phone' }; const nameLabel = /(?:^|\s|[-–])\s*(?:from|sender(?:\s*name)?|paid\s*by|sent\s*by)\s*[:\-]?\s*/i; for (let i = 0; i < lines.length; i++) { if (!nameLabel.test(lines[i])) continue; let candidate = lines[i].replace(nameLabel, '').trim().replace(/[^A-Za-zÀ-ÿ\s.'\-]/g, '').trim(); if (candidate && candidate.length >= 3 && candidate.length <= 80 && /[A-Za-zÀ-ÿ]/.test(candidate)) { return { value: candidate, kind: 'name' }; } } return { value: '', kind: 'unknown' }; };
const parsePaymentReceiptText = (rawText) => { /* full parser - unchanged */ const normalized = String(rawText || '').replace(/\u00a0/g, ' ').replace(/[\t ]+/g, ' ').replace(/\r/g, '\n').replace(/\n{2,}/g, '\n').trim(); const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean); const compact = normalized.replace(/\n/g, ' '); const labeledAmount = compact.match(/(?:amount(?:\s+(?:sent|paid|transferred|received))?|total\s+amount|amount\s+of|payment\s+amount|you\s+sent|sent\s+amount|sent\s+money)\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i); const totalAmount = compact.match(/\btotal\s*[:\-]?\s*(?:PHP|₱|\bP\.?\s*)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i); const bareAmount = compact.match(/[–\-]\s*(?:PHP|₱|\bP\.?\s*)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/); const amountCandidate = labeledAmount || totalAmount || bareAmount; let amount = null; if (amountCandidate) { const parsed = Number(amountCandidate[1].replace(/,/g, '')); if (Number.isFinite(parsed) && parsed > 0) amount = parsed; } let reference = ''; const refLabel = /(?:reference(?:\s*(?:id|number|no\.?|#))?|ref\.?\s*(?:number|no\.?|#)?|transaction\s*(?:id|number|no\.?|#)|txn\.?\s*(?:id|no\.?|#)|trace\s*(?:id|number|no\.?|#))/i; for (let i = 0; i < lines.length && !reference; i++) { if (!refLabel.test(lines[i])) continue; let candidateText = lines[i].replace(refLabel, '').replace(/^[\s:#\-\.]+/, '').trim(); reference = matchReference(candidateText); if (!reference && candidateText.length < 25 && i + 1 < lines.length) reference = matchReference(lines[i + 1]); } if (!reference) { const mayaFallback = compact.replace(/[^\w]/g, ' ').toUpperCase().match(/\b[A-Z0-9]{12}\b/); if (mayaFallback && /[A-Z]/.test(mayaFallback[0]) && /\d/.test(mayaFallback[0])) reference = mayaFallback[0]; } if (!reference) { const g = compact.match(/\d{13}/); if (g) reference = g[0]; } const sender = matchSender(lines, compact); const dateRegex = /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/i; let transactionDate = ''; const dm = normalized.match(dateRegex); if (dm) transactionDate = dm[1]; const timeRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\b/; let transactionTime = ''; const tm = normalized.match(timeRegex); if (tm) transactionTime = tm[1]; return { text: normalized, amount, reference, accountNumber: sender.value, senderKind: sender.kind, transactionDate, transactionTime }; };
const recognizePaymentReceipt = async (worker, image) => { /* unchanged */ const candidates = []; for (const pageSegMode of ['6', '11']) { try { if (worker.setParameters) await worker.setParameters({ tessedit_pageseg_mode: pageSegMode, tessedit_char_whitelist: '' }); } catch {} const { data } = await worker.recognize(image); const parsed = parsePaymentReceiptText(data?.text || ''); const score = [parsed.amount != null, !!parsed.reference, !!parsed.accountNumber].filter(Boolean).length * 1000 + Math.min(parsed.text.length, 999); candidates.push({ parsed, score }); } try { if (worker.setParameters) await worker.setParameters({ tessedit_pageseg_mode: '6', tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. ' }); const { data } = await worker.recognize(image); const parsed = parsePaymentReceiptText(data?.text || ''); const score = [parsed.amount != null, !!parsed.reference, !!parsed.accountNumber].filter(Boolean).length * 1000 + Math.min(parsed.text.length, 999) + 500; candidates.push({ parsed, score }); } catch {} candidates.sort((a, b) => b.score - a.score); return candidates[0]?.parsed || parsePaymentReceiptText(''); };

// ============================================
// MODALS
// ============================================
function ConfirmModal({ isOpen, title, message, confirmText = 'Yes, Confirm', cancelText = 'No, Cancel', onConfirm, onCancel, isLoading = false, variant = 'warning', iconType = 'warning' }) {
  if (!isOpen) return null;
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className={`confirm-modal-content confirm-modal-${variant}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">{iconType === 'x-circle' ? <XCircleIcon /> : <WarningIcon />}</div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-btn confirm-btn-no" onClick={onCancel} disabled={isLoading}>{cancelText}</button>
          <button className={`confirm-btn confirm-btn-yes confirm-btn-yes-${variant}`} onClick={onConfirm} disabled={isLoading}>{isLoading ? '⏳ Processing...' : confirmText}</button>
        </div>
      </div>
    </div>
  );
}
function ReceiptViewerModal({ isOpen, imageUrl, onClose }) {
  if (!isOpen || !imageUrl) return null;
  return (
    <div className="receipt-viewer-overlay" onClick={onClose}>
      <div className="receipt-viewer-content" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-viewer-close" onClick={onClose}>×</button>
        <h3 className="receipt-viewer-title">Payment Proof</h3>
        <img src={imageUrl} alt="Payment proof" className="receipt-viewer-image" />
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
function CustomerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine-in');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  
  // Delivery State
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState(null);
  const [deliveryLng, setDeliveryLng] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');  // NEW

  const [gcashProof, setGcashProof] = useState(null);
  const [gcashProofPreview, setGcashProofPreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState({ text: '', amount: null, reference: '', accountNumber: '', senderKind: 'unknown', transactionDate: '', transactionTime: '' });
  const [ocrError, setOcrError] = useState('');
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, text: '' });
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartNotification, setCartNotification] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [profile, setProfile] = useState({ 
  name: user?.name || '', 
  email: user?.email || '',
  phone: user?.phone || ''
});
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: 'Yes', cancelText: 'No', onConfirm: null, variant: 'warning', iconType: 'warning', isLoading: false });

  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);

  const openConfirm = ({ title, message, confirmText, cancelText, onConfirm, variant = 'warning', iconType = 'warning' }) => { setConfirmModal({ isOpen: true, title, message, confirmText: confirmText || 'Yes', cancelText: cancelText || 'No', onConfirm, variant, iconType, isLoading: false }); };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null, isLoading: false }));

  const { items: menuItems, loading: menuLoading, refetch: refetchMenuItems } = useMenuItems();
  const { categories } = useCategories();
  const { items: bestSellers, refetch: refetchBestSellers } = useBestSellers(6);
  const { refetch: refetchRatings } = useProductRatings();
  const { orders, createOrder, refresh: refreshOrders } = useOrders(user?.id);

  // LIVE TRACKING EFFECT
  useEffect(() => {
    if (!orders) return;
    const activeDelivery = orders.find(o => o.status === 'out_for_delivery');
    setActiveTrackingOrder(activeDelivery || null);
    if (!activeDelivery) { setDriverCoords(null); return; }
    if (activeDelivery.driver_current_lat) setDriverCoords([activeDelivery.driver_current_lat, activeDelivery.driver_current_lng]);
    const sub = supabase.channel('live-track').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${activeDelivery.id}` }, (payload) => {
      if (payload.new.driver_current_lat) setDriverCoords([payload.new.driver_current_lat, payload.new.driver_current_lng]);
      if (payload.new.status === 'completed') { setActiveTrackingOrder(null); setDriverCoords(null); }
    }).subscribe();
    return () => sub.unsubscribe();
  }, [orders]);

  useEffect(() => () => { if (gcashProofPreview?.startsWith('blob:')) URL.revokeObjectURL(gcashProofPreview); }, [gcashProofPreview]);

  // Address search with Geoapify
  const searchAddress = async (query) => {
    if (query.length < 4) { setAddressSuggestions([]); return; }
    const apiKey = process.env.REACT_APP_GEOAPIFY_KEY;
    if (!apiKey) { console.warn('No Geoapify key'); return; }
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=5&filter=countrycode:ph`);
      const data = await res.json();
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (err) { console.error('Address search error:', err); }
  };

  let addressDebounce;
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setDeliveryAddress(value);
    setDeliveryLat(null);
    setDeliveryLng(null);
    clearTimeout(addressDebounce);
    addressDebounce = setTimeout(() => searchAddress(value), 300);
  };

  const handleSelectAddress = (feature) => {
    setDeliveryAddress(feature.properties.formatted);
    setDeliveryLat(feature.properties.lat);
    setDeliveryLng(feature.properties.lon);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  // Handlers
  const handleGcashProofSelect = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) { alert('Invalid file type'); e.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); e.target.value = ''; return; }
    if (gcashProofPreview?.startsWith('blob:')) URL.revokeObjectURL(gcashProofPreview);
    setGcashProof(file); setGcashProofPreview(URL.createObjectURL(file));
    setOcrResult({ text: '', amount: null, reference: '', accountNumber: '', senderKind: 'unknown', transactionDate: '', transactionTime: '' }); setOcrError(''); setOcrLoading(true);
    let worker;
    try { worker = await createWorker('eng'); const extracted = await recognizePaymentReceipt(worker, file); setOcrResult(extracted); }
    catch (err) { setOcrError('Could not read automatically.'); }
    finally { if (worker) await worker.terminate(); setOcrLoading(false); }
  };

  const clearProof = () => {
    if (gcashProofPreview?.startsWith('blob:')) URL.revokeObjectURL(gcashProofPreview);
    setGcashProof(null); setGcashProofPreview(null); setOcrResult({ text: '', amount: null, reference: '', accountNumber: '', senderKind: 'unknown', transactionDate: '', transactionTime: '' }); setOcrError(''); setOcrLoading(false);
    const fileInput = document.getElementById('gcash-proof-input'); if (fileInput) fileInput.value = '';
  };

  const handlePaymentMethodChange = (method) => { if (method === paymentMethod) return; if (gcashProof) { openConfirm({ title: 'Change Method?', message: 'Upload will be cleared.', confirmText: 'Yes', cancelText: 'No', variant: 'warning', onConfirm: () => { closeConfirm(); setPaymentMethod(method); clearProof(); } }); } else { setPaymentMethod(method); } };
  const downloadQR = async () => { /* existing code */ };
  const addToCart = (item) => { setError(null); const existing = cart.find(c => c.id === item.id); openConfirm({ title: 'Add to Cart?', message: `Add "${item.name}"?`, confirmText: 'Yes', cancelText: 'No', variant: 'warning', onConfirm: () => { closeConfirm(); if (existing) setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)); else setCart([...cart, { ...item, qty: 1 }]); setCartNotification(`${item.name} added`); setTimeout(() => setCartNotification(null), 2500); } }); };
  const increaseQty = (id) => { setCart(cart.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c)); };
  const decreaseQty = (id) => { const item = cart.find(c => c.id === id); if (!item) return; if (item.qty === 1) { openConfirm({ title: 'Remove Item?', message: `Remove "${item.name}"?`, confirmText: 'Yes', cancelText: 'No', variant: 'danger', iconType: 'x-circle', onConfirm: () => { closeConfirm(); setCart(cart.filter(c => c.id !== id)); } }); return; } setCart(cart.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c)); };
  const removeFromCart = (id) => { openConfirm({ title: 'Remove Item?', message: 'Remove this item?', confirmText: 'Yes', cancelText: 'No', variant: 'danger', iconType: 'x-circle', onConfirm: () => { closeConfirm(); setCart(cart.filter(c => c.id !== id)); } }); };
  const clearCart = () => { openConfirm({ title: 'Clear Cart?', message: `Remove all ${cartItemCount} items?`, confirmText: 'Yes', cancelText: 'No', variant: 'danger', onConfirm: () => { closeConfirm(); setCart([]); } }); };

  const cancelOrder = (order) => { openConfirm({ title: 'Cancel Order?', message: `Cancel #${order.order_number || order.id.slice(0, 8)}?`, confirmText: 'Yes', cancelText: 'No', variant: 'danger', onConfirm: async () => { setCancellingOrder(order.id); closeConfirm(); try { await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id); await refreshOrders(); alert('Cancelled'); } catch (err) { alert(err.message); } finally { setCancellingOrder(null); } } }); };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.qty, 0);

  const uploadProofImage = async (file) => { const fileExt = file.name.split('.').pop(); const fileName = `proofs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`; const { error } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600', upsert: false }); if (error) throw new Error(error.message); const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl; };

  const handleCheckout = () => {
    if (orderType === 'delivery' && !deliveryAddress.trim()) return alert('Enter delivery address.');
    if (orderType === 'delivery' && (!deliveryLat || !deliveryLng)) return alert('Please select a suggested address from the dropdown.');
    if (!gcashProof) return alert(`Upload ${paymentMethod} proof.`);
    if (cart.length === 0) return alert('Cart empty!');

    const itemSummary = cart.map(i => `• ${i.qty}x ${i.name}`).join('\n');
    const typeLabel = orderType === 'takeout' ? '📦 Takeout' : orderType === 'delivery' ? '🛵 Delivery' : '🍽️ Dine In';

    openConfirm({
      title: 'Place Order?', message: `${itemSummary}\n\nType: ${typeLabel}\n${orderType === 'delivery' ? `Address: ${deliveryAddress}\n` : ''}${customerNotes ? `Notes: ${customerNotes}\n` : ''}Total: ₱${cartTotal.toFixed(2)}`, confirmText: 'Yes', cancelText: 'No', variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true })); setError(null); setOrderLoading(true);
        try {
          let deliveryData = {}; let generatedOtp = null;
          if (orderType === 'delivery') {
            generatedOtp = `DEL-${Math.floor(1000 + Math.random() * 9000)}`;
            deliveryData = { delivery_address: deliveryAddress.trim(), delivery_lat: deliveryLat, delivery_lng: deliveryLng, delivery_otp: generatedOtp };
          }

          const proofImageUrl = await uploadProofImage(gcashProof);
          const orderData = {
            customer_id: user.id,
            status: 'pending',
            payment_status: 'unverified',
            payment_method: paymentMethod,
            total_amount: cartTotal,
            order_type: orderType,
            proof_image_url: proofImageUrl,
            customer_notes: customerNotes.trim() || null,   // NEW
            ...deliveryData
          };
          const newOrder = await createOrder(orderData);

          await supabase.from('orders').update({
            ocr_detected_amount: ocrResult.amount,
            ocr_reference_number: ocrResult.reference || null,
            ocr_account_number: ocrResult.accountNumber || null,
            ocr_transaction_date: ocrResult.transactionDate || null,
            ocr_transaction_time: ocrResult.transactionTime || null,
            ocr_extracted_text: ocrResult.text || null
          }).eq('id', newOrder.id);

          const orderItems = cart.map(item => ({ order_id: newOrder.id, menu_item_id: item.id, quantity: item.qty, price_at_time: item.price }));
          await supabase.from('order_items').insert(orderItems);

          setCart([]); setDeliveryAddress(''); setDeliveryLat(null); setDeliveryLng(null); setCustomerNotes(''); clearProof();
          await refreshOrders(); setActiveTab('orders'); closeConfirm();
          if (generatedOtp) alert(`✅ Order placed!\nOTP: ${generatedOtp}\nGive this to the driver.`); else alert('✅ Order placed!');
        } catch (error) { setConfirmModal(prev => ({ ...prev, isLoading: false })); alert('❌ ' + error.message); }
        finally { setOrderLoading(false); }
      }
    });
  };

  const submitReview = (orderId) => { if (!reviewForm.text.trim()) return alert('Write a review.'); openConfirm({ title: 'Submit Review?', message: `${reviewForm.rating}-star review?`, confirmText: 'Yes', cancelText: 'No', variant: 'warning', onConfirm: async () => { setConfirmModal(prev => ({ ...prev, isLoading: true })); try { await supabase.from('reviews').insert([{ order_id: orderId, customer_id: user.id, rating: reviewForm.rating, text: reviewForm.text }]); setReviewForm({ orderId: null, rating: 5, text: '' }); await refreshOrders(); closeConfirm(); alert('✅ Submitted!'); } catch (error) { setConfirmModal(prev => ({ ...prev, isLoading: false })); alert(error.message); } } }); };

  const handleProfileUpdate = (e) => { 
  e.preventDefault(); 
  if (profile.name === user?.name && profile.phone === user?.phone) { 
    alert('No changes.'); 
    return; 
  } 
  openConfirm({ 
    title: 'Update Profile?', 
    message: `Save these profile changes?`, 
    confirmText: 'Yes', cancelText: 'No', variant: 'warning', 
    onConfirm: async () => { 
      closeConfirm(); 
      setProfileLoading(true); 
      try { 
        const { error } = await supabase.from('users').update({ 
          name: profile.name,
          phone: profile.phone.trim() || null
        }).eq('id', user.id); 
        if (error) throw error; 
        setProfileSuccess('✅ Updated!'); 
        setIsEditingProfile(false); 
        user.name = profile.name; 
        user.phone = profile.phone;
        setTimeout(() => setProfileSuccess(''), 3000); 
      } catch (err) { 
        setProfileError(err.message); 
      } finally { 
        setProfileLoading(false); 
      } 
    } 
  }); 
};
  const handlePasswordUpdate = (e) => { e.preventDefault(); if (passwordData.newPassword !== passwordData.confirmPassword) return setProfileError('Passwords do not match'); if (passwordData.newPassword.length < 6) return setProfileError('Min 6 chars'); openConfirm({ title: 'Change Password?', message: `Update password?`, confirmText: 'Yes', cancelText: 'No', variant: 'warning', onConfirm: async () => { closeConfirm(); setProfileLoading(true); try { await supabase.auth.updateUser({ password: passwordData.newPassword }); setProfileSuccess('✅ Password updated!'); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setTimeout(() => setProfileSuccess(''), 3000); } catch (err) { setProfileError(err.message); } finally { setProfileLoading(false); } } }); };
  const handleLogout = () => { openConfirm({ title: 'Log Out?', message: 'Are you sure?', confirmText: 'Yes', cancelText: 'No', variant: 'warning', onConfirm: () => { closeConfirm(); onLogout(); } }); };

  if (menuLoading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading menu...</p></div>;

  return (
    <div className="customer-dashboard">
      {cartNotification && <div className="cart-notification"><span className="notification-icon">✅</span>{cartNotification}</div>}

      <header className="dashboard-header">
        <div className="header-left"><div className="brand-logo"><img src={logo} alt="1of1 Coffee" className="brand-logo-image" /><div className="brand-text"><h1>1of1 Coffee</h1><span className="brand-subtitle">Bombshelter Ordering</span></div></div></div>
        <div className="header-right"><div className="user-info"><span className="user-avatar">👤</span><span className="user-name">{user?.name || 'Guest'}</span></div><button className="logout-btn" onClick={handleLogout}><LogOutIcon /> Logout</button></div>
      </header>

      <nav className="dashboard-nav">
        <button className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}><CoffeeIcon /><span>Menu</span></button>
        <button className={`nav-tab ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}><ShoppingCartIcon /><span>Cart</span>{cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}</button>
        <button className={`nav-tab ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setActiveTab('track')}><TruckIcon /><span>Track Order</span>{activeTrackingOrder && <span className="nav-badge" style={{background:'#10b981'}}>LIVE</span>}</button>
        <button className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><OrdersIcon /><span>Orders</span></button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><UserIcon /><span>Profile</span></button>
      </nav>

      {error && <div className="error-banner"><span className="error-icon">❌</span><span>{error}</span><button className="error-close" onClick={() => setError(null)}>×</button></div>}

      {/* MENU VIEW */}
      {activeTab === 'menu' && (
        <div className="menu-view">
          <div className="menu-header-section"><h2>Our Menu</h2><p className="menu-subtitle">Handcrafted with love</p></div>
          {bestSellers.length > 0 && (<div className="best-sellers-section"><div className="best-sellers-header"><h3>🔥 Best Sellers</h3></div><div className="best-sellers-row">{bestSellers.map((item, idx) => (<div key={item.id} className="best-seller-card"><div className="best-seller-image-wrapper"><img src={item.image_url} alt={item.name} className="best-seller-image" /><div className="best-seller-rank">#{idx + 1} · {item.total_sold} sold</div></div><div className="best-seller-info"><h4>{item.name}</h4><div className="best-seller-meta"><RatingStars value={Number(item.avg_rating) || 0} count={item.review_count} /><span className="best-seller-price">₱{item.price}</span></div></div><button className="add-to-cart-btn compact" onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, description: item.description })}><ShoppingCartIcon /> Add</button></div>))}</div></div>)}
          {categories.length > 0 && (<div className="category-jump-nav"><span className="category-jump-label">Jump to:</span><div className="category-jump-pills">{categories.map(cat => (<button key={cat.id} className="category-jump-pill" onClick={() => { const el = document.getElementById(`category-${cat.slug}`); if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 100; window.scrollTo({ top: y, behavior: 'smooth' }); } }} style={{ '--cat-color': cat.color }}><span className="category-jump-icon">{cat.icon}</span><span>{cat.name}</span></button>))}</div></div>)}
          <div className="category-sections">
            {categories.map(cat => { const items = menuItems.filter(i => i.category_id === cat.id); if (items.length === 0) return null; return (<section key={cat.id} id={`category-${cat.slug}`} className="category-section"><div className="category-section-header" style={{ '--cat-color': cat.color }}><div className="category-section-title-wrap"><span className="category-section-icon">{cat.icon}</span><div><h3 className="category-section-title">{cat.name}</h3><p className="category-section-count">{items.length} items</p></div></div><div className="category-section-accent" style={{ background: cat.color }} /></div><div className="category-section-grid">{items.map(item => (<div key={item.id} className="menu-item-card"><div className="item-image-wrapper"><img src={item.image_url} alt={item.name} className="item-image" /><div className="item-category">{item.category?.icon} {item.category?.name}</div></div><div className="item-content"><div className="item-header"><h3 className="item-title">{item.name}</h3><p className="item-price">₱{item.price}</p></div><div className="item-rating-row"><RatingStars value={Number(item.avg_rating) || 0} count={item.review_count || 0} /></div><p className="item-description">{item.description}</p><button className="add-to-cart-btn" onClick={() => addToCart(item)}><ShoppingCartIcon /> Add to Cart</button></div></div>))}</div></section>); })}
          </div>
        </div>
      )}

      {/* CART VIEW */}
      {activeTab === 'cart' && (
        <div className="cart-view">
          <div className="cart-container">
            <div className="cart-items-section">
              <div className="cart-section-header"><h2>Your Order</h2>{cart.length > 0 && (<button className="clear-cart-btn" onClick={clearCart}><TrashIcon /> Clear</button>)}</div>
              {cart.length === 0 ? (<div className="empty-state"><div className="empty-icon">☕</div><h3>Cart is empty</h3><button className="browse-menu-btn" onClick={() => setActiveTab('menu')}>Browse Menu</button></div>) : (cart.map(item => (<div key={item.id} className="cart-item"><div className="cart-item-info"><img src={item.image_url} alt={item.name} className="cart-item-img" /><div className="cart-item-details"><h3>{item.name}</h3><p className="cart-item-price">₱{item.price} each</p></div></div><div className="cart-item-actions"><div className="qty-controls"><button className="qty-btn qty-btn-minus" onClick={() => decreaseQty(item.id)}><MinusIcon /></button><span className="qty-value">{item.qty}</span><button className="qty-btn qty-btn-plus" onClick={() => increaseQty(item.id)}><PlusIcon /></button></div><span className="cart-item-total">₱{(item.price * item.qty).toFixed(2)}</span><button className="remove-btn" onClick={() => removeFromCart(item.id)}><TrashIcon /></button></div></div>)))}
            </div>

            {cart.length > 0 && (
              <div className="checkout-panel">
                <h2>Order Summary</h2>

                <div className="order-type-selector">
                  <label>Order Type</label>
                  <div className="order-type-options" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <button className={`order-type-btn ${orderType === 'dine-in' ? 'active' : ''}`} onClick={() => setOrderType('dine-in')}>🍽️ Dine In</button>
                    <button className={`order-type-btn ${orderType === 'takeout' ? 'active' : ''}`} onClick={() => setOrderType('takeout')}>📦 Takeout</button>
                    <button className={`order-type-btn ${orderType === 'delivery' ? 'active' : ''}`} onClick={() => setOrderType('delivery')}>🛵 Delivery</button>
                  </div>
                </div>

                {/* DELIVERY ADDRESS WITH AUTOCOMPLETE */}
                {orderType === 'delivery' && (
                  <div className="order-type-selector" style={{ marginTop: '-0.5rem', position: 'relative' }}>
                    <label style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPinIcon /> Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Search for your address..."
                      value={deliveryAddress}
                      onChange={handleAddressChange}
                      onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', marginTop: '0.3rem' }}
                    />
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', marginTop: '4px', maxHeight: '220px', overflowY: 'auto', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                        {addressSuggestions.map((s, i) => (
                          <div key={i} onMouseDown={(e) => { e.preventDefault(); handleSelectAddress(s); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: i < addressSuggestions.length - 1 ? '1px solid #334155' : 'none', fontSize: '0.85rem', color: '#e2e8f0' }}>
                            📍 {s.properties.formatted}
                          </div>
                        ))}
                      </div>
                    )}
                    {deliveryLat && deliveryLng && (
                      <p style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem' }}>✅ Exact location captured: {deliveryLat.toFixed(4)}, {deliveryLng.toFixed(4)}</p>
                    )}
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>Type at least 4 characters to see suggestions.</p>
                  </div>
                )}

                {/* CUSTOMER NOTES - NEW */}
                <div className="order-type-selector" style={{ marginTop: '0.5rem' }}>
                  <label style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>📝 Notes for Driver / Staff (Optional)</label>
                  <textarea
                    placeholder="E.g., Gate code is 1234, please knock loudly. No ice."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={2}
                    maxLength={300}
                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', marginTop: '0.3rem', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'right' }}>{customerNotes.length}/300</p>
                </div>

                {/* PAYMENT METHOD */}
                <div className="payment-method-selector">
                  <label>Payment Method</label>
                  <div className="payment-method-options">
                    <button className={`payment-method-btn gcash ${paymentMethod === 'gcash' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('gcash')}><GCashIcon /><span>GCash</span></button>
                    <button className={`payment-method-btn paymaya ${paymentMethod === 'paymaya' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('paymaya')}><PayMayaIcon /><span>PayMaya</span></button>
                  </div>
                </div>

                {/* PAYMENT SECTION */}
                <div className="payment-section">
                  <h3 className="payment-section-title">Pay via {paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'}</h3>
                  <div className="payment-step">
                    <div className="step-header"><span className="step-badge">Step 1</span><span className="step-title">Scan the QR code to pay</span></div>
                    <div className="qr-code-container"><img src={paymentMethod === 'gcash' ? gcashQR : paymayaQR} alt="QR" className="qr-code-image" /><div className="qr-amount-badge">Total: ₱{cartTotal}</div></div>
                    <button type="button" className="download-qr-btn" onClick={downloadQR}><DownloadIcon /><span>Download QR</span></button>
                    <p className="step-hint">Open {paymentMethod} → Scan QR → Pay <strong>₱{cartTotal}</strong></p>
                  </div>
                  <div className="payment-step">
                    <div className="step-header"><span className="step-badge">Step 2</span><span className="step-title">Upload your receipt</span></div>
                    <div className="gcash-upload">
                      {gcashProofPreview ? (<div className="proof-preview"><img src={gcashProofPreview} alt="Proof" /><button type="button" className="remove-proof-btn" onClick={clearProof}>Remove</button></div>) : (<div className="file-upload-wrapper"><input id="gcash-proof-input" type="file" accept="image/*" className="file-input" onChange={handleGcashProofSelect} /><div className="file-upload-label"><UploadIcon /><span>Click to upload screenshot</span><span className="upload-hint">JPG, PNG, WEBP (Max 5MB)</span></div></div>)}
                      {gcashProof && (<div className="payment-ocr-panel"><strong>Receipt OCR</strong>{ocrLoading ? <p>Reading…</p> : ocrError ? <p className="payment-ocr-warning">{ocrError}</p> : ocrResult.text ? (<><div className="payment-ocr-fields"><div><span>Amount</span><strong>{ocrResult.amount !== null ? `₱${ocrResult.amount.toFixed(2)}` : 'Not detected'}</strong></div><div><span>Reference</span><strong>{ocrResult.reference || 'Not detected'}</strong></div><div><span>Sender</span><strong>{ocrResult.accountNumber || 'Not detected'}</strong></div></div></>) : <p>No text detected.</p>}</div>)}
                    </div>
                  </div>
                </div>

                <div className="checkout-summary">
                  <div className="checkout-summary-row"><span>Subtotal</span><span>₱{cartTotal}</span></div>
                  <div className="checkout-total"><span>Total</span><span>₱{cartTotal}</span></div>
                </div>

                <button className={`checkout-btn ${!gcashProof ? 'disabled' : ''}`} disabled={cart.length === 0 || !gcashProof || orderLoading} onClick={handleCheckout}>
                  {orderLoading ? <span className="btn-loading"><span className="btn-spinner"></span>Processing...</span> : 'Place Order'}
                </button>
                {!gcashProof && (<p className="checkout-hint">ⓘ Please upload proof of payment.</p>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIVE TRACK TAB */}
      {activeTab === 'track' && (
        <div className="track-view" style={{ padding: '2rem', height: 'calc(100vh - 150px)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Live Delivery Tracking</h2>
          {!activeTrackingOrder ? (
            <div className="empty-state"><div className="empty-icon">🛵</div><h3>No active delivery</h3><p>{orders?.find(o => o.order_type === 'delivery' && !['completed','cancelled','declined'].includes(o.status))?.status === 'pending' ? 'Order is pending employee acceptance.' : 'No delivery on the way.'}</p></div>
          ) : (
            <div className="tracking-container" style={{ height: '100%', display: 'flex', gap: '1.5rem' }}>
              <div className="tracking-sidebar" style={{ width: '350px', background: '#1e293b', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span className="status-badge out_for_delivery">🛵 Out for Delivery</span>
                <h3 style={{ margin: 0 }}>Order #{activeTrackingOrder.order_number || activeTrackingOrder.id.slice(0,8)}</h3>
                <p style={{ color: '#94a3b8', margin: 0 }}><MapPinIcon /> {activeTrackingOrder.delivery_address}</p>
                <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '10px', marginTop: '1rem', border: '1px solid #f59e0b', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#fcd34d', textTransform: 'uppercase', fontWeight: 'bold' }}>Show this OTP to driver</p>
                  <h1 style={{ margin: 0, color: '#f59e0b', letterSpacing: '3px', fontSize: '2.5rem' }}>{activeTrackingOrder.delivery_otp}</h1>
                </div>
                {activeTrackingOrder.customer_notes && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#93c5fd', fontWeight: 'bold' }}>📝 Your note to driver:</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#f8fafc' }}>{activeTrackingOrder.customer_notes}</p>
                  </div>
                )}
                <p style={{ marginTop: 'auto', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>{driverCoords ? 'Driver is on the way!' : 'Waiting for driver location...'}</p>
              </div>
              <div className="tracking-map" style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                <MapContainer center={driverCoords || [activeTrackingOrder.delivery_lat, activeTrackingOrder.delivery_lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url={`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4u2t_1_6d36abd6af95022b69bfc947`} />
                  <Marker position={[activeTrackingOrder.delivery_lat, activeTrackingOrder.delivery_lng]} icon={customerIcon}><Popup>Your Location</Popup></Marker>
                  {driverCoords && (<><Marker position={driverCoords} icon={driverIcon}><Popup>Driver</Popup></Marker><Polyline positions={[driverCoords, [activeTrackingOrder.delivery_lat, activeTrackingOrder.delivery_lng]]} color="#10b981" dashArray="5, 10" /></>)}
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORDERS VIEW */}
      {activeTab === 'orders' && (
        <div className="orders-view">
          <div className="orders-header"><h2>Order History</h2><button className="btn btn-secondary btn-sm" onClick={refreshOrders}>🔄 Refresh</button></div>
          {orders.length === 0 ? (<div className="empty-state"><div className="empty-icon">📝</div><h3>No orders yet</h3><button className="browse-menu-btn" onClick={() => setActiveTab('menu')}>Browse Menu</button></div>) : (
            <div className="orders-list">{orders.map(order => { const paymentInfo = getPaymentStatusInfo(order.payment_status); const isExpanded = expandedOrder === order.id; const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0; return (<div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}><div className="order-header"><div className="order-info"><span className="order-id">#{order.order_number || order.id.slice(0, 8)}</span><span className="order-date">{new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div><div className="order-badges"><span className={`order-type-badge ${order.order_type || 'dine-in'}`}>{order.order_type === 'takeout' ? '📦 Takeout' : order.order_type === 'delivery' ? '🛵 Delivery' : '🍽️ Dine In'}</span><span className={`order-status ${order.status}`}>{order.status === 'pending' && '⏳ Pending'}{order.status === 'preparing' && '📦 Preparing'}{order.status === 'out_for_delivery' && '🛵 Out for Delivery'}{order.status === 'completed' && '✅ Completed'}{order.status === 'cancelled' && '❌ Cancelled'}</span></div></div><div className="order-summary-bar"><div className="summary-chips">{order.payment_method && (<span className={`payment-method-badge ${order.payment_method}`}>{order.payment_method === 'gcash' && '💙 GCash'}{order.payment_method === 'paymaya' && '💚 PayMaya'}</span>)}<span className={`payment-status-badge ${paymentInfo.className}`}>{paymentInfo.label}</span><span className="item-count-chip">🛍️ {itemCount} items</span></div><div className="summary-total"><span className="total-label">Total</span><span className="total-value">₱{Number(order.total_amount).toFixed(2)}</span></div></div><button className="toggle-details-btn" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}><InfoIcon /> {isExpanded ? 'Hide Details' : 'View Details'}</button>{isExpanded && (<div className="order-details-expanded"><div className="detail-block"><h4 className="detail-block-title"><ReceiptIcon /> Order Items</h4><div className="order-items-table"><div className="order-items-table-header"><span>Item</span><span>Qty</span><span>Price</span><span>Subtotal</span></div>{order.order_items?.map((item, idx) => (<div key={idx} className="order-items-table-row"><span className="item-name-cell">{item.menu_items?.name || 'Item'}</span><span className="item-qty-cell">×{item.quantity}</span><span className="item-price-cell">₱{Number(item.price_at_time).toFixed(2)}</span><span className="item-subtotal-cell">₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}</span></div>))}<div className="order-items-table-total"><span></span><span></span><span>Total</span><span>₱{Number(order.total_amount).toFixed(2)}</span></div></div></div><div className="detail-block"><h4 className="detail-block-title">💳 Order Information</h4><div className="detail-info-grid"><div className="detail-info-row"><span className="detail-info-label">Payment Method</span><span className="detail-info-value">{order.payment_method === 'gcash' && '💙 GCash'}{order.payment_method === 'paymaya' && '💚 PayMaya'}{!order.payment_method && '—'}</span></div><div className="detail-info-row"><span className="detail-info-label">Payment Status</span><span className={`payment-status-badge ${paymentInfo.className}`}>{paymentInfo.label}</span></div><div className="detail-info-row"><span className="detail-info-label">Order Type</span><span className="detail-info-value">{order.order_type === 'takeout' ? '📦 Takeout' : order.order_type === 'delivery' ? '🛵 Delivery' : '🍽️ Dine In'}</span></div>{order.order_type === 'delivery' && order.delivery_address && (<div className="detail-info-row"><span className="detail-info-label">Delivery Address</span><span className="detail-info-value" style={{ textAlign: 'right', maxWidth: '60%' }}>{order.delivery_address}</span></div>)}{order.customer_notes && (<div className="detail-info-row"><span className="detail-info-label">Notes</span><span className="detail-info-value" style={{ textAlign: 'right', maxWidth: '60%' }}>{order.customer_notes}</span></div>)}</div></div>{order.proof_image_url && (<div className="detail-block"><h4 className="detail-block-title">📸 Payment Proof</h4><div className="proof-thumbnail-container"><div className="proof-thumbnail" onClick={() => setViewingReceipt(order.proof_image_url)}><img src={order.proof_image_url} alt="Proof" /><div className="proof-thumbnail-overlay"><EyeIcon /><span>View</span></div></div></div></div>)}</div>)}</div>); })}</div>
          )}
        </div>
      )}

      {/* PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="profile-view">
          <div className="profile-container">
            <div className="profile-header"><div className="profile-avatar"><span className="avatar-icon">☕</span></div><div className="profile-title"><h2>My Profile</h2><p>Manage your account</p></div></div>
            {profileSuccess && <div className="profile-success"><span>✅</span>{profileSuccess}</div>}
            {profileError && <div className="profile-error"><span>❌</span>{profileError}</div>}
            <div className="profile-grid">
              <div className="profile-card">
                <div className="profile-card-header"><h3><span className="card-icon">📝</span> Profile</h3>{!isEditingProfile && <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}><EditIcon /> Edit</button>}</div>
                {isEditingProfile ? (<form onSubmit={handleProfileUpdate} className="profile-form"><div className="form-group"><label>Full Name</label><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></div><div className="form-group"><label>Email</label><input type="email" value={profile.email} disabled /></div> <div className="form-group">
  <label>Phone Number</label>
  <input
    type="tel"
    value={profile.phone}
    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
    placeholder="0917 XXX XXXX"
    maxLength={15}
  />
</div> <div className="profile-actions"><button type="button" className="btn-cancel" onClick={() => setIsEditingProfile(false)}>Cancel</button><button type="submit" className="btn-save" disabled={profileLoading}>{profileLoading ? 'Saving...' : <><SaveIcon /> Save</>}</button></div></form>) : (<div className="profile-display"><div className="profile-field"><span className="field-label">Name</span><span className="field-value">{profile.name}</span></div><div className="profile-field"><span className="field-label">Email</span><span className="field-value">{profile.email}</span></div><div className="profile-field">
  <span className="field-label">Phone</span>
  <span className="field-value">{profile.phone || '—'}</span>
</div><div className="profile-field"><span className="field-label">Role</span><span className="field-value role-badge">Customer</span></div></div>)}
              </div>
              <div className="profile-card">
                <div className="profile-card-header"><h3><span className="card-icon">🔒</span> Change Password</h3></div>
                <form onSubmit={handlePasswordUpdate} className="profile-form">
                  <div className="form-group"><label>Current Password</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required /></div>
                  <div className="form-group"><label>New Password</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength={6} /></div>
                  <div className="form-group"><label>Confirm</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required minLength={6} /></div>
                  <button type="submit" className="btn-save-password" disabled={profileLoading}>{profileLoading ? 'Updating...' : 'Update Password'}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} confirmText={confirmModal.confirmText} cancelText={confirmModal.cancelText} variant={confirmModal.variant} iconType={confirmModal.iconType} isLoading={confirmModal.isLoading} onConfirm={confirmModal.onConfirm} onCancel={closeConfirm} />
      <ReceiptViewerModal isOpen={!!viewingReceipt} imageUrl={viewingReceipt} onClose={() => setViewingReceipt(null)} />
    </div>
  );
}

export default CustomerDashboard;
