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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      list_entry: {
        Row: {
          created_at: string
          is_deletable: boolean
          is_public: boolean
          list_creator: string | null
          list_id: string
          list_name: string
          list_type: number
          media_count: number
        }
        Insert: {
          created_at?: string
          is_deletable?: boolean
          is_public?: boolean
          list_creator?: string | null
          list_id?: string
          list_name?: string
          list_type?: number
          media_count?: number
        }
        Update: {
          created_at?: string
          is_deletable?: boolean
          is_public?: boolean
          list_creator?: string | null
          list_id?: string
          list_name?: string
          list_type?: number
          media_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "media_user_list_list_creator_fkey"
            columns: ["list_creator"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      list_media_entry: {
        Row: {
          created_at: string
          description: string | null
          list_id: string
          media_id: string
          rank: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          list_id?: string
          media_id?: string
          rank?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          list_id?: string
          media_id?: string
          rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "list_media_entry_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "list_entry"
            referencedColumns: ["list_id"]
          },
          {
            foreignKeyName: "list_media_entry_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_entry"
            referencedColumns: ["media_id"]
          },
        ]
      }
      media_entry: {
        Row: {
          created_at: string
          media_description: string | null
          media_id: string
          title: string
        }
        Insert: {
          created_at?: string
          media_description?: string | null
          media_id?: string
          title: string
        }
        Update: {
          created_at?: string
          media_description?: string | null
          media_id?: string
          title?: string
        }
        Relationships: []
      }
      media_review_entry: {
        Row: {
          created_at: string
          media_id: string
          review_score: number | null
          review_text: string | null
          review_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          media_id: string
          review_score?: number | null
          review_text?: string | null
          review_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          media_id?: string
          review_score?: number | null
          review_text?: string | null
          review_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      media_tag_entry: {
        Row: {
          media_id: string
          tag_id: string
        }
        Insert: {
          media_id?: string
          tag_id?: string
        }
        Update: {
          media_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "MediaTagTable_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_entry"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "MediaTagTable_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag_entry"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      media_update_history: {
        Row: {
          created_at: string
          media_id: string
          user_id: string | null
          version: number
        }
        Insert: {
          created_at?: string
          media_id?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          media_id?: string
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "MediaUpdateHistory_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_entry"
            referencedColumns: ["media_id"]
          },
        ]
      }
      profile: {
        Row: {
          user_id: string
          username: string | null
        }
        Insert: {
          user_id: string
          username?: string | null
        }
        Update: {
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      tag_entry: {
        Row: {
          created_at: string
          tag_description: string | null
          tag_id: string
          tag_name: string
        }
        Insert: {
          created_at?: string
          tag_description?: string | null
          tag_id?: string
          tag_name?: string
        }
        Update: {
          created_at?: string
          tag_description?: string | null
          tag_id?: string
          tag_name?: string
        }
        Relationships: []
      }
      tag_update_history: {
        Row: {
          created_at: string
          description: string | null
          tag_id: string
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          tag_id?: string
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          tag_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "TagUpdateHistory_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag_entry"
            referencedColumns: ["tag_id"]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
