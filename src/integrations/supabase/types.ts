export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      personalities: {
        Row: {
          ai_prompts: Json | null
          behavior_patterns: Json | null
          communication_settings: Json | null
          core_traits: Json | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          sound_ai_prompt: string | null
          sound_url: string | null
          url_array: string[] | null
          url_metadata: Json[] | null
          visual_style: Json | null
        }
        Insert: {
          ai_prompts?: Json | null
          behavior_patterns?: Json | null
          communication_settings?: Json | null
          core_traits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          sound_ai_prompt?: string | null
          sound_url?: string | null
          url_array?: string[] | null
          url_metadata?: Json[] | null
          visual_style?: Json | null
        }
        Update: {
          ai_prompts?: Json | null
          behavior_patterns?: Json | null
          communication_settings?: Json | null
          core_traits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          sound_ai_prompt?: string | null
          sound_url?: string | null
          url_array?: string[] | null
          url_metadata?: Json[] | null
          visual_style?: Json | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          device_info: Json | null
          ended_at: string | null
          id: string
          personality_key: string | null
          relevant_agent: string | null
          session_data: Json | null
          session_feedback: Json | null
          session_id: string | null
          started_at: string | null
          struggle_type: string | null
          user_id: string | null
        }
        Insert: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          personality_key?: string | null
          relevant_agent?: string | null
          session_data?: Json | null
          session_feedback?: Json | null
          session_id?: string | null
          started_at?: string | null
          struggle_type?: string | null
          user_id?: string | null
        }
        Update: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          personality_key?: string | null
          relevant_agent?: string | null
          session_data?: Json | null
          session_feedback?: Json | null
          session_id?: string | null
          started_at?: string | null
          struggle_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_personality_key_fkey"
            columns: ["personality_key"]
            isOneToOne: false
            referencedRelation: "personalities"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "user_sessions_personality_voice_fkey"
            columns: ["personality_key"]
            isOneToOne: false
            referencedRelation: "voices"
            referencedColumns: ["fit_personality_name"]
          },
        ]
      }
      voices: {
        Row: {
          agent_id: string | null
          agent_settings: Json | null
          fit_personality_name: string
          id: string
          other_metadata: string | null
          voice_name: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_settings?: Json | null
          fit_personality_name: string
          id?: string
          other_metadata?: string | null
          voice_name?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_settings?: Json | null
          fit_personality_name?: string
          id?: string
          other_metadata?: string | null
          voice_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voices_fit_personality_name_fkey"
            columns: ["fit_personality_name"]
            isOneToOne: true
            referencedRelation: "personalities"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_secret: {
        Args: {
          secret_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
