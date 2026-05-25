import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Star, Wrench, Users, LogOut, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Brew & Co." }] }),
  component: () => <Protected admin><AdminLayout /></Protected>,
});

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminLayout() {
  const { profile, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending")
      .then(({ count }) => setPendingReviews(count ?? 0));
  }, [pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="h-16 px-5 flex items-center gap-2 border-b border-sidebar-border">
          <span className="grid place-items-center h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground"><Coffee size={16} /></span>
          <span className="font-serif text-lg font-semibold">Brew Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                )}>
                <Icon size={16} />
                <span className="flex-1">{it.label}</span>
                {it.label === "Reviews" && pendingReviews > 0 && (
                  <span className="px-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">{pendingReviews}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link to="/" className="block text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground px-3 py-1">← Back to site</Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-card">
          <div className="font-serif text-lg">Welcome, {profile?.first_name ?? "Admin"}</div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut size={14} className="mr-1" /> Sign out</Button>
        </header>
        <main className="flex-1 p-6 overflow-x-auto"><Outlet /></main>
      </div>
    </div>
  );
}
