import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  useMenuItems, 
  useOrders, 
  useReviews, 
  useEmployees, 
  useCustomers 
} from '../hooks/useSupabase';
import { 
  initStorage, 
  uploadImage as uploadImageUtil, 
  deleteImage as deleteImageUtil, 
  testDirectBucketAccess 
} from '../utils/storage';
import './OwnerDashboard.css';

import logo from '../assets/logo.jpg';

// ============================================
// ICONS
// ============================================
const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CustomersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const ReceiptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <path d="M8 7h8"/>
    <path d="M8 11h8"/>
    <path d="M8 15h5"/>
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

const getStatusBadge = (status) => {
  const statusMap = {
    pending: 'badge-warning',
    preparing: 'badge-info',
    processing: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    declined: 'badge-danger'
  };
  return statusMap[status] || 'badge-secondary';
};

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

// ============================================
// MAIN COMPONENT
// ============================================
function OwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Product form
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'coffee',
    price: '',
    description: '',
    is_available: true
  });
  
  // Edit product
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', type: '', price: '', description: '', is_available: true
  });
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  
  // Employee form
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    email: '', password: '', name: '', role: 'employee'
  });
  const [employeeError, setEmployeeError] = useState('');
  const [employeeSuccess, setEmployeeSuccess] = useState('');
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  
  // Order filter
  const [orderStatus, setOrderStatus] = useState('all');
  
  // Delete product
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Customer management
  const [customerSearch, setCustomerSearch] = useState('');
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Order review modal
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Confirmation modal
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

  // Storage state
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
  
  // ============================================
  // HOOKS
  // ============================================
  const { 
    items: menuItems, 
    addMenuItem, 
    updateMenuItem,
    deleteMenuItem,
    refetch: refetchMenuItems 
  } = useMenuItems();
  
  const { 
    orders, 
    updatePaymentStatus, 
    refresh: refetchOrders 
  } = useOrders();
  
  const { reviews } = useReviews();
  
  const { 
    employees, 
    loading: loadingEmployees, 
    error: employeesError,
    createEmployee,
    deleteEmployee,
    refetch: fetchEmployees 
  } = useEmployees();

  const { 
    customers,
    loading: loadingCustomers,
    error: customersError,
    deleteCustomer,
    refetch: fetchCustomers
  } = useCustomers();

  // ============================================
  // STORAGE CHECK
  // ============================================
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

  // ============================================
  // EMPLOYEE HANDLERS — WITH CONFIRMATION
  // ============================================
  const handleCreateEmployee = (e) => {
    e.preventDefault();
    
    // Validate first
    if (!employeeForm.name.trim() || !employeeForm.email.trim() || !employeeForm.password) {
      setEmployeeError('Please fill in all fields');
      return;
    }
    
    openConfirm({
      title: 'Create Employee Account?',
      message: `Are you sure you want to create an account for "${employeeForm.name}" (${employeeForm.email})? They will be able to log in as an employee immediately.`,
      confirmText: 'Yes, Create',
      cancelText: 'No, Cancel',
      variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        setEmployeeError('');
        setEmployeeSuccess('');
        setCreatingEmployee(true);

        try {
          const newEmployee = await createEmployee({
            email: employeeForm.email,
            password: employeeForm.password,
            name: employeeForm.name
          });

          if (newEmployee) {
            setEmployeeSuccess(`✅ Employee account created! Email: ${employeeForm.email}`);
            setEmployeeForm({ email: '', password: '', name: '', role: 'employee' });
          }
        } catch (error) {
          setEmployeeError(error.message || 'Failed to create employee account');
        } finally {
          setCreatingEmployee(false);
        }
      }
    });
  };

  const handleDeleteEmployee = (employeeId, employeeName) => {
    openConfirm({
      title: 'Delete Employee?',
      message: `Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'No, Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingEmployee(employeeId);
        closeConfirm();
        try {
          await deleteEmployee(employeeId);
          alert('✅ Employee deleted successfully!');
        } catch (error) {
          alert('❌ Failed to delete employee: ' + error.message);
        } finally {
          setDeletingEmployee(null);
        }
      }
    });
  };

  // ============================================
  // IMAGE HANDLERS
  // ============================================
  const handleImageSelect = (e) => {
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
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageSelect = (e) => {
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
      setEditImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => uploadImageUtil(file);
  const deleteImage = async (imageUrl) => deleteImageUtil(imageUrl);

  // ============================================
  // PRODUCT HANDLERS — WITH CONFIRMATION
  // ============================================
  const handleUploadProduct = (e) => {
    e.preventDefault();
    
    // Validate
    if (!uploadForm.name.trim()) { alert('Please enter a product name'); return; }
    if (!uploadForm.price || parseFloat(uploadForm.price) <= 0) { alert('Please enter a valid price'); return; }
    if (!uploadForm.description.trim()) { alert('Please enter a product description'); return; }
    if (!selectedImage) { alert('Please select an image for the product'); return; }

    openConfirm({
      title: 'Add New Product?',
      message: `Are you sure you want to add "${uploadForm.name}" to the menu at ₱${uploadForm.price}?`,
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
            type: uploadForm.type,
            price: parseFloat(uploadForm.price),
            description: uploadForm.description.trim(),
            image_url: imageUrl,
            is_available: uploadForm.is_available
          };

          await addMenuItem(productData);
          setUploadProgress(100);
          
          setUploadForm({ name: '', type: 'coffee', price: '', description: '', is_available: true });
          setSelectedImage(null);
          setImagePreview(null);
          
          const fileInput = document.getElementById('product-image-input');
          if (fileInput) fileInput.value = '';
          
          await refetchMenuItems();
          alert('✅ Product uploaded successfully!');
          setActiveTab('menu');
        } catch (error) {
          alert('❌ Failed to upload product: ' + error.message);
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      type: product.type,
      price: product.price.toString(),
      description: product.description || '',
      is_available: product.is_available
    });
    setEditImagePreview(product.image_url);
    setIsEditing(true);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    
    // Validate
    if (!editForm.name.trim()) { alert('Please enter a product name'); return; }
    if (!editForm.price || parseFloat(editForm.price) <= 0) { alert('Please enter a valid price'); return; }
    if (!editForm.description.trim()) { alert('Please enter a product description'); return; }

    openConfirm({
      title: 'Save Changes?',
      message: `Are you sure you want to update "${editingProduct.name}"? These changes will be visible to all customers immediately.`,
      confirmText: 'Yes, Save Changes',
      cancelText: 'No, Cancel',
      variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        setUploading(true);
        setUploadProgress(0);

        try {
          let imageUrl = editingProduct.image_url;

          if (editImage) {
            setUploadProgress(30);
            if (editingProduct.image_url) await deleteImage(editingProduct.image_url);
            imageUrl = await uploadImage(editImage);
            setUploadProgress(70);
          }

          const updatedProduct = {
            name: editForm.name.trim(),
            type: editForm.type,
            price: parseFloat(editForm.price),
            description: editForm.description.trim(),
            image_url: imageUrl,
            is_available: editForm.is_available,
            updated_at: new Date().toISOString()
          };
          
          await updateMenuItem(editingProduct.id, updatedProduct);
          
          setUploadProgress(100);
          setIsEditing(false);
          setEditingProduct(null);
          setEditImage(null);
          setEditImagePreview(null);
          
          alert('✅ Product updated successfully!');
          await refetchMenuItems();
        } catch (error) {
          alert('❌ Failed to update product: ' + error.message);
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    });
  };

  const handleDeleteProduct = (product) => {
    openConfirm({
      title: 'Delete Product?',
      message: `Are you sure you want to delete "${product.name}"? This will permanently remove the product and its image. This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'No, Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingProduct(product.id);
        closeConfirm();
        try {
          if (product.image_url) await deleteImage(product.image_url);
          await deleteMenuItem(product.id);
          
          alert('✅ Product deleted successfully!');
          await refetchMenuItems();
        } catch (error) {
          alert('❌ Failed to delete product: ' + error.message);
        } finally {
          setDeletingProduct(null);
        }
      }
    });
  };

  // ============================================
  // ORDER HANDLERS — WITH CONFIRMATION
  // ============================================
  const updateOrderStatus = (orderId, newStatus) => {
    const statusLabels = {
      preparing: 'Preparing',
      processing: 'Processing',
      completed: 'Completed',
      declined: 'Declined',
      cancelled: 'Cancelled'
    };
    const label = statusLabels[newStatus] || newStatus;

    openConfirm({
      title: `${label} Order?`,
      message: `Are you sure you want to mark this order as "${label}"? This action will be reflected immediately.`,
      confirmText: `Yes, Mark as ${label}`,
      cancelText: 'No, Cancel',
      variant: newStatus === 'declined' || newStatus === 'cancelled' ? 'danger' : 'warning',
      onConfirm: async () => {
        // Show loading state
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

          if (error) throw error;
          
          await refetchOrders();
          
          if (reviewingOrder && reviewingOrder.id === orderId) {
            setReviewingOrder({ ...reviewingOrder, status: newStatus });
          }
          
          closeConfirm();
          alert(`✅ Order status updated to "${label}"`);
        } catch (error) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          alert('❌ Failed to update order status: ' + error.message);
        }
      }
    });
  };

  const handleProcessOrder = (order) => {
    setReviewingOrder(order);
  };

  // ============================================
  // PAYMENT STATUS — WITH CONFIRMATION
  // ============================================
  const handleUpdatePaymentStatus = (orderId, newPaymentStatus) => {
    const statusLabels = {
      valid: 'Verified',
      underpayment: 'Underpaid',
      overpayment: 'Overpaid'
    };
    const label = statusLabels[newPaymentStatus] || newPaymentStatus;

    openConfirm({
      title: `Mark Payment as ${label}?`,
      message: `Are you sure you want to mark this order's payment as "${label}"? The customer will see this update.`,
      confirmText: `Yes, Mark as ${label}`,
      cancelText: 'No, Cancel',
      variant: newPaymentStatus === 'valid' ? 'warning' : 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        try {
          await updatePaymentStatus(orderId, newPaymentStatus);
          
          if (reviewingOrder && reviewingOrder.id === orderId) {
            setReviewingOrder({ ...reviewingOrder, payment_status: newPaymentStatus });
          }
          
          closeConfirm();
          alert(`✅ Payment status updated to "${label}"`);
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          alert('❌ Failed to update payment status: ' + err.message);
        }
      }
    });
  };

  // ============================================
  // CUSTOMER HANDLERS — WITH CONFIRMATION
  // ============================================
  const handleDeleteCustomer = (customer) => {
    openConfirm({
      title: 'Delete Customer?',
      message: `Are you sure you want to delete customer "${customer.name}" (${customer.email})? This will remove ALL their data including orders. This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'No, Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingCustomer(customer.id);
        closeConfirm();
        try {
          await deleteCustomer(customer.id);
          alert('✅ Customer deleted successfully!');
        } catch (error) {
          alert('❌ Failed to delete customer: ' + error.message);
        } finally {
          setDeletingCustomer(null);
        }
      }
    });
  };

  const filteredCustomers = customers.filter(customer => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      (customer.name || '').toLowerCase().includes(q) ||
      (customer.email || '').toLowerCase().includes(q)
    );
  });

  const customerStats = {
    total: customers.length,
    withOrders: customers.filter(c => c.total_orders > 0).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
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
      message: 'Are you sure you want to change your account password? You will need to use the new password on next login.',
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
  // FILTERS AND METRICS
  // ============================================
  const filteredOrders = orders.filter(order => {
    if (orderStatus === 'all') return true;
    if (orderStatus === 'preparing') {
      return order.status === 'preparing' || order.status === 'processing';
    }
    return order.status === orderStatus;
  });

  const calculateMetrics = () => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const daily = completedOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate.toDateString() === today.toDateString();
    });
    
    const monthly = completedOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
    });
    
    const yearly = completedOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate.getFullYear() === thisYear;
    });
    
    return {
      daily: daily.reduce((sum, o) => sum + o.total_amount, 0),
      monthly: monthly.reduce((sum, o) => sum + o.total_amount, 0),
      yearly: yearly.reduce((sum, o) => sum + o.total_amount, 0)
    };
  };

  const metrics = calculateMetrics();

  const getProductAnalytics = () => {
    const productSales = {};
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        const productName = item.menu_items?.name || 'Unknown';
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            category: item.menu_items?.type || 'Unknown',
            sales: 0
          };
        }
        productSales[productName].sales += item.quantity;
      });
    });
    const sorted = Object.values(productSales).sort((a, b) => b.sales - a.sales);
    return { best: sorted.slice(0, 3), worst: sorted.slice(-3).reverse() };
  };

  const analytics = getProductAnalytics();

  const getChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({ day, amount: 0 }));
    orders.forEach(order => {
      if (order.status === 'completed') {
        const orderDate = new Date(order.created_at);
        const dayIndex = orderDate.getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        if (data[adjustedIndex]) {
          data[adjustedIndex].amount += order.total_amount;
        }
      }
    });
    return data;
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(...chartData.map(d => d.amount), 1);

  const renderTrend = (value) => {
    if (value > 0) {
      return <span className="metric-trend trend-up"><TrendingUpIcon /> +{value}% vs last period</span>;
    }
    return <span className="metric-trend trend-down"><TrendingDownIcon /> {value}% vs last period</span>;
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="owner-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="brand-logo">
            <img src={logo} alt="1of1 Coffee" className="brand-logo-image" />
            <div className="brand-text">
              <h1>1of1 Coffee</h1>
              <span className="brand-subtitle">Owner Dashboard</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.name || 'Owner'}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOutIcon /> Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <OrdersIcon />
          <span>Orders</span>
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <span className="nav-badge">{orders.filter(o => o.status === 'pending').length}</span>
          )}
        </button>
        <button className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          <MenuIcon />
          <span>Menu</span>
        </button>
        <button className={`nav-tab ${activeTab === 'add-product' ? 'active' : ''}`} onClick={() => setActiveTab('add-product')}>
          <UploadIcon />
          <span>Add Product</span>
        </button>
        <button className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <ChartIcon />
          <span>Analytics</span>
        </button>
        <button className={`nav-tab ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
          <StarIcon />
          <span>Reviews</span>
        </button>
        <button className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => { setActiveTab('employees'); fetchEmployees(); }}>
          <UsersIcon />
          <span>Employees</span>
        </button>
        <button className={`nav-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => { setActiveTab('customers'); fetchCustomers(); }}>
          <CustomersIcon />
          <span>Customers</span>
        </button>
        <button className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setProfileError(''); setProfileSuccess(''); }}>
          <UserIcon />
          <span>Profile</span>
        </button>
      </nav>

      {/* Storage warning */}
      {storageInitialized && !bucketExists && (
        <div className="storage-warning">
          <strong>⚠️ Storage bucket "product-images" not found.</strong>
          <br />
          <span style={{fontSize: '0.9rem'}}>
            Create it in Supabase: <strong>Storage → Create bucket → Name: product-images → Public: ON</strong>
          </span>
          {storageError && (
            <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#fca5a5'}}>
              Error: {storageError}
            </div>
          )}
        </div>
      )}

      {/* ============================================
          ORDERS TAB
          ============================================ */}
      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📋</div>
              <div>
                <span className="metric-title">Total Orders</span>
                <span className="metric-value">{orders.length}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏳</div>
              <div>
                <span className="metric-title">Pending</span>
                <span className="metric-value">{orders.filter(o => o.status === 'pending').length}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🔄</div>
              <div>
                <span className="metric-title">Preparing</span>
                <span className="metric-value">{orders.filter(o => o.status === 'preparing' || o.status === 'processing').length}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">✅</div>
              <div>
                <span className="metric-title">Completed</span>
                <span className="metric-value">{orders.filter(o => o.status === 'completed').length}</span>
              </div>
            </div>
            <div className="metric-card highlight">
              <div className="metric-icon">💰</div>
              <div>
                <span className="metric-title">Total Revenue</span>
                <span className="metric-value">
                  ₱{orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="orders-toolbar">
            <div className="filter-group">
              <button className={`filter-btn ${orderStatus === 'all' ? 'active' : ''}`} onClick={() => setOrderStatus('all')}>All Orders</button>
              <button className={`filter-btn ${orderStatus === 'pending' ? 'active' : ''}`} onClick={() => setOrderStatus('pending')}>⏳ Pending</button>
              <button className={`filter-btn ${orderStatus === 'preparing' ? 'active' : ''}`} onClick={() => setOrderStatus('preparing')}>📦 Preparing</button>
              <button className={`filter-btn ${orderStatus === 'completed' ? 'active' : ''}`} onClick={() => setOrderStatus('completed')}>✅ Completed</button>
              <button className={`filter-btn ${orderStatus === 'cancelled' ? 'active' : ''}`} onClick={() => setOrderStatus('cancelled')}>❌ Cancelled</button>
            </div>
            <span className="order-count">{filteredOrders.length} orders</span>
          </div>

          <div className="orders-list">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No orders to display</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const paymentInfo = getPaymentStatusInfo(order.payment_status);
                const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                return (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <span className="order-id">#{order.order_number || order.id.slice(0, 8)}</span>
                        <span className="order-time">
                          {new Date(order.created_at).toLocaleString('en-PH', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="order-actions">
                        <span className={`order-status ${getStatusBadge(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="order-body">
                      <div className="order-customer-line">
                        <span className="customer-label">👤 Customer:</span>
                        <span className="customer-value">
                          {order.users?.name || 'Guest'}
                          {order.users?.email && (
                            <span className="customer-email-inline">({order.users.email})</span>
                          )}
                        </span>
                      </div>

                      <div className="order-items">
                        {order.order_items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="order-item">
                            <span className="item-name">{item.menu_items?.name || 'Unknown'}</span>
                            <span className="item-qty">×{item.quantity}</span>
                            <span className="item-price">₱{item.price_at_time || item.price}</span>
                          </div>
                        ))}
                        {order.order_items?.length > 2 && (
                          <div className="order-more-items">+{order.order_items.length - 2} more item(s)</div>
                        )}
                      </div>

                      <div className="order-total">
                        <span>Total:</span>
                        <span className="total-amount">₱{Number(order.total_amount).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="order-quick-info">
                      <span className={`payment-method-badge ${order.payment_method || 'gcash'}`}>
                        {order.payment_method === 'paymaya' ? '💚 PayMaya' : '💙 GCash'}
                      </span>
                      <span className={`payment-status-badge ${paymentInfo.className}`}>
                        {paymentInfo.label}
                      </span>
                      <span className="order-type-chip">
                        {order.order_type === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}
                      </span>
                      <span className="item-count-chip">
                        🛍️ {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="order-card-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => setReviewingOrder(order)}>
                        <EyeIcon /> Review
                      </button>

                      {order.status === 'pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleProcessOrder(order)}>
                          ⚙️ Process Order
                        </button>
                      )}

                      {order.status === 'pending' && order.payment_status === 'valid' && (
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          title="Skip review and start preparing"
                        >
                          📦 Quick Start
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          ✅ Complete
                        </button>
                      )}

                      {order.status === 'pending' && order.payment_status !== 'valid' && (
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => handleProcessOrder(order)}
                          title="Review and verify payment"
                        >
                          💳 Verify Payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================
          MENU TAB
          ============================================ */}
      {activeTab === 'menu' && (
        <div className="menu-section">
          <div className="menu-header">
            <h2>Menu Items</h2>
            <button className="btn btn-primary" onClick={() => setActiveTab('add-product')}>
              <UploadIcon /> Add New Item
            </button>
          </div>
          
          <div className="menu-grid">
            {menuItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <p>No menu items yet. Start by adding your first product!</p>
              </div>
            ) : (
              menuItems.map(item => (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-image-wrapper">
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/300x200/1a1a2e/ffffff?text=No+Image'} 
                      alt={item.name}
                      className="menu-item-image"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200/1a1a2e/ffffff?text=No+Image'; }}
                    />
                    <span className="menu-item-category-badge">{item.type}</span>
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================
          EDIT PRODUCT MODAL
          ============================================ */}
      {isEditing && editingProduct && (
        <div className="modal-overlay" onClick={() => {
          setIsEditing(false); setEditingProduct(null); setEditImage(null); setEditImagePreview(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="modal-close-btn" onClick={() => {
                setIsEditing(false); setEditingProduct(null); setEditImage(null); setEditImagePreview(null);
              }}>
                <CloseIcon />
              </button>
            </div>
            
            <form className="modal-form" onSubmit={handleUpdateProduct}>
              <div className="form-grid">
                <div className="form-left">
                  <div className="form-group image-upload-group">
                    <label>Product Image</label>
                    <div className="image-upload-area">
                      {editImagePreview ? (
                        <div className="image-preview-container">
                          <img src={editImagePreview} alt="Product preview" className="image-preview" />
                          <button type="button" className="remove-image-btn" onClick={() => {
                            setEditImage(null); setEditImagePreview(null);
                            const fileInput = document.getElementById('edit-image-input');
                            if (fileInput) fileInput.value = '';
                          }}>×</button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <UploadIcon />
                          <p>Click to upload new image</p>
                          <span className="upload-hint">JPG, PNG, WEBP (Max 5MB)</span>
                        </div>
                      )}
                      <input id="edit-image-input" type="file" accept="image/*" onChange={handleEditImageSelect} className="image-input" />
                    </div>
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" placeholder="e.g., Mocha Frappuccino" required value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select required value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})}>
                        <option value="coffee">☕ Coffee</option>
                        <option value="food">🍔 Food</option>
                        <option value="tea">🍵 Tea</option>
                        <option value="other">📦 Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₱) *</label>
                      <input type="number" placeholder="0.00" required min="0" step="0.01" value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea placeholder="Describe your product..." rows="4" required value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={editForm.is_available}
                        onChange={(e) => setEditForm({...editForm, is_available: e.target.checked})} />
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

                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => {
                      setIsEditing(false); setEditingProduct(null); setEditImage(null); setEditImagePreview(null);
                    }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                      {uploading ? 'Updating...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          ADD PRODUCT TAB
          ============================================ */}
      {activeTab === 'add-product' && (
        <div className="add-product-section">
          <div className="add-product-container">
            <h2>Add New Product</h2>
            
            {!storageInitialized ? (
              <div className="storage-loading">⏳ Initializing storage...</div>
            ) : !bucketExists && (
              <div className="storage-warning">
                <strong>⚠️ Storage bucket not found!</strong>
                <p style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>Please create it in Supabase dashboard:</p>
                <ol style={{marginTop: '0.5rem', fontSize: '0.9rem', paddingLeft: '1.5rem'}}>
                  <li>Go to Supabase Dashboard → Storage</li>
                  <li>Click "Create a new bucket"</li>
                  <li>Name: <strong>product-images</strong></li>
                  <li>Toggle "Public bucket" ON</li>
                  <li>Click "Create bucket"</li>
                  <li>Refresh this page</li>
                </ol>
                {storageError && (
                  <p style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#fca5a5'}}>Error: {storageError}</p>
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
                      onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select required value={uploadForm.type} onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}>
                        <option value="coffee">☕ Coffee</option>
                        <option value="food">🍔 Food</option>
                        <option value="tea">🍵 Tea</option>
                        <option value="other">📦 Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (₱) *</label>
                      <input type="number" placeholder="0.00" required min="0" step="0.01" value={uploadForm.price}
                        onChange={(e) => setUploadForm({...uploadForm, price: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea placeholder="Describe your product..." rows="4" required value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={uploadForm.is_available}
                        onChange={(e) => setUploadForm({...uploadForm, is_available: e.target.checked})} />
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

      {/* ============================================
          ANALYTICS TAB
          ============================================ */}
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
                  <p style={{color: '#94a3b8'}}>No sales data yet.</p>
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
              <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '-1rem'}}>
                Items for menu review or potential replacement.
              </p>
              <div className="product-rank-list worst">
                {analytics.worst.length === 0 ? (
                  <p style={{color: '#94a3b8'}}>No sales data yet.</p>
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

      {/* ============================================
          FEEDBACK TAB
          ============================================ */}
      {activeTab === 'feedback' && (
        <div className="feedback-section">
          <h2>Customer Reviews</h2>
          <div className="feedback-list">
            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <p>No reviews yet</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="feedback-card">
                  <div className="feedback-header">
                    <div className="customer-info">
                      <h4>{review.users?.name || 'Anonymous'}</h4>
                      <p>{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <div className="feedback-text">"{review.text}"</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================
          EMPLOYEES TAB
          ============================================ */}
      {activeTab === 'employees' && (
        <div className="employees-container">
          <div className="employees-grid">
            <div className="employee-form-panel">
              <h2><UserPlusIcon style={{marginRight: '0.5rem'}} /> Create Employee Account</h2>
              <form onSubmit={handleCreateEmployee}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Enter employee name" required value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="employee@example.com" required value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" placeholder="Min 6 characters" required minLength={6} value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})} />
                </div>

                {employeeError && <div className="error-message" style={{marginBottom: '1rem'}}>❌ {employeeError}</div>}
                {employeeSuccess && <div className="success-message" style={{marginBottom: '1rem'}}>✅ {employeeSuccess}</div>}

                <button type="submit" className="btn btn-primary btn-large" disabled={creatingEmployee} style={{width: '100%'}}>
                  {creatingEmployee ? '⏳ Creating...' : '➕ Create Employee Account'}
                </button>
              </form>
            </div>

            <div className="employee-list-panel">
              <div className="employee-list-header">
                <h2>
                  <UsersIcon />
                  Employee List
                  <span className="employee-count">{employees.length}</span>
                </h2>
                <button className="btn btn-secondary btn-sm" onClick={fetchEmployees} disabled={loadingEmployees}>
                  {loadingEmployees ? '⏳ Loading...' : '🔄 Refresh'}
                </button>
              </div>
              
              {employeesError && <div className="error-message" style={{marginBottom: '1rem'}}>❌ Error: {employeesError}</div>}
              
              {loadingEmployees ? (
                <p style={{color: '#94a3b8', textAlign: 'center', padding: '2rem'}}>⏳ Loading employees...</p>
              ) : employees.length === 0 ? (
                <div className="empty-state" style={{textAlign: 'center', padding: '3rem'}}>
                  <p style={{color: '#94a3b8'}}>No employees found.</p>
                  <p style={{fontSize: '0.8rem', color: '#64748b'}}>Create your first employee using the form on the left.</p>
                </div>
              ) : (
                <div className="employee-list">
                  {employees.map(emp => (
                    <div key={emp.id} className="employee-item">
                      <div className="employee-info">
                        <h4>{emp.name}</h4>
                        <p>{emp.email}</p>
                      </div>
                      <div className="employee-item-actions">
                        <span className="employee-role-badge">Employee</span>
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

      {/* ============================================
          CUSTOMERS TAB
          ============================================ */}
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

          {customersError && <div className="error-message" style={{marginBottom: '1rem'}}>❌ Error: {customersError}</div>}

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

      {/* ============================================
          PROFILE TAB
          ============================================ */}
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
                      <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})}
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
                        setIsEditingProfile(false); setProfile({...profile, name: user?.name || ''});
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

      {/* ============================================
          ORDER REVIEW MODAL
          ============================================ */}
      {reviewingOrder && (
        <div className="modal-overlay" onClick={() => setReviewingOrder(null)}>
          <div className="modal-content order-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header order-review-header">
              <div className="modal-title-with-icon">
                <ReceiptIcon />
                <div>
                  <h2>Order Review</h2>
                  <span className="modal-subtitle">#{reviewingOrder.order_number || reviewingOrder.id.slice(0, 8)}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setReviewingOrder(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className="order-review-body">
              <div className="review-column">
                <div className="review-block">
                  <h3 className="review-block-title">👤 Customer Information</h3>
                  <div className="review-info-grid">
                    <div className="review-info-row">
                      <span className="review-info-label">Name</span>
                      <span className="review-info-value">{reviewingOrder.users?.name || 'Guest'}</span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Email</span>
                      <span className="review-info-value">{reviewingOrder.users?.email || '—'}</span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Customer ID</span>
                      <span className="review-info-value mono">{reviewingOrder.customer_id?.slice(0, 8) || '—'}...</span>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <h3 className="review-block-title">📋 Order Information</h3>
                  <div className="review-info-grid">
                    <div className="review-info-row">
                      <span className="review-info-label">Status</span>
                      <span className={`order-status-badge ${reviewingOrder.status}`}>{reviewingOrder.status.toUpperCase()}</span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Order Type</span>
                      <span className="review-info-value">
                        {reviewingOrder.order_type === 'takeout' ? '📦 Takeout' : '🍽️ Dine In'}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Placed On</span>
                      <span className="review-info-value">
                        {new Date(reviewingOrder.created_at).toLocaleString('en-PH', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Total</span>
                      <span className="review-info-value highlight">₱{Number(reviewingOrder.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <h3 className="review-block-title">💳 Payment Information</h3>
                  <div className="review-info-grid">
                    <div className="review-info-row">
                      <span className="review-info-label">Method</span>
                      <span className={`payment-method-badge ${reviewingOrder.payment_method || 'gcash'}`}>
                        {reviewingOrder.payment_method === 'paymaya' ? '💚 PayMaya' : '💙 GCash'}
                      </span>
                    </div>
                    <div className="review-info-row">
                      <span className="review-info-label">Payment Status</span>
                      <span className={`payment-status-badge ${getPaymentStatusInfo(reviewingOrder.payment_status).className}`}>
                        {getPaymentStatusInfo(reviewingOrder.payment_status).label}
                      </span>
                    </div>
                  </div>

                  <div className="payment-status-buttons">
                    <button
                      className={`payment-status-btn ${reviewingOrder.payment_status === 'valid' ? 'active' : ''}`}
                      onClick={() => handleUpdatePaymentStatus(reviewingOrder.id, 'valid')}
                    >
                      ✅ Valid
                    </button>
                    <button
                      className={`payment-status-btn ${reviewingOrder.payment_status === 'underpayment' ? 'active' : ''}`}
                      onClick={() => handleUpdatePaymentStatus(reviewingOrder.id, 'underpayment')}
                    >
                      ⚠️ Underpaid
                    </button>
                    <button
                      className={`payment-status-btn ${reviewingOrder.payment_status === 'overpayment' ? 'active' : ''}`}
                      onClick={() => handleUpdatePaymentStatus(reviewingOrder.id, 'overpayment')}
                    >
                      ⚠️ Overpaid
                    </button>
                  </div>
                </div>
              </div>

              <div className="review-column">
                <div className="review-block">
                  <h3 className="review-block-title">🛍️ Order Items</h3>
                  <div className="review-items-table">
                    <div className="review-items-header">
                      <span>Item</span>
                      <span>Qty</span>
                      <span>Price</span>
                      <span>Subtotal</span>
                    </div>
                    {reviewingOrder.order_items?.map((item, idx) => (
                      <div key={idx} className="review-items-row">
                        <span className="review-item-name">{item.menu_items?.name || 'Item'}</span>
                        <span className="review-item-qty">×{item.quantity}</span>
                        <span className="review-item-price">₱{Number(item.price_at_time).toFixed(2)}</span>
                        <span className="review-item-subtotal">
                          ₱{(Number(item.price_at_time) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="review-items-total">
                      <span></span>
                      <span></span>
                      <span>Total</span>
                      <span>₱{Number(reviewingOrder.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <h3 className="review-block-title">📸 Payment Proof</h3>
                  {reviewingOrder.proof_image_url ? (
                    <div className="review-proof-container">
                      <img
                        src={reviewingOrder.proof_image_url}
                        alt="Payment proof"
                        className="review-proof-image"
                        onClick={() => setViewingReceipt(reviewingOrder.proof_image_url)}
                      />
                      <p className="review-proof-hint">Click the image to view full size</p>
                    </div>
                  ) : (
                    <div className="review-proof-placeholder">
                      <span className="placeholder-icon">📷</span>
                      <p>No payment proof uploaded</p>
                    </div>
                  )}
                </div>

                <div className="review-block review-actions-block">
                  <h3 className="review-block-title">⚡ Order Actions</h3>

                  {reviewingOrder.status === 'pending' && (
                    <div className="review-actions-row">
                      {reviewingOrder.payment_status !== 'valid' && (
                        <div className="action-warning">
                          <span className="warning-icon">⚠️</span>
                          <p>Payment must be verified as <strong>Valid</strong> before you can start preparing this order.</p>
                        </div>
                      )}

                      <button
                        className="btn btn-primary btn-large"
                        disabled={reviewingOrder.payment_status !== 'valid'}
                        onClick={() => updateOrderStatus(reviewingOrder.id, 'preparing')}
                      >
                        📦 Start Preparing
                      </button>

                      <button
                        className="btn btn-danger btn-large decline-order-btn"
                        onClick={() => updateOrderStatus(reviewingOrder.id, 'declined')}
                      >
                        🚫 Decline Order
                      </button>
                    </div>
                  )}

                  {reviewingOrder.status === 'preparing' && (
                    <div className="review-actions-row">
                      <div className="action-info">
                        <span className="info-icon">📦</span>
                        <p>This order is currently being prepared.</p>
                      </div>
                      <button className="btn btn-success btn-large" onClick={() => updateOrderStatus(reviewingOrder.id, 'completed')}>
                        ✅ Mark as Completed
                      </button>
                    </div>
                  )}

                  {reviewingOrder.status === 'completed' && (
                    <div className="review-status-message success">
                      <span>✅</span>
                      <p>This order has been completed.</p>
                    </div>
                  )}

                  {reviewingOrder.status === 'cancelled' && (
                    <div className="review-status-message error">
                      <span>❌</span>
                      <p>This order was cancelled by the customer.</p>
                    </div>
                  )}

                  {reviewingOrder.status === 'declined' && (
                    <div className="review-status-message error">
                      <span>🚫</span>
                      <p>This order was declined.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="receipt-viewer-overlay" onClick={() => setViewingReceipt(null)}>
          <div className="receipt-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="receipt-viewer-close" onClick={() => setViewingReceipt(null)}>×</button>
            <h3 className="receipt-viewer-title">Payment Proof</h3>
            <img src={viewingReceipt} alt="Payment proof" className="receipt-viewer-image" />
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

export default OwnerDashboard;
