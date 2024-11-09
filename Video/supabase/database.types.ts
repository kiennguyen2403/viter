
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
      "leetcode-questions": {
        Row: {
          answers: string | null
          created_at: string
          id: number
          question: string | null
        }
        Insert: {
          answers?: string | null
          created_at?: string
          id?: number
          question?: string | null
        }
        Update: {
          answers?: string | null
          created_at?: string
          id?: number
          question?: string | null
        }
        Relationships: []
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
          id: number
          meetingId: string | null
          status: Database["public"]["Enums"]["participate"] | null
          userId: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          meetingId?: string | null
          status?: Database["public"]["Enums"]["participate"] | null
          userId?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          meetingId?: string | null
          status?: Database["public"]["Enums"]["participate"] | null
          userId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_meetingId_fkey"
            columns: ["meetingId"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recordings: {
        Row: {
          bucket: string | null
          created_at: string
          id: number
          meeting_id: string | null
          name: string | null
        }
        Insert: {
          bucket?: string | null
          created_at?: string
          id?: number
          meeting_id?: string | null
          name?: string | null
        }
        Update: {
          bucket?: string | null
          created_at?: string
          id?: number
          meeting_id?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recording_meetingId_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
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
      check_and_send_email: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
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
