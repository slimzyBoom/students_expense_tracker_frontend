"use client";

import React, { useState } from "react";
import { X, Loader2, Landmark, Wallet, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Account } from "@/types/api";

interface StartingBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedAccounts: Account[]) => void;
}

export function StartingBalancesModal({
  isOpen,
  onClose,
  onSuccess,
}: StartingBalancesModalProps) {
  const [bankBalance, setBankBalance] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const parsedBank = bankBalance.trim() === "" ? 0 : parseFloat(bankBalance);
    const parsedCash = cashBalance.trim() === "" ? 0 : parseFloat(cashBalance);

    if (isNaN(parsedBank) || isNaN(parsedCash)) {
      setError("Please enter valid numerical amounts.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedAccounts = await api.accounts.setStartingBalances({
        bank_balance: parsedBank,
        cash_balance: parsedCash,
      });

      onSuccess(updatedAccounts);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to set starting balances.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Welcome to MYFIN!
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Set up your dual-account ledger starting balances
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Skip for now"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your current balances so your dashboard accurately tracks your overall net worth, campus expenses, and bank statements from day one.
          </p>

          {/* Main Bank Account Input */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 transition-all focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600/10">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Landmark className="h-4 w-4 text-indigo-600" />
                <span>Main Bank Account</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">Checking / Debit</span>
            </div>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="1500.00"
                value={bankBalance}
                onChange={(e) => setBankBalance(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-7 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Synced with imported bank statements (Revolut, US Bank, Chase).
            </p>
          </div>

          {/* Cash Wallet Input */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 transition-all focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/10">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Wallet className="h-4 w-4 text-emerald-600" />
                <span>Cash Wallet</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">Physical Cash</span>
            </div>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                value={cashBalance}
                onChange={(e) => setCashBalance(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-7 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Used for cash transactions & daily campus logs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              Skip for now ($0.00)
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "#1a164b" }}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Balances</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
