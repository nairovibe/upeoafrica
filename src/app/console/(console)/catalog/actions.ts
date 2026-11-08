"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_TAG } from "@/lib/public-cache";
import { slugify } from "@/lib/constants";
import { getStaff } from "@/lib/cms";
import { createClient } from "@/lib/supabase/server";

export type DeskResource =
  | "experts"
  | "case_studies"
  | "clients"
  | "partners"
  | "videos"
  | "products"
  | "events";

type LiveMode = "boolean" | "timestamp" | null;

const RESOURCES: Record<
  DeskResource,
  { title: "name" | "title"; slug: boolean; live: LiveMode; paths: string[] }
> = {
  experts: { title: "name", slug: true, live: "boolean", paths: ["/about", "/experts"] },
  case_studies: { title: "title", slug: true, live: "timestamp", paths: ["/work"] },
  clients: { title: "name", slug: true, live: null, paths: ["/"] },
  partners: { title: "name", slug: true, live: null, paths: ["/about"] },
  videos: { title: "title", slug: false, live: "timestamp", paths: [] },
  products: { title: "title", slug: true, live: "boolean", paths: ["/products"] },
  events: { title: "title", slug: true, live: "timestamp", paths: ["/events"] },
};

type Row = Record<string, string | boolean | null>;

interface Query extends PromiseLike<{ data: Row | Row[] | null; error: { message: string } | null }> {
  select: (columns: string) => Query;
  eq: (column: string, value: unknown) => Query;
  in: (column: string, value: string[]) => Query;
  is: (column: string, value: null) => Query;
  neq: (column: string, value: string) => Query;
  not: (column: string, operator: string, value: null) => Query;
  maybeSingle: () => Promise<{ data: Row | null; error: { message: string } | null }>;
}

type Db = {
  from: (table: string) => {
    select: (columns: string) => Query;
    update: (values: Record<string, unknown>) => Query;
    delete: () => Query;
  };
};

function trashedSlug(slug: string, id: string) {
  const base = slug.replace(/__trashed-[a-f0-9]+$/i, "");
  return `${base}__trashed-${id.slice(0, 8)}`;
}

function restoredSlug(slug: string) {
  return slug.replace(/__trashed-[a-f0-9]+$/i, "");
}

async function refresh(resource: DeskResource) {
  revalidateTag(PUBLIC_TAG, { expire: 0 });
  for (const path of RESOURCES[resource].paths) revalidatePath(path);
  revalidatePath("/console", "layout");
}

export async function catalogAction(input: {
  resource: DeskResource;
  op: "trash" | "restore" | "delete" | "empty" | "publish" | "unpublish" | "quick";
  ids: string[];
  patch?: { name?: string; slug?: string; live?: boolean };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const spec = RESOURCES[input.resource];
  if (!spec) return { ok: false, error: "Unknown list." };
  const staff = await getStaff();
  if (!staff || staff.role === "sales") return { ok: false, error: "You do not have access to edit these records." };

  const ids = [...new Set(input.ids.filter((id) => typeof id === "string" && id.length > 0))].slice(0, 100);
  if (input.op !== "empty" && ids.length === 0) return { ok: false, error: "Select at least one row." };

  const supabase = await createClient();
  const db = supabase as unknown as Db;
  const table = db.from(input.resource);

  if (input.op === "empty") {
    const { error } = await table.delete().not("deleted_at", "is", null);
    if (error) return { ok: false, error: error.message };
    await refresh(input.resource);
    return { ok: true };
  }

  if (input.op === "delete") {
    const { error } = await table.delete().in("id", ids).not("deleted_at", "is", null);
    if (error) return { ok: false, error: error.message };
    await refresh(input.resource);
    return { ok: true };
  }

  if (input.op === "publish" || input.op === "unpublish") {
    if (!spec.live) return { ok: false, error: "This list has no publish switch." };
    const values =
      spec.live === "boolean"
        ? { published: input.op === "publish" }
        : { published_at: input.op === "publish" ? new Date().toISOString() : null };
    const { error } = await table.update(values).in("id", ids).is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    await refresh(input.resource);
    return { ok: true };
  }

  if (input.op === "trash" || input.op === "restore") {
    for (const id of ids) {
      const current = await table.select("id, slug, deleted_at").eq("id", id).maybeSingle();
      if (current.error) return { ok: false, error: current.error.message };
      if (!current.data) continue;
      const values: Record<string, unknown> = {
        deleted_at: input.op === "trash" ? new Date().toISOString() : null,
      };
      if (spec.slug) {
        const slug = typeof current.data.slug === "string" ? current.data.slug : "";
        if (input.op === "trash") values.slug = trashedSlug(slug, id);
        else {
          let next = restoredSlug(slug);
          const clash = await table.select("id").eq("slug", next).neq("id", id).is("deleted_at", null).maybeSingle();
          if (clash.data) next = `${next}-restored`;
          values.slug = next;
        }
      }
      const { error } = await table.update(values).eq("id", id);
      if (error) return { ok: false, error: error.message };
    }
    await refresh(input.resource);
    return { ok: true };
  }

  const id = ids[0];
  const name = input.patch?.name?.trim() ?? "";
  if (!name) return { ok: false, error: spec.title === "name" ? "Add a name." : "Add a title." };
  const values: Record<string, unknown> = { [spec.title]: name };
  if (spec.slug) {
    const slug = slugify(input.patch?.slug || name);
    if (!slug) return { ok: false, error: "Add a slug." };
    const clash = await table.select("id").eq("slug", slug).neq("id", id).is("deleted_at", null).maybeSingle();
    if (clash.error) return { ok: false, error: clash.error.message };
    if (clash.data) return { ok: false, error: "That slug is already in use." };
    values.slug = slug;
  }
  if (spec.live && typeof input.patch?.live === "boolean") {
    if (spec.live === "boolean") values.published = input.patch.live;
    else {
      const current = await table.select("published_at").eq("id", id).maybeSingle();
      if (current.error) return { ok: false, error: current.error.message };
      const wasLive = Boolean(current.data?.published_at);
      if (input.patch.live && !wasLive) values.published_at = new Date().toISOString();
      if (!input.patch.live) values.published_at = null;
    }
  }
  const { error } = await table.update(values).eq("id", id).is("deleted_at", null);
  if (error) return { ok: false, error: error.message };
  await refresh(input.resource);
  return { ok: true };
}
