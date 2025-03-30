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
      links: {
        Row: {
          id: string
          created_at: string
          title: string
          url: string
          category: string
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          url: string
          category: string
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          url?: string
          category?: string
          user_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
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
      [_ in never]: never
    }
  }
}