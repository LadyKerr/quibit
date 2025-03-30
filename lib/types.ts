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