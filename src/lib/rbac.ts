// CustomerPilot V5 — RBAC (Role-Based Access Control)
// Single source of truth for what each role can do.

export type Role = "OWNER" | "MANAGER" | "CASHIER"

export const ROLES: Role[] = ["OWNER", "MANAGER", "CASHIER"]

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  CASHIER: "Cashier",
}

export type Permission =
  | "dashboard.view"
  | "customers.view"
  | "customers.create"
  | "customers.import"
  | "customers.block"
  | "cards.view"
  | "cards.create"
  | "cards.edit"
  | "bills.view"
  | "bills.create"
  | "bills.void"
  | "bills.refund"
  | "rewards.view"
  | "rewards.create"
  | "rewards.redeem"
  | "rewards.approve"
  | "referrals.view"
  | "referrals.approve"
  | "referrals.flag"
  | "staff.view"
  | "staff.create"
  | "staff.suspend"
  | "reports.view"
  | "audit.view"
  | "manual.view"
  | "settings.view"

const ALL: Permission[] = [
  "dashboard.view",
  "customers.view",
  "customers.create",
  "customers.import",
  "customers.block",
  "cards.view",
  "cards.create",
  "cards.edit",
  "bills.view",
  "bills.create",
  "bills.void",
  "bills.refund",
  "rewards.view",
  "rewards.create",
  "rewards.redeem",
  "rewards.approve",
  "referrals.view",
  "referrals.approve",
  "referrals.flag",
  "staff.view",
  "staff.create",
  "staff.suspend",
  "reports.view",
  "audit.view",
  "manual.view",
  "settings.view",
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: ALL,
  MANAGER: [
    "dashboard.view",
    "customers.view",
    "customers.create",
    "customers.import",
    "customers.block",
    "cards.view",
    "cards.edit",
    "bills.view",
    "bills.void",
    "bills.refund",
    "rewards.view",
    "rewards.create",
    "rewards.redeem",
    "rewards.approve",
    "referrals.view",
    "referrals.approve",
    "referrals.flag",
    "staff.view",
    "reports.view",
    "audit.view",
    "manual.view",
  ],
  CASHIER: [
    "dashboard.view",
    "customers.view",
    "customers.create",
    "cards.view",
    "bills.view",
    "bills.create",
    "rewards.view",
    "rewards.redeem",
    "referrals.view",
    "manual.view",
  ],
}

export function can(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(perm)
}

export function deniedMessage(role: Role, perm: Permission): string {
  return `Permission denied — "${ROLE_LABELS[role]}" role does not have "${perm}". This action is logged to the audit trail.`
}
