import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type SiteSettings = Tables<"site_settings">;
export type CaseStudy = Tables<"case_studies">;
export type Article = Tables<"articles">;
export type Partner = Tables<"partners">;
export type Client = Tables<"clients">;
export type Product = Tables<"products">;
export type Lead = Tables<"leads">;
export type Order = Tables<"orders">;
export type Profile = Tables<"profiles">;
export type MediaItem = Tables<"media">;
export type Video = Tables<"videos">;
export type Invoice = Tables<"invoices">;
export type InvoiceItem = Tables<"invoice_items">;
export type Notification = Tables<"notifications">;
export type EmailLog = Tables<"email_log">;
export type Event = Tables<"events">;
export type TicketType = Tables<"ticket_types">;

export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data;
}

export async function getPublishedWork(limit?: number) {
  const supabase = await createClient();
  let q = supabase
    .from("case_studies")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return data ?? [];
}

export async function getWorkBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  return data;
}

export async function getPublishedArticles(opts?: { audience?: string; limit?: number }) {
  const supabase = await createClient();
  let q = supabase
    .from("articles")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (opts?.audience) q = q.eq("audience", opts.audience);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return data ?? [];
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  return data;
}

export async function getPartners() {
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").order("sort_order").order("name");
  return data ?? [];
}

export async function getFeaturedClients() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("featured", true)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function getPublishedProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("title");
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

export async function getPublishedEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .not("published_at", "is", null)
    .order("starts_at", { ascending: true });
  return data ?? [];
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  return data;
}

export async function getTicketTypes(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function getStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) return null;
  return data;
}
