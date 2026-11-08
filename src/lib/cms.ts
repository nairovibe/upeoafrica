import { createClient, createPublicClient, createServiceClient } from "@/lib/supabase/server";
import { publicRead } from "@/lib/public-cache";
import type { Tables } from "@/lib/database.types";

export type SiteSettings = Tables<"site_settings">;
export type CaseStudy = Tables<"case_studies">;
export type Article = Tables<"articles">;
export type Partner = Tables<"partners">;
export type Expert = Tables<"experts">;
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

async function _getPublicSettings() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data;
}

export const getPublicSettings = publicRead("cms:getPublicSettings", _getPublicSettings);

/** Fresh read for the console; public pages use getPublicSettings. */
export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data;
}

const WORK_CARD_COLUMNS =
  "id, slug, title, summary, cover_path, industry, services, tech_stack, project_url, confidential, project_year, featured, sort_order, published_at, updated_at, client:clients(name)";

/** Portfolio order: featured first, then the manual sort order, then the newest project. */
async function _getPublishedWork(limit?: number) {
  const supabase = createPublicClient();
  let q = supabase
    .from("case_studies")
    .select(WORK_CARD_COLUMNS)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("project_year", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return data ?? [];
}

export type WorkCard = Awaited<ReturnType<typeof _getPublishedWork>>[number];

async function _getWorkBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("case_studies")
    .select(
      "id, slug, title, summary, body, cover_path, gallery, video_url, industry, services, outcomes, tech_stack, confidential, role, project_year, project_url, testimonial_quote, testimonial_author, testimonial_title, meta_title, meta_description, published_at, updated_at, client:clients(name, logo_path, url)",
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .maybeSingle();
  return data;
}

export type WorkDetail = NonNullable<Awaited<ReturnType<typeof _getWorkBySlug>>>;

async function _getPublishedArticles(opts?: { audience?: string; limit?: number }) {
  const supabase = createPublicClient();
  let q = supabase
    .from("articles")
    .select("*")
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (opts?.audience) q = q.eq("audience", opts.audience);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return data ?? [];
}

async function _getArticleBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .maybeSingle();
  return data;
}

async function _getPartners() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("partners").select("*").is("deleted_at", null).order("sort_order").order("name");
  return data ?? [];
}

async function _getFeaturedClients() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .is("deleted_at", null)
    .eq("featured", true)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

async function _getPublishedProducts() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .is("deleted_at", null)
    .order("title");
  return data ?? [];
}

async function _getProductBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}

async function _getPublishedEvents() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .order("starts_at", { ascending: true });
  return data ?? [];
}

async function _getEventBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .maybeSingle();
  return data;
}

async function _getTicketTypes(eventId: string) {
  const supabase = createPublicClient();
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

async function _getTicketTypesForEvents(eventIds: string[]) {
  if (eventIds.length === 0) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("ticket_types")
    .select("*")
    .in("event_id", eventIds)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

async function _getPublishedEventSlugs() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select("slug, updated_at, starts_at")
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .order("starts_at", { ascending: false });
  return data ?? [];
}

export type TicketHolds = { byTicket: Map<string, number>; byEvent: Map<string, number> };

/**
 * Seats taken (paid plus pending) per ticket type and per event. Orders are
 * staff only under RLS, so this needs the service role; null means unknown.
 */
export async function getTicketHolds(eventIds: string[]): Promise<TicketHolds | null> {
  const holds: TicketHolds = { byTicket: new Map(), byEvent: new Map() };
  if (eventIds.length === 0) return holds;
  const supabase = await createServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("ticket_holds", { p_event_ids: eventIds });
  if (error || !data) return null;
  for (const row of data) {
    holds.byTicket.set(row.ticket_type_id, row.taken);
    holds.byEvent.set(row.event_id, (holds.byEvent.get(row.event_id) ?? 0) + row.taken);
  }
  return holds;
}

export const getPublishedWork = publicRead("cms:getPublishedWork:v3", _getPublishedWork);
export const getWorkBySlug = publicRead("cms:getWorkBySlug:v3", _getWorkBySlug);
export const getPublishedArticles = publicRead("cms:getPublishedArticles", _getPublishedArticles);
export const getArticleBySlug = publicRead("cms:getArticleBySlug", _getArticleBySlug);
export const getPartners = publicRead("cms:getPartners:v2", _getPartners);

async function _getExperts() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("experts")
    .select("*")
    .eq("published", true)
    .is("deleted_at", null)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

async function _getExpertBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("experts").select("*").eq("slug", slug).eq("published", true).is("deleted_at", null).maybeSingle();
  return data;
}

export const getExperts = publicRead("cms:getExperts:v3", _getExperts);
export const getExpertBySlug = publicRead("cms:getExpertBySlug:v2", _getExpertBySlug);
export const getFeaturedClients = publicRead("cms:getFeaturedClients:v2", _getFeaturedClients);
export const getPublishedProducts = publicRead("cms:getPublishedProducts:v3", _getPublishedProducts);
export const getProductBySlug = publicRead("cms:getProductBySlug:v3", _getProductBySlug);
export const getPublishedEvents = publicRead("cms:getPublishedEvents:v2", _getPublishedEvents);
export const getEventBySlug = publicRead("cms:getEventBySlug:v2", _getEventBySlug);
export const getTicketTypes = publicRead("cms:getTicketTypes:v2", _getTicketTypes);
export const getTicketTypesForEvents = publicRead("cms:getTicketTypesForEvents:v2", _getTicketTypesForEvents);
export const getPublishedEventSlugs = publicRead("cms:getPublishedEventSlugs:v2", _getPublishedEventSlugs);
