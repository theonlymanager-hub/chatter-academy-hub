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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string
          display_name: string
          id: string
          password_hash: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          password_hash: string
          role: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          password_hash?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          chatter_name: string | null
          created_at: string | null
          date: string | null
          discord_username: string | null
          id: string
          login_time: string | null
          logout_time: string | null
          shift: string | null
        }
        Insert: {
          chatter_name?: string | null
          created_at?: string | null
          date?: string | null
          discord_username?: string | null
          id?: string
          login_time?: string | null
          logout_time?: string | null
          shift?: string | null
        }
        Update: {
          chatter_name?: string | null
          created_at?: string | null
          date?: string | null
          discord_username?: string | null
          id?: string
          login_time?: string | null
          logout_time?: string | null
          shift?: string | null
        }
        Relationships: []
      }
      chat_feed: {
        Row: {
          author: string | null
          channel_name: string | null
          created_at: string | null
          discord_message_id: string | null
          id: string
          message_text: string | null
        }
        Insert: {
          author?: string | null
          channel_name?: string | null
          created_at?: string | null
          discord_message_id?: string | null
          id?: string
          message_text?: string | null
        }
        Update: {
          author?: string | null
          channel_name?: string | null
          created_at?: string | null
          discord_message_id?: string | null
          id?: string
          message_text?: string | null
        }
        Relationships: []
      }
      chat_feedback: {
        Row: {
          chatter_name: string
          created_at: string | null
          description: string
          id: string
          image_url: string
          model: string
          tab: string
        }
        Insert: {
          chatter_name: string
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          model: string
          tab: string
        }
        Update: {
          chatter_name?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          model?: string
          tab?: string
        }
        Relationships: []
      }
      customs: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          detailed_description: string | null
          fan_name: string | null
          fan_username: string | null
          id: string
          model_name: string | null
          price: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          detailed_description?: string | null
          fan_name?: string | null
          fan_username?: string | null
          id?: string
          model_name?: string | null
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          detailed_description?: string | null
          fan_name?: string | null
          fan_username?: string | null
          id?: string
          model_name?: string | null
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fan_profiles: {
        Row: {
          active_time: string | null
          created_at: string | null
          dob: string | null
          hobbies: string | null
          id: string
          interests: string | null
          is_whale: boolean | null
          job: string | null
          last_active: string | null
          last_messaged: string | null
          location: string | null
          model_name: string | null
          name: string | null
          notes: string | null
          of_username: string | null
          payday: string | null
          personality: string | null
          preferences: string[] | null
          relationship_status: string | null
          tier: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          active_time?: string | null
          created_at?: string | null
          dob?: string | null
          hobbies?: string | null
          id?: string
          interests?: string | null
          is_whale?: boolean | null
          job?: string | null
          last_active?: string | null
          last_messaged?: string | null
          location?: string | null
          model_name?: string | null
          name?: string | null
          notes?: string | null
          of_username?: string | null
          payday?: string | null
          personality?: string | null
          preferences?: string[] | null
          relationship_status?: string | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          active_time?: string | null
          created_at?: string | null
          dob?: string | null
          hobbies?: string | null
          id?: string
          interests?: string | null
          is_whale?: boolean | null
          job?: string | null
          last_active?: string | null
          last_messaged?: string | null
          location?: string | null
          model_name?: string | null
          name?: string | null
          notes?: string | null
          of_username?: string | null
          payday?: string | null
          personality?: string | null
          preferences?: string[] | null
          relationship_status?: string | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quality_scores: {
        Row: {
          chatter_name: string | null
          conversation_flow_score: number | null
          created_at: string | null
          energy_tone_score: number | null
          id: string
          notes: string | null
          overall_score: number | null
          personalisation_score: number | null
          ppv_timing_score: number | null
          response_time_score: number | null
          reviewed_by: string | null
          shift_date: string | null
        }
        Insert: {
          chatter_name?: string | null
          conversation_flow_score?: number | null
          created_at?: string | null
          energy_tone_score?: number | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          personalisation_score?: number | null
          ppv_timing_score?: number | null
          response_time_score?: number | null
          reviewed_by?: string | null
          shift_date?: string | null
        }
        Update: {
          chatter_name?: string | null
          conversation_flow_score?: number | null
          created_at?: string | null
          energy_tone_score?: number | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          personalisation_score?: number | null
          ppv_timing_score?: number | null
          response_time_score?: number | null
          reviewed_by?: string | null
          shift_date?: string | null
        }
        Relationships: []
      }
      sales_screenshots: {
        Row: {
          amount: number | null
          chatter_name: string | null
          created_at: string | null
          date: string | null
          id: string
          image_url: string | null
          model_name: string | null
        }
        Insert: {
          amount?: number | null
          chatter_name?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          image_url?: string | null
          model_name?: string | null
        }
        Update: {
          amount?: number | null
          chatter_name?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          image_url?: string | null
          model_name?: string | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          chatter_name: string | null
          created_at: string | null
          date: string | null
          id: string
          is_active: boolean | null
          models: string[] | null
          shift_type: string | null
        }
        Insert: {
          chatter_name?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          is_active?: boolean | null
          models?: string[] | null
          shift_type?: string | null
        }
        Update: {
          chatter_name?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          is_active?: boolean | null
          models?: string[] | null
          shift_type?: string | null
        }
        Relationships: []
      }
      whale_tracking: {
        Row: {
          created_at: string | null
          fan_profile_id: string | null
          id: string
          last_contact: string | null
          model_name: string | null
          notes: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fan_profile_id?: string | null
          id?: string
          last_contact?: string | null
          model_name?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fan_profile_id?: string | null
          id?: string
          last_contact?: string | null
          model_name?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whale_tracking_fan_profile_id_fkey"
            columns: ["fan_profile_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
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
