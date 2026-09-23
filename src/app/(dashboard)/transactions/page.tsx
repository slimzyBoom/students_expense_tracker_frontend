"use client";

import React, { useEffect, useState } from "react";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { QuickCashModal } from "@/components/transactions/QuickCashModal";
import { DailyCashLogModal } from "@/components/transactions/DailyCashLogModal";
import { getCategoryIcon } from "@/components/dashboard/RecentTransactionsTable";
import { api } from "@/lib/api";
import { Account, Category, Transaction } from "@/types/api";
import {
  formatCurrency,
  formatDate,
  resolveTransactionAccount,
} from "@/lib/utils";
import {
  Plus,
  Zap,
  CalendarCheck,
  Search,
  Trash2,
  Wallet,
  Landmark,
} from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isQuickCashOpen, setIsQuickCashOpen] = useState(false);
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [txRes, catRes, accRes] = await Promise.all([
          api.transactions
            .getAll()
            .catch(() => ({ items: [], total: 0, page: 1, limit: 20 })),
          api.categories.getAll().catch(() => []),
          api.accounts.getAll().catch(() => []),
        ]);
        const items = Array.isArray(txRes) ? txRes : txRes?.items || [];
        setTransactions(items);
        if (catRes) setCategories(catRes);
        if (accRes) setAccounts(accRes);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this transaction? Balance will be adjusted.",
      )
    )
      return;
    await api.transactions.delete(id);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  const filteredTransactions = transactions.filter((tx) => {
    const narrative = tx.raw_narrative || tx.description || "";
    const categoryName =
      typeof tx.category_id === "object" && tx.category_id?.name
        ? tx.category_id.name
        : typeof tx.category === "string"
          ? tx.category
          : "";

    const matchesSearch =
      narrative.toLowerCase().includes(search.toLowerCase()) ||
      categoryName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ||
      (typeof tx.category_id === "string" &&
        tx.category_id === categoryFilter) ||
      (typeof tx.category_id === "object" &&
        tx.category_id?._id === categoryFilter) ||
      categoryName === categoryFilter;

    const accountInfo = resolveTransactionAccount(tx, accounts);

    const matchesAccount =
      accountFilter === "ALL" ||
      (accountFilter === "CASH" && accountInfo.isCash) ||
      (accountFilter === "BANK" && !accountInfo.isCash);

    return matchesSearch && matchesCategory && matchesAccount;
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant or narrative..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 pr-3.5 pl-9 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 focus:border-indigo-600 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                Category: {c.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 focus:border-indigo-600 focus:outline-hidden"
          >
            <option value="ALL">All Accounts</option>
            <option value="BANK">Main Bank Account (BANK)</option>
            <option value="CASH">Cash Wallet (CASH)</option>
          </select>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickCashOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Zap className="h-4 w-4" />
            <span>Quick Cash Log</span>
          </button>

          <button
            onClick={() => setIsDailyLogOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-900 hover:bg-indigo-100 transition-colors"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Batch Daily Log</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            style={{ backgroundColor: "#1a164b" }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:opacity-95 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 pr-4 pl-0">Account</th>
                <th className="py-3.5 px-4">Transaction / Narrative</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 pr-0 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 text-sm"
                  >
                    No transactions match your current search and filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const categoryName =
                    typeof tx.category_id === "object" && tx.category_id?.name
                      ? tx.category_id.name
                      : typeof tx.category === "string"
                        ? tx.category
                        : "General";

                  const Icon = getCategoryIcon(categoryName);
                  const accountInfo = resolveTransactionAccount(tx, accounts);
                  const isIncome =
                    tx.type === "INCOME" ||
                    (tx.amount > 0 && tx.type !== "EXPENSE");

                  const narrative =
                    tx.raw_narrative || tx.description || "Transaction";
                  const txDate = String(tx.transaction_date || tx.date || "");

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-4 pr-4 pl-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              accountInfo.isCash
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-indigo-50 text-indigo-600"
                            }`}
                          >
                            {accountInfo.isCash ? (
                              <Wallet className="h-3.5 w-3.5" />
                            ) : (
                              <Landmark className="h-3.5 w-3.5" />
                            )}
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

                      <td className="py-4 px-4 font-medium text-slate-900 text-xs sm:text-sm">
                        {narrative}
                      </td>

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

                      <td className="py-4 px-4 text-xs sm:text-sm text-slate-500 tabular-nums">
                        {formatDate(txDate)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span
                          className={`text-xs sm:text-sm font-semibold tabular-nums ${
                            isIncome ? "text-emerald-600" : "text-slate-900"
                          }`}
                        >
                          {isIncome
                            ? `+${formatCurrency(tx.amount)}`
                            : `-${formatCurrency(tx.amount)}`}
                        </span>
                      </td>

                      <td className="py-4 pr-0 pl-4 text-right">
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newTx) => setTransactions((prev) => [newTx, ...prev])}
      />

      <QuickCashModal
        isOpen={isQuickCashOpen}
        onClose={() => setIsQuickCashOpen(false)}
        onSuccess={(newTx) => setTransactions((prev) => [newTx, ...prev])}
      />

      <DailyCashLogModal
        isOpen={isDailyLogOpen}
        onClose={() => setIsDailyLogOpen(false)}
        onSuccess={(newTxs) => setTransactions((prev) => [...newTxs, ...prev])}
      />
    </div>
  );
}
