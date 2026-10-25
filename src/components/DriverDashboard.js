// src/components/DriverDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createWorker } from 'tesseract.js';
import './DriverDashboard.css';

import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

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

const LogOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const MapPinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const TruckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);

export default function DriverDashboard({ user, onLogout }) {
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const watchIdRef = useRef(null);
  const workerRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, customer:users!orders_customer_id_fkey(name, phone)`)
        .in('status', ['preparing', 'out_for_delivery'])
        .order('created_at', { ascending: true });
      if (error) { setFetchError(error.message); setAssignedOrders([]); return; }
      const relevantOrders = (data || []).filter(o => o.driver_id === user.id || (!o.driver_id && o.status === 'preparing'));
      setAssignedOrders(relevantOrders);
      setFetchError(null);
      if (selectedOrder) {
        const updated = (data || []).find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
        else setSelectedOrder(null);
      }
    } catch (err) { setFetchError(err.message); setAssignedOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchOrders();
    const sub = supabase.channel('driver-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => sub.unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    if (isBroadcasting && selectedOrder) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setMyLocation([latitude, longitude]);
            supabase.from('orders').update({ driver_current_lat: latitude, driver_current_lng: longitude, driver_last_ping: new Date().toISOString() }).eq('id', selectedOrder.id).then();
          },
          (err) => console.error('GPS Error:', err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    } else {
      if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    }
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [isBroadcasting, selectedOrder]);

  useEffect(() => () => { if (workerRef.current) { try { workerRef.current.terminate(); } catch (e) {} } }, []);

  const handleTakeOrder = async () => { if (!selectedOrder) return; try { await supabase.from('orders').update({ driver_id: user.id }).eq('id', selectedOrder.id); fetchOrders(); alert('Order claimed!'); } catch (err) { alert(err.message); } };
  const handleStartDelivery = async () => { if (!selectedOrder) return; try { await supabase.from('orders').update({ status: 'out_for_delivery' }).eq('id', selectedOrder.id); setSelectedOrder({ ...selectedOrder, status: 'out_for_delivery' }); setIsBroadcasting(true); fetchOrders(); } catch (err) { alert(err.message); } };

  const handleScanProof = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setIsScanning(true); setScanError('');
    try {
      const fileName = `proof-${selectedOrder.id}-${Date.now()}.jpg`;
      await supabase.storage.from('payment-proofs').upload(fileName, file);
      const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
      if (!workerRef.current) workerRef.current = await createWorker('eng');
      const { data: { text } } = await workerRef.current.recognize(file);
      const cleanText = text.replace(/\s+/g, '').toUpperCase();
      const expectedOtp = selectedOrder.delivery_otp?.replace(/\s+/g, '').toUpperCase() || '';
      if (expectedOtp && cleanText.includes(expectedOtp)) {
        await supabase.from('orders').update({ status: 'completed', delivery_proof_url: urlData.publicUrl, driver_current_lat: null, driver_current_lng: null }).eq('id', selectedOrder.id);
        alert('✅ Delivery Verified!'); setIsBroadcasting(false); setSelectedOrder(null); fetchOrders();
      } else setScanError(`Could not find OTP (${expectedOtp}).`);
    } catch (err) { setScanError('Error: ' + err.message); }
    finally { setIsScanning(false); e.target.value = ''; }
  };

  const handleManualOtp = async () => {
    if (otpInput.trim().toUpperCase() === selectedOrder.delivery_otp?.toUpperCase()) {
      await supabase.from('orders').update({ status: 'completed', driver_current_lat: null, driver_current_lng: null }).eq('id', selectedOrder.id);
      alert('✅ Completed!'); setIsBroadcasting(false); setSelectedOrder(null); setOtpInput(''); fetchOrders();
    } else alert('❌ Invalid OTP.');
  };

  return (
    <div className="driver-dashboard">
      <header className="driver-header">
        <h1>🛵 Driver Portal</h1>
        <div className="driver-header-right">
          {isBroadcasting && <span className="live-badge">🔴 LIVE TRACKING ON</span>}
          <button onClick={onLogout} className="driver-logout-btn"><LogOutIcon /> Logout</button>
        </div>
      </header>

      <div className="driver-layout">
        <aside className="driver-sidebar">
          <h2>Available Deliveries</h2>
          {fetchError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.5rem' }}><p style={{ color: '#f87171', fontSize: '0.75rem', margin: 0 }}>⚠️ {fetchError}</p></div>}
          {loading ? <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading...</p> : assignedOrders.length === 0 ? (<div style={{ padding: '1rem', background: 'rgba(148,163,184,0.1)', borderRadius: '8px' }}><p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No active orders assigned to you.</p></div>) : null}
          <div className="driver-order-list">
            {assignedOrders.map(order => (
              <div key={order.id} className={`driver-order-card ${selectedOrder?.id === order.id ? 'active' : ''}`} onClick={() => setSelectedOrder(order)}>
                <div className="card-top"><span>#{order.order_number || order.id.slice(0,6)}</span><span className={`status-badge ${order.status}`}>{order.status.replace('_', ' ')}</span></div>
                <h3>{order.customer?.name || order.walk_in_name || 'Customer'}</h3>
                <p>📍 {order.delivery_address}</p>
                {order.customer_notes && <p style={{ color: '#fbbf24', fontSize: '0.75rem', marginTop: '0.25rem' }}>📝 Has note</p>}
                {!order.driver_id && <span className="unassigned-tag">Unassigned</span>}
              </div>
            ))}
          </div>
        </aside>

        <main className="driver-main">
          {selectedOrder ? (
            <div className="driver-content-wrapper">
              <div className="map-section" style={{ height: '400px', position: 'relative' }}>
                <MapContainer center={myLocation || [selectedOrder.delivery_lat || 14.5995, selectedOrder.delivery_lng || 120.9842]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url={`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4u2t_1_6d36abd6af95022b69bfc947`} />
                  <Marker position={[selectedOrder.delivery_lat, selectedOrder.delivery_lng]} icon={customerIcon}><Popup>Customer</Popup></Marker>
                  {myLocation && <Marker position={myLocation} icon={driverIcon}><Popup>You</Popup></Marker>}
                  {myLocation && <Polyline positions={[myLocation, [selectedOrder.delivery_lat, selectedOrder.delivery_lng]]} color="#3b82f6" dashArray="5, 10" />}
                </MapContainer>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.delivery_lat},${selectedOrder.delivery_lng}`} target="_blank" rel="noopener noreferrer" className="btn-google-maps">🧭 Google Maps</a>
              </div>

              <div className="driver-action-panel">
                <div className="action-header">{selectedOrder.customer?.phone && (
  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>📞 Customer Phone</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', color: '#f8fafc', fontWeight: 600 }}>{selectedOrder.customer.phone}</p>
    </div>
    <a
      href={`tel:${selectedOrder.customer.phone}`}
      style={{
        background: '#10b981',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: 600
      }}
    >
      📞 Call
    </a>
  </div>
)}
                  <h2>Delivery Tasks</h2>
                  {selectedOrder.status === 'out_for_delivery' && <button className={`toggle-broadcast-btn ${isBroadcasting ? 'active' : ''}`} onClick={() => setIsBroadcasting(!isBroadcasting)}>{isBroadcasting ? 'Pause' : 'Resume'}</button>}
                </div>

                {/* CUSTOMER NOTES - visible to driver */}
                {selectedOrder.customer_notes && (
                  <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid #fbbf24', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#fcd34d', fontWeight: 'bold' }}>📝 Customer Note:</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#f8fafc' }}>{selectedOrder.customer_notes}</p>
                  </div>
                )}

                {!selectedOrder.driver_id ? <button className="btn-primary-full" onClick={handleTakeOrder}>✋ Claim Order</button> : selectedOrder.status === 'preparing' ? <button className="btn-primary-full" onClick={handleStartDelivery}>🚀 Start Delivery & Broadcast</button> : selectedOrder.status === 'out_for_delivery' ? (
                  <div className="verification-grid">
                    <div className="verify-box"><h4>📸 Scan Receipt</h4><input type="file" accept="image/*" capture="environment" onChange={handleScanProof} id="ocr-upload" hidden /><label htmlFor="ocr-upload" className="btn-upload">{isScanning ? 'Scanning...' : 'Take Photo'}</label>{scanError && <p className="error-text">{scanError}</p>}</div>
                    <div className="verify-box"><h4>⌨️ Manual OTP</h4><div className="otp-inputs"><input type="text" value={otpInput} onChange={(e) => setOtpInput(e.target.value.toUpperCase())} placeholder="DEL-XXXX" /><button onClick={handleManualOtp}>Verify</button></div></div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="empty-map-state"><h2>Select an order to view map</h2></div>
          )}
        </main>
      </div>
    </div>
  );
}