"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  FileSpreadsheet,
  Settings,
  Landmark,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    { name: "Budgets", href: "/budgets", icon: PieChart },
  ];

  const toolsNav = [
    { name: "Statements", href: "/statements", icon: FileSpreadsheet },
  ];

  const settingsNav = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{ backgroundColor: "#1a164b" }}
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col text-white transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 shadow-inner">
              <Sparkles className="h-5 w-5 text-indigo-300" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">
              MYFIN
            </span>
          </Link>

          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          {/* MAIN */}
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-indigo-300/60">
              Main
            </p>
            <nav className="mt-2 space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/15 text-white shadow-xs"
                        : "text-indigo-200/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-indigo-300/80")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* TOOLS */}
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-indigo-300/60">
              Tools
            </p>
            <nav className="mt-2 space-y-1">
              {toolsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/15 text-white shadow-xs"
                        : "text-indigo-200/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-indigo-300/80")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* SETTINGS */}
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-indigo-300/60">
              Settings
            </p>
            <nav className="mt-2 space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/15 text-white shadow-xs"
                        : "text-indigo-200/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-indigo-300/80")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Student Badge */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-200">
              <Landmark className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white">Student Dual Ledger</p>
              <p className="truncate text-xs text-indigo-200/60">Cash & Bank Synced</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
