import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Helper functions for common operations
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        region:regions(*),
        province:provinces(*)
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating a new one');
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            mobile_number: userData.user?.phone || `user-${userId.substring(0, 8)}`,
            display_name: userData.user?.email?.split('@')[0] || `User-${userId.substring(0, 6)}`,
            status: 'online',
            last_seen: new Date().toISOString()
          })
          .select(`
            *,
            region:regions(*),
            province:provinces(*)
          `)
          .single();
        
        if (createError) throw createError;
        return newProfile;
      } else {
        throw error;
      }
    }
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile');
  }
};

export const updateProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
  try {
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist, create it first
      await getProfile(userId);
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(`
        *,
        region:regions(*),
        province:provinces(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
};

export const getSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If settings don't exist, create default settings
      if (error.code === 'PGRST116') {
        console.log('Settings not found, creating default settings');
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert({
            user_id: userId,
            theme: 'light',
            notifications: true,
            auto_message_display: true,
            offline_delivery: 'server'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newSettings;
      } else {
        throw error;
      }
    }
    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch settings');
  }
};

export const updateSettings = async (userId: string, updates: Partial<Database['public']['Tables']['settings']['Update']>) => {
  try {
    // First check if settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // Settings don't exist, create default settings first
      await getSettings(userId);
    }
    
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }
};

export const getChatrooms = async (userId: string, { page = 1, pageSize = 20 }: PaginationParams = {}) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('chatroom_members')
      .select(`
        chatroom_id,
        chatrooms (
          id,
          name,
          is_group,
          created_at,
          created_by,
          messages!inner (
            id,
            content,
            type,
            created_at,
            sender_id,
            sender:profiles(id, display_name, avatar_url)
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('chatrooms.created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return { data: data || [], count };
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
    throw new Error('Failed to fetch chatrooms');
  }
};

export const getMessages = async (chatroomId: string, { page = 1, pageSize = 50 }: PaginationParams = {}) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, display_name, avatar_url, status)
      `, { count: 'exact' })
      .eq('chatroom_id', chatroomId)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return { data: data || [], count };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
};

export const sendMessage = async (
  chatroomId: string,
  senderId: string,
  content: string,
  type: Database['public']['Enums']['message_type'] = 'text',
  mediaUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chatroom_id: chatroomId,
        sender_id: senderId,
        content,
        type,
        media_url: mediaUrl,
      })
      .select(`
        *,
        sender:profiles(id, display_name, avatar_url, status)
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

export const markMessageAsRead = async (messageId: string, userId: string) => {
  try {
    // Check if entry already exists
    const { data: existing, error: checkError } = await supabase
      .from('message_status')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('message_status')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('message_status')
        .insert({
          message_id: messageId,
          user_id: userId,
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw new Error('Failed to mark message as read');
  }
};

export const getRegions = async () => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw new Error('Failed to fetch regions');
  }
};

export const getProvinces = async (regionId: string) => {
  try {
    const { data, error } = await supabase
      .from('provinces')
      .select('*')
      .eq('region_id', regionId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('Failed to fetch provinces');
  }
}; 