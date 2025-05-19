export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string | null
          is_premium: boolean
          onboarding_completed: boolean | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name?: string | null
          is_premium?: boolean
          onboarding_completed?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          is_premium?: boolean
          onboarding_completed?: boolean | null
        }
      }
      menus: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          description: string | null
          logo_url: string | null
          theme: string
          business_hours: Json | null
          is_active: boolean
          enable_ordering: boolean
          restaurant_image_url: string | null
          banner_image_url: string | null
          payment_mobile_info: string | null
          dollar_exchange_rate: number | null
          location: string | null
          social_media: Json | null
          banner_color: string | null
          show_create_menu_button: boolean | null
          map_latitude: number | null
          map_longitude: number | null
          facebook_url: string | null
          instagram_url: string | null
          twitter_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          theme?: string
          business_hours?: Json | null
          is_active?: boolean
          enable_ordering?: boolean
          restaurant_image_url?: string | null
          banner_image_url?: string | null
          payment_mobile_info?: string | null
          dollar_exchange_rate?: number | null
          location?: string | null
          social_media?: Json | null
          banner_color?: string | null
          show_create_menu_button?: boolean | null
          map_latitude?: number | null
          map_longitude?: number | null
          facebook_url?: string | null
          instagram_url?: string | null
          twitter_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          theme?: string
          business_hours?: Json | null
          is_active?: boolean
          enable_ordering?: boolean
          restaurant_image_url?: string | null
          banner_image_url?: string | null
          payment_mobile_info?: string | null
          dollar_exchange_rate?: number | null
          location?: string | null
          social_media?: Json | null
          banner_color?: string | null
          show_create_menu_button?: boolean | null
          map_latitude?: number | null
          map_longitude?: number | null
          facebook_url?: string | null
          instagram_url?: string | null
          twitter_url?: string | null
          whatsapp_number?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          menu_id: string
          name: string
          description: string | null
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          menu_id: string
          name: string
          description?: string | null
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          menu_id?: string
          name?: string
          description?: string | null
          order?: number
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
          order: number
          discount_percentage: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          category_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          order?: number
          discount_percentage?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          order?: number
          discount_percentage?: number | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          menu_id: string
          customer_name: string
          customer_phone: string | null
          customer_email: string | null
          total_amount: number
          status: string
          payment_method: string
          payment_proof_url: string | null
          notes: string | null
          table_number: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          menu_id: string
          customer_name: string
          customer_phone?: string | null
          customer_email?: string | null
          total_amount: number
          status?: string
          payment_method: string
          payment_proof_url?: string | null
          notes?: string | null
          table_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          menu_id?: string
          customer_name?: string
          customer_phone?: string | null
          customer_email?: string | null
          total_amount?: number
          status?: string
          payment_method?: string
          payment_proof_url?: string | null
          notes?: string | null
          table_number?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          notes?: string | null
        }
      }
      loyalty_cards: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          menu_id: string
          customer_name: string
          customer_phone: string | null
          customer_email: string | null
          total_points: number
          max_points: number
          reward_description: string
          is_completed: boolean
          last_order_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          menu_id: string
          customer_name: string
          customer_phone?: string | null
          customer_email?: string | null
          total_points?: number
          max_points?: number
          reward_description?: string
          is_completed?: boolean
          last_order_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          menu_id?: string
          customer_name?: string
          customer_phone?: string | null
          customer_email?: string | null
          total_points?: number
          max_points?: number
          reward_description?: string
          is_completed?: boolean
          last_order_id?: string | null
        }
      }
      loyalty_points_history: {
        Row: {
          id: string
          created_at: string
          loyalty_card_id: string
          points_added: number
          notes: string | null
          added_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          loyalty_card_id: string
          points_added: number
          notes?: string | null
          added_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          loyalty_card_id?: string
          points_added?: number
          notes?: string | null
          added_by?: string | null
        }
      }
    }
  }
}
