"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Category, CategorizationRule } from "@/types/api";

interface RuleManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RuleManagerDrawer({ isOpen, onClose }: RuleManagerDrawerProps) {
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [targetType, setTargetType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [rulesRes, catsRes] = await Promise.all([
          api.statements.getRules().catch(() => []),
          api.categories.getAll().catch(() => []),
        ]);
        setRules(rulesRes || []);
        const cats = catsRes || [];
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0]._id);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (isOpen) loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await api.statements.createRule({
        keyword: keyword.trim().toLowerCase(),
        target_type: targetType,
        category_id: targetType === "TRANSFER" ? null : (selectedCategoryId || null),
      });
      setRules((prev) => [...prev, created]);
      setKeyword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.statements.deleteRule(id);
    setRules((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between h-full">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Tag className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Categorization Rules</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Automate CSV statement parsing by auto-assigning categories when transactions match these keywords.
          </p>

          {/* Add Rule Form */}
          <form onSubmit={handleCreate} className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Rule</p>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Keyword match</label>
              <input
                type="text"
                required
                placeholder="e.g. walmart, chevron, uber"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Target Type</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="EXPENSE">EXPENSE</option>
                  <option value="INCOME">INCOME</option>
                  <option value="TRANSFER">TRANSFER (ATM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600">Category</label>
                <select
                  disabled={targetType === "TRANSFER"}
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "#1a164b" }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white shadow-xs hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span>Save Keyword Rule</span>
            </button>
          </form>

          {/* Rules List */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Active Rules ({rules.length})</p>
            {isLoading ? (
              <div className="flex items-center justify-center p-6 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading rules...
              </div>
            ) : rules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                No categorization rules created yet. Add keywords like &quot;walmart&quot; or &quot;uber&quot; to auto-categorize statement entries.
              </div>
            ) : (
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {rules.map((rule) => {
                  const categoryName =
                    typeof rule.category_id === "object" && (rule.category_id as any)?.name
                      ? (rule.category_id as any).name
                      : rule.category || rule.target_type;

                  return (
                    <div
                      key={rule._id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-xs"
                    >
                      <div>
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-mono font-semibold text-indigo-900">
                          &quot;{rule.keyword}&quot;
                        </span>
                        <span className="mx-2 text-xs text-slate-400">&rarr;</span>
                        <span className="text-xs font-medium text-slate-700">
                          {categoryName} <span className="text-slate-400">({rule.target_type})</span>
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(rule._id)}
                        className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete rule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close Rule Manager
          </button>
        </div>
      </div>
    </div>
  );
}
