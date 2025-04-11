export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          mobile_number: string
          display_name: string | null
          avatar_url: string | null
          region_id: string | null
          province_id: string | null
          status: 'online' | 'offline' | 'away'
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          mobile_number: string
          display_name?: string | null
          avatar_url?: string | null
          region_id?: string | null
          province_id?: string | null
          status?: 'online' | 'offline' | 'away'
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mobile_number?: string
          display_name?: string | null
          avatar_url?: string | null
          region_id?: string | null
          province_id?: string | null
          status?: 'online' | 'offline' | 'away'
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications: boolean
          auto_message_display: boolean
          offline_delivery: 'sms' | 'email' | 'server'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          notifications?: boolean
          auto_message_display?: boolean
          offline_delivery?: 'sms' | 'email' | 'server'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          notifications?: boolean
          auto_message_display?: boolean
          offline_delivery?: 'sms' | 'email' | 'server'
          created_at?: string
          updated_at?: string
        }
      }
      chatrooms: {
        Row: {
          id: string
          name: string | null
          is_group: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          is_group?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          is_group?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      chatroom_members: {
        Row: {
          id: string
          chatroom_id: string
          user_id: string
          joined_at: string
          last_read_at: string | null
        }
        Insert: {
          id?: string
          chatroom_id: string
          user_id: string
          joined_at?: string
          last_read_at?: string | null
        }
        Update: {
          id?: string
          chatroom_id?: string
          user_id?: string
          joined_at?: string
          last_read_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          chatroom_id: string
          sender_id: string
          content: string
          type: 'text' | 'image' | 'file'
          media_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chatroom_id: string
          sender_id: string
          content: string
          type?: 'text' | 'image' | 'file'
          media_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chatroom_id?: string
          sender_id?: string
          content?: string
          type?: 'text' | 'image' | 'file'
          media_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      message_status: {
        Row: {
          id: string
          message_id: string
          user_id: string
          is_read: boolean
          read_at: string | null
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          is_read?: boolean
          read_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          is_read?: boolean
          read_at?: string | null
        }
      }
      regions: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
      }
      provinces: {
        Row: {
          id: string
          name: string
          code: string
          region_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          region_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          region_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: 'online' | 'offline' | 'away'
      message_type: 'text' | 'image' | 'file'
      offline_delivery_method: 'sms' | 'email' | 'server'
    }
  }
} 