import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useMenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      setItems([data, ...items]);
      return data;
    } catch (err) {
      console.error('Error adding menu item:', err);
      throw err;
    }
  };

  const updateMenuItem = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setItems(items.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      console.error('Error updating menu item:', err);
      throw err;
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting menu item:', err);
      throw err;
    }
  };

  return { 
    items, 
    loading, 
    error, 
    addMenuItem, 
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems 
  };
};

export const useOrders = (customerId = null) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [customerId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          ),
          reviews (*)
        `)
        .order('created_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;
      await fetchOrders();
      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      setOrders(orders.map(order => order.id === orderId ? data : order));
      return data;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      setOrders(orders.map(order => order.id === orderId ? data : order));
      return data;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  return { 
    orders, 
    loading, 
    error, 
    createOrder, 
    updateOrderStatus, 
    updatePaymentStatus, 
    refresh: fetchOrders 
  };
};

export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;
      setReviews([data, ...reviews]);
      return data;
    } catch (err) {
      console.error('Error adding review:', err);
      throw err;
    }
  };

  return { reviews, loading, error, addReview, refresh: fetchReviews };
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching employees from Supabase...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'employee')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching employees:', error);
        throw error;
      }
      
      console.log('✅ Employees fetched:', data);
      setEmployees(data || []);
    } catch (err) {
      console.error('❌ Error in fetchEmployees:', err);
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const createEmployee = async (employeeData) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: employeeData.password,
        options: {
          data: {
            name: employeeData.name,
            role: 'employee'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!userData) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                email: employeeData.email,
                name: employeeData.name,
                role: 'employee'
              }
            ])
            .select()
            .maybeSingle();

          if (insertError) throw insertError;
          userData = newUser;
        }

        await fetchEmployees();
        return userData;
      }
    } catch (err) {
      console.error('Error creating employee:', err);
      throw err;
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;
      
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      return true;
    } catch (err) {
      console.error('Error deleting employee:', err);
      throw err;
    }
  };

  return { 
    employees, 
    loading, 
    error, 
    createEmployee,
    deleteEmployee,
    refetch: fetchEmployees 
  };
};