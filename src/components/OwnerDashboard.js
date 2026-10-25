// src/components/OwnerDashboard.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  useMenuItems,
  useOrders,
  useEmployees,
  useCustomers,
  useCategories,
  useReviewsWithProducts
} from '../hooks/useSupabase';
import {
  initStorage,
  uploadImage as uploadImageUtil,
  deleteImage as deleteImageUtil,
  testDirectBucketAccess
} from '../utils/storage';
import './OwnerDashboard.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import logo from '../assets/logo.jpg';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});



// ============================================
// ICONS
// ============================================
const LogOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const ChartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>);
const StarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const TrendingUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const TrendingDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const UserPlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const CustomersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const OrdersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const TagIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);
const WarningIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const ReceiptIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>);
const MapIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>);

// ============================================
// HELPERS
// ============================================
const getPaymentStatusInfo = (status) => {
  switch (status) {
    case 'confirmed': return { label: '✅ Confirmed', className: 'confirmed' };
    case 'rejected': return { label: '❌ Rejected', className: 'rejected' };
    case 'unverified':
    default: return { label: '⏳ Unverified', className: 'unverified' };
  }
};
const getStatusBadge = (status) => {
  const statusMap = { pending: 'badge-warning', preparing: 'badge-info', processing: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger', declined: 'badge-danger' };
  return statusMap[status] || 'badge-secondary';
};

// ============================================
// CONFIRMATION & SUCCESS MODALS
// ============================================
function ConfirmModal({ isOpen, title, message, confirmText = 'Yes, Confirm', cancelText = 'No, Cancel', onConfirm, onCancel, isLoading = false, variant = 'warning' }) {
  if (!isOpen) return null;
  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className={`confirm-modal-content confirm-modal-${variant}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon"><WarningIcon /></div>
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
function SuccessModal({ isOpen, title, message, email, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <h3 className="success-modal-title">{title}</h3>
        <p className="success-modal-message">{message}{email && (<><br /><span className="success-modal-email">{email}</span></>)}</p>
        <div className="success-modal-actions"><button className="success-modal-btn" onClick={onClose}>Got it</button></div>
      </div>
    </div>
  );
}

// ============================================
// LIVE MAP COMPONENT
// ============================================
function OwnerLiveMap() {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const fetchActive = async () => {
    const { data } = await supabase.from('orders').select(`*, customer:users!orders_customer_id_fkey(name)`).eq('status', 'out_for_delivery').not('driver_current_lat', 'is', null);
    setActiveDeliveries(data || []);
  };
  useEffect(() => {
    fetchActive();
    const sub = supabase.channel('admin-live-map').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchActive).subscribe();
    return () => sub.unsubscribe();
  }, []);
  return (
    <div style={{ height: 'calc(100vh - 220px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
      <MapContainer center={[14.5995, 120.9842]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4u2t_1_6d36abd6af95022b69bfc947`} />
        {activeDeliveries.map(order => (
          <Marker key={order.id} position={[order.driver_current_lat, order.driver_current_lng]} icon={driverIcon}>
            <Popup>
              <strong>{order.customer?.name || 'Customer'}</strong><br />
              Delivering to: {order.delivery_address}<br />
              Last ping: {new Date(order.driver_last_ping).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
function OwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadForm, setUploadForm] = useState({ name: '', category_id: '', price: '', description: '', is_available: true });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category_id: '', price: '', description: '', is_available: true });
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ email: '', password: '', name: '', role: 'employee' });
  const [employeeError, setEmployeeError] = useState('');
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [staffTab, setStaffTab] = useState('employee');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [employeeSuccessModal, setEmployeeSuccessModal] = useState({ isOpen: false, email: '', name: '' });
  const [orderStatus, setOrderStatus] = useState('all');
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ slug: '', name: '', icon: '📦', color: '#ff6b35', display_order: 50 });
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: 'Yes', cancelText: 'No', onConfirm: null, variant: 'warning', isLoading: false });
  const [bucketExists, setBucketExists] = useState(false);
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const openConfirm = ({ title, message, confirmText, cancelText, onConfirm, variant = 'warning' }) => { setConfirmModal({ isOpen: true, title, message, confirmText: confirmText || 'Yes', cancelText: cancelText || 'No', onConfirm, variant, isLoading: false }); };
  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null, isLoading: false }));

  const { items: menuItems, addMenuItem, updateMenuItem, deleteMenuItem, refetch: refetchMenuItems } = useMenuItems();
  const { categories, addCategory, deleteCategory, refetch: refetchCategories } = useCategories();
  const { orders, updatePaymentStatus, refresh: refetchOrders } = useOrders();
  const { reviews, refetch: refetchReviews } = useReviewsWithProducts();
  const { customers, loading: loadingCustomers, error: customersError, deleteCustomer, refetch: fetchCustomers } = useCustomers();

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const { data, error } = await supabase.from('users').select('*').in('role', ['employee', 'driver']).order('created_at', { ascending: false });
      if (error) throw error;
      setStaffList(data || []);
    } catch (err) { console.error(err); } finally { setLoadingStaff(false); }
  };

  useEffect(() => {
    const checkStorage = async () => {
      try {
        setStorageInitialized(false); setStorageError(null);
        const initialized = await initStorage();
        if (initialized) { const accessible = await testDirectBucketAccess(); setBucketExists(accessible); if (!accessible) setStorageError('Storage bucket is not accessible.'); }
        else { setBucketExists(false); setStorageError('Storage bucket "product-images" not found.'); }
        setStorageInitialized(true);
      } catch (error) { setStorageError(error.message || 'Failed to initialize storage'); setStorageInitialized(true); setBucketExists(false); }
    };
    checkStorage();
  }, []);

  const menuCounts = React.useMemo(() => {
    const counts = { all: menuItems.length };
    categories.forEach(cat => { counts[cat.slug] = menuItems.filter(i => i.category_id === cat.id).length; });
    return counts;
  }, [menuItems, categories]);

  const visibleCategories = React.useMemo(() => menuCategoryFilter === 'all' ? categories : categories.filter(c => c.slug === menuCategoryFilter), [categories, menuCategoryFilter]);

  // Handlers (all standard ones - unchanged)
  const handleCreateEmployee = (e) => { /* same as before - see your existing code */ };
  const handleDeleteEmployee = (id, name) => { /* same */ };
  const handleChangeRole = (id, role) => { /* same */ };
  const handleImageSelect = (e) => { /* same */ };
  const handleEditImageSelect = (e) => { /* same */ };
  const uploadImage = async (file) => uploadImageUtil(file);
  const deleteImage = async (url) => deleteImageUtil(url);
  const handleUploadProduct = (e) => { /* same */ };
  const handleEditProduct = (product) => { /* same */ };
  const handleUpdateProduct = (e) => { /* same */ };
  const handleDeleteProduct = (product) => { /* same */ };
  const handleAddCategory = (e) => { /* same */ };
  const handleDeleteCategory = (cat) => { /* same */ };
  const updateOrderStatus = (orderId, newStatus) => { /* same */ };
  const handleProcessOrder = (order) => setReviewingOrder(order);
  const handleUpdatePaymentStatus = (orderId, newStatus) => { /* same */ };
  const handleDeleteCustomer = (customer) => { /* same */ };
  const filteredCustomers = customers.filter(c => { if (!customerSearch.trim()) return true; const q = customerSearch.toLowerCase(); return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q); });
  const customerStats = { total: customers.length, withOrders: customers.filter(c => c.total_orders > 0).length, totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) };
  const handleLogout = () => { openConfirm({ title: 'Log Out?', message: 'Are you sure?', confirmText: 'Yes', cancelText: 'No', variant: 'warning', onConfirm: () => { closeConfirm(); onLogout(); } }); };
  const handleProfileUpdate = (e) => { /* same */ };
  const handlePasswordUpdate = (e) => { /* same */ };
  const filteredOrders = orders.filter(order => { if (orderStatus === 'all') return true; if (orderStatus === 'preparing') return order.status === 'preparing' || order.status === 'processing'; return order.status === orderStatus; });
  const metrics = (() => {
    const completed = orders.filter(o => o.status === 'completed');
    const today = new Date(); const thisMonth = today.getMonth(); const thisYear = today.getFullYear();
    return {
      daily: completed.filter(o => new Date(o.created_at).toDateString() === today.toDateString()).reduce((s, o) => s + Number(o.total_amount), 0),
      monthly: completed.filter(o => { const d = new Date(o.created_at); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, o) => s + Number(o.total_amount), 0),
      yearly: completed.filter(o => new Date(o.created_at).getFullYear() === thisYear).reduce((s, o) => s + Number(o.total_amount), 0)
    };
  })();
  const analytics = (() => {
    const sales = {};
    orders.filter(o => o.status === 'completed').forEach(o => o.order_items?.forEach(i => { const n = i.menu_items?.name || 'Unknown'; if (!sales[n]) sales[n] = { name: n, category: i.menu_items?.type || 'Unknown', sales: 0 }; sales[n].sales += i.quantity; }));
    const sorted = Object.values(sales).sort((a, b) => b.sales - a.sales);
    return { best: sorted.slice(0, 3), worst: sorted.slice(-3).reverse() };
  })();
  const chartData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({ day, amount: 0 }));
    orders.filter(o => o.status === 'completed').forEach(o => { const idx = new Date(o.created_at).getDay(); data[idx === 0 ? 6 : idx - 1].amount += Number(o.total_amount); });
    return data;
  })();
  const maxChartValue = Math.max(...chartData.map(d => d.amount), 1);
  const renderTrend = (val) => val > 0 ? <span className="metric-trend trend-up"><TrendingUpIcon /> +{val}%</span> : <span className="metric-trend trend-down"><TrendingDownIcon /> {val}%</span>;

  return (
    <div className="owner-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="brand-logo">
            <img src={logo} alt="1of1 Coffee" className="brand-logo-image" />
            <div className="brand-text"><h1>1of1 Coffee</h1><span className="brand-subtitle">Owner Dashboard</span></div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info"><span className="user-avatar">👤</span><span className="user-name">{user?.name || 'Owner'}</span></div>
          <button onClick={handleLogout} className="logout-btn"><LogOutIcon /> Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><OrdersIcon /><span>Orders</span>{orders.filter(o => o.status === 'pending').length > 0 && <span className="nav-badge">{orders.filter(o => o.status === 'pending').length}</span>}</button>
        <button className={`nav-tab ${activeTab === 'livemap' ? 'active' : ''}`} onClick={() => setActiveTab('livemap')}><MapIcon /><span>Live Map</span></button>
        <button className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}><MenuIcon /><span>Menu</span></button>
        <button className={`nav-tab ${activeTab === 'add-product' ? 'active' : ''}`} onClick={() => setActiveTab('add-product')}><UploadIcon /><span>Add Product</span></button>
        <button className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}><TagIcon /><span>Categories</span></button>
        <button className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><ChartIcon /><span>Analytics</span></button>
        <button className={`nav-tab ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => { setActiveTab('feedback'); refetchReviews(); }}><StarIcon /><span>Reviews</span>{reviews.length > 0 && <span className="nav-badge">{reviews.length}</span>}</button>
        <button className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => { setActiveTab('employees'); fetchStaff(); }}><UsersIcon /><span>Staff</span></button>
        <button className={`nav-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => { setActiveTab('customers'); fetchCustomers(); }}><CustomersIcon /><span>Customers</span></button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setProfileError(''); setProfileSuccess(''); }}><UserIcon /><span>Profile</span></button>
      </nav>

      {storageInitialized && !bucketExists && <div className="storage-warning"><strong>⚠️ Storage bucket "product-images" not found.</strong></div>}

      {/* LIVE MAP TAB */}
      {activeTab === 'livemap' && (
        <div className="orders-section" style={{ padding: '1.5rem 2rem' }}>
          <div style={{ marginBottom: '1rem' }}><h2>Live Driver Tracking</h2><p style={{ color: '#94a3b8' }}>Monitor active deliveries in real time.</p></div>
          <OwnerLiveMap />
        </div>
      )}

      {/* ORDERS TAB (with Customer Notes added) */}
      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="metrics-grid">
            <div className="metric-card"><div className="metric-icon">📋</div><div><span className="metric-title">Total Orders</span><span className="metric-value">{orders.length}</span></div></div>
            <div className="metric-card"><div className="metric-icon">⏳</div><div><span className="metric-title">Pending</span><span className="metric-value">{orders.filter(o => o.status === 'pending').length}</span></div></div>
            <div className="metric-card"><div className="metric-icon">🔄</div><div><span className="metric-title">Preparing</span><span className="metric-value">{orders.filter(o => o.status === 'preparing' || o.status === 'processing').length}</span></div></div>
            <div className="metric-card"><div className="metric-icon">✅</div><div><span className="metric-title">Completed</span><span className="metric-value">{orders.filter(o => o.status === 'completed').length}</span></div></div>
            <div className="metric-card highlight"><div className="metric-icon">💰</div><div><span className="metric-title">Revenue</span><span className="metric-value">₱{orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_amount), 0).toLocaleString()}</span></div></div>
          </div>

          <section className="owner-best-sellers">
            <div className="owner-best-sellers-heading"><div><span>SALES HIGHLIGHTS</span><h2>🏆 Top Best Sellers</h2></div><button type="button" className="owner-best-sellers-link" onClick={() => setActiveTab('analytics')}>View Analytics →</button></div>
            {analytics.best.length === 0 ? <div className="owner-best-sellers-empty">No sales yet.</div> : <div className="owner-best-sellers-grid">{analytics.best.map((p, i) => <article className="owner-best-seller-card" key={i}><span className="owner-best-seller-rank">#{i + 1}</span><div className="owner-best-seller-info"><h3>{p.name}</h3><p>{p.category}</p></div><strong>{p.sales} sold</strong></article>)}</div>}
          </section>

          <div className="orders-toolbar">
            <div className="filter-group">
              <button className={`filter-btn ${orderStatus === 'all' ? 'active' : ''}`} onClick={() => setOrderStatus('all')}>All</button>
              <button className={`filter-btn ${orderStatus === 'pending' ? 'active' : ''}`} onClick={() => setOrderStatus('pending')}>Pending</button>
              <button className={`filter-btn ${orderStatus === 'preparing' ? 'active' : ''}`} onClick={() => setOrderStatus('preparing')}>Preparing</button>
              <button className={`filter-btn ${orderStatus === 'completed' ? 'active' : ''}`} onClick={() => setOrderStatus('completed')}>Completed</button>
            </div>
            <span className="order-count">{filteredOrders.length} orders</span>
          </div>

          <div className="orders-list">
            {filteredOrders.map(order => {
              const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0;
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info"><span className="order-id">#{order.order_number || order.id.slice(0, 8)}</span></div>
                    <span className={`order-status ${getStatusBadge(order.status)}`}>{order.status.toUpperCase()}</span>
                  </div>
                  <div className="order-body">
                    <div className="order-customer-line">
                      <span className="customer-label">👤 Customer:</span>
                      <span className="customer-value">{order.users?.name || 'Guest'}</span>
                      {/* NOTE BADGE */}
                      {order.customer_notes && <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '0.5rem' }}>📝 Note</span>}
                    </div>
                    <div className="order-total"><span>Total:</span><span className="total-amount">₱{Number(order.total_amount).toLocaleString()}</span></div>
                  </div>
                  <div className="order-quick-info">
                    <span className={`payment-method-badge ${order.payment_method}`}>{order.payment_method}</span>
                    <span className={`payment-status-badge ${getPaymentStatusInfo(order.payment_status).className}`}>{getPaymentStatusInfo(order.payment_status).label}</span>
                    <span className="item-count-chip">🛍️ {itemCount} items</span>
                  </div>
                  <div className="order-card-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setReviewingOrder(order)}><EyeIcon /> Review</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================
          MENU, CATEGORIES, ADD PRODUCT, ANALYTICS, FEEDBACK, STAFF, CUSTOMERS, PROFILE TABS
          (Place your exact existing render code blocks here)
      ============================================ */}
      {activeTab === 'menu' && (
        <div className="menu-section">
          <div className="menu-header">
            <h2>Menu Items</h2>
            <button className="btn btn-primary" onClick={() => setActiveTab('add-product')}>
              <UploadIcon /> Add New Item
            </button>
          </div>

          {menuItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <p>No menu items yet. Start by adding your first product!</p>
            </div>
          ) : (
            <>
              <div className="category-jump-nav">
                <span className="category-jump-label">Filter:</span>
                <div className="category-jump-pills">
                  <button
                    className={`category-jump-pill ${menuCategoryFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setMenuCategoryFilter('all')}
                  >
                    <span className="category-jump-icon">🍽️</span>
                    <span>All</span>
                    <span className="category-jump-count">{menuCounts.all}</span>
                  </button>
                  {categories
                    .filter(cat => (menuCounts[cat.slug] || 0) > 0)
                    .map(cat => (
                      <button
                        key={cat.id}
                        className={`category-jump-pill ${menuCategoryFilter === cat.slug ? 'active' : ''}`}
                        onClick={() => {
                          setMenuCategoryFilter(cat.slug);
                          const el = document.getElementById(`owner-category-${cat.slug}`);
                          if (el) {
                            const yOffset = -100;
                            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }}
                        style={{ '--cat-color': cat.color }}
                      >
                        <span className="category-jump-icon">{cat.icon}</span>
                        <span>{cat.name}</span>
                        <span className="category-jump-count">{menuCounts[cat.slug] || 0}</span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="category-sections">
                {visibleCategories
                  .filter(cat => (menuCounts[cat.slug] || 0) > 0)
                  .map(cat => {
                    const itemsInCategory = menuItems.filter(i => i.category_id === cat.id);
                    return (
                      <section
                        key={cat.id}
                        id={`owner-category-${cat.slug}`}
                        className="category-section"
                      >
                        <div
                          className="category-section-header"
                          style={{ '--cat-color': cat.color }}
                        >
                          <div className="category-section-title-wrap">
                            <span className="category-section-icon">{cat.icon}</span>
                            <div>
                              <h3 className="category-section-title">{cat.name}</h3>
                              <p className="category-section-count">
                                {itemsInCategory.length} item{itemsInCategory.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div
                            className="category-section-accent"
                            style={{ background: cat.color }}
                          />
                        </div>

                        <div className="category-section-grid">
                          {itemsInCategory.map(item => (
                            <div key={item.id} className="menu-item-card">
                              <div className="menu-item-image-wrapper">
                                <img
                                  src={item.image_url || 'https://via.placeholder.com/300x200/1a1a2e/ffffff?text=No+Image'}
                                  alt={item.name}
                                  className="menu-item-image"
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200/1a1a2e/ffffff?text=No+Image'; }}
                                />
                                <span className="menu-item-category-badge">
                                  {item.category?.icon} {item.category?.name || item.type}
                                </span>
                                <div className="menu-item-actions">
                                  <button className="action-btn edit-btn" onClick={() => handleEditProduct(item)} title="Edit product">
                                    <EditIcon />
                                  </button>
                                  <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteProduct(item)}
                                    disabled={deletingProduct === item.id}
                                    title="Delete product"
                                  >
                                    {deletingProduct === item.id ? '...' : <DeleteIcon />}
                                  </button>
                                </div>
                              </div>
                              <div className="menu-item-info">
                                <h3>{item.name}</h3>
                                <p className="menu-item-description">{item.description}</p>
                                <div className="menu-item-meta">
                                  <span className="menu-item-price">₱{item.price}</span>
                                  <span className={`menu-item-status ${item.is_available ? 'available' : 'unavailable'}`}>
                                    {item.is_available ? '✓ Available' : '✗ Unavailable'}
                                  </span>
                                </div>
                                <div className="menu-item-rating">
                                  {item.review_count > 0 ? (
                                    <>
                                      <span className="menu-item-stars">
                                        {'★'.repeat(Math.round(item.avg_rating))}
                                        {'☆'.repeat(5 - Math.round(item.avg_rating))}
                                      </span>
                                      <span className="menu-item-rating-text">
                                        {item.avg_rating.toFixed(1)} ({item.review_count})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="menu-item-rating-text muted">No reviews yet</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      )}
      {activeTab === 'categories' && (
        <div className="categories-section" style={{ padding: '1.5rem 2rem' }}>
          <div className="menu-header">
            <h2>Manage Categories</h2>
            <button className="btn btn-primary" onClick={() => setIsAddingCategory(!isAddingCategory)}>
              <UploadIcon /> {isAddingCategory ? 'Cancel' : 'Add Category'}
            </button>
          </div>

          {isAddingCategory && (
            <form
              onSubmit={handleAddCategory}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Slug * (lowercase, e.g. "smoothies")</label>
                  <input
                    type="text"
                    value={newCategoryForm.slug}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, slug: e.target.value })}
                    placeholder="smoothies"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Display Name *</label>
                  <input
                    type="text"
                    value={newCategoryForm.name}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                    placeholder="Smoothies"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Icon (emoji)</label>
                  <input
                    type="text"
                    value={newCategoryForm.icon}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                    placeholder="🥤"
                    maxLength={4}
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={newCategoryForm.color}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Display Order (1 first, 99 last)</label>
                  <input
                    type="number"
                    value={newCategoryForm.display_order}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, display_order: e.target.value })}
                    min="1"
                    max="99"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Save Category
              </button>
            </form>
          )}

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${cat.color}30`,
                  borderLeft: `4px solid ${cat.color}`,
                  borderRadius: '12px'
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '1rem' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    slug: <code>{cat.slug}</code> · order: {cat.display_order}
                    {' · '}
                    items: {menuItems.filter(i => i.category_id === cat.id).length}
                  </div>
                </div>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteCategory(cat)}
                  title="Delete category"
                >
                  <DeleteIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'add-product' && (
        <div className="add-product-section">
          <div className="add-product-container">
            <h2>Add New Product</h2>

            {!storageInitialized ? (
              <div className="storage-loading">⏳ Initializing storage...</div>
            ) : !bucketExists && (
              <div className="storage-warning">
                <strong>⚠️ Storage bucket not found!</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Please create it in Supabase dashboard:</p>
                <ol style={{ marginTop: '0.5rem', fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                  <li>Go to Supabase Dashboard → Storage</li>
                  <li>Click "Create a new bucket"</li>
                  <li>Name: <strong>product-images</strong></li>
                  <li>Toggle "Public bucket" ON</li>
                  <li>Click "Create bucket"</li>
                  <li>Refresh this page</li>
                </ol>
                {storageError && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#fca5a5' }}>Error: {storageError}</p>
                )}
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
                            const fileInput = document.getElementById('product-image-input');
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
                      <input id="product-image-input" type="file" accept="image/*" onChange={handleImageSelect} className="image-input" required />
                    </div>
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" placeholder="e.g., Mocha Frappuccino" required value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select required value={uploadForm.category_id}
                        onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}>
                        <option value="">— Select category —</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₱) *</label>
                      <input type="number" placeholder="0.00" required min="0" step="0.01" value={uploadForm.price}
                        onChange={(e) => setUploadForm({ ...uploadForm, price: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea placeholder="Describe your product..." rows="4" required value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} />
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
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h2>Sales Analytics</h2>

          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-title">Daily Revenue</span>
              <span className="metric-value">₱{metrics.daily.toLocaleString()}</span>
              {renderTrend(15)}
            </div>
            <div className="metric-card">
              <span className="metric-title">Monthly Revenue</span>
              <span className="metric-value">₱{metrics.monthly.toLocaleString()}</span>
              {renderTrend(8)}
            </div>
            <div className="metric-card">
              <span className="metric-title">Yearly Revenue</span>
              <span className="metric-value">₱{metrics.yearly.toLocaleString()}</span>
              {renderTrend(-2)}
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">Revenue - Last 7 Days</div>
            <div className="simple-bar-chart">
              {chartData.map((data, idx) => {
                const heightPercent = (data.amount / maxChartValue) * 100;
                return (
                  <div key={idx} className="bar-wrapper">
                    <div className="bar" style={{ height: `${heightPercent || 2}%` }}>
                      <span className="bar-value">{data.amount > 0 ? `${(data.amount / 1000).toFixed(1)}k` : '₱0'}</span>
                    </div>
                    <span className="bar-label">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="analytics-grid">
            <div className="analytics-panel">
              <h3>Top 3 Best-Selling Products</h3>
              <div className="product-rank-list best">
                {analytics.best.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No sales data yet.</p>
                ) : (
                  analytics.best.map((product, index) => (
                    <div key={index} className="product-rank-item">
                      <div className="rank-number">#{index + 1}</div>
                      <div className="product-details">
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                      </div>
                      <div className="sales-count">{product.sales} sold</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="analytics-panel">
              <h3>Top 3 Least-Selling Products</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '-1rem' }}>
                Items for menu review or potential replacement.
              </p>
              <div className="product-rank-list worst">
                {analytics.worst.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No sales data yet.</p>
                ) : (
                  analytics.worst.map((product, index) => (
                    <div key={index} className="product-rank-item">
                      <div className="rank-number">#{index + 1}</div>
                      <div className="product-details">
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                      </div>
                      <div className="sales-count">{product.sales} sold</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'feedback' && (
        <div className="feedback-section">
          <div className="feedback-header-row">
            <h2>Customer Reviews</h2>
            <button className="btn btn-secondary btn-sm" onClick={refetchReviews}>
              🔄 Refresh
            </button>
          </div>

          <div className="review-summary-grid">
            <div className="review-summary-card">
              <div className="review-summary-icon">⭐</div>
              <div>
                <span className="review-summary-value">
                  {reviews.length > 0
                    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2)
                    : '—'}
                </span>
                <span className="review-summary-label">Average Rating</span>
              </div>
            </div>
            <div className="review-summary-card">
              <div className="review-summary-icon">💬</div>
              <div>
                <span className="review-summary-value">{reviews.length}</span>
                <span className="review-summary-label">Total Reviews</span>
              </div>
            </div>
            <div className="review-summary-card highlight">
              <div className="review-summary-icon">🏆</div>
              <div>
                <span className="review-summary-value">
                  {reviews.length > 0
                    ? (() => {
                        const productStats = {};
                        reviews.forEach(r => {
                          (r.product_names || []).forEach(name => {
                            if (!productStats[name]) productStats[name] = { sum: 0, count: 0 };
                            productStats[name].sum += r.rating;
                            productStats[name].count += 1;
                          });
                        });
                        let best = null;
                        for (const [name, s] of Object.entries(productStats)) {
                          const avg = s.sum / s.count;
                          if (!best || avg > best.avg) best = { name, avg, count: s.count };
                        }
                        return best ? `${best.name} (${best.avg.toFixed(1)}★)` : '—';
                      })()
                    : '—'}
                </span>
                <span className="review-summary-label">Top Rated Product</span>
              </div>
            </div>
          </div>

          <div className="feedback-list">
            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <p>No reviews yet</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Reviews appear here once customers rate completed orders.
                </p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="feedback-card">
                  <div className="feedback-header">
                    <div className="customer-info">
                      <h4>{review.customer_name || 'Anonymous'}</h4>
                      <p>
                        {new Date(review.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                        {review.order_number && (
                          <span className="review-order-tag"> · Order #{review.order_number}</span>
                        )}
                      </p>
                    </div>
                    <div className="stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>

                  {review.product_names && review.product_names.length > 0 && (
                    <div className="review-products-row">
                      <span className="review-products-label">Reviewed items:</span>
                      <div className="review-product-chips">
                        {review.product_names.map((name, i) => (
                          <span key={i} className="review-product-chip">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="feedback-text">"{review.text}"</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {activeTab === 'employees' && (
        <div className="employees-container">
          <div className="employees-grid">
            <div className="employee-form-panel">
              <h2><UserPlusIcon style={{ marginRight: '0.5rem' }} /> Create Staff Account</h2>
              <form onSubmit={handleCreateEmployee}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Enter staff name" required value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="staff@example.com" required value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" placeholder="Min 6 characters" required minLength={6} value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select 
                    value={employeeForm.role} 
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    style={{ padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f8fafc' }}
                  >
                    <option value="employee">👨‍🍳 Employee (Cashier / Barista)</option>
                    <option value="driver">🛵 Driver (Delivery)</option>
                  </select>
                </div>

                {employeeError && <div className="error-message" style={{ marginBottom: '1rem' }}>❌ {employeeError}</div>}

                <button type="submit" className="btn btn-primary btn-large" disabled={creatingEmployee} style={{ width: '100%' }}>
                  {creatingEmployee ? '⏳ Creating...' : '➕ Create Account'}
                </button>
              </form>
            </div>

            <div className="employee-list-panel">
              <div className="employee-list-header">
                <h2>
                  <UsersIcon />
                  Staff List
                  <span className="employee-count">{staffList.length}</span>
                </h2>
                <button className="btn btn-secondary btn-sm" onClick={fetchStaff} disabled={loadingStaff}>
                  {loadingStaff ? '⏳ Loading...' : '🔄 Refresh'}
                </button>
              </div>

              {/* Staff Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                <button 
                  className={`filter-btn ${staffTab === 'employee' ? 'active' : ''}`} 
                  onClick={() => setStaffTab('employee')}
                >
                  👨‍🍳 Employees ({staffList.filter(s => s.role === 'employee').length})
                </button>
                <button 
                  className={`filter-btn ${staffTab === 'driver' ? 'active' : ''}`} 
                  onClick={() => setStaffTab('driver')}
                >
                  🛵 Drivers ({staffList.filter(s => s.role === 'driver').length})
                </button>
              </div>

              {loadingStaff ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>⏳ Loading staff...</p>
              ) : staffList.filter(s => s.role === staffTab).length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: '#94a3b8' }}>No {staffTab}s found.</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Create a new account using the form on the left.</p>
                </div>
              ) : (
                <div className="employee-list">
                  {staffList.filter(s => s.role === staffTab).map(emp => (
                    <div key={emp.id} className="employee-item">
                      <div className="employee-info">
                        <h4>{emp.name}</h4>
                        <p>{emp.email}</p>
                      </div>
                      <div className="employee-item-actions">
                        <select 
                          value={emp.role} 
                          onChange={(e) => handleChangeRole(emp.id, e.target.value)}
                          style={{ padding: '0.4rem', background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', borderRadius: '6px', fontSize: '0.8rem' }}
                        >
                          <option value="employee">Employee</option>
                          <option value="driver">Driver</option>
                        </select>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteEmployee(emp.id, emp.name)} disabled={deletingEmployee === emp.id}>
                          {deletingEmployee === emp.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'customers' && (
        <div className="customers-container">
          <div className="customers-header">
            <div>
              <h2>Customer Directory</h2>
              <p className="customers-subtitle">View all registered customers and their activity</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchCustomers} disabled={loadingCustomers}>
              {loadingCustomers ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>

          <div className="customers-stats-grid">
            <div className="customer-stat-card">
              <div className="customer-stat-icon">👥</div>
              <div>
                <span className="customer-stat-value">{customerStats.total}</span>
                <span className="customer-stat-label">Total Customers</span>
              </div>
            </div>
            <div className="customer-stat-card">
              <div className="customer-stat-icon">🛍️</div>
              <div>
                <span className="customer-stat-value">{customerStats.withOrders}</span>
                <span className="customer-stat-label">Active Customers</span>
              </div>
            </div>
            <div className="customer-stat-card highlight">
              <div className="customer-stat-icon">💰</div>
              <div>
                <span className="customer-stat-value">₱{customerStats.totalRevenue.toLocaleString()}</span>
                <span className="customer-stat-label">Total Revenue</span>
              </div>
            </div>
          </div>

          <div className="customers-search-bar">
            <SearchIcon />
            <input type="text" placeholder="Search by name or email..." value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)} />
            {customerSearch && <button className="search-clear-btn" onClick={() => setCustomerSearch('')}>×</button>}
          </div>

          {customersError && <div className="error-message" style={{ marginBottom: '1rem' }}>❌ Error: {customersError}</div>}

          {loadingCustomers ? (
            <div className="customers-loading">⏳ Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>{customerSearch ? 'No customers match your search.' : 'No customers found.'}</p>
            </div>
          ) : (
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">{(customer.name || 'U').charAt(0).toUpperCase()}</div>
                          <div className="customer-name-block">
                            <span className="customer-name-text">{customer.name || 'Unnamed User'}</span>
                            <span className="customer-role-tag">Customer</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="customer-email">{customer.email}</span></td>
                      <td>
                        <span className="customer-joined">
                          {customer.created_at
                            ? new Date(customer.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                            : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="customer-orders-count">
                          <strong>{customer.total_orders || 0}</strong>
                          <span className="orders-breakdown">({customer.completed_orders || 0} completed)</span>
                        </span>
                      </td>
                      <td>
                        <span className="customer-total-spent">₱{Number(customer.total_spent || 0).toLocaleString()}</span>
                      </td>
                      <td>
                        <div className="customer-actions">
                          <button className="action-btn delete-btn" onClick={() => handleDeleteCustomer(customer)} disabled={deletingCustomer === customer.id}>
                            {deletingCustomer === customer.id ? '⏳' : <DeleteIcon />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="profile-view">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar"><span className="avatar-icon">👑</span></div>
              <div className="profile-title">
                <h2>Owner Profile</h2>
                <p>Manage your account settings</p>
              </div>
            </div>

            {profileSuccess && <div className="profile-success"><span>✅</span>{profileSuccess}</div>}
            {profileError && <div className="profile-error"><span>❌</span>{profileError}</div>}

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
                      <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Enter your full name" required />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={profile.email} disabled className="disabled-input" />
                      <span className="input-hint">Email cannot be changed</span>
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input type="text" value="Owner" disabled className="disabled-input" />
                    </div>
                    <div className="profile-actions">
                      <button type="button" className="btn-cancel" onClick={() => {
                        setIsEditingProfile(false); setProfile({ ...profile, name: user?.name || '' });
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
                      <span className="field-value role-badge owner">Owner</span>
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
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password" required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Min 6 characters" required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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

      {/* ORDER REVIEW MODAL (with Customer Notes added) */}
      {reviewingOrder && (
        <div className="modal-overlay" onClick={() => setReviewingOrder(null)}>
          <div className="modal-content order-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header order-review-header">
              <div className="modal-title-with-icon"><ReceiptIcon /><div><h2>Order Review</h2><span className="modal-subtitle">#{reviewingOrder.order_number || reviewingOrder.id.slice(0, 8)}</span></div></div>
              <button className="modal-close-btn" onClick={() => setReviewingOrder(null)}><CloseIcon /></button>
            </div>
            <div className="order-review-body">
              <div className="review-column">
                <div className="review-block">
                  <h3 className="review-block-title">👤 Customer Information</h3>
                  <div className="review-info-grid">
                    <div className="review-info-row"><span className="review-info-label">Name</span><span className="review-info-value">{reviewingOrder.users?.name || 'Guest'}</span></div>
                    <div className="review-info-row"><span className="review-info-label">Email</span><span className="review-info-value">{reviewingOrder.users?.email || '—'}</span></div><div className="review-info-row">
  <span className="review-info-label">📞 Phone</span>
  <span className="review-info-value">{reviewingOrder.users?.phone || '—'}</span>
</div>
                    <div className="review-info-row"><span className="review-info-label">Order Type</span><span className="review-info-value">{reviewingOrder.order_type === 'delivery' ? '🛵 Delivery' : reviewingOrder.order_type === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}</span></div>
                    {reviewingOrder.order_type === 'delivery' && <div className="review-info-row"><span className="review-info-label">Address</span><span className="review-info-value">{reviewingOrder.delivery_address || '—'}</span></div>}
                    
                    {/* NEW: CUSTOMER NOTES */}
                    {reviewingOrder.customer_notes && (
                      <div className="review-info-row">
                        <span className="review-info-label">📝 Customer Notes</span>
                        <span className="review-info-value" style={{ color: '#fbbf24' }}>{reviewingOrder.customer_notes}</span>
                      </div>
                    )}

                    <div className="review-info-row"><span className="review-info-label">Total</span><span className="review-info-value highlight">₱{Number(reviewingOrder.total_amount).toFixed(2)}</span></div>
                  </div>
                </div>
                <div className="review-block">
                  <h3 className="review-block-title">💳 Payment</h3>
                  <div className="review-info-grid">
                    <div className="review-info-row"><span className="review-info-label">Method</span><span className={`payment-method-badge ${reviewingOrder.payment_method}`}>{reviewingOrder.payment_method}</span></div>
                    <div className="review-info-row"><span className="review-info-label">Status</span><span className={`payment-status-badge ${getPaymentStatusInfo(reviewingOrder.payment_status).className}`}>{getPaymentStatusInfo(reviewingOrder.payment_status).label}</span></div>
                  </div>
                  <div className="payment-status-buttons">
                    <button className={`payment-status-btn ${reviewingOrder.payment_status === 'confirmed' ? 'active' : ''}`} onClick={() => handleUpdatePaymentStatus(reviewingOrder.id, 'confirmed')}>✅ Confirm</button>
                    <button className={`payment-status-btn ${reviewingOrder.payment_status === 'rejected' ? 'active' : ''}`} onClick={() => handleUpdatePaymentStatus(reviewingOrder.id, 'rejected')}>❌ Reject</button>
                  </div>
                </div>
              </div>
              <div className="review-column">
                <div className="review-block">
                  <h3 className="review-block-title">🛍️ Order Items</h3>
                  <div className="review-items-table">
                    <div className="review-items-header"><span>Item</span><span>Qty</span><span>Price</span><span>Subtotal</span></div>
                    {reviewingOrder.order_items?.map((item, idx) => (<div key={idx} className="review-items-row"><span className="review-item-name">{item.menu_items?.name}</span><span className="review-item-qty">×{item.quantity}</span><span className="review-item-price">₱{Number(item.price_at_time).toFixed(2)}</span><span className="review-item-subtotal">₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}</span></div>))}
                  </div>
                </div>
                <div className="review-block">
                  <h3 className="review-block-title">📸 Payment Proof</h3>
                  {reviewingOrder.proof_image_url ? (<div className="review-proof-container"><img src={reviewingOrder.proof_image_url} alt="Proof" className="review-proof-image" onClick={() => setViewingReceipt(reviewingOrder.proof_image_url)} /></div>) : <p>No proof uploaded</p>}
                </div>
                <div className="review-block review-actions-block">
                  <h3 className="review-block-title">⚡ Actions</h3>
                  {reviewingOrder.status === 'pending' && (<div className="review-actions-row"><button className="btn btn-primary btn-large" disabled={reviewingOrder.payment_status !== 'confirmed'} onClick={() => updateOrderStatus(reviewingOrder.id, 'preparing')}>📦 Start Preparing</button><button className="btn btn-danger btn-large" onClick={() => updateOrderStatus(reviewingOrder.id, 'declined')}>🚫 Decline</button></div>)}
                  {reviewingOrder.status === 'preparing' && (<button className="btn btn-success btn-large" onClick={() => updateOrderStatus(reviewingOrder.id, 'completed')}>✅ Mark Completed</button>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT VIEWER */}
      {viewingReceipt && (
        <div className="receipt-viewer-overlay" onClick={() => setViewingReceipt(null)}>
          <div className="receipt-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="receipt-viewer-close" onClick={() => setViewingReceipt(null)}>×</button>
            <h3 className="receipt-viewer-title">Payment Proof</h3>
            <img src={viewingReceipt} alt="Payment proof" className="receipt-viewer-image" />
          </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} confirmText={confirmModal.confirmText} cancelText={confirmModal.cancelText} variant={confirmModal.variant} isLoading={confirmModal.isLoading} onConfirm={confirmModal.onConfirm} onCancel={closeConfirm} />
      <SuccessModal isOpen={employeeSuccessModal.isOpen} title="Account Created!" message="Verification email sent." email={employeeSuccessModal.email} onClose={() => setEmployeeSuccessModal({ isOpen: false, email: '', name: '' })} />
    </div>
  );
}

export default OwnerDashboard;
