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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "owner" | "editor" | "sales" | string;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: string;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          cal_com_embed_url: string | null;
          gtm_id: string | null;
          social_publish_webhook_url: string | null;
          google_review_url: string | null;
          linkedin_url: string | null;
          x_url: string | null;
          github_url: string | null;
          locale: string;
          updated_at: string;
          legal_name: string | null;
          trading_name: string | null;
          phone: string | null;
          public_email: string | null;
          address_line: string | null;
          logo_path: string | null;
          invoice_prefix: string;
          invoice_next_number: number;
          kra_pin: string | null;
          vat_percent: number | null;
          payment_note: string | null;
          autoresponder_enabled: boolean;
          autoresponder_hours: number;
          autoresponder_subject: string | null;
          autoresponder_body: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]> & { id?: number };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          source: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          services: string[];
          stage: string | null;
          timeline: string | null;
          budget: string | null;
          message: string | null;
          status: string;
          notes: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          source: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          services?: string[];
          stage?: string | null;
          timeline?: string | null;
          budget?: string | null;
          message?: string | null;
          status?: string;
          notes?: string | null;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_path: string | null;
          url: string | null;
          featured: boolean;
          sort_order: number;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          billing_email: string | null;
          phone: string | null;
          kra_pin: string | null;
        };
        Insert: {
          name: string;
          slug: string;
          logo_path?: string | null;
          url?: string | null;
          featured?: boolean;
          sort_order?: number;
          locale?: string;
          billing_email?: string | null;
          phone?: string | null;
          kra_pin?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_path: string | null;
          url: string | null;
          relationship: string;
          blurb: string;
          featured: boolean;
          sort_order: number;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          name: string;
          slug: string;
          logo_path?: string | null;
          url?: string | null;
          relationship?: string;
          blurb?: string;
          featured?: boolean;
          sort_order?: number;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Insert"]>;
        Relationships: [];
      };
      case_studies: {
        Row: {
          id: string;
          title: string;
          slug: string;
          client_id: string | null;
          summary: string;
          body: string;
          industry: string | null;
          services: string[];
          outcomes: string[];
          cover_path: string | null;
          gallery: string[];
          video_url: string | null;
          featured: boolean;
          published_at: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          title: string;
          slug: string;
          client_id?: string | null;
          summary?: string;
          body?: string;
          industry?: string | null;
          services?: string[];
          outcomes?: string[];
          cover_path?: string | null;
          gallery?: string[];
          video_url?: string | null;
          featured?: boolean;
          published_at?: string | null;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["case_studies"]["Insert"]>;
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          cover_path: string | null;
          tags: string[];
          audience: string;
          published_at: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          title: string;
          slug: string;
          excerpt?: string;
          body?: string;
          cover_path?: string | null;
          tags?: string[];
          audience?: string;
          published_at?: string | null;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          type: string;
          price_kes: number;
          description: string;
          version: string | null;
          file_path: string | null;
          changelog: string | null;
          cover_path: string | null;
          published: boolean;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          title: string;
          slug: string;
          type: string;
          price_kes?: number;
          description?: string;
          version?: string | null;
          file_path?: string | null;
          changelog?: string | null;
          cover_path?: string | null;
          published?: boolean;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          title: string;
          provider: string;
          url: string | null;
          storage_path: string | null;
          case_study_id: string | null;
          product_id: string | null;
          published_at: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          title: string;
          provider: string;
          url?: string | null;
          storage_path?: string | null;
          case_study_id?: string | null;
          product_id?: string | null;
          published_at?: string | null;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          product_id: string | null;
          amount_kes: number;
          provider: string;
          provider_ref: string | null;
          status: string;
          download_expires_at: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
          kind: string;
          event_id: string | null;
          ticket_type_id: string | null;
          attendee_name: string | null;
        };
        Insert: {
          email: string;
          phone?: string | null;
          product_id?: string | null;
          amount_kes: number;
          provider?: string;
          provider_ref?: string | null;
          status?: string;
          download_expires_at?: string | null;
          locale?: string;
          kind?: string;
          event_id?: string | null;
          ticket_type_id?: string | null;
          attendee_name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string | null;
          invoice_id: string | null;
          provider: string;
          result: string | null;
          payload: Json;
          locale: string;
          created_at: string;
        };
        Insert: {
          order_id?: string | null;
          invoice_id?: string | null;
          provider?: string;
          result?: string | null;
          payload?: Json;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          type: string;
          title: string;
          body: string;
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          type: string;
          title: string;
          body?: string;
          href?: string | null;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      email_log: {
        Row: {
          id: string;
          to_email: string;
          template: string;
          subject: string;
          lead_id: string | null;
          order_id: string | null;
          invoice_id: string | null;
          resend_id: string | null;
          created_at: string;
        };
        Insert: {
          to_email: string;
          template: string;
          subject: string;
          lead_id?: string | null;
          order_id?: string | null;
          invoice_id?: string | null;
          resend_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["email_log"]["Insert"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          number: string;
          client_id: string | null;
          lead_id: string | null;
          bill_name: string;
          bill_email: string;
          bill_phone: string | null;
          bill_company: string | null;
          status: string;
          notes: string | null;
          payment_note: string | null;
          subtotal_kes: number;
          vat_percent: number | null;
          vat_kes: number;
          total_kes: number;
          sent_at: string | null;
          paid_at: string | null;
          provider_ref: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          from_block: string | null;
          bill_to_block: string | null;
          ship_to: string | null;
          issued_on: string | null;
          due_on: string | null;
          po_number: string | null;
          thank_you: string | null;
          discount_kes: number;
          discount_percent: number | null;
          shipping_kes: number;
          amount_paid_kes: number;
        };
        Insert: {
          number: string;
          client_id?: string | null;
          lead_id?: string | null;
          bill_name: string;
          bill_email: string;
          bill_phone?: string | null;
          bill_company?: string | null;
          status?: string;
          notes?: string | null;
          payment_note?: string | null;
          subtotal_kes?: number;
          vat_percent?: number | null;
          vat_kes?: number;
          total_kes?: number;
          sent_at?: string | null;
          paid_at?: string | null;
          provider_ref?: string | null;
          created_by?: string | null;
          from_block?: string | null;
          bill_to_block?: string | null;
          ship_to?: string | null;
          issued_on?: string | null;
          due_on?: string | null;
          po_number?: string | null;
          thank_you?: string | null;
          discount_kes?: number;
          discount_percent?: number | null;
          shipping_kes?: number;
          amount_paid_kes?: number;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          qty: number;
          unit_kes: number;
          line_kes: number;
          sort_order: number;
        };
        Insert: {
          invoice_id: string;
          description: string;
          qty?: number;
          unit_kes?: number;
          line_kes?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_items"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string;
          body: string;
          venue: string | null;
          mode: string;
          starts_at: string;
          ends_at: string | null;
          cover_path: string | null;
          capacity: number | null;
          published_at: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          title: string;
          slug: string;
          summary?: string;
          body?: string;
          venue?: string | null;
          mode?: string;
          starts_at: string;
          ends_at?: string | null;
          cover_path?: string | null;
          capacity?: number | null;
          published_at?: string | null;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          price_kes: number;
          quota: number | null;
          sort_order: number;
        };
        Insert: {
          event_id: string;
          name: string;
          price_kes?: number;
          quota?: number | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["ticket_types"]["Insert"]>;
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          storage_path: string;
          bucket: string;
          alt: string;
          kind: string;
          locale: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          storage_path: string;
          bucket?: string;
          alt?: string;
          kind: string;
          locale?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      can_edit: { Args: Record<string, never>; Returns: boolean };
      is_owner: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      staff_role: { Args: Record<string, never>; Returns: string };
      next_invoice_number: { Args: Record<string, never>; Returns: string };
      record_desk_event: {
        Args: { p_type: string; p_title: string; p_body?: string; p_href?: string | null };
        Returns: undefined;
      };
      log_outbound_email: {
        Args: {
          p_to: string;
          p_template: string;
          p_subject: string;
          p_lead?: string | null;
          p_order?: string | null;
          p_invoice?: string | null;
          p_resend?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
