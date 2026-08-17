/**
 * Feature Gate Utility
 * 
 * Centralized module-access control for standalone service selling.
 * Every API route and dashboard component uses this to check if a
 * merchant has access to a specific service module.
 * 
 * Default: All modules enabled (backward compatible with existing merchants).
 */

export type Module = "LOYALTY" | "REVIEWS" | "AUTOREPLY";

export const ALL_MODULES: Module[] = ["LOYALTY", "REVIEWS", "AUTOREPLY"];

/**
 * Check if a merchant has a specific module enabled.
 * 
 * @param merchant - Must have an `enabledModules` string field (comma-separated)
 * @param module - The module to check for
 * @returns true if the merchant has the module enabled
 * 
 * @example
 * ```ts
 * if (hasModule(merchant, "REVIEWS")) {
 *   await scheduleGoogleReviewRequest(customer, merchant);
 * }
 * ```
 */
export function hasModule(
  merchant: { enabledModules?: string | null } | null | undefined,
  module: Module
): boolean {
  // Default to all modules if field is missing/null (backward compatibility)
  const modules = merchant?.enabledModules || ALL_MODULES.join(",");
  return modules.split(",").map(m => m.trim()).includes(module);
}

/**
 * Get the list of enabled modules for a merchant.
 * 
 * @param merchant - Must have an `enabledModules` string field
 * @returns Array of enabled Module values
 */
export function getEnabledModules(
  merchant: { enabledModules?: string | null } | null | undefined
): Module[] {
  const modules = merchant?.enabledModules || ALL_MODULES.join(",");
  return modules.split(",").map(m => m.trim()) as Module[];
}

/**
 * Mapping of plan SKU prefixes to their enabled modules.
 * Used during subscription activation to set merchant.enabledModules.
 */
export const PLAN_MODULE_MAP: Record<string, Module[]> = {
  // Standalone plans
  loyalty: ["LOYALTY"],
  reviews: ["REVIEWS"],
  autoreply: ["AUTOREPLY"],
  // Combined plans (existing + new combos)
  starter: ALL_MODULES,
  growth: ALL_MODULES,
  enterprise: ALL_MODULES,
  complete: ALL_MODULES,
};

/**
 * Get the modules that should be enabled for a given plan SKU.
 * Falls back to all modules for unrecognized plans (safe default).
 */
export function getModulesForPlan(planSku: string): Module[] {
  const prefix = planSku.split("_")[0].toLowerCase();
  return PLAN_MODULE_MAP[prefix] || ALL_MODULES;
}
