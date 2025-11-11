export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      subscription_transactions: {
        Row: {
          app_store_receipt: string | null
          app_store_transaction_id: string | null
          created_at: string | null
          id: string
          new_status: string
          old_status: string | null
          raw_response: Json | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          app_store_receipt?: string | null
          app_store_transaction_id?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          old_status?: string | null
          raw_response?: Json | null
          transaction_type: string
          user_id: string
        }
        Update: {
          app_store_receipt?: string | null
          app_store_transaction_id?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
          raw_response?: Json | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          ai_recipe_limit: number
          app_store_original_transaction_id: string | null
          app_store_receipt: string | null
          app_store_transaction_id: string | null
          auto_renew: boolean | null
          chat_message_limit: number
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          image_analysis_limit: number
          next_billing_date: string | null
          price_amount: number | null
          subscription_status: string
          tier: string
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_recipe_limit?: number
          app_store_original_transaction_id?: string | null
          app_store_receipt?: string | null
          app_store_transaction_id?: string | null
          auto_renew?: boolean | null
          chat_message_limit?: number
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          image_analysis_limit?: number
          next_billing_date?: string | null
          price_amount?: number | null
          subscription_status?: string
          tier?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_recipe_limit?: number
          app_store_original_transaction_id?: string | null
          app_store_receipt?: string | null
          app_store_transaction_id?: string | null
          auto_renew?: boolean | null
          chat_message_limit?: number
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          image_analysis_limit?: number
          next_billing_date?: string | null
          price_amount?: number | null
          subscription_status?: string
          tier?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          ai_recipe_used: number
          chat_messages_used: number
          created_at: string | null
          current_month: string
          id: string
          image_analysis_used: number
          reset_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_recipe_used?: number
          chat_messages_used?: number
          created_at?: string | null
          current_month: string
          id?: string
          image_analysis_used?: number
          reset_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_recipe_used?: number
          chat_messages_used?: number
          created_at?: string | null
          current_month?: string
          id?: string
          image_analysis_used?: number
          reset_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
