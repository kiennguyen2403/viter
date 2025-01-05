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
      applications: {
        Row: {
          created_at: string
          id: number
          job_position_id: number | null
          name: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          job_position_id?: number | null
          name?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          job_position_id?: number | null
          name?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_position_id_fkey"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          content: string | null
          created_at: string
          id: number
          meeting_id: string | null
          user_id: number | null
          value: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          meeting_id?: string | null
          user_id?: number | null
          value?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          meeting_id?: string | null
          user_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_meetingId_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: number
          location: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          location?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          location?: string | null
          name?: string | null
        }
        Relationships: []
      }
      job_positions: {
        Row: {
          company_id: number | null
          created_at: string
          description: string | null
          id: number
          title: string | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          title?: string | null
        }
        Update: {
          company_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_activities: {
        Row: {
          created_at: string
          id: number
          meeting_id: string | null
          payload: Json | null
          user_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          meeting_id?: string | null
          payload?: Json | null
          user_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          meeting_id?: string | null
          payload?: Json | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_activities_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          nano_id: string | null
          occurred_at: string | null
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          nano_id?: string | null
          occurred_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          nano_id?: string | null
          occurred_at?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: number
          privacy: Database["public"]["Enums"]["privacy"] | null
          user_id: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          privacy?: Database["public"]["Enums"]["privacy"] | null
          user_id?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          privacy?: Database["public"]["Enums"]["privacy"] | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "note_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: number
          user_id: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          created_at: string
          meeting_id: string
          status: Database["public"]["Enums"]["participate"] | null
          user_id: number
        }
        Insert: {
          created_at?: string
          meeting_id: string
          status?: Database["public"]["Enums"]["participate"] | null
          user_id: number
        }
        Update: {
          created_at?: string
          meeting_id?: string
          status?: Database["public"]["Enums"]["participate"] | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          answers: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"] | null
          embedding: string | null
          id: number
          question: string | null
          title: string | null
          type: Database["public"]["Enums"]["problem_type"] | null
        }
        Insert: {
          answers?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          embedding?: string | null
          id?: number
          question?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["problem_type"] | null
        }
        Update: {
          answers?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          embedding?: string | null
          id?: number
          question?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["problem_type"] | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          bucket: string | null
          created_at: string
          fileName: string | null
          id: number
          url: string | null
          user_id: number | null
        }
        Insert: {
          bucket?: string | null
          created_at?: string
          fileName?: string | null
          id?: number
          url?: string | null
          user_id?: number | null
        }
        Update: {
          bucket?: string | null
          created_at?: string
          fileName?: string | null
          id?: number
          url?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: number | null
          created_at: string
          email: string | null
          id: number
          role: Database["public"]["Enums"]["role"] | null
          token_identifier: string | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          role?: Database["public"]["Enums"]["role"] | null
          token_identifier?: string | null
        }
        Update: {
          company_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          role?: Database["public"]["Enums"]["role"] | null
          token_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_companyId_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      check_and_send_email: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_problems: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          answers: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"] | null
          embedding: string | null
          id: number
          question: string | null
          title: string | null
          type: Database["public"]["Enums"]["problem_type"] | null
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      application_status: "SUBMIT" | "IN_PROGRESS" | "REJECT" | "SUCCESS"
      difficulty: "EASY" | "MEDIUM" | "HARD"
      file_type: "TEXT" | "AUDIO" | "IMAGE" | "VIDEO"
      meeting_status: "IDLE" | "LIVE" | "END"
      participant_role: "INTERVIEWER" | "INTERVIEWEE"
      participate:
        | "PENDING"
        | "DECLINE"
        | "ACCEPT"
        | "STAND_BY"
        | "LIVE"
        | "LEAVE"
      privacy: "PRIVATE" | "TEAM" | "PUBLIC"
      problem_type: "LEETCODE" | "TECHNICAL" | "BEHAVIOUR"
      role: "USER" | "EMPLOYER" | "EMPLOYEE" | "ADMIN"
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
