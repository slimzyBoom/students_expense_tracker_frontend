"use client";

import React from "react";
import Link from "next/link";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FinancialSummary } from "@/types/api";
import { formatCurrency } from "@/lib/utils";

interface MonthlyBudgetCardProps {
  summary: FinancialSummary;
}

export function MonthlyBudgetCard({ summary }: MonthlyBudgetCardProps) {
  const income = summary.totalIncome ?? 0;
  const expenses = summary.totalExpense ?? 0;
  const savings = summary.netSavings ?? 0;
  const leftToBudget = Math.max(0, income - expenses);

  const hasData = income > 0 || expenses > 0 || savings > 0;

  const chartData = hasData
    ? [
        { name: "Expenses", value: expenses, color: "#1a164b" },
        { name: "Savings", value: Math.max(0, savings), color: "#4f46e5" },
        { name: "Left to budget", value: leftToBudget, color: "#c7d2fe" },
      ].filter((d) => d.value > 0)
    : [{ name: "No Data", value: 1, color: "#f1f5f9" }];

  const currentMonthLabel = React.useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    return `${fmt(firstDay)} - ${fmt(lastDay)}`;
  }, []);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monthly Budget
          </span>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
          >
            Manage budget
          </Link>
        </div>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {currentMonthLabel}
        </p>
      </div>

      {/* Center Donut Chart with Centered Income Metric */}
      <div className="relative my-3 flex h-48 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Central Overlay Text */}
        <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium text-slate-400">Income</span>
          <span className="text-base font-bold text-slate-900 tabular-nums">
            {formatCurrency(income)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-medium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4f46e5]" />
            <span className="text-slate-600">Savings</span>
          </div>
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrency(savings)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1a164b]" />
            <span className="text-slate-600">Expenses</span>
          </div>
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrency(expenses)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c7d2fe]" />
            <span className="text-slate-600">Left to budget</span>
          </div>
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrency(leftToBudget)}
          </span>
        </div>
      </div>
    </div>
  );
}
