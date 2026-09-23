import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount?: number | null,
  options?: { showSign?: boolean }
): string {
  const safeAmount = Number(amount ?? 0);
  const isNegative = safeAmount < 0;
  const absAmount = Math.abs(safeAmount);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (options?.showSign) {
    if (safeAmount > 0) return `+ ${formatted}`;
    if (safeAmount < 0) return `-${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

export function formatDate(dateVal?: string | Date | null): string {
  if (!dateVal) return "";
  try {
    const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(date.getTime())) return String(dateVal);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return String(dateVal);
  }
}

import { Account, Transaction } from "@/types/api";

export function resolveTransactionAccount(tx: Transaction, accounts?: Account[]) {
  // 1. If explicit accountType is provided on tx, respect it
  if (tx.accountType === "CASH") {
    return { name: tx.accountName || "Cash Wallet", type: "CASH" as const, isCash: true };
  }
  if (tx.accountType === "BANK") {
    return { name: tx.accountName || "Main Bank Account", type: "BANK" as const, isCash: false };
  }

  // 2. If accounts are provided, match by ID
  if (accounts && accounts.length > 0) {
    const fromAcc = accounts.find((a) => a._id === tx.from_account_id);
    const toAcc = accounts.find((a) => a._id === tx.to_account_id);
    const matched = fromAcc || toAcc;
    if (matched) {
      const isCash =
        matched.type === "CASH" ||
        matched.accountType === "CASH" ||
        matched.key === "CASH_WALLET" ||
        matched.name?.toLowerCase().includes("cash");
      return {
        name: matched.name || (isCash ? "Cash Wallet" : "Main Bank Account"),
        type: isCash ? ("CASH" as const) : ("BANK" as const),
        isCash,
      };
    }
  }

  // 3. In the Express backend architecture:
  // - ALL manual entries (source: "MANUAL" or missing source without import_hash) are strictly CASH WALLET
  // - Bank transactions only come from STATEMENT_IMPORT
  const isManual = tx.source === "MANUAL" || (!tx.source && !tx.import_hash);
  if (isManual) {
    return { name: "Cash Wallet", type: "CASH" as const, isCash: true };
  }

  // 4. Transfers (e.g. ATM withdrawal from bank to cash)
  if (tx.type === "TRANSFER") {
    return { name: "Cash Wallet", type: "CASH" as const, isCash: true };
  }

  // Default for statement imports is Main Bank Account
  return { name: tx.accountName || "Main Bank Account", type: "BANK" as const, isCash: false };
}
