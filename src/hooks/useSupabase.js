// src/hooks/useSupabase.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// ============================================
// MENU ITEMS HOOK
// ============================================
export const useMenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchMenuItems(); }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select(`*, category:categories(id, slug, name, icon, color, display_order)`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const { data: ratingsData } = await supabase.from('product_ratings').select('*');
      const ratingMap = {};
      (ratingsData || []).forEach(r => {
        ratingMap[r.menu_item_id] = { avg: Number(r.avg_rating), count: r.review_count };
      });

      const merged = (data || []).map(item => ({
        ...item,
        avg_rating: ratingMap[item.id]?.avg || 0,
        review_count: ratingMap[item.id]?.count || 0
      }));
      setItems(merged);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err.message);
    } finally { setLoading(false); }
  };

  const addMenuItem = async (item) => {
    const { data, error } = await supabase
      .from('menu_items').insert([item])
      .select(`*, category:categories(id, slug, name, icon, color, display_order)`).single();
    if (error) throw error;
    const withRating = { ...data, avg_rating: 0, review_count: 0 };
    setItems([withRating, ...items]);
    return withRating;
  };

  const updateMenuItem = async (id, updates) => {
    const { data, error } = await supabase
      .from('menu_items').update(updates).eq('id', id)
      .select(`*, category:categories(id, slug, name, icon, color, display_order)`).single();
    if (error) throw error;
    setItems(items.map(item => item.id === id
      ? { ...data, avg_rating: item.avg_rating || 0, review_count: item.review_count || 0 }
      : item));
    return data;
  };

  const deleteMenuItem = async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    setItems(items.filter(item => item.id !== id));
    return true;
  };

  return { items, loading, error, addMenuItem, updateMenuItem, deleteMenuItem, refetch: fetchMenuItems };
};

// ============================================
// CATEGORIES HOOK
// ============================================
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('categories').select('*')
        .eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally { setLoading(false); }
  };

  const addCategory = async (category) => {
    const { data, error } = await supabase.from('categories').insert([category]).select().single();
    if (error) throw error;
    setCategories([...categories, data].sort((a, b) => a.display_order - b.display_order));
    return data;
  };

  const updateCategory = async (id, updates) => {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setCategories(categories.map(c => c.id === id ? data : c).sort((a, b) => a.display_order - b.display_order));
    return data;
  };

  const deleteCategory = async (id) => {
    const { count } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('category_id', id);
    if (count > 0) throw new Error(`Cannot delete: ${count} menu item(s) still use this category.`);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setCategories(categories.filter(c => c.id !== id));
    return true;
  };

  return { categories, loading, error, addCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};

// ============================================
// BEST SELLERS
// ============================================
export const useBestSellers = (limit = 6) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBestSellers(); }, [limit]);

  const fetchBestSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('best_selling_products').select('*')
        .gt('total_sold', 0).eq('is_available', true)
        .order('best_score', { ascending: false })
        .order('total_sold', { ascending: false })
        .limit(limit);
      if (error) throw error;
      setItems(data || []);
    } catch (err) { console.error('Error fetching best sellers:', err); }
    finally { setLoading(false); }
  };

  return { items, loading, refetch: fetchBestSellers };
};

// ============================================
// PRODUCT RATINGS
// ============================================
export const useProductRatings = () => {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRatings(); }, []);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase.from('product_ratings').select('*');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.menu_item_id] = { avg: Number(r.avg_rating), count: r.review_count }; });
      setRatings(map);
    } catch (err) { console.error('Error fetching product ratings:', err); }
    finally { setLoading(false); }
  };

  return { ratings, loading, refetch: fetchRatings };
};

// ============================================
// ORDERS HOOK — FIXED for multiple user relationships
// ============================================
export const useOrders = (customerId = null) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchOrders(); }, [customerId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📡 fetchOrders — customerId:', customerId);

      let ordersQuery = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (customerId) ordersQuery = ordersQuery.eq('customer_id', customerId);

      const { data: ordersData, error: ordersErr } = await ordersQuery;
      if (ordersErr) throw ordersErr;

      if (!ordersData || ordersData.length === 0) { setOrders([]); return; }

      const orderIds = ordersData.map(o => o.id);
      const customerIds = [...new Set(ordersData.map(o => o.customer_id).filter(Boolean))];
      const driverIds = [...new Set(ordersData.map(o => o.driver_id).filter(Boolean))];
      const allUserIds = [...new Set([...customerIds, ...driverIds])];

      let itemsData = [];
      try {
        const { data, error } = await supabase.from('order_items').select('*').in('order_id', orderIds);
        if (!error) itemsData = data || [];
      } catch (err) { console.warn('order_items:', err); }

      const menuItemIds = [...new Set(itemsData.map(i => i.menu_item_id).filter(Boolean))];
      let menuData = [];
      if (menuItemIds.length > 0) {
        try {
          const { data, error } = await supabase.from('menu_items').select('*').in('id', menuItemIds);
          if (!error) menuData = data || [];
        } catch (err) { console.warn('menu_items:', err); }
      }

      const itemsWithMenu = itemsData.map(item => ({
        ...item,
        menu_items: menuData.find(m => m.id === item.menu_item_id) || null
      }));

      let usersData = [];
      if (allUserIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('users').select('id, name, email, phone').in('id', allUserIds);
          if (!error) usersData = data || [];
        } catch (err) { console.warn('users:', err); }
      }

      let reviewsData = [];
      try {
        const { data, error } = await supabase.from('reviews').select('*').in('order_id', orderIds);
        if (!error) reviewsData = data || [];
      } catch (err) { console.warn('reviews:', err); }

      const merged = ordersData.map(order => ({
        ...order,
        users: usersData.find(u => u.id === order.customer_id) || null,
        driver: usersData.find(u => u.id === order.driver_id) || null,
        order_items: itemsWithMenu.filter(i => i.order_id === order.id),
        reviews: reviewsData.find(r => r.order_id === order.id) || null
      }));

      console.log('✅ merged orders:', merged.length);
      setOrders(merged);
    } catch (err) {
      console.error('❌ fetchOrders error:', err);
      setError(err.message);
    } finally { setLoading(false); }
  };

  const createOrder = async (orderData) => {
    const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
    if (error) throw error;
    return data;
  };

  const updateOrderStatus = async (orderId, status) => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
    if (error) throw error;
    await fetchOrders();
    return data;
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    const { data, error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId).select().single();
    if (error) throw error;
    await fetchOrders();
    return data;
  };

  return { orders, loading, error, createOrder, updateOrderStatus, updatePaymentStatus, refresh: fetchOrders };
};

// ============================================
// REVIEWS HOOK
// ============================================
export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('reviews').select(`*, users (name, email)`).order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (err) { console.error('Error fetching reviews:', err); setError(err.message); }
    finally { setLoading(false); }
  };

  const addReview = async (reviewData) => {
    const { data, error } = await supabase.from('reviews').insert([reviewData]).select().single();
    if (error) throw error;
    setReviews([data, ...reviews]);
    return data;
  };

  return { reviews, loading, error, addReview, refresh: fetchReviews };
};

// ============================================
// REVIEWS WITH PRODUCTS
// ============================================
export const useReviewsWithProducts = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase.from('reviews_with_products').select('*');
      if (error) throw error;
      setReviews(data || []);
    } catch (err) { console.error('Error fetching reviews with products:', err); }
    finally { setLoading(false); }
  };

  return { reviews, loading, refetch: fetchReviews };
};

// ============================================
// EMPLOYEES HOOK
// ============================================
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*').eq('role', 'employee').order('created_at', { ascending: false });
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) { console.error('Error in fetchEmployees:', err); setError(err.message); setEmployees([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const createEmployee = async (employeeData) => {
    const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
    const SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');

    if (typeof window.__lockUser === 'function') window.__lockUser();

    try {
      const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({ email: employeeData.email, password: employeeData.password, email_confirm: true, user_metadata: { name: employeeData.name, role: 'employee' } })
      });
      const authJson = await authRes.json();
      if (!authRes.ok) throw new Error(authJson.msg || authJson.message || 'Failed to create auth user');

      const newUserId = authJson.id;
      await new Promise(resolve => setTimeout(resolve, 800));

      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${newUserId}&select=id`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
      });
      const existing = await checkRes.json();
      const alreadyExists = Array.isArray(existing) && existing.length > 0;

      if (alreadyExists) {
        await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${newUserId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'return=representation' },
          body: JSON.stringify({ name: employeeData.name, email: employeeData.email, role: 'employee' })
        });
      } else {
        const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify([{ id: newUserId, email: employeeData.email, name: employeeData.name, role: 'employee' }])
        });
        if (!profileRes.ok) throw new Error('Auth user created but failed to create profile row.');
      }

      await fetchEmployees();
      return { id: newUserId, email: employeeData.email, name: employeeData.name, role: 'employee' };
    } catch (err) { console.error('Error creating employee:', err); throw err; }
    finally { setTimeout(() => { if (typeof window.__unlockUser === 'function') window.__unlockUser(); }, 2000); }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
      const SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
      if (SUPABASE_URL && SERVICE_KEY) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${employeeId}`, {
            method: 'DELETE', headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
          });
        } catch (e) { console.warn('Auth delete exception:', e?.message); }
      }
      const { error } = await supabase.from('users').delete().eq('id', employeeId);
      if (error) throw error;
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      return true;
    } catch (err) { console.error('Error deleting employee:', err); throw err; }
  };

  return { employees, loading, error, createEmployee, deleteEmployee, refetch: fetchEmployees };
};

// ============================================
// CUSTOMERS HOOK
// ============================================
export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data: usersData, error: usersError } = await supabase.from('users').select('*').eq('role', 'customer').order('created_at', { ascending: false });
      if (usersError) throw usersError;

      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('customer_id, total_amount, status');
      if (ordersError) throw ordersError;

      const customersWithStats = (usersData || []).map(customer => {
        const customerOrders = (ordersData || []).filter(o => o.customer_id === customer.id);
        const completedOrders = customerOrders.filter(o => o.status === 'completed');
        const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        return { ...customer, total_orders: customerOrders.length, completed_orders: completedOrders.length, total_spent: totalSpent };
      });

      setCustomers(customersWithStats);
    } catch (err) { console.error('Error in fetchCustomers:', err); setError(err.message); setCustomers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const deleteCustomer = async (customerId) => {
    const { error } = await supabase.from('users').delete().eq('id', customerId);
    if (error) throw error;
    setCustomers(customers.filter(c => c.id !== customerId));
    return true;
  };

  return { customers, loading, error, deleteCustomer, refetch: fetchCustomers };
};
