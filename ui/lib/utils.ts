import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserRole } from "@/ui/stores/auth.store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the dashboard path based on user role
 */
export function getDashboardPath(role: UserRole | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "tutor") return "/tutor/dashboard";
  return "/dashboard";
}
