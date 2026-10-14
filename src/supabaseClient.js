// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Check .env file.');
}

// ============================================
// SAFE STORAGE ADAPTER
// ============================================
// 1. Tries localStorage first (normal behavior).
// 2. On QuotaExceededError: cleans orphaned Supabase keys and retries once.
// 3. If still failing: falls back to in-memory (session won't survive reload,
//    but the app keeps working without crashing).
// ============================================

const memoryFallback = new Map();

const CURRENT_PROJECT_REF = 'kffzzjydhbsbpbfwwqgw';
const CURRENT_TOKEN_KEY = `sb-${CURRENT_PROJECT_REF}-auth-token`;

function emergencyCleanup() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;

      // Remove sb-* keys from OTHER Supabase projects
      if (k.startsWith('sb-') && !k.includes(CURRENT_PROJECT_REF)) {
        keysToRemove.push(k);
        continue;
      }

      // Remove obviously stale app keys from old versions
      if (
        k.startsWith('supabase.auth.') ||
        k.startsWith('firebase:') ||
        k === 'userRole' ||
        k === 'currentUser'
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => {
      console.warn('🧹 Removing stale key:', k);
      localStorage.removeItem(k);
    });
    return keysToRemove.length;
  } catch (e) {
    console.error('Emergency cleanup failed:', e);
    return 0;
  }
}

const safeStorage = {
  getItem: (key) => {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) return v;
    } catch { /* ignore */ }
    return memoryFallback.get(key) ?? null;
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (err) {
      const isQuota =
        err &&
        (err.name === 'QuotaExceededError' ||
          err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
          err.code === 22 ||
          err.code === 1014);

      if (!isQuota) {
        console.error('⚠️ Non-quota storage error, using memory fallback:', err);
        memoryFallback.set(key, value);
        return;
      }

      console.warn('⚠️ localStorage full. Running emergency cleanup...');
      const removed = emergencyCleanup();
      console.warn(`🧹 Removed ${removed} stale key(s). Retrying...`);

      try {
        localStorage.setItem(key, value);
        console.log('✅ Retry succeeded after cleanup.');
        return;
      } catch (retryErr) {
        console.warn('⚠️ Still full. Falling back to in-memory storage.');
        console.warn('   → The user will stay logged in for this tab only.');
        // ✅ FIX: use window.location instead of bare location
        console.warn(
          '   → To fix permanently, open DevTools → Application → Clear site data for',
          window.location.origin
        );
        memoryFallback.set(key, value);
      }
    }
  },

  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    memoryFallback.delete(key);
  },
};

// ============================================
// SUPABASE CLIENT
// ============================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    storageKey: CURRENT_TOKEN_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: { schema: 'public' },
  global: {
    headers: { 'x-application-name': 'bombshelter' },
  },
});

export default supabase;
