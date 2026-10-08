import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useMenuItems, useOrders } from '../hooks/useSupabase';
import './CustomerDashboard.css';

import logo from '../assets/logo.jpg';
import gcashQR from '../assets/gcash-qr.png';
import paymayaQR from '../assets/paymaya-qr.png';

// ============================================
// ICONS
// ============================================
const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
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

const CoffeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const ReceiptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <path d="M8 7h8"/>
    <path d="M8 11h8"/>
    <path d="M8 15h5"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const GCashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

const PayMayaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12h8"/>
    <path d="M12 8v8"/>
  </svg>
);

// ============================================
// HELPERS
// ============================================
const getPaymentStatusInfo = (status) => {
  switch (status) {
    case 'valid':
      return { label: '✅ Verified', className: 'valid' };
    case 'unverified':
      return { label: '⏳ Awaiting Verification', className: 'unverified' };
    case 'underpayment':
      return { label: '⚠️ Underpaid', className: 'underpayment' };
    case 'overpayment':
      return { label: '⚠️ Overpaid', className: 'overpayment' };
    default:
      return { label: '⏳ Unverified', className: 'unverified' };
  }
};

// ============================================
// CONFIRMATION MODAL
// ============================================
function ConfirmModal({ 
  isOpen, title, message, 
  confirmText = 'Yes, Confirm', cancelText = 'No, Cancel',
  onConfirm, onCancel, isLoading = false,
  variant = 'warning', iconType = 'warning'
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div 
        className={`confirm-modal-content confirm-modal-${variant}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-icon">
          {iconType === 'x-circle' ? <XCircleIcon /> : <WarningIcon />}
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

// ============================================
// RECEIPT VIEWER MODAL
// ============================================
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
  const [gcashProof, setGcashProof] = useState(null);
  const [gcashProofPreview, setGcashProofPreview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, text: '' });
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartNotification, setCartNotification] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  
  // Receipt viewer + expanded order
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
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

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '',
    confirmText: 'Yes, Confirm', cancelText: 'No, Cancel',
    onConfirm: null, variant: 'warning', iconType: 'warning', isLoading: false
  });

  const openConfirm = ({ 
    title, message, confirmText, cancelText, onConfirm, 
    variant = 'warning', iconType = 'warning'
  }) => {
    setConfirmModal({
      isOpen: true, title, message,
      confirmText: confirmText || 'Yes, Confirm',
      cancelText: cancelText || 'No, Cancel',
      onConfirm, variant, iconType, isLoading: false
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null, isLoading: false }));
  };
  
  const { items: menuItems, loading: menuLoading } = useMenuItems();
  const { orders, createOrder, refresh: refreshOrders } = useOrders(user?.id);

  // ============================================
  // FILE HANDLERS
  // ============================================
  const handleGcashProofSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      setGcashProof(file);
      const reader = new FileReader();
      reader.onloadend = () => setGcashProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // PAYMENT METHOD — WITH CONFIRMATION
  // ============================================
  const handlePaymentMethodChange = (method) => {
    if (method === paymentMethod) return;
    
    if (gcashProof) {
      openConfirm({
        title: 'Change Payment Method?',
        message: `You've already uploaded a proof of payment. Switching to ${method === 'gcash' ? 'GCash' : 'PayMaya'} will remove your current upload. Continue?`,
        confirmText: 'Yes, Switch',
        cancelText: 'No, Keep Current',
        variant: 'warning',
        onConfirm: () => {
          closeConfirm();
          setPaymentMethod(method);
          setGcashProof(null);
          setGcashProofPreview(null);
          const fileInput = document.getElementById('gcash-proof-input');
          if (fileInput) fileInput.value = '';
        }
      });
    } else {
      setPaymentMethod(method);
    }
  };

  // ============================================
  // DOWNLOAD QR
  // ============================================
  const downloadQR = async () => {
    const qrSrc = paymentMethod === 'gcash' ? gcashQR : paymayaQR;
    const fileName = `1of1-coffee-${paymentMethod}-qr.png`;

    try {
      const response = await fetch(qrSrc);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setCartNotification(`QR code downloaded!`);
      setTimeout(() => setCartNotification(null), 3000);
    } catch (error) {
      alert('Failed to download QR code. Please try long-pressing the image instead.');
    }
  };

  // ============================================
  // CART OPERATIONS
  // ============================================

  // Add to cart — WITH confirmation
  const addToCart = (item) => {
    setError(null);
    const existing = cart.find(cartItem => cartItem.id === item.id);
    
    openConfirm({
      title: 'Add to Cart?',
      message: `Add "${item.name}" (₱${item.price}) to your cart?`,
      confirmText: 'Yes, Add to Cart',
      cancelText: 'No, Cancel',
      variant: 'warning',
      onConfirm: () => {
        closeConfirm();
        if (existing) {
          setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
          setCartNotification(`Added another ${item.name} to cart`);
        } else {
          setCart([...cart, { ...item, qty: 1 }]);
          setCartNotification(`${item.name} added to cart`);
        }
        setTimeout(() => setCartNotification(null), 2500);
      }
    });
  };

  // ============================================
  // INCREASE QUANTITY — instant, NO confirmation
  // ============================================
  const increaseQty = (id) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    setCart(cart.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c));
    setCartNotification(`Added another ${item.name}`);
    setTimeout(() => setCartNotification(null), 2000);
  };

  // ============================================
  // DECREASE QUANTITY — instant when qty > 1, confirm when qty = 1
  // ============================================
  const decreaseQty = (id) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    // When qty is 1, decreasing removes the item — keep confirmation
    if (item.qty === 1) {
      openConfirm({
        title: 'Remove Item?',
        message: `This will remove "${item.name}" from your cart entirely. Continue?`,
        confirmText: 'Yes, Remove',
        cancelText: 'No, Keep',
        variant: 'danger',
        iconType: 'x-circle',
        onConfirm: () => {
          closeConfirm();
          setCart(cart.filter(cartItem => cartItem.id !== id));
          setCartNotification(`Removed ${item.name} from cart`);
          setTimeout(() => setCartNotification(null), 2500);
        }
      });
      return;
    }

    // Normal decrease — no confirmation
    setCart(cart.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c));
    setCartNotification(`Reduced ${item.name} quantity`);
    setTimeout(() => setCartNotification(null), 2000);
  };

  // Remove from cart — WITH confirmation
  const removeFromCart = (id) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    openConfirm({
      title: 'Remove Item from Cart?',
      message: `Are you sure you want to remove "${item.name}" from your cart?`,
      confirmText: 'Yes, Remove',
      cancelText: 'No, Keep',
      variant: 'danger',
      iconType: 'x-circle',
      onConfirm: () => {
        closeConfirm();
        setError(null);
        setCart(cart.filter(cartItem => cartItem.id !== id));
        setCartNotification(`Removed ${item.name} from cart`);
        setTimeout(() => setCartNotification(null), 2500);
      }
    });
  };

  // Clear cart — WITH confirmation
  const clearCart = () => {
    openConfirm({
      title: 'Clear Entire Cart?',
      message: `Are you sure you want to remove all ${cartItemCount} item(s) from your cart? This action cannot be undone.`,
      confirmText: 'Yes, Clear All',
      cancelText: 'No, Keep Items',
      variant: 'danger',
      onConfirm: () => {
        closeConfirm();
        setCart([]);
        setCartNotification('Cart cleared');
        setTimeout(() => setCartNotification(null), 2500);
      }
    });
  };

  // ============================================
  // CANCEL ORDER — WITH CONFIRMATION
  // ============================================
  const cancelOrder = (order) => {
    openConfirm({
      title: 'Cancel Order?',
      message: `Are you sure you want to cancel order #${order.order_number || order.id.slice(0, 8)}? This action cannot be undone and the order will be permanently cancelled.`,
      confirmText: 'Yes, Cancel Order',
      cancelText: 'No, Keep Order',
      variant: 'danger',
      onConfirm: async () => {
        setCancellingOrder(order.id);
        closeConfirm();
        try {
          const { error: cancelError } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order.id);

          if (cancelError) throw cancelError;
          await refreshOrders();
          alert('✅ Order cancelled successfully!');
        } catch (err) {
          alert('❌ Failed to cancel order: ' + err.message);
        } finally {
          setCancellingOrder(null);
        }
      }
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.qty, 0);

  // ============================================
  // UPLOAD PROOF
  // ============================================
  const uploadProofImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `proofs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error('Failed to upload proof image: ' + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      throw error;
    }
  };

  // ============================================
  // CHECKOUT — WITH CONFIRMATION
  // ============================================
  const handleCheckout = () => {
    if (!gcashProof) {
      alert(`Please upload your ${paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'} payment proof to proceed.`);
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const itemSummary = cart
      .map(item => `• ${item.qty}x ${item.name} — ₱${(item.price * item.qty).toFixed(2)}`)
      .join('\n');

    openConfirm({
      title: 'Place Order?',
      message: `You are about to place an order:\n\n${itemSummary}\n\nOrder Type: ${orderType === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}\nPayment: ${paymentMethod === 'gcash' ? '💙 GCash' : '💚 PayMaya'}\nTotal: ₱${cartTotal.toFixed(2)}\n\nMake sure you've paid the exact amount and uploaded your receipt. This action cannot be undone.`,
      confirmText: 'Yes, Place Order',
      cancelText: 'No, Review Again',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        setError(null);
        setOrderLoading(true);

        try {
          let proofImageUrl = null;
          try {
            proofImageUrl = await uploadProofImage(gcashProof);
          } catch (uploadError) {
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
            alert('Failed to upload payment proof. Please try again.');
            setOrderLoading(false);
            return;
          }

          const orderData = {
            customer_id: user.id,
            status: 'pending',
            payment_status: 'unverified',
            payment_method: paymentMethod,
            total_amount: cartTotal,
            order_type: orderType,
            proof_image_url: proofImageUrl
          };

          let newOrder;
          try {
            newOrder = await createOrder(orderData);
          } catch (orderError) {
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
            alert('Failed to create order: ' + (orderError.message || 'Please try again.'));
            setOrderLoading(false);
            return;
          }

          const orderItems = cart.map(item => ({
            order_id: newOrder.id,
            menu_item_id: item.id,
            quantity: item.qty,
            price_at_time: item.price
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
            alert('Failed to save order items. Please contact support.');
            setOrderLoading(false);
            return;
          }

          setCart([]);
          setGcashProof(null);
          setGcashProofPreview(null);
          await refreshOrders();
          setActiveTab('orders');
          
          closeConfirm();
          alert(`✅ Order placed successfully!\nOrder #: ${newOrder.order_number || newOrder.id.slice(0, 8)}`);
        } catch (error) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          setError(error.message || 'Failed to place order. Please try again.');
          alert('❌ Failed to place order: ' + (error.message || 'Please try again.'));
        } finally {
          setOrderLoading(false);
        }
      }
    });
  };

  // ============================================
  // SUBMIT REVIEW — WITH CONFIRMATION
  // ============================================
  const submitReview = (orderId) => {
    if (!reviewForm.text.trim()) {
      alert("Please write a recommendation/review.");
      return;
    }

    openConfirm({
      title: 'Submit Review?',
      message: `Are you sure you want to submit this ${reviewForm.rating}-star review?\n\n"${reviewForm.text}"\n\nThis will be visible on the owner's dashboard.`,
      confirmText: 'Yes, Submit Review',
      cancelText: 'No, Edit First',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
          const { error } = await supabase
            .from('reviews')
            .insert([{
              order_id: orderId,
              customer_id: user.id,
              rating: reviewForm.rating,
              text: reviewForm.text
            }]);

          if (error) throw error;

          setReviewForm({ orderId: null, rating: 5, text: '' });
          await refreshOrders();
          
          closeConfirm();
          alert('✅ Review submitted successfully!');
        } catch (error) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          alert('❌ Failed to submit review: ' + error.message);
        }
      }
    });
  };

  // ============================================
  // PROFILE — WITH CONFIRMATION
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

  if (menuLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading our coffee menu...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="customer-dashboard">
      {cartNotification && (
        <div className="cart-notification">
          <span className="notification-icon">✅</span>
          {cartNotification}
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="brand-logo">
            <img src={logo} alt="1of1 Coffee" className="brand-logo-image" />
            <div className="brand-text">
              <h1>1of1 Coffee</h1>
              <span className="brand-subtitle">Bombshelter Ordering</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.name || 'Guest'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOutIcon /> Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <CoffeeIcon />
          <span>Menu</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          <ShoppingCartIcon />
          <span>Cart</span>
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </button>
        <button 
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <OrdersIcon />
          <span>Orders</span>
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

      {error && (
        <div className="error-banner">
          <span className="error-icon">❌</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* ============================================
          MENU VIEW
          ============================================ */}
      {activeTab === 'menu' && (
        <div className="menu-view">
          <div className="menu-header-section">
            <h2>Our Menu</h2>
            <p className="menu-subtitle">Handcrafted with love, brewed to perfection</p>
          </div>
          <div className="menu-grid">
            {menuItems.map(item => (
              <div key={item.id} className="menu-item-card">
                <div className="item-image-wrapper">
                  <img src={item.image_url} alt={item.name} className="item-image" />
                  <div className="item-category">{item.type}</div>
                </div>
                <div className="item-content">
                  <div className="item-header">
                    <h3 className="item-title">{item.name}</h3>
                    <p className="item-price">₱{item.price}</p>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <button className="add-to-cart-btn" onClick={() => addToCart(item)}>
                    <ShoppingCartIcon /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          CART VIEW
          ============================================ */}
      {activeTab === 'cart' && (
        <div className="cart-view">
          <div className="cart-container">
            <div className="cart-items-section">
              <div className="cart-section-header">
                <h2>Your Order</h2>
                {cart.length > 0 && (
                  <button className="clear-cart-btn" onClick={clearCart}>
                    <TrashIcon /> Clear All
                  </button>
                )}
              </div>
              {cart.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">☕</div>
                  <h3>Your cart is empty</h3>
                  <p>Browse our coffee menu and add your favorites!</p>
                  <button className="browse-menu-btn" onClick={() => setActiveTab('menu')}>
                    Browse Menu
                  </button>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <img src={item.image_url} alt={item.name} className="cart-item-img" />
                        <div className="cart-item-details">
                          <h3>{item.name}</h3>
                          <p className="cart-item-price">₱{item.price} each</p>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="qty-controls">
                          <button 
                            className="qty-btn qty-btn-minus"
                            onClick={() => decreaseQty(item.id)}
                            title="Decrease quantity"
                          >
                            <MinusIcon />
                          </button>
                          <span className="qty-value">{item.qty}</span>
                          <button 
                            className="qty-btn qty-btn-plus"
                            onClick={() => increaseQty(item.id)}
                            title="Increase quantity"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                        <span className="cart-item-total">₱{(item.price * item.qty).toFixed(2)}</span>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="checkout-panel">
                <h2>Order Summary</h2>
                
                <div className="order-type-selector">
                  <label>Order Type</label>
                  <div className="order-type-options">
                    <button 
                      className={`order-type-btn ${orderType === 'dine-in' ? 'active' : ''}`}
                      onClick={() => setOrderType('dine-in')}
                    >
                      🍽️ Dine In
                    </button>
                    <button 
                      className={`order-type-btn ${orderType === 'takeout' ? 'active' : ''}`}
                      onClick={() => setOrderType('takeout')}
                    >
                      📦 Takeout
                    </button>
                  </div>
                </div>

                <div className="payment-method-selector">
                  <label>Payment Method</label>
                  <div className="payment-method-options">
                    <button 
                      className={`payment-method-btn gcash ${paymentMethod === 'gcash' ? 'active' : ''}`}
                      onClick={() => handlePaymentMethodChange('gcash')}
                    >
                      <GCashIcon />
                      <span>GCash</span>
                    </button>
                    <button 
                      className={`payment-method-btn paymaya ${paymentMethod === 'paymaya' ? 'active' : ''}`}
                      onClick={() => handlePaymentMethodChange('paymaya')}
                    >
                      <PayMayaIcon />
                      <span>PayMaya</span>
                    </button>
                  </div>
                </div>

                <div className="payment-section">
                  <h3 className="payment-section-title">
                    Pay via {paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'}
                  </h3>

                  <div className="payment-step">
                    <div className="step-header">
                      <span className="step-badge">Step 1</span>
                      <span className="step-title">Scan the QR code to pay</span>
                    </div>
                    <div className="qr-code-container">
                      <img 
                        src={paymentMethod === 'gcash' ? gcashQR : paymayaQR} 
                        alt={`${paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'} QR Code`}
                        className="qr-code-image"
                      />
                      <div className="qr-amount-badge">
                        Total: ₱{cartTotal}
                      </div>
                    </div>

                    <button 
                      type="button"
                      className="download-qr-btn"
                      onClick={downloadQR}
                    >
                      <DownloadIcon />
                      <span>Download QR Code</span>
                    </button>

                    <p className="step-hint">
                      Open your {paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'} app → <strong>Scan QR</strong> → Pay <strong>₱{cartTotal}</strong>
                    </p>
                  </div>

                  <div className="payment-step">
                    <div className="step-header">
                      <span className="step-badge">Step 2</span>
                      <span className="step-title">Upload your receipt / proof of payment</span>
                    </div>
                    <div className="gcash-upload">
                      {gcashProofPreview ? (
                        <div className="proof-preview">
                          <img src={gcashProofPreview} alt="Payment proof" />
                          <button 
                            type="button"
                            className="remove-proof-btn"
                            onClick={() => {
                              setGcashProof(null);
                              setGcashProofPreview(null);
                              const fileInput = document.getElementById('gcash-proof-input');
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload-wrapper">
                          <input 
                            id="gcash-proof-input"
                            type="file" 
                            accept="image/*" 
                            className="file-input"
                            onChange={handleGcashProofSelect}
                          />
                          <div className="file-upload-label">
                            <UploadIcon />
                            <span>Click to upload screenshot</span>
                            <span className="upload-hint">JPG, PNG, WEBP (Max 5MB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="checkout-summary">
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>₱{cartTotal}</span>
                  </div>
                  <div className="checkout-total">
                    <span>Total</span>
                    <span>₱{cartTotal}</span>
                  </div>
                </div>

                <button 
                  className={`checkout-btn ${!gcashProof ? 'disabled' : ''}`}
                  disabled={cart.length === 0 || !gcashProof || orderLoading}
                  onClick={handleCheckout}
                >
                  {orderLoading ? (
                    <span className="btn-loading">
                      <span className="btn-spinner"></span>
                      Processing...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </button>

                {!gcashProof && (
                  <p className="checkout-hint">
                    ⓘ Please scan the QR code and upload your proof of payment to enable checkout.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================
          ORDERS VIEW
          ============================================ */}
      {activeTab === 'orders' && (
        <div className="orders-view">
          <div className="orders-header">
            <h2>Order History</h2>
            <span className="order-count">{orders.length} orders</span>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No orders yet</h3>
              <p>Start ordering your favorite coffee!</p>
              <button className="browse-menu-btn" onClick={() => setActiveTab('menu')}>
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => {
                const paymentInfo = getPaymentStatusInfo(order.payment_status);
                const isExpanded = expandedOrder === order.id;
                const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                return (
                  <div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="order-header">
                      <div className="order-info">
                        <span className="order-id">#{order.order_number || order.id.slice(0, 8)}</span>
                        <span className="order-date">
                          {new Date(order.created_at).toLocaleDateString('en-PH', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="order-badges">
                        <span className={`order-type-badge ${order.order_type || 'dine-in'}`}>
                          {order.order_type === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}
                        </span>
                        <span className={`order-status ${order.status}`}>
                          {order.status === 'pending' && '⏳ Pending'}
                          {order.status === 'preparing' && '📦 Preparing'}
                          {order.status === 'processing' && '🔄 Processing'}
                          {order.status === 'completed' && '✅ Completed'}
                          {order.status === 'cancelled' && '❌ Cancelled'}
                          {order.status === 'declined' && '🚫 Declined'}
                        </span>
                      </div>
                    </div>

                    <div className="order-summary-bar">
                      <div className="summary-chips">
                        {order.payment_method && (
                          <span className={`payment-method-badge ${order.payment_method}`}>
                            {order.payment_method === 'gcash' ? '💙 GCash' : '💚 PayMaya'}
                          </span>
                        )}
                        <span className={`payment-status-badge ${paymentInfo.className}`}>
                          {paymentInfo.label}
                        </span>
                        <span className="item-count-chip">
                          🛍️ {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="summary-total">
                        <span className="total-label">Total</span>
                        <span className="total-value">₱{Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    <button 
                      className="toggle-details-btn"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <InfoIcon />
                      {isExpanded ? 'Hide Details' : 'View Full Details'}
                    </button>

                    {isExpanded && (
                      <div className="order-details-expanded">
                        <div className="detail-block">
                          <h4 className="detail-block-title">
                            <ReceiptIcon /> Order Items
                          </h4>
                          <div className="order-items-table">
                            <div className="order-items-table-header">
                              <span>Item</span>
                              <span>Qty</span>
                              <span>Price</span>
                              <span>Subtotal</span>
                            </div>
                            {order.order_items?.map((item, idx) => (
                              <div key={idx} className="order-items-table-row">
                                <span className="item-name-cell">{item.menu_items?.name || 'Item'}</span>
                                <span className="item-qty-cell">×{item.quantity}</span>
                                <span className="item-price-cell">₱{Number(item.price_at_time).toFixed(2)}</span>
                                <span className="item-subtotal-cell">
                                  ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            <div className="order-items-table-total">
                              <span></span>
                              <span></span>
                              <span>Total</span>
                              <span>₱{Number(order.total_amount).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="detail-block">
                          <h4 className="detail-block-title">💳 Payment Information</h4>
                          <div className="detail-info-grid">
                            <div className="detail-info-row">
                              <span className="detail-info-label">Payment Method</span>
                              <span className="detail-info-value">
                                {order.payment_method === 'gcash' && '💙 GCash'}
                                {order.payment_method === 'paymaya' && '💚 PayMaya'}
                                {!order.payment_method && '—'}
                              </span>
                            </div>
                            <div className="detail-info-row">
                              <span className="detail-info-label">Payment Status</span>
                              <span className={`payment-status-badge ${paymentInfo.className}`}>
                                {paymentInfo.label}
                              </span>
                            </div>
                            <div className="detail-info-row">
                              <span className="detail-info-label">Order Type</span>
                              <span className="detail-info-value">
                                {order.order_type === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}
                              </span>
                            </div>
                            <div className="detail-info-row">
                              <span className="detail-info-label">Order Number</span>
                              <span className="detail-info-value mono">
                                {order.order_number || order.id}
                              </span>
                            </div>
                            <div className="detail-info-row">
                              <span className="detail-info-label">Placed On</span>
                              <span className="detail-info-value">
                                {new Date(order.created_at).toLocaleString('en-PH', {
                                  year: 'numeric', month: 'long', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {order.proof_image_url && (
                          <div className="detail-block">
                            <h4 className="detail-block-title">📸 Payment Proof</h4>
                            <div className="proof-thumbnail-container">
                              <div 
                                className="proof-thumbnail"
                                onClick={() => setViewingReceipt(order.proof_image_url)}
                              >
                                <img src={order.proof_image_url} alt="Payment proof thumbnail" />
                                <div className="proof-thumbnail-overlay">
                                  <EyeIcon />
                                  <span>View</span>
                                </div>
                              </div>
                              <p className="proof-thumbnail-hint">Click to view full size</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {order.status === 'pending' && (
                      <button 
                        className="cancel-order-btn"
                        onClick={() => cancelOrder(order)}
                        disabled={cancellingOrder === order.id}
                      >
                        {cancellingOrder === order.id ? '⏳ Cancelling...' : '❌ Cancel Order'}
                      </button>
                    )}

                    {!order.reviews && reviewForm.orderId !== order.id && order.status === 'completed' && (
                      <button 
                        className="write-review-btn"
                        onClick={() => setReviewForm({ orderId: order.id, rating: 5, text: '' })}
                      >
                        ✍️ Write a Review
                      </button>
                    )}
                    
                    {!order.reviews && reviewForm.orderId === order.id && (
                      <div className="review-section">
                        <h4>Rate Your Experience</h4>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`star ${star <= reviewForm.rating ? 'active' : ''}`}
                              onClick={() => setReviewForm({...reviewForm, rating: star})}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <textarea 
                          className="review-input"
                          placeholder="Would you recommend this coffee? Share your thoughts..."
                          maxLength={300}
                          value={reviewForm.text}
                          onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                        />
                        <div className="review-char-count">{reviewForm.text.length} / 300</div>
                        <div className="review-actions">
                          <button className="submit-review-btn" onClick={() => submitReview(order.id)}>
                            Submit Review
                          </button>
                          <button 
                            className="cancel-review-btn"
                            onClick={() => setReviewForm({orderId: null, rating: 5, text: ''})}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {order.reviews && (
                      <div className="review-display">
                        <div className="review-stars">
                          {'★'.repeat(order.reviews.rating)}{'☆'.repeat(5 - order.reviews.rating)}
                        </div>
                        <p className="review-text">"{order.reviews.text}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================
          PROFILE VIEW
          ============================================ */}
      {activeTab === 'profile' && (
        <div className="profile-view">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                <span className="avatar-icon">☕</span>
              </div>
              <div className="profile-title">
                <h2>My Profile</h2>
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
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={profile.email} disabled className="disabled-input" />
                      <span className="input-hint">Email cannot be changed</span>
                    </div>
                    <div className="profile-actions">
                      <button 
                        type="button"
                        className="btn-cancel"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfile({...profile, name: user?.name || ''});
                        }}
                      >
                        Cancel
                      </button>
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
                      <span className="field-value role-badge">Customer</span>
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
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
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

      {/* ============================================
          CONFIRMATION MODAL
          ============================================ */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        iconType={confirmModal.iconType}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* ============================================
          RECEIPT VIEWER MODAL
          ============================================ */}
      <ReceiptViewerModal
        isOpen={!!viewingReceipt}
        imageUrl={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
      />
    </div>
  );
}

export default CustomerDashboard;
