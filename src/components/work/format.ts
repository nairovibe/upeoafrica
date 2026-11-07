export function needsUnoptimized(src: string) {
  return !src.includes(".supabase.co/");
}

export function workByline(item: {
  confidential?: boolean;
  client: { name: string } | null;
  project_year: number | null;
}) {
  const who = item.confidential ? "Protected by NDA" : item.client?.name;
  return [who, item.project_year].filter(Boolean).join(" · ");
}
