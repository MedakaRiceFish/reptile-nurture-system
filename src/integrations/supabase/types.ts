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
      animals: {
        Row: {
          age: number | null
          breeding_source: string | null
          created_at: string
          custom_id: string | null
          description: string | null
          enclosure_id: string | null
          feeding_schedule: string | null
          id: string
          image_url: string | null
          last_fed_date: string | null
          length: number | null
          name: string
          owner_id: string
          species: string
          updated_at: string
          weight: number
        }
        Insert: {
          age?: number | null
          breeding_source?: string | null
          created_at?: string
          custom_id?: string | null
          description?: string | null
          enclosure_id?: string | null
          feeding_schedule?: string | null
          id?: string
          image_url?: string | null
          last_fed_date?: string | null
          length?: number | null
          name: string
          owner_id: string
          species: string
          updated_at?: string
          weight: number
        }
        Update: {
          age?: number | null
          breeding_source?: string | null
          created_at?: string
          custom_id?: string | null
          description?: string | null
          enclosure_id?: string | null
          feeding_schedule?: string | null
          id?: string
          image_url?: string | null
          last_fed_date?: string | null
          length?: number | null
          name?: string
          owner_id?: string
          species?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      enclosures: {
        Row: {
          created_at: string
          humidity: number | null
          id: string
          image_url: string | null
          last_reading: string
          light_cycle: string | null
          name: string
          owner_id: string
          plants: string[] | null
          reading_status: string | null
          size: string | null
          substrate: string | null
          temperature: number | null
          type: string | null
          updated_at: string
          ventilation: string | null
        }
        Insert: {
          created_at?: string
          humidity?: number | null
          id?: string
          image_url?: string | null
          last_reading?: string
          light_cycle?: string | null
          name: string
          owner_id: string
          plants?: string[] | null
          reading_status?: string | null
          size?: string | null
          substrate?: string | null
          temperature?: number | null
          type?: string | null
          updated_at?: string
          ventilation?: string | null
        }
        Update: {
          created_at?: string
          humidity?: number | null
          id?: string
          image_url?: string | null
          last_reading?: string
          light_cycle?: string | null
          name?: string
          owner_id?: string
          plants?: string[] | null
          reading_status?: string | null
          size?: string | null
          substrate?: string | null
          temperature?: number | null
          type?: string | null
          updated_at?: string
          ventilation?: string | null
        }
        Relationships: []
      }
      hardware_devices: {
        Row: {
          created_at: string
          enclosure_id: string
          id: string
          last_maintenance: string
          name: string
          next_maintenance: string
          owner_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enclosure_id: string
          id?: string
          last_maintenance?: string
          name: string
          next_maintenance?: string
          owner_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enclosure_id?: string
          id?: string
          last_maintenance?: string
          name?: string
          next_maintenance?: string
          owner_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hardware_devices_enclosure_id_fkey"
            columns: ["enclosure_id"]
            isOneToOne: false
            referencedRelation: "enclosures"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          owner_id: string
          priority: string | null
          related_id: string | null
          related_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          due_time?: string | null
          id?: string
          owner_id: string
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          owner_id?: string
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      weight_records: {
        Row: {
          animal_id: string
          id: string
          owner_id: string
          recorded_at: string
          weight: number
        }
        Insert: {
          animal_id: string
          id?: string
          owner_id: string
          recorded_at?: string
          weight: number
        }
        Update: {
          animal_id?: string
          id?: string
          owner_id?: string
          recorded_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
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
