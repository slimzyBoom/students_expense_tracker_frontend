"use client";

import React, { useEffect, useState } from "react";
import { SetBudgetModal } from "@/components/budgets/SetBudgetModal";
import { api } from "@/lib/api";
import { Budget } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  PieChart,
} from "lucide-react";

export default function BudgetsPage() {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonthStr);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBudgets() {
      setIsLoading(true);
      try {
        const res = await api.budgets.getAll(month);
        setBudgets(res || []);
      } catch (err) {
        setBudgets([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadBudgets();
  }, [month]);

  const monthOptions = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const value = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      return { value, label };
    });
  }, []);

  const totalLimit = budgets.reduce(
    (acc, b) => acc + (b.monthly_limit ?? b.limit ?? 0),
    0,
  );
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);

  const getStatusBadge = (status?: Budget["status"]) => {
    switch (status) {
      case "Safe":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
            <ShieldCheck className="h-3 w-3" />
            Safe (&lt;80%)
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/80">
            <AlertTriangle className="h-3 w-3" />
            Warning (80-99%)
          </span>
        );
      case "Exceeded":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200/80">
            <AlertOctagon className="h-3 w-3" />
            Exceeded (&ge;100%)
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressBarColor = (status?: Budget["status"]) => {
    switch (status) {
      case "Safe":
        return "bg-emerald-500";
      case "Warning":
        return "bg-amber-500";
      case "Exceeded":
        return "bg-rose-500";
      default:
        return "bg-indigo-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-700">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-900">Period:</span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Set Budget Button */}
        <button
          onClick={() => setIsSetModalOpen(true)}
          style={{ backgroundColor: "#1a164b" }}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:opacity-95 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span>Set Budget Limit</span>
        </button>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Budgeted
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalLimit)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Spent
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Remaining Cushion
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 tabular-nums">
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              No budgets set for this month
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Create a budget limit for your spending categories to track
              limits, monitor burn rates, and receive warnings.
            </p>
            <button
              onClick={() => setIsSetModalOpen(true)}
              style={{ backgroundColor: "#1a164b" }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              <span>Set Budget Limit</span>
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const clampedPercent = Math.min(100, Math.round(b.percentage || 0));
            const categoryTitle =
              typeof b.category === "object" && b.category?.name
                ? b.category.name
                : typeof b.category === "string"
                  ? b.category
                  : "General";
            const budgetLimit = b.monthly_limit ?? b.limit ?? 0;
            const budgetStatus = b.state ?? b.status ?? "Safe";

            return (
              <div
                key={b._id}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {categoryTitle}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Limit: {formatCurrency(budgetLimit)} / month
                      </p>
                    </div>
                    {getStatusBadge(budgetStatus)}
                  </div>

                  {/* Progress Metric */}
                  <div className="mt-5 flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Spent:{" "}
                      <strong className="text-slate-900">
                        {formatCurrency(b.spent)}
                      </strong>
                    </span>
                    <span className="font-bold text-slate-500 tabular-nums">
                      {b.percentage}% used
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(budgetStatus)}`}
                      style={{ width: `${clampedPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {b.spent > budgetLimit ? (
                      <span className="font-medium text-rose-600">
                        Over budget by {formatCurrency(b.spent - budgetLimit)}
                      </span>
                    ) : (
                      <span>
                        {formatCurrency(budgetLimit - b.spent)} remaining
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400">
                    {b.month_year || b.month}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <SetBudgetModal
        isOpen={isSetModalOpen}
        onClose={() => setIsSetModalOpen(false)}
        onSuccess={(newB) => setBudgets((prev) => [...prev, newB])}
        currentMonth={month}
      />
    </div>
  );
}
