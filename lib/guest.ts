"use client";

const KEY = "qlq:guest_name";

export function getGuestName(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v && v.trim().length > 0 ? v : null;
}

export function setGuestName(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, name.trim());
}

export function clearGuestName(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
