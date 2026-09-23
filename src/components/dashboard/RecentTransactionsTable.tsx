"use client";

import React from "react";
import Link from "next/link";
import { Account, Transaction } from "@/types/api";
import { formatCurrency, formatDate, resolveTransactionAccount } from "@/lib/utils";
import {
  ShoppingCart,
  Coins,
  Fuel,
  Film,
  Dumbbell,
  Utensils,
  BookOpen,
  Receipt,
  Plus,
  MoreVertical,
  FileText,
  Wallet,
  Landmark,
} from "lucide-react";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  accounts?: Account[];
  onAddNew: () => void;
}

export function getCategoryIcon(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("grocer")) return ShoppingCart;
  if (cat.includes("income") || cat.includes("fiverr") || cat.includes("stipend")) return Coins;
  if (cat.includes("gas") || cat.includes("fuel") || cat.includes("transport")) return Fuel;
  if (cat.includes("entertain") || cat.includes("cinema") || cat.includes("movie")) return Film;
  if (cat.includes("fit") || cat.includes("gym") || cat.includes("hobbi")) return Dumbbell;
  if (cat.includes("food") || cat.includes("din") || cat.includes("meal")) return Utensils;
  if (cat.includes("book") || cat.includes("suppl") || cat.includes("study")) return BookOpen;
  return Receipt;
}

export function RecentTransactionsTable({ transactions, accounts, onAddNew }: RecentTransactionsTableProps) {
  const displayTx = transactions.slice(0, 5);

  return (
    <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recent Transactions
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add new transaction</span>
          </button>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            See more
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 pr-4 pl-0">Account</th>
              <th className="py-3.5 px-4">Transaction</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 pr-0 pl-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayTx.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                  No recent transactions recorded yet. Add your first cash expense or import a statement.
                </td>
              </tr>
            ) : (
              displayTx.map((tx) => {
                const categoryName =
                  typeof tx.category_id === "object" && tx.category_id?.name
                    ? tx.category_id.name
                    : tx.category || "General";
                const Icon = getCategoryIcon(categoryName);
                const isIncome = tx.type === "INCOME" || (tx.amount > 0 && tx.type !== "EXPENSE");
                const accountInfo = resolveTransactionAccount(tx, accounts);

                const narrative = tx.raw_narrative || tx.description || "Transaction";
                const txDate = String(tx.transaction_date || tx.date || "");

                return (
                  <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Account */}
                    <td className="py-4 pr-4 pl-0">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${accountInfo.isCash ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                          {accountInfo.isCash ? <Wallet className="h-3.5 w-3.5" /> : <Landmark className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {accountInfo.name}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">
                            {accountInfo.name}
                          </p>
                        </div>
                      </div>
                    </td>

                  {/* Transaction */}
                  <td className="py-4 px-4 font-medium text-slate-900 text-xs sm:text-sm">
                    {narrative}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50/80 text-indigo-700">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        {categoryName}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-xs sm:text-sm text-slate-500 tabular-nums">
                    {formatDate(txDate)}
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`text-xs sm:text-sm font-semibold tabular-nums ${
                        isIncome ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </span>
                  </td>

                  {/* Action Icons */}
                  <td className="py-4 pr-0 pl-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      <button className="rounded-md p-1 hover:bg-slate-100 hover:text-slate-600">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-1 hover:bg-slate-100 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
