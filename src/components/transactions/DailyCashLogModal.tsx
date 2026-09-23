"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { Category, Transaction } from "@/types/api";
import { formatCurrency } from "@/lib/utils";

interface DailyCashLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txs: Transaction[]) => void;
}

interface CashEntry {
  id: string;
  description: string;
  amount: string;
  category_id: string;
}

export function DailyCashLogModal({
  isOpen,
  onClose,
  onSuccess,
}: DailyCashLogModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.categories.getAll();
        if (cats && cats.length) {
          setCategories(cats);
        }
      } catch {
        // Fallback
      }
    }
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "",
        amount: "",
        category_id: categories[0]?._id,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleUpdate = (id: string, field: keyof CashEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const totalSum = entries.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = entries.filter(
      (e) => e.description.trim() && parseFloat(e.amount) > 0,
    );
    if (validEntries.length === 0) return;

    setIsSubmitting(true);
    try {
      const created = await api.transactions.createDailyCashLog(
        validEntries.map((e) => ({
          raw_narrative: e.description,
          description: e.description,
          amount: parseFloat(e.amount),
          category_id: e.category_id || undefined,
          transaction_date: new Date().toISOString(),
        })),
      );
      onSuccess(created);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                End-of-Day Batch Cash Log
              </h3>
              <p className="text-xs text-slate-400">
                Log all out-of-pocket expenses from campus today
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden mt-4"
        >
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <span className="text-xs font-bold text-slate-400 w-5 text-center">
                  #{index + 1}
                </span>

                <div className="flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Description (e.g. cafeteria sandwich)"
                    value={entry.description}
                    onChange={(e) =>
                      handleUpdate(entry.id, "description", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div className="w-40">
                  <select
                    value={entry.category_id}
                    onChange={(e) =>
                      handleUpdate(entry.id, "category_id", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="$0.00"
                    value={entry.amount}
                    onChange={(e) =>
                      handleUpdate(entry.id, "amount", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-hidden text-right"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveRow(entry.id)}
                  disabled={entries.length === 1}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRow}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-semibold text-indigo-900 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Another Expense Item</span>
            </button>
          </div>

          {/* Footer with Total */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="text-sm">
              <span className="text-slate-500">Total Batch Cash Outflow: </span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalSum)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalSum <= 0}
                style={{ backgroundColor: "#1a164b" }}
                className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-xs hover:opacity-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Log...</span>
                  </>
                ) : (
                  <span>Submit Daily Cash Log</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
