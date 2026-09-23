"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Target } from "lucide-react";
import { api } from "@/lib/api";
import { Budget, Category } from "@/types/api";

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (budget: Budget) => void;
  currentMonth: string;
}

export function SetBudgetModal({ isOpen, onClose, onSuccess, currentMonth }: SetBudgetModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [limit, setLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      setIsLoading(true);
      setError(null);
      try {
        const cats = await api.categories.getAll();
        const expenseCats = cats.filter(c => c.type === "EXPENSE");
        const available = expenseCats.length > 0 ? expenseCats : cats;
        setCategories(available);
        if (available.length > 0) {
          setSelectedCategoryId(available[0]._id);
        }
      } catch {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return;
    setIsSubmitting(true);
    setError(null);
    const selectedCat = categories.find(c => c._id === selectedCategoryId);
    try {
      const budget = await api.budgets.setBudget({
        category_id: selectedCategoryId,
        monthly_limit: parseFloat(limit),
        month_year: currentMonth,
      });
      onSuccess({
        ...budget,
        category: selectedCat?.name || budget.category || "Expense",
      });
      onClose();
      setLimit("");
    } catch (err: any) {
      setError(err?.message || "Failed to set budget limit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Set Monthly Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Target Month
            </label>
            <input
              type="text"
              disabled
              value={currentMonth}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Category
            </label>
            {isLoading ? (
              <div className="mt-1 flex items-center gap-2 py-2 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <p className="mt-1 text-xs text-amber-600">
                No expense categories found. Please create a category first.
              </p>
            ) : (
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Monthly Spending Limit ($)
            </label>
            <input
              type="number"
              step="1"
              required
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="400"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "#1a164b" }}
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-xs hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Establish Budget</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
