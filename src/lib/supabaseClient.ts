import { supabase as originalSupabase } from '@/integrations/supabase/client';
import { capacitorStorage } from './capacitorStorage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { Capacitor } from '@capacitor/core';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Enhanced Supabase client with proper storage for native platforms.
 * 
 * On native platforms (iOS/Android):
 * - Uses Capacitor Preferences for session storage (more reliable than localStorage)
 * - Disables detectSessionInUrl (not needed on mobile)
 * 
 * On web:
 * - Uses the original Supabase client with localStorage
 */
export const supabase = Capacitor.isNativePlatform()
  ? createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: capacitorStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Important for mobile
      },
    })
  : originalSupabase;
