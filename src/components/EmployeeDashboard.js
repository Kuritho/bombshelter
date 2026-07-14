import React, { useState, useEffect } from 'react';
import './EmployeeDashboard.css';

const MOCK_ORDERS = [
  {
    id: 'ORD-1042',
    time: '10:45 AM',
    customer: 'Alice Smith',
    items: [
      { name: 'Caramel Macchiato', qty: 2, price: 150 },
      { name: 'Blueberry Muffin', qty: 1, price: 90 }
    ],
    total: 440, // (2*150 + 90) + 50 delivery
    status: 'pending',
    paymentStatus: 'unverified',
    proofImage: 'https://images.unsplash.com/photo-1610992015732-2449b0c26670?auto=format&fit=crop&q=80&w=600' // Mock receipt/proof
  },
  {
    id: 'ORD-1043',
    time: '11:10 AM',
    customer: 'Bob Johnson',
    items: [
      { name: 'Iced Americano', qty: 1, price: 120 },
      { name: 'Avocado Toast', qty: 1, price: 180 }
    ],
    total: 350,
    status: 'preparing',
    paymentStatus: 'valid',
    proofImage: 'https://images.unsplash.com/photo-1610992015732-2449b0c26670?auto=format&fit=crop&q=80&w=600'
  }
];

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

function EmployeeDashboard({ user, onLogout }) {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notification, setNotification] = useState(null);

  // Simulate receiving a new order via WebSocket/Polling
  const simulateNewOrder = () => {
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: 'New Customer',
      items: [{ name: 'Matcha Latte', qty: 1, price: 160 }],
      total: 210,
      status: 'pending',
      paymentStatus: 'unverified',
      proofImage: 'https://images.unsplash.com/photo-1610992015732-2449b0c26670?auto=format&fit=crop&q=80&w=600'
    };
    
    setOrders([newOrder, ...orders]);
    setNotification(`New Order Received: ${newId}`);
    
    // Auto-hide notification
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleUpdatePaymentStatus = (orderId, status) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: status });
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setSelectedOrder(null); // Close modal
  };

  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
      <div className="order-card-header">
        <span className="order-id">{order.id}</span>
        <span className="order-time">{order.time}</span>
      </div>
      <div className="customer-name">{order.customer}</div>
      <div className="order-items-preview">
        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
      </div>
      <div className={`payment-status-badge ${order.paymentStatus}`}>
        Payment: {order.paymentStatus}
      </div>
    </div>
  );

  return (
    <div className="employee-dashboard">
      {notification && (
        <div className="notification-toast">
          <BellIcon />
          <span>{notification}</span>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-title-area">
          <h1>Employee Portal</h1>
          <button className="simulate-btn" onClick={simulateNewOrder}>
            <BellIcon /> Simulate New Order
          </button>
          <button className="simulate-btn" style={{ background: '#f59e0b' }} onClick={() => {
            const pwd = prompt("Enter Owner Password:");
            if (pwd === 'admin123') {
              localStorage.setItem('userRole', 'owner');
              window.location.href = '/owner';
            } else if (pwd !== null) {
              alert("Incorrect Password!");
            }
          }}>
            Owner Dashboard
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: '#cbd5e1' }}>Hello, {user?.name || 'Staff'}</span>
          <button className="logout-btn" onClick={onLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            <LogOutIcon /> Logout
          </button>
        </div>
      </header>

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="column-header pending">
            Pending Orders <span className="order-count">{orders.filter(o => o.status === 'pending').length}</span>
          </div>
          {orders.filter(o => o.status === 'pending').map(renderOrderCard)}
        </div>

        <div className="kanban-column">
          <div className="column-header preparing">
            Preparing <span className="order-count">{orders.filter(o => o.status === 'preparing').length}</span>
          </div>
          {orders.filter(o => o.status === 'preparing').map(renderOrderCard)}
        </div>

        <div className="kanban-column">
          <div className="column-header completed">
            Completed <span className="order-count">{orders.filter(o => o.status === 'completed').length}</span>
          </div>
          {orders.filter(o => o.status === 'completed').map(renderOrderCard)}
        </div>

        <div className="kanban-column">
          <div className="column-header declined" style={{ borderBottomColor: '#ef4444' }}>
            Declined <span className="order-count">{orders.filter(o => o.status === 'declined').length}</span>
          </div>
          {orders.filter(o => o.status === 'declined').map(renderOrderCard)}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details: {selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            
            <div className="modal-body-left">
              <div className="detail-section">
                <h3>Customer Info</h3>
                <p style={{ color: 'white', margin: '0 0 1rem 0' }}>{selectedOrder.customer}</p>
                <p style={{ color: '#94a3b8', margin: 0 }}>Ordered at: {selectedOrder.time}</p>
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span style={{ color: '#cbd5e1' }}>{item.qty}x {item.name}</span>
                    <span style={{ color: 'white' }}>₱{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="item-row" style={{ borderBottom: 'none' }}>
                  <span style={{ color: '#94a3b8' }}>Delivery Fee</span>
                  <span style={{ color: 'white' }}>₱50</span>
                </div>
                <div className="total-row">
                  <span>Total</span>
                  <span style={{ color: '#f59e0b' }}>₱{selectedOrder.total}</span>
                </div>
              </div>

              <div className="detail-section" style={{ marginTop: '2rem' }}>
                <h3>Order Actions</h3>
                {selectedOrder.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      className="btn btn-primary"
                      disabled={selectedOrder.paymentStatus !== 'valid'}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'preparing')}
                    >
                      Start Preparing
                    </button>
                    <button 
                      className="btn"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to decline this order?")) {
                          handleUpdateOrderStatus(selectedOrder.id, 'declined');
                        }
                      }}
                      style={{ background: '#ef4444', color: 'white' }}
                    >
                      Decline Order
                    </button>
                  </div>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                  >
                    Mark as Completed
                  </button>
                )}
                {selectedOrder.status === 'completed' && (
                  <p style={{ color: '#10b981', fontWeight: 'bold' }}>✓ This order is completed.</p>
                )}
                {selectedOrder.status === 'declined' && (
                  <p style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ This order was declined.</p>
                )}
                
                {selectedOrder.status === 'pending' && selectedOrder.paymentStatus !== 'valid' && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Payment must be verified as Valid before preparing.
                  </p>
                )}
              </div>
            </div>

            <div className="modal-body-right">
              <div className="detail-section">
                <h3>Payment Verification</h3>
                <div style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                  Current Status: <span className={`payment-status-badge ${selectedOrder.paymentStatus}`}>{selectedOrder.paymentStatus}</span>
                </div>
                
                <img src={selectedOrder.proofImage} alt="Payment Proof" className="proof-image" />
                
                <div className="action-buttons">
                  <button className="btn btn-valid" onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'valid')}>Valid</button>
                  <button className="btn btn-under" onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'underpayment')}>Underpaid</button>
                  <button className="btn btn-over" onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'overpayment')}>Overpaid</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
