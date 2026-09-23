"use client";

import React, { useEffect, useState } from "react";
import { AccountsOverviewCard } from "@/components/dashboard/AccountsOverviewCard";
import { MonthlyBudgetCard } from "@/components/dashboard/MonthlyBudgetCard";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { StartingBalancesModal } from "@/components/dashboard/StartingBalancesModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Account,
  DailyTrend,
  FinancialSummary,
  Transaction,
} from "@/types/api";

export default function DashboardPage() {
  const { isNewRegistration, clearNewRegistration } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    burnRate: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isSessionNew =
      typeof window !== "undefined" &&
      sessionStorage.getItem("myfin_new_user") === "true";
    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const isUrlNew = searchParams?.get("onboarding") === "true";

    if (isNewRegistration || isSessionNew || isUrlNew) {
      setIsOnboardingModalOpen(true);
      clearNewRegistration();
      try {
        sessionStorage.removeItem("myfin_new_user");
        if (isUrlNew) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      } catch {}
    }
  }, [isNewRegistration, clearNewRegistration]);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [accRes, trendsRes, summaryRes, txRes] = await Promise.all([
          api.accounts.getAll().catch(() => []),
          api.analytics.getDailyTrends().catch(() => []),
          api.analytics
            .getSummary()
            .catch(() => ({
              totalIncome: 0,
              totalExpense: 0,
              netSavings: 0,
              burnRate: 0,
            })),
          api.transactions
            .getAll({ limit: 5 })
            .catch(() => ({ items: [], total: 0, page: 1, limit: 5 })),
        ]);

        if (accRes) setAccounts(accRes);
        if (trendsRes) setDailyTrends(trendsRes);
        if (summaryRes) setSummary(summaryRes);
        const items = Array.isArray(txRes) ? txRes : txRes?.items || [];
        setTransactions(items);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleTransactionAdded = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    // Dynamically update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        const isTarget =
          (newTx.accountType &&
            (acc.accountType === newTx.accountType ||
              acc.type === newTx.accountType)) ||
          (newTx.accountId && acc._id === newTx.accountId) ||
          (newTx.from_account_id && acc._id === newTx.from_account_id) ||
          (newTx.to_account_id && acc._id === newTx.to_account_id);

        if (isTarget) {
          const delta = newTx.type === "INCOME" ? newTx.amount : -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      }),
    );
  };

  const handleStartingBalancesSet = (updatedAccounts: Account[]) => {
    if (updatedAccounts && updatedAccounts.length > 0) {
      setAccounts(updatedAccounts);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Grid: Accounts Overview (Left) + Monthly Budget (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <AccountsOverviewCard accounts={accounts} dailyTrends={dailyTrends} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <MonthlyBudgetCard summary={summary} />
        </div>
      </div>

      {/* Bottom Section: Recent Transactions */}
      <RecentTransactionsTable
        transactions={transactions}
        accounts={accounts}
        onAddNew={() => setIsAddModalOpen(true)}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTransactionAdded}
      />

      {/* Starting Balances Modal for New Users */}
      <StartingBalancesModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onSuccess={handleStartingBalancesSet}
      />
    </div>
  );
}
