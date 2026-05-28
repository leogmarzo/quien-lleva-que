// Hand-typed Database shape for v1.
// If/when we run `supabase gen types`, this can be replaced.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          event_at: string | null;
          description: string | null;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          event_at?: string | null;
          description?: string | null;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          event_at?: string | null;
          description?: string | null;
          owner_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          emoji: string;
          notes: string | null;
          created_by_user_id: string | null;
          created_by_guest_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          emoji?: string;
          notes?: string | null;
          created_by_user_id?: string | null;
          created_by_guest_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          emoji?: string;
          notes?: string | null;
          created_by_user_id?: string | null;
          created_by_guest_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      claims: {
        Row: {
          id: string;
          item_id: string;
          user_id: string | null;
          guest_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id?: string | null;
          guest_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          user_id?: string | null;
          guest_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      delete_item_as_guest: {
        Args: { p_item_id: string; p_guest_name: string };
        Returns: void;
      };
      delete_claim_as_guest: {
        Args: { p_claim_id: string; p_guest_name: string };
        Returns: void;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type ItemRow = Database["public"]["Tables"]["items"]["Row"];
export type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];
