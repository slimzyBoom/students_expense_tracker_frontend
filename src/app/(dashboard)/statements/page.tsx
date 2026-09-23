"use client";

import React, { useState } from "react";
import { RuleManagerDrawer } from "@/components/statements/RuleManagerDrawer";
import { api } from "@/lib/api";
import { ParsedStatementItem } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sliders,
  Check,
} from "lucide-react";

export default function StatementsPage() {
  const [items, setItems] = useState<ParsedStatementItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [isRuleDrawerOpen, setIsRuleDrawerOpen] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setImportSuccess(null);
    try {
      const res = await api.statements.parse(file);
      setItems(res.items);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (items.length === 0) return;
    setIsConfirming(true);
    try {
      const res = await api.statements.confirm(items);
      setImportSuccess(res.importedCount);
      setItems([]);
    } finally {
      setIsConfirming(false);
    }
  };

  const duplicatesCount = items.filter(
    (i) => i.duplicate || i.isDuplicate,
  ).length;
  const newTransactionsCount = items.length - duplicatesCount;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Upload CSV statements from US Bank, Revolut, or Chase to
            automatically parse and categorize transactions.
          </p>
        </div>
        <button
          onClick={() => setIsRuleDrawerOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Sliders className="h-4 w-4 text-indigo-600" />
          <span>Keyword Rule Engine</span>
        </button>
      </div>

      {/* CSV Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="rounded-2xl border-2 border-dashed border-indigo-200/80 bg-white p-8 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/20 shadow-xs"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="mt-3 text-base font-bold text-slate-900">
          Upload Bank Statement CSV
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Drag and drop your bank export file here, or click to browse.
          Automatic duplicate detection and rule categorization are executed in
          memory.
        </p>

        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1a164b] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:opacity-95">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Parsing Statement...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              <span>Select CSV File</span>
            </>
          )}
          <input
            type="file"
            accept=".csv"
            disabled={isUploading}
            onChange={(e) =>
              e.target.files?.[0] && handleFileUpload(e.target.files[0])
            }
            className="hidden"
          />
        </label>
      </div>

      {/* Import Success Alert */}
      {importSuccess !== null && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">Successfully Imported into Ledger!</p>
            <p className="text-xs text-emerald-700">
              {importSuccess} transactions were added to your account ledger,
              and balances synchronized.
            </p>
          </div>
        </div>
      )}

      {/* Parsed Preview Table */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Parsed Statement Preview
              </h4>
              <p className="text-xs text-slate-500">
                Found <strong>{items.length}</strong> items:{" "}
                <span className="text-emerald-600 font-semibold">
                  {newTransactionsCount} new
                </span>
                ,{" "}
                <span className="text-amber-600 font-semibold">
                  {duplicatesCount} duplicates flagged
                </span>
                .
              </p>
            </div>

            <button
              onClick={handleConfirmImport}
              disabled={isConfirming}
              style={{ backgroundColor: "#1a164b" }}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:opacity-95 disabled:opacity-50"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Confirming Ledger Import...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Confirm & Import ({newTransactionsCount} Items)</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr
                    key={item.tempId || item.import_hash}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-3 text-xs sm:text-sm text-slate-500 tabular-nums">
                      {formatDate(item.transaction_date || item.date || "")}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-900 text-xs sm:text-sm">
                      {item.raw_narrative || item.description}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800">
                        {item.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-xs sm:text-sm">
                      {item.type === "INCOME"
                        ? `+${formatCurrency(item.amount)}`
                        : `-${formatCurrency(item.amount)}`}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {item.duplicate || item.isDuplicate ? (
                        <span
                          title={
                            item.duplicateReason ||
                            "Already exists in transactions ledger"
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Duplicate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rule Manager Drawer */}
      <RuleManagerDrawer
        isOpen={isRuleDrawerOpen}
        onClose={() => setIsRuleDrawerOpen(false)}
      />
    </div>
  );
}
