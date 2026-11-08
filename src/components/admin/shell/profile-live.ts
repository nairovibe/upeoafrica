"use client";

export type ProfilePatch = { full_name: string; avatar_path: string | null };

let patch: ProfilePatch | null = null;
const listeners = new Set<() => void>();

export function setProfilePatch(next: ProfilePatch) {
  patch = next;
  listeners.forEach((listener) => listener());
}

export function subscribeProfile(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProfilePatch() {
  return patch;
}

export function getServerProfilePatch() {
  return null;
}
