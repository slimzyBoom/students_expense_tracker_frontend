"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Account, DailyTrend } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Landmark, TrendingUp } from "lucide-react";

interface AccountsOverviewCardProps {
  accounts: Account[];
  dailyTrends: DailyTrend[];
}

export function AccountsOverviewCard({ accounts, dailyTrends }: AccountsOverviewCardProps) {
  const [selectedRange, setSelectedRange] = useState<string>("1M");

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance ?? curr.current_balance ?? 0), 0);
  const bankAccount = accounts.find((a) => a.accountType === "BANK" || a.type === "BANK");
  const cashAccount = accounts.find((a) => a.accountType === "CASH" || a.type === "CASH");

  const ranges = ["1W", "1M", "3M", "1YTD", "1Y", "ALL"];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Accounts Overview
          </span>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
          >
            See more
          </Link>
        </div>

        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Net Worth</p>
            <h2 className="mt-0.5 text-3xl font-bold tracking-tight text-emerald-600 tabular-nums">
              + {formatCurrency(totalBalance)}
            </h2>
          </div>

          {/* Dual Ledger Pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-indigo-50/70 border border-indigo-100/80 px-3 py-1.5 text-xs">
              <Landmark className="h-3.5 w-3.5 text-indigo-600" />
              <div>
                <span className="text-slate-500">Bank: </span>
                <span className="font-semibold text-indigo-950 tabular-nums">
                  {formatCurrency(bankAccount?.balance ?? 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/70 border border-emerald-100/80 px-3 py-1.5 text-xs">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              <div>
                <span className="text-slate-500">Cash: </span>
                <span className="font-semibold text-emerald-950 tabular-nums">
                  {formatCurrency(cashAccount?.balance ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Line / Area Chart */}
      <div className="mt-6 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b3486" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b3486" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(val) => `${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DailyTrend;
                  return (
                    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-xs">
                      <p className="text-xs text-slate-400">{data.date}</p>
                      <p className="text-sm font-bold text-indigo-950 tabular-nums">
                        {formatCurrency(data.netWorth ?? 0)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#3b3486"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorNetWorth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Range Selector */}
      <div className="mt-4 flex items-center justify-center gap-1">
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              selectedRange === range
                ? "bg-indigo-50 text-indigo-900 font-bold"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}
