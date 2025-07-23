import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Auth helpers
export const signUp = async (email: string, password: string, nome: string) => {
  // Clear any existing session first
  await supabase.auth.signOut();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: data.user.id,
        nome,
        role: 'mecanico'
      });

    if (profileError) throw profileError;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  // Clear any existing session first
  await supabase.auth.signOut();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('No valid session:', sessionError);
      await supabase.auth.signOut();
      return null;
    }

    // If session exists, get user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      // If refresh token is invalid, clear session
      if (userError.message.includes('refresh_token_not_found') || 
          userError.message.includes('Invalid Refresh Token')) {
        await supabase.auth.signOut();
        return null;
      }
      throw userError;
    }
    
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    await supabase.auth.signOut();
    return null;
  }
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Helper function to get the last day of a month
export const getLastDayOfMonth = (year: number, month: number): string => {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
};

// Helper function to get current month date range
export const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = getLastDayOfMonth(year, month);
  
  return { startDate, endDate };
};