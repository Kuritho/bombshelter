import React, { useState } from 'react';
import './CustomerDashboard.css';

// Mock Data for the store
const MENU_ITEMS = [
  {
    id: 1,
    name: 'Caramel Macchiato',
    type: 'coffee',
    price: 150,
    description: 'Freshly brewed espresso with vanilla-flavored syrup, milk, and caramel drizzle.',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    name: 'Iced Americano',
    type: 'coffee',
    price: 120,
    description: 'Espresso shots topped with cold water produce a light layer of crema, then served over ice.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64db4a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    name: 'Matcha Latte',
    type: 'coffee',
    price: 160,
    description: 'Smooth and creamy matcha sweetened just right and served with steamed milk.',
    image: 'https://images.unsplash.com/photo-1536514072410-5019a3c69182?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    name: 'Avocado Toast',
    type: 'food',
    price: 180,
    description: 'Thick-cut artisanal bread topped with smashed avocado, cherry tomatoes, and a sprinkle of feta cheese.',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 5,
    name: 'Blueberry Muffin',
    type: 'food',
    price: 90,
    description: 'Soft and fluffy muffin bursting with fresh blueberries and topped with a streusel crumb.',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600'
  }
];

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

function CustomerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('menu'); // menu, cart, orders
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [gcashProof, setGcashProof] = useState(null);
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, text: '' });

  // Add to cart
  const addToCart = (item) => {
    const existing = cart.find(cartItem => cartItem.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.qty, 0);

  const handleCheckout = () => {
    if (!gcashProof) {
      alert("Please upload your GCash payment proof to proceed.");
      return;
    }
    
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: cartTotal,
      status: 'Processing', // Typically it goes from Processing -> Completed
      review: null // Will hold the review later
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setGcashProof(null);
    setActiveTab('orders');
  };

  const submitReview = (orderId) => {
    if (!reviewForm.text.trim()) {
      alert("Please write a recommendation/review.");
      return;
    }
    
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          review: { rating: reviewForm.rating, text: reviewForm.text }
        };
      }
      return order;
    }));
    
    setReviewForm({ orderId: null, rating: 5, text: '' });
  };

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <h1>Bombshelter</h1>
        <div className="user-controls">
          <span className="welcome-text">Hi, {user?.name || 'Guest'}</span>
          <button className="logout-btn" onClick={onLogout}>
            <LogOutIcon /> Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
        <button 
          className={`nav-tab ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          <ShoppingCartIcon />
          Cart
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </button>
        <button 
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          My Orders & Reviews
        </button>
      </nav>

      {/* MENU VIEW */}
      {activeTab === 'menu' && (
        <div className="menu-grid">
          {MENU_ITEMS.map(item => (
            <div key={item.id} className="menu-item-card">
              <img src={item.image} alt={item.name} className="item-image" />
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
      )}

      {/* CART VIEW */}
      {activeTab === 'cart' && (
        <div className="cart-container">
          <div className="cart-items">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <p>Your cart is empty. Browse the menu to add items!</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p>₱{item.price} x {item.qty}</p>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <span>₱{item.price * item.qty}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="checkout-panel">
            <h2>Order Summary</h2>
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

            {cart.length > 0 && (
              <div className="gcash-upload">
                <label>Upload GCash Payment Proof</label>
                <p style={{fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem'}}>
                  Send exactly ₱{cartTotal + 50} to 09123456789 and upload the screenshot.
                </p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="file-input"
                  onChange={(e) => setGcashProof(e.target.files[0])}
                />
              </div>
            )}

            <button 
              className="checkout-btn" 
              disabled={cart.length === 0 || !gcashProof}
              onClick={handleCheckout}
            >
              Place Order
            </button>
          </div>
        </div>
      )}

      {/* ORDERS & REVIEWS VIEW */}
      {activeTab === 'orders' && (
        <div className="orders-list">
          <h2>Order History</h2>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">{order.id}</span>
                    <span className="order-date"> • {order.date}</span>
                  </div>
                  <span className="order-status">{order.status}</span>
                </div>
                
                <div className="order-items-summary">
                  {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                  <div style={{marginTop: '0.5rem', fontWeight: 'bold', color: '#f8fafc'}}>
                    Total: ₱{order.total + 50} (incl. delivery)
                  </div>
                </div>

                {/* Reviews Section */}
                {!order.review && reviewForm.orderId !== order.id ? (
                  <button 
                    className="add-to-cart-btn" 
                    style={{marginTop: '1rem', width: 'auto', alignSelf: 'flex-start'}}
                    onClick={() => setReviewForm({ orderId: order.id, rating: 5, text: '' })}
                  >
                    Write a Review
                  </button>
                ) : !order.review && reviewForm.orderId === order.id ? (
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
                    <div style={{fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right', marginTop: '0.25rem', marginBottom: '1rem'}}>
                      {reviewForm.text.length} / 300 characters
                    </div>
                    <div style={{display: 'flex', gap: '1rem'}}>
                      <button className="submit-review-btn" onClick={() => submitReview(order.id)}>
                        Submit Review
                      </button>
                      <button 
                        className="submit-review-btn" 
                        style={{background: 'transparent', border: '1px solid #475569'}}
                        onClick={() => setReviewForm({orderId: null, rating: 5, text: ''})}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="review-display">
                    <div className="stars">
                      {'★'.repeat(order.review.rating)}{'☆'.repeat(5 - order.review.rating)}
                    </div>
                    <div className="text">"{order.review.text}"</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
