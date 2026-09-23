"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, Landmark, LogOut, Key, Globe } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Details */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Student Profile
              </h3>
              <p className="text-xs text-slate-400">
                Personal information and university account
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {user?.name || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                University Email
              </label>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {user?.email || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Role & Status
              </label>
              <span className="mt-1 inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                Verified Student
              </span>
            </div>
          </div>
        </div>

        {/* Dual Ledger Configuration */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dual-Account Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Synchronized account definitions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-xs font-bold text-slate-800">
                Main Bank Account (BANK)
              </p>
              <p className="text-xs text-slate-500">
                Associated with US Bank (0992) statement parser
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-xs font-bold text-slate-800">
                Cash Wallet (CASH)
              </p>
              <p className="text-xs text-slate-500">
                Used for quick cash entries & campus daily batch logs
              </p>
            </div>
          </div>
        </div>

        {/* API & Security Settings */}
        {/* <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & API Protocol</h3>
              <p className="text-xs text-slate-400">Strict Express API communication parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <Globe className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Backend API URL</p>
                <p className="mt-0.5 text-xs font-mono text-indigo-900">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Cross-origin requests require CORS authorization with credentials.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <Key className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Session Cookie Security</p>
                <p className="mt-0.5 text-xs text-slate-700">HttpOnly Rotating Refresh Token + In-Memory JWT</p>
                <p className="mt-1 text-xs text-slate-500">No token storage in localStorage for enterprise safety.</p>
              </div>
            </div>
          </div> */}

        <div className="pt-3 flex justify-end">
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out of Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
