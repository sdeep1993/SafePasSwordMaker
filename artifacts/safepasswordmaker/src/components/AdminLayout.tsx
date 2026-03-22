import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Tag, FolderOpen, Users, LogOut, Menu, X, ChevronRight, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", exact: true },
  { label: "Posts", icon: FileText, href: "/admin/posts" },
  { label: "Tags", icon: Tag, href: "/admin/tags" },
  { label: "Categories", icon: FolderOpen, href: "/admin/categories", adminOnly: true },
  { label: "Users", icon: Users, href: "/admin/users", adminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  const nav = NAV_ITEMS.filter(item => !item.adminOnly || user?.role === "admin");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transform transition-transform duration-200",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm">
            <span className="text-primary">Safe</span>
            <span className="text-blue-400">Pass</span>
            <span className="text-foreground">Maker</span>
          </span>
          <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">CMS</span>
          <button onClick={() => setOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <Link key={item.href} href={item.href}>
              <span onClick={() => setOpen(false)} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                isActive(item.href, item.exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {isActive(item.href, item.exact) && <ChevronRight className="w-3 h-3 ml-auto" />}
              </span>
            </Link>
          ))}
        </nav>

        {/* User + actions */}
        <div className="p-3 border-t border-border space-y-1">
          <Link href="/profile">
            <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer">
              <User className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate text-foreground text-xs">{user?.username}</p>
                <p className="text-[11px] capitalize text-muted-foreground">{user?.role}</p>
              </div>
            </span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
          <Link href="/">
            <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              ← Back to site
            </span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
