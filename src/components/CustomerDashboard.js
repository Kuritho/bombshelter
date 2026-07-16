import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useMenuItems, useOrders } from '../hooks/useSupabase';
import './CustomerDashboard.css';

// Icons
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

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
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

function CustomerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);
  const [gcashProof, setGcashProof] = useState(null);
  const [gcashProofPreview, setGcashProofPreview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, text: '' });
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartNotification, setCartNotification] = useState(null);
  
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
  
  const { items: menuItems, loading: menuLoading } = useMenuItems();
  const { orders, createOrder, refresh: refreshOrders } = useOrders(user?.id);

  // Handle Gcash proof file selection
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
      reader.onloadend = () => {
        setGcashProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add to cart with notification
  const addToCart = (item) => {
    setError(null);
    const existing = cart.find(cartItem => cartItem.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      setCartNotification(`Added another ${item.name} to cart`);
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
      setCartNotification(`${item.name} added to cart`);
    }
    
    setTimeout(() => setCartNotification(null), 2500);
  };

  const removeFromCart = (id) => {
    setError(null);
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.qty, 0);

  // Upload image to storage
  const uploadProofImage = async (file) => {
    try {
      console.log('📤 Uploading proof image...');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `proofs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error('Failed to upload proof image: ' + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('✅ Proof uploaded:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading proof:', error);
      throw error;
    }
  };

  const handleCheckout = async () => {
    if (!gcashProof) {
      alert("Please upload your GCash payment proof to proceed.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setError(null);
    setOrderLoading(true);

    try {
      console.log('🛒 Starting checkout process...');
      
      let proofImageUrl = null;
      try {
        proofImageUrl = await uploadProofImage(gcashProof);
        console.log('✅ Proof image uploaded:', proofImageUrl);
      } catch (uploadError) {
        console.error('❌ Failed to upload proof:', uploadError);
        alert('Failed to upload payment proof. Please try again.');
        setOrderLoading(false);
        return;
      }

      const orderData = {
        customer_id: user.id,
        status: 'pending',
        payment_status: 'unverified',
        total_amount: cartTotal + 50,
        delivery_fee: 50,
        proof_image_url: proofImageUrl
      };

      console.log('📦 Creating order with data:', orderData);
      
      let newOrder;
      try {
        newOrder = await createOrder(orderData);
        console.log('✅ Order created:', newOrder);
      } catch (orderError) {
        console.error('❌ Failed to create order:', orderError);
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
        console.error('❌ Failed to create order items:', itemsError);
        alert('Failed to save order items. Please contact support.');
        setOrderLoading(false);
        return;
      }

      setCart([]);
      setGcashProof(null);
      setGcashProofPreview(null);
      await refreshOrders();
      setActiveTab('orders');
      
      alert(`✅ Order placed successfully! Order #: ${newOrder.order_number || newOrder.id.slice(0, 8)}`);
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
      alert('❌ Failed to place order: ' + (error.message || 'Please try again.'));
    } finally {
      setOrderLoading(false);
    }
  };

  const submitReview = async (orderId) => {
    if (!reviewForm.text.trim()) {
      alert("Please write a recommendation/review.");
      return;
    }

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
      
      alert('✅ Review submitted successfully!');
    } catch (error) {
      console.error('❌ Review error:', error);
      alert('❌ Failed to submit review: ' + error.message);
    }
  };

  // Profile Update Functions
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // Update user profile in the users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: profile.name })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileSuccess('✅ Profile updated successfully!');
      setIsEditingProfile(false);
      
      // Update the user object
      user.name = profile.name;
      
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setProfileError('New passwords do not match');
      setProfileLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setProfileError('New password must be at least 6 characters');
      setProfileLoading(false);
      return;
    }

    try {
      // Update password using Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (passwordError) throw passwordError;

      setProfileSuccess('✅ Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error('Password update error:', err);
      setProfileError(err.message || 'Failed to update password');
    } finally {
      setProfileLoading(false);
    }
  };

  if (menuLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading delicious menu...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* Floating Notification */}
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
            <span className="logo-icon">🍽️</span>
            <div className="brand-text">
              <h1>Bombshelter</h1>
              <span className="brand-subtitle">Ordering System</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.name || 'Guest'}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
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
          <MenuIcon />
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

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">❌</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* MENU VIEW */}
      {activeTab === 'menu' && (
        <div className="menu-view">
          <div className="menu-header-section">
            <h2>Our Menu</h2>
            <p className="menu-subtitle">Choose from our delicious selection</p>
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

      {/* CART VIEW */}
      {activeTab === 'cart' && (
        <div className="cart-view">
          <div className="cart-container">
            <div className="cart-items-section">
              <h2>Your Cart</h2>
              {cart.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>Browse our menu and add your favorites!</p>
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
                          <p className="cart-item-price">₱{item.price} × {item.qty}</p>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <span className="cart-item-total">₱{item.price * item.qty}</span>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
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
                <div className="checkout-summary">
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>₱{cartTotal}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Delivery Fee</span>
                    <span>₱50</span>
                  </div>
                  <div className="checkout-total">
                    <span>Total</span>
                    <span>₱{cartTotal > 0 ? cartTotal + 50 : 0}</span>
                  </div>
                </div>

                <div className="gcash-upload">
                  <label>GCash Payment Proof</label>
                  <p className="gcash-instructions">
                    Send exactly <strong>₱{cartTotal + 50}</strong> to <strong>0912 345 6789</strong> and upload the screenshot
                  </p>
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
                      <span className="file-upload-label">Click to upload</span>
                    </div>
                  )}
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDERS & REVIEWS VIEW */}
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
              <p>Start ordering your favorite food!</p>
              <button className="browse-menu-btn" onClick={() => setActiveTab('menu')}>
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-id">#{order.order_number || order.id.slice(0, 8)}</span>
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className={`order-status ${order.status}`}>
                      {order.status === 'pending' && '⏳ Pending'}
                      {order.status === 'processing' && '🔄 Processing'}
                      {order.status === 'completed' && '✅ Completed'}
                      {order.status === 'cancelled' && '❌ Cancelled'}
                    </span>
                  </div>
                  
                  <div className="order-items-summary">
                    {order.order_items?.map((item, idx) => (
                      <span key={idx} className="order-item-tag">
                        {item.quantity}x {item.menu_items?.name || 'Item'}
                      </span>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total">Total: ₱{order.total_amount}</span>
                    <span className="order-payment">{order.payment_status || 'Unverified'}</span>
                  </div>

                  {/* Review Section */}
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
                        placeholder="Would you recommend this? Share your thoughts..."
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="profile-view">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                <span className="avatar-icon">👤</span>
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
              {/* Profile Information */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>
                    <span className="card-icon">📝</span>
                    Profile Information
                  </h3>
                  {!isEditingProfile && (
                    <button 
                      className="edit-profile-btn"
                      onClick={() => setIsEditingProfile(true)}
                    >
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
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="disabled-input"
                      />
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
                      <button 
                        type="submit" 
                        className="btn-save"
                        disabled={profileLoading}
                      >
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
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>
                    <span className="card-icon">🔒</span>
                    Change Password
                  </h3>
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
                  <button 
                    type="submit" 
                    className="btn-save-password"
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;