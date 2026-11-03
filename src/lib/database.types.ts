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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          audience: string
          author_name: string | null
          body: string
          canonical_url: string | null
          category: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          excerpt: string
          featured: boolean
          focus_keyword: string | null
          gallery: string[]
          id: string
          keywords: string[]
          locale: string
          meta_description: string | null
          meta_title: string | null
          noindex: boolean
          og_image_path: string | null
          published_at: string | null
          reading_minutes: number | null
          seo_score: number | null
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          author_name?: string | null
          body?: string
          canonical_url?: string | null
          category?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string
          featured?: boolean
          focus_keyword?: string | null
          gallery?: string[]
          id?: string
          keywords?: string[]
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_image_path?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          seo_score?: number | null
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          author_name?: string | null
          body?: string
          canonical_url?: string | null
          category?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string
          featured?: boolean
          focus_keyword?: string | null
          gallery?: string[]
          id?: string
          keywords?: string[]
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_image_path?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          seo_score?: number | null
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          body: string
          client_id: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          featured: boolean
          gallery: string[]
          id: string
          industry: string | null
          locale: string
          meta_description: string | null
          meta_title: string | null
          outcomes: string[]
          project_url: string | null
          project_year: number | null
          published_at: string | null
          role: string | null
          services: string[]
          slug: string
          sort_order: number
          summary: string
          tech_stack: string[]
          testimonial_author: string | null
          testimonial_quote: string | null
          testimonial_title: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body?: string
          client_id?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          featured?: boolean
          gallery?: string[]
          id?: string
          industry?: string | null
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          outcomes?: string[]
          project_url?: string | null
          project_year?: number | null
          published_at?: string | null
          role?: string | null
          services?: string[]
          slug: string
          sort_order?: number
          summary?: string
          tech_stack?: string[]
          testimonial_author?: string | null
          testimonial_quote?: string | null
          testimonial_title?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body?: string
          client_id?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          featured?: boolean
          gallery?: string[]
          id?: string
          industry?: string | null
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          outcomes?: string[]
          project_url?: string | null
          project_year?: number | null
          published_at?: string | null
          role?: string | null
          services?: string[]
          slug?: string
          sort_order?: number
          summary?: string
          tech_stack?: string[]
          testimonial_author?: string | null
          testimonial_quote?: string | null
          testimonial_title?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_email: string | null
          created_at: string
          created_by: string | null
          featured: boolean
          id: string
          kra_pin: string | null
          locale: string
          logo_path: string | null
          name: string
          phone: string | null
          slug: string
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          kra_pin?: string | null
          locale?: string
          logo_path?: string | null
          name: string
          phone?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          kra_pin?: string | null
          locale?: string
          logo_path?: string | null
          name?: string
          phone?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          lead_id: string | null
          order_id: string | null
          resend_id: string | null
          subject: string
          template: string
          to_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          lead_id?: string | null
          order_id?: string | null
          resend_id?: string | null
          subject: string
          template: string
          to_email: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          lead_id?: string | null
          order_id?: string | null
          resend_id?: string | null
          subject?: string
          template?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          agenda: Json
          body: string
          capacity: number | null
          category: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          gallery: string[]
          id: string
          locale: string
          meta_description: string | null
          meta_title: string | null
          mode: string
          published_at: string | null
          registration_closes_at: string | null
          slug: string
          speakers: Json
          starts_at: string
          summary: string
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          agenda?: Json
          body?: string
          capacity?: number | null
          category?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          gallery?: string[]
          id?: string
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          mode?: string
          published_at?: string | null
          registration_closes_at?: string | null
          slug: string
          speakers?: Json
          starts_at: string
          summary?: string
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          agenda?: Json
          body?: string
          capacity?: number | null
          category?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          gallery?: string[]
          id?: string
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          mode?: string
          published_at?: string | null
          registration_closes_at?: string | null
          slug?: string
          speakers?: Json
          starts_at?: string
          summary?: string
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          line_kes: number
          qty: number
          sort_order: number
          unit_kes: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          line_kes?: number
          qty?: number
          sort_order?: number
          unit_kes?: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          line_kes?: number
          qty?: number
          sort_order?: number
          unit_kes?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid_kes: number
          bill_company: string | null
          bill_email: string
          bill_name: string
          bill_phone: string | null
          bill_to_block: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          discount_kes: number
          discount_percent: number | null
          due_on: string | null
          from_block: string | null
          id: string
          issued_on: string | null
          lead_id: string | null
          notes: string | null
          number: string
          paid_at: string | null
          payment_note: string | null
          po_number: string | null
          provider_ref: string | null
          sent_at: string | null
          ship_to: string | null
          shipping_kes: number
          status: string
          subtotal_kes: number
          thank_you: string | null
          total_kes: number
          updated_at: string
          vat_kes: number
          vat_percent: number | null
        }
        Insert: {
          amount_paid_kes?: number
          bill_company?: string | null
          bill_email: string
          bill_name: string
          bill_phone?: string | null
          bill_to_block?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_kes?: number
          discount_percent?: number | null
          due_on?: string | null
          from_block?: string | null
          id?: string
          issued_on?: string | null
          lead_id?: string | null
          notes?: string | null
          number: string
          paid_at?: string | null
          payment_note?: string | null
          po_number?: string | null
          provider_ref?: string | null
          sent_at?: string | null
          ship_to?: string | null
          shipping_kes?: number
          status?: string
          subtotal_kes?: number
          thank_you?: string | null
          total_kes?: number
          updated_at?: string
          vat_kes?: number
          vat_percent?: number | null
        }
        Update: {
          amount_paid_kes?: number
          bill_company?: string | null
          bill_email?: string
          bill_name?: string
          bill_phone?: string | null
          bill_to_block?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_kes?: number
          discount_percent?: number | null
          due_on?: string | null
          from_block?: string | null
          id?: string
          issued_on?: string | null
          lead_id?: string | null
          notes?: string | null
          number?: string
          paid_at?: string | null
          payment_note?: string | null
          po_number?: string | null
          provider_ref?: string | null
          sent_at?: string | null
          ship_to?: string | null
          shipping_kes?: number
          status?: string
          subtotal_kes?: number
          thank_you?: string | null
          total_kes?: number
          updated_at?: string
          vat_kes?: number
          vat_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activity: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          kind: string
          lead_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          lead_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activity_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget: string | null
          company: string | null
          created_at: string
          created_by: string | null
          details: Json
          email: string
          id: string
          last_contacted_at: string | null
          locale: string
          message: string | null
          name: string
          notes: string | null
          page_url: string | null
          phone: string | null
          referrer: string | null
          services: string[]
          source: string
          stage: string | null
          status: string
          timeline: string | null
          updated_at: string
          utm: Json
        }
        Insert: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          details?: Json
          email: string
          id?: string
          last_contacted_at?: string | null
          locale?: string
          message?: string | null
          name: string
          notes?: string | null
          page_url?: string | null
          phone?: string | null
          referrer?: string | null
          services?: string[]
          source: string
          stage?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          utm?: Json
        }
        Update: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          details?: Json
          email?: string
          id?: string
          last_contacted_at?: string | null
          locale?: string
          message?: string | null
          name?: string
          notes?: string | null
          page_url?: string | null
          phone?: string | null
          referrer?: string | null
          services?: string[]
          source?: string
          stage?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
          utm?: Json
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt: string
          bucket: string
          created_at: string
          created_by: string | null
          id: string
          kind: string
          locale: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt?: string
          bucket?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          locale?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt?: string
          bucket?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          locale?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          href: string | null
          id: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string
          created_at?: string
          href?: string | null
          id?: string
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          href?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_kes: number
          attendee_company: string | null
          attendee_name: string | null
          checked_in_at: string | null
          created_at: string
          download_expires_at: string | null
          email: string
          event_id: string | null
          id: string
          kind: string
          locale: string
          phone: string | null
          product_id: string | null
          provider: string
          provider_ref: string | null
          quantity: number
          status: string
          ticket_code: string | null
          ticket_type_id: string | null
          updated_at: string
        }
        Insert: {
          amount_kes: number
          attendee_company?: string | null
          attendee_name?: string | null
          checked_in_at?: string | null
          created_at?: string
          download_expires_at?: string | null
          email: string
          event_id?: string | null
          id?: string
          kind?: string
          locale?: string
          phone?: string | null
          product_id?: string | null
          provider?: string
          provider_ref?: string | null
          quantity?: number
          status?: string
          ticket_code?: string | null
          ticket_type_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_kes?: number
          attendee_company?: string | null
          attendee_name?: string | null
          checked_in_at?: string | null
          created_at?: string
          download_expires_at?: string | null
          email?: string
          event_id?: string | null
          id?: string
          kind?: string
          locale?: string
          phone?: string | null
          product_id?: string | null
          provider?: string
          provider_ref?: string | null
          quantity?: number
          status?: string
          ticket_code?: string | null
          ticket_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "event_ticket_stats"
            referencedColumns: ["ticket_type_id"]
          },
          {
            foreignKeyName: "orders_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          blurb: string
          created_at: string
          created_by: string | null
          featured: boolean
          id: string
          locale: string
          logo_path: string | null
          name: string
          relationship: string
          slug: string
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          blurb?: string
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          locale?: string
          logo_path?: string | null
          name: string
          relationship?: string
          slug: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          blurb?: string
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          locale?: string
          logo_path?: string | null
          name?: string
          relationship?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          locale: string
          order_id: string | null
          payload: Json
          provider: string
          result: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          locale?: string
          order_id?: string | null
          payload?: Json
          provider?: string
          result?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          locale?: string
          order_id?: string | null
          payload?: Json
          provider?: string
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          changelog: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          description: string
          file_path: string | null
          id: string
          locale: string
          price_kes: number
          published: boolean
          slug: string
          title: string
          type: string
          updated_at: string
          version: string | null
        }
        Insert: {
          changelog?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          file_path?: string | null
          id?: string
          locale?: string
          price_kes?: number
          published?: boolean
          slug: string
          title: string
          type: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          changelog?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          file_path?: string | null
          id?: string
          locale?: string
          price_kes?: number
          published?: boolean
          slug?: string
          title?: string
          type?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          locale: string
          role: string
          shortcuts: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          locale?: string
          role?: string
          shortcuts?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          locale?: string
          role?: string
          shortcuts?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address_line: string | null
          autoresponder_body: string | null
          autoresponder_enabled: boolean
          autoresponder_hours: number
          autoresponder_subject: string | null
          cal_com_embed_url: string | null
          github_url: string | null
          google_review_url: string | null
          gtm_id: string | null
          id: number
          invoice_next_number: number
          invoice_prefix: string
          kra_pin: string | null
          legal_name: string | null
          linkedin_url: string | null
          locale: string
          logo_path: string | null
          payment_note: string | null
          phone: string | null
          public_email: string | null
          social_publish_webhook_url: string | null
          trading_name: string | null
          updated_at: string
          vat_percent: number | null
          x_url: string | null
        }
        Insert: {
          address_line?: string | null
          autoresponder_body?: string | null
          autoresponder_enabled?: boolean
          autoresponder_hours?: number
          autoresponder_subject?: string | null
          cal_com_embed_url?: string | null
          github_url?: string | null
          google_review_url?: string | null
          gtm_id?: string | null
          id?: number
          invoice_next_number?: number
          invoice_prefix?: string
          kra_pin?: string | null
          legal_name?: string | null
          linkedin_url?: string | null
          locale?: string
          logo_path?: string | null
          payment_note?: string | null
          phone?: string | null
          public_email?: string | null
          social_publish_webhook_url?: string | null
          trading_name?: string | null
          updated_at?: string
          vat_percent?: number | null
          x_url?: string | null
        }
        Update: {
          address_line?: string | null
          autoresponder_body?: string | null
          autoresponder_enabled?: boolean
          autoresponder_hours?: number
          autoresponder_subject?: string | null
          cal_com_embed_url?: string | null
          github_url?: string | null
          google_review_url?: string | null
          gtm_id?: string | null
          id?: number
          invoice_next_number?: number
          invoice_prefix?: string
          kra_pin?: string | null
          legal_name?: string | null
          linkedin_url?: string | null
          locale?: string
          logo_path?: string | null
          payment_note?: string | null
          phone?: string | null
          public_email?: string | null
          social_publish_webhook_url?: string | null
          trading_name?: string | null
          updated_at?: string
          vat_percent?: number | null
          x_url?: string | null
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          description: string
          event_id: string
          id: string
          max_per_order: number
          name: string
          price_kes: number
          quota: number | null
          sales_end: string | null
          sales_start: string | null
          sort_order: number
        }
        Insert: {
          description?: string
          event_id: string
          id?: string
          max_per_order?: number
          name: string
          price_kes?: number
          quota?: number | null
          sales_end?: string | null
          sales_start?: string | null
          sort_order?: number
        }
        Update: {
          description?: string
          event_id?: string
          id?: string
          max_per_order?: number
          name?: string
          price_kes?: number
          quota?: number | null
          sales_end?: string | null
          sales_start?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          case_study_id: string | null
          created_at: string
          created_by: string | null
          id: string
          locale: string
          product_id: string | null
          provider: string
          published_at: string | null
          storage_path: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          case_study_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          product_id?: string | null
          provider: string
          published_at?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          case_study_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          product_id?: string | null
          provider?: string
          published_at?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      event_ticket_stats: {
        Row: {
          checked_in: number | null
          event_id: string | null
          held: number | null
          revenue_kes: number | null
          sold: number | null
          ticket_type_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_edit: { Args: never; Returns: boolean }
      check_in_ticket: {
        Args: { p_checked_in: boolean; p_order_id: string }
        Returns: string
      }
      create_ticket_order: {
        Args: {
          p_company?: string
          p_email: string
          p_event_id: string
          p_name: string
          p_phone: string
          p_quantity: number
          p_ticket_type_id: string
        }
        Returns: {
          amount_kes: number
          order_id: string
          order_status: string
          ticket_code: string
        }[]
      }
      is_owner: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      next_invoice_number: { Args: never; Returns: string }
      staff_role: { Args: never; Returns: string }
      ticket_holds: {
        Args: { p_event_ids: string[] }
        Returns: {
          event_id: string
          taken: number
          ticket_type_id: string
        }[]
      }
      ticket_order_status: {
        Args: { p_order_id: string }
        Returns: {
          event_title: string
          order_status: string
          quantity: number
          ticket_code: string
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
