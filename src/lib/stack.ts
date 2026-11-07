import { stackGroups, techStack, type StackGroup, type StackGroupId, type StackItem } from "@/lib/content";

export function techByName(name: string): StackItem | undefined {
  const key = name.trim().toLowerCase();
  return techStack.find((item) => item.name.toLowerCase() === key);
}

export function groupsForStack(names: string[]): StackGroup[] {
  const keys = new Set(names.map((name) => name.trim().toLowerCase()));
  return stackGroups.filter((group) => group.items.some((item) => keys.has(item.name.toLowerCase())));
}

export function stackInGroup(names: string[], groupId: StackGroupId): boolean {
  const group = stackGroups.find((item) => item.id === groupId);
  if (!group) return false;
  const keys = new Set(names.map((name) => name.trim().toLowerCase()));
  return group.items.some((item) => keys.has(item.name.toLowerCase()));
}

/** Only http(s) addresses can be embedded as a live preview. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
