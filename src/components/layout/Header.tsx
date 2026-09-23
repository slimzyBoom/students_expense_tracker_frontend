"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, LogOut, User as UserIcon } from "lucide-react";

interface HeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export function Header({ title, onOpenMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
          {title}
        </h1>
      </div>

      {/* User Profile & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-full bg-slate-50 p-1.5 sm:py-1.5 sm:pr-3 sm:pl-1.5 border border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>
          <span className="hidden text-sm font-semibold text-slate-800 sm:inline-block">
            {user?.name || user?.email || "Student"}
          </span>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
